import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.PORT || 8080);
const APP_ORIGIN = (process.env.APP_ORIGIN || "https://cryptoecrypto.github.io").replace(/\/$/, "");
const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY || "";
const DROPBOX_REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || "";
const TOKEN_FILE = process.env.DROPBOX_TOKEN_FILE || "/data/dropbox-token.json";
const SYNC_KEY = process.env.ACADEMY_SYNC_KEY || "";
const MAX_BODY = 2 * 1024 * 1024;
const oauthStates = new Map();

const send = (res, status, data, headers = {}) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers });
  res.end(JSON.stringify(data));
};
const safeEqual = (a, b) => {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
};
const readBody = async (req) => {
  let raw = ""; for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > MAX_BODY) throw new Error("BODY_TOO_LARGE"); }
  return raw ? JSON.parse(raw) : {};
};
const allowedOrigin = (req) => {
  const origin = req.headers.origin;
  return !origin || origin === APP_ORIGIN || origin === "https://cryptoecrypto.github.io";
};
const cors = (req) => {
  const origin = req.headers.origin;
  return origin && allowedOrigin(req) ? { "access-control-allow-origin": origin, "vary": "Origin", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type,authorization" } : {};
};
const readToken = async () => {
  try { return JSON.parse(await fs.readFile(TOKEN_FILE, "utf8")); }
  catch (e) { if (e.code === "ENOENT") return null; throw e; }
};
const saveToken = async (token) => {
  await fs.mkdir(path.dirname(TOKEN_FILE), { recursive: true });
  const tmp = TOKEN_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(token, null, 2), { mode: 0o600 });
  await fs.rename(tmp, TOKEN_FILE);
};
const configReady = () => Boolean(DROPBOX_APP_KEY && DROPBOX_REDIRECT_URI && DROPBOX_REDIRECT_URI.startsWith("https://"));

async function refreshAccessToken(token) {
  if (!token?.refresh_token) throw new Error("DROPBOX_NOT_AUTHORIZED");
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: token.refresh_token, client_id: DROPBOX_APP_KEY });
  const response = await fetch("https://api.dropbox.com/oauth2/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const data = await response.json();
  if (!response.ok) throw new Error("DROPBOX_REFRESH_FAILED");
  const updated = { ...token, access_token: data.access_token, expires_at: Date.now() + (Number(data.expires_in || 14400) * 1000), account_id: data.account_id || token.account_id };
  await saveToken(updated);
  return updated;
}
async function getFreshToken() {
  let token = await readToken();
  if (!token?.refresh_token) return null;
  if (!token.access_token || Number(token.expires_at || 0) < Date.now() + 60000) token = await refreshAccessToken(token);
  return token;
}

