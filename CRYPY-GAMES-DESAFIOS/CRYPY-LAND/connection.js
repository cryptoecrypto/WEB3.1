/**
 * CRYPY Server Bridge — safe inactive scaffold.
 *
 * This file intentionally performs NO network requests.
 * Implement the transport only after the real server.js API contract
 * (routes, authentication, payloads and error behavior) is reviewed.
 */
(function (root) {
  "use strict";

  const STATUS = "INACTIVE_PENDING_SERVER_CONTRACT";

  function getStatus() {
    return {
      name: "CRYPY Server Bridge",
      status: STATUS,
      connected: false,
      networkRequestsEnabled: false,
      reason: "Aguardando inspeção do server.js e definição das rotas reais."
    };
  }

  function connect() {
    return Promise.reject(
      new Error(
        "Conexão desativada: configure o adaptador somente após validar o contrato da API do servidor CRYPY."
      )
    );
  }

  const api = Object.freeze({
    getStatus,
    connect
  });

  root.CrypyServerBridge = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
