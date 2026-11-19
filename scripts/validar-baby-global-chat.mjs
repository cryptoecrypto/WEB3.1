import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const widgetPath = path.join(root, "assets", "js", "baby-global-chat.js");
const chatSource = path.join(root, "chatboot-baby-ia.html");
const homePath = path.join(root, "index.html");

function fail(message) {
  console.error("FAIL:", message);
  process.exitCode = 1;
}

for (const file of [widgetPath, chatSource, homePath]) {
  if (!fs.existsSync(file)) fail("Arquivo obrigatório ausente: " + path.relative(root, file));
}

if (fs.existsSync(widgetPath)) {
  const widget = fs.readFileSync(widgetPath, "utf8");
  if (!widget.includes('id = "crypy-baby-global-root"')) fail("Widget sem raiz identificável.");
  if (!widget.includes("chatboot-baby-ia.html?embed=1")) fail("Widget não aponta para o ChatBoot oficial.");
  if (!widget.includes("aria-expanded")) fail("Widget sem estado acessível do botão.");
}

if (fs.existsSync(homePath)) {
  const home = fs.readFileSync(homePath, "utf8");
  if (!home.includes('src="./assets/js/baby-global-chat.js"')) fail("Home não carrega o widget global.");
  if (!home.includes('href="./baby-ia.html"')) fail("Home sem link para BABY I.A.");
}

const rootHtml = fs.readdirSync(root, { withFileTypes: true })
  .filter(entry => entry.isFile() && /\.html?$/i.test(entry.name))
  .map(entry => entry.name);

let checked = 0;
for (const name of rootHtml) {
  const full = path.join(root, name);
  const html = fs.readFileSync(full, "utf8");
  if (!html.trim()) {
    console.log("SKIP vazio:", name);
    continue;
  }
  if (name.toLowerCase() === "chatboot-baby-ia.html") {
    if (!html.includes('id="fab"') || !html.includes("function enviar")) fail("ChatBoot oficial sem interface de conversa esperada.");
    console.log("OK fonte do chatbot:", name);
    continue;
  }
  checked++;
  if (!html.includes("assets/js/baby-global-chat.js")) fail(name + " não inclui o widget global.");
  if (!/<\/body\s*>/i.test(html)) fail(name + " não contém fechamento BODY.");
  console.log("OK widget:", name);
}

if (checked === 0) fail("Nenhuma página raiz validada.");
if (!process.exitCode) console.log("PASS: " + checked + " páginas raiz com widget; ChatBoot preservado.");
