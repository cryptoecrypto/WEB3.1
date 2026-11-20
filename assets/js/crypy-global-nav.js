/* CRYPY WEB3.1 — MENU GLOBAL ÚNICO
 * Os 12 rótulos são a única navegação principal permitida em todas as páginas.
 * Destinos são rotas reais do repositório; navegação ocorre na mesma janela.
 */
(function () {
  "use strict";
  if (window.__CRYPY_GLOBAL_NAV__) return;
  window.__CRYPY_GLOBAL_NAV__ = true;
  var scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) return;
  var siteRoot = new URL("../../", scriptUrl);

  var AREAS = [
    ["NFT", "nft-collection/galeria.html"],
    ["ACADEMY", "crypy-academy/academia.html"],
    ["BIOGRAFIA", "biografia/historia.html"],
    ["MUSEU", "crypy-news/museu.html"],
    ["MARKETPLACE", "art-figure-marketplace/marketplace.html"],
    ["GAMES", "crypy-games-desafios/crypy-games-desafios.html"],
    ["SOCIAL", "social-crypykut/comunidade.html"],
    ["BABY I.A.", "baby-ia.html"],
    ["WHITE PAPER", "crypy-coin/white-paper.html"],
    ["CONTATO", "contato/contato-oficial.html"],
    ["ESQUADRÃO", "esquadrao-das-cores/esquadrao.html"],
    ["INFINYT", "crypy-infinyt/portal.html"]
  ];

  function node(tag, attrs, value) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") el.className = attrs[key];
      else el.setAttribute(key, attrs[key]);
    });
    if (value != null) el.textContent = value;
    return el;
  }

  function removeLegacyMenus(root) {
    var selectors = [
      "nav", '[role="navigation"]', ".main-nav", ".navbar", ".site-nav",
      ".site-navigation", ".menu-nav", ".crypy-portal-nav", ".ok-main-nav",
      "#main-menu"
    ].join(",");
    document.querySelectorAll(selectors).forEach(function (el) {
      if (root.contains(el)) return;
      if (el.closest("iframe")) return;
      el.setAttribute("data-crypy-legacy-menu", "true");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function mount() {
    if (!document.body || document.getElementById("crypy-global-navigation")) return;
    var root = node("div", { id:"crypy-global-navigation", "aria-label":"Menu principal CRYPY" });
    var style = node("style");
    style.textContent = [
      "#crypy-global-navigation{position:fixed;top:14px;right:14px;z-index:2147483002;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#eafff3}",
      "#crypy-global-navigation *{box-sizing:border-box}",
      "[data-crypy-legacy-menu=true]{display:none!important}",
      "#crypy-global-nav-toggle{display:grid;place-items:center;width:48px;height:48px;border:1px solid #00ff88;border-radius:50%;background:#03130a;color:#00ff88;font-size:22px;box-shadow:0 0 18px #00ff8833;cursor:pointer}",
      "#crypy-global-nav-toggle:focus-visible,#crypy-global-navigation a:focus-visible{outline:2px solid #fff;outline-offset:3px}",
      "#crypy-global-nav-panel{display:none;position:fixed;top:70px;right:14px;width:min(420px,calc(100vw - 28px));max-height:calc(100dvh - 86px);overflow:auto;border:1px solid #00ff88;border-radius:16px;background:#030a05;box-shadow:0 18px 60px #000b,0 0 24px #00ff8822;padding:12px}",
      "#crypy-global-nav-panel[data-open=true]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}",
      ".crypy-nav-link{display:flex;align-items:center;justify-content:center;min-height:46px;padding:10px 8px;border:1px solid #17613a;border-radius:10px;background:#07170e;color:#dfffea;text-decoration:none;text-align:center;font-size:12px;font-weight:850;letter-spacing:.035em}",
      ".crypy-nav-link:hover,.crypy-nav-link[aria-current=page]{background:#00ff88;border-color:#00ff88;color:#001b0b;box-shadow:0 0 15px #00ff8840}",
      "@media(max-width:600px){#crypy-global-navigation{top:9px;right:9px}#crypy-global-nav-toggle{width:44px;height:44px}#crypy-global-nav-panel{top:62px;left:9px;right:9px;width:auto;max-height:calc(100dvh - 72px);padding:9px;gap:7px}.crypy-nav-link{min-height:43px;font-size:11px}}",
      "@media(max-width:340px){#crypy-global-nav-panel[data-open=true]{grid-template-columns:1fr}}",
      "@media(prefers-reduced-motion:reduce){#crypy-global-navigation *{scroll-behavior:auto!important;transition:none!important}}"
    ].join("\n");

    var toggle = node("button", {
      id:"crypy-global-nav-toggle", type:"button",
      "aria-expanded":"false", "aria-controls":"crypy-global-nav-panel",
      "aria-label":"Abrir menu principal"
    }, "☰");
    var panel = node("nav", {
      id:"crypy-global-nav-panel", "data-open":"false",
      "aria-label":"12 áreas principais"
    });

    AREAS.forEach(function (area) {
      var link = node("a", {
        className:"crypy-nav-link",
        href:new URL(area[1], siteRoot).href
      }, area[0]);
      panel.appendChild(link);
    });

    function open(value) {
      panel.setAttribute("data-open", value ? "true" : "false");
      toggle.setAttribute("aria-expanded", value ? "true" : "false");
      toggle.setAttribute("aria-label", value ? "Fechar menu principal" : "Abrir menu principal");
    }
    toggle.addEventListener("click", function () {
      open(panel.getAttribute("data-open") !== "true");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") open(false);
    });

    root.appendChild(style);
    root.appendChild(panel);
    root.appendChild(toggle);
    document.body.appendChild(root);
    removeLegacyMenus(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once:true });
  else mount();
})();
