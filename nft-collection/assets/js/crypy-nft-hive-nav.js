/* CRYPY NFT HIVE NAV — menu unificado para as páginas existentes da colmeia NFT.
   Escopo: somente navegação; não altera conteúdo, coleções, imagens ou metadados. */
(function () {
  "use strict";
  if (window.__CRYPY_NFT_HIVE_NAV__) return;
  window.__CRYPY_NFT_HIVE_NAV__ = true;

  var marker = "/nft-collection/";
  var path = window.location.pathname;
  var at = path.indexOf(marker);
  if (at < 0) return;
  var rootPath = path.slice(0, at) + marker;
  var rootUrl = window.location.origin + rootPath;

  var pages = [
    ["Galeria NFT", "galeria.html", "Entrada visual da coleção"],
    ["Coleção CRYPY NFT", "collection-crypy-nft.html", "Portal principal da coleção"],
    ["NFT Exhibition", "crypy-nft-edition.html", "Exposição e edição NFT"],
    ["Edição da Coleção", "nft-colection-edition.html", "Painel de edições"],
    ["NFT Genesis", "nft-genesis.html", "Peça Genesis"],
    ["NFT Darkness", "nft-darkness.html", "Coleção Darkness"],
    ["Chatbot BABY IA", "chatboot-baby-ia.html", "Assistente da área NFT"],
    ["HD BABY IA", "hd-baby-ia.html", "Página HD BABY IA"],
    ["HD Memory", "hd-memory.html", "Memória e consulta"],
    ["Relógio Mundial", "relogio-mundial.html", "Ferramenta de horário"],
    ["Memory Boost · Agente", "memory-boost/baby-ia-agente.html", "Agente BABY"],
    ["Memory Boost · Conectado", "memory-boost/baby-ia-conectado.html", "BABY conectado"],
    ["Memory Boost · Chatbot", "memory-boost/chatboot-baby-ia.html", "Chatbot Memory Boost"],
    ["Memory Boost · HD BABY", "memory-boost/hd-baby-ia.html", "Cópia HD BABY"],
    ["Memory Boost · HD Memory", "memory-boost/hd-memory.html", "Cópia HD Memory"],
    ["Memory Boost · Health", "memory-boost/health.html", "Painel Health"],
    ["Memory Boost · Plugins", "memory-boost/pluguin.html", "Central de plugins"],
    ["Memory Boost · Tutorial", "memory-boost/pluguins-tuto.html", "Tutorial de plugins"],
    ["Memory Boost · Relógio", "memory-boost/relogio-mundial.html", "Relógio Memory Boost"],
    ["Atalho · CRYPY Home", "../index.html", "Voltar à página inicial"]
  ];

  var legacy = {
    "index.html": "../index.html",
    "index.htm": "../index.html",
    "galeria.html": "galeria.html",
    "collection-crypy-nft.html": "collection-crypy-nft.html",
    "crypy-nft-edition.html": "crypy-nft-edition.html",
    "nft-colection-edition.html": "nft-colection-edition.html",
    "nft-genesis.html": "nft-genesis.html",
    "nft-darkness.html": "nft-darkness.html",
    "chatboot-baby-ia.html": "chatboot-baby-ia.html",
    "hd-baby-ia.html": "hd-baby-ia.html",
    "hd-memory.html": "hd-memory.html",
    "relogio-mundial.html": "relogio-mundial.html",
    "health.html": "memory-boost/health.html",
    "pluguin.html": "memory-boost/pluguin.html",
    "pluguins-tuto.html": "memory-boost/pluguins-tuto.html",
    "baby-ia-agente.html": "memory-boost/baby-ia-agente.html",
    "baby-ia-conectado.html": "memory-boost/baby-ia-conectado.html",
    "CRYPY-INDEX-FINAL.html": "../index.html",
    "nft-5-paginas.html": "collection-crypy-nft.html",
    "nft-esquadrao.html": "../esquadrao-das-cores/esquadrao.html",
    "nft-exhibition.html": "crypy-nft-edition.html",
    "crypy-infinit-completo.html": "../crypy-infinyt/portal.html",
    "web3.html": "../crypy-academy/academia.html",
    "nft-exhibition-overview.html": "collection-crypy-nft.html",
    "universo.html": "../crypy-infinyt/portal.html",
    "quarteto.html": "../esquadrao-das-cores/esquadrao.html",
    "crypy-news.html": "../crypy-news/museu.html",
    "museu-digital.html": "../crypy-news/museu.html",
    "documentacao.html": "../crypy-coin/white-paper.html",
    "contato.html": "../contato/contato-oficial.html",
    "nft-modulo-oficial.html": "crypy-nft-edition.html",
    "nft-crypy-colecao-completa.html": "collection-crypy-nft.html",
    "CRYPYPASTA_NFT_EXHIBITION_COMPLEMENT.html": "crypy-nft-edition.html",
    "crypypasta-darkness.html": "nft-darkness.html",
    "baby-consulta.html": "chatboot-baby-ia.html",
    "baby.html": "../baby-ia/centro.html",
    "hd_oculto_baby_v13.html": "hd-baby-ia.html",
    "BABY-IA-Fortaleza-Digital.html": "../baby-ia/centro.html",
    "biografia.html": "../biografia/historia.html",
    "explorar.html": "galeria.html",
    "qualidade.html": "../crypy-academy/cursos.html",
    "seguranca.html": "../crypy-academy/cursos.html",
    "topo.html": "../index.html#crypy-home-hero",
    "crypy-infinit.html": "../crypy-infinyt/portal.html"
  };;

  function normalizeLegacyLinks() {
    document.querySelectorAll("a[href],iframe[src]").forEach(function (a) {
      var attr = a.tagName.toLowerCase() === "iframe" ? "src" : "href";
      var raw = (a.getAttribute(attr) || "").trim();
      if (!raw || /^(#|https?:|mailto:|tel:|data:|javascript:|blob:)/i.test(raw)) return;
      var file = raw.split(/[?#]/)[0].split("/").pop();
      if (legacy[file]) a.setAttribute(attr, new URL(legacy[file], rootUrl).href);
    });
  }

  function hideLegacyMenus() {
    document.querySelectorAll(".crypy-portal-nav, .crypy-menu-caixa").forEach(function (nav) {
      nav.setAttribute("aria-hidden", "true");
      nav.dataset.crypyLegacyMenu = "hidden";
    });
  }

  function mount() {
    if (!document.body || document.getElementById("crypy-nft-hive-nav")) return;
    normalizeLegacyLinks();
    hideLegacyMenus();

    var style = document.createElement("style");
    style.textContent =
      "#crypy-nft-hive-nav{position:fixed;z-index:2147483000;top:12px;right:12px;font:13px/1.4 system-ui,sans-serif;color:#eafff3}" +
      "#crypy-nft-hive-nav *{box-sizing:border-box}" +
      ".crypy-portal-nav,.crypy-menu-caixa{display:none!important}" +
      "#crypy-nft-hive-toggle{border:1px solid #00ff88;border-radius:999px;background:#03130a;color:#00ff88;padding:11px 15px;font-weight:900;letter-spacing:.04em;cursor:pointer;box-shadow:0 0 18px #00ff8833}" +
      "#crypy-nft-hive-panel{display:none;position:fixed;top:62px;right:12px;width:min(390px,calc(100vw - 24px));max-height:calc(100dvh - 76px);overflow:auto;background:#030a05;border:1px solid #00ff88;border-radius:15px;box-shadow:0 18px 55px #000c;padding:12px}" +
      "#crypy-nft-hive-panel[data-open=true]{display:block}" +
      "#crypy-nft-hive-panel h2{margin:2px 4px 5px;color:#00ff88;font-size:14px;letter-spacing:.08em}" +
      "#crypy-nft-hive-panel p{margin:0 4px 10px;color:#a8cbb5;font-size:11px}" +
      "#crypy-nft-hive-links{display:grid;grid-template-columns:1fr 1fr;gap:6px}" +
      "#crypy-nft-hive-links a{display:block;min-width:0;padding:9px 10px;border:1px solid #17462b;border-radius:9px;color:#eafff3;text-decoration:none;background:#07170e}" +
      "#crypy-nft-hive-links a:hover,#crypy-nft-hive-links a[aria-current=page]{border-color:#00ff88;background:#0b2415}" +
      "#crypy-nft-hive-links strong{display:block;font-size:12px}" +
      "#crypy-nft-hive-links small{display:block;color:#9bbda8;font-size:10px;margin-top:2px}" +
      "@media(max-width:520px){#crypy-nft-hive-nav{top:8px;right:8px}#crypy-nft-hive-panel{top:55px;left:8px;right:8px;width:auto;max-height:calc(100dvh - 65px)}#crypy-nft-hive-links{grid-template-columns:1fr}}" +
      "@media(prefers-reduced-motion:reduce){#crypy-nft-hive-nav *{scroll-behavior:auto!important;transition:none!important}}";
    document.head.appendChild(style);

    var wrap = document.createElement("div");
    wrap.id = "crypy-nft-hive-nav";
    var toggle = document.createElement("button");
    toggle.id = "crypy-nft-hive-toggle";
    toggle.type = "button";
    toggle.textContent = "✦ MENU DA COLMEIA NFT";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "crypy-nft-hive-panel");
    var panel = document.createElement("section");
    panel.id = "crypy-nft-hive-panel";
    panel.setAttribute("data-open", "false");
    panel.setAttribute("aria-label", "Todas as páginas da colmeia NFT");
    var title = document.createElement("h2");
    title.textContent = "CRYPY · COLMEIA NFT";
    var subtitle = document.createElement("p");
    subtitle.textContent = pages.length + " destinos existentes · navegação unificada";
    var links = document.createElement("div");
    links.id = "crypy-nft-hive-links";
    pages.forEach(function (item) {
      var a = document.createElement("a");
      a.href = new URL(item[1], rootUrl).href;
      if (new URL(a.href).pathname === path) a.setAttribute("aria-current", "page");
      var strong = document.createElement("strong");
      strong.textContent = item[0];
      var small = document.createElement("small");
      small.textContent = item[2];
      a.appendChild(strong);
      a.appendChild(small);
      links.appendChild(a);
    });
    panel.appendChild(title);
    panel.appendChild(subtitle);
    panel.appendChild(links);
    wrap.appendChild(toggle);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    function setOpen(open) {
      panel.setAttribute("data-open", String(open));
      toggle.setAttribute("aria-expanded", String(open));
    }
    toggle.addEventListener("click", function () {
      setOpen(panel.getAttribute("data-open") !== "true");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", function (event) {
      if (!wrap.contains(event.target)) setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
  var observer = new MutationObserver(function () { normalizeLegacyLinks(); hideLegacyMenus(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", hideLegacyMenus, { once: true });
})();