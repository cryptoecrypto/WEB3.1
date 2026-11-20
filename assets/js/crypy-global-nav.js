/* CRYPY WEB3.1 — Navegação global, menu único para todas as páginas.
 * A raiz do site é resolvida pela URL deste próprio arquivo, compatível
 * com domínio próprio e GitHub Pages em subcaminho.
 */
(function () {
  "use strict";
  if (window.__CRYPY_GLOBAL_NAV__) return;
  window.__CRYPY_GLOBAL_NAV__ = true;
  var scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) return;
  var siteRoot = new URL("../../", scriptUrl);
  var manifestUrl = new URL("assets/data/crypy-page-index.json", siteRoot);

  function node(tag, attrs, value) {
    var item = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") item.className = attrs[key];
      else item.setAttribute(key, attrs[key]);
    });
    if (value != null) item.textContent = value;
    return item;
  }

  function mount() {
    if (!document.body || document.getElementById("crypy-global-navigation")) return;
    /* A HOME e páginas que usam apenas a navegação global também recebem a Colmeia de Conversação. */
    if (!document.querySelector('script[data-crypy-squad-chat-loader="true"]')) {
      var assistantScript = node("script", { src:new URL("assets/js/crypy-page-assistant.js", siteRoot).href, defer:"", "data-crypy-squad-chat-loader":"true" });
      document.head.appendChild(assistantScript);
    }
    var root = node("div", { id: "crypy-global-navigation" });
    var style = node("style");
    style.textContent = [
      "#crypy-global-navigation{position:fixed;top:14px;right:14px;z-index:2147483002;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#eafff3}",
      "#crypy-global-navigation *{box-sizing:border-box}",
      "#crypy-global-nav-toggle{display:flex;align-items:center;gap:9px;border:1px solid #00ff88;border-radius:999px;padding:11px 16px;background:#03130a;color:#00ff88;font-weight:800;font-size:13px;letter-spacing:.06em;box-shadow:0 0 18px #00ff8833;cursor:pointer}",
      "#crypy-global-nav-toggle:focus-visible,#crypy-global-navigation a:focus-visible,#crypy-global-navigation input:focus-visible{outline:2px solid #fff;outline-offset:3px}",
      "#crypy-global-nav-panel{display:none;position:fixed;top:68px;right:14px;width:min(440px,calc(100vw - 28px));max-height:calc(100dvh - 84px);overflow:hidden;border:1px solid #00ff88;border-radius:16px;background:#030a05;box-shadow:0 18px 60px #000b,0 0 24px #00ff8822}",
      "#crypy-global-nav-panel[data-open=true]{display:flex;flex-direction:column}",
      ".crypy-nav-head{padding:16px 16px 12px;border-bottom:1px solid #17462b;background:linear-gradient(135deg,#092014,#030a05)}",
      ".crypy-nav-title{font-size:14px;font-weight:900;letter-spacing:.12em;color:#00ff88}",
      ".crypy-nav-subtitle{font-size:11px;color:#a5cbb4;margin-top:4px}",
      ".crypy-nav-shortcuts{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}",
      ".crypy-nav-shortcuts a{border:1px solid #17613a;border-radius:999px;padding:6px 10px;color:#baffd8;text-decoration:none;font-size:12px}",
      ".crypy-nav-search{padding:12px 14px;border-bottom:1px solid #17462b}",
      ".crypy-nav-search input{width:100%;padding:11px 12px;border:1px solid #276542;border-radius:10px;background:#07170e;color:#eafff3;font-size:14px}",
      ".crypy-nav-count{font-size:11px;color:#a5cbb4;margin-top:7px}",
      ".crypy-nav-list{overflow:auto;padding:8px;overscroll-behavior:contain}",
      ".crypy-nav-link{display:flex;flex-direction:column;gap:2px;padding:9px 10px;border-radius:9px;color:#eafff3;text-decoration:none;border:1px solid transparent}",
      ".crypy-nav-link:hover{background:#0b2114;border-color:#17613a}",
      ".crypy-nav-link strong{font-size:13px;font-weight:650}",
      ".crypy-nav-group{margin:5px 0 12px;border:1px solid #17462b;border-radius:12px;overflow:hidden;background:#041009}",
      ".crypy-nav-group-title{position:sticky;top:0;display:flex;justify-content:space-between;gap:10px;padding:10px 12px;background:#092014;border-bottom:1px solid #17613a;color:#00ff88;font-size:11px;letter-spacing:.1em;font-weight:900}",
      ".crypy-nav-group-title span{color:#a5cbb4;font-size:10px;letter-spacing:0;font-weight:600}",
      ".crypy-nav-group .crypy-nav-link{margin:2px 5px;padding:8px 9px}",
      ".crypy-nav-link small{font-size:10px;color:#9bbda8;overflow-wrap:anywhere}",
      ".crypy-nav-empty{padding:18px 12px;color:#a5cbb4;font-size:13px}",
      "@media(max-width:600px){#crypy-global-navigation{top:10px;right:10px}#crypy-global-nav-panel{top:62px;left:10px;right:10px;width:auto;max-height:calc(100dvh - 74px)}#crypy-global-nav-toggle{padding:10px 13px}}",
      "@media(prefers-reduced-motion:reduce){#crypy-global-navigation *{scroll-behavior:auto!important;transition:none!important}}"
    ].join("\n");

    var toggle = node("button", { id:"crypy-global-nav-toggle", type:"button", "aria-expanded":"false", "aria-controls":"crypy-global-nav-panel" });
    toggle.appendChild(node("span", {}, "☰"));
    toggle.appendChild(node("span", {}, "MENU CRYPY"));
    var panel = node("section", { id:"crypy-global-nav-panel", "data-open":"false", "aria-label":"Menu global CRYPY" });
    var head = node("div", { className:"crypy-nav-head" });
    head.appendChild(node("div", { className:"crypy-nav-title" }, "NAVEGAÇÃO WEB3.1"));
    head.appendChild(node("div", { className:"crypy-nav-subtitle" }, "Uma navegação comum para todas as páginas do CRYPY"));
    var shortcuts = node("div", { className:"crypy-nav-shortcuts" });
    [
      ["HOME","index.html"],
      ["BABY I.A","baby-ia.html"],
      ["CHATBOOT","chatboot-baby-ia.html"],
      ["NFT","nft-collection/collection-crypy-nft.html"],
      ["BIOGRAFIA","biografia/biografia.html"],
      ["GAMES","crypy-games-desafios/crypy-games-desafios.html"]
    ].forEach(function(item) {
      shortcuts.appendChild(node("a", { href:new URL(item[1],siteRoot).href, target:"crypy-content" }, item[0]));
    });
    head.appendChild(shortcuts);
    var searchWrap = node("div", { className:"crypy-nav-search" });
    var search = node("input", { type:"search", placeholder:"Buscar qualquer página pelo nome ou pasta…", "aria-label":"Buscar páginas" });
    var count = node("div", { className:"crypy-nav-count" }, "Carregando índice de páginas…");
    searchWrap.appendChild(search);
    searchWrap.appendChild(count);
    var list = node("div", { className:"crypy-nav-list", role:"list" });
    panel.appendChild(head);
    panel.appendChild(searchWrap);
    panel.appendChild(list);

    function open(value) {
      panel.setAttribute("data-open", value ? "true" : "false");
      toggle.setAttribute("aria-expanded", value ? "true" : "false");
      toggle.setAttribute("aria-label", value ? "Fechar menu CRYPY" : "Abrir menu CRYPY");
    }
    toggle.addEventListener("click", function() {
      open(panel.getAttribute("data-open") !== "true");
    });
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") open(false);
    });
    root.appendChild(style);
    root.appendChild(panel);
    root.appendChild(toggle);
    document.body.appendChild(root);

    var pages = [];
    function render() {
      var query = search.value.trim().toLocaleLowerCase("pt-BR");
      var matches = pages.filter(function(page) {
        return !query || (page.label + " " + page.path + " " + page.group).toLocaleLowerCase("pt-BR").includes(query);
      });
      count.textContent = "Exibindo " + matches.length + " de " + pages.length + " páginas · organizadas por área";
      list.replaceChildren();
      if (!matches.length) {
        list.appendChild(node("div", { className:"crypy-nav-empty" }, "Nenhuma página encontrada. Tente outro termo."));
        return;
      }
      var groups = {};
      matches.forEach(function(page) {
        var key = page.group || "OUTRAS PÁGINAS";
        if (!groups[key]) groups[key] = [];
        groups[key].push(page);
      });
      Object.keys(groups).sort(function(a,b) {
        if (a === "RAIZ") return -1;
        if (b === "RAIZ") return 1;
        return a.localeCompare(b, "pt-BR");
      }).forEach(function(groupName) {
        var section = node("section", { className:"crypy-nav-group", "aria-label":groupName });
        var heading = node("div", { className:"crypy-nav-group-title" });
        heading.appendChild(node("strong", {}, groupName.replace(/[-_]/g," ").toLocaleUpperCase("pt-BR")));
        heading.appendChild(node("span", {}, String(groups[groupName].length) + " páginas"));
        section.appendChild(heading);
        groups[groupName].sort(function(a,b) {
          return a.label.localeCompare(b.label,"pt-BR") || a.path.localeCompare(b.path,"pt-BR");
        }).forEach(function(page) {
          var link = node("a", { className:"crypy-nav-link", href:new URL(page.path,siteRoot).href, target:"crypy-content", role:"listitem" });
          link.appendChild(node("strong", {}, page.label));
          link.appendChild(node("small", {}, page.path));
          section.appendChild(link);
        });
        list.appendChild(section);
      });
    }
    search.addEventListener("input", render);
    fetch(manifestUrl.href, { cache:"no-cache" }).then(function(response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    }).then(function(data) {
      pages = Array.isArray(data.pages) ? data.pages : [];
      render();
    }).catch(function() {
      count.textContent = "Não foi possível carregar o índice de páginas.";
      list.appendChild(node("div", { className:"crypy-nav-empty" }, "Os atalhos principais continuam disponíveis. Verifique a publicação do índice."));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once:true });
  else mount();
})();
