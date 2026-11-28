import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const errors=[];
const manifest=JSON.parse(read("assets/data/crypy-menu-superior-13-html.json"));
const app=read("App.tsx");
const index=read("index.html");
const menuScript=read("assets/js/crypy-menu-superior-13-html.js");
const expected=[
  "CRYPY INFINYT","NFT-COLLECTION","ESQUADRÃO DAS CORES","CRYPY ACADEMY",
  "BIOGRAFIA","CRYPY NEWS","MUSEU DIGITAL","ART-FIGURE / MARKETPLACE",
  "CRYPY GAMES-ARCADE","CRYPY-SOCIAL","BABY I.A.",
  "WHITE PAPER / CRYPY COIN","CONTATO"
];
if(manifest.categoryCount!==13||manifest.groups?.length!==13) errors.push("O catálogo não possui exatamente 13 categorias.");
if(!Array.isArray(manifest.groups)) errors.push("groups[] ausente.");
if(!Array.isArray(manifest.groups)) {
  console.error(errors.join("\n")); process.exit(1);
}
const seen=new Set();
let total=0;
manifest.groups.forEach((group,index)=>{
  if(group.id!=="m"+String(index+1).padStart(2,"0")) errors.push("ID ou ordem incorreta na categoria "+(index+1));
  if(group.name!==expected[index]) errors.push("Nome incorreto na categoria "+(index+1)+": "+group.name);
  if(!Array.isArray(group.pages)) { errors.push("Lista HTML ausente em "+group.name); return; }
  if(group.count!==group.pages.length) errors.push("Contagem incorreta em "+group.name);
  total+=group.pages.length;
  for(const page of group.pages){
    if(typeof page.path!=="string"||!page.path.endsWith(".html")) { errors.push("Entrada não HTML em "+group.name); continue; }
    const normalized=page.path.replace(/\\/g,"/");
    if(normalized.startsWith("/")||normalized.split("/").includes("..")) errors.push("Caminho inseguro: "+normalized);
    if(seen.has(normalized)) errors.push("HTML duplicado no menu: "+normalized);
    seen.add(normalized);
    if(/(^|\/)hd-matriz(\/|$)|(^|\/)hd-oculto(\/|$)/i.test(normalized)) errors.push("Área interna exposta: "+normalized);
    if(!fs.existsSync(path.resolve(root,normalized))) errors.push("HTML não encontrado: "+normalized);
  }
});
if(total!==291||manifest.total!==291) errors.push("Total esperado de 291 HTMLs; catálogo declara "+total+".");
const contactGroup=manifest.groups.find(group=>group.id==="m13");
if(!contactGroup||contactGroup.pages.length!==1||contactGroup.pages[0].path.toLowerCase()!=="contato/contato-oficial.html") errors.push("CONTATO deve exibir somente contato-oficial.html.");
for(const group of manifest.groups){
  for(const page of group.pages||[]){
    const normalized=page.path.replace(/\\/g,"/").toLowerCase();
    const parts=normalized.split("/");
    const base=parts[parts.length-1];
    const hidden=parts.includes("momory-boost")||parts.includes("memory-boost")||
      ["chatboot-baby-ia.html","hd-baby-ia.html","hd-memory.html"].includes(base)||
      (parts[0]==="contato"&&normalized!=="contato/contato-oficial.html");
    if(hidden) errors.push("Página interna ou fora de CONTATO exposta no menu: "+page.path);
  }
}
if(!menuScript.includes("crypy-menu-superior-13-html.json")) errors.push("Script não carrega o catálogo.");
if(!menuScript.includes('textContent = String(index + 1).padStart(2, "0")')) errors.push("Script não apresenta as 13 categorias numeradas.");
if(!menuScript.includes('button.textContent')||!menuScript.includes('"MENU"')) errors.push("Script não está ligado ao botão MENU superior.");
if(!app.includes("assets/js/crypy-menu-superior-13-html.js")) errors.push("App.tsx não carrega o menu.");
const tagCount=(index.match(/assets\/js\/crypy-menu-superior-13-html\.js/g)||[]).length;
if(tagCount!==1) errors.push("index.html deve carregar uma única ponte do menu; encontrados "+tagCount+".");
if(errors.length){console.error(errors.join("\n"));process.exit(1);}
console.log("PASS: 13 categorias na ordem oficial; "+total+" HTMLs existentes e sem duplicatas; HD-MATRIZ/HD-OCULTO fora do menu; HOME ligada ao botão superior MENU.");
