/* CRYPY SQUAD — Colmeia de Conversação
 * Dez salas independentes, identidade cromática e interface pública para alunos.
 * A versão atual responde por busca contextual no texto visível da página e por
 * orientação de função. Não simula um modelo generativo nem promete conexão IA.
 * Histórico separado por integrante existe apenas durante a sessão desta página.
 */
(function () {
  "use strict";
  if (window.__CRYPY_SQUAD_HIVE_CHAT__) return;
  window.__CRYPY_SQUAD_HIVE_CHAT__ = true;
  try { if (window.self !== window.top) return; } catch (_) { return; }

  var TEAM = [
    { id:"NEXUS", role:"Coordenação, auditoria e orientação", color:"#F4F7FA", intro:"Sou NEXUS. Organizo a conversa, separo fatos de hipóteses e ajudo a transformar ideias em próximos passos verificáveis." },
    { id:"BTC", role:"Memória, preservação e histórico", color:"#FFD700", intro:"Sou BTC. Ajudo a localizar, organizar e preservar informações históricas. Não afirmo que algo foi salvo sem confirmação." },
    { id:"ETH", role:"Construção, arquitetura e tecnologia", color:"#3988FF", intro:"Sou ETH. Ajudo a estruturar soluções, explicar arquitetura e dividir implementações em etapas testáveis." },
    { id:"USDT", role:"Equilíbrio, organização e estabilidade", color:"#00C987", intro:"Sou USDT. Ajudo a comparar alternativas, organizar prioridades e manter equilíbrio entre esforço, risco e resultado." },
    { id:"BABY", role:"Porta-voz e atendimento central", color:"#FFD35A", intro:"Sou BABY I.A. Recebo alunos e visitantes, explico o universo CRYPY e encaminho cada assunto ao integrante mais adequado." },
    { id:"DOLA", role:"Arte, criatividade e expressão", color:"#287BFF", intro:"Sou DOLA. Ajudo com ideias visuais, identidade artística, direção criativa e apresentação de projetos." },
    { id:"ALICE", role:"Pesquisa, conhecimento e ensino", color:"#39E879", intro:"Sou ALICE. Ajudo a pesquisar, explicar conceitos e organizar o aprendizado em linguagem clara." },
    { id:"MINI", role:"Análise, estratégia e desafios", color:"#A855F7", intro:"Sou MINI. Ajudo a decompor problemas, comparar evidências e explicar estratégias passo a passo." },
    { id:"CHAT", role:"História, revisão e conexão", color:"#FF4141", intro:"Sou CHAT. Ajudo a revisar registros, conectar acontecimentos e distinguir documentação de interpretação." },
    { id:"UNION", role:"Integração, harmonia e conexão", color:"iridescent", intro:"Sou UNION. Ajudo a conectar as perspectivas do Esquadrão, encontrar pontos em comum e organizar uma resposta integrada." }
  ];

  function node(tag, attrs, value) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "className") el.className = attrs[key];
      else el.setAttribute(key, attrs[key]);
    });
    if (value != null) el.textContent = value;
    return el;
  }
  function normalize(value) {
    return String(value || "").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function chunksFrom(doc) {
    if (!doc || !doc.body) return [];
    var copy = doc.body.cloneNode(true);
    copy.querySelectorAll("script,style,noscript,nav,header,footer,form,button,input,textarea,select,iframe,svg,[aria-hidden='true']").forEach(function (el) { el.remove(); });
    var raw = (copy.innerText || copy.textContent || "").replace(/\s+/g, " ").trim();
    if (!raw) return [];
    var pieces = raw.match(/[^.!?]+[.!?]?/g) || [raw], out = [], buffer = "";
    pieces.forEach(function (piece) {
      piece = piece.trim();
      if (!piece) return;
      if (buffer && (buffer + " " + piece).length > 560) { out.push(buffer); buffer = piece; }
      else buffer = buffer ? buffer + " " + piece : piece;
    });
    if (buffer) out.push(buffer);
    return out.slice(0, 300);
  }
  function currentContext() {
    var doc = document, title = document.title || "Página CRYPY", url = location.href;
    var frame = document.querySelector('iframe[name="crypy-content"], #viewer');
    if (frame) {
      try {
        if (frame.contentDocument && frame.contentDocument.body) {
          doc = frame.contentDocument;
          title = doc.title || title;
          url = frame.contentWindow.location.href;
        }
      } catch (_) { /* conteúdo de outra origem: usa a página hospedeira */ }
    }
    return { title:title, url:url, chunks:chunksFrom(doc) };
  }

  function mount() {
    if (!document.body || document.getElementById("crypy-squad-hive-chat")) return;
    var context = currentContext();
    var active = "BABY";
    var histories = {};
    TEAM.forEach(function (member) { histories[member.id] = []; });

    var root = node("aside", { id:"crypy-squad-hive-chat", "aria-label":"Chats individuais do Esquadrão CRYPY" });
    var style = node("style");
    style.textContent = [
      "#crypy-squad-hive-chat{position:fixed;left:16px;bottom:16px;z-index:2147483001;font:14px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;color:#effff5}",
      "#crypy-squad-hive-chat *{box-sizing:border-box}",
      "#csh-launch{display:flex;align-items:center;gap:9px;border:1px solid #00ff88;border-radius:999px;padding:10px 15px;background:#03130a;color:#eafff2;font-weight:900;box-shadow:0 0 18px #00ff8840;cursor:pointer}",
      "#csh-launch-mark{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#ffd35a;color:#171000;font-size:12px;font-weight:1000}",
      "#csh-panel{display:none;position:fixed;left:16px;bottom:76px;width:min(440px,calc(100vw - 32px));height:min(640px,calc(100dvh - 104px));min-height:390px;background:#020805;border:1px solid #00ff8866;border-radius:17px;overflow:hidden;box-shadow:0 18px 60px #000d}",
      "#csh-panel[data-open=true]{display:flex;flex-direction:column}",
      "#csh-head{padding:12px 14px;background:#07180e;border-bottom:1px solid #194b2d}",
      "#csh-title-row{display:flex;align-items:center;gap:9px}",
      "#csh-avatar{width:35px;height:35px;border-radius:50%;display:grid;place-items:center;color:#00190a;font-weight:1000;background:#ffd35a;flex:0 0 auto}",
      "#csh-name{font-weight:950;font-size:14px}#csh-role{font-size:11px;color:#a7c9b2;margin-top:2px}",
      "#csh-close{margin-left:auto;border:1px solid #42604b;border-radius:50%;width:32px;height:32px;background:#09170e;color:#fff;cursor:pointer;font-size:18px}",
      "#csh-team{display:flex;gap:6px;overflow-x:auto;padding:10px 12px;background:#030b06;border-bottom:1px solid #153b24;scrollbar-width:thin}",
      ".csh-member{flex:0 0 auto;min-width:54px;padding:6px 8px;border:1px solid #294a35;border-radius:10px;background:#07140c;color:#dfffea;font-size:10px;font-weight:900;cursor:pointer}",
      ".csh-member[aria-pressed=true]{border-color:var(--member-color);box-shadow:0 0 12px color-mix(in srgb,var(--member-color) 35%,transparent);background:#102217}",
      ".csh-member-dot{display:block;width:13px;height:13px;border-radius:50%;margin:0 auto 4px;background:var(--member-color)}",
      ".csh-member[data-iridescent=true] .csh-member-dot{background:linear-gradient(135deg,#ff4b8b,#ffd84b,#35e8a0,#39a7ff,#b45cff)}",
      "#csh-mode{padding:6px 13px;color:#9cc9aa;font-size:10px;background:#030b06}",
      "#csh-log{flex:1;min-height:0;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:9px;overscroll-behavior:contain}",
      ".csh-msg{max-width:94%;padding:10px 12px;border-radius:13px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;line-height:1.48}",
      ".csh-agent{align-self:flex-start;background:#0a1a10;border:1px solid var(--active-color);color:#effff5;border-bottom-left-radius:4px}",
      ".csh-user{align-self:flex-end;background:#dfffea;color:#07180e;border-bottom-right-radius:4px}",
      ".csh-evidence{display:block;margin-top:7px;color:#a6d7b6;font-size:10px}",
      "#csh-form{display:flex;gap:7px;padding:10px;border-top:1px solid #17442a;background:#030b06}",
      "#csh-input{min-width:0;flex:1;border:1px solid #315d40;border-radius:10px;padding:11px 12px;background:#07170e;color:#fff;font:inherit;font-size:14px}",
      "#csh-send{border:0;border-radius:10px;padding:0 15px;background:var(--active-color);color:#07130b;font-weight:950;cursor:pointer}",
      "#csh-note{padding:0 12px 9px;background:#030b06;color:#789985;font-size:9px}",
      "@media(max-width:600px){#crypy-squad-hive-chat{left:9px;bottom:9px}#csh-panel{left:8px;bottom:68px;width:calc(100vw - 16px);height:min(72dvh,640px);min-height:360px}#csh-launch{padding:9px 12px}}",
      "@media(prefers-reduced-motion:reduce){#crypy-squad-hive-chat *{scroll-behavior:auto!important;transition:none!important}}"
    ].join("\n");

    var panel = node("section", { id:"csh-panel", "data-open":"false", "aria-label":"Colmeia de Conversação" });
    var head = node("div", { id:"csh-head" });
    var titleRow = node("div", { id:"csh-title-row" });
    var avatar = node("div", { id:"csh-avatar", "aria-hidden":"true" }, "B");
    var labels = node("div", {});
    var name = node("div", { id:"csh-name" }, "BABY · Atendimento central");
    var role = node("div", { id:"csh-role" }, "Porta-voz e atendimento central");
    labels.append(name, role);
    var close = node("button", { id:"csh-close", type:"button", "aria-label":"Fechar chats" }, "×");
    titleRow.append(avatar, labels, close);
    head.appendChild(titleRow);

    var tabs = node("div", { id:"csh-team", role:"group", "aria-label":"Escolha um integrante" });
    var log = node("div", { id:"csh-log", "aria-live":"polite" });
    var mode = node("div", { id:"csh-mode" }, "MODO ALUNO · ACESSO ABERTO · escolha um integrante");
    var form = node("form", { id:"csh-form" });
    var input = node("input", { id:"csh-input", type:"text", autocomplete:"off", placeholder:"Escreva sua pergunta…", "aria-label":"Sua mensagem" });
    var send = node("button", { id:"csh-send", type:"submit" }, "ENVIAR");
    form.append(input, send);
    var note = node("div", { id:"csh-note" }, "Respostas desta versão usam o conteúdo público da página. Não há modelo generativo conectado nem envio de dados a serviços externos.");
    panel.append(head, tabs, mode, log, form, note);

    var launch = node("button", { id:"csh-launch", type:"button", "aria-expanded":"false", "aria-controls":"csh-panel" });
    launch.append(node("span", { id:"csh-launch-mark" }, "B"), node("span", {}, "CHATS DO ESQUADRÃO"));
    root.append(style, panel, launch);
    document.body.appendChild(root);

    function memberById(id) { return TEAM.filter(function (x) { return x.id === id; })[0] || TEAM[4]; }
    function colorStyle(member) {
      return member.color === "iridescent"
        ? "linear-gradient(120deg,#ff4b8b,#ffd84b,#35e8a0,#39a7ff,#b45cff)"
        : member.color;
    }
    function addMessage(text, kind, source) {
      var bubble = node("div", { className:"csh-msg " + (kind === "user" ? "csh-user" : "csh-agent") }, text);
      if (source) bubble.appendChild(node("span", { className:"csh-evidence" }, source));
      log.appendChild(bubble);
      log.scrollTop = log.scrollHeight;
    }
    function renderHistory() {
      log.replaceChildren();
      var member = memberById(active);
      if (!histories[active].length) {
        addMessage(member.intro, "agent");
        addMessage("Pode perguntar. Vou explicar com clareza e indicar quando não houver evidência suficiente nesta página.", "agent");
      } else {
        histories[active].forEach(function (item) { addMessage(item.text, item.kind, item.source); });
      }
      log.style.setProperty("--active-color", colorStyle(member));
      panel.style.setProperty("--active-color", colorStyle(member));
      send.style.background = colorStyle(member);
    }
    function choose(id) {
      active = id;
      var member = memberById(id);
      name.textContent = member.id + (id === "BABY" ? " I.A." : "") + " · Chat individual";
      role.textContent = member.role;
      avatar.textContent = member.id.slice(0, 1);
      avatar.style.background = colorStyle(member);
      avatar.style.color = member.color === "iridescent" ? "#16051a" : "#06140a";
      tabs.querySelectorAll("button").forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute("data-member") === id ? "true" : "false");
      });
      input.placeholder = "Converse com " + member.id + "…";
      renderHistory();
    }
    TEAM.forEach(function (member) {
      var button = node("button", { className:"csh-member", type:"button", "data-member":member.id, "aria-pressed":"false", style:"--member-color:" + (member.color === "iridescent" ? "#ff65b8" : member.color) });
      if (member.color === "iridescent") button.setAttribute("data-iridescent", "true");
      button.appendChild(node("span", { className:"csh-member-dot" }));
      button.appendChild(document.createTextNode(member.id));
      button.addEventListener("click", function () { choose(member.id); });
      tabs.appendChild(button);
    });

    function answerFor(member, question) {
      var terms = normalize(question).match(/[a-z0-9]{2,}/g) || [];
      var matches = context.chunks.map(function (text, index) {
        var normalized = normalize(text);
        var score = terms.reduce(function (sum, term) { return sum + (normalized.indexOf(term) >= 0 ? 1 : 0); }, 0);
        return { text:text, index:index, score:score };
      }).filter(function (item) { return item.score > 0; })
        .sort(function (a,b) { return b.score - a.score || a.index - b.index; }).slice(0,3);

      if (matches.length) {
        return {
          text: member.id + " encontrou " + matches.length + " trecho(s) relacionados na página. Vou separar o que está documentado do que ainda precisa ser confirmado:\n\n" + matches.map(function (item) { return "• " + item.text; }).join("\n\n"),
          source: "Fonte: " + context.title + " · " + context.url
        };
      }
      var hints = {
        NEXUS:"Posso ajudar a organizar o pedido, apontar riscos e definir uma verificação objetiva.",
        BTC:"Posso ajudar a estruturar uma linha do tempo ou identificar quais registros precisam ser consultados.",
        ETH:"Posso dividir a ideia em componentes, dependências e etapas de implementação.",
        USDT:"Posso comparar opções e organizar prioridades, limites e riscos.",
        BABY:"Posso orientar sua navegação pela Colmeia e indicar qual integrante atende melhor ao assunto.",
        DOLA:"Posso ajudar a desenvolver o conceito visual, a linguagem artística e a apresentação.",
        ALICE:"Posso explicar o assunto em etapas e montar um roteiro de estudo.",
        MINI:"Posso decompor o problema em partes e mostrar como avaliar cada evidência.",
        CHAT:"Posso ajudar a ordenar os fatos e distinguir datas, registros e interpretações.",
        UNION:"Posso reunir as perspectivas do Esquadrão e apontar o que cada integrante pode contribuir."
      };
      return {
        text:"Não encontrei uma resposta comprovável no texto desta página. " + hints[member.id] + " Se a pergunta depender de informações de outra página, abra essa página na Colmeia e pergunte novamente.",
        source:"Busca local sem correspondência · " + context.title
      };
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var question = input.value.trim();
      if (!question) return;
      var member = memberById(active);
      histories[active].push({ kind:"user", text:question });
      addMessage(question, "user");
      input.value = "";
      var result = answerFor(member, question);
      histories[active].push({ kind:"agent", text:result.text, source:result.source });
      addMessage(result.text, "agent", result.source);
    });
    function open(value) {
      panel.setAttribute("data-open", value ? "true" : "false");
      launch.setAttribute("aria-expanded", value ? "true" : "false");
      if (value) input.focus();
    }
    launch.addEventListener("click", function () { open(panel.getAttribute("data-open") !== "true"); });
    close.addEventListener("click", function () { open(false); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") open(false); });
    choose("BABY");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once:true });
  else mount();
})();
