import fs from "node:fs"; import path from "node:path";
const root=process.cwd(), skip=new Set([".git","node_modules",".baby",".tmp",".cache",".venv","__pycache__","dist","build","coverage","out","target",".next",".vite"]);
const protectedNames=new Set(["index.htm","hd-baby-ia.html","hd-babyia.html","hd-memory.html","hd-baby-ia-completo-tudo.html"]);
const navAsset="assets/js/crypy-global-nav.js", indexPath=path.join(root,"assets","data","crypy-page-index.json");
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isDirectory()){if(!skip.has(e.name))walk(path.join(dir,e.name),out)}else if(e.isFile()&&/\.html?$/i.test(e.name))out.push(path.relative(root,path.join(dir,e.name)).split(path.sep).join("/"))}return out}
function label(f){let b=path.posix.basename(f).replace(/\.html?$/i,"");return /^index$/i.test(b)?(f.includes("/")?"Página inicial":"HOME"):b.replace(/[-_]+/g," ").replace(/\b\w/g,c=>c.toLocaleUpperCase("pt-BR"))}
const files=walk(root).sort(),pages=[];let updated=0,already=0,preserved=0,invalid=0;
for(const f of files){const abs=path.join(root,f),html=fs.readFileSync(abs,"utf8");if(!/<(?:!doctype\s+html|html\b|body\b)/i.test(html)||html.includes("\u0000")){invalid++;continue}
pages.push({path:f,label:label(f),group:f.includes("/")?f.split("/")[0]:"RAIZ"});
const base=path.posix.basename(f).toLowerCase();
if(protectedNames.has(base)||/(^|\/)(hd-matriz|hd-oculto)(\/|$)/i.test(f)||f==="index.html"){preserved++;continue}
if(html.includes("crypy-global-nav.js")){already++;continue}
let dir=path.posix.dirname(f),src=path.posix.relative(dir==="."?"":dir,navAsset);if(!src.startsWith("."))src="./"+src;
const tag='<script src="'+src+'" defer></script>';let next=/<\/body\s*>/i.test(html)?html.replace(/<\/body\s*>/i,tag+"\n</body>"):(/<\/html\s*>/i.test(html)?html.replace(/<\/html\s*>/i,tag+"\n</html>"):html+"\n"+tag+"\n");
fs.writeFileSync(abs,next,"utf8");updated++}
pages.sort((a,b)=>a.group.localeCompare(b.group,"pt-BR")||a.label.localeCompare(b.label,"pt-BR")||a.path.localeCompare(b.path,"pt-BR"));
fs.mkdirSync(path.dirname(indexPath),{recursive:true});fs.writeFileSync(indexPath,JSON.stringify({version:"1.1",generated_at:new Date().toISOString(),total:pages.length,pages},null,2)+"\n");
console.log("Páginas catalogadas:",pages.length,"| atualizadas:",updated,"| já sincronizadas:",already,"| preservadas:",preserved,"| ignoradas:",invalid);
