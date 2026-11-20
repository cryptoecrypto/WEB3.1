// BABY I.A. — autenticação + descoberta recursiva e sincronização do índice público CRYPY.
// Node.js >=20. Apenas HTML público do mesmo site. Não acessa Dropbox/HD MATRIZ nem segredos.
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT=Number(process.env.PORT||8787);
const KEY=process.env.BABY_SITE_KEY||"";
const ORIGIN=process.env.BABY_SITE_ORIGIN||"";
const SITE_URL=process.env.BABY_SITE_URL||"";
const COOKIE="baby_site_session";
const SESSION_MS=30*60*1000, WINDOW_MS=15*60*1000, MAX_ATTEMPTS=8;
const MAX_PAGES=2000, MAX_HTML_BYTES=25*1024*1024, WORKERS=8;
const sessions=new Map(), attempts=new Map();
const here=path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR=process.env.BABY_SITE_DATA_DIR||here;
fs.mkdirSync(DATA_DIR,{recursive:true});
const INDEX_FILE=path.join(DATA_DIR,"site-index.json");
let chunks=[],crawlReport={status:"not_run",pages_discovered:0,pages_fetched:0,pages_indexed:0,failed:[],oversize:[],indexed_at:null};
if(KEY.length<16) throw new Error("BABY_SITE_KEY precisa ter pelo menos 16 caracteres.");
if(!ORIGIN.startsWith("https://")) throw new Error("BABY_SITE_ORIGIN precisa ser HTTPS.");
if(!SITE_URL.startsWith("https://")) throw new Error("BABY_SITE_URL precisa ser HTTPS.");
try { const saved=JSON.parse(fs.readFileSync(INDEX_FILE,"utf8")); if(Array.isArray(saved.chunks))chunks=saved.chunks; if(saved.report)crawlReport=saved.report; } catch {}

