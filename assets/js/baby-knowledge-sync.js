/* CRYPY / BABY — INDEXADOR DE CONHECIMENTO v1.4
 * Percorre todos os caminhos HTML/HTM do índice oficial e somente materiais públicos e didáticos aprovados; memórias, manifestos e configuração privada ficam fora.
 * Extrai texto visível e metadados, mantém o conteúdo integral (sem corte de caracteres)
 * e grava no IndexedDB deste navegador. Recuperação textual; não treina rede neural.
 * Não indexa memórias pessoais, backups, credenciais ou configuração privada; não envia conteúdo a terceiros e não altera arquivos-fonte.
 */
(function () {
  "use strict";
  if (window.BabyKnowledge && window.BabyKnowledge.version === "1.4") return;

  var script = document.currentScript;
  var root = new URL("../../", script && script.src ? script.src : document.baseURI);
  var indexUrl = new URL("assets/data/crypy-page-index.json", root);
  var fileIndexUrl = new URL("assets/data/crypy-file-index.json", root);
  var textExtensions = new Set(["html","htm","md","txt","js","mjs","css","json","yml","yaml","tsx","svg"]);
  var fileRegistry = null;
  function isPublicTextFile(item) {
    return !!item && typeof item.path === "string" &&
      item.access === "público" && !item.protected && !item.sensitive &&
      textExtensions.has(String(item.extension || "").toLowerCase()) &&
      Number(item.sizeBytes || 0) <= 900000;
  }
  var dbName = "crypy_baby_knowledge_v1";
  var storeName = "documents";
  var fixedFiles = [
    "crypy-academy/cursos/fontes/ABECEDARIO-BINARIO-BABY-IA.txt",
    "crypy-academy/cursos/fontes/GUIA-MANUTENCAO-DESIGN-AGENTES-001.md",
    "crypy-academy/cursos/fontes/CRYPY-COLMEIA-BASE-CONHECIMENTO-001.md",
    "crypy-academy/cursos/fontes/CURSO-EDICAO-IMAGEM-VIDEO-PHD-001.md",
    "crypy-academy/cursos/fontes/TERMINAL-CENTRAL-README.md",
    "crypy-academy/cursos/fontes/CRYPY-SERVER-README.md",
    "crypy-academy/cursos/fontes/GUIA-PLUGINS-CRYPY.txt",
    "crypy-academy/cursos/fontes/GUIA-SEGURANCA-DIGITAL-CRYPY.md",
    "crypy-academy/cursos/GRADE-CURRICULAR-CRYPY-ACADEMY-001.md",
    "crypy-academy/cursos/POLITICA-CERTIFICADO-PARTICIPACAO-001.md",
    "crypy-academy/cursos/catalogo-cursos.json",
    "web3.1/auto-config-baby.txt",
    "web3.1/instruncao.txt",
    "assets/data/crypy-design-calendar.json",
    "assets/js/crypy-dynamic-design.js"
  ];

  var memoryDocs = [];
  var dbPromise = null;
  var failures = [];
  var progress = {
    state: "aguardando", done: 0, total: 0, indexed: 0, errors: 0,
    chars: 0, updatedAt: null, sourceTotal: 0, fixedTotal: fixedFiles.length
  };

  function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

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
      if (!db) {
        memoryDocs = memoryDocs.filter(function (x) { return x.path !== doc.path; });
        memoryDocs.push(doc);
        return;
      }
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).put(doc);
        tx.oncomplete = resolve;
        tx.onerror = function () { reject(tx.error || new Error("Falha ao gravar IndexedDB")); };
        tx.onabort = function () { reject(tx.error || new Error("Gravação cancelada")); };
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

  function extract(path, raw) {
    if (/\.html?$/i.test(path)) {
      var parsed = new DOMParser().parseFromString(raw, "text/html");
      var title = parsed.querySelector("title") ? parsed.querySelector("title").textContent.trim() : path.split("/").pop();
      var meta = Array.from(parsed.querySelectorAll('meta[name="description"],meta[name="keywords"],meta[property="og:title"]'))
        .map(function (n) { return n.getAttribute("content") || ""; }).filter(Boolean).join(" ");
      var headings = Array.from(parsed.querySelectorAll("h1,h2,h3,h4,[aria-label],img[alt]"))
        .map(function (n) { return n.getAttribute("aria-label") || n.getAttribute("alt") || n.textContent || ""; })
        .join(" ");
      parsed.querySelectorAll("script,style,noscript,svg,canvas,iframe,template").forEach(function (n) { n.remove(); });
      var body = parsed.body ? parsed.body.textContent : parsed.documentElement.textContent;
      return { title: title, text: [title, meta, headings, body].join(" ").replace(/\s+/g, " ").trim() };
    }
    return { title: path.split("/").pop(), text: String(raw || "").replace(/\s+/g, " ").trim() };
  }

  function keywordsFor(text) {
    var counts = Object.create(null);
    (normalize(text).match(/[a-z0-9]{3,}/g) || []).forEach(function (w) {
      if (w.length > 40) return;
      counts[w] = (counts[w] || 0) + 1;
    });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 80);
  }

  function fetchAndIndex(path) {
    var url = new URL(path.split("/").map(encodeURIComponent).join("/"), root);
    return fetch(url.href, { cache: "no-cache", credentials: "same-origin" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (raw) {
      var extracted = extract(path, raw);
      if (!extracted.text) throw new Error("arquivo sem texto extraível");
      var doc = {
        path: path, title: extracted.title, text: extracted.text,
        keywords: keywordsFor(extracted.text), indexedAt: new Date().toISOString(),
        chars: extracted.text.length, sourceBytes: raw.length
      };
      return saveDoc(doc).then(function () {
        progress.indexed += 1;
        progress.chars += doc.chars;
      });
    });
  }

  function updateButton() {
    var b = document.getElementById("baby-knowledge-sync");
    if (!b) return;
    if (progress.state === "sincronizando") b.textContent = "BABY · " + progress.done + "/" + progress.total;
    else if (progress.state === "concluido") b.textContent = "BABY · " + progress.indexed + " INDEXADOS";
    else if (progress.state === "concluido_com_erros") b.textContent = "BABY · " + progress.indexed + " OK / " + progress.errors + " ERROS";
    else if (progress.state === "erro") b.textContent = "BABY · FALHA NA BASE";
    else b.textContent = "BABY · SINCRONIZAR BASE";
    b.title = "Índice WEB3.1 + documentos autorizados + catálogo dos 13 ChatBoots. Recuperação textual local; não treina modelos nem altera fontes.";
  }

  function sync() {
    if (progress.state === "sincronizando") return Promise.resolve(snapshot());
    progress = {
      state: "sincronizando", done: 0, total: 0, indexed: 0, errors: 0,
      chars: 0, updatedAt: null, sourceTotal: 0, fixedTotal: 0
    };
    failures = [];
    updateButton();
    return fetch(fileIndexUrl.href, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("Inventário de arquivos HTTP " + res.status);
      return res.json();
    }).then(function (registry) {
      if (!registry || !Array.isArray(registry.files)) throw new Error("Inventário global sem files[]");
      fileRegistry = registry;
      var allowed = registry.files.filter(isPublicTextFile);
      var allowedByPath = new Map(allowed.map(function (item) { return [item.path, item]; }));
      var paths = Array.from(new Set(allowed.map(function (item) { return item.path; })));
      fixedFiles.forEach(function (path) {
        if (allowedByPath.has(path) && paths.indexOf(path) === -1) paths.push(path);
      });
      progress.sourceTotal = paths.length;
      progress.total = paths.length;
      progress.fixedTotal = fixedFiles.filter(function (path) { return allowedByPath.has(path); }).length;
      window.BabyFileRegistry = {
        version: registry.version,
        totalFiles: registry.total,
        hiddenFiles: registry.hiddenFiles,
        protectedFiles: registry.protectedFiles,
        restrictedFiles: registry.restrictedFiles,
        searchableTextFiles: paths.length,
        search: function (query, limit) {
          var terms = normalize(query).split(/\s+/).filter(Boolean);
          if (!terms.length) return [];
          return registry.files.filter(isPublicTextFile).map(function (item) {
            var searchable = normalize(item.path + " " + item.extension);
            var score = terms.reduce(function (sum, term) { return sum + (searchable.indexOf(term) !== -1 ? 1 : 0); }, 0);
            return score ? { path: item.path, extension: item.extension, sizeBytes: item.sizeBytes, score: score } : null;
          }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, limit || 10);
        }
      };
      var cursor = 0;
      function worker() {
        if (cursor >= paths.length) return Promise.resolve();
        var path = paths[cursor++];
        return fetchAndIndex(path).catch(function (err) {
          progress.errors += 1;
          failures.push({ path: path, error: String(err && err.message || err) });
        }).then(function () {
          progress.done += 1;
          updateButton();
          return worker();
        });
      }
      return Promise.all([worker(), worker(), worker(), worker()]).then(function () {
        progress.state = progress.errors ? "concluido_com_erros" : "concluido";
        progress.updatedAt = new Date().toISOString();
        progress.failures = failures.slice();
        updateButton();
        return snapshot();
      });
    }).catch(function (err) {
      progress.state = "erro";
      progress.error = String(err && err.message || err);
      updateButton();
      return snapshot();
    });
  }

  function snapshot() {
    return {
      version: "1.4", state: progress.state, indexedThisRun: progress.indexed,
      done: progress.done, total: progress.total, sourceTotal: progress.sourceTotal,
      fixedTotal: progress.fixedTotal, errors: progress.errors, chars: progress.chars,
      updatedAt: progress.updatedAt, failures: failures.slice(), error: progress.error || null
    };
  }

  function search(query, limit) {
    var terms = Array.from(new Set(normalize(query).match(/[a-z0-9]{2,}/g) || []));
    if (!terms.length) return Promise.resolve([]);
    return allDocs().then(function (docs) {
      return docs.map(function (doc) {
        var hay = normalize(doc.path + " " + doc.title + " " + (doc.keywords || []).join(" ") + " " + doc.text);
        var score = 0;
        terms.forEach(function (term) {
          var at = 0, count = 0;
          while ((at = hay.indexOf(term, at)) !== -1 && count < 30) { count += 1; at += term.length; }
          score += count * (normalize(doc.path).indexOf(term) !== -1 ? 5 : 1);
        });
        if (!score) return null;
        var first = normalize(doc.text).indexOf(terms[0]);
        var start = Math.max(0, first < 0 ? 0 : first - 260);
        return {
          path: doc.path, title: doc.title, score: score,
          snippet: doc.text.slice(start, start + 900), keywords: doc.keywords || []
        };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, limit || 5);
    });
  }

  function status() {
    return allDocs().then(function (docs) {
      var s = snapshot();
      s.documentsStored = docs.length;
      s.totalCharactersStored = docs.reduce(function (n, d) { return n + (d.chars || 0); }, 0);
      return s;
    });
  }

  window.BabyKnowledge = { version: "1.4", sync: sync, search: search, status: status };
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
        b.title = "Concluídos: " + s.done + "/" + s.total + " · Indexados nesta execução: " + s.indexedThisRun + " · Erros: " + s.errors;
      });
    });
    document.body.appendChild(b);
    status().then(function (s) {
      if (s.documentsStored) {
        progress.state = s.state === "aguardando" ? "aguardando" : s.state;
        progress.indexed = s.documentsStored;
        progress.updatedAt = s.updatedAt;
        updateButton();
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
