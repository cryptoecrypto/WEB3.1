/* CRYPY WEB3.1 — relógio/eventos globais da Colmeia.
 * Fonte temporal: relógio do dispositivo. Não promete sincronização NTP.
 * Emite timestamps UTC para os módulos inscritos; não grava dados por segundo.
 */
(function () {
  "use strict";
  if (window.__CRYPY_GLOBAL_RUNTIME__) return;
  window.__CRYPY_GLOBAL_RUNTIME__ = true;

  var scriptUrl = document.currentScript && document.currentScript.src;
  var siteRoot = new URL("../../", scriptUrl || document.baseURI);
  var listeners = [];

  function snapshot(date) {
    var now = date instanceof Date ? date : new Date();
    var utc = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(now);
    var localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
    var local = new Intl.DateTimeFormat("pt-BR", {
      timeZone: localZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(now);
    return {
      epochMs: now.getTime(),
      timestamp: now.toISOString(),
      utc: utc,
      local: local,
      timeZone: localZone,
      offsetMinutes: -now.getTimezoneOffset(),
      source: "device-clock"
    };
  }

  window.CRPY_CLOCK_API = {
    now: snapshot,
    subscribe: function (fn) {
      if (typeof fn !== "function") return function () {};
      listeners.push(fn);
      try { fn(snapshot()); } catch (_) {}
      return function () {
        listeners = listeners.filter(function (item) { return item !== fn; });
      };
    }
  };

  function tick() {
    var data = snapshot();
    window.dispatchEvent(new CustomEvent("crypy:clock:tick", { detail: data }));
    window.dispatchEvent(new CustomEvent("baby-clock:tick", { detail: data }));
    listeners.slice().forEach(function (fn) { try { fn(data); } catch (_) {} });
  }

  function loadBabyChat() {
    var path = String(location.pathname || "").toLowerCase();
    var isBabyChat = /\/chatboot-baby-ia\.html$/.test(path);
    if (isBabyChat || new URLSearchParams(location.search).get("embed") === "1") return;
    if (document.querySelector('script[data-crypy-baby-chat="true"]')) return;
    var chat = document.createElement("script");
    var chatUrl = new URL("assets/js/baby-global-chat.js", siteRoot);
    chatUrl.searchParams.set("v", "20261128-global-colmeia-1");
    chat.src = chatUrl.href;
    chat.defer = true;
    chat.dataset.crypyBabyChat = "true";
    (document.head || document.documentElement).appendChild(chat);
  }

  function boot() {
    tick();
    window.setInterval(tick, 1000);
    loadBabyChat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();