/* CRYPY BABY AGENT CORE v1.0.1 — initial autonomy, read-only by default. */
(() => {
'use strict';
const VERSION='1.0.1';
const CONFIG={
 agent:'BABY I.A.',project:'CRYPY WEB3.1',
 instructions:['WEB.3.1/Autoconfig.baby','WEB.3.1/INSTRUÇÃO','LEIAME','BABY-AUTO-CONFIG.txt'],
 memory:['HD-MEMORY-BOOST/Manifest.json','HD-MEMORY-BOOST/Memorias.json','HD-MEMORY-BOOST/PADRÃO/Fila-Sync.json'],
 pages:['index.html','BABY-IA-CHATBOT-MATRIX.html','HD BABY I.A.html','HD-MEMÓRIA.html','CRYPY-5-PAGINAS-INTERLIGADAS-touch-corrigido.html'],
 external:['https://www.google.com/','https://www.wikipedia.org/','https://www.binance.com/en/square','mailto:'],
 protected:['HD-MATRIZ/**','HD-MEMORY-BOOST/PADRÃO/HD BABY I.A.html'],bridge:'/api/crypy-agent'
};
const STORE='crypy-baby-agent-log-v1';
const S={phase:'idle',inventory:[],instructions:[],memory:[],plan:[],logs:[]};
const $=s=>document.querySelector(s), stamp=()=>new Date().toISOString();
function persist(){try{localStorage.setItem(STORE,JSON.stringify(S.logs.slice(0,200)))}catch(_){}}
function log(message,type='info'){
 const item={at:stamp(),message:String(message),type}; S.logs.unshift(item); S.logs=S.logs.slice(0,200); persist();
 document.dispatchEvent(new CustomEvent('baby:log',{detail:item}));
 const root=$('#agent-log'); if(root){const d=document.createElement('div');d.className='log '+type;d.textContent=`${new Date(item.at).toLocaleTimeString()} — ${item.message}`;root.prepend(d)}
}
function restoreLogs(){try{const old=JSON.parse(localStorage.getItem(STORE)||'[]');if(Array.isArray(old))S.logs=old.filter(x=>x&&typeof x.message==='string').slice(0,200)}catch(_){S.logs=[]}}
async function read(path,json=false){const r=await fetch(path,{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw Error(`${r.status} ${path}`);const t=await r.text();return json?JSON.parse(t):t}
function parseTxt(text,source){return text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map((content,i)=>({source,line:i+1,content}));}
async function autoRead(){
 S.phase='reading';S.instructions=[];S.memory=[];log('Iniciando autoleitura dos caminhos corrigidos para a raiz do site.');
 const tasks=[...CONFIG.instructions.map(path=>({path,kind:'txt'})),...CONFIG.memory.map(path=>({path,kind:'json'})),...CONFIG.pages.map(path=>({path,kind:'page'}))];
 S.inventory=await Promise.all(tasks.map(async x=>{try{const value=await read(x.path,x.kind==='json');if(x.kind==='txt')S.instructions.push(...parseTxt(value,x.path));if(x.kind==='json')S.memory.push({path:x.path,data:value});return {...x,status:'read',summary:x.kind==='json'?'JSON válido':`${value.length} caracteres`}}catch(e){return {...x,status:'missing-or-blocked',summary:e.message}}}));
 S.phase='read';render();const ok=S.inventory.filter(x=>x.status==='read').length;log(`Autoleitura concluída: ${ok}/${S.inventory.length} recursos acessíveis.`,ok===S.inventory.length?'success':'warn');return S.inventory;
}
function interpret(){
 const missing=S.inventory.filter(x=>x.status!=='read');const findings=[];
 if(missing.length)findings.push({type:'warn',title:'Caminhos ausentes/bloqueados',body:missing.map(x=>`${x.path}: ${x.summary}`).join('\n')});
 findings.push({type:'info',title:'Memória local',body:`${S.memory.length} arquivo(s) JSON lido(s) e validado(s) pelo parser.`},{type:'info',title:'Sincronização remota',body:'Dropbox/GitHub não estão sincronizados por esta console. Exigem backend e OAuth reais.'},{type:'info',title:'HD MATRIZ',body:'Protegido como somente leitura; este módulo não o altera.'},{type:'info',title:'Limites do navegador',body:'Não pode varrer o disco, mover arquivos do repositório ou limpar cache privado/global.'});
 const root=$('#findings');if(root){root.replaceChildren();findings.forEach(f=>{const a=document.createElement('article');a.className='finding '+f.type;const h=document.createElement('b');h.textContent=f.title;const p=document.createElement('pre');p.textContent=f.body;a.append(h,p);root.append(a)})}
 S.phase='interpreted';render();log(`Interpretação concluída: ${findings.length} observações.`,'success');return findings;
}
function plan(){
 S.plan=[['Inventariar caminhos permitidos','read','ready'],['Interpretar TXT e validar JSON','read','ready'],['Verificar rotas internas','read','ready'],['Corrigir código e caminhos','write','backend+aprovação necessários'],['Criar/mover arquivos','write','backend+aprovação necessários'],['Interpretar plugins TXT sem executar código','read','revisão manual'],['Sincronizar GitHub/Dropbox','network-write','OAuth+backend+aprovação'],['Enviar e-mail','external-write','OAuth+prévia+confirmação'],['Limpar CacheStorage próprio','local-write','ação explícita']].map((x,i)=>({id:i+1,action:x[0],mode:x[1],status:x[2]}));
 const root=$('#plan-list');if(root){root.replaceChildren();S.plan.forEach(x=>{const d=document.createElement('div');d.className='row';d.textContent=`${x.action} — ${x.status}`;root.append(d)})}log('Plano gerado. Ações remotas e destrutivas continuam bloqueadas.','success');return S.plan;
}
async function cleanAppCache(){if(!('caches'in window)){log('CacheStorage indisponível.','warn');return}const keys=await caches.keys(),owned=keys.filter(x=>x.startsWith('crypy-baby-'));const results=await Promise.all(owned.map(x=>caches.delete(x)));log(`Caches próprios removidos: ${results.filter(Boolean).length}/${owned.length}. Cache privado/global não foi tocado.`,'success')}
async function bridgeHealth(){try{const r=await fetch(CONFIG.bridge,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'health'})});if(!r.ok)throw Error(`HTTP ${r.status}`);log('Backend respondeu: '+JSON.stringify(await r.json()),'success')}catch(e){log(`Backend não conectado: ${e.message}`,'warn')}}
function openAllowed(url){if(url.startsWith('mailto:')){location.href=url;return}const u=new URL(url);const ok=CONFIG.external.some(x=>x!=='mailto:'&&u.origin===new URL(x).origin&&u.pathname.startsWith(new URL(x).pathname));if(!ok)throw Error('Destino externo não autorizado');window.open(u.href,'_blank','noopener,noreferrer')}
function render(){const s=$('#agent-status');if(s)s.textContent=`BABY ${VERSION} · ${S.phase.toUpperCase()}`;const root=$('#inventory');if(root){root.replaceChildren();S.inventory.forEach(x=>{const d=document.createElement('div');d.className='row';const b=document.createElement('b');b.textContent=x.path;const small=document.createElement('small');small.textContent=`${x.status} · ${x.summary}`;d.append(b,small);root.append(d)})}}
function worldClock(){const zones=[['Paraná','America/Sao_Paulo'],['UTC','UTC'],['Londres','Europe/London'],['Tóquio','Asia/Tokyo']];const root=$('#world-clock');if(!root)return;const update=()=>{root.replaceChildren();zones.forEach(([name,zone])=>{const d=document.createElement('div');d.className='clock-item';const b=document.createElement('b');b.textContent=name;const t=document.createElement('span');try{t.textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())}catch(_){t.textContent='indisponível'}d.append(b,t);root.append(d)})};update();setInterval(update,1000)}
document.addEventListener('DOMContentLoaded',()=>{
 restoreLogs();log('Núcleo carregado. Registro local restaurado quando disponível.');worldClock();
 $('#read')?.addEventListener('click',()=>autoRead());$('#interpret')?.addEventListener('click',interpret);$('#plan')?.addEventListener('click',plan);$('#cache')?.addEventListener('click',cleanAppCache);$('#bridge')?.addEventListener('click',bridgeHealth);
 $('#google')?.addEventListener('click',()=>openAllowed(CONFIG.external[0]));$('#wiki')?.addEventListener('click',()=>openAllowed(CONFIG.external[1]));$('#binance')?.addEventListener('click',()=>openAllowed(CONFIG.external[2]));$('#email')?.addEventListener('click',()=>log('Envio automático exige OAuth, backend, prévia e confirmação. Nenhum e-mail enviado.','warn'));
 if(S.logs.length){const root=$('#agent-log');if(root)S.logs.slice(0,50).reverse().forEach(item=>{const d=document.createElement('div');d.className='log '+(item.type||'info');d.textContent=`${new Date(item.at).toLocaleTimeString()} — ${item.message}`;root.append(d)})}
 autoRead().catch(e=>log(e.message,'error'));
});
window.CRYPY_BABY_AGENT=Object.freeze({version:VERSION,getState:()=>JSON.parse(JSON.stringify(S)),autoRead,interpret,plan,bridgeHealth});
})();
