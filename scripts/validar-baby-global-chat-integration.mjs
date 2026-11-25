import fs from "node:fs";import path from "node:path";
const read=p=>fs.readFileSync(path.join(process.cwd(),p),"utf8"),errors=[];
const bridge=read("assets/js/crypy-page-assistant.js"),runtime=read("assets/js/crypy-global-runtime.js"),widget=read("assets/js/crypy-agents-global.js");
const cfg=JSON.parse(read("assets/data/crypy-agents-13.json")),legacy=read("assets/js/baby-global-chat.js"),registry=JSON.parse(read("CRYPY-13-CHATBOOTS/colmeia-integral/registry-15.json"));
const pages=[["crypy-infinyt/portal.html","cosmos"],["crypy-academy/academia.html","alice"],["esquadrao-das-cores/esquadrao.html","dola"],["nft-collection/galeria.html","crypy-coin"],["biografia/historia.html","chat"],["crypy-news/index.html","bnb"],["crypy-news/museu.html","svt"],["art-figure-marketplace/marketplace.html","icp"],["crypy-games-desafios/crypy-games-desafios.html","shiba-inu"],["social-crypykut/comunidade.html","mini"],["baby-ia/centro.html","nexus"],["crypy-coin/white-paper.html","union"],["contato/contato-oficial.html","hera"]];
if(!bridge.includes("crypy-global-runtime.js"))errors.push("ponte não encaminha ao runtime global");
if(!runtime.includes("assets/js/crypy-agents-global.js"))errors.push("runtime não carrega a interface dos 13 agentes");
if(runtime.includes("assets/js/baby-global-chat.js"))errors.push("runtime ainda carrega o widget BABY legado");
if(!widget.includes("MutationObserver"))errors.push("ocultação contínua de widgets antigos ausente");
["#crypy-baby-global-root","#fab","#chatBox","#barra","#topo","#status","#msgs"].forEach(s=>{if(!widget.includes(s))errors.push("seletor legado ausente: "+s);});
if(!widget.includes("pageKnowledge()"))errors.push("captura contextual local ausente");
if(cfg.agents.length!==13||new Set(cfg.agents.map(a=>a.id)).size!==13)errors.push("roster precisa ter 13 IDs únicos");
if(new Set(cfg.agents.map(a=>a.color)).size!==13)errors.push("as 13 cores precisam ser distintas");
if(Object.keys(cfg.pageRouting).length!==13)errors.push("roteamento não cobre 13 páginas");
for(const [p,id] of pages){if(cfg.pageRouting[p]!==id)errors.push("rota incorreta: "+p);if(!read(p).includes("assets/js/crypy-global-nav.js"))errors.push("menu global ausente: "+p);}
if(cfg.core?.id!=="baby"||cfg.defense?.id!=="lucy")errors.push("BABY/LUCY precisam permanecer separados");
if(!cfg.humanization?.principles?.includes("admitir incerteza e não inventar fatos"))errors.push("regra de transparência ausente");
if(!cfg.humanization?.trainingStatus?.includes("not_model_training"))errors.push("treinamento real não declarado como pendente");
const official=registry.members.filter(x=>x.group==="official_13"),core=registry.members.filter(x=>x.group==="separate_core"),defense=registry.members.filter(x=>x.group==="separate_defense");
if(official.length!==13||core.length!==1||core[0]?.id!=="baby"||defense.length!==1||defense[0]?.id!=="lucy")errors.push("registro 13 + BABY + LUCY divergente");
if(errors.length){console.error("FALHA — CRYPY 13 agentes");errors.forEach(x=>console.error("- "+x));process.exitCode=1;}
else{console.log("OK — 13 perfis, cores distintas e 13 rotas oficiais.");console.log("OK — BABY e LUCY separados.");console.log("OK — runtime novo e ocultação de interfaces legadas conhecidas.");console.log("LIMITE — não prova treinamento, modelo generativo, ingestão integral ou produção.");}