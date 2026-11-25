import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const errors = [];
const bridge = read("assets/js/crypy-page-assistant.js");
const nav = read("assets/js/crypy-global-nav.js");
const runtime = read("assets/js/crypy-global-runtime.js");
const widget = read("assets/js/baby-global-chat.js");
const registry = JSON.parse(read("CRYPY-13-CHATBOOTS/colmeia-integral/registry-15.json"));

const officialPages = [
  "crypy-infinyt/portal.html",
  "crypy-academy/academia.html",
  "esquadrao-das-cores/esquadrao.html",
  "nft-collection/galeria.html",
  "biografia/historia.html",
  "crypy-news/index.html",
  "crypy-news/museu.html",
  "art-figure-marketplace/marketplace.html",
  "crypy-games-desafios/crypy-games-desafios.html",
  "social-crypykut/comunidade.html",
  "baby-ia/centro.html",
  "crypy-coin/white-paper.html",
  "contato/contato-oficial.html"
];

if (!bridge.includes("crypy-global-runtime.js")) errors.push("ponte legada não encaminha ao runtime global");
if (!bridge.includes('params.get("embed") === "1"')) errors.push("ponte não preserva o modo iframe embed");
if (!bridge.includes("/chatboot-baby-ia\\.html$/")) errors.push("ponte não preserva a página canônica do chatbot");
if (!bridge.includes('data-crypy-global-runtime="true"')) errors.push("ponte não evita runtime duplicado");
if (/fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|indexedDB/i.test(bridge)) {
  errors.push("ponte contém operação de rede ou persistência inesperada");
}

if (!nav.includes('new URL("../", scriptUrl)')) errors.push("menu global calcula incorretamente a raiz do projeto WEB3.1");
if (!runtime.includes('new URL("../", scriptUrl || document.baseURI)')) errors.push("runtime calcula incorretamente a raiz do projeto WEB3.1");
if (!widget.includes('new URL("../chatboot-baby-ia.html?embed=1"')) errors.push("widget calcula incorretamente o caminho do iframe BABY");
if (!runtime.includes("assets/js/baby-global-chat.js")) errors.push("runtime não carrega o widget global BABY");
if (!runtime.includes('get("embed") === "1"')) errors.push("runtime não respeita o modo embed");
if (!widget.includes("chatboot-baby-ia.html?embed=1")) errors.push("widget não aponta para a página canônica do BABY");
if (!widget.includes("crypy-baby-global-root")) errors.push("widget não declara a raiz global esperada");

const missingPages = [];
for (const pagePath of officialPages) {
  const html = read(pagePath);
  if (!html.includes("assets/js/crypy-global-nav.js")) {
    missingPages.push(pagePath);
  }
}
if (missingPages.length) errors.push("páginas oficiais sem menu/runtime global: " + missingPages.join(", "));

const official = registry.members.filter((member) => member.group === "official_13");
const core = registry.members.filter((member) => member.group === "separate_core");
const defense = registry.members.filter((member) => member.group === "separate_defense");
if (official.length !== 13) errors.push("registro não contém exatamente 13 integrantes oficiais");
if (core.length !== 1 || core[0]?.id !== "baby") errors.push("BABY não está separado como núcleo único");
if (defense.length !== 1 || defense[0]?.id !== "lucy") errors.push("LUCY não está separada como defesa única");
if (new Set(registry.members.map((member) => member.id)).size !== 15) errors.push("IDs dos 15 participantes não são únicos");

if (errors.length) {
  console.error("FALHA — integração global BABY");
  errors.forEach((error) => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("OK — 13/13 páginas oficiais incluem o menu global.");
  console.log("OK — menu → runtime → widget → página canônica do BABY.");
  console.log("OK — registro 13 integrantes + BABY + LUCY, sem IDs duplicados.");
  console.log("LIMITAÇÃO — teste estático; não comprova execução no navegador, conexão a modelos, backend, armazenamento ou implantação.");
}
