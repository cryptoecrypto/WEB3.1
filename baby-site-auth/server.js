// BABY I.A. — autenticação + aprendizagem RAG do site CRYPY.
// Node.js >=20. Configure BABY_SITE_KEY, BABY_SITE_ORIGIN e BABY_SITE_URL no host HTTPS.
// O índice contém somente conteúdo público do próprio site; nunca armazene segredos nele.
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
const sessions=new Map(), attempts=new Map();
const here=path.dirname(fileURLToPath(import.meta.url));
const INDEX_FILE=path.join(here,"site-index.json");
let chunks=[];
if(KEY.length<16) throw new Error("BABY_SITE_KEY precisa ter pelo menos 16 caracteres.");
if(!ORIGIN.startsWith("https://")) throw new Error("BABY_SITE_ORIGIN precisa ser HTTPS.");
if(!SITE_URL.startsWith("https://")) throw new Error("BABY_SITE_URL precisa ser HTTPS.");
try { chunks=JSON.parse(fs.readFileSync(INDEX_FILE,"utf8")); if(!Array.isArray(chunks)) chunks=[]; } catch {}
const hmac=v=>crypto.createHmac("sha256",KEY).update(v).digest("hex");
const equal=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y);};
function send(res,code,data,extra={}){res.writeHead(code,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra});res.end(JSON.stringify(data));}
function getCookie(req){const x=(req.headers.cookie||"").split(";").map(v=>v.trim()).find(v=>v.startsWith(COOKIE+"="));return x?decodeURIComponent(x.slice(COOKIE.length+1)):"";}
function valid(req){const parts=getCookie(req).split(".");const id=parts[0],sig=parts[1],row=sessions.get(id);return !!(row&&sig&&row.expires>Date.now()&&equal(sig,hmac(id+"."+row.expires)));}
function cors(req,res){if(req.headers.origin!==ORIGIN)return false;res.setHeader("Access-Control-Allow-Origin",ORIGIN);res.setHeader("Access-Control-Allow-Credentials","true");res.setHeader("Vary","Origin");res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");return true;}
async function readBody(req){let s="";for await(const b of req){s+=b;if(s.length>8192)throw Error("too_large");}return JSON.parse(s||"{}");}
function textFromHtml(html){
 return html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi," ")
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi," ")
  .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi," ")
  .replace(/<(nav|header|footer|form)[^>]*>[\s\S]*?<\/\1>/gi," ")
  .replace(/<[^>]*>/g," ")
  .replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<")
  .replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'")
  .replaceAll("\n"," ").replaceAll("\r"," ").replaceAll("\t"," ")
  .split(" ").filter(Boolean).join(" ").trim();
}
function splitChunks(text,url,title){
 const out=[],size=1100,overlap=140;
 for(let i=0;i<text.length;i+=size-overlap){const body=text.slice(i,i+size).trim();if(body.length>80)out.push({url,title,text:body});}
 return out;
}
async function learnSite(){
 const base=new URL(SITE_URL.endsWith("/")?SITE_URL:SITE_URL+"/");
 const paths=new Set(["index.html","mapa-colmeia.html"]);
 const areaSlugs=["art-figure-marketplace","baby-ia","biografia","contato","crypy-academy","crypy-coin","crypy-games-desafios","crypy-infinyt","crypy-news","esquadrao-das-cores","marketing","memory-boost","nft-collection","padrao","pluguin","sincronizacao","social-crypykut","web3.1"];
 for(const slug of areaSlugs)paths.add(slug+"/index.html");
 try{
  const r=await fetch(new URL("mapa-colmeia.html",base));
  if(r.ok){
   const h=await r.text();
   for(const m of h.matchAll(/href=["']([^"'#]+)["']/gi)){
    try{
     const u=new URL(m[1],base);
     if(u.origin===base.origin&&u.pathname.startsWith(base.pathname)&&
       (u.pathname.endsWith(".html")||u.pathname.endsWith(".htm"))){
      paths.add(u.pathname.slice(base.pathname.length));
     }
    }catch{}
   }
  }
 }catch{}
 const list=[...paths].slice(0,500),fresh=[];let cursor=0;
 async function worker(){
  while(cursor<list.length){
   const p=list[cursor++];
   try{
    const url=new URL(p,base),r=await fetch(url,{headers:{"User-Agent":"BABY-Site-Learning/1.0"}});
    if(!r.ok||!String(r.headers.get("content-type")||"").includes("text/html"))continue;
    const html=await r.text();if(html.length>2000000)continue;
    const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||p;
    fresh.push(...splitChunks(textFromHtml(html),url.href,title.replace(/<[^>]*>/g,"").trim()));
   }catch{}
  }
 }
 await Promise.all(Array.from({length:8},worker));
 chunks=fresh;fs.writeFileSync(INDEX_FILE,JSON.stringify(chunks),"utf8");
 return {pages_scanned:list.length,chunks:chunks.length,indexed_at:new Date().toISOString()};
}
function search(q){
 const terms=String(q||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").split(/[^a-z0-9]+/).filter(x=>x.length>2);
 if(!terms.length)return[];
 return chunks.map(c=>{
  const t=(c.title+" "+c.text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  let score=0;for(const w of terms){let at=0;while((at=t.indexOf(w,at))!==-1){score++;at+=w.length;}}
  return {...c,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(({title,url,text,score})=>({title,url,text,score}));
}
const server=http.createServer(async(req,res)=>{
 if(!cors(req,res))return send(res,403,{error:"origin_not_allowed"});
 if(req.method==="OPTIONS"){res.writeHead(204);return res.end();}
 const u=new URL(req.url,"http://localhost");
 if(u.pathname==="/session"&&req.method==="GET")return send(res,200,{authenticated:valid(req),scope:"crypy-site"});
 if(u.pathname==="/unlock"&&req.method==="POST"){
  const ip=req.socket.remoteAddress||"unknown",now=Date.now(),st=attempts.get(ip)||{count:0,start:now};if(now-st.start>WINDOW_MS){st.count=0;st.start=now;}if(st.count>=MAX_ATTEMPTS)return send(res,429,{error:"rate_limited"});
  let d;try{d=await readBody(req);}catch{return send(res,400,{error:"invalid_request"});}st.count++;attempts.set(ip,st);
  if(typeof d.key!=="string"||!equal(d.key,KEY))return send(res,401,{error:"invalid_key"});
  attempts.delete(ip);const id=crypto.randomBytes(32).toString("hex"),expires=Date.now()+SESSION_MS;sessions.set(id,{expires});
  res.setHeader("Set-Cookie",COOKIE+"="+encodeURIComponent(id+"."+hmac(id+"."+expires))+"; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=1800");
  return send(res,200,{authenticated:true,scope:"crypy-site",expires});
 }
 if(u.pathname==="/lock"&&req.method==="POST"){sessions.delete(getCookie(req).split(".")[0]);res.setHeader("Set-Cookie",COOKIE+"=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0");return send(res,200,{locked:true});}
 if(!valid(req))return send(res,401,{error:"authentication_required"});
 if(u.pathname==="/learn"&&req.method==="POST"){try{return send(res,200,{ok:true,...await learnSite()});}catch(e){return send(res,500,{error:"learning_failed",message:String(e.message||e)});}}
 if(u.pathname==="/search"&&req.method==="POST"){let d;try{d=await readBody(req);}catch{return send(res,400,{error:"invalid_request"});}return send(res,200,{results:search(d.query),indexed_chunks:chunks.length});}
 if(u.pathname==="/learning-status"&&req.method==="GET")return send(res,200,{indexed_chunks:chunks.length,index_exists:chunks.length>0});
 return send(res,404,{error:"not_found"});
});
server.listen(PORT,"0.0.0.0",()=>process.stdout.write("BABY site learning/auth listening on "+PORT+"; index chunks: "+chunks.length+"\\n"));
