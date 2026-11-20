(function(){
"use strict";
const canvas=document.getElementById("matrixCanvas");
if(!canvas)return;
const ctx=canvas.getContext("2d",{alpha:true});
const chars="01CRYPYWEB3.1ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
let width=0,height=0,columns=0,drops=[],raf=0,last=0;
const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function resize(){
 const dpr=Math.min(window.devicePixelRatio||1,1.7);
 width=window.innerWidth;height=window.innerHeight;
 canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);
 canvas.style.width=width+"px";canvas.style.height=height+"px";
 ctx.setTransform(dpr,0,0,dpr,0,0);
 columns=Math.ceil(width/18);drops=Array.from({length:columns},()=>Math.random()*-height/18);
}
function draw(now){
 if(now-last<48){raf=requestAnimationFrame(draw);return;}
 last=now;
 ctx.fillStyle="rgba(0,5,2,.105)";ctx.fillRect(0,0,width,height);
 ctx.font="13px monospace";
 for(let i=0;i<columns;i++){
  const ch=chars[Math.floor(Math.random()*chars.length)];
  const x=i*18,y=drops[i]*18;
  ctx.fillStyle=Math.random()>.985?"#d7ffe8":"rgba(0,255,136,.62)";
  ctx.fillText(ch,x,y);
  if(y>height&&Math.random()>.972)drops[i]=0;
  drops[i]+=.68+Math.random()*.42;
 }
 raf=requestAnimationFrame(draw);
}
resize();window.addEventListener("resize",resize,{passive:true});
if(!reduced){raf=requestAnimationFrame(draw);}else{ctx.fillStyle="rgba(0,255,136,.14)";ctx.fillRect(0,0,width,height);}
window.addEventListener("pagehide",()=>cancelAnimationFrame(raf),{once:true});
})();