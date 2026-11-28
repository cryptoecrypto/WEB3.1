import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root,file),"utf8");
const errors = [];
const manifest = JSON.parse(read("assets/data/crypy-page-index.json"));
const assignments = JSON.parse(read("assets/data/crypy-menu-agent-assignments.json"));
const catalog = JSON.parse(read("CRYPY-13-CHATBOOTS/config/agents.json"));
const home = read("index.html");
const loader = read("dev/micro-clock.js");
const nav = read("assets/js/crypy-global-nav.js");
const runtime = read("assets/js/crypy-global-runtime.js");
const widget = read("assets/js/baby-global-chat.js");
const chatPage = read("chatboot-global.html");
const chatScript = read("assets/js/crypy-global-agent-chat-page.js");

const categories = [
  {label:"CRYPY INFINYT",group:"crypy-infinyt"},
  {label:"NFT-COLLECTION",group:"nft-collection"},
  {label:"ESQUADRÃO DAS CORES",group:"esquadrao-das-cores"},
  {label:"CRYPY ACADEMY",group:"crypy-academy"},
  {label:"BIOGRAFIA",group:"biografia"},
  {label:"CRYPY NEWS",group:"crypy-news"},
  {label:"MUSEU DIGITAL",group:"museu-digital"},
  {label:"ART-FIGURE / MARKETPLACE",group:"art-figure-marketplace"},
  {label:"CRYPY GAMES-ARCADE",group:"crypy-games-arcade"},
  {label:"CRYPY-SOCIAL",group:"crypy-social"},
  {label:"BABY I.A.",group:"baby-ia"},
  {label:"WHITE PAPER / CRYPY COIN",group:"crypy-coin"},
  {label:"CONTATO",group:"contato"}
];
const catalogIds = new Set((catalog.agents || []).map(agent=>agent.id));
const assignmentIds = (assignments.assignments || []).map(item=>item.agentId);
const assignmentMenuIds = (assignments.assignments || []).map(item=>item.menuId);
const expectedMenuIds = categories.map((_,i)=>"m"+String(i+1).padStart(2,"0"));

if (!Array.isArray(manifest.pages)) errors.push("índice público não contém pages[]");
if (manifest.total !== manifest.pages.length) errors.push("total do índice não confere");
if (!Array.isArray(manifest.categories) || manifest.categories.length !== 13) errors.push("índice deve declarar exatamente 13 categorias");
if (!Array.isArray(assignments.assignments) || assignments.assignments.length !== 13) errors.push("registro deve conter exatamente 13 atribuições");
if (!Array.isArray(assignments.agentIds) || assignments.agentIds.length !== 13) errors.push("registro deve conter exatamente 13 agentIds");

const seenPaths = new Set();
for (const page of manifest.pages || []) {
  if (!page || typeof page.path !== "string" || !page.path.trim()) {
    errors.push("entrada inválida no índice");
    continue;
  }
  const normalized = page.path.replace(/\\/g,"/");
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) errors.push("caminho inseguro: "+normalized);
  if (seenPaths.has(normalized)) errors.push("caminho duplicado: "+normalized);
  seenPaths.add(normalized);
  const target = path.resolve(root,normalized);
  if (!target.startsWith(root+path.sep)) errors.push("caminho fora do repositório: "+normalized);
  else if (!fs.existsSync(target)) errors.push("página ausente: "+normalized);
  if (/^crypy-13-chatboots\//i.test(normalized) || /(^|\/)hd-matriz(\/|$)/i.test(normalized) || /(^|\/)hd-oculto(\/|$)/i.test(normalized)) {
    errors.push("área interna apareceu no índice público: "+normalized);
  }
  if (/chatboot-global\.html$/i.test(normalized)) errors.push("ChatBoot Global não deve aparecer no menu público");
}
const foundGroups = new Set((manifest.pages || []).map(page=>page.group));
for (const category of categories) {
  const at = nav.indexOf('label:"'+category.label+'"');
  if (at < 0) errors.push("categoria ausente no menu global: "+category.label);
  if (!foundGroups.has(category.group)) errors.push("categoria sem páginas públicas: "+category.label);
}
let previous = -1;
for (const category of categories) {
  const at = nav.indexOf('label:"'+category.label+'"');
  if (at >= 0 && at <= previous) errors.push("ordem oficial das 13 categorias incorreta");
  previous = at;
}
if (nav.includes('label:"BLOG"') || nav.includes("14 temas oficiais")) errors.push("menu global ainda contém categoria extra");
if (!nav.includes('count.textContent = "13 temas oficiais')) errors.push("contador do menu não está ajustado para 13 temas");
if (!nav.includes('if (pagePath === "crypy-news/museu.html") return categories[6];')) errors.push("Museu Digital sem rota própria");
if (!nav.includes('if (pagePath.indexOf("crypy-games-arcade/crypy-land/") === 0) return categories[8];')) errors.push("CRYPY-LAND não está dentro de Games-Arcade");

