import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const applyChanges = process.argv.includes("--apply");
const skip = new Set([".git","node_modules",".baby",".tmp",".cache",".venv","__pycache__","dist","build","coverage","out","target",".next",".vite"]);
const protectedNames = new Set(["index.htm","hd-baby-ia.html","hd-babyia.html","hd-memory.html","hd-baby-ia-completo-tudo.html"]);
const protectedPaths = [
  /^crypy-news\/hd-matriz\//i,
  /^crypy-server-bridge\//i,
  /(^|\/)hd-oculto(\/|$)/i,
  /(^|\/)hd-matriz(\/|$)/i
];
const serviceEntrypoints = new Set([
  "crypy-server-bridge/public/index.html",
  "crypy-news/hd-matriz/crypy-server-bridge/public/index.html"
]);
const navAsset = "assets/js/crypy-global-nav.js";
const indexPath = path.join(root,"assets","data","crypy-page-index.json");
const fileIndexPath = path.join(root,"assets","data","crypy-file-index.json");
const fileIndexRelative = "assets/data/crypy-file-index.json";

function walk(dir,out=[]) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (entry.isDirectory()) {
      if (!skip.has(entry.name)) walk(path.join(dir,entry.name),out);
    } else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
      out.push(path.relative(root,path.join(dir,entry.name)).split(path.sep).join("/"));
    }
  }
  return out;
}
function walkFiles(dir,out=[]) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (entry.isDirectory()) {
      if (!skip.has(entry.name)) walkFiles(path.join(dir,entry.name),out);
    } else if (entry.isFile()) {
      const relative=path.relative(root,path.join(dir,entry.name)).split(path.sep).join("/");
      if (relative!==fileIndexRelative) out.push(relative);
    }
  }
  return out;
}
function label(file) {
  const base = path.posix.basename(file).replace(/\.html?$/i,"");
  return /^index$/i.test(base) ? (file.includes("/") ? "Página inicial" : "HOME")
    : base.replace(/[-_]+/g," ").replace(/\b\w/g,c=>c.toLocaleUpperCase("pt-BR"));
}
function isProtected(file) {
  const base=path.posix.basename(file).toLowerCase();
  return protectedNames.has(base)||protectedPaths.some(pattern=>pattern.test(file));
}
function isSensitive(file) {
  const base=path.posix.basename(file).toLowerCase();
  return /^(memorias|memory|fila-sync|manifest)\.json$/i.test(base)
    || /(^|\/)\.env(?:\.|$)/i.test(file)
    || /(secret|credential|token|seedphrase|private[-_]?key)/i.test(base);
}
function extension(file) {
  const ext=path.posix.extname(file).replace(/^\./,"").toLowerCase();
  return ext||"[sem-extensão]";
}
function buildFileIndex() {
  const paths=walkFiles(root).sort();
  const records=paths.map(file=>{
    const buffer=fs.readFileSync(path.join(root,file));
    const sha256=crypto.createHash("sha256").update(buffer).digest("hex");
    const protectedFile=isProtected(file);
    const sensitive=isSensitive(file);
    const hidden=file.split("/").some(part=>part.startsWith("."));
    return {
      path:file,
      root:file.includes("/")?file.split("/")[0]:"RAIZ",
      extension:extension(file),
      sizeBytes:buffer.length,
      sha256,
      hidden,
      protected:protectedFile,
      sensitive,
      access:protectedFile?"protegido":sensitive?"restrito":"público",
      syncPolicy:protectedFile||sensitive?"não replicar automaticamente":"catalogar"
    };
  });
  const counts={};
  records.forEach(item=>{counts[item.sha256]=(counts[item.sha256]||0)+1;});
  records.forEach(item=>{item.duplicateCount=counts[item.sha256];});
  const byExtension={};
  records.forEach(item=>{byExtension[item.extension]=(byExtension[item.extension]||0)+1;});
  return {
    version:"1.0",
    generated_at:new Date().toISOString(),
    repository:"cryptoecrypto/WEB3.1",
    branch:"main",
    total:records.length,
    hiddenFiles:records.filter(item=>item.hidden).length,
    protectedFiles:records.filter(item=>item.protected).length,
    restrictedFiles:records.filter(item=>item.sensitive).length,
    duplicateEntries:records.filter(item=>item.duplicateCount>1).length,
    byExtension,
    exclusions:[".git","node_modules",".baby",".tmp",".cache",".venv","__pycache__","dist","build","coverage","out","target",".next",".vite"],
    selfReferenceExcluded:true,
    files:records
  };
}

const files=walk(root).sort();
const pages=[];
let updated=0,planned=0,already=0,repaired=0,preserved=0,invalid=0,excluded=0;
for(const file of files) {
  if(serviceEntrypoints.has(file)){excluded++;continue;}
  const absolute=path.join(root,file);
  const html=fs.readFileSync(absolute,"utf8");
  if(!/<(?:!doctype\s+html|html\b|body\b)/i.test(html)||html.includes("\u0000")){invalid++;continue;}
  pages.push({path:file,label:label(file),group:file.includes("/")?file.split("/")[0]:"RAIZ"});
  if(isProtected(file)){preserved++;continue;}

  const directory=path.posix.dirname(file);
  let source=path.posix.relative(directory==="."?"":directory,navAsset);
  if(!source.startsWith("."))source="./"+source;
  const tag='<script src="'+source+'" defer></script>';
  const navTag=/<script\b(?=[^>]*\bsrc=["'][^"']*crypy-global-nav\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi;
  const matches=html.match(navTag)||[];
  const srcMatch=matches.length===1?matches[0].match(/\bsrc=["']([^"']+)["']/i):null;
  if(matches.length===1 && srcMatch && srcMatch[1]===source){
    already++;
    continue;
  }
  let clean=html.replace(navTag,"");
  const next=/<\/body\s*>/i.test(clean)
    ? clean.replace(/<\/body\s*>/i,tag+"\n</body>")
    : /<\/html\s*>/i.test(clean)
      ? clean.replace(/<\/html\s*>/i,tag+"\n</html>")
      : clean+"\n"+tag+"\n";
  if(applyChanges){fs.writeFileSync(absolute,next,"utf8");updated++;if(matches.length)repaired++;}
  else{planned++;if(matches.length)repaired++;}
}
pages.sort((a,b)=>a.group.localeCompare(b.group,"pt-BR")||a.label.localeCompare(b.label,"pt-BR")||a.path.localeCompare(b.path,"pt-BR"));
const fileIndex=buildFileIndex();
if(applyChanges){
  fs.mkdirSync(path.dirname(indexPath),{recursive:true});
  fs.writeFileSync(indexPath,JSON.stringify({version:"2.1",generated_at:new Date().toISOString(),total:pages.length,pages},null,2)+"\n");
  fs.writeFileSync(fileIndexPath,JSON.stringify(fileIndex,null,2)+"\n");
}
console.log("Modo:",applyChanges?"APLICAÇÃO":"SIMULAÇÃO (padrão)",
  "| páginas catalogadas:",pages.length,
  "| atualizadas:",updated,
  "| alterações planejadas:",planned,
  "| já sincronizadas:",already,
  "| corrigidas por caminho:",repaired,
  "| preservadas:",preserved,
  "| entradas de servidor excluídas:",excluded,
  "| inválidas:",invalid,
  "| arquivos no inventário:",fileIndex.total,
  "| ocultos:",fileIndex.hiddenFiles,
  "| protegidos:",fileIndex.protectedFiles,
  "| restritos:",fileIndex.restrictedFiles,
  "| entradas duplicadas:",fileIndex.duplicateEntries);
