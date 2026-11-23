/* CRYPY COLMEIA — barramento local de colaboração dos 13 perfis.
 * Distribui envelopes de tarefa aos perfis registrados; não invoca LLMs.
 */
(function(root,factory){var api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.CRPYColmeiaBus=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
function createBus(registry,options){
 options=options||{};
 if(!registry||!Array.isArray(registry.agents)||registry.agents.length!==13)throw new Error("O barramento exige exatamente 13 perfis.");
 var agents=registry.agents.slice(),listeners=[],sequence=0;
 function subscribe(fn){if(typeof fn!=="function")throw new TypeError("Listener precisa ser função.");listeners.push(fn);return function(){listeners=listeners.filter(function(x){return x!==fn;});};}
 function dispatch(message,route){
  var text=String(message||"").trim();if(!text)throw new Error("Mensagem vazia.");sequence++;
  var envelope={id:"crypy-colmeia-"+sequence,type:"task.broadcast",createdAt:new Date().toISOString(),message:text,recipients:agents.map(function(a){return a.id;}),recipientCount:agents.length,primaryAgent:route&&route.primary?route.primary.id:"baby",collaboratorIds:route&&Array.isArray(route.collaborators)?route.collaborators.map(function(a){return a.id;}):[],reviewerId:route&&route.reviewer?route.reviewer.id:"nexus",delivery:"local_profile_bus",profileDelivery:"dispatched",modelInvocations:0,generativeInference:false,executionAllowed:false,note:"Os 13 perfis recebem o envelope lógico. Nenhum modelo generativo externo foi chamado."};
  listeners.slice().forEach(function(fn){try{fn(envelope);}catch(e){}});if(options.onDispatch)options.onDispatch(envelope);return envelope;
 }
 return {dispatch:dispatch,subscribe:subscribe,status:function(){return {state:"ready",registeredProfiles:agents.length,connectedProfiles:agents.length,modelEndpointsConnected:0,generativeInference:false,mode:"local_profile_bus"};},list:function(){return agents.slice();}};
}
return {createBus:createBus};
});
