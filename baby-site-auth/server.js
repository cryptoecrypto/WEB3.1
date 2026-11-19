// BABY I.A. — autenticação server-side exclusiva do site CRYPY.
// Node.js >=20, sem dependências. Configure BABY_SITE_KEY e BABY_SITE_ORIGIN
// como variáveis de ambiente no serviço HTTPS. Nunca commite segredos.
import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.PORT || 8787);
const KEY = process.env.BABY_SITE_KEY || "";
const ORIGIN = process.env.BABY_SITE_ORIGIN || "";
const COOKIE = "baby_site_session";
const sessions = new Map();
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const SESSION_MS = 30 * 60 * 1000;

if (KEY.length < 16) throw new Error("BABY_SITE_KEY precisa ter pelo menos 16 caracteres.");
if (!ORIGIN.startsWith("https://")) throw new Error("BABY_SITE_ORIGIN precisa ser uma origem HTTPS exata.");

const hmac = value => crypto.createHmac("sha256", KEY).update(value).digest("hex");
const safeEqual = (a,b) => {
  const x=Buffer.from(String(a)), y=Buffer.from(String(b));
  return x.length===y.length && crypto.timingSafeEqual(x,y);
};
function send(res, code, data, extra={}) {
  res.writeHead(code, {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra});
  res.end(JSON.stringify(data));
}
function cookie(req) {
  const raw=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));
  return raw ? decodeURIComponent(raw.slice(COOKIE.length+1)) : "";
}
function validSession(req) {
  const [id,sig]=cookie(req).split(".");
  const row=sessions.get(id);
  if(!row || !sig || row.expires<Date.now() || !safeEqual(sig,hmac(id+"."+row.expires))) return false;
  return true;
}
function cors(req,res) {
  const origin=req.headers.origin;
  if(origin !== ORIGIN) return false;
  res.setHeader("Access-Control-Allow-Origin", ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials","true");
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  return true;
}
async function body(req) {
  let s="";
  for await (const chunk of req) { s+=chunk; if(s.length>4096) throw new Error("body too large"); }
  return JSON.parse(s||"{}");
}
const server=http.createServer(async(req,res)=>{
  if(!cors(req,res)) return send(res,403,{error:"origin_not_allowed"});
  if(req.method==="OPTIONS"){res.writeHead(204);return res.end();}
  const url=new URL(req.url,"http://localhost");
  if(url.pathname==="/session" && req.method==="GET")
    return send(res,200,{authenticated:validSession(req),scope:"crypy-site"});
  if(url.pathname==="/lock" && req.method==="POST"){
    const id=cookie(req).split(".")[0]; sessions.delete(id);
    res.setHeader("Set-Cookie",COOKIE+"=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0");
    return send(res,200,{locked:true});
  }
  if(url.pathname==="/unlock" && req.method==="POST"){
    const ip=req.socket.remoteAddress||"unknown";
    const now=Date.now(), state=attempts.get(ip)||{count:0,start:now};
    if(now-state.start>WINDOW_MS){state.count=0;state.start=now;}
    if(state.count>=MAX_ATTEMPTS) return send(res,429,{error:"rate_limited"});
    let data; try{data=await body(req);}catch{return send(res,400,{error:"invalid_request"});}
    state.count++; attempts.set(ip,state);
    if(typeof data.key!=="string" || !safeEqual(data.key,KEY)) return send(res,401,{error:"invalid_key"});
    attempts.delete(ip);
    const id=crypto.randomBytes(32).toString("hex"), expires=Date.now()+SESSION_MS;
    sessions.set(id,{expires});
    const sig=hmac(id+"."+expires);
    res.setHeader("Set-Cookie",COOKIE+"="+encodeURIComponent(id+"."+sig)+"; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=1800");
    return send(res,200,{authenticated:true,scope:"crypy-site",expires});
  }
  return send(res,404,{error:"not_found"});
});
server.listen(PORT,"0.0.0.0",()=>process.stdout.write("BABY site auth listening on "+PORT+"\n"));
