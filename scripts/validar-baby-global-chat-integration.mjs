import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bridgePath = path.join(root, "assets/js/crypy-page-assistant.js");
const registryPath = path.join(root, "CRYPY-13-CHATBOOTS/colmeia-integral/registry-15.json");
const errors = [];
const bridge = fs.readFileSync(bridgePath, "utf8");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

if (!bridge.includes("crypy-global-runtime.js")) errors.push("ponte não carrega o runtime global");
if (!bridge.includes('params.get("embed") === "1"')) errors.push("ponte não preserva o modo iframe embed");
if (!bridge.includes("/chatboot-baby-ia\\.html$/")) errors.push("ponte não preserva a página canônica do chatbot");
if (!bridge.includes('data-crypy-global-runtime="true"')) errors.push("ponte não evita runtime duplicado");
if (/fetch\\s*\\(|XMLHttpRequest|sendBeacon|localStorage|indexedDB/i.test(bridge)) {
  errors.push("ponte contém operação de rede ou persistência inesperada");
}

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
  console.log("OK — ponte global, embed, prevenção de duplicidade e registro 13 + BABY + LUCY.");
  console.log("LIMITAÇÃO — este teste não comprova conexão com modelos, backend, armazenamento ou implantação.");
}
