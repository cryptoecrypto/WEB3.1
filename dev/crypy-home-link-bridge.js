/* Liga os 13 cartões da HOME aos HTMLs reais da Colmeia, preservando o desenho React. */
(function () {
  "use strict";
  if (window.__CRYPY_HOME_LINK_BRIDGE__) return;
  window.__CRYPY_HOME_LINK_BRIDGE__ = true;

  var routes = {
    "01": "CRYPY-INFINYT/index.html",
    "02": "NFT-COLLECTION/NFT-CRYPY-CARDS/nft-crypy-cards.html",
    "03": "ESQUADRÃO-DAS-CORES/esquadrao.html",
    "04": "CRYPY-ACADEMY/academia.html",
    "05": "BIOGRAFIA/historia.html",
    "06": "CRYPY-NEWS/index.html",
    "07": "CRYPY-NEWS/museu.html",
    "08": "ART-FIGURE-MARKETPLACE/marketplace.html",
    "09": "CRYPY-GAMES-ARCADE/CRYPY-LAND/crypy-land.html",
    "10": "CRYPY-SHOTS/01-feed-para-voce.html",
    "11": "BABY-IA/centro.html",
    "12": "CRYPY-COIN/white-paper.html",
    "13": "CONTATO/contato-oficial.html"
  };
  window.CRPY_HOME_ROUTES = Object.freeze(routes);

  function routeForButton(button) {
    var label = button.getAttribute("aria-label") || "";
    var match = label.match(/Abrir pasta\s+(\d{2})/i);
    if (match && routes[match[1]]) return routes[match[1]];

    var text = (button.textContent || "").replace(/\s+/g, " ").trim();
    if (text === "CRYPY INFINYT") return routes["01"];
    if (text === "BABY I.A.") return routes["11"];

    var searchMatch = text.match(/^(0[1-9]|1[0-3])\s+/);
    if (searchMatch && routes[searchMatch[1]]) return routes[searchMatch[1]];
    return null;
  }

  document.addEventListener("click", function (event) {
    var button = event.target && event.target.closest ? event.target.closest("button") : null;
    if (!button) return;
    var target = routeForButton(button);
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    window.location.assign(new URL(target, document.baseURI).href);
  }, true);
})();
