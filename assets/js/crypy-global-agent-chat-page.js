/* BABY — ChatBoot Global: roteamento dos 13 temas e chamadas autenticadas ao runtime. */
(function () {
  "use strict";
  if (window.__CRYPY_GLOBAL_AGENT_CHAT_PAGE__) return;
  window.__CRYPY_GLOBAL_AGENT_CHAT_PAGE__ = true;

  var API_BASE = "https://baby-site-auth-production.up.railway.app";
  var TOKEN_KEY = "crypy_baby_api_token_session";
  var params = new URLSearchParams(location.search);
  var sourcePath = params.get("source") || "/";
  var state = { token: "", assignments: [], status: null, busy: false };

  var el = {
    backend: document.getElementById("backend-status"),
    token: document.getElementById("api-token"),
    remember: document.getElementById("remember-token"),
    connect: document.getElementById("connect"),
    disconnect: document.getElementById("disconnect"),
    auth: document.getElementById("auth-status"),
    select: document.getElementById("agent-select"),
    task: document.getElementById("agent-task"),
    source: document.getElementById("source-path"),
    log: document.getElementById("chat-log"),
    form: document.getElementById("chat-form"),
    prompt: document.getElementById("prompt"),
    send: document.getElementById("send"),
    all: document.getElementById("all-agents")
  };

  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\\/g, "/").toLowerCase();
  }
  function appendMessage(text, kind, who) {
    var item = document.createElement("div");
    item.className = "message " + (kind || "system");
    if (who) {
      var label = document.createElement("span");
      label.className = "who";
      label.textContent = who;
      item.appendChild(label);
    }
    var body = document.createElement("span");
    body.textContent = String(text || "");
    item.appendChild(body);
    el.log.appendChild(item);
    el.log.scrollTop = el.log.scrollHeight;
    return item;
  }
  function setBusy(value) {
    state.busy = !!value;
    el.send.disabled = state.busy;
    el.all.disabled = state.busy || !state.token;
    el.connect.disabled = state.busy;
  }
  function currentAssignment() {
    return state.assignments.find(function (item) { return item.menuId === el.select.value; }) || state.assignments[0] || null;
  }
  function resolveAssignment(path) {
    var p = normalize(path);
    var exact = state.assignments.find(function (item) {
      return (item.exactPaths || []).some(function (candidate) { return p.indexOf(normalize(candidate)) !== -1; });
    });
    if (exact) return exact;
    var matches = [];
    state.assignments.forEach(function (item) {
      (item.pathPrefixes || []).forEach(function (prefix) {
        var candidate = normalize(prefix);
        if (candidate && p.indexOf(candidate) !== -1) matches.push({ item: item, length: candidate.length });
      });
    });
    matches.sort(function (a, b) { return b.length - a.length; });
    if (matches.length) return matches[0].item;
    return state.assignments.find(function (item) { return item.agentId === "baby"; }) || state.assignments[0] || null;
  }
  function renderAssignment() {
    var item = currentAssignment();
    if (!item) return;
    el.task.replaceChildren();
    var heading = document.createElement("strong");
    heading.textContent = item.agentName + " · " + item.menuLabel;
    var description = document.createElement("span");
    description.textContent = item.task;
    el.task.append(heading, description);
    el.source.textContent = "PÁGINA DE ORIGEM: " + sourcePath;
  }
  function renderAgents() {
    el.select.replaceChildren();
    state.assignments.forEach(function (item) {
      var option = document.createElement("option");
      option.value = item.menuId;
      option.textContent = item.menuId.toUpperCase() + " · " + item.agentName + " — " + item.menuLabel;
      el.select.appendChild(option);
    });
    var preferred = resolveAssignment(sourcePath);
    if (preferred) el.select.value = preferred.menuId;
    renderAssignment();
  }
  async function readJson(response) {
    var raw = await response.text();
    var data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch (_) { data = { message: raw }; }
    if (!response.ok) {
      var error = new Error(data.reason || data.message || data.code || ("HTTP " + response.status));
      error.status = response.status;
      error.code = data.code || "";
      throw error;
    }
    return data;
  }
  async function api(path, options, token) {
    var headers = Object.assign({}, options && options.headers || {});
    if (token) headers.Authorization = "Bearer " + token;
    if (options && options.body) headers["Content-Type"] = "application/json";
    var response = await fetch(API_BASE + path, Object.assign({ cache: "no-store" }, options || {}, { headers: headers }));
    return readJson(response);
  }
  function explainError(error) {
    if (error && error.code === "ORIGIN_DENIED") return "O backend recusou a origem deste site. Inclua o domínio atual em CRYPY_ALLOWED_ORIGINS no Railway.";
    if (error && error.status === 401) return "Token inválido ou não autorizado. Confira CRYPY_API_TOKEN no serviço baby-site-auth do Railway.";
    if (error && error.status === 403) return "Acesso bloqueado pelo backend. Confira a origem permitida e as permissões do token.";
    if (error instanceof TypeError) return "Falha de rede ou CORS. Confirme se o domínio deste site está em CRYPY_ALLOWED_ORIGINS e tente novamente.";
    return error && error.message ? error.message : "Falha desconhecida na conexão.";
  }
  async function checkHealth() {
    try {
      var data = await api("/health", { method: "GET" }, null);
      el.backend.textContent = data.ok ? "BACKEND ONLINE" : "BACKEND";
      el.backend.style.color = data.ok ? "#00ff88" : "#ffbd70";
    } catch (error) {
      el.backend.textContent = "BACKEND INACESSÍVEL";
      el.backend.style.color = "#ffbd70";
    }
  }
  async function connect() {
    var token = String(el.token.value || state.token || "").trim();
    if (!token) {
      el.auth.textContent = "Informe o valor de CRYPY_API_TOKEN. Não use CRYPY_DEFAULT_API_KEY.";
      return;
    }
    setBusy(true);
    el.auth.textContent = "Validando acesso ao runtime BABY…";
    try {
      var data = await api("/api/agents", { method: "GET" }, token);
      state.token = token;
      state.status = data;
      if (el.remember.checked) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
      var loaded = Number(data.profilesLoaded || data.loadedProfiles || 0);
      var total = Number(data.totalDeclared || 13);
      var configured = Number(data.generativeEnginesConfigured || 0);
      var verified = Number(data.generativeEnginesVerified || 0);
      el.auth.textContent = "AUTENTICADO · " + loaded + "/" + total + " perfis carregados · " + configured + "/" + total + " motores configurados · " + verified + "/" + total + " conexões verificadas.";
      el.backend.textContent = "BABY AUTENTICADO";
      el.backend.style.color = "#00ff88";
      el.all.disabled = false;
      appendMessage("Conexão autenticada. Perfis carregados: " + loaded + "/" + total + ". Motores configurados: " + configured + "/" + total + ". Verificações de modelo: " + verified + "/" + total + ". Configurado não significa testado; cada conexão só é verificada após uma chamada real.", "system", "BABY · STATUS");
    } catch (error) {
      state.token = "";
      state.status = null;
      el.auth.textContent = explainError(error);
      el.all.disabled = true;
      appendMessage(explainError(error), "system", "CONEXÃO NÃO VALIDADA");
    } finally {
      setBusy(false);
    }
  }
  function disconnect() {
    state.token = "";
    state.status = null;
    el.token.value = "";
    el.remember.checked = false;
    sessionStorage.removeItem(TOKEN_KEY);
    el.auth.textContent = "Token removido desta sessão.";
    el.all.disabled = true;
    el.backend.textContent = "BACKEND";
  }
  function specialistPrompt(item, message) {
    return [
      "TEMA OFICIAL: " + item.menuLabel,
      "RESPONSÁVEL: " + item.agentName + " (" + item.agentId + ") — " + item.role,
      "ATRIBUIÇÃO PERMANENTE: " + item.task,
      "LIMITES DE ATUAÇÃO: " + (item.guardrails || []).join(" | "),
      "PÁGINA DE ORIGEM: " + sourcePath,
      "SOLICITAÇÃO DO SENSEI: " + message,
      "Entregue resposta objetiva com análise, resultado, pendências e evidência necessária. Não declare alterações externas, testes, publicação ou sincronização que não tenham sido realmente executados."
    ].join("\n\n");
  }
  function extractText(data) {
    if (typeof data === "string") return data;
    if (data && typeof data.response === "string") return data.response;
    if (data && typeof data.output === "string") return data.output;
    if (data && typeof data.text === "string") return data.text;
    if (data && typeof data.content === "string") return data.content;
    return JSON.stringify(data, null, 2);
  }
  async function sendOne(message) {
    var item = currentAssignment();
    if (!item) throw new Error("Nenhum especialista foi atribuído a esta página.");
    var result = await api("/api/agents/" + encodeURIComponent(item.agentId) + "/run", {
      method: "POST",
      body: JSON.stringify({ prompt: specialistPrompt(item, message) })
    }, state.token);
    appendMessage(extractText(result), "assistant", item.agentName + " · " + item.menuLabel);
  }
  async function sendAll(message) {
    if (!window.confirm("Esta consulta chama os 13 perfis generativos e pode consumir créditos do provedor. Deseja continuar?")) return;
    var taskList = state.assignments.map(function (item) {
      return item.agentName + " [" + item.menuLabel + "]: " + item.task;
    }).join("\n");
    var request = [
      "SOLICITAÇÃO DO SENSEI: " + message,
      "ATRIBUIÇÕES PERMANENTES DOS 13 ESPECIALISTAS:",
      taskList,
      "Cada especialista deve responder apenas pelo tema correspondente à sua própria identidade e missão. Informe contribuição, evidência, riscos e pendências. Não afirme execução externa sem evidência."
    ].join("\n\n");
    var result = await api("/api/orchestrator/run", {
      method: "POST",
      body: JSON.stringify({ request: request, agentIds: state.assignments.map(function (item) { return item.agentId; }) })
    }, state.token);
    var results = Array.isArray(result.results) ? result.results : [];
    if (!results.length) {
      appendMessage(extractText(result), "assistant", "BABY · RESULTADO DA COLMEIA");
      return;
    }
    results.forEach(function (item) {
      var title = item.agentName || item.agentId || "AGENTE";
      var body = item.ok ? extractText(item) : ("FALHA: " + (item.error || item.code || "não especificada"));
      appendMessage(body, item.ok ? "assistant" : "system", title);
    });
    appendMessage("Execução coletiva concluída. Sucesso: " + (result.executedAgents || []).length + "/13 · Falhas: " + (result.failedAgents || []).length + "/13. Resultado parcial: " + (result.partial ? "sim" : "não") + ".", "system", "BABY · RESUMO DE EXECUÇÃO");
  }
  async function handleSubmit(all) {
    var message = String(el.prompt.value || "").trim();
    if (!message || state.busy) return;
    if (!state.token) {
      appendMessage("Conecte o CRYPY_API_TOKEN do serviço BABY no Railway antes de executar uma IA. O modo local de perfis não é inferência generativa.", "system", "AUTENTICAÇÃO NECESSÁRIA");
      return;
    }
    appendMessage(message, "user", "SENSEI");
    el.prompt.value = "";
    setBusy(true);
    var placeholder = appendMessage(all ? "Consultando os 13 especialistas em lotes…" : "Encaminhando ao especialista do tema…", "system", "BABY · EXECUTANDO");
    try {
      if (all) await sendAll(message);
      else await sendOne(message);
    } catch (error) {
      appendMessage(explainError(error), "system", "FALHA NA EXECUÇÃO");
    } finally {
      placeholder.remove();
      setBusy(false);
    }
  }

  el.select.addEventListener("change", renderAssignment);
  el.connect.addEventListener("click", connect);
  el.disconnect.addEventListener("click", disconnect);
  el.form.addEventListener("submit", function (event) {
    event.preventDefault();
    handleSubmit(false);
  });
  el.all.addEventListener("click", function () { handleSubmit(true); });

  async function init() {
    try {
      var response = await fetch("assets/data/crypy-menu-agent-assignments.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível carregar as atribuições dos 13 temas.");
      var registry = await response.json();
      if (!Array.isArray(registry.assignments) || registry.assignments.length !== 13 || !Array.isArray(registry.agentIds) || registry.agentIds.length !== 13) {
        throw new Error("O registro precisa conter exatamente 13 atribuições e 13 agentes.");
      }
      state.assignments = registry.assignments;
      renderAgents();
    } catch (error) {
      el.task.textContent = error.message;
      el.auth.textContent = error.message;
      el.connect.disabled = true;
      el.send.disabled = true;
      el.all.disabled = true;
      return;
    }
    checkHealth();
    var saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      el.token.value = saved;
      el.remember.checked = true;
      connect();
    }
  }
  init();
})();
