/* BABY I.A — MOTOR DE AUTONOMIA V1.0 | baby-core.js
 Arquitetura: INTERFACE <-> PONTE <-> MOTOR <-> HD-MEMÓRIA
 Regra de ouro: o motor NUNCA executa ação fora da lista de autorizações.
 Ele processa regras programadas — não treina rede neural, não tem autonomia ilimitada.
 Uso: <script src="baby-core.js"></script> antes da ponte.
*/
(function(global){
"use strict";
const VERSION="1.0.0";
const DB_KEY="baby_ia_hd_memoria_v1";
const CFG_KEY="baby_ia_autoconfig_v1";

// ---------- AUTO.CONFIG ----------
const DEFAULT_CONFIG={nome:"BABY",idioma:"pt-BR",modo:"aprendiz",autorizacoes:{lerArquivos:true,memorizar:true,recuperar:true,organizar:true,executarAcoesAutorizadas:true,acessarInternet:false,apagarMemoria:false,enviarDadosExternos:false},limites:{maxMemorias:500,maxArquivoKB:512}};
function loadConfig(){try{const c=JSON.parse(localStorage.getItem(CFG_KEY)||"null");return {...structuredClone(DEFAULT_CONFIG),...(c||{}),autorizacoes:{...DEFAULT_CONFIG.autorizacoes,...((c||{}).autorizacoes||{})}};}catch{return structuredClone(DEFAULT_CONFIG);}}
function saveConfig(c){localStorage.setItem(CFG_KEY,JSON.stringify(c));return c;}
let config=loadConfig();

// ---------- HD-MEMÓRIA ----------
function loadMem(){try{return JSON.parse(localStorage.getItem(DB_KEY)||"[]");}catch{return [];}}
function saveMem(m){localStorage.setItem(DB_KEY,JSON.stringify(m.slice(-config.limites.maxMemorias)));return m;}
let memoria=loadMem();
function memorizar({titulo,conteudo,tipo="conhecimento",origem="usuario",tags=[]}){
  if(!config.autorizacoes.memorizar) return {ok:false,erro:"Memorização não autorizada em AUTO.CONFIG"};
  const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),titulo:String(titulo||"Sem título").slice(0,120),conteudo:String(conteudo||"").slice(0,8000),tipo,origem,tags:Array.isArray(tags)?tags:[],data:new Date().toISOString()};
  memoria.push(item); saveMem(memoria); return {ok:true,item,total:memoria.length};
}
function recuperar(termo=""){const q=String(termo||"").toLowerCase().trim(); if(!q) return [...memoria].reverse().slice(0,20);
  return memoria.filter(m=>[m.titulo,m.conteudo,m.tipo,(m.tags||[]).join(" ")].join(" ").toLowerCase().includes(q)).reverse();}
function buscarPorTipo(tipo){return memoria.filter(m=>m.tipo===tipo).reverse();}
function exportarMemoria(){return JSON.stringify({versao:VERSION,exportadoEm:new Date().toISOString(),config:{nome:config.nome,idioma:config.idioma},memoria},null,2);}
function importarMemoria(json){try{const d=JSON.parse(json); const lista=Array.isArray(d)?d:d.memoria; if(!Array.isArray(lista)) throw new Error("Formato inválido"); let n=0; for(const it of lista){ if(it&&it.titulo&&it.conteudo){memoria.push({id:Date.now().toString(36)+n, titulo:String(it.titulo).slice(0,120),conteudo:String(it.conteudo).slice(0,8000),tipo:it.tipo||"conhecimento",origem:it.origem||"importacao",tags:it.tags||[],data:it.data||new Date().toISOString()}); n++;}} saveMem(memoria); return {ok:true,importados:n,total:memoria.length};}catch(e){return {ok:false,erro:e.message};}}
function limparMemoria(){ if(!config.autorizacoes.apagarMemoria) return {ok:false,erro:"Apagar memória exige autorizar em AUTO.CONFIG"}; memoria=[]; saveMem(memoria); return {ok:true};}

