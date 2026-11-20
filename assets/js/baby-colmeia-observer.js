/* BABY Colmeia Observer — leitura apenas; não executa ações administrativas. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let records = [];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const tag = (text, kind="") => '<span class="tag '+kind+'">'+esc(text)+'</span>';
  function render() {
    const q = $("search").value.trim().toLowerCase();
    const f = $("filter").value;
    const visible = records.filter(r => {
      const match = !q || r.path.toLowerCase().includes(q);
      const status = f === "all" ||
        (f === "indexed" && r.inKnowledgeIndex) ||
        (f === "outside" && !r.inKnowledgeIndex) ||
        (f === "covered" && !!r.coverageRecord) ||
        (f === "unclassified" && !r.coverageRecord) ||
        (f === "protected" && r.protected);
      return match && status;
    });
    $("rows").innerHTML = visible.map(r => '<tr>'+
      '<td class="path">'+esc(r.path)+'</td>'+
      '<td>'+tag(r.inKnowledgeIndex ? "No índice" : "Fora do índice",r.inKnowledgeIndex?"":"warn")+'</td>'+
      '<td>'+tag(r.coverageRecord || "Sem classificação",r.coverageRecord?"":"warn")+'</td>'+
      '<td>'+tag(r.protected ? "Protegida" : "Não marcada",r.protected?"warn":"")+'</td>'+
      '<td>'+tag(r.contextualAssistant === "reported_by_coverage_manifest" ? "Declarado no manifesto" : "Não confirmado",r.contextualAssistant === "reported_by_coverage_manifest" ? "":"warn")+'</td>'+
      '</tr>').join("") || '<tr><td colspan="5">Nenhuma página corresponde ao filtro.</td></tr>';
    $("count").textContent = "Exibindo "+visible.length+" de "+records.length+" páginas.";
  }
  async function start() {
    try {
      const response = await fetch("../auditorias/BABY-COLMEIA-MATRIZ-001.json",{cache:"no-store"});
      if (!response.ok) throw new Error("Matriz indisponível (HTTP "+response.status+").");
      const data = await response.json();
      if (!Array.isArray(data.rows)) throw new Error("Formato da matriz não reconhecido.");
      records = data.rows;
      const s = data.summary || {};
      $("total").textContent = s.htmlCount ?? records.length;
      $("indexed").textContent = s.indexedCount ?? "—";
      $("covered").textContent = s.coverageListed ?? "—";
      $("excluded").textContent = s.excludedListed ?? "—";
      $("unclassified").textContent = s.indexNotCoveredOrExcluded ?? "—";
      $("protected").textContent = s.protectedOrExcludedOrSensitivePath ?? "—";
      $("state").textContent = "Matriz carregada · versão "+(data.version || "sem versão");
      $("detail").textContent = "Retrato de "+(s.generatedAt || "data não informada")+". "+(s.browserTests ?? 0)+" testes de navegador registrados nessa matriz. Valores descritivos, não prova de runtime.";
      render();
    } catch (e) {
      $("state").textContent = "Não foi possível carregar a matriz.";
      $("state").className = "error";
      $("detail").textContent = e.message;
      $("rows").innerHTML = '<tr><td colspan="5" class="error">'+esc(e.message)+'</td></tr>';
    }
  }
  $("search").addEventListener("input",render);
  $("filter").addEventListener("change",render);
  $("reset").addEventListener("click",()=>{$("search").value="";$("filter").value="all";render();});
  start();
})();