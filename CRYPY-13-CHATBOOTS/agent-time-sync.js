/* CRYPY COLMEIA — sincronização temporal dos 13 perfis.
 * Compartilha um mesmo instante UTC e as conversões IANA com cada perfil.
 * A fonte atual é o relógio do dispositivo que executa BABY; não é NTP/backend.
 */
(function(root,factory){
  var api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root) root.CRPYAgentTimeSync=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function create(registry,clock,options){
    options=options||{};
    if(!registry||!Array.isArray(registry.agents)||registry.agents.length!==13) throw new Error("A sincronização exige exatamente 13 perfis.");
    if(!clock||typeof clock.getTimes!=="function"||typeof clock.subscribe!=="function") throw new Error("API do relógio mundial inválida.");
    var agents=registry.agents.slice(),listeners=[],contexts={},unsubscribe=null,sequence=0,last=null,running=false;
    function build(zones,instant){
      var epoch=instant instanceof Date?instant.getTime():Date.now();
      var iso=new Date(epoch).toISOString();
      var next={sequence:++sequence,source:"device_clock",epochMs:epoch,utcIso:iso,zones:zones};
      var nextContexts={};
      agents.forEach(function(agent){
        nextContexts[agent.id]={agentId:agent.id,agentName:agent.name,epochMs:epoch,utcIso:iso,zones:zones};
      });
      contexts=nextContexts;last=next;
      var event={type:"crypy:agents:time-sync",sequence:next.sequence,source:next.source,epochMs:epoch,utcIso:iso,agentCount:agents.length,agentIds:agents.map(function(a){return a.id;}),contexts:contexts};
      listeners.slice().forEach(function(fn){try{fn(event);}catch(e){}});
      if(typeof window!=="undefined"&&typeof CustomEvent!=="undefined") window.dispatchEvent(new CustomEvent("crypy:agents:time-sync",{detail:event}));
      if(typeof options.onSync==="function") options.onSync(event);
      return event;
    }
    function sync(zones,instant){return build(zones||clock.getTimes(instant||new Date()),instant||new Date());}
    function start(){
      if(running)return status();
      running=true;
      sync(clock.getTimes(new Date()),new Date());
      unsubscribe=clock.subscribe(function(zones){sync(zones,new Date());});
      return status();
    }
    function stop(){if(unsubscribe)unsubscribe();unsubscribe=null;running=false;return status();}
    function subscribe(fn){if(typeof fn!=="function")throw new TypeError("Listener precisa ser função.");listeners.push(fn);return function(){listeners=listeners.filter(function(x){return x!==fn;});};}
    function status(){return {state:running?"running":"stopped",registeredAgents:agents.length,synchronizedAgents:last?agents.length:0,sequence:sequence,source:last?last.source:"not_started",utcIso:last?last.utcIso:null,independentTimeServer:false};}
    function getAgentTime(agentId){return contexts[agentId]||null;}
    function getAllAgentTimes(){var copy={};agents.forEach(function(a){copy[a.id]=contexts[a.id]||null;});return copy;}
    return {start:start,stop:stop,subscribe:subscribe,status:status,getAgentTime:getAgentTime,getAllAgentTimes:getAllAgentTimes,sync:sync};
  }
  return {create:create};
});
