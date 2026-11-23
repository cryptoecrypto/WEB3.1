import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url);
const {createRouter,validateRegistry}=require("../baby-core/orchestrator.js");
const registry=JSON.parse(await readFile(new URL("../config/agents.json",import.meta.url),"utf8"));
test("catálogo possui 13 perfis únicos e válidos",()=>{assert.equal(registry.agents.length,13);assert.equal(new Set(registry.agents.map(a=>a.id)).size,13);assert.equal(validateRegistry(registry),true);});
test("BABY e NEXUS permanecem no núcleo de governança",()=>{const r=createRouter(registry).route("");assert.equal(r.orchestrator.id,"baby");assert.equal(r.coordinator.id,"nexus");});
test("pesquisa encaminha para ALICE",()=>{assert.equal(createRouter(registry).route("pesquisar fontes e documentar conhecimento").primary.id,"alice");});
test("história encaminha para CHAT",()=>{assert.equal(createRouter(registry).route("linha do tempo e histórico").primary.id,"chat");});
test("backup encaminha para BTC",()=>{assert.equal(createRouter(registry).route("conferir backup e hash").primary.id,"btc");});
test("criação visual encaminha para DOLA",()=>{assert.equal(createRouter(registry).route("criar imagem e design").primary.id,"dola");});
test("quatro papéis propostos permanecem identificados",()=>{const proposed=registry.agents.filter(a=>a.roleStatus==="proposta_pendente_confirmacao");assert.deepEqual(proposed.map(a=>a.id).sort(),["bnb","crypycoin","icp","shiba-inu"].sort());});
test("roteador nunca executa e sinaliza ações sensíveis",()=>{const r=createRouter(registry).route("excluir e sobrescrever arquivo");assert.equal(r.executionAllowed,false);assert.equal(r.requiresHumanApproval,true);});
test("cada pasta possui um profile.json coerente com o catálogo",async()=>{for(const a of registry.agents){const p=JSON.parse(await readFile(new URL("../"+a.profilePath,import.meta.url),"utf8"));assert.equal(p.id,a.id);assert.equal(p.name,a.name);}});

const {createBus}=require("../collaboration-bus.js");
test("barramento distribui envelope aos 13 perfis sem simular inferência",()=>{const bus=createBus(registry);let received=null;bus.subscribe(e=>received=e);const e=bus.dispatch("auditar a colmeia",createRouter(registry).route("auditar a colmeia"));assert.equal(e.recipientCount,13);assert.equal(e.recipients.length,13);assert.equal(e.generativeInference,false);assert.equal(e.modelInvocations,0);assert.equal(received.id,e.id);assert.equal(bus.status().connectedProfiles,13);assert.equal(bus.status().modelEndpointsConnected,0);});

const {getTimes,zones,getTime}=require("../world-clock.js");
test("relógio mundial expõe seis fusos e horários válidos",()=>{const t=getTimes(new Date("2026-11-22T12:00:00Z"));assert.equal(zones.length,6);assert.equal(t.br.timeZone,"America/Sao_Paulo");assert.equal(t.utc.timeZone,"UTC");for(const z of zones){assert.match(t[z.id].time,/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/);}});

test("API global do relógio resolve o fuso por identificador",()=>{const value=getTime("America/Sao_Paulo");assert.equal(value.timeZone,"America/Sao_Paulo");assert.equal(typeof value.time,"string");});
