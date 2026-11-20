/* CRYPY WEB3.1 — Assistente contextual por página
 * Um motor compartilhado acompanha a página aberta no iframe crypy-content.
 * Pesquisa apenas o texto visível da página atual. Não finge ser IA generativa.
 * Sem acesso a HDs, cookies, armazenamento privado, APIs ou arquivos locais.
 */
(function () {
  "use strict";
  if (window.__CRYPY_PAGE_ASSISTANT__) return;
  window.__CRYPY_PAGE_ASSISTANT__ = true;

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "className") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (text != null) n.textContent = text;
    return n;
  }

  function mount() {
    var frame = document.querySelector('iframe[name="crypy-content"]');
    if (!frame || document.getElementById("crypy-page-assistant")) return;

    var root = el("section", { id: "crypy-page-assistant", "aria-label": "Assistente contextual da página" });
    var style = el("style");
    style.textContent = [
      "#crypy-page-assistant{position:fixed;left:16px;bottom:16px;z-index:2147482998;font:14px system-ui,-apple-system,Segoe UI,sans-serif;color:#eafff2}",
      "#crypy-page-assistant *{box-sizing:border-box}",
      "#cpa-toggle{border:1px solid #00ff88;border-radius:999px;padding:13px 17px;background:#03130a;color:#00ff88;font-weight:900;letter-spacing:.04em;box-shadow:0 0 18px #00ff8840;cursor:pointer}",
      "#cpa-panel{display:none;position:fixed;left:16px;bottom:76px;width:min(390px,calc(100vw - 32px));height:min(520px,calc(100dvh - 110px));background:#020804;border:1px solid #00ff88;border-radius:16px;overflow:hidden;box-shadow:0 18px 60px #000c,0 0 24px #00ff8830}",
      "#cpa-panel[data-open=true]{display:flex;flex-direction:column}",
      "#cpa-head{padding:12px 14px;background:#082014;border-bottom:1px solid #175a36}",
      "#cpa-name{font-size:13px;font-weight:900;color:#00ff88;letter-spacing:.07em}",
      "#cpa-status{font-size:10px;color:#a8cfb6;margin-top:4px}",
      "#cpa-messages{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:9px}",
      ".cpa-msg{max-width:94%;white-space:pre-wrap;overflow-wrap:anywhere;padding:9px 11px;border-radius:11px;font-size:13px;line-height:1.45}",
      ".cpa-user{align-self:flex-end;background:#00ff88;color:#001b0c;font-weight:650}",
      ".cpa-bot{align-self:flex-start;background:#10251a;color:#eafff2;border:1px solid #1b4c30}",
      ".cpa-source{display:block;margin-top:7px;color:#8fffc0;font-size:11px;overflow-wrap:anywhere}",
      "#cpa-form{display:flex;gap:7px;padding:10px;border-top:1px solid #17462b}",
      "#cpa-input{min-width:0;flex:1;border:1px solid #276542;border-radius:9px;padding:10px;background:#07170e;color:#fff;font-size:13px}",
      "#cpa-send{border:0;border-radius:9px;padding:0 13px;background:#00ff88;color:#001b0c;font-weight:900;cursor:pointer}",
      "@media(max-width:600px){#crypy-page-assistant{left:10px;bottom:10px}#cpa-panel{left:8px;bottom:72px;width:calc(100vw - 16px);height:min(64dvh,520px)}#cpa-toggle{padding:11px 14px}}"
    ].join("\n");

    var panel = el("div", { id: "cpa-panel", "data-open": "false" });
    var head = el("div", { id: "cpa-head" });
    var name = el("div", { id: "cpa-name" }, "ASSISTENTE DA PÁGINA");
    var status = el("div", { id: "cpa-status" }, "Aguardando a página ativa…");
    head.append(name, status);
    var messages = el("div", { id: "cpa-messages", "aria-live": "polite" });
    var form = el("form", { id: "cpa-form" });
    var input = el("input", { id: "cpa-input", type: "text", placeholder: "Pergunte sobre esta página…", autocomplete: "off" });
    var send = el("button", { id: "cpa-send", type: "submit" }, "BUSCAR");
    form.append(input, send);
    panel.append(head, messages, form);
    var toggle = el("button", { id: "cpa-toggle", type: "button", "aria-expanded": "false" }, "⌕ ASSISTENTE LOCAL");
    root.append(style, panel, toggle);
    document.body.appendChild(root);

    var current = { title: "Página", url: "", chunks: [], readable: false };
    function addMessage(text, kind, sources) {
      var bubble = el("div", { className: "cpa-msg " + (kind === "user" ? "cpa-user" : "cpa-bot") });
      bubble.textContent = text;
      (sources || []).forEach(function (source) {
        bubble.appendChild(el("span", { className: "cpa-source" }, "Fonte: " + source));
      });
      messages.appendChild(bubble);
      messages.scrollTop = messages.scrollHeight;
    }
    function identify(doc, url) {
      var title = (doc.title || (doc.querySelector("h1") && doc.querySelector("h1").textContent) || "Página CRYPY").trim();
      var path = url.toLowerCase();
      if (/dola/.test(path + " " + title.toLowerCase())) return "DOLA · " + title;
      if (/mini/.test(path + " " + title.toLowerCase())) return "MINI · " + title;
      if (/darkness/.test(path + " " + title.toLowerCase())) return "DARKNESS · " + title;
      if (/baby/.test(path + " " + title.toLowerCase())) return "BABY · " + title;
      return "CRYPY · " + title;
    }
    function makeChunks(doc) {
      var clone = doc.body.cloneNode(true);
      clone.querySelectorAll("script,style,noscript,nav,header,footer,form,button,input,textarea,select,iframe,svg").forEach(function (n) { n.remove(); });
      var text = (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return [];
      var parts = text.match(/[^.!?]+[.!?]?/g) || [text];
      var chunks = [];
      var buffer = "";
      parts.forEach(function (part) {
        part = part.trim();
        if (!part) return;
        if ((buffer + " " + part).length > 520 && buffer) {
          chunks.push(buffer);
          buffer = part;
        } else buffer = buffer ? buffer + " " + part : part;
      });
      if (buffer) chunks.push(buffer);
      return chunks.slice(0, 250);
    }
    function refreshContext() {
      try {
        var doc = frame.contentDocument;
        var url = frame.contentWindow.location.href;
        if (!doc || !doc.body || new URL(url).origin !== location.origin) throw new Error("cross-origin");
        current = { title: identify(doc, url), url: url, chunks: makeChunks(doc), readable: true };
        name.textContent = current.title.toLocaleUpperCase("pt-BR");
        status.textContent = current.chunks.length
          ? "Contexto local carregado · " + current.chunks.length + " trechos · sem IA generativa"
          : "Página aberta, mas não encontrei texto pesquisável.";
        messages.replaceChildren();
        addMessage("Estou acompanhando esta página. Posso localizar e mostrar trechos do conteúdo visível dela. Não sou uma IA generativa nem salvo memória permanente.", "bot");
      } catch (err) {
        current = { title: "Página externa", url: "", chunks: [], readable: false };
        name.textContent = "ASSISTENTE CRYPY";
        status.textContent = "Conteúdo indisponível para leitura local.";
        messages.replaceChildren();
        addMessage("Não consigo ler esta página: ela pode ser externa ao CRYPY ou bloquear acesso entre páginas. Nenhum dado foi enviado.", "bot");
      }
    }
    function search(query) {
      var terms = query.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9]{2,}/g) || [];
      if (!terms.length) return [];
      return current.chunks.map(function (text, index) {
        var normalized = text.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        var score = terms.reduce(function (sum, term) { return sum + (normalized.includes(term) ? 1 : 0); }, 0);
        return { text: text, score: score, index: index };
      }).filter(function (item) { return item.score > 0; })
        .sort(function (a, b) { return b.score - a.score || a.index - b.index; }).slice(0, 3);
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      if (!query) return;
      addMessage(query, "user");
      input.value = "";
      if (!current.readable) {
        addMessage("Não há contexto local disponível nesta página. Abra uma página do CRYPY dentro do portal para pesquisar seu conteúdo.", "bot");
        return;
      }
      var results = search(query);
      if (!results.length) {
        addMessage("Não encontrei esse assunto no texto disponível desta página. Isso não prova que a informação não exista em outra página do CRYPY.", "bot");
        return;
      }
      addMessage("Encontrei estes trechos relacionados na página atual. Estou apresentando evidências do conteúdo, não inventando uma resposta:", "bot",
        results.map(function (item) { return current.title + " · trecho " + (item.index + 1) + " · " + current.url; }));
      results.forEach(function (item) { addMessage(item.text, "bot"); });
    });
    toggle.addEventListener("click", function () {
      var open = panel.getAttribute("data-open") !== "true";
      panel.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) input.focus();
    });
    frame.addEventListener("load", refreshContext);
    window.addEventListener("message", function (event) {
      if (event.source === frame.contentWindow) refreshContext();
    });
    if (frame.contentDocument && frame.contentDocument.readyState === "complete") refreshContext();
    else status.textContent = "Aguardando carregamento do conteúdo no portal…";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
