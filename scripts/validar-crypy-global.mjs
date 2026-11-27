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

const themeCount = (home.match(/TEMA \d{2}/g) || []).length;
const indexCardCount = (home.match(/class="tile" href="\.\/(?:index\.html|index5\.html|Index6\.html|index7\.html|index8\.html|index9\.html)"/g) || []).length;
if (themeCount !== 13 || indexCardCount !== 6 || !home.includes('href="./mapa-colmeia.html"')) {
  errors.push("HOME principal deve conter 13 temas oficiais, 6 índices ativos e o mapa da Colmeia");
}
if (!home.includes("crypy-global-runtime.js") || !home.includes("crypy-dynamic-design.js")) {
  errors.push("HOME não está conectada ao runtime BABY e ao design dinâmico global");
}
if (!loader.includes("../assets/js/crypy-global-nav.js")) errors.push("ponte de compatibilidade das páginas legadas não carrega o menu global");
if (!fs.existsSync(navPath)) errors.push("menu global ausente");
if (!nav.includes("keywordAliases")) errors.push("busca do menu global sem aliases por palavras-chave");
if (!nav.includes("Index6.html")) errors.push("INDEX 06 não está conectada com a capitalização correta");
const gamesMenuPath = path.join(root, "crypy-games-desafios", "crypy-games-desafios.html");
if (fs.existsSync(gamesMenuPath)) {
  const gamesMenu = fs.readFileSync(gamesMenuPath, "utf8");
  if (/href=["']#["']/.test(gamesMenu)) errors.push("menu de CRYPY GAMES contém links sem destino");
  if (!gamesMenu.includes("../crypy-news/index.html")) errors.push("menu de CRYPY GAMES não aponta para CRYPY NEWS");
}
const index6Path = path.join(root, "Index6.html");
if (fs.existsSync(index6Path) && !fs.readFileSync(index6Path, "utf8").includes("assets/js/crypy-global-nav.js")) {
  errors.push("INDEX 06 não carrega o menu global");
}
const arenaPath = path.join(root, "crypy-games-desafios", "arena.html");
if (fs.existsSync(arenaPath) && !fs.readFileSync(arenaPath, "utf8").includes("assets/js/crypy-global-nav.js")) {
  errors.push("Arena CRYPY GAMES não carrega o menu global");
}
const infinytPath = path.join(root, "index8.html");
if (fs.existsSync(infinytPath)) {
  const infinyt = fs.readFileSync(infinytPath, "utf8");
  const teamGrid = (infinyt.match(/<div class="team-grid">([\s\S]*?)<\/div>/) || [])[1] || "";
  const linkedTeamCards = (teamGrid.match(/<a class="team-card" href="\.\/esquadrao-das-cores\/esquadrao\.html"/g) || []).length;
  if (linkedTeamCards !== 10) errors.push("os 10 cartões do Esquadrão na INDEX 08 devem abrir a página oficial do Esquadrão");
}
const officialMenuPaths = [
  "crypy-infinyt/portal.html",
  "nft-collection/galeria.html",
  "esquadrao-das-cores/esquadrao.html",
  "crypy-academy/academia.html",
  "biografia/historia.html",
  "crypy-news/index.html",
  "crypy-news/museu.html",
  "art-figure-marketplace/marketplace.html",
  "crypy-games-desafios/crypy-games-desafios.html",
  "crypy-games-desafios/CRYPY-LAND/crypy-land.html",
  "baby-ia/centro.html",
  "crypy-coin/white-paper.html",
  "contato/contato-oficial.html"
];
for (const target of officialMenuPaths) {
  if (!fs.existsSync(path.resolve(root, target))) errors.push("destino oficial ausente: " + target);
}

const serviceEntrypoints = [
  "crypy-server-bridge/public/index.html",
  "crypy-news/hd-matriz/crypy-server-bridge/public/index.html"
];
const syncWorkflowPath = path.join(root, ".github", "workflows", "crypy-home-full-sync-safe.yml");
if (fs.existsSync(syncWorkflowPath)) {
  const syncWorkflow = fs.readFileSync(syncWorkflowPath, "utf8");
  if (/sincronizar-crypy-global\\.mjs\\s+--apply/.test(syncWorkflow)) {
    errors.push("workflow de auditoria não pode executar sincronização global com --apply");
  }
}
for (const file of serviceEntrypoints) {
  if (seen.has(file)) errors.push("entrada operacional do servidor não deve aparecer no índice público: " + file);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("PASS: " + manifest.pages.length + " páginas catalogadas e presentes; HOME conectada ao menu global; 13 categorias oficiais na ordem aprovada; HD MATRIZ e entradas operacionais fora do índice público.");
