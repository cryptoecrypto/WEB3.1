/* BABY I.A — ponte autenticada com CRYPY SERVER.
 * O token fica apenas em sessionStorage (sessão atual do navegador).
 * /health é público; endpoints /api/* exigem CRYPY_API_TOKEN.
 */
(function(){
"use strict";
if(document.getElementById("baby-server-fab")) return;
const css=document.createElement("style");
css.textContent=`
#baby-server-fab{position:fixed;left:18px;bottom:18px;z-index:10000;background:#07150d;color:#00ff88;border:1px solid #00ff88;border-radius:999px;padding:12px 16px;font-weight:800;cursor:pointer;box-shadow:0 8px 28px #0009}
#baby-server-panel{position:fixed;left:18px;bottom:72px;z-index:10000;width:min(390px,calc(100vw - 36px));max-height:75vh;overflow:auto;background:#07150d;color:#eafff3;border:1px solid #00ff88;border-radius:16px;padding:15px;font:13px/1.5 Arial;display:none;box-shadow:0 14px 40px #000b}
#baby-server-panel h3{color:#00ff88;margin:0 0 8px}#baby-server-panel label{display:block;margin:8px 0 4px;color:#a7c9b6}
#baby-server-panel input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #24543a;border-radius:8px;background:#020805;color:#eafff3}
#baby-server-panel button{padding:9px 12px;border:1px solid #00ff88;border-radius:8px;background:#0b2a19;color:#00ff88;cursor:pointer;margin:8px 6px 0 0}
#baby-server-result{white-space:pre-wrap;word-break:break-word;background:#020805;border:1px solid #1c3b2a;border-radius:8px;padding:10px;margin-top:10px;max-height:220px;overflow:auto}
`;
document.head.appendChild(css);
const fab=document.createElement("button");fab.id="baby-server-fab";fab.textContent="◉ CRYPY SERVER";document.body.appendChild(fab);
const panel=document.createElement("div");panel.id="baby-server-panel";
panel.innerHTML='<h3>BABY I.A · conexão com o núcleo</h3><label>URL pública HTTPS do servidor</label><input id="baby-server-url" type="url" placeholder="https://seu-servico.onrender.com"><label>Token de acesso da API</label><input id="baby-server-token" type="password" autocomplete="off" placeholder="Token configurado no host"><button id="baby-server-save">Salvar nesta sessão</button><button id="baby-server-test">Testar conexão</button><div id="baby-server-result">Aguardando configuração. O token fica somente nesta sessão do navegador.</div>';
document.body.appendChild(panel);
const $=s=>panel.querySelector(s), result=$("#baby-server-result");
$("#baby-server-url").value=localStorage.getItem("crypy_server_url")||"https://baby-site-auth-production.up.railway.app";
$("#baby-server-token").value=sessionStorage.getItem("crypy_server_token")||"";
fab.addEventListener("click",()=>panel.style.display=panel.style.display==="block"?"none":"block");
$("#baby-server-save").addEventListener("click",()=>{
 const u=$("#baby-server-url").value.trim().replace(/\/+$/,""),t=$("#baby-server-token").value.trim();
 if(!/^https:\/\//i.test(u)){result.textContent="Informe uma URL HTTPS válida.";return;}
 localStorage.setItem("crypy_server_url",u);
 if(t)sessionStorage.setItem("crypy_server_token",t);else sessionStorage.removeItem("crypy_server_token");
 result.textContent="Endereço salvo. Token guardado apenas na sessão atual.";
});
$("#baby-server-test").addEventListener("click",async()=>{
 const u=$("#baby-server-url").value.trim().replace(/\/+$/,""),t=$("#baby-server-token").value.trim();
 if(!/^https:\/\//i.test(u)){result.textContent="Informe a URL HTTPS do servidor.";return;}
 if(!t){result.textContent="Informe o token de API.";return;}
 result.textContent="Testando /health…";
 try{
  const h=await fetch(u+"/health",{cache:"no-store"});const hj=await h.json();
  if(!h.ok||hj.ok!==true)throw new Error("Health-check não aprovado: HTTP "+h.status);
  result.textContent="HEALTH OK. Testando API autenticada…";
  const a=await fetch(u+"/api/status",{headers:{Authorization:"Bearer "+t},cache:"no-store"});
  const aj=await a.json();
  if(!a.ok)throw new Error("API não autorizada: HTTP "+a.status+" — "+(aj.reason||aj.code||""));
  const caps=Array.isArray(aj.capabilities)?aj.capabilities.length:0;
  result.textContent="CONEXÃO CONFIRMADA\nServidor: "+u+"\nVersão BABY: "+(aj.version||hj.version||"—")+"\nCapacidades: "+caps+"\nAuditoria: "+(aj.live?.audit?.ok?"íntegra":"verificar")+
   "\nCofre: "+(aj.live?.vault?.ok?"verificado":"sem verificação")+
   "\n\n"+JSON.stringify({health:hj,api:{version:aj.version,startedAt:aj.startedAt,capabilities:aj.capabilities?.map(c=>({id:c.id,title:c.title,state:c.state})),adapters:aj.adapters}},null,2);
  sessionStorage.setItem("crypy_server_token",t);localStorage.setItem("crypy_server_url",u);
 }catch(e){result.textContent="FALHA NA CONEXÃO\n"+e.message+"\nVerifique HTTPS, CRYPY_ALLOWED_ORIGINS e o token configurado no host.";}
});
})();