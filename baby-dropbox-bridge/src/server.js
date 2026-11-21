import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, timingSafeEqual } from "node:crypto";
import { DropboxAdapter, DropboxBridgeError } from "./dropbox.js";

const MAX_BODY = 5 * 1024 * 1024;

function safeEqual(left, right) {
  if (!left || !right) return false;
  const a = createHash("sha256").update(String(left)).digest();
  const b = createHash("sha256").update(String(right)).digest();
  return timingSafeEqual(a, b);
}

function sendJson(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(value));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) {
      throw Object.assign(new Error("Corpo excede 5 MB."), { statusCode: 413, code: "BODY_TOO_LARGE" });
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("JSON inválido."), { statusCode: 400, code: "INVALID_JSON" }); }
}

function callbackHtml(ok, message) {
  const title = ok ? "Dropbox conectado" : "Autorização não concluída";
  const safeMessage = String(message).replace(/[&<>"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  })[character]);
  return '<!doctype html><html lang="pt-BR"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="referrer" content="no-referrer"><title>' + title + '</title>' +
    '<body style="margin:0;background:#020805;color:#eafff3;font:16px system-ui;display:grid;min-height:100vh;place-items:center">' +
    '<main style="max-width:34rem;padding:2rem;border:1px solid #00ff88;border-radius:1rem">' +
    '<h1 style="color:#00ff88">' + title + '</h1><p>' + safeMessage + '</p>' +
    '<p>Você pode fechar esta janela e voltar ao BABY I.A.</p></main></body></html>';
}

export function createBridgeServer({
  env = process.env,
  fetchImpl = globalThis.fetch,
  adapter = null,
  audit = null
} = {}) {
  const expectedToken = String(env.CRYPY_DROPBOX_BRIDGE_TOKEN || "");
  if (env.NODE_ENV === "production" && Buffer.byteLength(expectedToken, "utf8") < 32) {
    throw new Error("CRYPY_DROPBOX_BRIDGE_TOKEN precisa ter pelo menos 32 bytes em produção.");
  }

  const allowedOrigins = new Set(
    String(env.CRYPY_DROPBOX_ALLOWED_ORIGINS || "")
      .split(",").map((value) => value.trim()).filter(Boolean)
  );
  const dropbox = adapter || new DropboxAdapter({ env, fetchImpl, audit });

  const server = http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Cache-Control", "no-store");
    if (env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    const url = new URL(req.url, "http://baby-dropbox-bridge.local");
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      return sendJson(res, 403, { ok: false, code: "ORIGIN_DENIED", reason: "Origem não autorizada." });
    }

    if (req.method === "OPTIONS") {
      if (!origin || !allowedOrigins.has(origin)) {
        return sendJson(res, 403, { ok: false, code: "ORIGIN_DENIED" });
      }
      res.writeHead(204, {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "600",
        "Vary": "Origin"
      });
      return res.end();
    }

    if (origin && allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }

    try {
      if (req.method === "GET" && url.pathname === "/health") {
        return sendJson(res, 200, {
          ok: true,
          service: "crypy-baby-dropbox-bridge",
          version: "0.1.0"
        });
      }

      // Dropbox redirects the browser here. A one-time OAuth state is required.
      if (req.method === "GET" && url.pathname === "/oauth/dropbox/callback") {
        if (url.searchParams.has("error")) {
          res.writeHead(400, {
            "content-type": "text/html; charset=utf-8",
            "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
            "cache-control": "no-store"
          });
          return res.end(callbackHtml(false, "A autorização foi recusada no Dropbox. Inicie novamente pelo BABY."));
        }
        await dropbox.completeAuthorization({
          code: url.searchParams.get("code"),
          state: url.searchParams.get("state")
        });
        res.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
          "cache-control": "no-store"
        });
        return res.end(callbackHtml(true, "Autorização concluída. O token foi guardado criptografado no volume privado."));
      }

      if (url.pathname.startsWith("/api/")) {
        const match = /^Bearer\\s+(.+)$/i.exec(String(req.headers.authorization || ""));
        if (!safeEqual(match?.[1], expectedToken)) {
          return sendJson(res, 401, {
            ok: false,
            code: "AUTH_REQUIRED",
            reason: "Token de serviço ausente ou inválido."
          });
        }
      }

      if (req.method === "GET" && url.pathname === "/api/dropbox/status") {
        return sendJson(res, 200, { ok: true, ...(await dropbox.status()) });
      }

      if (req.method === "POST" && url.pathname === "/api/dropbox/oauth/start") {
        return sendJson(res, 200, { ok: true, ...dropbox.startAuthorization() });
      }

      if (req.method === "POST" && url.pathname === "/api/dropbox/list") {
        const body = await readJson(req);
        return sendJson(res, 200, { ok: true, ...(await dropbox.listFolder(body.path)) });
      }

      if (req.method === "POST" && url.pathname === "/api/dropbox/backup") {
        const body = await readJson(req);
        const result = await dropbox.uploadBackup({ content: body.content, label: body.label });
        return sendJson(res, 201, result);
      }

      return sendJson(res, 404, { ok: false, code: "NOT_FOUND", reason: "Rota não encontrada." });
    } catch (error) {
      const status = Number(error.statusCode) || (error instanceof DropboxBridgeError ? 400 : 500);
      const reason = error.publicMessage || (status >= 500 ? "Erro interno do serviço." : error.message);
      return sendJson(res, status, {
        ok: false,
        code: error.code || "INTERNAL_ERROR",
        reason
      });
    }
  });

  return { server, dropbox };
}

const currentFile = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === currentFile;
if (isMain) {
  const { server } = createBridgeServer();
  server.listen(Number(process.env.PORT || 8080), "0.0.0.0", () => {
    console.log("[BABY] Dropbox bridge listening on configured port.");
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
