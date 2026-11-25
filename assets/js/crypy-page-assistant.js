/* CRYPY — ponte de compatibilidade para o atendimento global BABY.
 * Substitui o assistente contextual duplicado pelo runtime único.
 * Não conecta provedores de IA, não envia mensagens e não treina modelos.
 * As chamadas reais dos agentes dependem de backend autenticado e endpoints aprovados.
 */
(function () {
  "use strict";
  if (window.__CRYPY_SQUAD_ASSISTANT_BRIDGE__) return;
  window.__CRYPY_SQUAD_ASSISTANT_BRIDGE__ = true;

  var path = String(location.pathname || "").toLowerCase();
  var params = new URLSearchParams(location.search);
  // A página canônica do chatbot mantém seu próprio atendimento interno.
  if (/\/chatboot-baby-ia\.html$/.test(path) || params.get("embed") === "1") return;
  if (document.getElementById("crypy-baby-global-root")) return;

  var current = document.currentScript;
  var source = current && current.src ? current.src.split("?")[0] : "";
  var marker = "assets/js/crypy-page-assistant.js";
  var markerIndex = source.lastIndexOf(marker);
  if (markerIndex < 0) {
    console.warn("[CRYPY] Não foi possível determinar a raiz do site para carregar BABY global.");
    return;
  }

  var siteRoot = new URL(source.slice(0, markerIndex), source);
  var runtimeUrl = new URL("assets/js/crypy-global-runtime.js", siteRoot).href;
  var existing = document.querySelector('script[data-crypy-global-runtime="true"]');
  if (existing) return;

  var runtime = document.createElement("script");
  runtime.src = runtimeUrl;
  runtime.defer = true;
  runtime.dataset.crypyGlobalRuntime = "true";
  runtime.onerror = function () {
    console.error("[CRYPY] Falha ao carregar o runtime global BABY:", runtimeUrl);
  };
  (document.head || document.documentElement).appendChild(runtime);
})();
