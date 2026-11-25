import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFile(path.join(root, p), "utf8");
const [home, homeCopy, runtime, worldClock, babyPage, serverSource] = await Promise.all([
  read("index.html"), read("index2.html"), read("assets/js/crypy-global-runtime.js"),
  read("CRYPY-13-CHATBOOTS/world-clock.js"), read("chatboot-baby-ia.html"),
  read("crypy-news/hd-matriz/crypy-server/src/server.js")
]);
assert.ok(home.length > 100000, "HOME não pode estar vazia");
assert.equal(home, homeCopy, "HOME restaurada deve preservar exatamente a cópia index2.html");
assert.match(runtime, /\/health\?clock=/, "runtime deve consultar health do servidor");
assert.match(runtime, /credentials:\s*["']omit["']/, "sincronização de horário não pode enviar credenciais");
assert.match(runtime, /cache:\s*["']no-store["']/, "sincronização deve evitar cache");
assert.match(runtime, /source:\s*["']device-clock["']/, "contingência local deve ser identificada");
assert.match(worldClock, /CRPY_CLOCK_API\.subscribe/, "relógio mundial deve assinar o relógio global");
assert.match(worldClock, /state\.epochMs/, "relógio mundial deve usar o epoch global");
assert.ok(babyPage.indexOf('assets/js/crypy-global-runtime.js') < babyPage.indexOf('CRYPY-13-CHATBOOTS/world-clock.js'),
  "runtime global deve carregar antes do relógio mundial do BABY");
assert.match(serverSource, /p === ['"]\/health['"]/, "servidor precisa expor health público");
assert.match(serverSource, /now:\s*new Date\(\)\.toISOString\(\)/, "health precisa retornar timestamp ISO");
assert.match(serverSource, /if \(p\.startsWith\(['"]\/api\/['"]\)\)/, "autenticação continua restrita às rotas API");

const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg" };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relative = path.normalize(pathname).replace(/^([/\\])+/, "");
    const file = path.resolve(root, relative || "index.html");
    if (!file.startsWith(root + path.sep) && file !== path.join(root, "index.html")) { res.writeHead(403); return res.end(); }
    const data = await fs.readFile(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control":"no-store" });
    res.end(data);
  } catch { res.writeHead(404); res.end("not found"); }
});
await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route("https://baby-site-auth-production.up.railway.app/health**", (route) => route.fulfill({
    status: 200,
    headers: { "access-control-allow-origin":"http://127.0.0.1:4173", "content-type":"application/json", "cache-control":"no-store" },
    body: JSON.stringify({ ok:true, now:"2026-11-25T14:00:00.000Z" })
  }));
  await page.goto("http://127.0.0.1:4173/index.html", { waitUntil:"domcontentloaded" });
  await page.waitForFunction(() => window.CRPY_CLOCK_API && window.CRPY_CLOCK_API.status().synced === true, null, { timeout:15000 });
  const homeState = await page.evaluate(() => ({ status:window.CRPY_CLOCK_API.status(), badge:document.getElementById("crypy-global-clock")?.textContent || "" }));
  assert.equal(homeState.status.source, "baby-server-health");
  assert.match(homeState.badge, /^SYNC /);
  console.log("OK — HOME restaurada, runtime carregado e hora do servidor recebida.");

  await page.goto("http://127.0.0.1:4173/chatboot-baby-ia.html", { waitUntil:"domcontentloaded" });
  await page.waitForFunction(() => window.CRPY_CLOCK_API && window.CRPY_CLOCK_API.status().synced === true, null, { timeout:15000 });
  await page.waitForFunction(() => document.getElementById("baby-clock-br")?.textContent === "11:00:00", null, { timeout:15000 });
  const babyState = await page.evaluate(() => ({
    synced:window.CRPY_CLOCK_API.status().synced,
    source:window.CRPY_CLOCK_API.status().source,
    hasWorldClock:!!window.BABYWorldClock,
    br:document.getElementById("baby-clock-br")?.textContent || ""
  }));
  assert.equal(babyState.synced, true);
  assert.equal(babyState.source, "baby-server-health");
  assert.equal(babyState.hasWorldClock, true);
  assert.equal(babyState.br, "11:00:00");
  console.log("OK — BABY usa o mesmo relógio global sincronizado (11:00:00 America/Sao_Paulo no cenário de teste).");

  const fallback = await context.newPage();
  await fallback.route("https://baby-site-auth-production.up.railway.app/health**", (route) => route.abort());
  await fallback.goto("http://127.0.0.1:4173/chatboot-baby-ia.html", { waitUntil:"domcontentloaded" });
  await fallback.waitForFunction(() => window.CRPY_CLOCK_API && window.CRPY_CLOCK_API.status().error !== "Aguardando sincronização do servidor.", null, { timeout:15000 });
  const fallbackState = await fallback.evaluate(() => window.CRPY_CLOCK_API.status());
  assert.equal(fallbackState.synced, false);
  assert.equal(fallbackState.source, "device-clock");
  assert.ok(fallbackState.error);
  console.log("OK — quando o servidor falha, o BABY identifica a contingência LOCAL sem alegar sincronização.");
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
