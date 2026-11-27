/* CRYPY — Mural diário de mensagens programadas do BABY.
 * Três quadros mudam juntos às 00:00 America/Sao_Paulo.
 * Conteúdo editorial pré-programado; não é geração autônoma nem publicação ao vivo.
 */
(function(){
 "use strict";
 if(window.__CRYPY_DAILY_BOARDS__)return;
 window.__CRYPY_DAILY_BOARDS__=true;
 var script=document.currentScript,root=new URL("../../",script&&script.src?script.src:document.baseURI);
 var configUrl=new URL("assets/data/crypy-design-calendar.json",root);
 var fallback=[
  {phrase:"NEXUS conecta; Sensei conduz.",idea:"Escolha uma melhoria visual pequena e mensurável.",tip:"Preserve o conteúdo e teste antes de publicar."},
  {phrase:"Criatividade com método vira construção.",idea:"Experimente uma composição de cartões responsiva.",tip:"Confira contraste, teclado e leitura no celular."},
  {phrase:"Preservar é permitir que o futuro continue.",idea:"Compare a página atual com a referência aprovada.",tip:"Não altere arquivos protegidos sem autorização."}
 ];
 function parts(date){
  var values=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(date),out={};
  values.forEach(function(item){out[item.type]=item.value;});return out;
 }
 function stamp(date){var p=parts(date);return p.year+"-"+p.month+"-"+p.day;}
 function seedFor(date){
  var value=stamp(date),hash=2166136261;
  for(var i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return hash>>>0;
 }
 function indexFor(seed,length,salt){
  var value=(seed^Math.imul(salt+1,0x9e3779b1))>>>0;
  value^=value>>>16;value=Math.imul(value,0x7feb352d);value^=value>>>15;
  return (value>>>0)%length;
 }
 function pick(list,index){return list[((index%list.length)+list.length)%list.length];}
 function mount(messages){
  var existing=document.getElementById("crypy-daily-boards");if(existing)existing.remove();
  var list=messages&&messages.length?messages:fallback;
  var today=new Date(),p=parts(today),seed=seedFor(today),start=indexFor(seed,list.length,2);
  var cards=[
   {label:"01 · SINAL DO DIA",text:pick(list,start).phrase},
   {label:"02 · MISSÃO CRIATIVA",text:pick(list,start+1).idea},
   {label:"03 · CRITÉRIO DE QUALIDADE",text:pick(list,start+2).tip}
  ];
  var host=document.createElement("aside");host.id="crypy-daily-boards";host.setAttribute("aria-label","Mural diário da Colmeia CRYPY");
  var style=document.createElement("style");
  style.textContent="#crypy-daily-boards{position:fixed;left:16px;bottom:16px;z-index:2147482996;width:min(340px,calc(100vw - 100px));font:12px/1.4 system-ui,sans-serif;color:#f2fff8}#crypy-daily-boards *{box-sizing:border-box}#crypy-daily-boards button{font:inherit;cursor:pointer}#crypy-daily-board-toggle{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:9px 12px;border:1px solid var(--crypy-daily-accent,#00ff88);border-radius:12px;background:rgba(3,10,14,.95);color:#fff;font-weight:900;letter-spacing:.06em;box-shadow:0 0 18px color-mix(in srgb,var(--crypy-daily-accent,#00ff88) 28%,transparent)}#crypy-daily-board-toggle span:last-child{color:var(--crypy-daily-accent2,#55f5c7);font-size:10px}#crypy-daily-board-stack{display:grid;gap:7px;margin-bottom:8px;max-height:42vh;overflow:auto}#crypy-daily-boards[data-open=false] #crypy-daily-board-stack{display:none}#crypy-daily-boards[data-open=true] #crypy-daily-board-stack{display:grid}.crypy-daily-board{padding:9px 11px;border:1px solid color-mix(in srgb,var(--crypy-daily-accent,#00ff88) 52%,transparent);border-left:3px solid var(--crypy-daily-accent2,#55f5c7);border-radius:var(--crypy-daily-radius,14px);background:linear-gradient(135deg,rgba(4,13,18,.97),rgba(8,16,25,.95));box-shadow:0 8px 22px #0008,0 0 14px color-mix(in srgb,var(--crypy-daily-accent,#00ff88) 12%,transparent);backdrop-filter:blur(12px)}.crypy-daily-board strong{display:block;margin-bottom:4px;color:var(--crypy-daily-accent,#00ff88);font-size:9px;font-weight:950;letter-spacing:.14em}.crypy-daily-board p{margin:0;color:#f0fff7;font-size:12px}#crypy-daily-board-meta{padding:0 4px;color:var(--crypy-daily-accent3,#d4ff73);font-size:9px;letter-spacing:.09em;text-align:right}@media(max-width:600px){#crypy-daily-boards{left:8px;bottom:10px;width:min(290px,calc(100vw - 88px))}#crypy-daily-board-stack{max-height:34vh;gap:5px}.crypy-daily-board{padding:7px 9px}.crypy-daily-board p{font-size:11px}#crypy-daily-board-toggle{padding:8px 9px;font-size:10px}}@media(prefers-reduced-motion:reduce){#crypy-daily-boards *{animation:none!important;transition:none!important}}";
  var stack=document.createElement("div");stack.id="crypy-daily-board-stack";
  cards.forEach(function(item){
   var card=document.createElement("article");card.className="crypy-daily-board";
   var title=document.createElement("strong");title.textContent=item.label;
   var text=document.createElement("p");text.textContent=item.text;
   card.append(title,text);stack.appendChild(card);
  });
  var meta=document.createElement("div");meta.id="crypy-daily-board-meta";meta.textContent=stamp(today)+" · MENSAGENS PROGRAMADAS DO BABY";
  var toggle=document.createElement("button");toggle.id="crypy-daily-board-toggle";toggle.type="button";toggle.setAttribute("aria-controls",stack.id);
  var title=document.createElement("span");title.textContent="✦ MURAL DIÁRIO · BABY";
  var count=document.createElement("span");count.textContent="3 QUADROS";toggle.append(title,count);
  var mobile=window.matchMedia&&window.matchMedia("(max-width:600px)").matches;
  host.setAttribute("data-open",mobile?"false":"true");toggle.setAttribute("aria-expanded",mobile?"false":"true");
  toggle.addEventListener("click",function(){var open=host.getAttribute("data-open")!=="true";host.setAttribute("data-open",String(open));toggle.setAttribute("aria-expanded",String(open));});
  host.append(style,stack,meta,toggle);document.body.appendChild(host);
 }
 function boot(){
  fetch(configUrl.href,{cache:"no-cache"}).then(function(response){if(!response.ok)throw new Error("HTTP "+response.status);return response.json();})
   .then(function(config){mount(config.dailyMessages);}).catch(function(){mount(fallback);});
 }
 function nextMidnight(){
  var now=new Date(),p=parts(now),seconds=Number(p.hour)*3600+Number(p.minute)*60+Number(p.second);
  return Math.max(1000,(86400-seconds)*1000-now.getMilliseconds()+50);
 }
 function schedule(){
  window.setTimeout(function(){boot();schedule();},nextMidnight());
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
 schedule();
 document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")refresh();});
 window.addEventListener("focus",refresh);
 var lastStamp=stamp(new Date());
 function refresh(){var current=stamp(new Date());if(current!==lastStamp){lastStamp=current;boot();}}
})();
