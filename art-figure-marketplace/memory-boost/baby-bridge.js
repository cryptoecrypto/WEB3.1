/* BABY I.A — PONTE DE INTEGRAÇÃO V1.0 | baby-bridge.js
 Conecta baby-ia.html (intacto) ao baby-core.js sem editar o HTML original.
 Uso: <script src="baby-core.js"></script><script src="baby-bridge.js"></script> antes de </body>
 Cria um painel flutuante: chat, upload de arquivos, HD-Memória, exportar/importar, status.
*/
(function(){
if(!window.BabyIA){console.warn("[BABY] baby-core.js não carregado.");return;}
const css=document.createElement("style"); css.textContent=`
#baby-fab{position:fixed;right:18px;bottom:18px;z-index:9999;background:#00ff88;color:#03130a;border:0;border-radius:999px;padding:13px 18px;font-weight:900;cursor:pointer;box-shadow:0 8px 30px rgba(0,255,136,.35);font-family:Arial}
#baby-panel{position:fixed;right:18px;bottom:76px;z-index:9999;width:min(380px,calc(100vw - 36px));max-height:78vh;overflow:auto;background:#07150d;border:1px solid #00ff88;border-radius:18px;padding:16px;color:#eafff3;font-family:Arial;display:none;box-shadow:0 16px 50px rgba(0,0,0,.5)}
#baby-panel h3{color:#00ff88;margin:0 0 4px}#baby-panel p{font-size:13px;opacity:.85}
#baby-log{height:170px;overflow:auto;background:#030803;border:1px solid #173d28;border-radius:12px;padding:10px;font-size:13px;white-space:pre-wrap;margin:10px 0}
#baby-input{width:100%;padding:11px;border-radius:10px;border:1px solid #173d28;background:#030803;color:#eafff3}
.baby-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.baby-row button{flex:1;background:#0a2a18;color:#00ff88;border:1px solid #00ff88;border-radius:999px;padding:9px;cursor:pointer;font-weight:700}.baby-row button.primary{background:#00ff88;color:#03130a}
#baby-status{font-size:12px;opacity:.8;margin-top:8px}.baby-file{font-size:12px;opacity:.85;margin-top:8px}
`; document.head.appendChild(css);
const fab=document.createElement("button"); fab.id="baby-fab"; fab.textContent="🟢 Falar com BABY"; document.body.appendChild(fab);
const panel=document.createElement("div"); panel.id="baby-panel"; panel.innerHTML=`<h3>BABY I.A — Motor V1.0</h3><p>Interface → Ponte → Motor → HD-Memória. Tudo roda offline, no seu navegador.</p><div id="baby-log">BABY: Oi! Eu sou o BABY 🟢 Digite “Memorize: ...” ou envie um arquivo .TXT / .JSON / .HTML.</div><input id="baby-input" placeholder="Ex: Memorize: o lançamento é segunda"><div class="baby-row"><button class="primary" id="baby-send">Enviar</button><button id="baby-export">Exportar HD</button></div><div class="baby-row"><button id="baby-import-btn">Importar HD</button><button id="baby-clear">Limpar*</button></div><label class="baby-file">📂 Ensinar com arquivo: <input type="file" id="baby-file" accept=".txt,.md,.json,.html"></label><div id="baby-status"></div><input type="file" id="baby-import-file" accept=".json" hidden>`; document.body.appendChild(panel);
const log=panel.querySelector("#baby-log"), input=panel.querySelector("#baby-input"), statusEl=panel.querySelector("#baby-status");
function say(q,a){log.textContent+=`\n\nVOCÊ: ${q}\nBABY: ${a}`; log.scrollTop=log.scrollHeight;}
function refresh(){const s=BabyIA.status(); statusEl.textContent=`Memórias: ${s.memorias} • Modo: ${s.modo} • Versão: ${s.versao} • *Limpar exige autorizar apagarMemoria no AUTO.CONFIG.`;}
function send(){const v=input.value.trim(); if(!v) return; const r=BabyIA.responder(v); say(v,r.resposta); if(r.acao==="exportar") doExport(); input.value=""; refresh();}
function doExport(){const blob=new Blob([BabyIA.exportarMemoria()],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="baby-hd-memoria.json"; a.click(); URL.revokeObjectURL(a.href);}
fab.onclick=()=>{panel.style.display=panel.style.display==="block"?"none":"block"; refresh();};
panel.querySelector("#baby-send").onclick=send; input.addEventListener("keydown",e=>{if(e.key==="Enter")send();});
panel.querySelector("#baby-export").onclick=doExport;
panel.querySelector("#baby-clear").onclick=()=>{const r=BabyIA.limparMemoria(); say("Apagar tudo", r.ok?"Memória limpa.":r.erro); refresh();};
panel.querySelector("#baby-import-btn").onclick=()=>panel.querySelector("#baby-import-file").click();
panel.querySelector("#baby-import-file").addEventListener("change",async e=>{const f=e.target.files[0]; if(!f) return; const txt=await f.text(); const r=BabyIA.importarMemoria(txt); say("Importar HD-Memória", r.ok?`Importados ${r.importados}. Total: ${r.total}`:"Erro: "+r.erro); refresh();});
panel.querySelector("#baby-file").addEventListener("change",async e=>{const f=e.target.files[0]; if(!f) return; try{const info=await BabyIA.interpretarArquivo(f); const r=BabyIA.memorizar({titulo:info.titulo,conteudo:info.resumo+"\n\n"+info.conteudo.slice(0,3000),tipo:info.tipo,origem:"arquivo:"+f.name,tags:[info.tipo]}); say("Arquivo: "+f.name, `Li e interpretei! Tipo: ${info.tipo} • Título: ${info.titulo} • Duplicado? ${info.duplicado?"Sim — já existe":"Não"}\nResumo: ${info.resumo}\n${r.ok?"✅ Memorizado na HD-Memória.":"⚠️ "+r.erro}`);}catch(err){say("Arquivo: "+f.name,"Não consegui ler: "+err.message);} refresh(); e.target.value="";});
refresh();
})();