if (new Set(assignmentIds).size !== 13) errors.push("um agente foi atribuído a mais de um tema");
if (new Set(assignmentMenuIds).size !== 13) errors.push("menuId duplicado nas atribuições");
for (let i=0;i<13;i++) {
  const item = assignments.assignments[i];
  if (!item) continue;
  if (item.menuId !== expectedMenuIds[i]) errors.push("ordem/ID de menu incorreto em "+expectedMenuIds[i]);
  if (!catalogIds.has(item.agentId)) errors.push("agente não existe no catálogo de 13 perfis: "+item.agentId);
  if (!item.menuLabel || !item.task || !item.entrypoint || !Array.isArray(item.guardrails) || !item.guardrails.length) errors.push("atribuição incompleta: "+(item.agentId||"sem agente"));
  if (!Array.isArray(item.pathPrefixes) || !item.pathPrefixes.length) errors.push("prefixos de rota ausentes: "+(item.agentId||"sem agente"));
  if (item.entrypoint) {
    const target=path.resolve(root,item.entrypoint);
    if (!target.startsWith(root+path.sep) || !fs.existsSync(target)) errors.push("entrypoint inexistente: "+item.entrypoint);
    else if (fs.statSync(target).size===0) errors.push("entrypoint vazio: "+item.entrypoint);
    if (!seenPaths.has(item.entrypoint)) errors.push("entrypoint não está no índice público: "+item.entrypoint);
  }
}
if (new Set(assignments.agentIds || []).size !== 13) errors.push("agentIds contém duplicatas");
for (const id of assignments.agentIds || []) if (!catalogIds.has(id)) errors.push("agentId inválido no lote coletivo: "+id);
if (assignmentIds.some(id=>!assignments.agentIds.includes(id)) || assignments.agentIds.some(id=>!assignmentIds.includes(id))) errors.push("agentIds e atribuições não correspondem");

if (!home.includes("dev/micro-clock.js")) errors.push("HOME não carrega a ponte do menu global");
if (!home.includes("dev/baby-chat-widget.js")) errors.push("HOME não carrega a ponte do ChatBoot Global");
if (!loader.includes("crypy-global-nav.js")) errors.push("ponte da HOME não carrega o menu global");
if (!nav.includes("crypy-global-runtime.js")) errors.push("menu global não carrega o runtime");
if (!runtime.includes("baby-global-chat.js")) errors.push("runtime não carrega o widget global BABY");
if (!widget.includes("chatboot-global.html") || !widget.includes("location.pathname")) errors.push("widget global não aponta para o ChatBoot Global com contexto de página");
if (!chatPage.includes("crypy-global-agent-chat-page.js")) errors.push("página do ChatBoot Global não carrega seu controlador");
if (!chatScript.includes("baby-site-auth-production.up.railway.app") || !chatScript.includes("/api/agents/") || !chatScript.includes("/api/orchestrator/run")) {
  errors.push("ChatBoot Global não está ligado aos endpoints generativos BABY");
}
if (!chatScript.includes("CRYPY_API_TOKEN") || !chatScript.includes("sessionStorage")) errors.push("autenticação do ChatBoot não está documentada/limitada à sessão");
if (chatScript.includes("CRYPY_DEFAULT_API_KEY") || /sk-[A-Za-z0-9]{20,}/.test(chatScript)) errors.push("uma chave de provedor não pode aparecer no frontend");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("PASS: 13 categorias ligadas à árvore atual; 13 agentes distintos atribuídos; ChatBoot Global ligado ao backend autenticado; áreas internas excluídas do menu público.");
