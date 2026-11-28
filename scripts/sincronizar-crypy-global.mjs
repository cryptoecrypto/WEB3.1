import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const applyChanges = process.argv.includes("--apply");
const branch = process.env.GITHUB_REF_NAME || process.env.GITHUB_REF?.split("/").pop() || "main";
const skip = new Set([".git","node_modules",".baby",".tmp",".cache",".venv","__pycache__","dist","build","coverage","out","target",".next",".vite"]);
const protectedNames = new Set([
  "index.htm","chatboot-global.html","chatboot-baby-ia.html",
  "hd-baby-ia.html","hd-babyia.html","hd-memory.html","hd-baby-ia-completo-tudo.html"
]);
const protectedPaths = [
  /^crypy-news\/hd-matriz\//i,
  /^crypy-server-bridge\//i,
  /^crypy-13-chatboots\//i,
  /(^|\/)hd-oculto(\/|$)/i,
  /(^|\/)hd-matriz(\/|$)/i
];
const serviceEntrypoints = new Set([
  "crypy-server-bridge/public/index.html",
  "crypy-news/hd-matriz/crypy-server-bridge/public/index.html"
]);
const navAsset = "assets/js/crypy-global-nav.js?v=20261128-global-colmeia-1";
const indexPath = path.join(root,"assets","data","crypy-page-index.json");
const fileIndexPath = path.join(root,"assets","data","crypy-file-index.json");
const fileIndexRelative = "assets/data/crypy-file-index.json";

function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\\/g,"/").toLowerCase();
}
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
  return /^index$/i.test(base) ? "Página inicial"
    : base.replace(/[-_]+/g," ").replace(/\b\w/g,c=>c.toLocaleUpperCase("pt-BR"));
}
function isProtected(file) {
  const normalized=normalize(file);
  const base=path.posix.basename(normalized);
  return normalized==="index.html" || protectedNames.has(base) || protectedPaths.some(pattern=>pattern.test(normalized));
}
function isSensitive(file) {
  const normalized=normalize(file);
  const base=path.posix.basename(normalized);
  const segments=normalized.split("/");
  const restrictedSegments=["memory-boost","momory-boost","padrao","pluguin","sincronizacao","auto-config","login","signin","cadastro","registro","admin","administracao","painel-admin","dashboard-admin","perfil-privado","settings","senha","password","wallet","carteira","08-conta-apps-nft"];
  if (segments.some(segment=>restrictedSegments.includes(segment))) return true;
  return /(memoria|memory|fila-sync|manifest|backup|vault|wallet|seed|secret|credential|token|private[-_]?key|auto[-_]?config|(^|[-_])config(?:[-_.]|$)|(^|[-_])auth(?:[-_.]|$)|(^|[-_])login(?:[-_.]|$)|senha|password|account|perfil-privado)/i.test(base)
    || /(^|\/)\.env(?:\.|$)/i.test(normalized);
}
function menuGroupFor(file) {
  const normalized=normalize(file);
  if (isProtected(file) || isSensitive(file)) return null;
  if (normalized==="crypy-news/museu.html") return "museu-digital";
  const first=normalized.split("/")[0];
  const map={
    "crypy-infinyt":"crypy-infinyt",
    "calendar-infinit":"crypy-infinyt",
    "nft-collection":"nft-collection",
    "esquadrao-das-cores":"esquadrao-das-cores",
    "crypy-academy":"crypy-academy",
    "biografia":"biografia",
    "crypy-news":"crypy-news",
    "crypy-market-news":"crypy-news",
    "art-figure-marketplace":"art-figure-marketplace",
    "marketing":"art-figure-marketplace",
    "crypy-games-arcade":"crypy-games-arcade",
    "crypy-social":"crypy-social",
    "crypy-shots":"crypy-social",
    "baby-ia":"baby-ia",
    "crypy-coin":"crypy-coin",
    "contato":"contato"
  };
  return map[first] || null;
}
function extension(file) {
  const ext=path.posix.extname(file).replace(/^\./,"").toLowerCase();
  return ext||"[sem-extensão]";
}
function buildFileIndex() {
  const paths=walkFiles(root).sort();
  const records=paths.map(file=>{
    const buffer=fs.readFileSync(path.join(root,file));
    const gitBlobSha=crypto.createHash("sha1").update("blob "+buffer.length+"\0").update(buffer).digest("hex");
    const protectedFile=isProtected(file);
    const sensitive=isSensitive(file);
    const hidden=file.split("/").some(part=>part.startsWith("."));
    return {
      path:file,
      root:file.includes("/")?file.split("/")[0]:"RAIZ",
      extension:extension(file),
      sizeBytes:buffer.length,
      gitBlobSha,
      hidden,
      protected:protectedFile,
      sensitive,
      access:protectedFile?"protegido":sensitive?"restrito":"público",
      syncPolicy:protectedFile||sensitive?"não replicar automaticamente":"catalogar"
    };
  });
  const counts={};
  records.forEach(item=>{counts[item.gitBlobSha]=(counts[item.gitBlobSha]||0)+1;});
  records.forEach(item=>{item.duplicateCount=counts[item.gitBlobSha];});
  const byExtension={};
  records.forEach(item=>{byExtension[item.extension]=(byExtension[item.extension]||0)+1;});
  return {
    version:"1.1",
    hashAlgorithm:"git-sha1",
    generated_at:new Date().toISOString(),
    repository:"cryptoecrypto/WEB3.1",
    branch,
    total:records.length,
    hiddenFiles:records.filter(item=>item.hidden).length,
    protectedFiles:records.filter(item=>item.protected).length,
    restrictedFiles:records.filter(item=>item.sensitive).length,
    duplicateGroups:Object.values(counts).filter(count=>count>1).length,
    duplicateEntries:records.filter(item=>item.duplicateCount>1).length,
    byExtension,
    exclusions:Array.from(skip),
    selfReferenceExcluded:true,
    files:records
  };
}

