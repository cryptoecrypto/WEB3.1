/* CRYPY Dynamic Design — rotação mensal e diária, apenas visual. */
(function(){
 "use strict";
 if(window.__CRYPY_DYNAMIC_DESIGN__)return;
 window.__CRYPY_DYNAMIC_DESIGN__=true;
 var script=document.currentScript;
 var root=new URL("../../",script&&script.src?script.src:document.baseURI);
 var configUrl=new URL("assets/data/crypy-design-calendar.json",root);
 var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 var fallback={
  monthlyThemes:[{month:1,name:"MATRIX",background:"#020805",panel:"#071810",accent:"#00ff88",accent2:"#269cff",accent3:"#ff3a58",glow:"#00ff88"}],
  dailySkins:[{name:"NEON",accent:"#00ff88",accent2:"#269cff",accent3:"#ff3a58",effect:"glow"}],
  dailyMessages:[{phrase:"NEXUS conecta; Sensei conduz.",idea:"Melhore uma área autorizada com cuidado.",tip:"Registre e teste cada alteração."}]
 };
 function dayNumber(date){var d=new Date(date.getFullYear(),date.getMonth(),date.getDate());return Math.floor(d.getTime()/86400000);}
 function pick(list,index){return list[((index%list.length)+list.length)%list.length];}
 function dailySeed(date){
  var stamp=date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0"),hash=2166136261;
  for(var i=0;i<stamp.length;i++){hash^=stamp.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return hash>>>0;
 }
 function seededIndex(seed,length,salt){var value=(seed^Math.imul((salt+1),0x9e3779b1))>>>0;value^=value>>>16;value=Math.imul(value,0x7feb352d);value^=value>>>15;return (value>>>0)%length;}
 function nextLocalMidnight(){var now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,1,0);return Math.max(1000,next.getTime()-now.getTime());}
 function ensureWidget(message,theme,skin){
  var previous=document.getElementById("crypy-daily-idea");if(previous)previous.remove();
  var box=document.createElement("aside");box.id="crypy-daily-idea";
  var style=document.createElement("style");
  style.textContent="#crypy-daily-idea{position:fixed;right:14px;top:14px;z-index:2147482998;font:13px/1.45 system-ui,sans-serif;color:#effff7}#crypy-daily-idea *{box-sizing:border-box}#crypy-daily-idea button{font:inherit;cursor:pointer}#crypy-daily-toggle{border:1px solid var(--crypy-daily-accent);border-radius:999px;padding:9px 13px;background:rgba(3,10,14,.92);color:#fff;font-weight:900;box-shadow:0 0 18px color-mix(in srgb,var(--crypy-daily-accent) 35%,transparent)}#crypy-daily-panel{display:none;position:absolute;right:0;top:46px;width:min(330px,calc(100vw - 28px));padding:14px;border:1px solid var(--crypy-daily-accent);border-radius:15px;background:rgba(4,10,18,.97);box-shadow:0 15px 45px #000b;backdrop-filter:blur(12px)}#crypy-daily-idea[data-open=true] #crypy-daily-panel{display:block}#crypy-daily-panel h3{margin:0 0 8px;color:var(--crypy-daily-accent);font-size:15px}#crypy-daily-panel p{margin:8px 0;color:#e7fff2}#crypy-daily-panel b{color:var(--crypy-daily-accent2)}#crypy-daily-close{float:right;border:0;background:transparent;color:#fff;font-size:19px}#crypy-daily-meta{font-size:10px;letter-spacing:.1em;color:var(--crypy-daily-accent3)}@media(max-width:600px){#crypy-daily-idea{right:8px;top:8px}#crypy-daily-toggle{padding:8px 10px;font-size:11px}}@media(prefers-reduced-motion:reduce){#crypy-daily-idea *{animation:none!important;transition:none!important}}";
  var toggle=document.createElement("button");toggle.id="crypy-daily-toggle";toggle.type="button";toggle.textContent="✦ IDEIA DO DIA";
  var panel=document.createElement("div");panel.id="crypy-daily-panel";
  var close=document.createElement("button");close.id="crypy-daily-close";close.type="button";close.setAttribute("aria-label","Fechar");close.textContent="×";
  var title=document.createElement("h3");title.textContent=message.phrase;
  var meta=document.createElement("div");meta.id="crypy-daily-meta";meta.textContent=theme.name+" · "+skin.name;
  var idea=document.createElement("p");var ideaLabel=document.createElement("b");ideaLabel.textContent="IDEIA — ";idea.append(ideaLabel,document.createTextNode(message.idea));
  var tip=document.createElement("p");var tipLabel=document.createElement("b");tipLabel.textContent="DICA — ";tip.append(tipLabel,document.createTextNode(message.tip));
  panel.append(close,meta,title,idea,tip);box.append(style,toggle,panel);document.body.appendChild(box);
  toggle.addEventListener("click",function(){box.setAttribute("data-open",box.getAttribute("data-open")==="true"?"false":"true");});
  close.addEventListener("click",function(){box.setAttribute("data-open","false");});
 }
 function apply(config){
  var now=new Date(),month=now.getMonth()+1,day=dayNumber(now);
  var themes=config.monthlyThemes&&config.monthlyThemes.length?config.monthlyThemes:fallback.monthlyThemes;
  var skins=config.dailySkins&&config.dailySkins.length?config.dailySkins:fallback.dailySkins;
  var messages=config.dailyMessages&&config.dailyMessages.length?config.dailyMessages:fallback.dailyMessages;
  var theme=themes.find(function(x){return x.month===month;})||themes[0];
  var seed=dailySeed(now),skin=pick(skins,seededIndex(seed,skins.length,1)),message=pick(messages,seededIndex(seed,messages.length,2));
  var palettes=[
   {name:"IRIDESCENTE",accent:"#55f5c7",accent2:"#5b9dff",accent3:"#ff75cf",glow:"#55f5c7"},
   {name:"PRISMA SOLAR",accent:"#ffd166",accent2:"#ff5b6e",accent3:"#6cf5ff",glow:"#ffd166"},
   {name:"AURORA RGB",accent:"#00ff88",accent2:"#269cff",accent3:"#ff3a58",glow:"#00ff88"},
   {name:"GALÁXIA",accent:"#bd75ff",accent2:"#42e8ff",accent3:"#ffcf70",glow:"#bd75ff"},
   {name:"CRISTAL",accent:"#a7f4ff",accent2:"#8da9ff",accent3:"#ffffff",glow:"#a7f4ff"},
   {name:"NEON TROPICAL",accent:"#35f2a1",accent2:"#ff62c7",accent3:"#ffe66d",glow:"#35f2a1"},
   {name:"FUSÃO",accent:"#ff456b",accent2:"#26e0d0",accent3:"#b58cff",glow:"#ff456b"},
   {name:"OCEANO ELÉTRICO",accent:"#39d8ff",accent2:"#287cff",accent3:"#70ffd0",glow:"#39d8ff"}
  ];
  var palette=pick(palettes,seededIndex(seed,palettes.length,3));
  var layouts=[
   {name:"ORBITAL",radius:"22px",gap:"18px"},{name:"CRISTAL",radius:"8px",gap:"12px"},
   {name:"FLUIDO",radius:"28px",gap:"16px"},{name:"GEOMETRICO",radius:"4px",gap:"11px"},
   {name:"COLMEIA",radius:"15px",gap:"14px"}
  ],layout=pick(layouts,seededIndex(seed,layouts.length,4));
  var rootEl=document.documentElement;
  rootEl.style.setProperty("--crypy-theme-bg",theme.background);
  rootEl.style.setProperty("--crypy-theme-panel",theme.panel);
  rootEl.style.setProperty("--crypy-theme-accent",theme.accent);
  rootEl.style.setProperty("--crypy-daily-accent",palette.accent);
  rootEl.style.setProperty("--crypy-daily-accent2",palette.accent2);
  rootEl.style.setProperty("--crypy-daily-accent3",palette.accent3);
  rootEl.style.setProperty("--crypy-daily-glow",palette.glow);
  rootEl.style.setProperty("--crypy-daily-radius",layout.radius);
  rootEl.style.setProperty("--crypy-daily-gap",layout.gap);
  rootEl.dataset.crypyMonth=String(month);
  rootEl.dataset.crypyMonthlyTheme=theme.name;
  rootEl.dataset.crypyDailySkin=palette.name;
  rootEl.dataset.crypyDailyEffect=skin.effect||"prism";
  rootEl.dataset.crypyDailyLayout=layout.name;
  rootEl.dataset.crypyDayStamp=String(day);
  var cssId="crypy-dynamic-design-skin";
  var css=document.getElementById(cssId);
  if(!css){css=document.createElement("style");css.id=cssId;document.head.appendChild(css);}
  css.textContent=[
   "body{background-color:var(--crypy-theme-bg)!important;transition:background-color 1.2s ease,color 1.2s ease}",
   "body:before{background:radial-gradient(ellipse at 12% 10%,color-mix(in srgb,var(--crypy-theme-accent) 18%,transparent),transparent 34%),radial-gradient(ellipse at 88% 16%,color-mix(in srgb,var(--crypy-daily-accent2) 18%,transparent),transparent 32%),linear-gradient(180deg,transparent,var(--crypy-theme-bg) 90%)!important}",
   ":where(.card,.panel,.tile,.module,.hive-card,.team-card,.lesson,.track-card,.feature-card,.chapter,.stat,.theme,.product-card,.game-card,.nft-card,.menu-card,.box,.caixa,article){border-color:color-mix(in srgb,var(--crypy-daily-accent) 58%,transparent)!important;border-radius:var(--crypy-daily-radius);box-shadow:0 0 0 1px color-mix(in srgb,var(--crypy-daily-accent2) 18%,transparent),0 10px 30px color-mix(in srgb,var(--crypy-daily-accent) 9%,transparent);transition:border-color 1s ease,box-shadow 1s ease,background-color 1s ease,border-radius 1s ease}",
   ":where(.card,.panel,.tile,.module,.hive-card,.team-card,.lesson,.track-card,.feature-card,.chapter,.stat,.theme,.product-card,.game-card,.nft-card,.menu-card,.box,.caixa,article):hover{box-shadow:0 0 0 1px var(--crypy-daily-accent2),0 0 24px color-mix(in srgb,var(--crypy-daily-accent) 30%,transparent),0 0 38px color-mix(in srgb,var(--crypy-daily-accent3) 18%,transparent)}",
   ":where(h1,h2,h3,.section-kicker,.eyebrow,.band-label){text-shadow:0 0 14px color-mix(in srgb,var(--crypy-theme-accent) 28%,transparent)}",
   ":where(button,.btn,.track-button,.level-button):focus-visible,:where(a,input,textarea,select):focus-visible{outline:2px solid var(--crypy-daily-accent)!important;outline-offset:3px}",
   "#crypy-global-nav-toggle{border-color:var(--crypy-daily-accent)!important;color:var(--crypy-daily-accent)!important;box-shadow:0 0 18px color-mix(in srgb,var(--crypy-daily-accent) 25%,transparent)!important}",
   "body[data-crypy-daily-effect=glass] :where(.card,.panel,.tile,.module,article){backdrop-filter:blur(10px)}",
   "body[data-crypy-daily-effect=edge] :where(.card,.panel,.tile,.module,article){border-left:3px solid var(--crypy-daily-accent)}",
   "body[data-crypy-daily-effect=grid]{background-image:linear-gradient(color-mix(in srgb,var(--crypy-daily-accent) 5%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--crypy-daily-accent) 5%,transparent) 1px,transparent 1px);background-size:32px 32px}",
   "body[data-crypy-daily-layout=ORBITAL] :where(.grid,.grid2,.grid3,.stats,.gal,.steps,.theme-grid,.levels){gap:var(--crypy-daily-gap)}",
   "body[data-crypy-daily-layout=GEOMETRICO] :where(.card,.panel,.tile,.module,article){border-style:solid;border-width:1px}",
   "@keyframes crypyIridescentPulse{0%,100%{filter:saturate(1)}50%{filter:saturate(1.22)}}",
   "@keyframes crypyPrismGlow{0%,100%{box-shadow:0 0 0 1px color-mix(in srgb,var(--crypy-daily-accent) 22%,transparent),0 8px 24px color-mix(in srgb,var(--crypy-daily-accent2) 10%,transparent)}50%{box-shadow:0 0 0 1px color-mix(in srgb,var(--crypy-daily-accent2) 55%,transparent),0 0 26px color-mix(in srgb,var(--crypy-daily-accent3) 22%,transparent)}}",
   ":where(.card,.panel,.tile,.module,.hive-card,.team-card,.lesson,.track-card,.feature-card,.chapter,.stat,.theme,.product-card,.game-card,.nft-card,.menu-card,.box,.caixa,article){animation:crypyPrismGlow 8s ease-in-out infinite}",
   "body[data-crypy-daily-effect=prism] :where(h1,h2,h3,.section-kicker,.eyebrow){animation:crypyIridescentPulse 7s ease-in-out infinite}",
   "@media(prefers-reduced-motion:reduce){:where(.card,.panel,.tile,.module,.hive-card,.team-card,.lesson,.track-card,.feature-card,.chapter,.stat,.theme,.product-card,.game-card,.nft-card,.menu-card,.box,.caixa,article,h1,h2,h3){animation:none!important;transition:none!important}}"
  ].join("\n");
  var monthlyLayouts={"aurora":"html[data-crypy-monthly-theme='AURORA']{--crypy-card-radius:24px;--crypy-layout-gap:16px;--crypy-card-border:solid;--crypy-card-shadow:0 12px 36px rgba(85,245,199,.10)}","pulse":"html[data-crypy-monthly-theme='PULSE']{--crypy-card-radius:30px;--crypy-layout-gap:13px;--crypy-card-border:solid;--crypy-card-shadow:0 10px 30px rgba(255,79,163,.12)}","cyber":"html[data-crypy-monthly-theme='CYBER']{--crypy-card-radius:5px;--crypy-layout-gap:10px;--crypy-card-border:solid;--crypy-card-shadow:0 0 0 1px rgba(0,255,200,.12)}","prism":"html[data-crypy-monthly-theme='PRISM']{--crypy-card-radius:17px;--crypy-layout-gap:15px;--crypy-card-border:double;--crypy-card-shadow:0 12px 30px rgba(167,139,250,.13)}","ocean":"html[data-crypy-monthly-theme='OCEAN']{--crypy-card-radius:20px;--crypy-layout-gap:16px;--crypy-card-border:solid;--crypy-card-shadow:inset 0 -3px 0 rgba(57,216,255,.13)}","solar":"html[data-crypy-monthly-theme='SOLAR']{--crypy-card-radius:11px;--crypy-layout-gap:12px;--crypy-card-border:solid;--crypy-card-shadow:0 10px 26px rgba(255,202,85,.12)}","neon":"html[data-crypy-monthly-theme='NEON']{--crypy-card-radius:7px;--crypy-layout-gap:11px;--crypy-card-border:solid;--crypy-card-shadow:0 0 18px rgba(213,107,255,.14)}","quantum":"html[data-crypy-monthly-theme='QUANTUM']{--crypy-card-radius:15px;--crypy-layout-gap:18px;--crypy-card-border:dashed;--crypy-card-shadow:0 8px 30px rgba(74,168,255,.12)}","matrix":"html[data-crypy-monthly-theme='MATRIX']{--crypy-card-radius:3px;--crypy-layout-gap:10px;--crypy-card-border:solid;--crypy-card-shadow:0 0 0 1px rgba(0,255,136,.12)}","ember":"html[data-crypy-monthly-theme='EMBER']{--crypy-card-radius:12px;--crypy-layout-gap:12px;--crypy-card-border:solid;--crypy-card-shadow:0 10px 28px rgba(255,113,71,.14)}","galaxy":"html[data-crypy-monthly-theme='GALAXY']{--crypy-card-radius:26px;--crypy-layout-gap:17px;--crypy-card-border:solid;--crypy-card-shadow:0 12px 38px rgba(114,167,255,.13)}","crystal":"html[data-crypy-monthly-theme='CRYSTAL']{--crypy-card-radius:8px;--crypy-layout-gap:14px;--crypy-card-border:double;--crypy-card-shadow:0 0 0 1px rgba(167,244,255,.13)}"};
  var layoutStyle=document.getElementById("crypy-dynamic-month-layout");
  if(!layoutStyle){layoutStyle=document.createElement("style");layoutStyle.id="crypy-dynamic-month-layout";document.head.appendChild(layoutStyle);}
  layoutStyle.textContent=monthlyLayouts[String(theme.layout||"").toLowerCase()]||"";
  if(document.body){document.body.dataset.crypyMonthlyTheme=theme.name;document.body.dataset.crypyDailyEffect=skin.effect||"glow";}
  ensureWidget(message,theme,{name:palette.name,effect:skin.effect||"prism"});
 }
 function boot(){
  fetch(configUrl.href,{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}).then(apply).catch(function(){apply(fallback);});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
 var midnightTimer=null;
 function scheduleMidnightRefresh(){if(midnightTimer)window.clearTimeout(midnightTimer);midnightTimer=window.setTimeout(function(){boot();scheduleMidnightRefresh();},nextLocalMidnight());}
 scheduleMidnightRefresh();
 function refreshIfNewDay(){var old=document.documentElement.dataset.crypyDayStamp,today=String(dayNumber(new Date()));if(old!==today)boot();scheduleMidnightRefresh();}
 document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")refreshIfNewDay();});
 window.addEventListener("focus",refreshIfNewDay);
})();
