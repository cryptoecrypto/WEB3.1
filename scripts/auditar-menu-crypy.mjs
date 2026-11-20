import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const expected = [
  ["NFT","nft-collection/galeria.html"],
  ["ACADEMY","crypy-academy/academia.html"],
  ["BIOGRAFIA","biografia/historia.html"],
  ["MUSEU","crypy-news/museu.html"],
  ["MARKETPLACE","art-figure-marketplace/marketplace.html"],
  ["GAMES","crypy-games-desafios/crypy-games-desafios.html"],
  ["SOCIAL","social-crypykut/comunidade.html"],
  ["BABY I.A.","baby-ia.html"],
  ["WHITE PAPER","crypy-coin/white-paper.html"],
  ["CONTATO","contato/contato-oficial.html"],
  ["ESQUADRÃO","esquadrao-das-cores/esquadrao.html"],
  ["INFINYT","crypy-infinyt/portal.html"]
];
const protectedFiles = new Set(["index.html","index.htm","crypy-server-bridge/public/index.html"]);
const protectedSegments = /^(?:hd(?:[-_.].*)?|memory-boost|momory-boost)$/i;
const protectedRoots = [/^crypy-news\/hd-matriz\//i,/^crypy-server-bridge\//i];
function excluded(file) {
  if (protectedFiles.has(file) || protectedRoots.some((r)=>r.test(file))) return true;
  return file.split("/").some((part)=>protectedSegments.test(part));
}
function walk(dir,out=[]) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const absolute=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(absolute,out);
    else if(entry.isFile() && /\.html?$/i.test(entry.name)) {
      const file=path.relative(root,absolute).split(path.sep).join("/");
      if(!excluded(file)) out.push(file);
    }
  }
  return out;
}
const navPath=path.join(root,"assets","js","crypy-global-nav.js");
const nav=fs.readFileSync(navPath,"utf8");
const actual=[];
const block=nav.match(/var AREAS\s*=\s*\[([\s\S]*?)\n\s*\];/);
if(block) {
  const re=/\["([^"]+)",\s*"([^"]+)"\]/g;
  let m;
  while((m=re.exec(block[1]))) actual.push([m[1],m[2]]);
}
const errors=[];
if(JSON.stringify(actual)!==JSON.stringify(expected)) errors.push("Os rótulos/rotas do menu não correspondem às 12 palavras-chave oficiais.");
if(!nav.includes("removeLegacyMenus(root)") || !nav.includes('"nav"')) errors.push("O menu global não está configurado para ocultar menus antigos.");
for(const [,route] of expected) if(!fs.existsSync(path.join(root,route))) errors.push("Destino inexistente: "+route);
const files=walk(root).sort();
const missing=[];
for(const file of files) {
  const html=fs.readFileSync(path.join(root,file),"utf8");
  if(!html.includes("crypy-global-nav.js")) missing.push(file);
}
console.log("CRYPY — AUDITORIA DE MENUS");
console.log("Palavras-chave oficiais:",actual.length);
console.log("Destinos verificados:",expected.length);
console.log("Páginas HTML elegíveis:",files.length);
console.log("Páginas carregando menu global:",files.length-missing.length);
console.log("Páginas sem menu global:",missing.length);
if(missing.length) errors.push("Páginas ainda sem menu global: "+missing.join(", "));
if(errors.length) {
  errors.forEach((e)=>console.error("ERRO:",e));
  process.exitCode=1;
} else {
  console.log("RESULTADO: APROVADO — 12 rótulos exatos, destinos existentes e menu global em todas as páginas elegíveis.");
}
