(function () {
  "use strict";
  const meta = document.querySelector('meta[name="crypy-academy-api"]');
  const apiBase = (meta?.content || "").trim().replace(/\/$/, "");
  const root = document.getElementById("academy-auth");
  if (!root) return;
  const status = document.getElementById("academy-auth-status");
  const identity = document.getElementById("academy-auth-identity");
  const loginButtons = root.querySelectorAll("[data-academy-login]");
  const logout = document.getElementById("academy-logout");
  const diplomaList = document.getElementById("academy-diplomas");
  const state = { user: null, csrf: null, enabled: /^https:\/\//i.test(apiBase) && !apiBase.includes("SEU-SERVICO") };

  function message(text) { if (status) status.textContent = text; }
  async function request(path, options = {}) {
    if (!state.enabled) throw new Error("BACKEND_NAO_CONFIGURADO");
    const method = (options.method || "GET").toUpperCase();
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && state.csrf) headers.set("X-Academy-CSRF", state.csrf);
    const response = await fetch(apiBase + path, { ...options, method, headers, credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || ("HTTP_" + response.status));
    return data;
  }
  async function loadDiplomas() {
    if (!state.user || !diplomaList) return;
    try {
      const data = await request("/api/diplomas");
      diplomaList.replaceChildren();
      if (!data.diplomas.length) {
        diplomaList.textContent = "Nenhum diploma liberado. Conclua todas as unidades e obtenha 10/10 na prova final.";
        return;
      }
      data.diplomas.forEach(item => {
        const p = document.createElement("p");
        p.textContent = item.track_id + " · " + item.level_id + " · 10/10 · " + item.email_status + " · " + item.verification_code;
        diplomaList.append(p);
      });
    } catch (error) { diplomaList.textContent = "Não foi possível consultar os diplomas: " + error.message; }
  }
  function render() {
    loginButtons.forEach(button => {
      button.disabled = !state.enabled || !!state.user;
      button.title = !state.enabled ? "Backend ainda não configurado" : "";
    });
    if (logout) logout.hidden = !state.user;
    if (identity) identity.textContent = state.user ? (state.user.name + " · " + state.user.email) : "Nenhum aluno conectado";
    if (!state.enabled) message("LOGIN AINDA NÃO ATIVO — backend, OAuth e domínio precisam ser configurados.");
    else if (state.user) message("Conectado. Progresso e avaliações são vinculados à sua conta.");
    else message("Entre com Google ou Microsoft para salvar seu progresso e realizar as provas.");
    document.dispatchEvent(new CustomEvent("crypyacademy:auth", { detail: { user: state.user, enabled: state.enabled } }));
    loadDiplomas();
  }
  async function refresh() {
    if (!state.enabled) return render();
    try {
      const data = await request("/api/me");
      state.user = data.user;
      state.csrf = data.csrf;
    } catch (_) {
      state.user = null;
      state.csrf = null;
    }
    render();
  }
  loginButtons.forEach(button => button.addEventListener("click", () => {
    const provider = button.dataset.academyLogin;
    if (!state.enabled || !["google", "microsoft"].includes(provider)) return;
    window.location.assign(apiBase + "/api/auth/" + provider + "/start");
  }));
  if (logout) logout.addEventListener("click", async () => {
    try {
      await request("/api/logout", { method: "POST" });
      state.user = null; state.csrf = null; render();
    } catch (error) { message("Falha ao sair: " + error.message); }
  });
  window.CrypyAcademyAuth = {
    request,
    get user() { return state.user; },
    get enabled() { return state.enabled; },
    refresh,
    loadDiplomas
  };
  refresh();
})();