/* BABY I.A. — conexão MetaMask somente leitura
 * Não solicita assinatura, não envia transações e não acessa chaves privadas.
 * A conexão só começa após clique explícito do usuário.
 */
(function () {
  "use strict";
  if (window.__BABY_METAMASK_CONNECT__) return;
  window.__BABY_METAMASK_CONNECT__ = true;

  var header = document.getElementById("topo");
  if (!header) return;

  var style = document.createElement("style");
  style.textContent = [
    "#baby-metamask-control{margin-left:auto;display:flex;align-items:center;gap:7px;min-width:0}",
    "#baby-metamask-connect{border:1px solid #00ff88;background:#061b10;color:#00ff88;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap}",
    "#baby-metamask-connect:focus-visible{outline:2px solid #fff;outline-offset:3px}",
    "#baby-metamask-state{font-size:10px;color:#a8d8bb;max-width:116px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    "@media(max-width:420px){#baby-metamask-state{display:none}#baby-metamask-connect{padding:8px;font-size:11px}}"
  ].join("\n");
  document.head.appendChild(style);

  var control = document.createElement("div");
  control.id = "baby-metamask-control";
  var state = document.createElement("span");
  state.id = "baby-metamask-state";
  state.setAttribute("role", "status");
  state.setAttribute("aria-live", "polite");
  state.textContent = "Carteira não conectada";
  var button = document.createElement("button");
  button.id = "baby-metamask-connect";
  button.type = "button";
  button.textContent = "Conectar MetaMask";
  control.appendChild(state);
  control.appendChild(button);
  header.appendChild(control);

  var connectedAddress = null;
  var chainId = null;

  function shortAddress(address) {
    return address.slice(0, 6) + "…" + address.slice(-4);
  }

  function render() {
    if (connectedAddress) {
      state.textContent = shortAddress(connectedAddress) + " · " + (chainId || "rede desconhecida");
      button.textContent = "Carteira conectada";
      button.setAttribute("aria-label", "MetaMask conectada. Clique para atualizar a conta.");
    } else {
      state.textContent = "Carteira não conectada";
      button.textContent = "Conectar MetaMask";
      button.setAttribute("aria-label", "Conectar MetaMask");
    }
  }

  function publish() {
    window.__BABY_WALLET_READONLY__ = connectedAddress ? {
      provider: "MetaMask-compatible EIP-1193",
      address: connectedAddress,
      chainId: chainId,
      permission: "read-only",
      canSign: false,
      canSendTransactions: false
    } : null;
    window.dispatchEvent(new CustomEvent("baby:wallet-state", {
      detail: window.__BABY_WALLET_READONLY__
    }));
    if (typeof window.addMsg === "function" && connectedAddress) {
      window.addMsg("MetaMask conectada em modo somente leitura: " + shortAddress(connectedAddress) + ". Rede: " + (chainId || "não identificada") + ". Nenhuma transação ou assinatura foi solicitada.", "baby");
    }
  }

  async function refresh() {
    if (!window.ethereum || typeof window.ethereum.request !== "function") {
      state.textContent = "MetaMask não detectada";
      button.textContent = "MetaMask indisponível";
      return;
    }
    var accounts = await window.ethereum.request({ method: "eth_accounts" });
    connectedAddress = Array.isArray(accounts) && accounts[0] ? accounts[0] : null;
    chainId = await window.ethereum.request({ method: "eth_chainId" }).catch(function () { return null; });
    render();
    publish();
  }

  button.addEventListener("click", async function () {
    if (!window.ethereum || typeof window.ethereum.request !== "function") {
      state.textContent = "Instale/ative a MetaMask neste navegador";
      return;
    }
    button.disabled = true;
    button.textContent = "Aguardando autorização…";
    try {
      var accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!Array.isArray(accounts) || !accounts[0] || !/^0x[a-fA-F0-9]{40}$/.test(accounts[0])) {
        throw new Error("A carteira não retornou um endereço EVM válido.");
      }
      connectedAddress = accounts[0];
      chainId = await window.ethereum.request({ method: "eth_chainId" });
      render();
      publish();
    } catch (error) {
      state.textContent = error && error.code === 4001 ? "Conexão recusada na carteira" : "Não foi possível conectar";
      connectedAddress = null;
      render();
    } finally {
      button.disabled = false;
    }
  });

  if (window.ethereum && typeof window.ethereum.on === "function") {
    window.ethereum.on("accountsChanged", function (accounts) {
      connectedAddress = Array.isArray(accounts) && accounts[0] ? accounts[0] : null;
      render();
      publish();
    });
    window.ethereum.on("chainChanged", function (nextChainId) {
      chainId = nextChainId;
      render();
      publish();
    });
  }
  render();
})();
