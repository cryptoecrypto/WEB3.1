import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skip = new Set([".git","node_modules",".baby",".tmp",".cache",".venv","__pycache__","dist","build","coverage","out","target",".next",".vite"]);
const protectedNames = new Set(["index.htm","hd-baby-ia.html","hd-babyia.html","hd-memory.html","hd-baby-ia-completo-tudo.html"]);
const protectedPaths = [
  /^nft-collection\//i,
  /^crypy-news\/hd-matriz\//i,
  /^crypy-server-bridge\//i
];
const serviceEntrypoints = new Set([
  "crypy-server-bridge/public/index.html",
  "crypy-news/hd-matriz/crypy-server-bridge/public/index.html"
]);
const navAsset = "assets/js/crypy-global-nav.js";
const indexPath = path.join(root,"assets","data","crypy-page-index.json");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (entry.isDirectory()) {
      if (!skip.has(entry.name)) walk(path.join(dir,entry.name),out);
    } else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
      out.push(path.relative(root,path.join(dir,entry.name)).split(path.sep).join("/"));
    }
  }
  return out;
}
function label(file) {
  const base = path.posix.basename(file).replace(/\.html?$/i,"");
  return /^index$/i.test(base) ? (file.includes("/") ? "Página inicial" : "HOME")
    : base.replace(/[-_]+/g," ").replace(/\b\w/g,c=>c.toLocaleUpperCase("pt-BR"));
}

const files = walk(root).sort();
const pages = [];
let updated = 0, already = 0, preserved = 0, invalid = 0, excluded = 0;

for (const file of files) {
  if (serviceEntrypoints.has(file)) { excluded++; continue; }
  const absolute = path.join(root,file);
  const html = fs.readFileSync(absolute,"utf8");
  if (!/<(?:!doctype\s+html|html\b|body\b)/i.test(html) || html.includes("\u0000")) {
    invalid++;
    continue;
  }
  pages.push({path:file,label:label(file),group:file.includes("/") ? file.split("/")[0] : "RAIZ"});

  const base = path.posix.basename(file).toLowerCase();
  const protectedFile = protectedNames.has(base)
    || file === "index.html"
    || protectedPaths.some(pattern=>pattern.test(file));
  if (protectedFile) { preserved++; continue; }
  if (html.includes("crypy-global-nav.js")) { already++; continue; }

  const directory = path.posix.dirname(file);
  let source = path.posix.relative(directory === "." ? "" : directory,navAsset);
  if (!source.startsWith(".")) source = "./" + source;
  const tag = '<script src="' + source + '" defer></script>';
  const next = /<\/body\s*>/i.test(html)
    ? html.replace(/<\/body\s*>/i,tag + "\n</body>")
    : /<\/html\s*>/i.test(html)
      ? html.replace(/<\/html\s*>/i,tag + "\n</html>")
      : html + "\n" + tag + "\n";
  fs.writeFileSync(absolute,next,"utf8");
  updated++;
}

pages.sort((a,b)=>a.group.localeCompare(b.group,"pt-BR")||a.label.localeCompare(b.label,"pt-BR")||a.path.localeCompare(b.path,"pt-BR"));
fs.mkdirSync(path.dirname(indexPath),{recursive:true});
fs.writeFileSync(indexPath,JSON.stringify({
  version:"1.5",
  generated_at:new Date().toISOString(),
  total:pages.length,
  pages
},null,2)+"\n");

console.log("Páginas catalogadas:",pages.length,
  "| atualizadas:",updated,
  "| já sincronizadas:",already,
  "| preservadas:",preserved,
  "| entradas de servidor excluídas:",excluded,
  "| inválidas:",invalid);
