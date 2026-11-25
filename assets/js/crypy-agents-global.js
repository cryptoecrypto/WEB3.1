/* CRYPY — 13 assistentes de página: interface contextual, sem fingir LLM conectado. */
(function(){
"use strict";
if(window.__CRYPY_13_AGENTS_UI__)return;window.__CRYPY_13_AGENTS_UI__=true;
var current=document.currentScript,rootUrl=new URL("../../",current&&current.src?current.src:document.baseURI);
var configUrl=new URL("assets/data/crypy-agents-13.json",rootUrl);
var legacySelectors=["#crypy-baby-global-root","#crypy-baby-global-panel","#topo","#status","#msgs","#espelho","#crypy-baby-global-toggle","#fab","#chatBox","#chatHead","#chatMsgs","#barra","#colmeia-console","#crypy-chatbot","#chatbot","#chatbot-widget","#chat-widget",".chatbot",".chatbot-widget",".chatbot-container",".chat-widget",".baby-chat-widget",".chat-fab",".chat-panel",".chat-launcher"];
function hideLegacy(){
 legacySelectors.forEach(function(sel){try{document.querySelectorAll(sel).forEach(function(el){if(el.id==="crypy-13-agent-root")return;el.hidden=true;el.setAttribute("aria-hidden","true");el.setAttribute("data-crypy-legacy-hidden","true");el.style.setProperty("display","none","important");});}catch(_){}});
 document.querySelectorAll('iframe[src*="chatboot-baby-ia"],iframe[title*="chat" i],iframe[aria-label*="chat" i]').forEach(function(el){el.hidden=true;el.setAttribute("aria-hidden","true");el.setAttribute("data-crypy-legacy-hidden","true");el.style.setProperty("display","none","important");});
}
hideLegacy();
var observer=new MutationObserver(function(){hideLegacy();});observer.observe(document.documentElement,{childList:true,subtree:true});
function currentAgent(cfg){
 var path=location.pathname.toLowerCase();
 var entries=Object.entries(cfg.pageRouting||{});
 for(var i=0;i<entries.length;i++){var target=new URL(entries[i][0],rootUrl).pathname.toLowerCase();if(path===target)return cfg.agents.find(function(a){return a.id===entries[i][1];});}
 var p=path.split("/").filter(Boolean);
 for(var j=0;j<cfg.agents.length;j++){var a=cfg.agents[j];if(a.page&&path.indexOf(a.page.toLowerCase())>=0)return a;}
 return cfg.agents.find(function(a){return a.id==="nexus";})||cfg.agents[0];
}
function node(tag,cls,txt){var el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;}
function pageKnowledge(){var body=document.body?document.body.innerText:"";return (document.title+"\n"+body).replace(/\s+/g," ").slice(0,9000);}
function answerLocally(question,knowledge,agent){
 var words=question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").split(/[^a-z0-9]+/).filter(function(w){return w.length>3;});
 var sentences=knowledge.split(/(?<=[.!?])\s+/).filter(Boolean);
 var scored=sentences.map(function(s){var n=s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");return {s:s,score:words.reduce(function(v,w){return v+(n.indexOf(w)>=0?1:0);},0)};}).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score;});
 if(scored.length)return "Encontrei estes trechos nesta página que podem ajudar:\n\n"+scored.slice(0,3).map(function(x){return "• "+x.s.slice(0,420);}).join("\n\n")+"\n\nSou "+agent.name+" e usei apenas o conteúdo visível desta página. Para uma resposta conversacional completa com IA generativa, ainda é necessário conectar e testar o serviço de modelo.";
 return "Obrigado por perguntar. Não encontrei evidência suficiente sobre isso no conteúdo desta página. Prefiro não inventar uma resposta. Posso orientar pelo tema "+agent.theme+". O atendimento generativo ainda depende da conexão autenticada de um modelo.";
}
function mount(cfg){
 if(document.getElementById("crypy-13-agent-root"))return;
 var agent=currentAgent(cfg);if(!agent)return;
 var knowledge=pageKnowledge();
 var root=node("aside");root.id="crypy-13-agent-root";root.setAttribute("aria-label","Assistente "+agent.name);root.style.setProperty("--agent-color",agent.color);
 var style=node("style");style.textContent=`
 #crypy-13-agent-root{position:fixed;right:18px;bottom:18px;z-index:2147483002;font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:#effff7}
 #crypy-13-agent-root *{box-sizing:border-box}
 #crypy-agent-launch{width:66px;height:66px;border-radius:50%;border:2px solid var(--agent-color);background:radial-gradient(circle at 35% 25%,color-mix(in srgb,var(--agent-color) 40%,#07140f),#020706 70%);color:#fff;font-size:27px;cursor:pointer;box-shadow:0 0 0 4px #0008,0 0 25px color-mix(in srgb,var(--agent-color) 65%,transparent);display:grid;place-items:center;position:relative}
 #crypy-agent-launch:after{content:"";position:absolute;inset:-5px;border:1px solid color-mix(in srgb,var(--agent-color) 50%,transparent);border-radius:50%;animation:crypyAgentPulse 3s ease-in-out infinite}
 @keyframes crypyAgentPulse{50%{transform:scale(1.12);opacity:.25}}
 #crypy-agent-panel{display:none;position:absolute;right:0;bottom:80px;width:min(390px,calc(100vw - 24px));max-height:min(76vh,650px);overflow:hidden;border:1px solid var(--agent-color);border-radius:20px;background:linear-gradient(145deg,#071713f7,#080d18f8 70%,#100d1bfa);box-shadow:0 20px 60px #000d,0 0 28px color-mix(in srgb,var(--agent-color) 20%,transparent);backdrop-filter:blur(18px)}
 #crypy-13-agent-root[data-open="true"] #crypy-agent-panel{display:flex;flex-direction:column;animation:crypyAgentIn .22s ease-out}
 @keyframes crypyAgentIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
 .crypy-agent-head{display:flex;gap:10px;align-items:center;padding:13px;border-bottom:1px solid color-mix(in srgb,var(--agent-color) 45%,#18302a)}
 .crypy-agent-avatar{width:43px;height:43px;flex:none;display:grid;place-items:center;border:1px solid var(--agent-color);border-radius:50%;background:#081a16;font-size:22px;box-shadow:0 0 15px color-mix(in srgb,var(--agent-color) 35%,transparent)}
 .crypy-agent-title{min-width:0;flex:1}.crypy-agent-title strong{display:block;color:var(--agent-color);letter-spacing:.08em}.crypy-agent-title small{display:block;color:#b6d5ca;font-size:11px}
 .crypy-agent-close{border:1px solid #426257;background:#0b211b;color:#fff;border-radius:9px;width:34px;height:34px;cursor:pointer}
 .crypy-agent-body{padding:14px;overflow:auto}.crypy-agent-body p{margin:0 0 10px}.crypy-agent-theme{color:var(--agent-color);font-size:11px;font-weight:800;letter-spacing:.08em}.crypy-agent-greeting{font-size:14px;color:#f4fff9}
 .crypy-agent-status{font-size:10px;color:#b2c8bf;border:1px solid #29483e;border-radius:9px;padding:8px;margin:10px 0;background:#07120f}
 .crypy-agent-prompts{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.crypy-agent-prompts button{border:1px solid color-mix(in srgb,var(--agent-color) 55%,#29483e);background:#0b211b;color:#eafff5;border-radius:999px;padding:7px 9px;font-size:11px;cursor:pointer}
 .crypy-agent-log{max-height:190px;overflow:auto;border-top:1px solid #274338;padding-top:10px;margin-top:10px;font-size:12px;white-space:pre-wrap}.crypy-agent-log .user{color:var(--agent-color);margin:8px 0}.crypy-agent-log .reply{color:#e5f4ed;margin:8px 0}
 .crypy-agent-form{display:flex;gap:7px;padding:10px;border-top:1px solid #274338}.crypy-agent-form textarea{min-width:0;flex:1;resize:vertical;min-height:42px;max-height:90px;border:1px solid #35594c;border-radius:10px;background:#020b08;color:#fff;padding:9px;font:13px system-ui}.crypy-agent-form button{border:0;border-radius:10px;background:var(--agent-color);color:#08110d;font-weight:900;padding:0 13px;cursor:pointer}
 @media(max-width:600px){#crypy-13-agent-root{right:12px;bottom:12px}#crypy-agent-launch{width:58px;height:58px}#crypy-agent-panel{right:0;bottom:70px;width:calc(100vw - 24px);max-height:72vh}}
 @media(prefers-reduced-motion:reduce){#crypy-agent-launch:after{animation:none!important}#crypy-agent-panel{animation:none!important}}
 `;
 var launch=node("button");launch.id="crypy-agent-launch";launch.type="button";launch.textContent=agent.emoji;launch.title="Conversar com "+agent.name;launch.setAttribute("aria-label","Abrir assistente "+agent.name);launch.setAttribute("aria-expanded","false");
 var panel=node("section");panel.id="crypy-agent-panel";panel.setAttribute("aria-label","Atendimento "+agent.name);
 var head=node("header","crypy-agent-head");var avatar=node("div","crypy-agent-avatar",agent.emoji);var title=node("div","crypy-agent-title");title.append(node("strong","",agent.name),node("small","",agent.role));var close=node("button","crypy-agent-close","×");close.type="button";close.setAttribute("aria-label","Fechar atendimento");head.append(avatar,title,close);
 var body=node("div","crypy-agent-body");body.append(node("div","crypy-agent-theme",agent.theme.toUpperCase()),node("p","crypy-agent-greeting",agent.greeting),node("div","crypy-agent-status","BASE LOCAL: conteúdo visível desta página. IA generativa e treinamento de modelo ainda não conectados."));
 var prompts=node("div","crypy-agent-prompts");agent.prompts.forEach(function(q){var b=node("button","",q);b.type="button";b.addEventListener("click",function(){ask(q);});prompts.appendChild(b);});body.appendChild(prompts);
 var log=node("div","crypy-agent-log");log.setAttribute("aria-live","polite");body.appendChild(log);
 var form=node("form","crypy-agent-form");var input=node("textarea");input.placeholder="Escreva sua pergunta...";input.setAttribute("aria-label","Sua pergunta");var send=node("button","","Enviar");send.type="submit";form.append(input,send);
 function ask(q){if(!q.trim())return;var u=node("div","user","Você: "+q);var a=node("div","reply",agent.name+": "+answerLocally(q,knowledge,agent));log.append(u,a);log.scrollTop=log.scrollHeight;input.value="";}
 form.addEventListener("submit",function(e){e.preventDefault();ask(input.value);});
 panel.append(head,body,form);root.append(style,panel,launch);document.body.appendChild(root);
 function setOpen(open){root.setAttribute("data-open",String(open));launch.setAttribute("aria-expanded",String(open));if(open)input.focus();}
 launch.addEventListener("click",function(){setOpen(root.getAttribute("data-open")!=="true");});close.addEventListener("click",function(){setOpen(false);});
 document.addEventListener("keydown",function(e){if(e.key==="Escape")setOpen(false);});
}
fetch(configUrl.href,{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}).then(mount).catch(function(e){console.error("[CRYPY agents] profile load failed",e);});
})();