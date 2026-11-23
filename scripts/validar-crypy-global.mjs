import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "assets", "data", "crypy-page-index.json");
const homePath = path.join(root, "index.html");
const loaderPath = path.join(root, "dev", "micro-clock.js");
const navPath = path.join(root, "assets", "js", "crypy-global-nav.js");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const home = fs.readFileSync(homePath, "utf8");
const loader = fs.readFileSync(loaderPath, "utf8");
const nav = fs.readFileSync(navPath, "utf8");
const errors = [];

if (!Array.isArray(manifest.pages)) errors.push("índice não contém pages[]");
if (manifest.total !== manifest.pages.length) errors.push("total do índice não confere");

const seen = new Set();
const PRIVATE_SEGMENTS = new Set(["baby-ia","memory-boost","momory-boost","pluguin","sincronizacao","hd-oculto","hd-matriz","crypy-server-bridge","crypy-13-chatboots"]);
const PRIVATE_FILE_NAMES = /^(Memorias\.json|memory[^/]*\.json|Fila-Sync\.json|Manifest\.json|auto-config[^/]*|autoconfig[^/]*|profile\.json|hd-baby-ia\.html|hd-memory\.html|baby-ia-agente\.html|baby-ia-conectado\.html)$/i;
function isPrivatePublicPath(file) {
  const parts = file.split("/");
  const name = parts[parts.length - 1];
  return parts.some(part => PRIVATE_SEGMENTS.has(part.toLowerCase())) || PRIVATE_FILE_NAMES.test(name);
}

for (const page of manifest.pages || []) {
  if (!page || typeof page.path !== "string" || !page.path.trim()) {
    errors.push("entrada inválida no índice");
    continue;
  }
  const normalized = page.path.replace(/\\/g, "/");
  if (isPrivatePublicPath(normalized)) errors.push("caminho privado no índice público: " + normalized);
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
    errors.push("caminho inseguro no índice: " + page.path);
    continue;
  }
  if (seen.has(normalized)) errors.push("caminho duplicado: " + normalized);
  seen.add(normalized);
  const target = path.resolve(root, normalized);
  if (!target.startsWith(root + path.sep)) errors.push("caminho fora do repositório: " + normalized);
  else if (!fs.existsSync(target)) errors.push("página ausente: " + normalized);
}

const officialCategories = [
  "CRYPY-INFINIT",
  "CRYPY-ACADEMY",
  "ESQUADRÃO DAS CORES",
  "NFT-COLLECTION",
  "BIOGRAFIA",
  "CRYPY-NEWS",
  "MUSEU DIGITAL",
  "MARKETPLACE",
  "CRYPY-GAMES",
  "CRYPYCUT",
  "BABY I.A.",
  "WHITE PAPER",
  "CONTATO"
];

let previous = -1;
for (const label of officialCategories) {
  const at = nav.indexOf('label:"' + label + '"');
  if (at < 0) errors.push("categoria oficial ausente no menu global: " + label);
  else if (at <= previous) errors.push("ordem das categorias oficiais incorreta a partir de: " + label);
  previous = at;
}

if (!nav.includes('if (pagePath === "crypy-news/museu.html") return categories[6];')) {
  errors.push("Museu Digital não está roteado para sua categoria oficial");
}
if (!nav.includes('if (pagePath === "crypy-coin/white-paper.html" || pagePath === "crypy-coin/crypy-coin.html") return categories[11];')) {
  errors.push("White Paper não está roteado para sua categoria oficial");
}

const homeMenuCount = (home.match(/data-cx="/g) || []).length;
if (!home.includes('id="cx-panel"') || !home.includes('id="cx-open"') || homeMenuCount !== 13) {
  errors.push("HOME principal não contém o painel próprio com as 13 categorias oficiais");
}
if (!loader.includes("../assets/js/crypy-global-nav.js")) errors.push("ponte de compatibilidade das páginas legadas não carrega o menu global");
if (!fs.existsSync(navPath)) errors.push("menu global ausente");

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

console.log("PASS: " + manifest.pages.length + " páginas catalogadas e presentes; HOME conectada ao menu global; 13 categorias oficiais na ordem aprovada; HD MATRIZ e entradas operacionais fora do índice público.");
