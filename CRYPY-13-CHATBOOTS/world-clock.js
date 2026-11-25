/* BABY — relógio mundial conectado ao relógio global CRPY quando disponível. */
(function(root,factory){
  var api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root){root.BABYWorldClock=api;root.BABY_CLOCK_API=api;}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
var zones=[
 {id:"br",label:"PARANÁ / BRASÍLIA",tz:"America/Sao_Paulo"},
 {id:"utc",label:"UTC / ZULU",tz:"UTC"},
 {id:"ny",label:"NOVA YORK",tz:"America/New_York"},
 {id:"lon",label:"LONDRES",tz:"Europe/London"},
 {id:"tok",label:"TÓQUIO",tz:"Asia/Tokyo"},
 {id:"syd",label:"SYDNEY",tz:"Australia/Sydney"}
];
function baseDate(date){
 if(date instanceof Date)return date;
 if(typeof window!=="undefined"&&window.CRPY_CLOCK_API&&typeof window.CRPY_CLOCK_API.now==="function"){
  var state=window.CRPY_CLOCK_API.now();
  if(state&&Number.isFinite(state.epochMs))return new Date(state.epochMs);
 }
 return new Date();
}
function getTimes(date){
 var now=baseDate(date),out={};
 zones.forEach(function(z){
  out[z.id]={
   id:z.id,label:z.label,
   time:new Intl.DateTimeFormat("pt-BR",{timeZone:z.tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now),
   date:new Intl.DateTimeFormat("pt-BR",{timeZone:z.tz,weekday:"short",day:"2-digit",month:"short",year:"numeric"}).format(now),
   offset:new Intl.DateTimeFormat("en-US",{timeZone:z.tz,timeZoneName:"short"}).formatToParts(now).filter(function(p){return p.type==="timeZoneName";}).map(function(p){return p.value;})[0]||"",
   timeZone:z.tz,epochMs:now.getTime()
  };
 });
 return out;
}
function mount(container){
 if(!container)return function(){};
 container.innerHTML="";
 var heading=document.createElement("div");heading.className="baby-world-clock-head";heading.textContent="🌐 RELÓGIO MUNDIAL · BABY";
 var grid=document.createElement("div");grid.className="baby-world-clock-grid";
 zones.forEach(function(z){
  var card=document.createElement("div");card.className="baby-clock-card";
  var label=document.createElement("b");label.textContent=z.label;
  var time=document.createElement("strong");time.id="baby-clock-"+z.id;time.textContent="--:--:--";
  var date=document.createElement("small");date.id="baby-clock-date-"+z.id;date.textContent=z.tz;
  var offset=document.createElement("small");offset.id="baby-clock-offset-"+z.id;offset.textContent="";
  card.appendChild(label);card.appendChild(time);card.appendChild(date);card.appendChild(offset);grid.appendChild(card);
 });
 container.appendChild(heading);container.appendChild(grid);
 function render(date){
  var values=getTimes(date);
  zones.forEach(function(z){
   var v=values[z.id],t=document.getElementById("baby-clock-"+z.id),d=document.getElementById("baby-clock-date-"+z.id),o=document.getElementById("baby-clock-offset-"+z.id);
   if(t)t.textContent=v.time;if(d)d.textContent=v.date;if(o)o.textContent=v.offset+" · "+v.timeZone;
  });
 }
 render();
 if(typeof window!=="undefined"&&window.CRPY_CLOCK_API&&typeof window.CRPY_CLOCK_API.subscribe==="function"){
  return window.CRPY_CLOCK_API.subscribe(function(state){render(state&&Number.isFinite(state.epochMs)?new Date(state.epochMs):undefined);});
 }
 var timer=setInterval(function(){render();},1000);
 return function(){clearInterval(timer);};
}
function getAllTimes(){var raw=getTimes(),out={};zones.forEach(function(z){out[z.tz]=raw[z.id];});return out;}
function getTime(tz){return getAllTimes()[tz]||null;}
function subscribe(fn){
 if(typeof window==="undefined")return function(){};
 var handler=function(e){if(typeof fn==="function")fn(e.detail);};
 window.addEventListener("baby-clock:tick",handler);
 return function(){window.removeEventListener("baby-clock:tick",handler);};
}
return {zones:zones,getTimes:getTimes,getTime:getTime,getAllTimes:getAllTimes,subscribe:subscribe,mount:mount};
});
