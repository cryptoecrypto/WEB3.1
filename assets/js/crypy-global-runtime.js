/* CRYPY WEB3.1 — relógio/eventos globais da Colmeia.
 * Sincronização: endpoint público /health do servidor BABY configurado.
 * Contingência: relógio do dispositivo, sempre identificado como não sincronizado.
 * Não grava dados por segundo nem transmite tokens.
 */
(function () {
  "use strict";
  if (window.__CRYPY_GLOBAL_RUNTIME__) return;
  window.__CRYPY_GLOBAL_RUNTIME__ = true;

  var DEFAULT_SERVER = "https://baby-site-auth-production.up.railway.app";
  var scriptUrl = document.currentScript && document.currentScript.src;
  var siteRoot = new URL("../../", scriptUrl || document.baseURI);
  var listeners = [];
  var clockLink = null;
  var anchorEpoch = null;
  var anchorPerf = null;
  var syncState = { synced: false, source: "device-clock", lastSync: null, roundTripMs: null, error: "Aguardando sincronização do servidor." };

  function serverBase() {
    try {
      var configured = window.localStorage.getItem("crypy_server_url") || DEFAULT_SERVER;
      var url = new URL(configured);
      if (url.protocol !== "https:" || url.username || url.password) return null;
      return url.origin;
    } catch (_) { return null; }
  }

  function currentDate() {
    if (anchorEpoch !== null && anchorPerf !== null && window.performance && typeof performance.now === "function") {
      return new Date(anchorEpoch + (performance.now() - anchorPerf));
    }
    return new Date();
  }

  function snapshot(date) {
    var now = date instanceof Date ? date : currentDate();
    var utc = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(now);
    var localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
    var local = new Intl.DateTimeFormat("pt-BR", {
      timeZone: localZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(now);
    return {
      epochMs: now.getTime(), timestamp: now.toISOString(), utc: utc, local: local,
      timeZone: localZone, offsetMinutes: -now.getTimezoneOffset(),
      source: syncState.source, synced: syncState.synced, lastSync: syncState.lastSync,
      roundTripMs: syncState.roundTripMs, syncError: syncState.error
    };
  }

  async function syncServerTime() {
    var base = serverBase();
    if (!base || typeof fetch !== "function" || typeof AbortController !== "function") {
      syncState.synced = false; syncState.source = "device-clock";
      syncState.error = "Servidor HTTPS não configurado ou APIs do navegador indisponíveis.";
      tick(); return { ok: false, reason: syncState.error };
    }
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, 8000);
    var p0 = performance.now();
    try {
      var response = await fetch(base + "/health?clock=" + Date.now(), {
        method: "GET", cache: "no-store", credentials: "omit", signal: controller.signal,
        headers: { "Accept": "application/json" }
      });
      var p1 = performance.now();
      if (!response.ok) throw new Error("Servidor respondeu HTTP " + response.status);
      var payload = await response.json();
      var serverEpoch = Date.parse(payload.now || payload.time || payload.timestamp || "");
      if (!Number.isFinite(serverEpoch)) throw new Error("Endpoint /health não forneceu timestamp válido.");
      var rtt = p1 - p0;
      if (rtt > 8000) throw new Error("Latência excessiva para sincronização confiável.");
      anchorEpoch = serverEpoch;
      anchorPerf = p0 + (rtt / 2);
      syncState = {
        synced: true, source: "baby-server-health", lastSync: new Date(serverEpoch).toISOString(),
        roundTripMs: Math.round(rtt), error: null
      };
      tick();
      return { ok: true, source: syncState.source, timestamp: syncState.lastSync, roundTripMs: syncState.roundTripMs };
    } catch (error) {
      syncState.synced = false; syncState.source = "device-clock";
      syncState.error = error && error.message ? error.message : "Falha ao consultar servidor.";
      tick();
      return { ok: false, reason: syncState.error };
    } finally {
      window.clearTimeout(timer);
    }
  }

  window.CRPY_CLOCK_API = {
    now: snapshot,
    status: function () { return Object.assign({}, syncState); },
    sync: syncServerTime,
    subscribe: function (fn) {
      if (typeof fn !== "function") return function () {};
      listeners.push(fn);
      try { fn(snapshot()); } catch (_) {}
      return function () { listeners = listeners.filter(function (item) { return item !== fn; }); };
    }
  };

  function mountClock() {
    if (!document.body || document.getElementById("crypy-global-clock")) return;
    clockLink = document.createElement("a");
    clockLink.id = "crypy-global-clock";
    clockLink.href = new URL("relogio-mundial.html", siteRoot).href;
    clockLink.title = "Relógio mundial CRYPY — sincronização com servidor BABY quando disponível.";
    clockLink.setAttribute("aria-label", "Abrir relógio mundial CRYPY");
    clockLink.style.cssText = [
      "position:fixed", "left:12px", "bottom:12px", "z-index:2147483001",
      "display:block", "max-width:calc(100vw - 92px)", "overflow:hidden",
      "padding:8px 11px", "border:1px solid #00ff88", "border-radius:999px",
      "background:rgba(2,12,7,.94)", "color:#00ff88", "font:700 10px/1.2 Consolas,monospace",
      "letter-spacing:.04em", "text-decoration:none", "white-space:nowrap",
      "text-overflow:ellipsis", "box-shadow:0 0 14px rgba(0,255,136,.22)"
    ].join(";");
    document.body.appendChild(clockLink);
  }

  function tick() {
    var data = snapshot();
    if (clockLink) clockLink.textContent = (data.synced ? "SYNC " : "LOCAL ") + data.utc + " UTC · " + data.timeZone + " " + data.local;
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
    chat.src = new URL("assets/js/baby-global-chat.js", siteRoot).href;
    chat.defer = true;
    chat.dataset.crypyBabyChat = "true";
    (document.head || document.documentElement).appendChild(chat);
  }

  function boot() {
    mountClock();
    tick();
    syncServerTime();
    window.setInterval(tick, 1000);
    window.setInterval(syncServerTime, 5 * 60 * 1000);
    loadBabyChat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
