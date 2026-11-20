/* CRYPY / BABY — INDEXADOR LOCAL DE CONHECIMENTO v1.0
 * Lê as 273 páginas registradas no índice WEB3.1 e documentos técnicos selecionados.
 * Armazena texto extraído no IndexedDB deste navegador; não treina modelo neural,
 * não envia conteúdo a terceiros e não acessa carteiras, tokens ou chaves.
 */
(function () {
  "use strict";
  if (window.BabyKnowledge) return;

  var script = document.currentScript;
  var root = new URL("../../", script && script.src ? script.src : document.baseURI);
  var indexUrl = new URL("assets/data/crypy-page-index.json", root);
  var dbName = "crypy_baby_knowledge_v1";
  var storeName = "documents";
  var fixedFiles = [
    "crypy-news/hd-matriz/ABECEDARIO-BINARIO-BABY-IA.txt",
    "crypy-news/hd-matriz/CRYPY-RENDA-PASSIVA-001.md",
    "crypy-news/hd-matriz/Memorias.json",
    "crypy-news/hd-matriz/Manifest.json",
    "baby-core.js",
    "baby-bridge.js",
    "baby-server-bridge.js",
    "assets/js/baby-global-chat.js",
    "assets/js/crypy-global-nav.js",
    "assets/js/crypy-page-assistant.js"
  ];

  var memoryDocs = [];
  var dbPromise = null;
  var progress = { state: "aguardando", done: 0, total: 0, indexed: 0, errors: 0, updatedAt: null };

  function openDb() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve) {
      var req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: "path" });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
    });
    return dbPromise;
  }

  function saveDoc(doc) {
    return openDb().then(function (db) {
      if (!db) { memoryDocs = memoryDocs.filter(function (x) { return x.path !== doc.path; }); memoryDocs.push(doc); return; }
      return new Promise(function (resolve) {
        var tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).put(doc);
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    });
  }

  function allDocs() {
    return openDb().then(function (db) {
      if (!db) return memoryDocs.slice();
      return new Promise(function (resolve) {
        var tx = db.transaction(storeName, "readonly");
        var req = tx.objectStore(storeName).getAll();
        req.onsuccess = function () { resolve(req.result || []); };
        req.onerror = function () { resolve(memoryDocs.slice()); };
      });
    });
  }

  function plainText(path, raw) {
    if (/\.html?$/i.test(path)) {
      var doc = new DOMParser().parseFromString(raw, "text/html");
      doc.querySelectorAll("script,style,noscript,svg,canvas,iframe").forEach(function (n) { n.remove(); });
      return (doc.body ? doc.body.innerText || doc.body.textContent : doc.documentElement.textContent || "")
        .replace(/\s+/g, " ").trim();
    }
    return String(raw || "").replace(/\s+/g, " ").trim();
  }

  function fetchAndIndex(path) {
    var url = new URL(path.split("/").map(encodeURIComponent).join("/"), root);
    return fetch(url.href, { cache: "no-cache", credentials: "same-origin" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (raw) {
      var text = plainText(path, raw).slice(0, 30000);
      if (!text) throw new Error("arquivo sem texto extraível");
      var doc = { path: path, title: path.split("/").pop(), text: text, indexedAt: new Date().toISOString(), chars: text.length };
      return saveDoc(doc).then(function () { progress.indexed += 1; });
    });
  }

  function updateButton() {
    var b = document.getElementById("baby-knowledge-sync");
    if (!b) return;
    b.textContent = progress.state === "sincronizando"
      ? "BABY · " + progress.done + "/" + progress.total
      : progress.state === "concluido"
        ? "BABY · BASE " + progress.indexed + " OK"
        : progress.state === "erro"
          ? "BABY · ERRO NA BASE"
          : "BABY · SINCRONIZAR BASE";
    b.title = "Indexação local da Colmeia WEB3.1 e documentos da HD MATRIZ";
  }

  function sync() {
    if (progress.state === "sincronizando") return Promise.resolve(progress);
    progress = { state: "sincronizando", done: 0, total: 0, indexed: 0, errors: 0, updatedAt: null };
    updateButton();
    return fetch(indexUrl.href, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("Índice HTTP " + res.status);
      return res.json();
    }).then(function (data) {
      var paths = Array.from(new Set((data.pages || []).map(function (p) { return p.path; }).filter(function (p) { return typeof p === "string" && /\.html?$/i.test(p); })));
      paths = paths.concat(fixedFiles);
      paths = Array.from(new Set(paths));
      progress.total = paths.length;
      var cursor = 0;
      function worker() {
        if (cursor >= paths.length) return Promise.resolve();
        var path = paths[cursor++];
        return fetchAndIndex(path).catch(function () { progress.errors += 1; }).then(function () {
          progress.done += 1;
          updateButton();
          return worker();
        });
      }
      return Promise.all([worker(), worker(), worker(), worker()]).then(function () {
        progress.state = "concluido";
        progress.updatedAt = new Date().toISOString();
        updateButton();
        return progress;
      });
    }).catch(function (err) {
      progress.state = "erro";
      progress.error = err.message;
      updateButton();
      return progress;
    });
  }

  function search(query, limit) {
    var terms = String(query || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]{2,}/g) || [];
    if (!terms.length) return Promise.resolve([]);
    return allDocs().then(function (docs) {
      return docs.map(function (doc) {
        var hay = (doc.path + " " + doc.title + " " + doc.text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        var score = 0;
        terms.forEach(function (term) {
          var at = 0, count = 0;
          while ((at = hay.indexOf(term, at)) !== -1 && count < 12) { count += 1; at += term.length; }
          score += count * (doc.path.toLowerCase().indexOf(term) !== -1 ? 4 : 1);
        });
        if (!score) return null;
        var first = hay.indexOf(terms[0]);
        var start = Math.max(0, first - 220);
        var snippet = doc.text.slice(start, start + 650);
        return { path: doc.path, title: doc.title, score: score, snippet: snippet };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, limit || 3);
    });
  }

  function status() {
    return allDocs().then(function (docs) {
      return { state: progress.state, indexed: docs.length, done: progress.done, total: progress.total, errors: progress.errors, updatedAt: progress.updatedAt };
    });
  }

  window.BabyKnowledge = { sync: sync, search: search, status: status };
  function mount() {
    if (!document.body || document.getElementById("baby-knowledge-sync")) return;
    var b = document.createElement("button");
    b.id = "baby-knowledge-sync";
    b.type = "button";
    b.textContent = "BABY · SINCRONIZAR BASE";
    b.style.cssText = "position:fixed;left:12px;top:12px;z-index:2147483001;border:1px solid #00ff88;border-radius:999px;padding:8px 12px;background:#03130a;color:#00ff88;font:700 11px Arial;cursor:pointer;box-shadow:0 0 14px #00ff8840";
    b.addEventListener("click", function () {
      b.disabled = true;
      sync().then(function (s) {
        b.disabled = false;
        b.title = "Indexados: " + s.indexed + " · Erros: " + s.errors;
      });
    });
    document.body.appendChild(b);
    status().then(function (s) {
      if (s.indexed) { progress.state = "concluido"; progress.indexed = s.indexed; progress.updatedAt = s.updatedAt; updateButton(); }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();