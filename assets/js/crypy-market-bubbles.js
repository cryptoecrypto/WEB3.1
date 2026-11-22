/* CRYPY MARKET NEWS — CryptoBubbles nativo com dados CoinGecko. */
(function () {
  "use strict";
  if (window.__CRYPY_BUBBLES__) return;
  window.__CRYPY_BUBBLES__ = true;

  var API = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Cinternet-computer%2Cshiba-inu&sparkline=false&price_change_percentage=24h";
  var CACHE = "crypy.bubbles.market.v1";
  var PINNED = ["bitcoin", "ethereum", "tether", "binancecoin", "internet-computer", "shiba-inu"];
  var root, statusNode, detailNode, timer;
  var items = [];

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "className") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (text != null) n.textContent = text;
    return n;
  }
  function money(n, currency) {
    if (typeof n !== "number" || !isFinite(n)) return "—";
    return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
      style: "currency", currency: currency, maximumSignificantDigits: 6
    }).format(n);
  }
  function brlRate() {
    try {
      var cache = JSON.parse(localStorage.getItem("crypy.live-market.v1") || "null");
      var tether = cache && cache.data && cache.data.tether;
      if (tether && tether.usd && tether.brl) return tether.brl / tether.usd;
    } catch (e) {}
    return null;
  }
  function findMarketBox() {
    var cover = document.querySelector('img[alt*="CRYPY MARKET NEWS" i]');
    if (cover) {
      // Preferir a menor seção que contém os três gráficos antigos.
      var ancestor = cover;
      var best = cover.parentElement || document.body;
      for (var depth = 0; depth < 12 && ancestor.parentElement; depth++) {
        ancestor = ancestor.parentElement;
        var content = (ancestor.textContent || "").replace(/\s+/g, " ").trim();
        if (/\bBTC\b/i.test(content) && /\bETH\b/i.test(content) && /\bUSDT\b/i.test(content)) {
          best = ancestor;
          if (content.length < 18000) break;
        }
      }
      return best;
    }
    var candidates = Array.prototype.slice.call(document.querySelectorAll("body *"));
    var heading = candidates.filter(function (n) {
      var text = (n.textContent || "").replace(/\s+/g, " ").trim();
      return text.length <= 140 && /CRYPY\s*MARKET\s*NEWS/i.test(text);
    }).sort(function (a, b) {
      return (a.textContent || "").length - (b.textContent || "").length;
    })[0];
    if (!heading) return null;
    return heading.closest("section,article,.card,.box,.panel,[class*='card'],[class*='box'],[class*='panel']") || heading.parentElement;
  }
  function mergeSharedQuotes(list, quotes) {
    var shared = quotes || null;
    if (!shared) {
      try {
        var saved = JSON.parse(localStorage.getItem("crypy.live-market.v1") || "null");
        shared = saved && saved.data;
      } catch (e) {}
    }
    if (!shared) return;
    list.forEach(function (coin) {
      var quote = shared[coin.id];
      if (!quote) return;
      if (typeof quote.usd === "number") coin.current_price = quote.usd;
      if (typeof quote.brl === "number") coin.__crypy_brl = quote.brl;
      if (typeof quote.usd_24h_change === "number") coin.price_change_percentage_24h = quote.usd_24h_change;
      if (quote.last_updated_at) coin.__crypy_updated = quote.last_updated_at * 1000;
    });
  }
  function mount() {
    if (document.getElementById("crypy-market-bubbles")) return true;
    var host = findMarketBox();
    if (!host) return false;
    root = el("section", { id: "crypy-market-bubbles", "aria-label": "CryptoBubbles CRYPY" });
    var style = el("style");
    style.textContent = [
      "#crypy-market-bubbles{margin:18px 0 8px;padding:14px;border:1px solid #17613a;border-radius:14px;background:linear-gradient(145deg,#06170d,#020805);color:#eafff2;font-family:inherit}",
      "#crypy-market-bubbles *{box-sizing:border-box}",
      "#crypy-market-bubbles .cb-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}",
      "#crypy-market-bubbles .cb-title{font-size:16px;font-weight:900;letter-spacing:.08em;color:#00ff88}",
      "#crypy-market-bubbles .cb-sub{font-size:10px;color:#a4cbb2;margin-top:4px}",
      "#crypy-market-bubbles .cb-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      "#crypy-market-bubbles button,#crypy-market-bubbles a{border:1px solid #17613a;border-radius:8px;padding:8px 10px;background:#071d10;color:#baffd2;font-size:10px;font-weight:800;text-decoration:none;cursor:pointer}",
      "#crypy-market-bubbles button:hover,#crypy-market-bubbles a:hover{border-color:#00ff88;color:#00ff88}",
      "#crypy-market-bubbles .cb-state{font-size:10px;color:#91bca0}",
      "#crypy-market-bubbles .cb-field{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;min-height:230px;padding:14px;border:1px solid #123b23;border-radius:12px;background:radial-gradient(ellipse at center,#0b2414,#020805 75%);overflow:hidden}",
      "#crypy-market-bubbles .cb-bubble{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:2px solid #ffffff20;border-radius:50%;padding:7px;color:#fff;text-align:center;box-shadow:inset 0 0 18px #ffffff18,0 5px 18px #0009;transition:transform .18s,border-color .18s;overflow:hidden;flex:0 0 auto}",
      "#crypy-market-bubbles .cb-bubble:hover,#crypy-market-bubbles .cb-bubble:focus-visible{transform:scale(1.08);border-color:#fff;z-index:2;outline:none}",
      "#crypy-market-bubbles .cb-bubble img{width:30%;height:30%;max-width:38px;max-height:38px;object-fit:contain;filter:drop-shadow(0 2px 4px #0008)}",
      "#crypy-market-bubbles .cb-symbol{font-size:11px;font-weight:950;text-shadow:0 1px 4px #000}",
      "#crypy-market-bubbles .cb-change{font-size:10px;font-weight:850;text-shadow:0 1px 4px #000}",
      "#crypy-market-bubbles .cb-detail{margin-top:10px;padding:12px;border:1px solid #17462b;border-radius:10px;background:#030d07;font-size:12px;line-height:1.7;color:#ccebd6;min-height:48px}",
      "#crypy-market-bubbles .cb-detail strong{color:#00ff88}",
      "#crypy-market-bubbles .cb-legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:9px;color:#8fb49b;font-size:10px}",
      "@media(max-width:600px){#crypy-market-bubbles{padding:10px}#crypy-market-bubbles .cb-field{gap:6px;padding:8px}.cb-bubble{max-width:100%}}"
    ].join("\n");
    var head = el("div", { className: "cb-head" });
    var titleWrap = el("div");
    titleWrap.appendChild(el("div", { className: "cb-title" }, "CRYPTOBUBBLES · MERCADO AO VIVO"));
    titleWrap.appendChild(el("div", { className: "cb-sub" }, "Tamanho = capitalização de mercado · cor = variação 24h · selecione uma moeda"));
    var actions = el("div", { className: "cb-actions" });
    statusNode = el("span", { className: "cb-state", role: "status" }, "Conectando à CoinGecko…");
    var refresh = el("button", { type: "button" }, "ATUALIZAR");
    actions.appendChild(statusNode); actions.appendChild(refresh);
    head.appendChild(titleWrap); head.appendChild(actions);
    var field = el("div", { className: "cb-field", id: "crypy-bubbles-field", "aria-label": "Bolhas de criptomoedas" });
    detailNode = el("div", { className: "cb-detail", id: "crypy-bubbles-detail", "aria-live": "polite" }, "Selecione uma bolha para consultar os detalhes.");
    var legend = el("div", { className: "cb-legend" }, "Verde = alta · Vermelho = queda · Cinza = estável/sem variação");
    root.appendChild(style); root.appendChild(head); root.appendChild(field); root.appendChild(detailNode); root.appendChild(legend);
    var cover = document.querySelector('img[alt*="CRYPY MARKET NEWS" i]');
    if (cover && host.contains(cover)) {
      // Inserir imediatamente após a capa do bloco de mercado, sem substituir
      // nem remover os gráficos históricos que já estão na seção.
      cover.insertAdjacentElement("afterend", root);
    } else {
      host.appendChild(root);
    }
    refresh.addEventListener("click", load);
    return true;
  }
  function showDetail(c) {
    var change = typeof c.price_change_percentage_24h === "number" ? c.price_change_percentage_24h : null;
    var rate = brlRate();
    detailNode.replaceChildren();
    detailNode.appendChild(el("strong", {}, c.name + " (" + String(c.symbol || "").toUpperCase() + ")"));
    detailNode.appendChild(document.createTextNode(" · Preço: " + money(c.current_price, "USD") +
      " · BRL: " + (typeof c.__crypy_brl === "number" ? money(c.__crypy_brl, "BRL") : (rate ? money(c.current_price * rate, "BRL") : "aguardando cotação BRL")) +
      " · 24h: " + (change == null ? "—" : (change > 0 ? "+" : "") + change.toFixed(2) + "%") +
      " · Market cap: " + money(c.market_cap, "USD") +
      " · Atualizado: " + new Date(c.__crypy_updated || c.last_updated || Date.now()).toLocaleString("pt-BR")));
  }
  function render(list, stale) {
    if (!root) return;
    var field = document.getElementById("crypy-bubbles-field");
    if (!field) return;
    field.replaceChildren();
    var max = Math.max.apply(null, list.map(function (c) { return Number(c.market_cap) || 0; }).concat([1]));
    list.forEach(function (c) {
      var ratio = Math.sqrt((Number(c.market_cap) || 0) / max);
      var size = Math.round(58 + ratio * 86);
      var change = Number(c.price_change_percentage_24h);
      var bg = !isFinite(change) ? "#52605a" : change >= 0 ? "#087c42" : "#a8323c";
      var button = el("button", { type: "button", className: "cb-bubble", title: c.name + " · " + money(c.current_price, "USD") });
      button.style.width = size + "px"; button.style.height = size + "px"; button.style.background = bg;
      if (c.image) {
        var img = el("img", { src: c.image, alt: "Logo " + c.name, loading: "lazy" });
        img.onerror = function () { img.remove(); };
        button.appendChild(img);
      }
      button.appendChild(el("span", { className: "cb-symbol" }, String(c.symbol || "").toUpperCase()));
      button.appendChild(el("span", { className: "cb-change" }, isFinite(change) ? (change > 0 ? "+" : "") + change.toFixed(2) + "%" : "—"));
      button.addEventListener("click", function () { showDetail(c); });
      field.appendChild(button);
    });
    statusNode.textContent = (stale ? "CACHE · " : "AO VIVO · ") + list.length + " ativos · fonte CoinGecko";
  }
  function load() {
    statusNode.textContent = "Consultando mercado…";
    fetch(API, { cache: "no-store", headers: { accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        var byId = new Map(data.map(function (c) { return [c.id, c]; }));
        items = PINNED.map(function (id) { return byId.get(id); }).filter(Boolean);
        mergeSharedQuotes(items);
        render(items, false);
        try { localStorage.setItem(CACHE, JSON.stringify({ savedAt: Date.now(), items: items })); } catch (e) {}
      })
      .catch(function (err) {
        try {
          var saved = JSON.parse(localStorage.getItem(CACHE) || "null");
          if (saved && Array.isArray(saved.items)) {
            var cachedById = new Map(saved.items.map(function (c) { return [c.id, c]; }));
            items = PINNED.map(function (id) { return cachedById.get(id); }).filter(Boolean);
            render(items, true); return;
          }
        } catch (e) {}
        statusNode.textContent = "API indisponível · " + (err && err.message ? err.message : "sem conexão");
      });
  }
  function start() {
    window.addEventListener("crypy:market-updated", function (event) {
      if (!items.length) return;
      mergeSharedQuotes(items, event.detail || null);
      render(items, false);
    });
    var attempts = 0;
    function tryMount() {
      attempts++;
      if (mount()) { load(); timer = window.setInterval(load, 60000); return; }
      if (attempts < 40) window.setTimeout(tryMount, 500);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tryMount, { once: true });
    else tryMount();
  }
  start();
})();