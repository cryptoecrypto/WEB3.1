import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const manifestPath=path.join(root,"assets","data","crypy-page-index.json");
const homePath=path.join(root,"index.html");
const navPath=path.join(root,"assets","js","crypy-global-nav.js");
const chatPath=path.join(root,"assets","js","baby-global-chat.js");
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const home=fs.readFileSync(homePath,"utf8");
const nav=fs.readFileSync(navPath,"utf8");
const missing=manifest.pages.filter(p=>!fs.existsSync(path.join(root,p.path))).map(p=>p.path);
const duplicate=new Set();
for(const p of manifest.pages){if(duplicate.has(p.path))throw new Error("Caminho duplicado: "+p.path);duplicate.add(p.path)}
const errors=[];
if(manifest.total!==manifest.pages.length)errors.push("total do índice não confere");
if(missing.length)errors.push("páginas ausentes: "+missing.slice(0,20).join(", "));
if(!home.includes("crypy-global-nav.js"))errors.push("HOME não carrega o menu global");
if(!home.includes("baby-global-chat.js"))errors.push("HOME não carrega o widget BABY");
if(!nav.includes('target:"crypy-content"'))errors.push("menu não mantém navegação dentro do frame principal");
if(!fs.existsSync(chatPath))errors.push("widget BABY ausente");
if(errors.length){console.error(errors.join("\\n"));process.exit(1)}
console.log("PASS: "+manifest.pages.length+" páginas catalogadas e presentes; HOME carrega menu global e BABY; navegação permanece no frame principal.");
