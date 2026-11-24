/* CRYPY Shared Knowledge Hub v1.0
 * Um único corpus curado, consultado pelos 13 perfis.
 * Depende de BabyKnowledge (indexação local via IndexedDB).
 * Não é backend de inferência nem conecta modelos externos.
 */
(function(root){
 "use strict";
 if(!root||root.CRPYSharedKnowledge)return;
 var ACCESS_URL=new URL("../../CRYPY-13-CHATBOOTS/shared-knowledge/agent-access.json",document.currentScript&&document.currentScript.src?document.currentScript.src:document.baseURI);
 var accessPromise=null;
 function loadAccess(){
  if(!accessPromise)accessPromise=fetch(ACCESS_URL.href,{cache:"no-cache",credentials:"same-origin"}).then(function(r){if(!r.ok)throw new Error("Política de acesso HTTP "+r.status);return r.json();}).then(function(x){if(!Array.isArray(x.agents)||x.agents.length!==13)throw new Error("Política precisa listar 13 perfis.");return x;});
  return accessPromise;
 }
 function agent(id,list){return list.find(function(a){return a.id===id;})||null;}
 function status(){
  return Promise.all([loadAccess(),Promise.resolve(root.BabyKnowledge&&typeof root.BabyKnowledge.status==="function"?root.BabyKnowledge.status():null)]).then(function(v){
   var a=v[0],s=v[1];
   return {state:s?"reader_available":"reader_not_loaded",agentsConfigured:a.agents.length,sharedCorpus:a.corpus.name,documentsStored:s?s.documentsStored:0,updatedAt:s?s.updatedAt:null,localIndexState:s?s.state:"not_started",modelEndpointsConnected:0,privateMemoryShared:false,source:"browser_local_indexeddb"};
  });
 }
 function search(agentId,query,limit){
  return loadAccess().then(function(a){
   var profile=agent(agentId,a.agents);
   if(!profile)throw new Error("Perfil não autorizado ou inexistente: "+agentId);
   if(!root.BabyKnowledge||typeof root.BabyKnowledge.search!=="function")throw new Error("BABY Knowledge Reader ainda não foi carregado nesta página.");
   return root.BabyKnowledge.search(query,limit||8).then(function(results){
    return {agentId:profile.id,agentName:profile.name,access:profile.access,results:results.map(function(x){return {title:x.title,path:x.path,score:x.score,snippet:x.snippet,source:x.path};}),count:results.length,corpus:a.corpus.name,note:"Busca textual na base compartilhada local. Resultados são evidências recuperadas, não inferência generativa."};
   });
  });
 }
 function proposeWrite(agentId,proposal){
  return loadAccess().then(function(a){var p=agent(agentId,a.agents);if(!p)throw new Error("Perfil desconhecido.");return {accepted:false,status:"approval_required",agentId:p.id,proposal:String(proposal||""),note:"Nenhum perfil grava diretamente na base. Encaminhe a proposta ao BABY/Sensei para revisão e aprovação."};});
 }
 root.CRPYSharedKnowledge={version:"1.0.0",loadAccess:loadAccess,status:status,search:search,proposeWrite:proposeWrite};
})(typeof window!=="undefined"?window:null);
