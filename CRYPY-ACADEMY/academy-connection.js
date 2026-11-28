(() => {
  "use strict";
  const API = "https://crypy-academy-api-production.up.railway.app";
  const box = document.getElementById("academy-cloud-status");
  const button = document.getElementById("academy-dropbox-connect");
  const note = document.getElementById("academy-cloud-note");
  if (!box || !button || !note) return;
  const say = (message) => { note.textContent = message; };
  async function refresh() {
    try {
      const response = await fetch(API + "/api/status", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error("status");
      box.dataset.state = data.dropbox.authorized ? "connected" : (data.dropbox.configured ? "ready" : "setup");
      if (data.dropbox.authorized) {
        say("Dropbox autorizado para a CRYPY Academy. A sincronização de arquivos ainda depende de uma ação de envio validada.");
        button.textContent = "Dropbox autorizado";
        button.disabled = true;
      } else if (data.dropbox.configured) {
        say("Servidor disponível. Autorize o aplicativo Dropbox da Academy para concluir o vínculo.");
        button.disabled = false;
      } else {
        say("Servidor disponível; faltam as credenciais públicas de configuração do aplicativo Dropbox no Railway.");
        button.disabled = true;
      }
    } catch {
      box.dataset.state = "offline";
      say("Servidor da Academy ainda não respondeu. A interface continua disponível; a conexão em nuvem está pendente.");
      button.disabled = true;
    }
  }
  button.addEventListener("click", () => { window.location.assign(API + "/auth/dropbox/start"); });
  refresh();
})();
