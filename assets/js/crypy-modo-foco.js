/* CRYPY MODO FOCO — camada visual reversível.
   Não remove conteúdo nem altera a estrutura dos módulos.
   Para visualizar o layout original: acrescente ?modo=normal à URL. */
(function(){
  'use strict';
  try {
    if (new URLSearchParams(window.location.search).get('modo') === 'normal') return;
    if (window.parent !== window && new URLSearchParams(window.parent.location.search).get('modo') === 'normal') return;
  } catch (_) {}
  const STYLE_ID = 'crypy-modo-foco-style';
  const css = [
    'html,body{scroll-behavior:auto!important}',
    'body.crypy-modo-foco header,body.crypy-modo-foco footer,body.crypy-modo-foco nav,body.crypy-modo-foco aside,body.crypy-modo-foco [role="banner"],body.crypy-modo-foco [role="contentinfo"],body.crypy-modo-foco .clock,body.crypy-modo-foco [class*="clock"],body.crypy-modo-foco [id*="clock"],body.crypy-modo-foco .world-clock,body.crypy-modo-foco .sidebar,body.crypy-modo-foco .topbar,body.crypy-modo-foco .bottom-bar,body.crypy-modo-foco .top-nav,body.crypy-modo-foco .bottom-nav,body.crypy-modo-foco .side-nav,body.crypy-modo-foco .main-nav,body.crypy-modo-foco .global-nav,body.crypy-modo-foco .mobile-nav,body.crypy-modo-foco .floating-menu,body.crypy-modo-foco .floating-button,body.crypy-modo-foco .crypy-home-return,body.crypy-modo-foco #crypy-music,body.crypy-modo-foco #status,body.crypy-modo-foco #catalog,body.crypy-modo-foco #matrixCanvas{display:none!important;visibility:hidden!important}',
    'body.crypy-modo-foco{padding-top:0!important;margin-top:0!important}',
    'body.crypy-modo-foco main{margin-top:0!important;padding-top:0!important}',
    'body.crypy-modo-foco #workspace{display:block!important;grid-template-columns:minmax(0,1fr)!important;min-height:100vh!important}',
    'body.crypy-modo-foco #viewer{display:block!important;width:100%!important;height:100vh!important;min-height:100vh!important;border:0!important}',
    'body.crypy-modo-foco .viewer{height:100vh!important;min-height:100vh!important;max-height:none!important;border:0!important;border-radius:0!important}',
    'body.crypy-modo-foco #page-frame{width:100%!important;height:100vh!important;min-height:100vh!important}',
    'body.crypy-modo-foco .toolbar,body.crypy-modo-foco .note{display:none!important}',
    'body.crypy-modo-foco #matrixCanvas,body.crypy-modo-foco:before,body.crypy-modo-foco:after{display:none!important;opacity:0!important}',
    'body.crypy-modo-foco .wrap{width:100%!important;max-width:none!important;margin:0!important;padding-left:12px!important;padding-right:12px!important}',
    'body.crypy-modo-foco .hero,body.crypy-modo-foco main>section:first-child{margin-top:0!important}'
  ].join('\n');
  function apply(doc){
    if(!doc || !doc.documentElement || !doc.body) return;
    try{
      doc.body.classList.add('crypy-modo-foco');
      if(!doc.getElementById(STYLE_ID)){
        const style=doc.createElement('style');style.id=STYLE_ID;style.textContent=css;
        (doc.head||doc.documentElement).appendChild(style);
      }
      doc.querySelectorAll('iframe').forEach(frame=>{
        if(!frame.dataset.crypyFocusBound){
          frame.dataset.crypyFocusBound='1';
          frame.addEventListener('load',()=>{try{apply(frame.contentDocument)}catch(_){}});
        }
        try{if(frame.contentDocument&&frame.contentDocument.readyState==='complete')apply(frame.contentDocument)}catch(_){}
      });
    }catch(_){}
  }
  apply(document);
  document.querySelectorAll('iframe').forEach(frame=>frame.addEventListener('load',()=>{try{apply(frame.contentDocument)}catch(_){}}));
  // INDEX 6: carrega uma página central por padrão, já que o menu ficará oculto.
  if(document.getElementById('viewer') && !document.getElementById('viewer').getAttribute('src')){
    fetch('./assets/data/crypy-page-index.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{
      const pages=Array.isArray(data.pages)?data.pages:[];
      const chosen=pages.find(p=>p && p.group==='crypy-infinyt')||pages[0];
      if(chosen && chosen.path) document.getElementById('viewer').src=chosen.path;
    }).catch(()=>{});
  }
})();