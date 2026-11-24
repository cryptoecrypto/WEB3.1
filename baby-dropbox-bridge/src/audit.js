import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const GENESIS = "0".repeat(64);

function hashObject(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

export class AuditLogError extends Error {
  constructor(message, code = "AUDIT_LOG_ERROR") {
    super(message);
    this.name = "AuditLogError";
    this.code = code;
  }
}

export class PersistentAuditLog {
  constructor({ dir, actor = "baby-dropbox-bridge" }) {
    this.dir = path.resolve(dir);
    this.file = path.join(this.dir, "audit.jsonl");
    this.anchor = path.join(this.dir, "audit.head");
    this.actor = actor;
    this.queue = Promise.resolve();
  }

  async #ensure() {
    await fs.mkdir(this.dir, { recursive: true, mode: 0o700 });
    await fs.chmod(this.dir, 0o700);
    try { await fs.access(this.anchor); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      await this.#writeHead({ seq: 0, hash: GENESIS });
    }
  }

  async #writeHead(value) {
    const temp = this.anchor + "." + crypto.randomBytes(8).toString("hex") + ".tmp";
    try {
      await fs.writeFile(temp, JSON.stringify(value), { encoding: "utf8", mode: 0o600, flag: "wx" });
      await fs.rename(temp, this.anchor);
      await fs.chmod(this.anchor, 0o600);
    } catch {
      await fs.rm(temp, { force: true }).catch(() => {});
      throw new AuditLogError("Não foi possível persistir a âncora da auditoria.", "AUDIT_ANCHOR_WRITE_FAILED");
    }
  }

  async #readHead() {
    try { return JSON.parse(await fs.readFile(this.anchor, "utf8")); }
    catch { return null; }
  }

  async #entries() {
    let raw;
    try { raw = await fs.readFile(this.file, "utf8"); }
    catch (error) { if (error.code === "ENOENT") return []; throw error; }
    return raw.split("\n").filter(Boolean).map((line) => {
      try { return JSON.parse(line); }
      catch { return { corrupt: true }; }
    });
  }

  async #verifyUnlocked() {
    const entries = await this.#entries();
    const head = await this.#readHead();
    if (!head || !Number.isInteger(head.seq) || typeof head.hash !== "string") {
      return { ok: false, count: entries.length, reason: "âncora ausente ou inválida" };
    }
    let previous = GENESIS;
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (entry.corrupt) return { ok: false, count: entries.length, brokenAt: index + 1, reason: "registro JSON ilegível" };
      if (entry.seq !== index + 1) return { ok: false, count: entries.length, brokenAt: entry.seq, reason: "sequência quebrada" };
      if (entry.prev !== previous) return { ok: false, count: entries.length, brokenAt: entry.seq, reason: "encadeamento quebrado" };
      const { hash, ...body } = entry;
      if (hashObject(body) !== hash) return { ok: false, count: entries.length, brokenAt: entry.seq, reason: "hash do registro divergente" };
      previous = hash;
    }
    if (head.seq !== entries.length || head.hash !== previous) {
      return { ok: false, count: entries.length, brokenAt: entries.length, reason: "âncora divergente; possível truncamento ou adulteração" };
    }
    return { ok: true, count: entries.length, head: previous, reason: entries.length ? "cadeia íntegra" : "trilha vazia (gênese)" };
  }

  async append({ action, target = null, detail = {}, ok = true, actor = this.actor }) {
    const task = this.queue.then(async () => {
      await this.#ensure();
      const check = await this.#verifyUnlocked();
      if (!check.ok) throw new AuditLogError("Auditoria não íntegra; nova escrita bloqueada.", "AUDIT_CHAIN_BROKEN");
      const previous = await this.#readHead();
      const body = {
        seq: previous.seq + 1,
        ts: new Date().toISOString(),
        actor,
        action: String(action || "unknown"),
        target,
        ok: Boolean(ok),
        detail,
        prev: previous.hash
      };
      const hash = hashObject(body);
      await fs.appendFile(this.file, JSON.stringify({ ...body, hash }) + "\n", { encoding: "utf8", mode: 0o600 });
      await this.#writeHead({ seq: body.seq, hash });
      return { seq: body.seq, hash };
    });
    this.queue = task.catch(() => {});
    return task;
  }

  async verify() {
    await this.queue;
    await this.#ensure();
    return this.#verifyUnlocked();
  }

  async entries({ limit = 100 } = {}) {
    await this.queue;
    await this.#ensure();
    const records = await this.#entries();
    return records.slice(-Math.max(1, Math.min(Number(limit) || 100, 500))).reverse();
  }
}
