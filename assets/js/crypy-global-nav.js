/* CRYPY WEB3.1 — Menu único da Colmeia: 13 categorias oficiais. */
(function () {
  "use strict";
  if (window.__CRYPY_GLOBAL_NAV__) return;
  window.__CRYPY_GLOBAL_NAV__ = true;
  var scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) return;
  var siteRoot = new URL("../../", scriptUrl);
  var manifestUrl = new URL("assets/data/crypy-page-index.json", siteRoot);
  var categories = [
    {label:"CRYPY-INFINIT", groups:["crypy-infinyt","baby-ia","memory-boost","padrao","pluguin","sincronizacao","RAIZ"]},
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
    var pathGroup = String(page.path || "").split("/")[0].toLowerCase();
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].groups.indexOf(group) !== -1 || categories[i].groups.indexOf(pathGroup) !== -1) return categories[i];
    }
    return categories[0];
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
      ".crypy-menu-caixa,.crypy-portal-nav,[aria-label='Portal CRYPY — 23 páginas']{display:none!important}",
      "@media(max-width:600px){#crypy-global-navigation{top:10px;right:10px}#crypy-global-nav-panel{top:62px;left:10px;right:10px;width:auto;max-height:calc(100dvh - 74px)}#crypy-global-nav-toggle{padding:10px 13px}.crypy-nav-categories{grid-template-columns:1fr}}",
      "@media(prefers-reduced-motion:reduce){#crypy-global-navigation *{scroll-behavior:auto!important;transition:none!important}}"
    ].join("\n");

    var toggle = node("button",{id:"crypy-global-nav-toggle",type:"button","aria-expanded":"false","aria-controls":"crypy-global-nav-panel"});
    toggle.appendChild(node("span",{},"☰"));
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
      count.textContent = "Exibindo "+matches.length+" de "+pages.length+" páginas · 13 categorias oficiais";
      list.replaceChildren();
      if (!matches.length) {
        list.appendChild(node("div",{className:"crypy-nav-empty"},"Nenhuma página encontrada. Tente outro termo."));
        return;
      }
      if (query) {
        categories.forEach(function(category){
          var subset = matches.filter(function(page){return categoryFor(page).label===category.label;});
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
        var subset = matches.filter(function(page){return categoryFor(page).label===selected;});
        list.appendChild(node("div",{className:"crypy-nav-group-title"},selected+" · "+subset.length+" páginas"));
        subset.sort(function(a,b){return a.label.localeCompare(b.label,"pt-BR")||a.path.localeCompare(b.path,"pt-BR");});
        subset.forEach(function(page){addPageLink(list,page);});
        return;
      }
      var grid = node("div",{className:"crypy-nav-categories"});
      categories.forEach(function(category){
        var total = matches.filter(function(page){return categoryFor(page).label===category.label;}).length;
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
      pages=Array.isArray(data.pages)?data.pages:[];
      render();
    }).catch(function(){
      count.textContent="Não foi possível carregar o índice de páginas.";
      list.appendChild(node("div",{className:"crypy-nav-empty"},"Verifique a publicação de assets/data/crypy-page-index.json."));
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();