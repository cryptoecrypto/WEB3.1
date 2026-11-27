import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const config = JSON.parse(read("assets/data/crypy-design-calendar.json"));
const governance = JSON.parse(read("assets/data/crypy-design-governance.json"));
const dynamic = read("assets/js/crypy-dynamic-design.js");
const boards = read("assets/js/crypy-daily-boards.js");
const nav = read("assets/js/crypy-global-nav.js");
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}
function unique(items) {
  return new Set(items).size === items.length;
}

check(config.timezone === "America/Sao_Paulo", "Fuso do ciclo diário deve ser America/Sao_Paulo.");
check(Array.isArray(config.monthlyThemes) && config.monthlyThemes.length === 12, "Devem existir 12 temas mensais.");
check(Array.isArray(config.dailyPalettes) && config.dailyPalettes.length >= 16, "Devem existir pelo menos 16 paletas diárias.");
check(Array.isArray(config.dailyLayouts) && config.dailyLayouts.length >= 8, "Devem existir pelo menos 8 layouts diários.");
check(Array.isArray(config.dailySkins) && config.dailySkins.length >= 7, "Devem existir pelo menos 7 efeitos diários.");
check(Array.isArray(config.dailyMessages) && config.dailyMessages.length >= 12, "Devem existir pelo menos 12 conjuntos de mensagens.");
check(unique(config.dailyPalettes.map((item) => item.name)), "Há nomes de paletas repetidos.");
check(unique(config.dailyLayouts.map((item) => item.name)), "Há nomes de layouts repetidos.");
for (const palette of config.dailyPalettes) {
  for (const key of ["accent", "accent2", "accent3", "glow"]) {
    check(/^#[0-9a-f]{6}$/i.test(palette[key] || ""), "Cor inválida em " + palette.name + ": " + key);
  }
}
for (const layout of config.dailyLayouts) {
  check(Boolean(layout.name && /^\d+px$/.test(layout.radius) && /^\d+px$/.test(layout.gap)), "Layout inválido: " + (layout.name || "sem nome"));
}
check(governance.designCycle?.changeAt === "00:00", "Governança deve definir a mudança à meia-noite.");
check(governance.designCycle?.timezone === config.timezone, "Fuso da governança difere da configuração visual.");
check(governance.designCycle?.forbiddenChanges?.includes("textos e informações"), "Falta a regra de preservação de informação.");
check(governance.roles?.length === 9, "Matriz deve conter os nove perfis do Esquadrão.");
check(governance.qualityGates?.length >= 8, "Faltam critérios de qualidade.");
check(dynamic.includes("config.dailyPalettes") && dynamic.includes("config.dailyLayouts"), "Motor visual não consome as paletas/layouts configuráveis.");
check(dynamic.includes("America/Sao_Paulo") && dynamic.includes("scheduleMidnightRefresh"), "Motor visual não programa o ciclo diário de São Paulo.");
check(boards.includes("America/Sao_Paulo") && boards.includes("MENSAGENS PROGRAMADAS DO BABY"), "Mural diário não está configurado no fuso e com transparência editorial.");
check(boards.includes("01 · SINAL DO DIA") && boards.includes("02 · MISSÃO CRIATIVA") && boards.includes("03 · CRITÉRIO DE QUALIDADE"), "Mural deve apresentar três quadros.");
check(nav.includes("assets/js/crypy-dynamic-design.js") && nav.includes("assets/js/crypy-daily-boards.js"), "Menu global não carrega os módulos visuais.");
const pages = [
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
  "social-crypykut/comunidade.html",
  "baby-ia/centro.html",
  "crypy-coin/white-paper.html",
  "contato/contato-oficial.html",
  "blog.html"
];
for (const page of pages) {
  const html = read(page);
  check(html.includes("assets/js/crypy-global-nav.js"), "Página principal sem carregador global: " + page);
}
check(read("baby-ia/centro.html").includes("baby-design-stewardship"), "Centro BABY sem matriz de Design Stewardship.");
check(fs.existsSync("assets/js/crypy-daily-boards.js"), "Arquivo do mural diário ausente.");
if (errors.length) {
  console.error("CRYPY DESIGN VALIDATION — FALHAS");
  errors.forEach((error) => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("CRYPY DESIGN VALIDATION — OK");
  console.log("12 temas mensais | " + config.dailyPalettes.length + " paletas | " + config.dailyLayouts.length + " layouts | " + config.dailySkins.length + " efeitos | " + config.dailyMessages.length + " mensagens");
  console.log("3 quadros diários | 9 perfis de responsabilidade | " + pages.length + " páginas principais verificadas");
}
