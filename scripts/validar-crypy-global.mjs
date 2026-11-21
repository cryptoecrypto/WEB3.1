import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root,"assets","data","crypy-page-index.json");
const homePath = path.join(root,"index.html");
const knowledgePath = path.join(root,"assets","js","baby-knowledge-sync.js");
const squadPath = path.join(root,"baby-ia","esquadrao-auto-config.js");
const manifest = JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const home = fs.readFileSync(homePath,"utf8");
const errors = [];

if (!Array.isArray(manifest.pages)) errors.push("índice não contém pages[]");
if (manifest.total !== manifest.pages.length) errors.push("total do índice não confere");

const seen = new Set();
for (const page of manifest.pages || []) {
  if (!page || typeof page.path !== "string") {
    errors.push("entrada inválida no índice");
    continue;
  }
  if (seen.has(page.path)) errors.push("caminho duplicado: " + page.path);
  seen.add(page.path);
  const target = path.resolve(root,page.path);
  if (!target.startsWith(root + path.sep)) errors.push("caminho fora do repositório: " + page.path);
  else if (!fs.existsSync(target)) errors.push("página ausente: " + page.path);
}

const menuCount = (home.match(/<button\b[^>]*\bdata-theme="/g) || []).length;
if (menuCount !== 13) errors.push("HOME deveria conter 13 categorias oficiais; encontrou " + menuCount);
if (!home.includes("assets/js/baby-knowledge-sync.js")) errors.push("HOME não carrega o indexador de conhecimento BABY");
if (!home.includes("baby-ia/esquadrao-auto-config.js")) errors.push("HOME não carrega a configuração do Esquadrão");
if (!home.includes('id="viewer"')) errors.push("HOME não contém o visualizador de páginas");
if (!fs.existsSync(knowledgePath)) errors.push("indexador BABY ausente");
if (!fs.existsSync(squadPath)) errors.push("configuração do Esquadrão ausente");

const serviceEntrypoints = [
  "crypy-server-bridge/public/index.html",
  "crypy-news/hd-matriz/crypy-server-bridge/public/index.html"
];
for (const file of serviceEntrypoints) {
  if (seen.has(file)) errors.push("entrada operacional do servidor não deve aparecer no índice público: " + file);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("PASS: " + manifest.pages.length + " páginas catalogadas e presentes; HOME com 13 categorias oficiais; BABY knowledge-sync e Esquadrão configurados; entradas operacionais excluídas.");