const files=walk(root).sort();
const pages=[];
let updated=0,planned=0,already=0,repaired=0,preserved=0,invalid=0,excluded=0;
for(const file of files) {
  if(serviceEntrypoints.has(normalize(file))){excluded++;continue;}
  const absolute=path.join(root,file);
  const html=fs.readFileSync(absolute,"utf8");
  if(!/<(?:!doctype\s+html|html\b|body\b)/i.test(html)||html.includes("\u0000")){invalid++;continue;}
  const group=menuGroupFor(file);
  if(!group){preserved++;continue;}
  pages.push({path:file,label:label(file),group});
  const directory=path.posix.dirname(file);
  let source=path.posix.relative(directory==="."?"":directory,navAsset);
  if(!source.startsWith("."))source="./"+source;
  const tag='<script src="'+source+'" defer></script>';
  const navTag=/<script\b(?=[^>]*\bsrc=["'][^"']*crypy-global-nav\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi;
  const matches=html.match(navTag)||[];
  const srcMatch=matches.length===1?matches[0].match(/\bsrc=["']([^"']+)["']/i):null;
  if(matches.length===1 && srcMatch && srcMatch[1]===source){already++;continue;}
  const clean=html.replace(navTag,"");
  const next=/<\/body\s*>/i.test(clean)
    ? clean.replace(/<\/body\s*>/i,tag+"\n</body>")
    : /<\/html\s*>/i.test(clean)
      ? clean.replace(/<\/html\s*>/i,tag+"\n</html>")
      : clean+"\n"+tag+"\n";
  if(applyChanges){fs.writeFileSync(absolute,next,"utf8");updated++;if(matches.length)repaired++;}
  else{planned++;if(matches.length)repaired++;}
}
pages.sort((a,b)=>a.group.localeCompare(b.group,"pt-BR")||a.label.localeCompare(b.label,"pt-BR")||a.path.localeCompare(b.path,"pt-BR"));
const officialCategories=[
  {id:"m01",label:"CRYPY INFINYT",group:"crypy-infinyt"},
  {id:"m02",label:"NFT-COLLECTION",group:"nft-collection"},
  {id:"m03",label:"ESQUADRÃO DAS CORES",group:"esquadrao-das-cores"},
  {id:"m04",label:"CRYPY ACADEMY",group:"crypy-academy"},
  {id:"m05",label:"BIOGRAFIA",group:"biografia"},
  {id:"m06",label:"CRYPY NEWS",group:"crypy-news"},
  {id:"m07",label:"MUSEU DIGITAL",group:"museu-digital"},
  {id:"m08",label:"ART-FIGURE / MARKETPLACE",group:"art-figure-marketplace"},
  {id:"m09",label:"CRYPY GAMES-ARCADE",group:"crypy-games-arcade"},
  {id:"m10",label:"CRYPY-SOCIAL",group:"crypy-social"},
  {id:"m11",label:"BABY I.A.",group:"baby-ia"},
  {id:"m12",label:"WHITE PAPER / CRYPY COIN",group:"crypy-coin"},
  {id:"m13",label:"CONTATO",group:"contato"}
];
const groupsFound=new Set(pages.map(page=>page.group));
const missingGroups=officialCategories.filter(category=>!groupsFound.has(category.group)).map(category=>category.label);
if(applyChanges){
  fs.mkdirSync(path.dirname(indexPath),{recursive:true});
  fs.writeFileSync(indexPath,JSON.stringify({
    version:"3.2",
    generated_at:new Date().toISOString(),
    source_branch:branch,
    source_html_total:files.length,
    total:pages.length,
    categories:officialCategories,
    policy:"Somente páginas editoriais públicas das 13 áreas oficiais. HDs, backups, módulos internos, contas, autenticação e arquivos técnicos ficam fora do menu.",
    pages
  },null,2)+"\n");
  const fileIndex=buildFileIndex();
  fs.writeFileSync(fileIndexPath,JSON.stringify(fileIndex,null,2)+"\n");
}
console.log("Modo:",applyChanges?"APLICAÇÃO":"SIMULAÇÃO (padrão)",
  "| HTMLs examinados:",files.length,
  "| páginas públicas catalogadas:",pages.length,
  "| atualizadas:",updated,
  "| alterações planejadas:",planned,
  "| já sincronizadas:",already,
  "| corrigidas por caminho:",repaired,
  "| preservadas fora do menu:",preserved,
  "| entradas de servidor excluídas:",excluded,
  "| inválidas:",invalid,
  "| categorias sem páginas:",missingGroups.join(", ")||"nenhuma");
if(missingGroups.length)process.exitCode=1;
