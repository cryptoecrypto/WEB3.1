import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const {create}=require("../agent-time-sync.js");
const agents=Array.from({length:13},(_,i)=>({id:"agent-"+i,name:"Agent "+i}));
const zones={
  br:{timeZone:"America/Sao_Paulo",time:"09:00:00"},
  utc:{timeZone:"UTC",time:"12:00:00"},
  ny:{timeZone:"America/New_York",time:"07:00:00"},
  lon:{timeZone:"Europe/London",time:"12:00:00"},
  tok:{timeZone:"Asia/Tokyo",time:"21:00:00"},
  syd:{timeZone:"Australia/Sydney",time:"23:00:00"}
};
function mockClock(){
  let listener=null;
  return {
    getTimes:()=>zones,
    subscribe:fn=>{listener=fn;return ()=>{listener=null;};},
    tick:()=>{if(listener)listener(zones);}
  };
}
test("sincroniza exatamente 13 perfis com o mesmo instante UTC",()=>{
  const clock=mockClock(),sync=create({agents},clock);
  const state=sync.start();
  assert.equal(state.registeredAgents,13);
  assert.equal(state.synchronizedAgents,13);
  assert.equal(state.source,"device_clock");
  const all=sync.getAllAgentTimes();
  assert.equal(Object.keys(all).length,13);
  const instants=new Set(Object.values(all).map(x=>x.utcIso));
  assert.equal(instants.size,1);
  for(const agent of agents){
    assert.equal(all[agent.id].agentId,agent.id);
    assert.equal(all[agent.id].zones.utc.timeZone,"UTC");
    assert.equal(all[agent.id].zones.br.timeZone,"America/Sao_Paulo");
  }
  sync.stop();
  assert.equal(sync.status().state,"stopped");
});
test("cada pulso do relógio atualiza todos os perfis na mesma sequência",()=>{
  const clock=mockClock(),sync=create({agents},clock);
  let received=null;
  sync.subscribe(event=>received=event);
  sync.start();
  const previous=sync.status().sequence;
  clock.tick();
  assert.equal(sync.status().sequence,previous+1);
  assert.equal(received.agentCount,13);
  assert.equal(received.agentIds.length,13);
  assert.equal(new Set(received.agentIds).size,13);
  assert.equal(received.source,"device_clock");
  sync.stop();
});
test("recusa catálogo que não tenha exatamente 13 agentes",()=>{
  assert.throws(()=>create({agents:agents.slice(0,12)},mockClock()),/exatamente 13/);
});
