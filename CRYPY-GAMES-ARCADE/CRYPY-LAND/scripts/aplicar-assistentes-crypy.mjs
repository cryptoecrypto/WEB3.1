import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const excluded = [];
const covered = [];
for (const file of files) {
  if (!/\.html?$/i.test(file)) continue;
  const lower = file.toLowerCase();
  const protectedPath = /(^|\/)(hd-matriz|hd-oculto)(\/|$)/.test(lower)
    || /(^|\/)(hd-baby-ia|hd-babyia|hd-memory|hd-baby-ia-completo-tudo)\.html$/.test(lower)
    || /(^|\/)crypy-server\//.test(lower);
  if (protectedPath) { excluded.push({ file, reason: "HD/servidor protegido" }); continue; }
  if (lower === "index.html") { covered.push({ file, method: "HOME carrega o assistente global" }); continue; }
  if (lower === "index.htm") { covered.push({ file, method: "assistente global da HOME acompanha o iframe" }); continue; }
  const original = fs.readFileSync(file, "utf8");
  if (original.includes("crypy-page-assistant.js")) { covered.push({ file, method: "já integrado" }); continue; }
  const depth = file.split("/").length - 1;
  const src = "../".repeat(depth) + "assets/js/crypy-page-assistant.js";
  const tag = '<script src="' + src + '" defer></script>';
  const updated = /<\/body>/i.test(original) ? original.replace(/<\/body>/i, tag + "\n</body>") : original + "\n" + tag + "\n";
  fs.writeFileSync(file, updated, "utf8");
  covered.push({ file, method: "script compartilhado injetado" });
}
fs.mkdirSync("assets/data", { recursive: true });
fs.writeFileSync("assets/data/crypy-squad-coverage.json", JSON.stringify({
  generated_at: new Date().toISOString(),
  total_html: files.filter(f => /\.html?$/i.test(f)).length,
  covered_count: covered.length,
  excluded_count: excluded.length,
  coverage: "Todas as páginas HTML rastreadas pelo Git, exceto arquivos HD/servidor explicitamente protegidos; index.html/index.htm cobertos pela HOME global.",
  covered, excluded
}, null, 2) + "\n");
console.log(JSON.stringify({ covered: covered.length, excluded: excluded.length, injected: covered.filter(x => x.method === "script compartilhado injetado").length }));
