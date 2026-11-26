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
for (const page of manifest.pages || []) {
  if (!page || typeof page.path !== "string" || !page.path.trim()) {
    errors.push("entrada inválida no índice");
    continue;
  }
  const normalized = page.path.replace(/\\/g, "/");
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
  "CRYPY INFINYT",
  "NFT-COLLECTION",
  "ESQUADRÃO DAS CORES",
  "CRYPY ACADEMY-WEB3.1",
  "BIOGRAFIA",
  "CRYPY NEWS",
  "MUSEU DIGITAL",
  "ART-FIGURE / MARKETPLACE",
  "CRYPY GAMES-DESAFIO",
  "CRYPY-SOCIAL",
  "BABY I.A.",
  "WHITE PAPER / CRYPY COIN",
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

const themeCount = (home.match(/TEMA \\d{2}/g) || []).length;
const indexCount = (home.match(/INDEX \\d{2}/g) || []).length;
if (themeCount !== 13 || indexCount !== 9) {
  errors.push("HOME principal deve conter 13 temas oficiais e 9 índices");
}
if (!home.includes("crypy-global-runtime.js") || !home.includes("crypy-dynamic-design.js")) {
  errors.push("HOME não está conectada ao runtime BABY e ao design dinâmico global");
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
