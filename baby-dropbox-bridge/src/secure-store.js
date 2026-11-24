import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export class SecureStoreError extends Error {
  constructor(message, code = "SECURE_STORE_ERROR") {
    super(message);
    this.name = "SecureStoreError";
    this.code = code;
  }
}

export function decodeEncryptionKey(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  let key;
  if (/^[a-f0-9]{64}$/i.test(raw)) key = Buffer.from(raw, "hex");
  else {
    try { key = Buffer.from(raw, "base64"); }
    catch { throw new SecureStoreError("Chave de criptografia inválida.", "INVALID_KEY"); }
  }
  if (key.length !== 32) {
    throw new SecureStoreError("A chave de criptografia deve representar exatamente 32 bytes.", "INVALID_KEY");
  }
  return key;
}

export class EncryptedJsonStore {
  constructor({ filePath, key }) {
    this.filePath = path.resolve(filePath);
    this.key = Buffer.isBuffer(key) ? key : decodeEncryptionKey(key);
    if (!this.key || this.key.length !== 32) throw new SecureStoreError("Chave de criptografia ausente ou inválida.", "INVALID_KEY");
  }

  async write(value) {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    await fs.chmod(dir, 0o700);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
    const plaintext = Buffer.from(JSON.stringify(value), "utf8");
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const envelope = {
      version: 1,
      algorithm: "aes-256-gcm",
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      ciphertext: ciphertext.toString("base64")
    };
    const temp = this.filePath + "." + crypto.randomBytes(8).toString("hex") + ".tmp";
    try {
      await fs.writeFile(temp, JSON.stringify(envelope), { encoding: "utf8", mode: 0o600, flag: "wx" });
      await fs.rename(temp, this.filePath);
      await fs.chmod(this.filePath, 0o600);
    } catch {
      await fs.rm(temp, { force: true }).catch(() => {});
      throw new SecureStoreError("Não foi possível persistir o cofre criptografado.", "STORE_WRITE_FAILED");
    }
  }

  async read() {
    let raw;
    try { raw = await fs.readFile(this.filePath, "utf8"); }
    catch (error) {
      if (error.code === "ENOENT") return null;
      throw new SecureStoreError("Não foi possível ler o cofre criptografado.", "STORE_READ_FAILED");
    }
    try {
      const envelope = JSON.parse(raw);
      if (envelope.version !== 1 || envelope.algorithm !== "aes-256-gcm") throw new Error("unsupported envelope");
      const iv = Buffer.from(envelope.iv, "base64");
      const tag = Buffer.from(envelope.tag, "base64");
      const ciphertext = Buffer.from(envelope.ciphertext, "base64");
      if (iv.length !== 12 || tag.length !== 16 || ciphertext.length > 1024 * 1024) throw new Error("invalid envelope");
      const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, iv);
      decipher.setAuthTag(tag);
      const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return JSON.parse(plaintext.toString("utf8"));
    } catch {
      throw new SecureStoreError("Cofre criptografado inválido ou adulterado; reconexão OAuth necessária.", "STORE_INTEGRITY_FAILED");
    }
  }

  async exists() {
    try { await fs.access(this.filePath); return true; }
    catch (error) { if (error.code === "ENOENT") return false; throw error; }
  }
}
