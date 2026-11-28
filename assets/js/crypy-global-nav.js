/* CRYPY WEB3.1 — Menu único da Colmeia: 13 categorias oficiais. */
(function () {
  "use strict";
  if (window.__CRYPY_GLOBAL_NAV__) return;
  window.__CRYPY_GLOBAL_NAV__ = true;
  var scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) return;
  var siteRoot = new URL("../../", scriptUrl);
  if (window.top === window.self && !document.querySelector('script[data-crypy-global-runtime="true"]')) {
    var runtime = document.createElement("script");
    var runtimeUrl = new URL("assets/js/crypy-global-runtime.js", siteRoot);
    runtimeUrl.searchParams.set("v", "20261128-global-colmeia-1");
    runtime.src = runtimeUrl.href;
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
  // Calendário 3D compartilhado: datas especiais e avisos editoriais pré-programados do BABY.
  if (window.top === window.self && !document.querySelector('script[data-crypy-3d-calendar="true"]')) {
    var calendarScript = document.createElement("script");
    calendarScript.src = new URL("assets/js/crypy-3d-calendar.js", siteRoot).href;
    calendarScript.dataset.crypy3dCalendar = "true";
    calendarScript.async = true;
    (document.head || document.documentElement).appendChild(calendarScript);
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
  var officialMenuPaths = ["CRYPY-INFINYT/index.html","NFT-COLLECTION/NFT-CRYPY-CARDS/nft-crypy-cards.html","ESQUADRÃO-DAS-CORES/esquadrao.html","CRYPY-ACADEMY/academia.html","BIOGRAFIA/historia.html","CRYPY-NEWS/index.html","CRYPY-NEWS/museu.html","ART-FIGURE-MARKETPLACE/marketplace.html","CRYPY-GAMES-ARCADE/CRYPY-LAND/crypy-land.html","CRYPY-SHOTS/01-feed-para-voce.html","BABY-IA/centro.html","CRYPY-COIN/white-paper.html","CONTATO/contato-oficial.html"];
  var categories = [
    {label:"CRYPY INFINYT", groups:["crypy-infinyt"]},
    {label:"NFT-COLLECTION", groups:["nft-collection"]},
    {label:"ESQUADRÃO DAS CORES", groups:["esquadrao-das-cores"]},
    {label:"CRYPY ACADEMY", groups:["crypy-academy"]},
    {label:"BIOGRAFIA", groups:["biografia"]},
    {label:"CRYPY NEWS", groups:["crypy-news"]},
    {label:"MUSEU DIGITAL", groups:["museu-digital"]},
    {label:"ART-FIGURE / MARKETPLACE", groups:["art-figure-marketplace"]},
    {label:"CRYPY GAMES-ARCADE", groups:["crypy-games-arcade"]},
    {label:"CRYPY-SOCIAL", groups:["crypy-social"]},
    {label:"BABY I.A.", groups:["baby-ia"]},
    {label:"WHITE PAPER / CRYPY COIN", groups:["crypy-coin"]},
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
    if (pagePath.indexOf("crypy-games-arcade/crypy-land/") === 0) return categories[8];

    for (var i = 0; i < categories.length; i++) {
      if (categories[i].groups.indexOf(group) !== -1 || categories[i].groups.indexOf(pathGroup) !== -1) return categories[i];
    }
    return null;
  }
  function hideLegacyMenus() {
    var signatures = [
      "CRYPY INFINYT","CRYPY-INFINIT","NFT-COLLECTION","ESQUADRÃO DAS CORES",
      "CRYPY ACADEMY","CRYPY-ACADEMY","BIOGRAFIA","CRYPY-NEWS",
      "MUSEU DIGITAL","MARKETPLACE","CRYPY-GAMES","CRYPYCUT","CRYPY-SOCIAL",
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
    var path = window.location.pathname.toLowerCase();
    var canonicalPath = new URL("relogio-mundial.html", siteRoot).pathname.toLowerCase();
    var isCanonicalClock = path === canonicalPath;
    var styleId = "crypy-single-clock-policy";
    if (!document.getElementById(styleId)) {
      var clockStyle = document.createElement("style");
      clockStyle.id = styleId;
      clockStyle.textContent = "body.crypy-duplicate-world-clock > header,body.crypy-duplicate-world-clock > main,body.crypy-duplicate-world-clock > section.panel,body.crypy-duplicate-world-clock > footer{display:none!important} body.crypy-main-world-clock #grid{display:none!important} #crypy-live-market #crypy-market-utc-time{display:none!important}";
      (document.head || document.documentElement).appendChild(clockStyle);
    }
    if (path.indexOf("relogio-mundial.html") !== -1 && !isCanonicalClock) document.body.classList.add("crypy-duplicate-world-clock");
    if (isCanonicalClock) document.body.classList.add("crypy-main-world-clock");
    var utcClock = document.getElementById("crypy-market-utc-time");
    if (utcClock && utcClock.parentElement) utcClock.parentElement.style.display = "none";
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
      "#crypy-global-navigation{position:fixed;top:0;left:0;right:0;z-index:2147483002;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#eafff3;pointer-events:none}",
      "#crypy-global-navigation *{box-sizing:border-box}",
      "#crypy-global-nav-toggle{pointer-events:auto;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:54px;border:0;border-bottom:1px solid #17613a;border-radius:0;padding:10px 22px;background:linear-gradient(100deg,#020805f5,#06190df5 55%,#020805f5);color:#00ff88;font-weight:950;font-size:13px;letter-spacing:.14em;box-shadow:0 8px 24px #0008;cursor:pointer;text-align:left}",
      "#crypy-global-nav-toggle:focus-visible,#crypy-global-navigation a:focus-visible,#crypy-global-navigation button:focus-visible,#crypy-global-navigation input:focus-visible{outline:2px solid #fff;outline-offset:3px}",
      "#crypy-global-nav-panel{pointer-events:auto;display:none;position:fixed;top:62px;left:3vw;right:3vw;width:auto;max-width:1280px;margin:auto;max-height:calc(100dvh - 76px);overflow:hidden;border:1px solid #00ff88;border-radius:18px;background:linear-gradient(145deg,#030a05,#06150b 60%,#020805);box-shadow:0 24px 80px #000e,0 0 30px #00ff8828;perspective:1400px;transform-style:preserve-3d}",
      "#crypy-global-nav-panel[data-open=true]{display:flex;flex-direction:column}",
      ".crypy-nav-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid #17462b;background:linear-gradient(100deg,#092014,#030a05)}",
      ".crypy-nav-title{font-size:14px;font-weight:900;letter-spacing:.12em;color:#00ff88}",
      ".crypy-nav-subtitle{font-size:11px;color:#a5cbb4;margin-top:4px}",
      ".crypy-nav-close{flex:0 0 auto;min-width:42px;min-height:42px;border:1px solid #17613a;border-radius:10px;background:#06190d;color:#00ff88;font-size:22px;cursor:pointer}",
      ".crypy-nav-search{padding:12px 14px;border-bottom:1px solid #17462b}",
      ".crypy-nav-search input{width:100%;padding:11px 12px;border:1px solid #276542;border-radius:10px;background:#07170e;color:#eafff3;font-size:14px}",
      ".crypy-nav-count{font-size:11px;color:#a5cbb4;margin-top:7px}",
      ".crypy-nav-list{overflow:auto;padding:18px;overscroll-behavior:contain}",
      ".crypy-nav-categories{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;perspective:1200px}",
      ".crypy-nav-category{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:66px;text-align:left;padding:14px 16px;border:1px solid #17613a;border-radius:13px;background:linear-gradient(135deg,#07170e,#041009);color:#eafff3;font-size:13px;font-weight:850;cursor:pointer;transform-style:preserve-3d;transition:transform .22s ease,border-color .22s ease,background .22s ease,box-shadow .22s ease;box-shadow:0 8px 18px #0007}",
      ".crypy-nav-category:hover{transform:perspective(700px) rotateX(-3deg) rotateY(3deg) translateY(-3px) translateZ(10px);background:#0b2114;border-color:#00ff88;color:#00ff88;box-shadow:0 16px 28px #0009,0 0 22px #00ff8833}",
      ".crypy-nav-category small{color:#9bbda8;font-size:10px;white-space:nowrap}",
      ".crypy-nav-back{margin:0 0 10px;padding:8px 11px;border:1px solid #17613a;border-radius:8px;background:#07170e;color:#baffd8;font-weight:700;cursor:pointer}",
      ".crypy-nav-group{margin:5px 0 12px;border:1px solid #17462b;border-radius:12px;overflow:hidden;background:#041009}",
      ".crypy-nav-group-title{padding:10px 12px;background:#092014;border-bottom:1px solid #17613a;color:#00ff88;font-size:11px;letter-spacing:.1em;font-weight:900}",
      ".crypy-nav-link{display:flex;flex-direction:column;gap:3px;margin:4px 0;padding:13px 15px;border-radius:10px;color:#eafff3;text-decoration:none;border:1px solid #123b24;background:#06130a}",
      ".crypy-nav-link:hover{background:#0b2114;border-color:#17613a}",
      ".crypy-nav-link strong{font-size:13px;font-weight:650}",
      ".crypy-nav-link small{font-size:10px;color:#9bbda8;overflow-wrap:anywhere}",
      ".crypy-nav-empty{padding:18px 12px;color:#a5cbb4;font-size:13px}",
      ".crypy-nav-index-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}",
      ".crypy-nav-index{display:flex;flex-direction:column;gap:5px;padding:13px;border:1px solid #17613a;border-radius:12px;background:linear-gradient(145deg,#07170e,#041009);color:#eafff3;text-decoration:none;transform-style:preserve-3d;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}",
      ".crypy-nav-index:hover{transform:perspective(700px) rotateX(-2deg) rotateY(2deg) translateZ(8px);border-color:#00ff88;box-shadow:0 12px 24px #0009,0 0 18px #00ff8833}",
      ".crypy-nav-index strong{color:#00ff88;font-size:12px}",
      ".crypy-nav-index small{color:#9bbda8;font-size:10px}",
      ".crypy-nav-index.is-empty{opacity:.48;border-style:dashed;pointer-events:none}",
      ".crypy-nav-detail{max-width:900px;margin:0 auto}",
      ".crypy-nav-detail .crypy-nav-group-title{margin:10px 0 12px;border-radius:10px}",
      ".crypy-nav-brand{display:flex;align-items:center;gap:12px}",
      ".crypy-nav-symbol{display:grid;place-items:center;width:34px;height:34px;border:1px solid #00ff88;border-radius:10px;color:#00ff88;font-size:20px;box-shadow:0 0 15px #00ff8833}",
      ".crypy-menu-caixa,.crypy-portal-nav,[aria-label='Portal CRYPY — 23 páginas'],.crypy-legacy-menu-hidden{display:none!important}",
      "@media(max-width:900px){.crypy-nav-categories{grid-template-columns:repeat(2,minmax(0,1fr))}}",
      "@media(max-width:600px){.crypy-nav-index-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#crypy-global-navigation{top:8px;left:8px;right:8px}#crypy-global-nav-toggle{width:auto;min-width:150px;min-height:48px;border:1px solid #00ff88;border-radius:14px;padding:9px 14px;background:#03130af5;box-shadow:0 8px 28px #000a,0 0 18px #00ff8822}#crypy-global-nav-panel{top:64px;left:0;right:0;bottom:0;width:auto;max-width:none;max-height:none;border-radius:16px;display:none}#crypy-global-nav-panel[data-open=true]{display:flex}.crypy-nav-head{padding:13px 14px}.crypy-nav-list{padding:12px}.crypy-nav-categories{grid-template-columns:1fr;gap:8px}.crypy-nav-category{min-height:54px;padding:12px 14px}.crypy-nav-search{padding:10px 12px}.crypy-nav-link{padding:13px}.crypy-nav-title{font-size:13px}}",
      "@media(prefers-reduced-motion:reduce){#crypy-global-navigation *{scroll-behavior:auto!important;transition:none!important}}"
    ].join("\n");

    var toggle = node("button",{id:"crypy-global-nav-toggle",type:"button","aria-expanded":"false","aria-controls":"crypy-global-nav-panel"});
    toggle.appendChild(node("span",{},"☰"));
    toggle.appendChild(node("span",{},"MENU CRYPY"));
    toggle.appendChild(node("span",{},"13 TEMAS + 9 ÍNDICES"));
    var panel = node("section",{id:"crypy-global-nav-panel","data-open":"false","aria-label":"Menu global CRYPY"});
    var head = node("div",{className:"crypy-nav-head"});
    var headBrand = node("div",{className:"crypy-nav-brand"});
    headBrand.appendChild(node("div",{className:"crypy-nav-symbol"},"V"));
    var headText = node("div",{});
    headText.appendChild(node("div",{className:"crypy-nav-title"},"COLMEIA CRYPY"));
    headText.appendChild(node("div",{className:"crypy-nav-subtitle"},"INFINYT · COLMEIA · BABY I.A. · ESQUADRÃO · MENU 3D · CORES VIVAS"));
    headBrand.appendChild(headText);
    var closeButton = node("button",{className:"crypy-nav-close",type:"button","aria-label":"Fechar menu"},"×");
    head.appendChild(headBrand);
    head.appendChild(closeButton);
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
    closeButton.addEventListener("click",function(){open(false);});
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
      var destination = new URL(page.path,siteRoot).href;
      var link = node("a",{className:"crypy-nav-link",href:destination,target:"_self",role:"listitem"});
      var homeFrame = document.getElementById("page-frame");
      if (homeFrame) {
        link.addEventListener("click",function(event){
          event.preventDefault();
          homeFrame.src = destination;
          homeFrame.title = "CRYPY · WEB3.1 — " + page.label;
          var openPage = document.getElementById("open-page");
          if (openPage) openPage.href = destination;
          var status = document.getElementById("page-status");
          if (status) status.textContent = "Área selecionada: " + page.label;
          if (window.history && window.history.replaceState) window.history.replaceState(null,"","#"+encodeURIComponent(page.path));
          open(false);
        });
      }
      link.appendChild(node("strong",{},page.label));
      link.appendChild(node("small",{},page.path));
      container.appendChild(link);
    }
    function render() {
      var query = search.value.trim().toLocaleLowerCase("pt-BR");
      var matches = pages.filter(function(page){
        return !query || (page.label+" "+page.path+" "+page.group).toLocaleLowerCase("pt-BR").includes(query);
      });
      count.textContent = "13 temas oficiais · 9 índices · "+matches.length+" destinos nesta busca";
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
        if (selected === "ÍNDICES DA COLMEIA") {
          var indexes = [
            {file:"index.html",name:"PORTAL",desc:"Entrada principal"},
            {file:"index2.html",name:"RESERVA 02",desc:"Arquivo vazio",empty:true},
            {file:"lucy-pdf.pdf",name:"LUCY",desc:"Documento PDF · arquivo oficial"},
            {file:"blog.html",name:"BLOG",desc:"Blog da Colmeia CRYPY"},
            {file:"index5.html",name:"MATRIX",desc:"Home Matrix"},
            {file:"index6.html",name:"COLMEIA",desc:"Sistema"},
            {file:"index7.html",name:"NOTÍCIAS",desc:"Atalho editorial"},
            {file:"index8.html",name:"INFINYT",desc:"Home Infinyt"},
            {file:"index9.html",name:"CATÁLOGO",desc:"Catálogo de páginas"}
          ];
          var indexWrap = node("div",{className:"crypy-nav-detail"});
          indexWrap.appendChild(node("div",{className:"crypy-nav-group-title"},"9 ÍNDICES · PORTAS DA COLMEIA"));
          var indexGrid = node("div",{className:"crypy-nav-index-grid"});
          indexes.forEach(function(item){
            var card = node(item.empty?"div":"a",{className:"crypy-nav-index"+(item.empty?" is-empty":""),href:item.empty?"#":new URL(item.file,siteRoot).href});
            card.appendChild(node("strong",{},item.name));
            card.appendChild(node("small",{},item.desc));
            indexGrid.appendChild(card);
          });
          indexWrap.appendChild(indexGrid);
          list.appendChild(indexWrap);
          return;
        }
        var detail = node("div",{className:"crypy-nav-detail"});
        var subset = matches.filter(function(page){var assigned=categoryFor(page);return assigned && assigned.label===selected;});
        detail.appendChild(node("div",{className:"crypy-nav-group-title"},selected+" · "+subset.length+" páginas"));
        subset.sort(function(a,b){return a.label.localeCompare(b.label,"pt-BR")||a.path.localeCompare(b.path,"pt-BR");});
        subset.forEach(function(page){addPageLink(detail,page);});
        list.appendChild(detail);
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
      var indexButton = node("button",{className:"crypy-nav-category",type:"button"});
      indexButton.appendChild(node("span",{},"9 ÍNDICES DA COLMEIA"));
      indexButton.appendChild(node("small",{},"9"));
      indexButton.addEventListener("click",function(){selected="ÍNDICES DA COLMEIA";render();});
      grid.appendChild(indexButton);
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
        if (rawPath.indexOf("crypy-13-chatboots/") === 0) return true;
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
        if (isWorldClock) return true;
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
  var embeddedInHome = false;
  try { embeddedInHome = window.parent !== window && !!window.parent.document.getElementById("page-frame"); } catch (error) { embeddedInHome = false; }
  if (!embeddedInHome) {
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
    else mount();
  }
})();