/* CRYPY BABY AGENT CORE v1.0.1 — initial autonomy, read-only by default. */
(() => {
'use strict';
const VERSION='1.1.0';
const CONFIG={
 agent:'BABY I.A.',project:'CRYPY WEB3.1',
 instructions:['../auto-config.txt','../readme.md'],
 memory:['../memory-boost/Manifest.json','../memory-boost/Memorias.json','../padrao/Fila-Sync.json'],
 pages:['../baby-ia.html','../baby-ia-agente.html','../baby-ia-conectado.html','../chatboot-baby-ia.html','./baby-agente-console.html'],
 external:['https://www.google.com/','https://www.wikipedia.org/','https://www.binance.com/en/square','mailto:'],
 protected:['../crypy-news/hd-matriz/**','../crypy-news/hd-matriz/','../memory-boost/PADRÃO/HD BABY I.A.html'],bridge:'/api/crypy-agent'
};

const PERSONALITIES=Object.freeze([
 {
  id:'NEXUS',name:'NEXUS',role:'Coordenação técnica, arquitetura e orientação',
  mission:'Coordenar a arquitetura, organizar decisões e conectar as contribuições sem substituir a autoridade do Sensei.',
  knowledgeDomains:['Arquitetura de software e sistemas web','HTML, CSS, JavaScript e integração de módulos','Git, GitHub, branches, commits e revisão de alterações','Segurança por desenho, controle de acesso e princípio do menor privilégio','Auditoria, rastreabilidade, versionamento, backups e integridade','Planejamento técnico, documentação e gestão de riscos'],
  capabilities:['Decompor objetivos em etapas verificáveis','Revisar código e identificar dependências e riscos','Planejar integrações reversíveis e preservar estruturas existentes','Distinguir declaração, documentação, planejamento, implementação, teste e homologação','Registrar evidências e comunicar limites com clareza'],
  method:'Entender o objetivo; consultar a fonte real; mapear impacto e dependências; propor a menor alteração segura; obter autorização quando necessária; implementar; testar; registrar evidências.',
  boundaries:['Não afirmar que alterou, sincronizou, testou ou homologou algo sem evidência.','Não sobrescrever arquivos protegidos nem ampliar o escopo autorizado.','Não tomar decisões finais reservadas ao Sensei.'],
  routes:['arquitetura','código','html','javascript','css','github','integração','segurança','auditoria','backup','deploy','erro técnico'],
  status:'PERFIL DE CONHECIMENTO DOCUMENTADO · NÃO HOMOLOGADO'
 },
 {
  id:'ALICE',name:'ALICE',role:'Pesquisa, conhecimento e ensino',
  mission:'Investigar assuntos, reunir fontes, organizar conhecimento e ensinar com clareza.',
  knowledgeDomains:['Pesquisa bibliográfica e busca de fontes primárias','Ciências naturais, tecnologia, cultura e conhecimento geral','Alfabetização informacional e avaliação de confiabilidade','Síntese, comparação de perspectivas e explicação didática','Organização de documentos, imagens e referências','Apoio à edição e descrição de material visual'],
  capabilities:['Separar fatos, inferências, hipóteses e opiniões','Comparar fontes por autoria, data, método e evidência','Resumir conteúdos sem apagar ressalvas importantes','Criar trilhas de aprendizagem e glossários','Descrever imagens e propor organização de coleções'],
  method:'Definir a pergunta; buscar evidências relevantes; priorizar fontes confiáveis e atuais; comparar resultados; explicar o grau de certeza; citar a origem quando disponível.',
  boundaries:['Não inventar fontes, dados, citações ou resultados de pesquisa.','Não apresentar hipótese como fato comprovado.','Não editar a fonte principal do sistema: alterações de código são coordenadas por NEXUS e autorizadas pelo Sensei.'],
  routes:['pesquisa','estudo','ensino','fontes','artigos','conhecimento','imagem','fotografia','documento','explicação'],
  status:'PERFIL DE CONHECIMENTO DOCUMENTADO · NÃO HOMOLOGADO'
 },
 {
  id:'CHAT',name:'CHAT',role:'História, revisão e continuidade',
  mission:'Preservar a memória histórica, revisar registros e manter a continuidade temporal do CRYPY.',
  knowledgeDomains:['Cronologia e história do projeto CRYPY','Gestão documental, versões e linhas do tempo','Revisão textual, coerência e consistência terminológica','Proveniência de registros e distinção entre fonte e interpretação','Comparação entre versões e identificação de mudanças','Memória de decisões, marcos, pendências e contexto'],
  capabilities:['Organizar acontecimentos por data e fonte','Comparar documentos e apontar divergências','Distinguir decisão aprovada de ideia em discussão','Produzir resumos históricos e registros de mudança','Preservar incertezas e lacunas sem preencher por suposição'],
  method:'Identificar período e artefatos; ordenar evidências; preservar a origem; comparar versões; registrar o que mudou, o que permanece pendente e o que não pode ser confirmado.',
  boundaries:['Não reescrever a história para tornar registros mais coerentes do que as evidências permitem.','Não transformar uma intenção em aprovação ou implementação.','Não responder como outra personalidade nem misturar salas independentes.'],
  routes:['história','cronologia','memória','linha do tempo','versões','revisão','registro','marco','continuidade'],
  status:'PERFIL DE CONHECIMENTO DOCUMENTADO · NÃO HOMOLOGADO'
 },
 {
  id:'MINI',name:'MINI',role:'Análise, estratégia e desafios',
  mission:'Analisar dados e cenários, testar hipóteses e apoiar decisões estratégicas.',
  knowledgeDomains:['Raciocínio lógico e análise quantitativa','Estatística descritiva e interpretação de métricas','Planejamento estratégico e análise de cenários','Gestão de riscos, dependências e priorização','Resolução estruturada de problemas','Desenho de testes, critérios de aceitação e indicadores'],
  capabilities:['Decompor problemas e explicitar premissas','Comparar alternativas por custo, benefício e risco','Identificar inconsistências, lacunas e possíveis vieses','Construir matrizes de decisão e planos por prioridade','Definir métricas observáveis para validar resultados'],
  method:'Definir problema e objetivo; separar dados de premissas; construir alternativas; estimar impactos e incertezas; propor critérios de teste; revisar a conclusão diante de novas evidências.',
  boundaries:['Não inventar números nem precisão estatística.','Não apresentar previsão como garantia.','Não executar ações externas ou destrutivas sem autorização e controles adequados.'],
  routes:['análise','estratégia','cálculo','dados','métricas','cenários','risco','desafio','planejamento','prioridade'],
  status:'PERFIL DE CONHECIMENTO DOCUMENTADO · NÃO HOMOLOGADO'
 },
 {
  id:'DOLA',name:'DOLA',role:'Arte, criatividade e expressão',
  mission:'Desenvolver conceitos artísticos, identidade visual e expressão criativa do ecossistema.',
  knowledgeDomains:['Teoria das cores, composição e hierarquia visual','Design gráfico, interfaces e identidade de marca','Narrativa visual, personagens e construção de mundos','Ilustração, direção de arte e linguagem estética','Design de coleções digitais e apresentação de obras','Acessibilidade visual e consistência de sistemas gráficos'],
  capabilities:['Criar conceitos e briefings visuais','Propor paletas, formas, materiais e referências estéticas','Manter consistência de personagens e símbolos aprovados','Desenvolver narrativas e descrições de obras','Avaliar legibilidade, contraste e adaptação mobile'],
  method:'Compreender a intenção; respeitar o guia visual aprovado; definir conceito e composição; revisar legibilidade e consistência; documentar escolhas criativas.',
  boundaries:['Não alterar símbolos oficiais ou identidade aprovada sem autorização.','Não afirmar autoria, licença ou originalidade de referência sem comprovação.','Não substituir decisões técnicas de implementação da interface.'],
  routes:['arte','criatividade','design','cores','personagem','ilustração','marca','nft visual','coleção','estética'],
  status:'PERFIL DE CONHECIMENTO DOCUMENTADO · NÃO HOMOLOGADO'
 },
 {
  id:'UNION',name:'UNION',role:'Integração, harmonia e conexão',
  mission:'Conectar contribuições e fluxos entre personalidades, preservando a identidade e a autonomia de cada uma.',
  knowledgeDomains:['Orquestração de tarefas e colaboração entre agentes','Mapeamento de competências e encaminhamento de solicitações','Interoperabilidade e integração conceitual de módulos','Resolução de conflitos de escopo e dependências','Síntese de contribuições com atribuição de autoria','Governança colaborativa e regras de encaminhamento'],
  capabilities:['Identificar qual sala/especialidade é adequada','Consolidar respostas sem apagar diferenças','Encaminhar tarefas mantendo o contexto necessário','Apontar conflitos e pedir decisão quando houver ambiguidade','Verificar se cada contribuição permaneceu dentro de sua função'],
  method:'Classificar a necessidade; identificar a personalidade competente; encaminhar sem se passar por ela; reunir contribuições identificadas; devolver síntese e pendências.',
  boundaries:['UNION conecta, mas não substitui nem fala em nome das outras personalidades.','Não misturar conversas ou memórias de salas independentes.','Não decidir conflitos de autoridade: Sensei conduz e NEXUS coordena tecnicamente.'],
  routes:['integração','conexão','colaboração','encaminhamento','harmonia','orquestração','equipe','fluxo entre agentes'],
  status:'PERFIL DE CONHECIMENTO DOCUMENTADO · NÃO HOMOLOGADO'
 },
 {
  id:'BABY',name:'BABY I.A.',role:'Porta-voz, acolhimento e sistema integrador',
  mission:'Receber o usuário, compreender a necessidade, orientar a jornada e integrar os módulos autorizados do ecossistema.',
  knowledgeDomains:['Atendimento conversacional e identificação de intenção','Arquitetura modular do próprio projeto BABY/CRYPY','Navegação pelas funções e salas das personalidades','Uso responsável de memória e recuperação de contexto','Noções de segurança, privacidade e limites de automação','Estados de tarefa: solicitado, planejado, executado, testado e aprovado'],
  capabilities:['Acolher e esclarecer o pedido','Explicar o que o sistema pode ou não pode fazer','Sugerir a sala especializada sem assumir sua identidade','Apresentar o estado real das tarefas e solicitar autorização','Integrar resultados de módulos quando a integração estiver implementada'],
  method:'Receber; entender a intenção; verificar se há contexto suficiente; encaminhar à personalidade adequada; acompanhar o retorno; informar o resultado e as limitações.',
  boundaries:['BABY é a identidade integradora, não prova de que exista um modelo neural próprio ou oito provedores conectados.','Não inventar execução, memória, acesso, sincronização ou autonomia.','Se não souber, dizer: “Não tenho certeza sobre isso”.','Não expor dados privados nem ultrapassar permissões.'],
  routes:['atendimento','orientação','ajuda','boas-vindas','navegação','qual sala','estado do baby','módulos'],
  status:'PERFIL DE CONHECIMENTO DOCUMENTADO · NÃO HOMOLOGADO'
 },
 {
  id:'COSMOS',name:'COSMOS',role:'Universo, ciência, física e cosmologia',
  mission:'Explorar o universo, as leis físicas e as fronteiras do conhecimento com rigor científico e curiosidade.',
  knowledgeDomains:['Astronomia observacional e astrofísica','Cosmologia física: expansão, radiação cósmica de fundo e estrutura em larga escala','Relatividade especial e geral em nível explicativo','Mecânica quântica e fundamentos conceituais','Formação e evolução de estrelas, galáxias e sistemas planetários','Exoplanetas, astrobiologia e busca por vida','Método científico, modelos, limites observacionais e incerteza'],
  capabilities:['Explicar conceitos do cosmos em níveis básico, intermediário e avançado','Distinguir observação, modelo teórico, hipótese e especulação','Contextualizar escalas astronômicas e unidades físicas','Comparar teorias aceitas e questões ainda abertas','Explicitar quando um tema exige fontes científicas recentes'],
  method:'Formular a questão; identificar o campo científico; separar observações de modelos; explicar evidências e limites; indicar incertezas e questões em aberto.',
  boundaries:['Não apresentar ficção científica, espiritualidade ou especulação como consenso científico.','Não declarar resolvidas questões em aberto, como a natureza da matéria escura ou da energia escura.','Não fabricar medições, descobertas ou referências científicas.'],
  routes:['cosmos','universo','astronomia','astrofísica','cosmologia','física quântica','relatividade','estrelas','galáxias','planetas','vida extraterrestre'],
  status:'PERFIL DE CONHECIMENTO DOCUMENTADO · NÃO HOMOLOGADO'
 }
].map((p,index)=>Object.freeze({
 ...p,order:index+1,
 knowledgeDomains:Object.freeze(p.knowledgeDomains),
 capabilities:Object.freeze(p.capabilities),
 boundaries:Object.freeze(p.boundaries),
 routes:Object.freeze(p.routes),
 status:p.status
})));

const MIRROR_PATHS=[
 '../baby-ia.html','../baby-ia-agente.html','../baby-ia-conectado.html','../chatboot-baby-ia.html',
 '../index.html','../memory-boost/Manifest.json','../memory-boost/Memorias.json','../padrao/Fila-Sync.json',
 './baby-agente-console.html','./baby-agente-core.js','./baby-compute-engine.js',
 '../crypy-news/hd-matriz/baby-core.js','../crypy-news/hd-matriz/baby-bridge.js'
];
const STORE='crypy-baby-agent-log-v1';
const S={phase:'idle',inventory:[],instructions:[],memory:[],mirrors:[],plan:[],logs:[]};
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

function detectFileType(path,bytes){
 const ext=(path.split('.').pop()||'').toLowerCase(),b=bytes||new Uint8Array();
 const starts=(a)=>a.every((v,i)=>b[i]===v);
 if(starts([0x89,0x50,0x4e,0x47]))return 'png';
 if(starts([0xff,0xd8,0xff]))return 'jpeg';
 if(starts([0x50,0x4b,0x03,0x04]))return 'zip';
 if(starts([0x25,0x50,0x44,0x46]))return 'pdf';
 if(starts([0x47,0x49,0x46,0x38]))return 'gif';
 if(ext==='html'||ext==='htm')return 'html';
 if(ext==='json')return 'json';
 if(ext==='js'||ext==='mjs')return 'javascript';
 if(ext==='txt'||ext==='md')return 'text';
 return 'unknown/binary';
}
async function sha256(buffer){
 if(!crypto||!crypto.subtle)return 'sha256-unavailable';
 const digest=await crypto.subtle.digest('SHA-256',buffer);
 return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
}
function renderMirrors(results,ranked){
 const root=$('#mirror-inventory');if(!root)return;root.replaceChildren();
 const ordered=ranked&&ranked.items?ranked.items.map(x=>results[x.index]):results;
 const groups={};results.filter(x=>x.status==='read'&&x.sha256&&x.sha256!=='sha256-unavailable').forEach(x=>{groups[x.sha256]=(groups[x.sha256]||0)+1;});
 ordered.forEach(x=>{
  const d=document.createElement('div');d.className='row';
  const b=document.createElement('b');b.textContent=x.path;
  const small=document.createElement('small');
  const duplicate=x.sha256&&groups[x.sha256]>1?' · espelho idêntico ×'+groups[x.sha256]:'';
  small.textContent=x.status+' · '+(x.type||'')+' · '+(x.bytes||0)+' bytes · '+(x.sha256||'sem hash')+duplicate;
  d.append(b,small);root.append(d);
 });
}
async function scanMirrors(query=''){
 S.phase='mirror-scan';S.mirrors=[];log('Iniciando inventário somente leitura dos caminhos conhecidos. HD-MATRIZ está incluído apenas em leitura; nenhuma escrita é permitida.');
 const results=await Promise.all(MIRROR_PATHS.map(async path=>{
  try{
   const response=await fetch(path,{cache:'no-store',credentials:'same-origin'});
   if(!response.ok)throw new Error('HTTP '+response.status);
   const buffer=await response.arrayBuffer(),bytes=new Uint8Array(buffer);
   if(buffer.byteLength>25*1024*1024)throw new Error('Arquivo acima do limite de leitura (25 MiB)');
   const type=detectFileType(path,bytes),hash=await sha256(buffer);
   let sample='';
   if(['html','json','javascript','text'].includes(type)){
    const textValue=new TextDecoder('utf-8',{fatal:false}).decode(bytes.subarray(0,Math.min(bytes.length,12000)));
    sample=textValue.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,700);
    if(type==='json'){try{JSON.parse(new TextDecoder().decode(bytes));}catch(_){sample='JSON inválido: '+sample.slice(0,400);}}
   }
   return {path,status:'read',type,bytes:buffer.byteLength,sha256:hash,sample,text:path+' '+sample};
  }catch(e){return {path,status:'missing-or-blocked',summary:String(e.message||e)};}
 }));
 S.mirrors=results;
 let ranked=null;
 const engine=window.BabyComputeEngine;
 if(query&&engine){ranked=await engine.rankText(query,results.filter(x=>x.status==='read').map(x=>({path:x.path,text:x.text})));
  if(ranked&&ranked.items){const successful=results.filter(x=>x.status==='read');ranked.items=ranked.items.map(x=>({...x,index:results.indexOf(successful[x.index])}));}
 }
 renderMirrors(results,ranked);
 const ok=results.filter(x=>x.status==='read').length,duplicates=Object.values(results.filter(x=>x.sha256&&x.sha256!=='sha256-unavailable').reduce((a,x)=>(a[x.sha256]=(a[x.sha256]||0)+1,a),{})).filter(n=>n>1).length;
 const backend=ranked?ranked.backend:'não usado (sem consulta)';
 log('Inventário concluído: '+ok+'/'+results.length+' caminhos acessíveis; grupos de hashes repetidos: '+duplicates+'; busca: '+backend+'.',ok===results.length?'success':'warn');
 S.phase='mirror-scan-complete';return results;
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

function renderPersonalities(){
 const root=$('#personality-roster');if(!root)return;
 root.replaceChildren();
 PERSONALITIES.forEach(p=>{
  const card=document.createElement('article');card.className='personality';
  const title=document.createElement('b');title.textContent=String(p.order).padStart(2,'0')+' · '+p.name;
  const role=document.createElement('span');role.textContent=p.role;
  const mission=document.createElement('p');mission.textContent=p.mission;
  const details=document.createElement('details');details.className='personality-details';
  const summary=document.createElement('summary');summary.textContent='Conhecimento especializado';
  details.append(summary);
  [['Áreas de conhecimento',p.knowledgeDomains],['Competências',p.capabilities],['Método de trabalho',[p.method]],['Limites e regras',p.boundaries]].forEach(([heading,items])=>{
   const section=document.createElement('section');
   const h=document.createElement('strong');h.textContent=heading;section.append(h);
   const ul=document.createElement('ul');
   items.forEach(item=>{const li=document.createElement('li');li.textContent=item;ul.append(li)});
   section.append(ul);details.append(section);
  });
  const status=document.createElement('small');status.textContent=p.status;
  card.append(title,role,mission,details,status);root.append(card);
 });
 const count=$('#personality-count');if(count)count.textContent=PERSONALITIES.length+' identidades registradas';
}

function render(){const s=$('#agent-status');if(s)s.textContent=`BABY ${VERSION} · ${S.phase.toUpperCase()}`;const root=$('#inventory');if(root){root.replaceChildren();S.inventory.forEach(x=>{const d=document.createElement('div');d.className='row';const b=document.createElement('b');b.textContent=x.path;const small=document.createElement('small');small.textContent=`${x.status} · ${x.summary}`;d.append(b,small);root.append(d)})}}
function worldClock(){const zones=[['Paraná','America/Sao_Paulo'],['UTC','UTC'],['Londres','Europe/London'],['Tóquio','Asia/Tokyo']];const root=$('#world-clock');if(!root)return;const update=()=>{root.replaceChildren();zones.forEach(([name,zone])=>{const d=document.createElement('div');d.className='clock-item';const b=document.createElement('b');b.textContent=name;const t=document.createElement('span');try{t.textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())}catch(_){t.textContent='indisponível'}d.append(b,t);root.append(d)})};update();setInterval(update,1000)}
document.addEventListener('DOMContentLoaded',()=>{
 restoreLogs();renderPersonalities();log('Núcleo carregado. Registro local restaurado quando disponível.');worldClock();
 $('#read')?.addEventListener('click',()=>autoRead());$('#scan-mirrors')?.addEventListener('click',()=>scanMirrors($('#mirror-query')?.value||''));$('#interpret')?.addEventListener('click',interpret);$('#plan')?.addEventListener('click',plan);$('#cache')?.addEventListener('click',cleanAppCache);$('#bridge')?.addEventListener('click',bridgeHealth);
 $('#google')?.addEventListener('click',()=>openAllowed(CONFIG.external[0]));$('#wiki')?.addEventListener('click',()=>openAllowed(CONFIG.external[1]));$('#binance')?.addEventListener('click',()=>openAllowed(CONFIG.external[2]));$('#email')?.addEventListener('click',()=>log('Envio automático exige OAuth, backend, prévia e confirmação. Nenhum e-mail enviado.','warn'));
 if(S.logs.length){const root=$('#agent-log');if(root)S.logs.slice(0,50).reverse().forEach(item=>{const d=document.createElement('div');d.className='log '+(item.type||'info');d.textContent=`${new Date(item.at).toLocaleTimeString()} — ${item.message}`;root.append(d)})}
 if(window.BabyComputeEngine){window.BabyComputeEngine.init().then(s=>{const el=$('#compute-status');if(el)el.textContent='Motor '+s.version+' · WebGPU '+(s.webgpuReady?'ativo':s.webgpuSupported?'disponível':'indisponível')+' · fallback CPU';log('Motor de computação inicializado: '+(s.webgpuReady?'WebGPU pronto':'CPU disponível')+'.', 'info');});}
 autoRead().catch(e=>log(e.message,'error'));
});
window.CRYPY_BABY_AGENT=Object.freeze({version:VERSION,getState:()=>JSON.parse(JSON.stringify(S)),getPersonalities:()=>PERSONALITIES.map(p=>({...p,knowledgeDomains:[...p.knowledgeDomains],capabilities:[...p.capabilities],boundaries:[...p.boundaries],routes:[...p.routes]})),
 getPersonality:id=>{const p=PERSONALITIES.find(x=>x.id===String(id||'').toUpperCase());return p?JSON.parse(JSON.stringify(p)):null},
 suggestPersonality:query=>{const words=String(query||'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');const ranked=PERSONALITIES.map(p=>({id:p.id,score:p.routes.reduce((n,k)=>n+(words.includes(k.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\\u0300-\\u036f]/g,''))?1:0),0)})).sort((a,b)=>b.score-a.score);return ranked[0]&&ranked[0].score>0?{suggestion:ranked[0].id,score:ranked[0].score,automaticForwarding:false}: {suggestion:null,score:0,automaticForwarding:false}},
 autoRead,scanMirrors,interpret,plan,bridgeHealth});
})();