// ---------- LER / INTERPRETAR / ORGANIZAR ----------
function detectarTipo(nome="",conteudo=""){const n=nome.toLowerCase(); if(n.endsWith(".html")||conteudo.trim().startsWith("<!DOCTYPE")||conteudo.includes("<html")) return "html"; if(n.endsWith(".json")) return "json"; if(n.endsWith(".txt")||n.endsWith(".md")) return "texto"; return "texto";}
function interpretarArquivo(file){return new Promise((res,rej)=>{ if(!config.autorizacoes.lerArquivos) return rej(new Error("Leitura não autorizada")); if(file.size>config.limites.maxArquivoKB*1024) return rej(new Error("Arquivo acima de "+config.limites.maxArquivoKB+" KB")); const r=new FileReader(); r.onload=()=>{const texto=String(r.result||""); const tipo=detectarTipo(file.name,texto); let titulo=file.name, resumo="", dados=null, duplicado=false;
  try{ if(tipo==="json"){dados=JSON.parse(texto); titulo=dados.titulo||dados.nome||file.name; resumo="JSON com "+Object.keys(dados).length+" chaves.";}
  else if(tipo==="html"){const t=texto.match(/<title>(.*?)<\/title>/i); titulo=t?t[1]:file.name; const semTags=texto.replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); resumo=semTags.slice(0,280);}
  else resumo=texto.slice(0,280);}catch(e){resumo="Não foi possível interpretar: "+e.message;}
  duplicado=memoria.some(m=>m.titulo===titulo&&m.conteudo.slice(0,200)===texto.slice(0,200));
  res({nome:file.name,tamanho:file.size,tipo,titulo,resumo,conteudo:texto,dados,duplicado,data:new Date().toISOString()});}; r.onerror=()=>rej(new Error("Falha ao ler arquivo")); r.readAsText(file);});}
function classificar(texto=""){const t=texto.toLowerCase(); const regras=[["tecnologia",[" ia","inteligência","código","programa","html","javascript"]],["projeto",["projeto","tarefa","prazo","meta"]],["ideia",["ideia","e se","poderia"]],["lembrete",["lembrar","amanhã","não esquecer","reunião"]],["aprendizado",["aprendi","descobri","hoje"]]]; for(const [tipo,palavras] of regras){ if(palavras.some(p=>t.includes(p))) return tipo;} return "conhecimento";}

// ---------- DECISÃO / EXECUÇÃO AUTORIZADA ----------
function decidir(mensagem=""){const m=mensagem.toLowerCase().trim();
  if(/(oi|olá|ola|bom dia|boa tarde|boa noite|e aí|quem é você|quem e voce)/.test(m)) return {intencao:"saudacao",acao:"responder",confianca:0.95};
  if(m.includes("memorize")||m.includes("lembre")||m.includes("salve")||m.includes("guarde")) return {intencao:"memorizar",acao:"memorizar",confianca:0.9};
  if(m.includes("o que você sabe")||m.includes("o que voce sabe")||m.includes("procure")||m.includes("busque")||m.includes("lembra")) return {intencao:"recuperar",acao:"recuperar",confianca:0.9};
  if(m.includes("exportar")||m.includes("baixar memória")||m.includes("baixar memoria")) return {intencao:"exportar",acao:"exportar",confianca:0.95};
  if(m.includes("apagar")||m.includes("esquecer tudo")||m.includes("limpar")) return {intencao:"apagar",acao:"pedir_confirmacao",confianca:0.9};
  if(m.includes("o que você pode")||m.includes("o que voce pode")||m.includes("ajuda")||m.includes("como funciona")) return {intencao:"ajuda",acao:"responder",confianca:0.95};
  if(m.includes("arquitetura")||m.includes("motor")||m.includes("como você aprende")||m.includes("como voce aprende")) return {intencao:"explicar",acao:"responder",confianca:0.9};
  return {intencao:"conversa",acao:"responder",confianca:0.6};}
