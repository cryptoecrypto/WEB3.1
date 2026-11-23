"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const BabyResearch = require("../../assets/js/baby-research.js");

test("BABY reconhece comando explícito Google", () => {
  assert.deepEqual(BabyResearch.parseIntent("google: CRYPY WEB3.1"), {
    provider: "google", query: "CRYPY WEB3.1"
  });
});

test("BABY reconhece comando explícito Wikipedia", () => {
  assert.deepEqual(BabyResearch.parseIntent("wikipédia: relógio atômico"), {
    provider: "wikipedia", query: "relógio atômico"
  });
});

test("pesquisa genérica encaminha para Google e Wikipedia", () => {
  assert.deepEqual(BabyResearch.parseIntent("pesquise sobre relógios atômicos"), {
    provider: "both", query: "relógios atômicos"
  });
});

test("URL do Google codifica a consulta", () => {
  assert.equal(
    BabyResearch.googleUrl("CRYPY + WEB3.1"),
    "https://www.google.com/search?q=CRYPY%20%2B%20WEB3.1"
  );
});

test("Google abre somente quando o chamador fornece uma janela", () => {
  let opened = null;
  const result = BabyResearch.openGoogle("CRYPY", (url, target) => {
    opened = { url, target };
    return { opener: "parent" };
  });
  assert.equal(opened.target, "_blank");
  assert.equal(opened.url, "https://www.google.com/search?q=CRYPY");
  assert.equal(result.opened, true);
});

test("Wikipedia retorna títulos, URLs e trechos sem marcação HTML", async () => {
  const result = await BabyResearch.searchWikipedia("CRYPY", async (url) => {
    assert.match(url, /^https:\/\/pt\.wikipedia\.org\/w\/api\.php\?/);
    return {
      ok: true,
      json: async () => ({
        query: { search: [
          { title: "CRYPY", pageid: 123, snippet: "Projeto <b>digital</b> &amp; colmeia" }
        ] }
      })
    };
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "CRYPY");
  assert.equal(result[0].snippet, "Projeto digital & colmeia");
  assert.equal(result[0].url, "https://pt.wikipedia.org/?curid=123");
});
