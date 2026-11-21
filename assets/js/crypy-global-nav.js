/* CRYPY WEB3.1 — Navegação única, leve e com cache local de índice.
 * O manifesto só é buscado quando o visitante abre o menu.
 * Memory Boost: IndexedDB isolado e somente para o índice público de navegação.
 * Não lê nem altera Memorias.json, HD MATRIZ, arquivos privados ou dados pessoais.
 */
(function () {
  "use strict";
  if (typeof window === "undefined") return;
  var testMode = window.__CRYPY_NAV_TEST_MODE__ === true;
  if (!testMode && window.__CRYPY_GLOBAL_NAV__) return;
  if (!testMode) window.__CRYPY_GLOBAL_NAV__ = true;

  var categories = [
    {label:"CRYPY-INFINIT", groups:["crypy-infinyt","baby-ia","memory-boost","padrao","pluguin","sincronizacao","raiz"]},
    {label:"CRYPY-ACADEMY", groups:["crypy-academy","web3.1"]},
    {label:"ESQUADRÃO DAS CORES", groups:["esquadrao-das-cores"]},
    {label:"NFT-COLLECTION", groups:["nft-collection"]},
    {label:"BIOGRAFIA", groups:["biografia"]},
    {label:"CRYPY-NEWS", groups:["crypy-news"]},
    {label:"MUSEU DIGITAL", groups:["museu-digital"]},
    {label:"MARKETPLACE", groups:["art-figure-marketplace","marketing"]},
    {label:"CRYPY-GAMES", groups:["crypy-games-desafios"]},
    {label:"CRYPYCUT", groups:["social-crypykut"]},
    {label:"CRYPY-COIN", groups:["crypy-coin"]},
    {label:"CONTATO", groups:["contato"]},
    {label:"WHITE PAPER", groups:["white-paper"]}
  ];

  function normalized(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizedPath(value) {
    return normalized(String(value || "").replace(/\\/g, "/"));
  }

  function hiddenByMenuRule(page) {
    var group = normalized(page.group);
    var path = normalizedPath(page.path);
    var label = normalized(page.label);
    var segments = path.split("/").filter(Boolean);
    var hiddenFolders = [
      "memory-boost", "momory-boost", "padrao",
      "pluguin", "pluguins", "plugin", "plugins",
      "sincronizacao"
    ];

    if (hiddenFolders.indexOf(group) !== -1) return true;
    if (segments.some(function (segment) {
      return hiddenFolders.indexOf(segment.replace(/\.html?$/i, "")) !== -1;
    })) return true;

    /* HD inclui HD-MEMORY, HD-BABY, HD-MATRIZ e variações sem hífen. */
    if (segments.some(function (segment) {
      return /^hd(?:$|[-_.\s]|[a-z0-9])/.test(segment.replace(/\.html?$/i, ""));
    })) return true;

    var searchable = path + " " + label + " " + group;
    var technicalRules = [
      /(^|[^a-z0-9])hd(?:[-_.\s]?[a-z0-9][a-z0-9_-]*)?(?=$|[^a-z0-9])/,
      /plug[u]?ins?/,
      /sincroniz/,
      /memor[y]?[-_.\s]?boost/,
      /momor[y]?[-_.\s]?boost/,
      /(^|[^a-z0-9])padrao([^a-z0-9]|$)/
    ];
    if (technicalRules.some(function (rule) { return rule.test(searchable); })) return true;

    /* O relógio mundial é único: somente a página canônica na raiz. */
    if (/relogio[-_.\s]?mundial/.test(searchable)) {
      return path !== "relogio-mundial.html";
    }
    return false;
  }

  function pagePriority(page) {
    var path = normalizedPath(page.path);
    var depth = (path.match(/\//g) || []).length;
    var file = path.slice(path.lastIndexOf("/") + 1).replace(/\.html?$/i, "");
    var slug = normalized(page.label).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    var score = depth * 100;
    if (file !== slug) score += 10;
    if (/(^|\/)(anterior|preservado|backup|arquivo|historico)(\/|-|$)/.test(path)) score += 50;
    if (/(^|\/)hd-(matriz|oculto)(\/|$)/.test(path)) score += 10000;
    return score;
  }

  function deduplicatePages(pages) {
    var groups = Object.create(null);
    pages.forEach(function (page) {
      var labelKey = normalized(page.label);
      var key = labelKey || normalizedPath(page.path);
      if (!groups[key]) {
        groups[key] = page;
        return;
      }
      var current = groups[key];
      var candidateScore = pagePriority(page);
      var currentScore = pagePriority(current);
      if (candidateScore < currentScore ||
          (candidateScore === currentScore &&
           normalizedPath(page.path).localeCompare(normalizedPath(current.path)) < 0)) {
        groups[key] = page;
      }
    });
    return Object.keys(groups).map(function (key) { return groups[key]; })
      .sort(function (a, b) {
        return normalized(a.label).localeCompare(normalized(b.label), "pt-BR") ||
          normalizedPath(a.path).localeCompare(normalizedPath(b.path), "pt-BR");
      });
  }

  function filterAndDeduplicate(indexedPages) {
    var safePages = (Array.isArray(indexedPages) ? indexedPages : []).filter(function (page) {
      return page && typeof page.path === "string" && page.path.trim() &&
        typeof page.label === "string" && !hiddenByMenuRule(page);
    });
    var uniquePages = deduplicatePages(safePages);
    return {
      pages: uniquePages,
      hiddenCount: (Array.isArray(indexedPages) ? indexedPages.length : 0) - safePages.length,
      duplicatesRemoved: safePages.length - uniquePages.length
    };
  }

  function categoryFor(page) {
    var group = normalized(page.group);
    var pagePath = normalizedPath(page.path);
    var pathGroup = pagePath.split("/")[0];

    if (pagePath === "crypy-news/museu.html") return categories[6];
    if (pagePath === "crypy-coin/white-paper.html") return categories[12];

    for (var i = 0; i < categories.length; i++) {
      if (categories[i].groups.indexOf(group) !== -1 ||
          categories[i].groups.indexOf(pathGroup) !== -1) return categories[i];
    }
    return categories[0];
  }

  var testApi = {
    normalized: normalized,
    hiddenByMenuRule: hiddenByMenuRule,
    deduplicatePages: deduplicatePages,
    filterAndDeduplicate: filterAndDeduplicate
  };
  if (testMode) {
    window.__CRYPY_NAV_TEST_API__ = testApi;
    return;
  }

  var scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) {
    var scriptTags = document.getElementsByTagName("script");
    for (var si = scriptTags.length - 1; si >= 0; si--) {
      if (/crypy-global-nav\.js(?:\?|$)/.test(scriptTags[si].src || "")) {
        scriptUrl = scriptTags[si].src;
        break;
      }
    }
  }
  if (!scriptUrl) return;

  var siteRoot = new URL("../../", scriptUrl);
  var manifestUrl = new URL("assets/data/crypy-page-index.json", siteRoot);
  var cacheDbPromise = null;

  function openMemoryBoostCache() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    if (cacheDbPromise) return cacheDbPromise;
    cacheDbPromise = new Promise(function (resolve) {
      try {
        var request = window.indexedDB.open("crypy_memory_boost_nav_v1", 1);
        request.onupgradeneeded = function () {
          var db = request.result;
          if (!db.objectStoreNames.contains("index")) {
            db.createObjectStore("index", {keyPath:"id"});
          }
        };
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { resolve(null); };
        request.onblocked = function () { resolve(null); };
      } catch (_) {
        resolve(null);
      }
    });
    return cacheDbPromise;
  }

  function readMemoryBoostIndex() {
    return openMemoryBoostCache().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction("index", "readonly");
          var request = tx.objectStore("index").get("page-index");
          request.onsuccess = function () { resolve(request.result || null); };
          request.onerror = function () { resolve(null); };
        } catch (_) {
          resolve(null);
        }
      });
    });
  }

  function writeMemoryBoostIndex(data) {
    return openMemoryBoostCache().then(function (db) {
      if (!db) return false;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction("index", "readwrite");
          tx.objectStore("index").put({
            id:"page-index",
            version:String(data.version || "unknown"),
            savedAt:Date.now(),
            data:data
          });
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { resolve(false); };
          tx.onabort = function () { resolve(false); };
        } catch (_) {
          resolve(false);
        }
      });
    });
  }

  function node(tag, attrs, value) {
    var item = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") item.className = attrs[key];
      else item.setAttribute(key, attrs[key]);
    });
    if (value != null) item.textContent = value;
    return item;
  }

  function hideLegacyMenus() {
    var signatures = [
      "CRYPY INFINYT","CRYPY-INFINIT","NFT-COLLECTION","ESQUADRÃO DAS CORES",
      "CRYPY ACADEMY","CRYPY-ACADEMY","BIOGRAFIA","CRYPY-NEWS",
      "MUSEU DIGITAL","MARKETPLACE","CRYPY-GAMES","CRYPYCUT",
      "CRYPY-COIN","WHITE PAPER","CONTATO"
    ];
    var selector = [
      "nav","[role='navigation']","[aria-label*='menu' i]",
      "[class*='crypy-menu' i]","[id*='crypy-menu' i]",
      "[class*='portal-nav' i]","[class*='menu-principal' i]",
      "[class*='main-menu' i]","[class*='navbar' i]",
      "[class*='navigation-menu' i]"
    ].join(",");
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.closest("#crypy-global-navigation")) return;
      if (el.classList.contains("crypy-legacy-menu-hidden")) return;
      var identity = (
        String(el.className || "") + " " +
        String(el.id || "") + " " +
        String(el.getAttribute("aria-label") || "")
      ).toLocaleLowerCase("pt-BR");
      var knownLegacy = /crypy.*(menu|nav)|(?:menu|nav).*crypy|portal-nav|menu-principal|main-menu|navbar|navigation-menu/.test(identity);
      var text = String(el.textContent || "").toLocaleUpperCase("pt-BR");
      var categoryHits = signatures.filter(function (label) { return text.includes(label); }).length;
      /* Não esconder navegações locais como a do CRYPYKUT só por terem vários links. */
      if (knownLegacy || categoryHits >= 2) el.classList.add("crypy-legacy-menu-hidden");
    });
  }

  function mount() {
    if (!document.body || document.getElementById("crypy-global-navigation")) return;

    var root = node("div", {id:"crypy-global-navigation"});
    var style = node("style");
    style.textContent = [
      "#crypy-global-navigation{position:fixed;top:14px;right:14px;z-index:2147483002;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#eafff3}",
      "#crypy-global-navigation *{box-sizing:border-box}",
      "#crypy-global-nav-toggle{display:flex;align-items:center;gap:9px;border:1px solid #00ff88;border-radius:999px;padding:11px 16px;background:#03130a;color:#00ff88;font-weight:800;font-size:13px;letter-spacing:.06em;box-shadow:0 0 18px #00ff8833;cursor:pointer}",
      "#crypy-global-nav-toggle:focus-visible,#crypy-global-navigation a:focus-visible,#crypy-global-navigation button:focus-visible,#crypy-global-navigation input:focus-visible{outline:2px solid #fff;outline-offset:3px}",
      "#crypy-global-nav-panel{display:none;position:fixed;top:68px;right:14px;width:min(460px,calc(100vw - 28px));max-height:calc(100dvh - 84px);overflow:hidden;border:1px solid #00ff88;border-radius:16px;background:#030a05;box-shadow:0 18px 60px #000b,0 0 24px #00ff8822}",
      "#crypy-global-nav-panel[data-open=true]{display:flex;flex-direction:column}",
      ".crypy-nav-head{padding:16px;border-bottom:1px solid #17462b;background:linear-gradient(135deg,#092014,#030a05)}",
      ".crypy-nav-title{font-size:14px;font-weight:900;letter-spacing:.12em;color:#00ff88}",
      ".crypy-nav-subtitle{font-size:11px;color:#a5cbb4;margin-top:4px}",
      ".crypy-nav-search{padding:12px 14px;border-bottom:1px solid #17462b}",
      ".crypy-nav-search input{width:100%;padding:11px 12px;border:1px solid #276542;border-radius:10px;background:#07170e;color:#eafff3;font-size:14px}",
      ".crypy-nav-count{font-size:11px;color:#a5cbb4;margin-top:7px}",
      ".crypy-nav-list{overflow:auto;padding:10px;overscroll-behavior:contain}",
      ".crypy-nav-categories{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
      ".crypy-nav-category{display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;padding:12px;border:1px solid #17613a;border-radius:10px;background:#07170e;color:#eafff3;font-size:12px;font-weight:800;cursor:pointer}",
      ".crypy-nav-category:hover{background:#0b2114;border-color:#00ff88;color:#00ff88}",
      ".crypy-nav-category small{color:#9bbda8;font-size:10px;white-space:nowrap}",
      ".crypy-nav-back{margin:0 0 10px;padding:8px 11px;border:1px solid #17613a;border-radius:8px;background:#07170e;color:#baffd8;font-weight:700;cursor:pointer}",
      ".crypy-nav-group{margin:5px 0 12px;border:1px solid #17462b;border-radius:12px;overflow:hidden;background:#041009}",
      ".crypy-nav-group-title{padding:10px 12px;background:#092014;border-bottom:1px solid #17613a;color:#00ff88;font-size:11px;letter-spacing:.1em;font-weight:900}",
      ".crypy-nav-link{display:flex;flex-direction:column;gap:2px;margin:3px 5px;padding:9px 10px;border-radius:9px;color:#eafff3;text-decoration:none;border:1px solid transparent}",
      ".crypy-nav-link:hover{background:#0b2114;border-color:#17613a}",
      ".crypy-nav-link strong{font-size:13px;font-weight:650}",
      ".crypy-nav-link small{font-size:10px;color:#9bbda8;overflow-wrap:anywhere}",
      ".crypy-nav-empty{padding:18px 12px;color:#a5cbb4;font-size:13px}",
      ".crypy-menu-caixa,.crypy-portal-nav,[aria-label='Portal CRYPY — 23 páginas'],.crypy-legacy-menu-hidden{display:none!important}",
      "@media(max-width:600px){#crypy-global-navigation{top:10px;right:10px}#crypy-global-nav-panel{top:62px;left:10px;right:10px;width:auto;max-height:calc(100dvh - 74px)}#crypy-global-nav-toggle{padding:10px 13px}.crypy-nav-categories{grid-template-columns:1fr}}",
      "@media(prefers-reduced-motion:reduce){#crypy-global-navigation *{scroll-behavior:auto!important;transition:none!important}}"
    ].join("\n");

    var toggle = node("button", {id:"crypy-global-nav-toggle",type:"button","aria-expanded":"false","aria-controls":"crypy-global-nav-panel"});
    toggle.appendChild(node("span", {}, "☰"));
    toggle.appendChild(node("span", {}, "MENU CRYPY"));
    var panel = node("section", {id:"crypy-global-nav-panel","data-open":"false","aria-label":"Menu global CRYPY"});
    var head = node("div", {className:"crypy-nav-head"});
    head.appendChild(node("div", {className:"crypy-nav-title"}, "COLMEIA CRYPY"));
    head.appendChild(node("div", {className:"crypy-nav-subtitle"}, "13 categorias oficiais · páginas conectadas por área"));
    var searchWrap = node("div", {className:"crypy-nav-search"});
    var search = node("input", {type:"search",placeholder:"Buscar página nas 13 categorias…","aria-label":"Buscar páginas"});
    var count = node("div", {className:"crypy-nav-count"}, "Índice carregado somente quando o menu for aberto.");
    searchWrap.appendChild(search);
    searchWrap.appendChild(count);
    var list = node("div", {className:"crypy-nav-list",role:"list"});
    panel.appendChild(head);
    panel.appendChild(searchWrap);
    panel.appendChild(list);

    var pages = [];
    var hiddenCount = 0;
    var duplicatesRemoved = 0;
    var sourceLabel = "aguardando";
    var selected = null;
    var indexLoading = false;
    var indexLoaded = false;

    function addPageLink(container, page) {
      var link = node("a", {
        className:"crypy-nav-link",
        href:new URL(page.path, siteRoot).href,
        target:"crypy-content",
        role:"listitem"
      });
      link.appendChild(node("strong", {}, page.label));
      link.appendChild(node("small", {}, page.path));
      container.appendChild(link);
    }

    function render() {
      var query = normalized(search.value);
      var matches = pages.filter(function (page) {
        var searchable = normalized(page.label + " " + page.path + " " + page.group);
        return !query || searchable.indexOf(query) !== -1;
      });
      count.textContent = "Exibindo " + matches.length + " de " + pages.length +
        " páginas únicas · " + duplicatesRemoved + " duplicadas e " + hiddenCount +
        " técnicas ocultadas · " + sourceLabel;
      list.replaceChildren();

      if (!matches.length) {
        list.appendChild(node("div", {className:"crypy-nav-empty"}, "Nenhuma página encontrada. Tente outro termo."));
        return;
      }

      if (query) {
        categories.forEach(function (category) {
          var subset = matches.filter(function (page) { return categoryFor(page).label === category.label; });
          if (!subset.length) return;
          var section = node("section", {className:"crypy-nav-group","aria-label":category.label});
          section.appendChild(node("div", {className:"crypy-nav-group-title"}, category.label + " · " + subset.length + " páginas"));
          subset.forEach(function (page) { addPageLink(section, page); });
          list.appendChild(section);
        });
        return;
      }

      if (selected) {
        var back = node("button", {className:"crypy-nav-back",type:"button"}, "← TODAS AS CATEGORIAS");
        back.addEventListener("click", function () { selected = null; render(); });
        list.appendChild(back);
        var selectedPages = matches.filter(function (page) { return categoryFor(page).label === selected; });
        list.appendChild(node("div", {className:"crypy-nav-group-title"}, selected + " · " + selectedPages.length + " páginas"));
        selectedPages.forEach(function (page) { addPageLink(list, page); });
        return;
      }

      var grid = node("div", {className:"crypy-nav-categories"});
      categories.forEach(function (category) {
        var total = matches.filter(function (page) { return categoryFor(page).label === category.label; }).length;
        var button = node("button", {className:"crypy-nav-category",type:"button"});
        button.appendChild(node("span", {}, category.label));
        button.appendChild(node("small", {}, String(total)));
        button.addEventListener("click", function () { selected = category.label; render(); });
        grid.appendChild(button);
      });
      list.appendChild(grid);
    }

    function applyIndex(data, source) {
      var result = filterAndDeduplicate(data.pages);
      pages = result.pages;
      hiddenCount = result.hiddenCount;
      duplicatesRemoved = result.duplicatesRemoved;
      sourceLabel = source;
      indexLoaded = true;
      render();
    }

    function fetchFreshIndex() {
      return fetch(manifestUrl.href, {cache:"default",credentials:"same-origin"})
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (data) {
          if (!data || !Array.isArray(data.pages)) throw new Error("Índice inválido");
          applyIndex(data, "índice atualizado");
          return writeMemoryBoostIndex(data);
        });
    }

    function loadIndex() {
      if (indexLoading || indexLoaded) return;
      indexLoading = true;
      count.textContent = "Recuperando índice local do Memory Boost…";
      list.replaceChildren(node("div", {className:"crypy-nav-empty"}, "Carregando páginas da Colmeia…"));

      readMemoryBoostIndex().then(function (cached) {
        if (cached && cached.data && Array.isArray(cached.data.pages)) {
          applyIndex(cached.data, "MEMORY BOOST local");
        }
        return fetchFreshIndex().catch(function () {
          if (indexLoaded) {
            sourceLabel = "offline · cache local";
            render();
          } else {
            sourceLabel = "indisponível";
            count.textContent = "Não foi possível carregar o índice.";
            list.replaceChildren(node("div", {className:"crypy-nav-empty"}, "Verifique sua conexão e tente abrir o menu novamente."));
            throw new Error("Índice indisponível e sem cache local");
          }
        });
      }).catch(function () {
        /* O menu permanece utilizável com o cache local sempre que houver. */
      }).then(function () {
        indexLoading = false;
        if (!indexLoaded) count.textContent = "Índice ainda não carregado. Feche e abra o menu para tentar novamente.";
      });
    }

    function open(value) {
      panel.setAttribute("data-open", value ? "true" : "false");
      toggle.setAttribute("aria-expanded", value ? "true" : "false");
      toggle.setAttribute("aria-label", value ? "Fechar menu CRYPY" : "Abrir menu CRYPY");
      if (value) loadIndex();
    }

    toggle.addEventListener("click", function () {
      open(panel.getAttribute("data-open") !== "true");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") open(false);
    });
    search.addEventListener("input", function () {
      selected = null;
      render();
    });

    root.appendChild(style);
    root.appendChild(panel);
    root.appendChild(toggle);
    document.body.appendChild(root);
    hideLegacyMenus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, {once:true});
  } else {
    mount();
  }
})();