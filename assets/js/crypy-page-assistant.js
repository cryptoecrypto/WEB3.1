/* CRYPY SQUAD — assistente contextual compartilhado.
 * Pesquisa local no texto visível. Personalidades são roteamento de contexto,
 * não modelos de IA conectados. Não persiste memória nem acessa HDs.
 */
(function(){
"use strict";
if(window.__CRYPY_SQUAD_ASSISTANT__)return;
window.__CRYPY_SQUAD_ASSISTANT__=true;
try{if(window.self!==window.top)return;}catch(_){return;}

/* Os assistentes especializados usam este widget contextual por categoria.
 * O antigo widget global BABY não é carregado aqui; a página original permanece intacta.
 */
var TEAM={
NEXUS:"coordenação e auditoria",BABY:"porta-voz e coordenação central",
DOLA:"arte e criação",MINI:"análise",ALICE:"pesquisa e conhecimento",
ETH:"construção e arquitetura",BTC:"guarda da memória",USDT:"equilíbrio",
CHAT:"revisão histórica e conexão"
};
var PROFILES=[
{key:"crypy-infinyt",name:"NÚCLEO CRYPY",scope:"Universo, identidade, arquitetura e funcionamento do ecossistema",roles:["NEXUS","BABY","BTC"],match:/crypy-infinyt|^\\/$|index\\.html/},
{key:"crypy-academy",name:"ACADEMY",scope:"Ensino, cursos, trilhas e aprendizagem WEB3.1",roles:["ALICE","BABY","ETH"],match:/crypy-academy|academy|curso|aula/},
{key:"esquadrao-das-cores",name:"ESQUADRÃO",scope:"Integrantes, funções, relações e identidade visual",roles:["NEXUS","ALICE","CHAT"],match:/esquadrao-das-cores|esquadrão/},
{key:"nft-collection",name:"NFT COLLECTION",scope:"Coleções, NFTs, arte digital e acervo de tokens",roles:["DOLA","MINI","ALICE"],match:/nft-collection|\\bnft\\b/},
{key:"biografia",name:"BIOGRAFIA",scope:"História, trajetória, linha do tempo e registros biográficos",roles:["CHAT","BTC","ALICE"],match:/biografia|historia|timeline/},
{key:"crypy-news",name:"CRYPY NEWS",scope:"Notícias, comunicados e atualizações do ecossistema",roles:["ALICE","MINI","CHAT"],match:/crypy-news|noticia|news/},
{key:"museu-digital",name:"MUSEU DIGITAL",scope:"Memória, exposições, obras e preservação do acervo",roles:["DOLA","BTC","ALICE"],match:/museu-digital|museu/},
{key:"marketplace",name:"MARKETPLACE",scope:"Catálogo, produtos digitais, ofertas e informações de mercado",roles:["USDT","DOLA","MINI"],match:/art-figure-marketplace|marketplace|marketing/},
{key:"crypy-games",name:"CRYPY GAMES",scope:"Jogos, regras, personagens, fases e desafios",roles:["MINI","ETH","NEXUS"],match:/crypy-games|games|game|desafio/},
{key:"crypykut",name:"CRYPYKUT",scope:"Comunidade, conteúdo social e participação",roles:["CHAT","ALICE","BABY"],match:/social-crypykut|crypykut/},
{key:"crypy-coin",name:"CRYPY COIN",scope:"Utilidade, economia interna, token e fundamentos",roles:["USDT","BTC","MINI"],match:/crypy-coin|coin|token|economia/},
{key:"contato",name:"CONTATO",scope:"Atendimento, dúvidas institucionais e comunicação",roles:["BABY","NEXUS","CHAT"],match:/contato/},
{key:"white-paper",name:"WHITE PAPER",scope:"Documentação, princípios, governança e fundamentos técnicos",roles:["NEXUS","ETH","BTC"],match:/white-paper|white.?paper/}
];
function profileFor(path,title){
var s=(path+" "+title).toLowerCase();
for(var i=0;i<PROFILES.length;i++){if(PROFILES[i].match.test(s))return PROFILES[i];}
return PROFILES[0];
}
function roles(path,title){return profileFor(path,title).roles;}
function el(t,a,v){var n=document.createElement(t);Object.keys(a||{}).forEach(function(k){n.setAttribute(k,a[k]);});if(v!=null)n.textContent=v;return n;}
function norm(s){return s.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function extract(doc){
var b=doc.body;if(!b)return[];var c=b.cloneNode(true);
c.querySelectorAll("script,style,noscript,nav,header,footer,form,button,input,textarea,select,iframe,svg,[aria-hidden=true]").forEach(function(n){n.remove();});
var raw=(c.innerText||c.textContent||"").replace(/\s+/g," ").trim();if(!raw)return[];
var parts=raw.match(/[^.!?]+[.!?]?/g)||[raw],out=[],buf="";
parts.forEach(function(p){p=p.trim();if(!p)return;if(buf&&(buf+" "+p).length>560){out.push(buf);buf=p;}else buf=buf?buf+" "+p:p;});
if(buf)out.push(buf);return out.slice(0,300);
}
function mount(){
if(document.getElementById("crypy-squad-assistant"))return;
var frame=document.querySelector('iframe[name="crypy-content"]');
var page={title:"Página CRYPY",url:location.href,chunks:[]};
var squad=["NEXUS","BABY","BTC"];
var activeProfile=PROFILES[0];
var root=el("aside",{id:"crypy-squad-assistant","aria-label":"Esquadrão CRYPY — assistente contextual"});
var css=el("style");css.textContent=
"#crypy-squad-assistant{position:fixed;left:16px;bottom:16px;z-index:2147483000;font:14px system-ui,sans-serif;color:#eafff2}"+
"#crypy-squad-assistant *{box-sizing:border-box}#csa-open{border:1px solid #00ff88;border-radius:999px;padding:12px 16px;background:#03130a;color:#00ff88;font-weight:900;box-shadow:0 0 18px #00ff8840;cursor:pointer}"+
"#csa-panel{display:none;position:fixed;left:16px;bottom:72px;width:min(410px,calc(100vw - 32px));height:min(560px,calc(100dvh - 100px));background:#020804;border:1px solid #00ff88;border-radius:16px;overflow:hidden;box-shadow:0 18px 60px #000c}"+
"#csa-panel[data-open=true]{display:flex;flex-direction:column}#csa-head{padding:12px;background:#082014;border-bottom:1px solid #175a36}#csa-name{font-weight:900;color:#00ff88}#csa-sub,#csa-team{font-size:10px;color:#a8cfb6;margin-top:5px;line-height:1.4}"+
"#csa-log{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}.csa-msg{max-width:96%;white-space:pre-wrap;overflow-wrap:anywhere;padding:9px 11px;border-radius:11px;font-size:13px;line-height:1.45}.csa-user{align-self:flex-end;background:#00ff88;color:#001b0c}.csa-agent{align-self:flex-start;background:#10251a;color:#eafff2;border:1px solid #1b4c30}.csa-source{display:block;margin-top:7px;color:#8fffc0;font-size:11px}"+
"#csa-form{display:flex;gap:7px;padding:10px;border-top:1px solid #17462b}#csa-query{min-width:0;flex:1;border:1px solid #276542;border-radius:9px;padding:10px;background:#07170e;color:white}#csa-send{border:0;border-radius:9px;padding:0 13px;background:#00ff88;color:#001b0c;font-weight:900}"+
"@media(max-width:600px){#crypy-squad-assistant{left:9px;bottom:9px}#csa-panel{left:8px;bottom:66px;width:calc(100vw - 16px);height:min(68dvh,560px)}}";
var panel=el("div",{id:"csa-panel","data-open":"false"}),head=el("div",{id:"csa-head"});
var name=el("div",{id:"csa-name"},"BABY · Página CRYPY");
var sub=el("div",{id:"csa-sub"},"Preparando contexto local…");
var team=el("div",{id:"csa-team"},"BABY coordena · NEXUS audita");
head.append(name,sub,team);
var log=el("div",{id:"csa-log","aria-live":"polite"}),form=el("form",{id:"csa-form"});
var input=el("input",{id:"csa-query",type:"text",placeholder:"Pergunte sobre esta página…",autocomplete:"off"});
var send=el("button",{id:"csa-send",type:"submit"},"BUSCAR");form.append(input,send);panel.append(head,log,form);
var toggle=el("button",{id:"csa-open",type:"button","aria-expanded":"false"},"✦ ESQUADRÃO CRYPY");
root.append(css,panel,toggle);document.body.appendChild(root);
function add(text,kind,sources){var b=el("div",{class:"csa-msg "+(kind==="user"?"csa-user":"csa-agent")},text);(sources||[]).forEach(function(s){b.appendChild(el("span",{class:"csa-source"},"Fonte: "+s));});log.appendChild(b);log.scrollTop=log.scrollHeight;}
function refreshContext(){
var doc=document, url=location.href;
try{if(frame){doc=frame.contentDocument;url=frame.contentWindow.location.href;if(!doc||!doc.body)throw new Error("frame indisponível");}}
catch(_){page={title:"Conteúdo indisponível",url:url,chunks:[]};squad=["BABY","NEXUS"];name.textContent="BABY · CONTEXTO INDISPONÍVEL";sub.textContent="Não foi possível ler esta página.";team.textContent="Nenhum dado foi enviado.";return;}
page={title:doc.title||"Página CRYPY",url:url,chunks:extract(doc)};
squad=roles(new URL(url).pathname,page.title);
activeProfile=profileFor(new URL(url).pathname,page.title);
name.textContent=activeProfile.name+" · "+page.title;
sub.textContent=activeProfile.scope+" · "+page.chunks.length+" trechos locais";
team.textContent="Perfil: "+activeProfile.name+" | Esquadrão: "+squad.map(function(x){return x+" — "+TEAM[x];}).join(" | ");
log.replaceChildren();
add("Assistente contextual da página. Pesquiso o texto visível e mostro evidências. As personalidades são perfis de contexto, não modelos de IA conectados. Não salvo memória permanente nem envio dados.", "agent");
}
refreshContext();
if(frame)frame.addEventListener("load",refreshContext);
toggle.addEventListener("click",function(){var v=panel.getAttribute("data-open")!=="true";panel.setAttribute("data-open",v?"true":"false");toggle.setAttribute("aria-expanded",v?"true":"false");if(v)input.focus();});
form.addEventListener("submit",function(e){e.preventDefault();var q=input.value.trim();if(!q)return;add(q,"user");input.value="";
var terms=norm(q).match(/[a-z0-9]{2,}/g)||[];
var found=page.chunks.map(function(t,i){var n=norm(t),score=terms.reduce(function(s,x){return s+(n.includes(x)?1:0);},0);return{text:t,index:i,score:score};}).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score||a.index-b.index;}).slice(0,4);
if(!found.length){add("Não encontrei correspondência no texto visível desta página. Isso não significa que o assunto não exista em outra área do CRYPY.","agent");return;}
add(squad.join(" + ")+" · busca local encontrou "+found.length+" trecho(s). Evidência textual, não resposta generativa:","agent");
found.forEach(function(x){add(x.text,"agent",[page.url+" · trecho "+(x.index+1)]);});
});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();