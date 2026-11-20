#!/usr/bin/env node
/**
 * Browser smoke test for every Git-tracked HTML page.
 * Read-only: serves the checked-out tree and navigates Chromium to each page.
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const playwrightPath = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = require(playwrightPath);
const root = process.cwd();
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0").filter((p) => /\.html?$/i.test(p)).sort();
const mime = (p) => /\.html?$/i.test(p) ? "text/html; charset=utf-8" :
  /\.js$/i.test(p) ? "text/javascript; charset=utf-8" :
  /\.css$/i.test(p) ? "text/css; charset=utf-8" :
  /\.json$/i.test(p) ? "application/json; charset=utf-8" :
  /\.svg$/i.test(p) ? "image/svg+xml" : "application/octet-stream";

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const rel = path.posix.normalize(pathname).replace(/^\/+/, "");
  const abs = path.resolve(root, rel || "index.html");
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    res.writeHead(403); return res.end("Forbidden");
  }
  fs.readFile(abs, (err, data) => {
    if (err) { res.writeHead(err.code === "ENOENT" ? 404 : 500); return res.end("Not found"); }
    res.writeHead(200, { "content-type": mime(abs), "cache-control": "no-store" });
    res.end(data);
  });
});

await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(15000);
  for (const file of files) {
    const errors = [];
    const pageErrors = [];
    const onConsole = (msg) => { if (msg.type() === "error") errors.push(msg.text()); };
    const onPageError = (err) => pageErrors.push(err.message);
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    let status = null, navigationError = null;
    try {
      const response = await page.goto("http://127.0.0.1:4173/" + file.split("/").map(encodeURIComponent).join("/"), { waitUntil: "domcontentloaded" });
      status = response?.status() ?? null;
      await page.waitForTimeout(150);
    } catch (err) {
      navigationError = err.message;
    }
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
    results.push({ path: file, status, navigationError, pageErrors, consoleErrors: errors });
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
const failed = results.filter((r) => !r.status || r.status >= 400 || r.navigationError || r.pageErrors.length);
const report = {
  schema: "BABY-COLMEIA-BROWSER-SMOKE-1.0",
  generatedAt: new Date().toISOString(),
  totalPages: files.length,
  navigatedPages: results.filter((r) => r.status && r.status < 400).length,
  failedPages: failed.length,
  consoleErrorPages: results.filter((r) => r.consoleErrors.length).length,
  results,
};
const out = process.env.BABY_BROWSER_REPORT || "artifacts/baby-colmeia-browser.json";
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ totalPages: report.totalPages, navigatedPages: report.navigatedPages, failedPages: report.failedPages, consoleErrorPages: report.consoleErrorPages, report: out }, null, 2));
if (failed.length) process.exitCode = 1;
