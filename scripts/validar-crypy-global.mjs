import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "assets", "data", "crypy-page-index.json");
const appPath = path.join(root, "App.tsx");
const loaderPath = path.join(root, "dev", "micro-clock.js");
const navPath = path.join(root, "assets", "js", "crypy-global-nav.js");
const topMenuPath = path.join(root, "assets", "js", "crypy-menu-superior-13-html.js");
const topMenuManifestPath = path.join(root, "assets", "data", "crypy-menu-superior-13-html.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const app = fs.readFileSync(appPath, "utf8");
const loader = fs.readFileSync(loaderPath, "utf8");
const nav = fs.readFileSync(navPath, "utf8");
const topMenu = fs.readFileSync(topMenuPath, "utf8");
const topMenuManifest = JSON.parse(fs.readFileSync(topMenuManifestPath, "utf8"));
const errors = [];

if (!Array.isArray(manifest.pages)) errors.push("índice legado não contém pages[]");
if (manifest.total !== manifest.pages.length) errors.push("total do índice legado não confere");

const seen = new Set();
for (const page of manifest.pages || []) {
  if (!page || typeof page.path !== "string" || !page.path.trim()) {
    errors.push("entrada inválida no índice legado");
    continue;
  }
  const normalized = page.path.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
    errors.push("caminho inseguro no índice legado: " + page.path);
    continue;
  }
  if (seen.has(normalized)) errors.push("caminho duplicado no índice legado: " + normalized);
  seen.add(normalized);
  const target = path.resolve(root, normalized);
  if (!target.startsWith(root + path.sep)) errors.push("caminho fora do repositório: " + normalized);
  else if (!fs.existsSync(target)) errors.push("página ausente no índice legado: " + normalized);
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

// A HOME atual é uma aplicação React: validar App.tsx, não procurar
// marcadores TEMA/INDEX no index.html compilado/gerado.
const menuFolderCount = (app.match(/\{id:"m\d{2}", num:"\d{2}", title:/g) || []).length;
const indexCardCount = (app.match(/\{id:"\d{2}", title:"INDEX /g) || []).length;
if (menuFolderCount !== 13) errors.push("App.tsx deve declarar exatamente 13 pastas no menu principal (encontradas: " + menuFolderCount + ")");
if (indexCardCount !== 10) errors.push("App.tsx deve declarar os 10 índices atuais (encontrados: " + indexCardCount + ")");
if (!app.includes('script.src=new URL("assets/js/crypy-menu-superior-13-html.js",window.location.href).href;')) {
  errors.push("HOME React não carrega o script do menu superior de 13 HTMLs");
}
if (!app.includes('script.dataset.crypyTopMenu="13-html"')) {
  errors.push("HOME React não identifica o carregador do menu superior de 13 HTMLs");
}
if (!topMenu.includes('var manifestUrl = new URL("assets/data/crypy-menu-superior-13-html.json", document.baseURI);') ||
    !topMenu.includes('button.textContent') ||
    !topMenu.includes('trigger.setAttribute("aria-expanded", "true")')) {
  errors.push("menu superior não está ligado ao botão MENU ou ao catálogo de páginas");
}
if (!topMenuManifest || topMenuManifest.categoryCount !== 13 ||
    !Array.isArray(topMenuManifest.groups) || topMenuManifest.groups.length !== 13) {
  errors.push("catálogo do menu superior não contém exatamente 13 categorias");
}
const topMenuPages = (topMenuManifest.groups || []).flatMap(group => group.pages || []);
if (topMenuManifest.total !== topMenuPages.length) {
  errors.push("total declarado do catálogo superior não confere com as páginas");
}
const topMenuSeen = new Set();
for (const page of topMenuPages) {
  if (!page || typeof page.path !== "string" || !page.path.trim()) {
    errors.push("entrada inválida no catálogo superior");
    continue;
  }
  const normalized = page.path.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
    errors.push("caminho inseguro no catálogo superior: " + page.path);
    continue;
  }
  if (topMenuSeen.has(normalized)) errors.push("página duplicada no catálogo superior: " + normalized);
  topMenuSeen.add(normalized);
  if (/^(?:CRYPY-NEWS\/hd-matriz|hd-oculto)(?:\/|$)/i.test(normalized)) {
    errors.push("HD MATRIZ/HD oculto não pode aparecer no menu público: " + normalized);
  }
  const target = path.resolve(root, normalized);
  if (!target.startsWith(root + path.sep)) errors.push("caminho fora do repositório no catálogo superior: " + normalized);
  else if (!fs.existsSync(target)) errors.push("página ausente no catálogo superior: " + normalized);
}
if (topMenuPages.length !== 459) errors.push("catálogo superior deve conter 459 HTMLs (encontrados: " + topMenuPages.length + ")");

if (!nav.includes("crypy-global-runtime.js") || !nav.includes("crypy-dynamic-design.js")) {
  errors.push("menu global não carrega o runtime BABY e o design dinâmico");
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

console.log("PASS: " + manifest.pages.length + " páginas legadas presentes; HOME React conectada ao MENU superior; 13 categorias e " + topMenuPages.length + " HTMLs catalogados; runtime BABY, design dinâmico, HD MATRIZ e entradas operacionais validados.");