function executar(decisao, contexto={}){ if(decisao.acao==="memorizar"&&!config.autorizacoes.memorizar) return {ok:false,resposta:"Memorizar está bloqueado em AUTO.CONFIG."}; if(decisao.acao==="exportar"&&!config.autorizacoes.recuperar) return {ok:false,resposta:"Exportar está bloqueado."}; return {ok:true,decisao};}

// ---------- CHATBOT MATRIX ----------
function responder(mensagem=""){const d=decidir(mensagem); const exec=executar(d,{mensagem});
  if(!exec.ok) return {resposta:exec.resposta,decisao:d};
  const limpa=mensagem.replace(/^(memorize|lembre|salve|guarde|procure|busque|o que você sabe sobre|lembra de)\s*/i,"").trim();
  switch(d.intencao){
    case "saudacao": return {decisao:d,resposta:"Oi! Eu sou o BABY I.A 🟢 Estou em modo "+config.modo+". Me diga algo para eu memorizar, ou pergunte o que eu já sei. Ex: «Memorize: o projeto X começa segunda»"};
    case "memorizar": {const r=memorizar({titulo:limpa.slice(0,60)||"Lembrete",conteudo:limpa,tipo:classificar(limpa),origem:"chat"}); return {decisao:d,resposta:r.ok?`Memorizado! 🧠 Tipo: ${classificar(limpa)} • Total na HD-Memória: ${r.total}`:"Não consegui memorizar: "+r.erro};}
    case "recuperar": {const achados=recuperar(limpa); if(!achados.length) return {decisao:d,resposta:`Não achei nada sobre “${limpa}” na HD-Memória ainda. Quer que eu memorize?`}; return {decisao:d,resposta:"Achei "+achados.length+" registro(s):\n\n"+achados.slice(0,3).map((x,i)=>`${i+1}. ${x.titulo} [${x.tipo}] — ${x.conteudo.slice(0,160)}`).join("\n\n"),achados};}
    case "exportar": return {decisao:d,resposta:"Pronto para exportar! Use o botão «Exportar HD-Memória» no painel — ele baixa um JSON com tudo.",acao:"exportar"};
    case "apagar": return {decisao:d,resposta:"⚠️ Apagar tudo está bloqueado por padrão. Ative «apagarMemoria» em AUTO.CONFIG e confirme no painel para prosseguir.",acao:"confirmar_apagar"};
    case "ajuda": return {decisao:d,resposta:"Eu sei fazer 6 coisas: 1 Ler arquivos • 2 Interpretar • 3 Organizar • 4 Memorizar • 5 Recuperar • 6 Aplicar ações autorizadas. Teste: envie um .TXT, .JSON ou .HTML no painel, ou digite «Memorize: ...»"};
    case "explicar": return {decisao:d,resposta:"Minha arquitetura: INTERFACE (esta página) → PONTE (baby-bridge.js) → MOTOR (baby-core.js) → HD-MEMÓRIA (localStorage). Eu sigo regras programadas e autorizações — não treino rede neural aqui e não tenho autonomia ilimitada. Toda ação fora da lista autorizada é bloqueada."};
    default: {const achados=recuperar(mensagem); if(achados.length) return {decisao:d,resposta:`Isso me lembrou: “${achados[0].titulo}” — ${achados[0].conteudo.slice(0,200)}`}; return {decisao:d,resposta:"Entendi! Quer que eu memorize isso? Digite «Memorize: » + o que você disse, ou me pergunte algo que já está na HD-Memória."};}
  }}
function status(){return {versao:VERSION,nome:config.nome,modo:config.modo,memorias:memoria.length,autorizacoes:config.autorizacoes,limites:config.limites};}
global.BabyIA={VERSION,config,getConfig:()=>structuredClone(config),setConfig:(novo)=>{config={...config,...novo,autorizacoes:{...config.autorizacoes,...(novo.autorizacoes||{})}};saveConfig(config);return config;},resetConfig:()=>{config=structuredClone(DEFAULT_CONFIG);saveConfig(config);return config;},memorizar,recuperar,buscarPorTipo,exportarMemoria,importarMemoria,limparMemoria,interpretarArquivo,classificar,decidir,executar,responder,status,getMemoria:()=>[...memoria]};
})(window);