const server = http.createServer(async (req, res) => {
  const headers = cors(req);
  if (req.method === "OPTIONS") { res.writeHead(204, headers); return res.end(); }
  if (!allowedOrigin(req)) return send(res, 403, { ok: false, error: "ORIGIN_NOT_ALLOWED" }, headers);
  const url = new URL(req.url || "/", "http://localhost");

  if (req.method === "GET" && url.pathname === "/health") {
    return send(res, 200, { ok: true, service: "crypy-academy-api", status: "online", time: new Date().toISOString() }, headers);
  }
  if (req.method === "GET" && url.pathname === "/api/status") {
    let authorized = false;
    try { authorized = Boolean((await readToken())?.refresh_token); } catch {}
    return send(res, 200, { ok: true, service: "crypy-academy-api", dropbox: { configured: configReady(), authorized }, syncEndpoint: Boolean(SYNC_KEY), storage: TOKEN_FILE.startsWith("/data/") ? "persistent-volume-required" : "custom" }, headers);
  }
  if (req.method === "GET" && url.pathname === "/auth/dropbox/start") {
    if (!configReady()) return send(res, 503, { ok: false, error: "DROPBOX_CONFIGURATION_MISSING", required: ["DROPBOX_APP_KEY", "DROPBOX_REDIRECT_URI"] }, headers);
    const state = crypto.randomBytes(32).toString("hex");
    const verifier = crypto.randomBytes(48).toString("base64url");
    const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
    oauthStates.set(state, { verifier, createdAt: Date.now() });
    for (const [key, value] of oauthStates) if (Date.now() - value.createdAt > 10 * 60 * 1000) oauthStates.delete(key);
    const auth = new URL("https://www.dropbox.com/oauth2/authorize");
    auth.search = new URLSearchParams({ client_id: DROPBOX_APP_KEY, response_type: "code", token_access_type: "offline", code_challenge: challenge, code_challenge_method: "S256", state, redirect_uri: DROPBOX_REDIRECT_URI }).toString();
    res.writeHead(302, { location: auth.toString(), "cache-control": "no-store" }); return res.end();
  }
  if (req.method === "GET" && url.pathname === "/auth/dropbox/callback") {
    const code = url.searchParams.get("code"); const state = url.searchParams.get("state");
    const pending = state && oauthStates.get(state);
    if (!code || !pending || Date.now() - pending.createdAt > 10 * 60 * 1000) return send(res, 400, { ok: false, error: "OAUTH_STATE_INVALID_OR_EXPIRED" }, headers);
    oauthStates.delete(state);
    const body = new URLSearchParams({ code, grant_type: "authorization_code", client_id: DROPBOX_APP_KEY, redirect_uri: DROPBOX_REDIRECT_URI, code_verifier: pending.verifier });
    const response = await fetch("https://api.dropbox.com/oauth2/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
    const data = await response.json();
    if (!response.ok || !data.refresh_token) return send(res, 502, { ok: false, error: "DROPBOX_TOKEN_EXCHANGE_FAILED" }, headers);
    await saveToken({ refresh_token: data.refresh_token, access_token: data.access_token, expires_at: Date.now() + Number(data.expires_in || 14400) * 1000, account_id: data.account_id || null, saved_at: new Date().toISOString() });
    res.writeHead(302, { location: APP_ORIGIN + "/WEB3.1/crypy-academy/academia.html?dropbox=connected", "cache-control": "no-store" }); return res.end();
  }
  if (req.method === "POST" && url.pathname === "/api/dropbox/upload") {
    if (!SYNC_KEY || !safeEqual((req.headers.authorization || "").replace(/^Bearer\s+/i, ""), SYNC_KEY)) return send(res, 401, { ok: false, error: "UNAUTHORIZED" }, headers);
    const body = await readBody(req);
    const target = String(body.path || "");
    if (!target.startsWith("/MEMORY-BOOST/") || target.includes("..") || target.length > 400) return send(res, 400, { ok: false, error: "PATH_NOT_ALLOWED" }, headers);
    if (typeof body.content !== "string" || Buffer.byteLength(body.content) > 1024 * 1024) return send(res, 400, { ok: false, error: "INVALID_CONTENT" }, headers);
    const token = await getFreshToken();
    if (!token) return send(res, 409, { ok: false, error: "DROPBOX_NOT_AUTHORIZED" }, headers);
    const upload = await fetch("https://content.dropboxapi.com/2/files/upload", { method: "POST", headers: { authorization: "Bearer " + token.access_token, "content-type": "application/octet-stream", "dropbox-api-arg": JSON.stringify({ path: target, mode: "add", autorename: false, mute: true }) }, body: Buffer.from(body.content, "utf8") });
    const result = await upload.json();
    if (!upload.ok) return send(res, 502, { ok: false, error: "DROPBOX_UPLOAD_FAILED", status: upload.status }, headers);
    return send(res, 200, { ok: true, path: result.path_display, id: result.id, size: result.size }, headers);
  }
  return send(res, 404, { ok: false, error: "NOT_FOUND" }, headers);
});

server.listen(PORT, "0.0.0.0", () => console.log("CRYPY Academy API listening on " + PORT));
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err?.message || "unknown"));
