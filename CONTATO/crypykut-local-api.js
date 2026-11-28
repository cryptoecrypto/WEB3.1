(function () {
  "use strict";
  const KEY = "crypykut.records.local.v1";
  const nativeFetch = window.fetch.bind(window);
  function readDb() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch (_) { return {}; }
  }
  function writeDb(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch (_) { return false; }
  }
  function response(data, status=200) {
    return Promise.resolve(new Response(JSON.stringify({data}), {
      status, headers: {"content-type":"application/json"}
    }));
  }
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    const method = (init && init.method) || (input && input.method) || "GET";
    if (!/\bactions$/.test(url) || method.toUpperCase() !== "POST") {
      return nativeFetch(input, init);
    }
    let body;
    try { body = JSON.parse((init && init.body) || "{}"); }
    catch (_) { return response({error:"Pedido inválido."},400); }
    const db = readDb();
    const collection = String(body.args && body.args.collection || "");
    if (!collection || !/^crypykut_(reels|comments|scraps|testimonials)$/.test(collection)) {
      return response({error:"Coleção não permitida."},400);
    }
    if (body.action === "records.list") {
      return response({records:Array.isArray(db[collection]) ? db[collection] : []});
    }
    if (body.action === "records.create") {
      const id = "local-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,8);
      const record = {id, value: body.args && body.args.value || {}};
      db[collection] = Array.isArray(db[collection]) ? db[collection] : [];
      db[collection].push(record);
      if (!writeDb(db)) return response({error:"Armazenamento local indisponível ou cheio."},507);
      return response({id});
    }
    return response({error:"Ação não suportada pelo modo local."},400);
  };
  window.CRYPYKUT_MODE = "browser-local";
})();