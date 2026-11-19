import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skipDirs = new Set([
  ".git", "node_modules", ".baby", ".tmp", ".cache", ".venv",
  "__pycache__", "dist", "build", "coverage", "out", "target",
  ".next", ".vite"
]);
const indexPath = path.join(root, "assets", "data", "crypy-page-index.json");
const navAsset = "assets/js/crypy-global-nav.js";

function walk(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name), found);
      continue;
    }
    if (entry.isFile() && /\.html?$/i.test(entry.name)) {
      found.push(path.relative(root, path.join(dir, entry.name)).split(path.sep).join("/"));
    }
  }
  return found;
}

function labelFor(file) {
  const base = path.posix.basename(file).replace(/\.html?$/i, "");
  if (base.toLowerCase() === "index") return file.includes("/") ? "Página inicial" : "HOME";
  return base.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toLocaleUpperCase("pt-BR"));
}

function groupFor(file) {
  return file.includes("/") ? file.split("/")[0] : "RAIZ";
}

const files = walk(root).sort((a,b) => a.localeCompare(b, "pt-BR"));
const pages = [];
let updated = 0;
let alreadyPresent = 0;
let skipped = 0;

for (const relativePath of files) {
  const absolutePath = path.join(root, relativePath);
  let html;
  try {
    html = fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    console.warn("SKIP leitura:", relativePath, error.message);
    skipped++;
    continue;
  }
  if (!/<(?:!doctype\s+html|html\b|body\b)/i.test(html) || html.includes("\u0000")) {
    console.log("SKIP não parece página HTML:", relativePath);
    skipped++;
    continue;
  }

  pages.push({ path: relativePath, label: labelFor(relativePath), group: groupFor(relativePath) });
  if (/crypy-global-nav\.js/i.test(html)) {
    alreadyPresent++;
    continue;
  }

  const directory = path.posix.dirname(relativePath);
  let src = path.posix.relative(directory === "." ? "" : directory, navAsset);
  if (!src.startsWith(".")) src = "./" + src;
  const tag = '<script src="' + src + '" defer></script>';
  let next = html;
  if (/<\/body\s*>/i.test(next)) next = next.replace(/<\/body\s*>/i, tag + "\n</body>");
  else if (/<\/html\s*>/i.test(next)) next = next.replace(/<\/html\s*>/i, tag + "\n</html>");
  else next += "\n" + tag + "\n";

  fs.writeFileSync(absolutePath, next, "utf8");
  updated++;
}

pages.sort((a,b) => a.group.localeCompare(b.group, "pt-BR") || a.label.localeCompare(b.label, "pt-BR") || a.path.localeCompare(b.path, "pt-BR"));
fs.mkdirSync(path.dirname(indexPath), { recursive: true });
fs.writeFileSync(indexPath, JSON.stringify({
  version: "1.0",
  generated_at: new Date().toISOString(),
  total: pages.length,
  pages
}, null, 2) + "\n", "utf8");

console.log("CRYPY GLOBAL NAV — MIGRAÇÃO CONCLUÍDA");
console.log("Páginas catalogadas:", pages.length);
console.log("Páginas atualizadas:", updated);
console.log("Já tinham menu:", alreadyPresent);
console.log("Ignoradas por não serem HTML utilizável:", skipped);
