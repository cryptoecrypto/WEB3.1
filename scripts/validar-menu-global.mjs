import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "assets", "data", "crypy-page-index.json");
const skipDirs = new Set([".git","node_modules",".baby",".tmp",".cache",".venv","__pycache__","dist","build","coverage","out","target",".next",".vite"]);
function walk(dir, found=[]) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (entry.isDirectory()) { if (!skipDirs.has(entry.name)) walk(path.join(dir,entry.name),found); }
    else if (entry.isFile() && /\.html?$/i.test(entry.name)) found.push(path.relative(root,path.join(dir,entry.name)).split(path.sep).join("/"));
  }
  return found;
}
if (!fs.existsSync(manifestPath)) throw new Error("Índice de páginas não foi gerado.");
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const files=walk(root);
const missing=[];
for (const file of files) {
  const html=fs.readFileSync(path.join(root,file),"utf8");
  if (/<(?:!doctype\s+html|html\b|body\b)/i.test(html) && !html.includes("crypy-global-nav.js")) missing.push(file);
}
const manifestMissing=manifest.pages.filter(p=>!fs.existsSync(path.join(root,p.path))).map(p=>p.path);
if (missing.length || manifestMissing.length) {
  console.error("Páginas sem menu:",missing);
  console.error("Links inexistentes no índice:",manifestMissing);
  process.exit(1);
}
console.log("PASS: todas as páginas HTML utilizáveis carregam o menu global.");
console.log("Páginas no índice:",manifest.pages.length);
console.log("Arquivos HTML encontrados:",files.length);
