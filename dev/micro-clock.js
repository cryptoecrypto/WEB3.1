/* CRYPY HOME — ponte de compatibilidade.
 * A HOME legada já referencia ./dev/micro-clock.js.
 * O relógio principal permanece implementado no próprio HTML.
 * Esta ponte carrega o menu global oficial sem reescrever a HOME.
 */
(function () {
  "use strict";
  var current = document.currentScript;
  if (!current || window.__CRYPY_HOME_NAV_LOADER__) return;
  window.__CRYPY_HOME_NAV_LOADER__ = true;

  var navUrl = new URL("../assets/js/crypy-global-nav.js", current.src);
  navUrl.searchParams.set("v", "20261121-nav-memoryboost-1");
  var existing = Array.prototype.some.call(document.scripts, function (script) {
    return script.src === navUrl.href;
  });
  if (existing) return;

  var loader = document.createElement("script");
  loader.src = navUrl.href;
  loader.async = true;
  loader.dataset.crypyHomeNav = "true";
  (document.head || document.documentElement).appendChild(loader);
})();
