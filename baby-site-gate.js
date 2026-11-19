/* BABY I.A. — bloqueio compartilhado para páginas de chatbot.
   Fail-closed: sem backend HTTPS e sessão válida, o chatbot permanece oculto. */
(function () {
  "use strict";
  var api = String(window.BABY_SITE_API || "").replace(/\/$/, "");
  var style = document.createElement("style");
  style.textContent = "body{visibility:hidden!important}#babySiteGate{visibility:visible!important;position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:#020603;color:#eafff3;font:15px Arial,sans-serif}#babySiteGate .panel{width:min(100%,420px);padding:26px;background:#07150d;border:1px solid #00ff88;border-radius:18px;box-shadow:0 0 35px #00ff8830}#babySiteGate h1{color:#00ff88;font-size:25px;margin:0 0 8px}#babySiteGate p{line-height:1.5;color:#b8d8c4}#babySiteGate input{box-sizing:border-box;width:100%;padding:13px;margin:12px 0;background:#020603;border:1px solid #28613d;border-radius:9px;color:white;font-size:16px}#babySiteGate button{width:100%;padding:13px;border:0;border-radius:9px;background:#00ff88;color:#03130a;font-weight:800;font-size:15px}#babySiteGate .status{min-height:22px;color:#f6c56b;font-size:13px;margin-top:10px}";
  document.head.appendChild(style);
  function gate() {
    var box = document.createElement("div");
    box.id = "babySiteGate";
    box.innerHTML = '<div class="panel"><h1>BABY I.A. — acesso protegido</h1><p>Este assistente é exclusivo do ecossistema CRYPY. Informe a palavra-chave para abrir a sessão.</p><form><input type="password" name="key" autocomplete="current-password" placeholder="Palavra-chave" required><button type="submit">DESBLOQUEAR</button><div class="status" role="status" aria-live="polite"></div></form></div>';
    document.body.appendChild(box);
    var form = box.querySelector("form"), input = box.querySelector("input"), status = box.querySelector(".status");
    function showPage() { box.remove(); document.body.style.visibility = "visible"; }
    function request(path, body) {
      return fetch(api + path, {method: body ? "POST" : "GET", credentials:"include", headers: body ? {"Content-Type":"application/json"} : {}, body: body ? JSON.stringify(body) : undefined});
    }
    if (!api) { status.textContent = "Bloqueado: o endereço HTTPS do servidor BABY ainda não foi configurado."; return; }
    request("/session").then(function(r){ if(!r.ok) throw new Error("locked"); return r.json(); })
      .then(function(data){ if(data && data.authenticated === true && data.scope === "crypy-site") showPage(); else status.textContent="Acesso bloqueado. Digite a palavra-chave."; })
      .catch(function(){ status.textContent="Servidor de segurança indisponível. O BABY continua bloqueado."; });
    form.addEventListener("submit", function(e) {
      e.preventDefault(); status.textContent="Validando...";
      request("/unlock", {key:input.value}).then(function(r){ if(!r.ok) throw new Error("invalid"); return r.json(); })
        .then(function(data){ if(data.authenticated === true && data.scope === "crypy-site") showPage(); else throw new Error("invalid"); })
        .catch(function(){ input.value=""; status.textContent="Chave inválida ou servidor indisponível."; input.focus(); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", gate, {once:true});
  else gate();
})();
