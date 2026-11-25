/* CRYPY WEB3.1 — Menu único da Colmeia: 13 categorias oficiais. */
(function () {
  "use strict";
  if (window.__CRYPY_GLOBAL_NAV__) return;
  window.__CRYPY_GLOBAL_NAV__ = true;
  var scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) return;
  var siteRoot = new URL("../../", scriptUrl);
  if (!document.querySelector('script[data-crypy-global-runtime="true"]')) {
    var runtime = document.createElement("script");
    runtime.src = new URL("assets/js/crypy-global-runtime.js", siteRoot).href;
    runtime.defer = true;
    runtime.dataset.crypyGlobalRuntime = "true";
    (document.head || document.documentElement).appendChild(runtime);
  }
  // Camada visual dinâmica compartilhada: tema mensal + variação diária.
  if (!document.querySelector('script[data-crypy-dynamic-design="true"]')) {
    var dynamicDesign = document.createElement("script");
    dynamicDesign.src = new URL("assets/js/crypy-dynamic-design.js", siteRoot).href;
    dynamicDesign.dataset.crypyDynamicDesign = "true";
    dynamicDesign.async = true;
    (document.head || document.documentElement).appendChild(dynamicDesign);
  }
  // O quadro de mercado é carregado somente na Home, sem alterar o HTML principal.
  var currentPath = window.location.pathname.toLowerCase();
  var homeRootPath = new URL("./", siteRoot).pathname.toLowerCase();
  var homeIndexPath = new URL("index.html", siteRoot).pathname.toLowerCase();
  if (currentPath === homeRootPath || currentPath === homeIndexPath) {
    function loadBubblesScript() {
      if (document.querySelector('script[data-crypy-bubbles-loader="true"]')) return;
      var bubblesScript = document.createElement("script");
      bubblesScript.src = new URL("assets/js/crypy-market-bubbles.js", siteRoot).href;
      bubblesScript.dataset.crypyBubblesLoader = "true";
      document.head.appendChild(bubblesScript);
    }
    if (!document.querySelector('script[data-crypy-live-market-loader="true"]')) {
      var marketScript = document.createElement("script");
      marketScript.src = new URL("assets/js/crypy-live-market.js", siteRoot).href;
      marketScript.dataset.crypyLiveMarketLoader = "true";
      marketScript.onload = loadBubblesScript;
      marketScript.onerror = loadBubblesScript;
      document.head.appendChild(marketScript);
    } else {
      loadBubblesScript();
    }
  }
  var manifestUrl = new URL("assets/data/crypy-page-index.json", siteRoot);
  var officialMenuPaths = ["crypy-infinyt/portal.html","crypy-academy/academia.html","esquadrao-das-cores/esquadrao.html","nft-collection/galeria.html","biografia/historia.html","crypy-news/index.html","crypy-news/museu.html","art-figure-marketplace/marketplace.html","crypy-games-desafios/crypy-games-desafios.html","social-crypykut/comunidade.html","baby-ia/centro.html","crypy-coin/white-paper.html","contato/contato-oficial.html"];
  var categories = [
    {label:"CRYPY-INFINIT", groups:["crypy-infinyt"]},
    {label:"CRYPY-ACADEMY", groups:["crypy-academy","web3.1"]},
    {label:"ESQUADRÃO DAS CORES", groups:["esquadrao-das-cores"]},
    {label:"NFT-COLLECTION", groups:["nft-collection"]},
    {label:"BIOGRAFIA", groups:["biografia"]},
    {label:"CRYPY-NEWS", groups:["crypy-news"]},
    {label:"MUSEU DIGITAL", groups:["museu-digital"]},
    {label:"MARKETPLACE", groups:["art-figure-marketplace","marketing"]},
    {label:"CRYPY-GAMES", groups:["crypy-games-desafios"]},
    {label:"CRYPYCUT", groups:["social-crypykut","crypy-shots"]},
    {label:"BABY I.A.", groups:["baby-ia","RAIZ","memory-boost","padrao","pluguin","sincronizacao"]},
    {label:"WHITE PAPER", groups:["crypy-coin","white-paper"]},
    {label:"CONTATO", groups:["contato"]}
  ];

  function node(tag, attrs, value) {
    var item = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") item.className = attrs[key];
      else item.setAttribute(key, attrs[key]);
    });
    if (value != null) item.textContent = value;
    return item;
  }
  function categoryFor(page) {
    var group = String(page.group || "").toLowerCase();
    var pagePath = String(page.path || "").replace(/\\\\/g, "/").toLowerCase();
    var pathGroup = pagePath.split("/")[0];

    // Exceções de classificação: estas páginas vivem em grupos técnicos,
    // mas pertencem a categorias editoriais próprias do menu oficial.
    if (pagePath === "crypy-news/museu.html") return categories[6];
    if (pagePath === "crypy-coin/white-paper.html" || pagePath === "crypy-coin/crypy-coin.html") return categories[11];

    for (var i = 0; i < categories.length; i++) {
      if (categories[i].groups.indexOf(group) !== -1 || categories[i].groups.indexOf(pathGroup) !== -1) return categories[i];
    }
    return null;
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
    document.querySelectorAll(selector).forEach(function(el) {
      if (el.closest("#crypy-global-navigation")) return;
      if (el.classList.contains("crypy-legacy-menu-hidden")) return;
      var identity = (
        String(el.className || "") + " " +
        String(el.id || "") + " " +
        String(el.getAttribute("aria-label") || "")
      ).toLocaleLowerCase("pt-BR");
      var knownLegacy = /crypy.*(menu|nav)|(?:menu|nav).*crypy|portal-nav|menu-principal|main-menu|navbar|navigation-menu/.test(identity);
      var text = String(el.textContent || "").toLocaleUpperCase("pt-BR");
      var categoryHits = signatures.filter(function(label) { return text.includes(label); }).length;
      var linkCount = el.querySelectorAll("a").length;
      var navWithSeveralLinks = el.tagName.toLowerCase() === "nav" && linkCount >= 3;
      if (knownLegacy || categoryHits >= 2 || (navWithSeveralLinks && /menu|portal|navega|categoria/i.test(identity + " " + text.slice(0,180)))) {
        el.classList.add("crypy-legacy-menu-hidden");
      }
    });
  }

  function applySingleClockPolicy() {
    // Política única: manter apenas o relógio mundial global da Colmeia.
    // Esconde relógios duplicados por IDs/classes/data-attributes conhecidos,
    // inclusive widgets que sejam montados depois do carregamento inicial.
    var styleId = "crypy-single-world-clock-policy";
    if (!document.getElementById(styleId)) {
      var clockStyle = node("style", { id: styleId });
      clockStyle.textContent = [
        "body :is([id*='relogio' i],[class*='relogio' i],[id*='clock' i],[class*='clock' i],[id*='utc' i],[class*='utc' i],[data-clock],[data-clock-widget],[data-time-display]):not(#crypy-global-clock):not(#crypy-global-navigation):not(#crypy-baby-global-root){display:none!important;visibility:hidden!important}",
        "body #crypy-market-utc-time{display:none!important;visibility:hidden!important}",
        "body #crypy-global-clock{display:block!important;visibility:visible!important}"
      ].join("\\n");
      (document.head || document.documentElement).appendChild(clockStyle);
    }

    function suppressDuplicateClocks(root) {
      if (!root || !root.querySelectorAll) return;
      var selector = "[id*='relogio' i],[class*='relogio' i],[id*='clock' i],[class*='clock' i],[id*='utc' i],[class*='utc' i],[data-clock],[data-clock-widget],[data-time-display],#crypy-market-utc-time";
      var nodes = [];
      if (root.nodeType === 1 && root.matches && root.matches(selector)) nodes.push(root);
      Array.prototype.push.apply(nodes, root.querySelectorAll(selector));
      nodes.forEach(function (item) {
        if (item.id === "crypy-global-clock" || item.closest("#crypy-global-navigation,#crypy-baby-global-root")) return;
        if (/^(SCRIPT|STYLE|LINK)$/.test(item.tagName)) return;
        item.setAttribute("data-crypy-clock-hidden", "true");
        item.style.setProperty("display", "none", "important");
        item.style.setProperty("visibility", "hidden", "important");
      });
    }

    suppressDuplicateClocks(document);
    if (!window.__CRYPY_SINGLE_CLOCK_OBSERVER__ && document.documentElement) {
      window.__CRYPY_SINGLE_CLOCK_OBSERVER__ = true;
      var observer = new MutationObserver(function (records) {
        records.forEach(function (record) {
          Array.prototype.forEach.call(record.addedNodes, function (added) {
            if (added.nodeType === 1) suppressDuplicateClocks(added);
          });
        });
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    var clockLink = document.getElementById("crypy-global-clock");
    if (clockLink) {
      clockLink.setAttribute("aria-label", "Relógio Mundial CRYPY — único relógio global");
      clockLink.title = "Relógio Mundial CRYPY — único relógio global da Colmeia";
    }
  }

  function applyGlobalRgbSkin() {
    if (document.getElementById("crypy-global-rgb-skin")) return;
    var skin = node("style", {id:"crypy-global-rgb-skin"});
    skin.textContent = [
      ":root{--crypy-rgb-green:#00ff88;--crypy-rgb-blue:#269cff;--crypy-rgb-red:#ff3a58;--crypy-rgb-gold:#ffd35a}",
      "html,body{margin:0!important;padding:0!important;border:0!important}",
      "#fusion-top,.modulo,.modulo-corpo,.modulo-titulo,#nexus-banner{border:0!important;box-shadow:none!important;outline:0!important}",
      ".modulo,.modulo-corpo{padding:0!important;margin:0!important;background:transparent!important}",
      "::selection{background:rgba(0,255,136,.28);color:#fff}",
      "a:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--crypy-rgb-green)!important;outline-offset:3px}",
      "button:not(#crypy-global-nav-toggle),[role=button]{transition:box-shadow .2s ease,border-color .2s ease,filter .2s ease}",
      "button:not(#crypy-global-nav-toggle):hover,[role=button]:hover{box-shadow:0 0 16px rgba(0,255,136,.18),0 0 12px rgba(38,156,255,.12)}",
      "a:hover{filter:drop-shadow(0 0 6px rgba(0,255,136,.2))}",
      ":where(article,.card,.panel,.tile,.hive-card,.team-card,.module-card,.feature-card){border-color:rgba(0,255,136,.24)}",
      ":where(article,.card,.panel,.tile,.hive-card,.team-card,.module-card,.feature-card):hover{border-color:rgba(0,255,136,.65);box-shadow:0 0 18px rgba(0,255,136,.12),0 0 12px rgba(38,156,255,.08)}",
      "@media(prefers-reduced-motion:reduce){button,a,:where(article,.card,.panel,.tile,.hive-card,.team-card,.module-card,.feature-card){transition:none!important}}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(skin);
  }

  function mount() {
    if (!document.body || document.getElementById("crypy-global-navigation")) return;
    var root = node("div", {id:"crypy-global-navigation"});
    var style = node("style");
    style.textContent = [
      "#crypy-global-navigation{position:fixed;top:14px;left:14px;right:auto;z-index:2147483002;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#eafff3}",
      "#crypy-global-navigation *{box-sizing:border-box}",
      "#crypy-global-nav-toggle{display:flex;align-items:center;justify-content:center;gap:7px;min-width:48px;min-height:48px;border:2px solid #00ff88;border-radius:50%;padding:8px;background:#03130a;color:#00ff88;font-weight:900;font-size:20px;letter-spacing:0;box-shadow:0 0 18px #00ff8833,0 0 18px rgba(38,156,255,.18);cursor:pointer}",
      "#crypy-global-nav-toggle:focus-visible,#crypy-global-navigation a:focus-visible,#crypy-global-navigation button:focus-visible,#crypy-global-navigation input:focus-visible{outline:2px solid #fff;outline-offset:3px}",
      "#crypy-global-nav-panel{display:none;position:fixed;top:68px;left:14px;right:auto;width:min(460px,calc(100vw - 28px));max-height:calc(100dvh - 84px);overflow:hidden;border:1px solid #00ff88;border-radius:16px;background:#030a05;box-shadow:0 18px 60px #000b,0 0 24px #00ff8822}",
      "#crypy-global-nav-panel[data-open=true]{display:flex;flex-direction:column}",
      ".crypy-nav-head{padding:16px;border-bottom:1px solid #17462b;background:linear-gradient(135deg,#092014,#030a05)}",
      ".crypy-nav-title{font-size:14px;font-weight:900;letter-spacing:.12em;color:#00ff88}",
      ".crypy-nav-subtitle{font-size:11px;color:#a5cbb4;margin-top:4px}\n      .crypy-nav-catalog-link{display:inline-flex;align-items:center;margin-top:11px;padding:8px 11px;border:1px solid #00ff88;border-radius:9px;background:#06190d;color:#00ff88;text-decoration:none;font-size:11px;font-weight:900;letter-spacing:.04em}\n      .crypy-nav-catalog-link:hover{background:#00ff88;color:#00190a}",
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
      "@media(max-width:600px){#crypy-global-navigation{top:10px;left:10px;right:auto}#crypy-global-nav-panel{top:62px;left:10px;right:10px;width:auto;max-height:calc(100dvh - 74px)}#crypy-global-nav-toggle{padding:10px 13px}.crypy-nav-categories{grid-template-columns:1fr}}",
      "@media(prefers-reduced-motion:reduce){#crypy-global-navigation *{scroll-behavior:auto!important;transition:none!important}}"
    ].join("\n");

    var toggle = node("button",{id:"crypy-global-nav-toggle",type:"button","aria-expanded":"false","aria-controls":"crypy-global-nav-panel"});
    toggle.appendChild(node("span",{},"♾️"));
    toggle.appendChild(node("span",{},"MENU CRYPY"));
    var panel = node("section",{id:"crypy-global-nav-panel","data-open":"false","aria-label":"Menu global CRYPY"});
    var head = node("div",{className:"crypy-nav-head"});
    head.appendChild(node("div",{className:"crypy-nav-title"},"COLMEIA CRYPY"));
    head.appendChild(node("div",{className:"crypy-nav-subtitle"},"13 categorias oficiais · páginas conectadas por área"));
    var searchWrap = node("div",{className:"crypy-nav-search"});
    var search = node("input",{type:"search",placeholder:"Buscar página nas 13 categorias…","aria-label":"Buscar páginas"});
    var count = node("div",{className:"crypy-nav-count"},"Carregando índice de páginas…");
    searchWrap.appendChild(search);
    searchWrap.appendChild(count);
    var list = node("div",{className:"crypy-nav-list",role:"list"});
    panel.appendChild(head);
    panel.appendChild(searchWrap);
    panel.appendChild(list);
    function open(value) {
      panel.setAttribute("data-open",value?"true":"false");
      toggle.setAttribute("aria-expanded",value?"true":"false");
      toggle.setAttribute("aria-label",value?"Fechar menu CRYPY":"Abrir menu CRYPY");
    }
    toggle.addEventListener("click",function(){open(panel.getAttribute("data-open")!=="true");});
    document.addEventListener("keydown",function(event){if(event.key==="Escape")open(false);});
    root.appendChild(style);
    root.appendChild(panel);
    root.appendChild(toggle);
    document.body.appendChild(root);
    applyGlobalRgbSkin();
    applySingleClockPolicy();
    hideLegacyMenus();

    var pages = [];
    var selected = null;
    function addPageLink(container,page) {
      var link = node("a",{className:"crypy-nav-link",href:new URL(page.path,siteRoot).href,target:"crypy-content",role:"listitem"});
      link.appendChild(node("strong",{},page.label));
      link.appendChild(node("small",{},page.path));
      container.appendChild(link);
    }
    function render() {
      var query = search.value.trim().toLocaleLowerCase("pt-BR");
      var matches = pages.filter(function(page){
        return !query || (page.label+" "+page.path+" "+page.group).toLocaleLowerCase("pt-BR").includes(query);
      });
      count.textContent = "Exibindo "+matches.length+" de "+pages.length+" destinos oficiais · 13 categorias";
      list.replaceChildren();
      if (!matches.length) {
        list.appendChild(node("div",{className:"crypy-nav-empty"},"Nenhuma página encontrada. Tente outro termo."));
        return;
      }
      if (query) {
        categories.forEach(function(category){
          var subset = matches.filter(function(page){var assigned=categoryFor(page);return assigned && assigned.label===category.label;});
          if (!subset.length) return;
          var section = node("section",{className:"crypy-nav-group","aria-label":category.label});
          section.appendChild(node("div",{className:"crypy-nav-group-title"},category.label+" · "+subset.length+" páginas"));
          subset.sort(function(a,b){return a.label.localeCompare(b.label,"pt-BR")||a.path.localeCompare(b.path,"pt-BR");});
          subset.forEach(function(page){addPageLink(section,page);});
          list.appendChild(section);
        });
        return;
      }
      if (selected) {
        var back = node("button",{className:"crypy-nav-back",type:"button"},"← TODAS AS CATEGORIAS");
        back.addEventListener("click",function(){selected=null;render();});
        list.appendChild(back);
        var subset = matches.filter(function(page){var assigned=categoryFor(page);return assigned && assigned.label===selected;});
        list.appendChild(node("div",{className:"crypy-nav-group-title"},selected+" · "+subset.length+" páginas"));
        subset.sort(function(a,b){return a.label.localeCompare(b.label,"pt-BR")||a.path.localeCompare(b.path,"pt-BR");});
        subset.forEach(function(page){addPageLink(list,page);});
        return;
      }
      var grid = node("div",{className:"crypy-nav-categories"});
      categories.forEach(function(category){
        var total = matches.filter(function(page){var assigned=categoryFor(page);return assigned && assigned.label===category.label;}).length;
        var button = node("button",{className:"crypy-nav-category",type:"button"});
        button.appendChild(node("span",{},category.label));
        button.appendChild(node("small",{},String(total)));
        button.addEventListener("click",function(){selected=category.label;render();});
        grid.appendChild(button);
      });
      list.appendChild(grid);
    }
    search.addEventListener("input",function(){selected=null;render();});
    fetch(manifestUrl.href,{cache:"no-cache"}).then(function(response){
      if(!response.ok)throw new Error("HTTP "+response.status);
      return response.json();
    }).then(function(data){
      var indexedPages=Array.isArray(data.pages)?data.pages:[];
      function normalized(value) {
        return String(value||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase();
      }
      function hiddenByMenuRule(page) {
        var group=normalized(page.group);
        var fileName=String(page.path||"").split("/").pop().toLowerCase();
        var pageLabel=normalized(page.label);
        // BABY ChatBoot permanece acessível pelo endereço direto e pelo widget,
        // mas não aparece como destino em nenhum menu da Colmeia.
        if (fileName === "chatboot-baby-ia.html" || /chatboot baby ia/.test(pageLabel)) return true;
        var hiddenGroups=["memory-boost","padrao","pluguin","sincronizacao"];
        var pathSegments=String(page.path||"").split("/").map(normalized);
        var hiddenPathSegments=["memory-boost","momory-boost","padrao","pluguin","sincronizacao"];
        if (hiddenGroups.indexOf(group)!==-1 || pathSegments.some(function(segment){return hiddenPathSegments.indexOf(segment)!==-1;})) return true;
        var rawPath=String(page.path||"").toLowerCase();
        // Páginas operacionais/conta nunca entram no menu público.
        var restrictedPathRules=[
          /(^|\/)auto[-_ ]?config(?:\/|$|[-_])/,
          /(^|\/)(?:admin|administracao|painel-admin|dashboard-admin)(?:\/|$)/,
          /(^|\/)(?:login|signin|cadastro|registro)(?:\/|$)/,
          /(^|\/)(?:conta|account|perfil-privado|configuracoes|settings)(?:\/|$)/,
          /(^|\/)(?:seguranca|security|senha|password|wallet|carteira|notificacoes|notifications)(?:\/|$)/
        ];
        if (restrictedPathRules.some(function(rule){return rule.test(rawPath);})) return true;
        var searchable=normalized(String(page.path||"")+" "+String(page.label||""));
        var technicalRules=[
          /(^|[^a-z0-9])hd([^a-z0-9]|$)/,
          /plug[u]?in/,
          /sincronizacao/,
          /memor[y]?[-_ ]boost/,
          /momor[y]?[-_ ]boost/
        ];
        if (technicalRules.some(function(rule){return rule.test(searchable);})) return true;
        var isWorldClock=/relogio[-_ ]mundial/.test(searchable);
        if (isWorldClock) return String(page.path||"").toLowerCase()!=="relogio-mundial.html";
        return false;
      }
      pages=indexedPages.filter(function(page){
        if (hiddenByMenuRule(page)) return false;
        return categoryFor(page) !== null;
      });
      render();
    }).catch(function(){
      count.textContent="Não foi possível carregar o índice de páginas.";
      list.appendChild(node("div",{className:"crypy-nav-empty"},"Verifique a publicação de assets/data/crypy-page-index.json."));
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();