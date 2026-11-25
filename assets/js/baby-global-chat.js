/* CRYPY / BABY — widget global do chatbot
 * Carrega o chat oficial em iframe para evitar copiar 62 KB de código em cada página.
 * Não concede acesso ao servidor, GitHub, Dropbox ou APIs externas.
 */
(function () {
  "use strict";
  var currentPath = String(location.pathname || "").toLowerCase();
  if (/\/chatboot-baby-ia\.html$/.test(currentPath) ||
      new URLSearchParams(location.search).get("embed") === "1") return;
  if (window.__CRYPY_BABY_GLOBAL_CHAT__) return;
  window.__CRYPY_BABY_GLOBAL_CHAT__ = true;
  var widgetScriptUrl = document.currentScript && document.currentScript.src;

  function mount() {
    if (document.getElementById("crypy-baby-global-root")) return;

    var root = document.createElement("div");
    root.id = "crypy-baby-global-root";

    var style = document.createElement("style");
    style.textContent = [
      "#crypy-baby-global-root{position:fixed;right:18px;bottom:18px;z-index:2147483000;font-family:system-ui,-apple-system,Segoe UI,sans-serif}",
      "#crypy-baby-global-root *{box-sizing:border-box}",
      "#crypy-baby-global-toggle{width:60px;height:60px;border:2px solid #00ff88;border-radius:50%;background:#03130a;color:#00ff88;box-shadow:0 0 18px rgba(0,255,136,.45);font-size:27px;cursor:pointer;display:flex;align-items:center;justify-content:center}",
      "#crypy-baby-global-toggle:focus-visible{outline:3px solid #fff;outline-offset:3px}",
      "#crypy-baby-global-panel{display:none;position:fixed;right:18px;bottom:90px;width:min(410px,calc(100vw - 28px));height:min(650px,calc(100dvh - 125px));min-height:360px;background:#000;border:1px solid #00ff88;border-radius:16px;overflow:hidden;box-shadow:0 0 28px rgba(0,255,136,.25)}",
      "#crypy-baby-global-panel[data-open='true']{display:block}",
      "#crypy-baby-global-frame{display:block;width:100%;height:100%;border:0;background:#000}",
      "@media(max-width:600px){#crypy-baby-global-root{right:12px;bottom:12px}#crypy-baby-global-toggle{width:56px;height:56px}#crypy-baby-global-panel{right:8px;bottom:78px;width:calc(100vw - 16px);height:calc(100dvh - 100px);min-height:320px;border-radius:13px}}",
      "@media(prefers-reduced-motion:no-preference){#crypy-baby-global-toggle{transition:transform .15s ease,box-shadow .15s ease}#crypy-baby-global-toggle:hover{transform:translateY(-2px);box-shadow:0 0 24px rgba(0,255,136,.65)}}"
    ].join("\n");

    var panel = document.createElement("section");
    panel.id = "crypy-baby-global-panel";
    panel.setAttribute("data-open", "false");
    panel.setAttribute("aria-label", "Chat do BABY I.A");

    var frame = document.createElement("iframe");
    frame.id = "crypy-baby-global-frame";
    frame.title = "BABY I.A — ChatBoot CRYPY";
    frame.loading = "lazy";
    frame.src = new URL("../chatboot-baby-ia.html?embed=1", widgetScriptUrl || document.baseURI).href;
    frame.referrerPolicy = "same-origin";
    panel.appendChild(frame);

    var button = document.createElement("button");
    button.id = "crypy-baby-global-toggle";
    button.type = "button";
    button.textContent = "🤖";
    button.setAttribute("aria-label", "Abrir conversa com BABY I.A");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", panel.id);

    function setOpen(open) {
      panel.setAttribute("data-open", open ? "true" : "false");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "Fechar conversa com BABY I.A" : "Abrir conversa com BABY I.A");
      button.textContent = open ? "×" : "🤖";
      if (open && frame.getAttribute("data-loaded") !== "true") {
        frame.setAttribute("data-loaded", "true");
      }
    }
    button.addEventListener("click", function () {
      setOpen(panel.getAttribute("data-open") !== "true");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.getAttribute("data-open") === "true") setOpen(false);
    });

    root.appendChild(style);
    root.appendChild(panel);
    root.appendChild(button);
    document.body.appendChild(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
