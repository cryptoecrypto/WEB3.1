import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const access=JSON.parse(await readFile(new URL("../shared-knowledge/agent-access.json",import.meta.url),"utf8"));
const agents=JSON.parse(await readFile(new URL("../config/agents.json",import.meta.url),"utf8"));
test("base compartilhada contém exatamente os 13 perfis do catálogo",()=>{
 assert.equal(access.agents.length,13);
 assert.deepEqual(access.agents.map(x=>x.id).sort(),agents.agents.map(x=>x.id).sort());
});
test("todos os perfis têm leitura compartilhada, memória privada isolada e escrita por proposta",()=>{
 for(const a of access.agents){assert.equal(a.access,"read_curated_shared");assert.equal(a.privateMemory,"isolated");assert.equal(a.sharedWrite,"propose_only");}
});
test("nenhum endpoint generativo é declarado conectado por esta camada",()=>{
 for(const a of access.agents)assert.equal(a.modelEndpoint,"not_connected_by_this_layer");
});
test("índice do BABY só marca texto público para ingestão",async()=>{
 const idx=JSON.parse(await readFile(new URL("../../assets/data/crypy-file-index.json",import.meta.url),"utf8"));
 assert.equal(idx.files.length,idx.total);
 assert.ok(idx.publicTextFiles>0);
 for(const f of idx.files.filter(x=>x.indexable)){assert.equal(f.access,"público");assert.equal(f.protected,false);assert.equal(f.sensitive,false);}
});

test("cada um dos 13 arquivos profile.json declara o contrato compartilhado",async()=>{
 for(const a of access.agents){
  const p=JSON.parse(await readFile(new URL("../"+a.profilePath.replace("CRYPY-13-CHATBOOTS/",""),import.meta.url),"utf8"));
  assert.equal(p.sharedKnowledge.enabled,true,a.id);
  assert.equal(p.sharedKnowledge.access,"read_curated_shared",a.id);
  assert.equal(p.sharedKnowledge.privateMemory,"isolated",a.id);
 }
});
test("página principal do BABY carrega sincronizador e adaptador compartilhado",async()=>{
 const html=await readFile(new URL("../../baby-ia/chatboot-baby-ia.html",import.meta.url),"utf8");
 assert.match(html,/baby-knowledge-sync\.js/);
 assert.match(html,/crypy-shared-knowledge\.js/);
});
