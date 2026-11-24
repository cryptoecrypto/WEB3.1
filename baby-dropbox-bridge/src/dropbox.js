import crypto from "node:crypto";
import path from "node:path";
import { EncryptedJsonStore, decodeEncryptionKey } from "./secure-store.js";

const API_ROOT = "https://api.dropboxapi.com/2";
const CONTENT_ROOT = "https://content.dropboxapi.com/2";
const BABY_ROOT = "/CRYPY/BABY";
const MAX_BACKUP_BYTES = 4 * 1024 * 1024;
const STATE_TTL_MS = 10 * 60 * 1000;

export class DropboxBridgeError extends Error {
  constructor(message, { statusCode = 400, code = "DROPBOX_BRIDGE_ERROR", publicMessage = message } = {}) {
    super(message);
    this.name = "DropboxBridgeError";
    this.statusCode = statusCode;
    this.code = code;
    this.publicMessage = publicMessage;
  }
}

export function normalizeBabyPath(value) {
  if (typeof value !== "string" || value.length > 1024 || value.includes(String.fromCharCode(0))) {
    throw new DropboxBridgeError("Caminho Dropbox inválido.", { code: "INVALID_PATH" });
  }
  const segments = value.split("/").filter(Boolean);
  if (segments.some((part) => part === "." || part === ".." || part.includes(String.fromCharCode(92)))) {
    throw new DropboxBridgeError("Caminho Dropbox inválido.", { code: "INVALID_PATH" });
  }
  const normalized = "/" + segments.join("/");
  if (normalized !== BABY_ROOT && !normalized.startsWith(BABY_ROOT + "/")) {
    throw new DropboxBridgeError("A integração só pode acessar CRYPY/BABY.", { statusCode: 403, code: "PATH_OUTSIDE_BABY" });
  }
  return normalized;
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function safeDropboxMessage(body) {
  const text = String(body?.error_summary || body?.error_description || "");
  return text.slice(0, 160);
}

export class DropboxAdapter {
  constructor({
    env = process.env,
    dataDir = env.DROPBOX_DATA_DIR || "/data/crypy-dropbox",
    fetchImpl = globalThis.fetch,
    now = () => Date.now(),
    audit = null
  } = {}) {
    this.env = env;
    this.fetchImpl = fetchImpl;
    this.now = now;
    this.audit = audit;
    this.states = new Map();
    this.appKey = String(env.DROPBOX_APP_KEY || "").trim();
    this.appSecret = String(env.DROPBOX_APP_SECRET || "").trim();
    this.redirectUri = String(env.DROPBOX_REDIRECT_URI || "").trim();
    this.scopes = String(env.DROPBOX_SCOPES || "files.metadata.read files.content.write").trim();
    const key = decodeEncryptionKey(env.DROPBOX_TOKEN_ENCRYPTION_KEY);
    this.store = key
      ? new EncryptedJsonStore({ filePath: path.join(dataDir, "dropbox-token.v1.enc.json"), key })
      : null;
  }

  missingConfiguration() {
    const missing = [];
    if (!this.appKey) missing.push("DROPBOX_APP_KEY");
    if (!this.appSecret) missing.push("DROPBOX_APP_SECRET");
    if (!this.redirectUri || !this.redirectUri.startsWith("https://")) missing.push("DROPBOX_REDIRECT_URI_HTTPS");
    if (!this.store) missing.push("DROPBOX_TOKEN_ENCRYPTION_KEY_32_BYTES");
    return missing;
  }

  assertConfigured() {
    if (this.missingConfiguration().length) {
      throw new DropboxBridgeError("Integração Dropbox ainda não configurada.", {
        statusCode: 503,
        code: "DROPBOX_NOT_CONFIGURED",
        publicMessage: "Integração Dropbox aguardando configuração segura no Railway."
      });
    }
  }

  async status() {
    const missing = this.missingConfiguration();
    let connected = false;
    if (missing.length === 0) {
      const token = await this.store.read();
      connected = Boolean(token?.refreshToken);
    }
    return {
      configured: missing.length === 0,
      missing,
      connected,
      storage: "encrypted-aes-256-gcm",
      allowedRoot: BABY_ROOT
    };
  }

  startAuthorization() {
    this.assertConfigured();
    const state = base64url(crypto.randomBytes(32));
    const verifier = base64url(crypto.randomBytes(48));
    const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
    this.states.set(state, { verifier, expiresAt: this.now() + STATE_TTL_MS });
    for (const [key, item] of this.states) {
      if (item.expiresAt <= this.now()) this.states.delete(key);
    }
    const url = new URL("https://www.dropbox.com/oauth2/authorize");
    url.searchParams.set("client_id", this.appKey);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("token_access_type", "offline");
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    if (this.scopes) url.searchParams.set("scope", this.scopes);
    return { authorizationUrl: url.toString(), expiresInSeconds: STATE_TTL_MS / 1000 };
  }

  async completeAuthorization({ code, state }) {
    this.assertConfigured();
    const stateKey = String(state || "");
    const pending = this.states.get(stateKey);
    this.states.delete(stateKey);
    if (!pending || pending.expiresAt <= this.now()) {
      throw new DropboxBridgeError("Estado OAuth inválido, expirado ou já utilizado.", {
        statusCode: 400,
        code: "OAUTH_STATE_INVALID",
        publicMessage: "A autorização expirou ou não corresponde a esta sessão. Inicie novamente."
      });
    }
    if (typeof code !== "string" || !code || code.length > 4096) {
      throw new DropboxBridgeError("Código OAuth inválido.", { code: "OAUTH_CODE_INVALID" });
    }
    if (this.audit) await this.audit.append({ action: "dropbox.oauth.exchange.start", target: BABY_ROOT, detail: { flow: "authorization_code" } });
    const form = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.redirectUri,
      client_id: this.appKey,
      client_secret: this.appSecret,
      code_verifier: pending.verifier
    });
    const response = await this.fetchImpl("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(15000)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.access_token || !payload.refresh_token) {
      throw new DropboxBridgeError("Falha na troca do código OAuth por tokens offline: " + safeDropboxMessage(payload), {
        statusCode: 502,
        code: "OAUTH_EXCHANGE_FAILED",
        publicMessage: "O Dropbox não concluiu a autorização. Verifique App Key, App Secret e Redirect URI."
      });
    }
    const token = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: this.now() + Math.max(60, Number(payload.expires_in || 14400)) * 1000,
      scope: payload.scope || this.scopes,
      accountId: payload.account_id || null,
      savedAt: new Date(this.now()).toISOString()
    };
    await this.store.write(token);
    if (this.audit) {
      await this.audit.append({
        action: "dropbox.oauth.completed",
        target: BABY_ROOT,
        detail: { scope: token.scope, accountIdPresent: !!token.accountId }
      });
    }
    return { connected: true, expiresAt: new Date(token.expiresAt).toISOString(), scope: token.scope };
  }

  async #readToken() {
    this.assertConfigured();
    const token = await this.store.read();
    if (!token?.refreshToken) {
      throw new DropboxBridgeError("Dropbox ainda não foi autorizado.", {
        statusCode: 409,
        code: "DROPBOX_NOT_CONNECTED",
        publicMessage: "Conecte o Dropbox antes de solicitar arquivos."
      });
    }
    return token;
  }

  async #accessToken() {
    const token = await this.#readToken();
    if (token.accessToken && token.expiresAt > this.now() + 60000) return token.accessToken;
    const form = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
      client_id: this.appKey,
      client_secret: this.appSecret
    });
    const response = await this.fetchImpl("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(15000)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.access_token) {
      throw new DropboxBridgeError("Falha ao renovar o acesso Dropbox: " + safeDropboxMessage(payload), {
        statusCode: 502,
        code: "OAUTH_REFRESH_FAILED",
        publicMessage: "Não foi possível renovar a sessão Dropbox. Reautorize a integração."
      });
    }
    if (this.audit) await this.audit.append({ action: "dropbox.oauth.refresh.start", target: BABY_ROOT, detail: {} });
    const updated = {
      ...token,
      accessToken: payload.access_token,
      expiresAt: this.now() + Math.max(60, Number(payload.expires_in || 14400)) * 1000,
      scope: payload.scope || token.scope
    };
    await this.store.write(updated);
    if (this.audit) await this.audit.append({ action: "dropbox.oauth.refresh.completed", target: BABY_ROOT, detail: {} });
    return updated.accessToken;
  }

  async #api(endpoint, body) {
    const accessToken = await this.#accessToken();
    const response = await this.fetchImpl(API_ROOT + endpoint, {
      method: "POST",
      headers: { authorization: "Bearer " + accessToken, "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new DropboxBridgeError("Dropbox API falhou: " + safeDropboxMessage(payload), {
        statusCode: response.status === 401 ? 409 : 502,
        code: response.status === 401 ? "DROPBOX_REAUTHORIZE" : "DROPBOX_API_FAILED",
        publicMessage: response.status === 401 ? "A autorização Dropbox expirou. Reconecte a conta." : "O Dropbox não concluiu a operação."
      });
    }
    return payload;
  }

  async listFolder(value = BABY_ROOT) {
    const folderPath = normalizeBabyPath(value);
    const payload = await this.#api("/files/list_folder", {
      path: folderPath,
      recursive: false,
      include_deleted: false,
      include_non_downloadable_files: false
    });
    const entries = (payload.entries || []).map((entry) => ({
      name: entry.name,
      path: entry.path_display || null,
      type: entry[".tag"] || "unknown",
      size: Number.isFinite(entry.size) ? entry.size : null,
      modifiedAt: entry.server_modified || null
    }));
    if (this.audit) {
      await this.audit.append({
        action: "dropbox.folder.list",
        target: folderPath,
        detail: { entries: entries.length, hasMore: !!payload.has_more }
      });
    }
    return { path: folderPath, entries, cursor: payload.cursor || null, hasMore: !!payload.has_more };
  }

  async #upload(pathOnDropbox, content) {
    const accessToken = await this.#accessToken();
    const response = await this.fetchImpl(CONTENT_ROOT + "/files/upload", {
      method: "POST",
      headers: {
        authorization: "Bearer " + accessToken,
        "Dropbox-API-Arg": JSON.stringify({ path: pathOnDropbox, mode: "add", autorename: false, mute: true }),
        "content-type": "application/octet-stream"
      },
      body: Buffer.from(content, "utf8"),
      signal: AbortSignal.timeout(30000)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new DropboxBridgeError("Dropbox recusou o upload: " + safeDropboxMessage(payload), {
        statusCode: 502,
        code: "DROPBOX_UPLOAD_FAILED",
        publicMessage: "O Dropbox não aceitou o arquivo. Nenhum arquivo existente foi sobrescrito."
      });
    }
    return {
      path: payload.path_display || pathOnDropbox,
      name: payload.name || path.posix.basename(pathOnDropbox),
      id: payload.id || null
    };
  }

  async uploadBackup({ content, label = "BABY" }) {
    const size = typeof content === "string" ? Buffer.byteLength(content, "utf8") : 0;
    if (typeof content !== "string" || size < 2 || size > MAX_BACKUP_BYTES) {
      throw new DropboxBridgeError("O backup deve conter entre 2 bytes e 4 MB.", {
        statusCode: 413,
        code: "BACKUP_SIZE_INVALID"
      });
    }
    try { JSON.parse(content); }
    catch { throw new DropboxBridgeError("O backup deve ser JSON válido.", { code: "BACKUP_NOT_JSON" }); }

    const hash = crypto.createHash("sha256").update(content, "utf8").digest("hex");
    const stamp = new Date(this.now()).toISOString().replace(/[:.]/g, "-");
    const suffix = stamp + "-" + hash.slice(0, 16);
    const backupPath = normalizeBabyPath(BABY_ROOT + "/BACKUP/baby-" + suffix + ".json");
    const manifestPath = normalizeBabyPath(BABY_ROOT + "/MANIFEST/manifest-" + suffix + ".json");
    const logPath = normalizeBabyPath(BABY_ROOT + "/SYNC-LOG/sync-" + suffix + ".json");
    const safeLabel = String(label || "BABY").replace(/[^a-z0-9_-]/gi, "-").slice(0, 40) || "BABY";
    const metadata = {
      schema: "crypy.baby.dropbox-backup.v1",
      createdAt: new Date(this.now()).toISOString(),
      label: safeLabel,
      root: BABY_ROOT,
      backupPath,
      sha256: hash,
      bytes: size
    };
    if (this.audit) {
      await this.audit.append({
        action: "dropbox.backup.start",
        target: backupPath,
        detail: { sha256: hash, bytes: size, manifestPath, syncLogPath: logPath }
      });
    }
    let stage = "backup";
    try {
      const backup = await this.#upload(backupPath, content);
      stage = "manifest";
      const manifest = await this.#upload(manifestPath, JSON.stringify(metadata, null, 2));
      stage = "sync-log";
      const syncLog = await this.#upload(logPath, JSON.stringify({ ...metadata, result: "backup-uploaded" }, null, 2));
      if (this.audit) {
        await this.audit.append({
          action: "dropbox.backup.completed",
          target: backupPath,
          detail: { sha256: hash, bytes: size, manifestCreated: true, syncLogCreated: true }
        });
      }
      return { ok: true, backup, manifest, syncLog, sha256: hash, bytes: size, overwrite: false };
    } catch (error) {
      if (this.audit) {
        await this.audit.append({
          action: "dropbox.backup.failed",
          target: backupPath,
          ok: false,
          detail: { sha256: hash, bytes: size, stage, code: error.code || "DROPBOX_FAILURE" }
        }).catch(() => {});
      }
      throw error;
    }
  }
}