const hmac=v=>crypto.createHmac("sha256",KEY).update(v).digest("hex");
const equal=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y);};
function send(res,code,data,extra={}){res.writeHead(code,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra});res.end(JSON.stringify(data));}
function getCookie(req){const x=(req.headers.cookie||"").split(";").map(v=>v.trim()).find(v=>v.startsWith(COOKIE+"="));return x?decodeURIComponent(x.slice(COOKIE.length+1)):"";}
function valid(req){const parts=getCookie(req).split(".");const id=parts[0],sig=parts[1],row=sessions.get(id);return !!(row&&sig&&row.expires>Date.now()&&equal(sig,hmac(id+"."+row.expires)));}
function cors(req,res){if(req.headers.origin!==ORIGIN)return false;res.setHeader("Access-Control-Allow-Origin",ORIGIN);res.setHeader("Access-Control-Allow-Credentials","true");res.setHeader("Vary","Origin");res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");return true;}
async function readBody(req){let s="";for await(const b of req){s+=b;if(s.length>8192)throw Error("too_large");}return JSON.parse(s||"{}");}
async function readLimited(response,limit){const reader=response.body?.getReader();if(!reader)throw Error("empty_body");const parts=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Error("html_too_large");}parts.push(value);}const all=new Uint8Array(size);let offset=0;for(const p of parts){all.set(p,offset);offset+=p.length;}return new TextDecoder("utf-8").decode(all);}
function decodeEntities(s){return s.replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));}
function parseHtml(html,url){
 const links=new Set();
 for(const m of html.matchAll(/\b(?:href|src|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)){const raw=m[1]??m[2]??m[3]??"";try{const u=new URL(decodeEntities(raw),url);if(u.origin===url.origin&&u.pathname.startsWith(new URL(SITE_URL).pathname)){u.hash="";if(/\.html?$/i.test(u.pathname)||u.pathname.endsWith("/"))links.add(u.href);}}catch{}}
 const imageNotes=[];
 for(const m of html.matchAll(/<img\b([^>]*)>/gi)){const a=m[1],alt=(a.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i)||[]),title=(a.match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)')/i)||[]);const note=decodeEntities(alt[1]||alt[2]||title[1]||title[2]||"").trim();if(note)imageNotes.push(note);}
 const title=decodeEntities((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||url.pathname).replace(/<[^>]*>/g," ").trim();
 const text=decodeEntities(html.replace(/<!--[\s\S]*?-->/g," ").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi," ").replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi," ").replace(/<[^>]*>/g," ").replace(/[\t\r\n]+/g," ").replace(/\s{2,}/g," ")).trim();
 return {title,text,links:[...links],imageNotes:[...new Set(imageNotes)]};
}
function splitChunks(page){const out=[],text=page.text+"\n\nDescrição de imagens: "+page.imageNotes.join("; "),size=1100,overlap=140;for(let i=0;i<text.length;i+=size-overlap){const body=text.slice(i,i+size).trim();if(body.length>50)out.push({url:page.url,title:page.title,text:body});}return out;}
async function learnSite(){
 const base=new URL(SITE_URL.endsWith("/")?SITE_URL:SITE_URL+"/");
 const queue=[new URL("index.html",base).href,new URL("index.htm",base).href,new URL("mapa-colmeia.html",base).href];
 const slugs=["art-figure-marketplace","baby-ia","biografia","contato","crypy-academy","crypy-coin","crypy-games-desafios","crypy-infinyt","crypy-news","esquadrao-das-cores","marketing","memory-boost","nft-collection","padrao","pluguin","sincronizacao","social-crypykut","web3.1"];
 for(const slug of slugs)queue.push(new URL(slug+"/index.html",base).href);
 const discovered=new Set(queue),visited=new Set(),fresh=[],failed=[],oversize=[];let fetched=0;
 while(queue.length&&visited.size<MAX_PAGES){
  const batch=[];while(queue.length&&batch.length<WORKERS&&visited.size+batch.length<MAX_PAGES){const u=queue.shift();if(!visited.has(u)){visited.add(u);batch.push(u);}}
  const results=await Promise.all(batch.map(async href=>{
   try{const u=new URL(href);if(u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return {href,error:"outside_base"};const response=await fetch(u,{redirect:"follow",headers:{"User-Agent":"BABY-CRYPY-SiteIndexer/2.0"}});if(!response.ok)return {href,error:"HTTP_"+response.status};const finalUrl=new URL(response.url||href);if(finalUrl.origin!==base.origin||!finalUrl.pathname.startsWith(base.pathname))return {href,error:"redirect_outside_base"};const type=String(response.headers.get("content-type")||"");if(type&&!type.toLowerCase().includes("text/html"))return {href,error:"not_html"};const html=await readLimited(response,MAX_HTML_BYTES);const page=parseHtml(html,finalUrl.href);page.url=finalUrl.href;return {href,page};}catch(e){return {href,error:String(e.message||e)};}
  }));
  for(const item of results){if(item.page){fetched++;fresh.push(...splitChunks(item.page));for(const link of item.page.links){if(!discovered.has(link)&&discovered.size<MAX_PAGES*4){discovered.add(link);queue.push(link);}}}else if(item.error==="html_too_large")oversize.push(item.href);else if(item.error!=="not_html")failed.push({url:item.href,error:item.error});}
 }
 const report={status:queue.length?"partial":"complete",pages_discovered:discovered.size,pages_fetched:fetched,pages_indexed:new Set(fresh.map(x=>x.url)).size,chunks:fresh.length,failed:failed.slice(0,200),oversize,indexed_at:new Date().toISOString(),limits:{max_pages:MAX_PAGES,max_html_bytes:MAX_HTML_BYTES}};
 const tmp=INDEX_FILE+".tmp";fs.writeFileSync(tmp,JSON.stringify({chunks:fresh,report}),"utf8");fs.renameSync(tmp,INDEX_FILE);
 chunks=fresh;crawlReport=report;
 return report;
}
function search(q){const terms=String(q||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").split(/[^a-z0-9]+/).filter(x=>x.length>2);if(!terms.length)return[];return chunks.map(c=>{const t=(c.title+" "+c.text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");let score=0;for(const w of terms){let at=0;while((at=t.indexOf(w,at))!==-1){score++;at+=w.length;}}return {...c,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(({title,url,text,score})=>({title,url,text,score}));}
const server=http.createServer(async(req,res)=>{
 if(!cors(req,res))return send(res,403,{error:"origin_not_allowed"});
 if(req.method==="OPTIONS"){res.writeHead(204);return res.end();}
 const u=new URL(req.url,"http://localhost");
 if(u.pathname==="/session"&&req.method==="GET")return send(res,200,{authenticated:valid(req),scope:"crypy-site"});
 if(u.pathname==="/unlock"&&req.method==="POST"){
  const ip=req.socket.remoteAddress||"unknown",now=Date.now(),st=attempts.get(ip)||{count:0,start:now};if(now-st.start>WINDOW_MS){st.count=0;st.start=now;}if(st.count>=MAX_ATTEMPTS)return send(res,429,{error:"rate_limited"});
  let d;try{d=await readBody(req);}catch{return send(res,400,{error:"invalid_request"});}st.count++;attempts.set(ip,st);if(typeof d.key!=="string"||!equal(d.key,KEY))return send(res,401,{error:"invalid_key"});attempts.delete(ip);
  const id=crypto.randomBytes(32).toString("hex"),expires=Date.now()+SESSION_MS;sessions.set(id,{expires});res.setHeader("Set-Cookie",COOKIE+"="+encodeURIComponent(id+"."+hmac(id+"."+expires))+"; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=1800");return send(res,200,{authenticated:true,scope:"crypy-site",expires});
 }
 if(u.pathname==="/lock"&&req.method==="POST"){sessions.delete(getCookie(req).split(".")[0]);res.setHeader("Set-Cookie",COOKIE+"=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0");return send(res,200,{locked:true});}
 if(!valid(req))return send(res,401,{error:"authentication_required"});
 if(u.pathname==="/learn"&&req.method==="POST"){try{return send(res,200,{ok:true,...await learnSite()});}catch(e){return send(res,500,{error:"learning_failed",message:String(e.message||e)});}}
 if(u.pathname==="/search"&&req.method==="POST"){let d;try{d=await readBody(req);}catch{return send(res,400,{error:"invalid_request"});}return send(res,200,{results:search(d.query),indexed_chunks:chunks.length});}
 if(u.pathname==="/learning-status"&&req.method==="GET")return send(res,200,{indexed_chunks:chunks.length,index_exists:chunks.length>0,...crawlReport});
 return send(res,404,{error:"not_found"});
});
server.listen(PORT,"0.0.0.0",()=>process.stdout.write("BABY recursive site indexer listening on "+PORT+"; indexed chunks: "+chunks.length+"\n"));
