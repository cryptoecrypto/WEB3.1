/* CRYPY — quadro de preços ao vivo. Fonte: CoinGecko Public API. */
(function () {
  "use strict";
  if (window.__CRYPY_LIVE_MARKET__) return;
  window.__CRYPY_LIVE_MARKET__ = true;

  var COINS = [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    { id: "ethereum", symbol: "ETH", name: "Ethereum" },
    { id: "tether", symbol: "USDT", name: "Tether" },
    { id: "binancecoin", symbol: "BNB", name: "BNB" },
    { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu" },
    { id: "internet-computer", symbol: "ICP", name: "Internet Computer" }
  ];
  var API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=" +
    COINS.map(function (coin) { return coin.id; }).join(",") +
    "&vs_currencies=usd%2Cbrl&include_24hr_change=true&include_last_updated_at=true";
  var CACHE_KEY = "crypy.live-market.v1";
  var REFRESH_MS = 60000;
  var retryMs = REFRESH_MS;
  var timer = null;
  var section;

  function node(tag, attrs, value) {
    var item = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") item.className = attrs[key];
      else item.setAttribute(key, attrs[key]);
    });
    if (value != null) item.textContent = value;
    return item;
  }

  function money(value, currency) {
    if (typeof value !== "number" || !isFinite(value)) return "—";
    try {
      return new Intl.NumberFormat(currency === "BRL" ? "pt-BR" : "en-US", {
        style: "currency",
        currency: currency,
        maximumSignificantDigits: 6
      }).format(value);
    } catch (error) {
      return String(value);
    }
  }

  function percent(value) {
    if (typeof value !== "number" || !isFinite(value)) return "—";
    return (value > 0 ? "+" : "") + value.toFixed(2).replace(".", ",") + "%";
  }

  function timeAt(timestamp, zone) {
    if (!timestamp) return "—";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        timeZone: zone,
        dateStyle: "short",
        timeStyle: "medium"
      }).format(new Date(timestamp * 1000));
    } catch (error) {
      return "—";
    }
  }

  function mount() {
    if (document.getElementById("crypy-live-market")) return;
    section = node("section", {
      id: "crypy-live-market",
      "aria-labelledby": "crypy-market-title"
    });
    var style = node("style");
    style.textContent = [
      "#crypy-live-market{width:min(1240px,calc(100% - 36px));margin:28px auto;padding:clamp(16px,3vw,26px);border:1px solid #17613a;border-radius:18px;background:linear-gradient(145deg,rgba(5,25,13,.97),rgba(2,9,5,.97));color:#eafff2;box-shadow:0 0 26px #00ff8817;font-family:inherit}",
      "#crypy-live-market *{box-sizing:border-box}",
      "#crypy-live-market .market-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;flex-wrap:wrap}",
      "#crypy-live-market .market-kicker{color:#00ff88;font-size:10px;font-weight:900;letter-spacing:.19em}",
      "#crypy-live-market h2{margin:7px 0 6px;color:#eafff2;font-size:clamp(22px,3.4vw,34px);line-height:1.1}",
      "#crypy-live-market .market-intro{margin:0;color:#a8cbb5;font-size:12px;line-height:1.6}",
      "#crypy-live-market .market-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}",
      "#crypy-live-market .market-state{font-size:11px;color:#9dc9ac}",
      "#crypy-live-market button{border:1px solid #00ff88;border-radius:9px;padding:10px 13px;background:#062012;color:#00ff88;font-weight:850;font-size:11px;cursor:pointer}",
      "#crypy-live-market button:hover{background:#00ff88;color:#001b0b}",
      "#crypy-live-market .market-clock{display:flex;gap:12px 22px;flex-wrap:wrap;margin:17px 0 13px;padding:11px 13px;border:1px solid #16472b;border-radius:10px;background:#020a05;color:#9bc9aa;font-size:11px}",
      "#crypy-live-market .market-clock b{color:#eafff2;font-variant-numeric:tabular-nums}",
      "#crypy-live-market .market-table-wrap{overflow-x:auto;border:1px solid #16472b;border-radius:11px}",
      "#crypy-live-market table{width:100%;border-collapse:collapse;min-width:650px;font-size:12px}",
      "#crypy-live-market th{padding:12px 13px;background:#092014;color:#9eddb5;text-align:right;font-size:10px;letter-spacing:.08em;white-space:nowrap}",
      "#crypy-live-market th:first-child,#crypy-live-market td:first-child{text-align:left}",
      "#crypy-live-market td{padding:13px;border-top:1px solid #123b23;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}",
      "#crypy-live-market tbody tr:hover{background:#092014}",
      "#crypy-live-market .coin-name{font-weight:850;color:#effff4}",
      "#crypy-live-market .coin-symbol{display:inline-block;min-width:52px;margin-right:8px;color:#00ff88;font-weight:900}",
      "#crypy-live-market .positive{color:#00ff88}",
      "#crypy-live-market .negative{color:#ff8585}",
      "#crypy-live-market .market-foot{margin:12px 0 0;color:#86a995;font-size:10px;line-height:1.6}",
      "#crypy-live-market .market-foot a{color:#00ff88;text-decoration:none}",
      "@media(max-width:600px){#crypy-live-market{width:calc(100% - 20px);margin:18px auto;padding:14px;border-radius:14px}#crypy-live-market .market-head{align-items:flex-start}#crypy-live-market .market-clock{gap:8px 14px}}"
    ].join("\n");

    var head = node("div", { className: "market-head" });
    var heading = node("div");
    heading.appendChild(node("div", { className: "market-kicker" }, "MERCADO CRIPTO · DADOS DE MERCADO"));
    heading.appendChild(node("h2", { id: "crypy-market-title" }, "QUADRO DE PREÇOS"));
    heading.appendChild(node("p", { className: "market-intro" },
      "Cotações de mercado em dólar e real. Atualização automática, sem valores fictícios."));
    var actions = node("div", { className: "market-actions" });
    actions.appendChild(node("span", { className: "market-state", id: "crypy-market-state", role: "status" }, "○ CARREGANDO"));
    var refresh = node("button", { type: "button", id: "crypy-market-refresh" }, "ATUALIZAR AGORA");
    actions.appendChild(refresh);
    head.appendChild(heading);
    head.appendChild(actions);

    var clocks = node("div", { className: "market-clock" });
    clocks.appendChild(node("span", {}, "BRASÍLIA: "));
    clocks.lastChild.appendChild(node("b", { id: "crypy-market-br-time" }, "--:--:--"));
    clocks.appendChild(node("span", {}, "UTC: "));
    clocks.lastChild.appendChild(node("b", { id: "crypy-market-utc-time" }, "--:--:--"));
    clocks.appendChild(node("span", {}, "ÚLTIMA COTAÇÃO: "));
    clocks.lastChild.appendChild(node("b", { id: "crypy-market-updated" }, "aguardando API"));

    var tableWrap = node("div", { className: "market-table-wrap" });
    var table = node("table");
    var thead = node("thead");
    var headerRow = node("tr");
    ["ATIVO", "PREÇO USD", "PREÇO BRL", "VARIAÇÃO 24H"].forEach(function (label) {
      headerRow.appendChild(node("th", {}, label));
    });
    thead.appendChild(headerRow);
    var tbody = node("tbody", { id: "crypy-market-rows" });
    COINS.forEach(function (coin) {
      var row = node("tr", { "data-coin": coin.id });
      var asset = node("td");
      asset.appendChild(node("span", { className: "coin-symbol" }, coin.symbol));
      asset.appendChild(node("span", { className: "coin-name" }, coin.name));
      row.appendChild(asset);
      row.appendChild(node("td", { "data-usd": "" }, "—"));
      row.appendChild(node("td", { "data-brl": "" }, "—"));
      row.appendChild(node("td", { "data-change": "" }, "—"));
      tbody.appendChild(row);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    tableWrap.appendChild(table);

    var foot = node("p", { className: "market-foot" });
    foot.appendChild(document.createTextNode("Fonte: CoinGecko Public API · consulta a cada 60 segundos · horários exibidos em Brasília e UTC. "));
    foot.appendChild(node("a", {
      href: "https://www.coingecko.com/",
      target: "_blank",
      rel: "noopener noreferrer"
    }, "Ver fonte"));
    foot.appendChild(document.createTextNode(". O relógio usa o horário do dispositivo; a data/hora da cotação vem do provedor. CRYPYCOIN não aparece na tabela: ainda não foi emitida e não possui cotação de mercado."));

    section.appendChild(style);
    section.appendChild(head);
    section.appendChild(clocks);
    section.appendChild(tableWrap);
    section.appendChild(foot);

    var anchor = document.querySelector(".token-band") ||
      document.querySelector("footer") ||
      document.querySelector("main");
    if (anchor && anchor.parentNode) {
      if (anchor.classList && anchor.classList.contains("token-band")) {
        anchor.parentNode.insertBefore(section, anchor);
      } else if (anchor.tagName && anchor.tagName.toLowerCase() === "footer") {
        anchor.parentNode.insertBefore(section, anchor);
      } else {
        anchor.appendChild(section);
      }
    } else {
      document.body.appendChild(section);
    }

    refresh.addEventListener("click", function () { fetchPrices(true); });
    tickClock();
    window.setInterval(tickClock, 1000);
    renderCache();
    fetchPrices(false);
  }

  function tickClock() {
    var now = new Date();
    var br = document.getElementById("crypy-market-br-time");
    var utc = document.getElementById("crypy-market-utc-time");
    if (!br || !utc) return;
    br.textContent = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(now);
    utc.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(now);
  }

  function setState(message, stateClass) {
    var state = document.getElementById("crypy-market-state");
    if (!state) return;
    state.textContent = message;
    state.className = "market-state" + (stateClass ? " " + stateClass : "");
  }

  function render(data, stale) {
    if (!data) return;
    COINS.forEach(function (coin) {
      var row = document.querySelector('#crypy-live-market [data-coin="' + coin.id + '"]');
      var quote = data[coin.id];
      if (!row || !quote) return;
      row.querySelector("[data-usd]").textContent = money(quote.usd, "USD");
      row.querySelector("[data-brl]").textContent = money(quote.brl, "BRL");
      var changeCell = row.querySelector("[data-change]");
      changeCell.textContent = percent(quote.usd_24h_change);
      changeCell.className = typeof quote.usd_24h_change === "number" && quote.usd_24h_change < 0 ? "negative" : "positive";
    });
    var timestamps = COINS.map(function (coin) {
      return data[coin.id] && data[coin.id].last_updated_at;
    }).filter(Boolean);
    var latest = timestamps.length ? Math.min.apply(Math, timestamps) : null;
    var updated = document.getElementById("crypy-market-updated");
    if (updated) updated.textContent = latest ? timeAt(latest, "America/Sao_Paulo") + " (Brasília)" : "horário indisponível";
    if (stale) setState("◷ DADOS EM CACHE · API INDISPONÍVEL", "negative");
    else setState("● COTAÇÃO ATUALIZADA", "positive");
  }

  function renderCache() {
    try {
      var saved = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (saved && saved.data) render(saved.data, true);
    } catch (error) {}
  }

  function schedule(delay) {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(function () { fetchPrices(false); }, delay);
  }

  function fetchPrices(manual) {
    if (timer) window.clearTimeout(timer);
    if (!navigator.onLine) {
      setState("○ OFFLINE · ÚLTIMA COTAÇÃO PRESERVADA", "negative");
      schedule(retryMs);
      return;
    }
    if (manual) setState("↻ CONSULTANDO API…");
    var controller = window.AbortController ? new AbortController() : null;
    var timeout = controller ? window.setTimeout(function () { controller.abort(); }, 12000) : null;
    fetch(API_URL, {
      method: "GET",
      cache: "no-store",
      headers: { "accept": "application/json" },
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    }).then(function (payload) {
      var complete = {};
      COINS.forEach(function (coin) {
        if (!payload[coin.id] || typeof payload[coin.id].usd !== "number" || typeof payload[coin.id].brl !== "number") {
          throw new Error("Cotação incompleta: " + coin.symbol);
        }
        complete[coin.id] = payload[coin.id];
      });
      render(complete, false);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data: complete }));
        window.dispatchEvent(new CustomEvent("crypy:market-updated", { detail: complete }));
      } catch (error) {}
      retryMs = REFRESH_MS;
      schedule(REFRESH_MS);
    }).catch(function (error) {
      renderCache();
      setState("⚠ API INDISPONÍVEL · TENTANDO NOVAMENTE", "negative");
      retryMs = Math.min(300000, Math.max(REFRESH_MS, retryMs * 2));
      schedule(retryMs);
      if (window.console && console.warn) console.warn("[CRYPY market]", error);
    }).finally(function () {
      if (timeout) window.clearTimeout(timeout);
    });
  }

  function start() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
  }
  start();
})();