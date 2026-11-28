/* Compatibilidade da HOME: garante o widget global mesmo se o runtime ainda estiver carregando. */
(function () {
  "use strict";
  if (window.__CRYPY_BABY_GLOBAL_CHAT__ || document.querySelector('script[data-crypy-baby-chat-bridge="true"]')) return;
  var current = document.currentScript;
  if (!current || !current.src) return;
  var target = new URL("../assets/js/baby-global-chat.js?v=20261128-global-colmeia-1", current.src);
  var script = document.createElement("script");
  script.src = target.href;
  script.defer = true;
  script.dataset.crypyBabyChatBridge = "true";
  (document.head || document.documentElement).appendChild(script);
})();
