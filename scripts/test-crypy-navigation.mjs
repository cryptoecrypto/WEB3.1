import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/js/crypy-global-nav.js", import.meta.url), "utf8");
const window = { __CRYPY_NAV_TEST_MODE__: true };
vm.runInNewContext(source, { window, console });
const api = window.__CRYPY_NAV_TEST_API__;

test("normaliza acentos e caixa corretamente", () => {
  assert.equal(api.normalized("Sincronização"), "sincronizacao");
  assert.equal(api.normalized("MEMORY-BOOST"), "memory-boost");
});

test("oculta HD, Memory Boost, padrão, plugins e sincronização em subpastas", () => {
  const samples = [
    {path:"baby-ia/hd-memory.html",label:"HD Memory",group:"baby-ia"},
    {path:"crypy-news/hd-matriz/baby-ia.html",label:"Baby IA",group:"crypy-news"},
    {path:"baby-ia/momory-boost/chatboot-baby-ia.html",label:"Chatboot Baby IA",group:"baby-ia"},
    {path:"baby-ia/padrao/auto-config.html",label:"Auto Config",group:"baby-ia"},
    {path:"crypy-games-desafios/pluguin/pluguin.html",label:"Pluguin",group:"crypy-games-desafios"},
    {path:"baby-ia/sincronizacao/chatboot-baby-ia.html",label:"Chatboot Baby IA",group:"baby-ia"},
    {path:"web3.1/plugins/registry.html",label:"Registro",group:"web3.1"},
    {path:"memory-boost/health.html",label:"Health",group:"memory-boost"}
  ];
  for (const page of samples) assert.equal(api.hiddenByMenuRule(page), true, page.path);
});

test("mantém páginas editoriais comuns", () => {
  assert.equal(api.hiddenByMenuRule({path:"baby-ia/auto-config.html",label:"Auto Config",group:"baby-ia"}), false);
  assert.equal(api.hiddenByMenuRule({path:"crypy-academy/cursos.html",label:"Cursos",group:"crypy-academy"}), false);
});

test("mantém somente o relógio mundial da raiz", () => {
  assert.equal(api.hiddenByMenuRule({path:"relogio-mundial.html",label:"Relógio Mundial",group:"RAIZ"}), false);
  assert.equal(api.hiddenByMenuRule({path:"crypy-news/relogio-mundial.html",label:"Relógio Mundial",group:"crypy-news"}), true);
});

test("deduplica nomes e prioriza a página canônica menos profunda", () => {
  const input = [
    {path:"baby-ia/chatboot-baby-ia.html",label:"Chatboot Baby IA",group:"baby-ia"},
    {path:"chatboot-baby-ia.html",label:"Chatboot Baby IA",group:"RAIZ"},
    {path:"crypy-academy/chatboot-baby-ia.html",label:"Chatboot Baby IA",group:"crypy-academy"},
    {path:"crypy-academy/cursos.html",label:"Cursos",group:"crypy-academy"}
  ];
  const output = api.deduplicatePages(input);
  assert.equal(output.length, 2);
  assert.equal(output.find(page => page.label === "Chatboot Baby IA").path, "chatboot-baby-ia.html");
});

test("pipeline remove técnicos e cópias mantendo entradas únicas", () => {
  const input = [
    {path:"hd-memory.html",label:"HD Memory",group:"RAIZ"},
    {path:"relogio-mundial.html",label:"Relógio Mundial",group:"RAIZ"},
    {path:"baby-ia/relogio-mundial.html",label:"Relógio Mundial",group:"baby-ia"},
    {path:"chatboot-baby-ia.html",label:"Chatboot Baby IA",group:"RAIZ"},
    {path:"baby-ia/chatboot-baby-ia.html",label:"Chatboot Baby IA",group:"baby-ia"},
    {path:"crypy-academy/cursos.html",label:"Cursos",group:"crypy-academy"}
  ];
  const result = api.filterAndDeduplicate(input);
  assert.equal(result.hiddenCount, 2);
  assert.equal(result.duplicatesRemoved, 1);
  assert.deepEqual(Array.from(result.pages, page => page.path).sort(), [
    "chatboot-baby-ia.html",
    "crypy-academy/cursos.html",
    "relogio-mundial.html"
  ]);
});
