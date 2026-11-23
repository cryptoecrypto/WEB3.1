/* CRYPY 13 ChatBoots — roteador determinístico; não chama LLM nem executa tarefas. */
(function(root,factory){
  var api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root) root.CRPYColmeiaCore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function norm(v){return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
  function validateRegistry(registry){
    if(!registry||!Array.isArray(registry.agents)||registry.agents.length!==13) throw new Error("O catálogo precisa conter exatamente 13 perfis.");
    var ids=registry.agents.map(function(a){return a.id;});
    if(new Set(ids).size!==13) throw new Error("IDs de agentes duplicados.");
    registry.agents.forEach(function(a){
      if(!a.id||!a.name||!a.role||!Array.isArray(a.triggers)) throw new Error("Perfil incompleto: "+(a.id||"sem id"));
    });
    if(!ids.includes("baby")||!ids.includes("nexus")) throw new Error("BABY e NEXUS são obrigatórios.");
    return true;
  }
  function createRouter(registry){
    validateRegistry(registry);
    var agents=registry.agents.slice();
    var byId=function(id){return agents.find(function(a){return a.id===id;});};
    function route(message){
      var q=norm(message);
      var ranked=agents.map(function(agent){
        var score=(agent.triggers||[]).reduce(function(n,term){var t=norm(term);return n+(t&&q.includes(t)?Math.max(1,Math.min(4,t.split(" ").length)):0);},0);
        return {agent:agent,score:score};
      }).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score||a.agent.id.localeCompare(b.agent.id);});
      var primary=(ranked[0]&&ranked[0].agent)||byId("baby");
      var collaborators=ranked.slice(1,4).map(function(x){return x.agent;});
      var sensitive=/(apagar|excluir|sobrescrever|transferir|publicar|pagar|enviar|alterar permiss|chave privada|seed phrase|senha|token secreto)/.test(q);
      var highRisk=/(segurança|seguranca|auditoria|backup|integridade|carteira|financeiro|contrato inteligente)/.test(q);
      return {
        mode:"roteamento_e_plano_sem_execucao",
        orchestrator:byId("baby"),
        coordinator:byId("nexus"),
        primary:primary,
        collaborators:collaborators,
        reviewer:highRisk?byId("nexus"):byId("baby"),
        roleStatus:primary.roleStatus,
        requiresHumanApproval:sensitive,
        executionAllowed:false,
        stages:["classificar","planejar","encaminhar","revisar","consolidar"],
        frameworkPatterns:["crewai","microsoft-agent-framework","openai-agents-sdk","metagpt","g-memory"],
        note:"Encaminhamento sugerido por palavras-chave. Nenhum modelo especialista foi chamado ou executou a tarefa."
      };
    }
    return {route:route,list:function(){return agents.slice();},status:function(){return {ok:true,total:agents.length,mode:"roteamento_local_sem_llm"};}};
  }
  return {validateRegistry:validateRegistry,createRouter:createRouter};
});
