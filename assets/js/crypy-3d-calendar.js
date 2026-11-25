/* CRYPY 3D Calendar — calendário editorial e avisos pré-programados do BABY. */
(function(){
 "use strict";
 if(window.__CRYPY_3D_CALENDAR__)return;
 window.__CRYPY_3D_CALENDAR__=true;
 var script=document.currentScript,root=new URL("../../",script&&script.src?script.src:document.baseURI);
 var dataUrl=new URL("assets/data/crypy-events-calendar.json",root);
 var months=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
 var weekdays=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
 var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 function easter(year){
  var a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;
  return new Date(year,month-1,day);
 }
 function key(date){return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");}
 function fromKey(value,year){var p=value.split("-");return new Date(year,Number(p[0])-1,Number(p[1]));}
 function nthWeekday(year,month,weekday,n){var d=new Date(year,month,1);var shift=(weekday-d.getDay()+7)%7;return new Date(year,month,1+shift+(n-1)*7);}
 function buildEvents(config,year){
  var list=(config.fixedEvents||[]).map(function(e){var d;if(e.date.indexOf("MAY-")===0)d=nthWeekday(year,4,0,2);else d=fromKey(e.date,year);return Object.assign({},e,{date:key(d)});});
  var pascoa=easter(year);
  (config.movableEvents||[]).forEach(function(e){var d=new Date(pascoa);d.setDate(d.getDate()+Number(e.offset));list.push(Object.assign({},e,{date:key(d)}));});
  return list.sort(function(a,b){return a.date.localeCompare(b.date);});
 }
 function node(tag,attrs,text){var el=document.createElement(tag);Object.keys(attrs||{}).forEach(function(k){if(k==="className")el.className=attrs[k];else el.setAttribute(k,attrs[k]);});if(text!==undefined)el.textContent=text;return el;}
 function mount(config){
  if(document.getElementById("crypy-3d-calendar"))return;
  var events=buildEvents(config,new Date().getFullYear()),now=new Date(),view=new Date(now.getFullYear(),now.getMonth(),1),selected=key(now);
  var host=node("aside",{id:"crypy-3d-calendar","aria-label":"Calendário 3D CRYPY"});
  var style=node("style",{});
  style.textContent=`
  #crypy-3d-calendar{position:fixed;right:16px;bottom:16px;z-index:2147482997;font:13px/1.45 system-ui,sans-serif;color:#effff7}
  #crypy-3d-calendar *{box-sizing:border-box}
  #crypy-3d-calendar button{font:inherit;cursor:pointer}
  #crypy-calendar-toggle{display:flex;align-items:center;gap:9px;padding:11px 16px;border:1px solid #56e8c1;border-radius:15px;background:linear-gradient(135deg,#061a18ed,#071329f5);color:#dffff6;font-weight:900;letter-spacing:.04em;box-shadow:0 12px 30px #0009,0 0 22px #36e8d455;transform:perspective(500px) rotateX(4deg);transition:transform .25s,box-shadow .25s}
  #crypy-calendar-toggle:hover{transform:perspective(500px) rotateX(0) translateY(-3px);box-shadow:0 16px 38px #000b,0 0 28px #36e8d477}
  #crypy-calendar-panel{display:none;position:absolute;right:0;bottom:58px;width:min(390px,calc(100vw - 24px));max-height:min(78vh,720px);overflow:auto;padding:16px;border:1px solid #45eac0;border-radius:20px;background:linear-gradient(145deg,#061411f7,#071326f8 58%,#120d25f7);box-shadow:0 24px 70px #000e,0 0 35px #39e8c033;backdrop-filter:blur(18px);transform:perspective(1100px) rotateY(-2deg);transform-origin:bottom right}
  #crypy-3d-calendar[data-open=true] #crypy-calendar-panel{display:block;animation:crypyCalendarIn .35s ease-out}
  @keyframes crypyCalendarIn{from{opacity:0;transform:perspective(1100px) rotateY(-9deg) translateY(16px)}to{opacity:1;transform:perspective(1100px) rotateY(-2deg) translateY(0)}}
  .crypy-cal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
  .crypy-cal-brand{font-size:11px;letter-spacing:.16em;color:#69f3c8;font-weight:950}
  .crypy-cal-close,.crypy-cal-arrow{border:1px solid #276c5b;border-radius:10px;background:#0a211d;color:#dffff6;min-width:34px;min-height:34px}
  .crypy-cal-month{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0 12px}
  .crypy-cal-month strong{font-size:18px;color:#fff}
  .crypy-cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;perspective:800px}
  .crypy-cal-weekday{text-align:center;color:#8cbeb0;font-size:10px;padding:4px 0}
  .crypy-cal-day{position:relative;min-height:38px;border:1px solid #17483e;border-radius:9px;background:linear-gradient(145deg,#0b2923,#091624);color:#dffbf2;box-shadow:0 3px 0 #020a0d;transition:transform .18s,border-color .18s,box-shadow .18s}
  .crypy-cal-day:hover{transform:translateY(-3px) rotateX(8deg);border-color:#5af4c8;box-shadow:0 7px 12px #0008}
  .crypy-cal-day[aria-pressed=true]{border-color:#9af7dc;background:linear-gradient(145deg,#14533f,#153b60);box-shadow:0 0 0 1px #6cf3ce,0 0 16px #4ee6c477}
  .crypy-cal-day.today:after{content:"";position:absolute;right:4px;top:4px;width:5px;height:5px;border-radius:50%;background:#ffd166}
  .crypy-cal-day.event:before{content:"";position:absolute;left:50%;bottom:3px;width:5px;height:5px;border-radius:50%;background:#ff8ed1;transform:translateX(-50%)}
  .crypy-cal-day.empty{visibility:hidden}
  .crypy-cal-legend{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0;color:#a6c9bf;font-size:10px}
  .crypy-cal-event{margin-top:12px;padding:13px;border:1px solid #3a8c78;border-radius:14px;background:linear-gradient(135deg,#102c2a,#101a35);box-shadow:0 8px 20px #0006;transform:perspective(500px) rotateX(1deg)}
  .crypy-cal-event h4{margin:0 0 6px;color:#8af3d0;font-size:14px}
  .crypy-cal-event p{margin:6px 0;color:#e7fff7}
  .crypy-cal-event .baby-tag{font-size:10px;letter-spacing:.12em;color:#ff9bd6;font-weight:900}
  .crypy-cal-upcoming{margin-top:12px;padding-top:10px;border-top:1px solid #1d5145}
  .crypy-cal-upcoming h4{margin:0 0 8px;color:#a6e8d5;font-size:12px}
  .crypy-cal-upcoming button{display:flex;justify-content:space-between;gap:8px;width:100%;padding:8px 9px;margin:5px 0;border:1px solid #1c4b41;border-radius:9px;background:#081b1b;color:#eafff7;text-align:left}
  .crypy-cal-note{margin-top:10px;color:#8eaaa3;font-size:10px}
  @media(max-width:600px){#crypy-3d-calendar{right:10px;bottom:10px}#crypy-calendar-toggle{padding:10px 12px;font-size:11px}#crypy-calendar-panel{right:0;bottom:54px;width:min(370px,calc(100vw - 20px));max-height:74vh;padding:12px}.crypy-cal-day{min-height:35px}}
  @media(prefers-reduced-motion:reduce){#crypy-calendar-toggle,#crypy-calendar-panel,.crypy-cal-day{transition:none!important;animation:none!important;transform:none!important}}
  `;
  var toggle=node("button",{id:"crypy-calendar-toggle",type:"button","aria-expanded":"false","aria-controls":"crypy-calendar-panel"},"🗓️ CALENDÁRIO 3D");
  var panel=node("section",{id:"crypy-calendar-panel","aria-label":"Calendário mensal"});
  var head=node("div",{className:"crypy-cal-head"});
  head.append(node("div",{className:"crypy-cal-brand"},"COLMEIA CRYPY · BABY AVISA"),node("button",{className:"crypy-cal-close",type:"button","aria-label":"Fechar calendário"},"×"));
  var monthRow=node("div",{className:"crypy-cal-month"});
  var prev=node("button",{className:"crypy-cal-arrow",type:"button","aria-label":"Mês anterior"},"‹");
  var monthLabel=node("strong",{},"");
  var next=node("button",{className:"crypy-cal-arrow",type:"button","aria-label":"Próximo mês"},"›");
  monthRow.append(prev,monthLabel,next);
  var grid=node("div",{className:"crypy-cal-grid","aria-label":"Dias do mês"});
  var detail=node("div",{className:"crypy-cal-event","aria-live":"polite"});
  var upcoming=node("div",{className:"crypy-cal-upcoming"});
  var note=node("div",{className:"crypy-cal-note"},"Avisos editoriais pré-programados do BABY. Não são notícias em tempo real.");
  panel.append(head,monthRow,grid,detail,upcoming,note);host.append(style,toggle,panel);document.body.appendChild(host);
  function eventFor(date){return events.find(function(e){return e.date===key(date);});}
  function showSelected(date){
   selected=key(date);var event=eventFor(date);detail.replaceChildren();
   if(event){detail.append(node("div",{className:"baby-tag"},"✦ RECADO DO BABY"),node("h4",{},event.icon+" "+event.title),node("p",{},event.baby));}
   else {detail.append(node("div",{className:"baby-tag"},"✦ BABY I.A."),node("h4",{},"Dia "+date.getDate()+" · "+months[date.getMonth()]),node("p",{},"Hoje é mais uma oportunidade para aprender, criar e cuidar da Colmeia. Tenha um ótimo dia!"));}
   render();
  }
  function render(){
   monthLabel.textContent=months[view.getMonth()]+" "+view.getFullYear();grid.replaceChildren();
   weekdays.forEach(function(w){grid.appendChild(node("div",{className:"crypy-cal-weekday"},w));});
   var first=new Date(view.getFullYear(),view.getMonth(),1),offset=first.getDay(),days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
   for(var i=0;i<offset;i++)grid.appendChild(node("div",{className:"crypy-cal-day empty"},""));
   for(var d=1;d<=days;d++){
    var date=new Date(view.getFullYear(),view.getMonth(),d),ev=eventFor(date),classes="crypy-cal-day"+(key(date)===key(now)?" today":"")+(ev?" event":"");
    var button=node("button",{type:"button",className:classes,"aria-pressed":key(date)===selected?"true":"false","aria-label":d+(ev?", "+ev.title:"")},String(d));
    button.addEventListener("click",function(chosen){return function(){showSelected(chosen);};}(date));grid.appendChild(button);
   }
   var monthEvents=events.filter(function(e){return e.date.slice(0,7)===view.getFullYear()+"-"+String(view.getMonth()+1).padStart(2,"0");});
   upcoming.replaceChildren(node("h4",{},"PRÓXIMAS DATAS"));
   if(!monthEvents.length)upcoming.appendChild(node("p",{},"Nenhuma data comemorativa cadastrada neste mês."));
   monthEvents.slice(0,5).forEach(function(e){var b=node("button",{type:"button"},node("span",{},e.icon+" "+e.title));var dateLabel=node("span",{},e.date.slice(8,10)+"/"+e.date.slice(5,7));b.appendChild(dateLabel);b.addEventListener("click",function(){var p=e.date.split("-");view=new Date(Number(p[0]),Number(p[1])-1,1);showSelected(new Date(Number(p[0]),Number(p[1])-1,Number(p[2])));});upcoming.appendChild(b);});
  }
  function move(delta){view=new Date(view.getFullYear(),view.getMonth()+delta,1);if(view.getFullYear()!==now.getFullYear()){events=buildEvents(config,view.getFullYear());now=new Date();}render();}
  prev.addEventListener("click",function(){move(-1);});next.addEventListener("click",function(){move(1);});
  toggle.addEventListener("click",function(){var open=host.getAttribute("data-open")!=="true";host.setAttribute("data-open",String(open));toggle.setAttribute("aria-expanded",String(open));});
  head.querySelector("button").addEventListener("click",function(){host.setAttribute("data-open","false");toggle.setAttribute("aria-expanded","false");});
  showSelected(now);
 }
 fetch(dataUrl.href,{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}).then(mount).catch(function(){mount({fixedEvents:[],movableEvents:[]});});
})();