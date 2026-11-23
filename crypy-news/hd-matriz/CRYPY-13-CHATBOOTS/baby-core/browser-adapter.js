/* Adaptador do catálogo dos 13 perfis para a interface BABY. */
(function(){
  "use strict";
  var script=document.currentScript;
  var registryUrl=new URL("../config/agents.json",script&&script.src?script.src:document.baseURI);
  var api={state:"carregando",ready:null,route:function(){return null;},list:function(){return [];},status:function(){return {state:api.state,total:0};}};
  window.CRPYColmeia=api;
  api.ready=fetch(registryUrl.href,{cache:"no-cache",credentials:"same-origin"})
    .then(function(r){if(!r.ok)throw new Error("Catálogo HTTP "+r.status);return r.json();})
    .then(function(registry){
      if(!window.CRPYColmeiaCore)throw new Error("Motor de roteamento não carregado.");
      var router=window.CRPYColmeiaCore.createRouter(registry);
      api.route=router.route;api.list=router.list;api.state="pronto";
      api.status=function(){return {state:"pronto",total:router.list().length,mode:"roteamento_local_sem_llm",version:registry.schemaVersion};};
      return api.status();
    })
    .catch(function(err){api.state="falha";api.error=String(err&&err.message||err);return api.status();});
})();
