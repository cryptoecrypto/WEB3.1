import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RefreshCw, TrendingDown, TrendingUp, WifiOff, MousePointer2, ZoomIn, Activity, Wifi } from "lucide-react";

type Token = {
  id: string; name: string; symbol: string; price: number; change: number; color: string; decimals: number; high: number; low: number;
};
const INITIAL_TOKENS: Token[] = [
  { id:"BTC", name:"Bitcoin", symbol:"BTC", price:61359, change:0.73, color:"#F7931A", decimals:2, high:62100, low:60600 },
  { id:"ETH", name:"Ethereum", symbol:"ETH", price:1718, change:0.83, color:"#8A9CFF", decimals:2, high:1740, low:1695 },
  { id:"USDT", name:"Tether", symbol:"USDT", price:0.9991, change:0.01, color:"#26A17B", decimals:4, high:1.0002, low:0.9980 },
  { id:"BNB", name:"BNB", symbol:"BNB", price:560.30, change:0.36, color:"#F0B90B", decimals:2, high:567, low:553 },
  { id:"ICP", name:"Internet Computer", symbol:"ICP", price:2.005, change:0.80, color:"#29ABE2", decimals:3, high:2.04, low:1.97 },
  { id:"SHIB", name:"Shiba Inu", symbol:"SHIB", price:0.00000365, change:0.55, color:"#FF8A3D", decimals:8, high:0.00000372, low:0.00000358 },
];
const TICKER_URL = 'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","ICPUSDT","SHIBUSDT"]';
const KLINES_TEMPLATE = "https://api.binance.com/api/v3/klines?symbol=XXXUSDT&interval=1h&limit=60";
function fmt(n:number, d:number){ return n.toLocaleString("pt-BR",{minimumFractionDigits:d, maximumFractionDigits:d}); }
function fmtPrice(t:Token){ return `$${fmt(t.price,t.decimals)}`; }
function brTime(d=new Date()){ return d.toLocaleTimeString("pt-BR",{timeZone:"America/Sao_Paulo", hour:"2-digit", minute:"2-digit"}); }
function historyFor(t:Token){
  const pts:number[]=[]; const seed = t.symbol.charCodeAt(0)*7 + t.symbol.length*13;
  for(let i=0;i<60;i++){
    const p=i/59;
    const wave = Math.sin(i*0.38+seed)*0.008 + Math.sin(i*0.13+seed*2)*0.012 + Math.sin(i*0.07+seed)*0.006;
    const trend = (p-1)*(t.change/100)*0.9;
    pts.push(t.price*(1+wave+trend));
  }
  pts[59]=t.price; return pts;
}
type V3={x:number;y:number;z:number};
function rotate(v:V3,yaw:number,pitch:number):V3{
  const cy=Math.cos(yaw), sy=Math.sin(yaw); const x1=v.x*cy+v.z*sy; const z1=-v.x*sy+v.z*cy;
  const cp=Math.cos(pitch), sp=Math.sin(pitch); const y1=v.y*cp - z1*sp; const z2=v.y*sp + z1*cp;
  return {x:x1,y:y1,z:z2};
}
async function api(action: string, args: Record<string, unknown>) {
  const res = await fetch("actions", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({action, args})});
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.error) throw new Error((json && json.error) || "Falha ao salvar");
  return json.data;
}

export default function App(){
  const [tokens,setTokens]=useState<Token[]>(INITIAL_TOKENS);
  const [histories,setHistories]=useState<Record<string,number[]>>(()=>{ const o:Record<string,number[]>={}; INITIAL_TOKENS.forEach(t=>{o[t.id]=historyFor(t);}); return o; });
  const [selected,setSelected]=useState("BTC");
  const [rotating,setRotating]=useState(true);
  const [count,setCount]=useState(59);
  const [lastUpdate,setLastUpdate]=useState(()=>brTime());
  const [flash,setFlash]=useState(false);
  const [focus,setFocus]=useState<string|null>(null);
  const [offline,setOffline]=useState(true);
  const [status,setStatus]=useState("Preços iniciais de 27/11/2026. Buscando dados reais da Binance…");
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const ribbonRef=useRef<HTMLCanvasElement>(null);
  const yawRef=useRef(0.55);
  const pitchRef=useRef(0.42);
  const zoomRef=useRef(1);
  const focusRef=useRef(0);
  const dragRef=useRef<{x:number;y:number;down:boolean;startX:number;startY:number}|null>(null);
  const hitsRef=useRef<{id:string;x:number;y:number}[]>([]);
  const selectedRef=useRef(selected); selectedRef.current=selected;
  const rotatingRef=useRef(rotating); rotatingRef.current=rotating;
  const focusIdRef=useRef(focus); focusIdRef.current=focus;
  const tokensRef=useRef(tokens); tokensRef.current=tokens;

  const token = tokens.find(t=>t.id===selected) || INITIAL_TOKENS[0];
  const hist = useMemo(()=>histories[selected] || historyFor(token),[histories,selected,token]);

  const fetchKlines = async (symbol:string, currentPrice:number) => {
    if (symbol==="USDT") {
      const pts = Array.from({length:60},(_,i)=> 0.9991 + Math.sin(i*0.3)*0.00015);
      pts[59]=currentPrice; return pts;
    }
    try {
      const url = KLINES_TEMPLATE.replace("XXX", symbol);
      const res = await fetch(url);
      if (!res.ok) throw new Error("klines");
      const data = await res.json();
      const closes = (Array.isArray(data)?data:[]).map((r:any)=>parseFloat(r[4])).filter((n:number)=>Number.isFinite(n));
      if (closes.length < 10) throw new Error("klines curto");
      return closes;
    } catch { return historyFor({...token, symbol, price: currentPrice}); }
  };

  const fetchAll = async (save:boolean) => {
    let nextTokens = tokensRef.current;
    let ok = false;
    try {
      const res = await fetch(TICKER_URL);
      if (!res.ok) throw new Error("ticker");
      const data = await res.json();
      const bySymbol:Record<string,any>={}; (Array.isArray(data)?data:[]).forEach((r:any)=>{ bySymbol[r.symbol]=r; });
      nextTokens = tokensRef.current.map(t=>{
        if (t.id==="USDT") return t;
        const r = bySymbol[t.symbol+"USDT"]; if(!r) return t;
        const price = parseFloat(r.lastPrice); if(!Number.isFinite(price)) return t;
        return {...t, price, change: parseFloat(r.priceChangePercent) || t.change, high: parseFloat(r.highPrice) || t.high, low: parseFloat(r.lowPrice) || t.low};
      });
      setTokens(nextTokens); ok = true; setOffline(false);
      setLastUpdate(brTime()); setCount(59);
      setStatus(save ? "Dados reais atualizados e último preço salvo." : "Dados reais atualizados pela Binance.");
    } catch {
      setOffline(true);
      setStatus(save ? "Sem internet — mantido o último preço salvo." : "Sem internet — mantido o último preço salvo.");
    }
    const current = nextTokens.find(t=>t.id===selectedRef.current) || nextTokens[0];
    const closes = await fetchKlines(current.symbol, current.price);
    setHistories(prev=>({...prev, [current.id]: closes}));
    if (save && ok) {
      try {
        await api("records.create", {collection: "crypy_snapshots", value: {tokens: nextTokens, savedAt: new Date().toISOString(), source: "Binance"}});
        setStatus("Dados reais atualizados e último preço salvo.");
      } catch { setStatus("Dados reais atualizados, mas não foi possível salvar o último preço."); }
    }
    setFlash(true); setTimeout(()=>setFlash(false),900);
  };
  const fetchRef = useRef(fetchAll); fetchRef.current = fetchAll;

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try {
        const data = await api("records.list", {collection: "crypy_snapshots"});
        const records = data && data.records ? data.records : [];
        const last = records[records.length-1];
        if (!cancelled && last && last.value && Array.isArray(last.value.tokens) && last.value.tokens.length===6) {
          const saved = INITIAL_TOKENS.map(init=>{
            const s = last.value.tokens.find((x:any)=>x && x.id===init.id);
            if(!s || !Number.isFinite(Number(s.price))) return init;
            return {...init, price:Number(s.price), change:Number(s.change ?? init.change), high:Number(s.high ?? init.high), low:Number(s.low ?? init.low)};
          });
          setTokens(saved); setStatus("Último preço salvo carregado. Buscando dados reais da Binance…");
        }
      } catch { /* API indisponível no preview: mantém preços iniciais */ }
      if(!cancelled) await fetchRef.current(false);
    })();
    return ()=>{ cancelled=true; };
  },[]);

  useEffect(()=>{
    const id=setInterval(()=>{ setCount(c=>{ if(c<=1){ fetchRef.current(false); return 59; } return c-1; }); },1000);
    return ()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    let raf=0; let w=0,h=0,dpr=1;
    const resize=()=>{ const r=canvas.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2); w=r.width; h=r.height; canvas.width=w*dpr; canvas.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); };
    resize(); const ro=new ResizeObserver(resize); ro.observe(canvas);
    const draw=(time:number)=>{
      const list=tokensRef.current;
      const logs=list.map(t=>Math.log10(Math.max(t.price,0.00000001))); const minL=Math.min(...logs), maxL=Math.max(...logs);
      const tSec=time/1000;
      ctx.clearRect(0,0,w,h);
      const g=ctx.createRadialGradient(w/2,h*0.42,10,w/2,h*0.42,Math.max(w,h)*0.7);
      g.addColorStop(0,"rgba(0,245,138,0.12)"); g.addColorStop(0.5,"rgba(0,20,12,0.35)"); g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      const yaw=yawRef.current, pitch=pitchRef.current, zoom=zoomRef.current;
      if(rotatingRef.current && !dragRef.current?.down) yawRef.current+=0.0028;
      const selIdx=list.findIndex(x=>x.id===selectedRef.current);
      const desiredFocus = focusIdRef.current ? (selIdx-2.5)*-58 : 0;
      focusRef.current += (desiredFocus-focusRef.current)*0.08;
      const cx=w/2, cy=h*0.56;
      const proj=(v:V3)=>{ const r=rotate({x:v.x+focusRef.current,y:v.y,z:v.z},yaw,pitch); const f=520*zoom; const s=f/(f+r.z+280); return {x:cx+r.x*s, y:cy-r.y*s, s, z:r.z}; };
      ctx.lineWidth=1; ctx.strokeStyle="rgba(0,245,138,0.18)";
      for(let i=-6;i<=6;i++){
        const a=proj({x:i*58,y:0,z:-360}); const b=proj({x:i*58,y:0,z:360});
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        const c=proj({x:-360,y:0,z:i*58}); const d=proj({x:360,y:0,z:i*58});
        ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(d.x,d.y); ctx.stroke();
      }
      const order=[...list].map((tk,i)=>({tk,i, wx:(i-2.5)*72})).sort((a,b)=>{
        const za=rotate({x:a.wx,y:0,z:0},yaw,pitch).z; const zb=rotate({x:b.wx,y:0,z:0},yaw,pitch).z; return zb-za;
      });
      hitsRef.current=[];
      order.forEach(({tk,i,wx})=>{
        const norm=(Math.log10(Math.max(tk.price,0.00000001))-minL)/(maxL-minL || 1);
        const baseH=26+norm*168;
        const pulse=1+Math.sin(tSec*1.8+i*0.9)*0.035;
        const floatY=Math.sin(tSec*1.2+i*1.1)*4;
        const isSel=tk.id===selectedRef.current;
        const hh=baseH*pulse;
        const hw=26, hd=26;
        const corners:{[k:string]:V3}={
          b1:{x:wx-hw,y:floatY,z:-hd}, b2:{x:wx+hw,y:floatY,z:-hd}, b3:{x:wx+hw,y:floatY,z:hd}, b4:{x:wx-hw,y:floatY,z:hd},
          t1:{x:wx-hw,y:floatY+hh,z:-hd}, t2:{x:wx+hw,y:floatY+hh,z:-hd}, t3:{x:wx+hw,y:floatY+hh,z:hd}, t4:{x:wx-hw,y:floatY+hh,z:hd},
        };
        const P:Record<string,ReturnType<typeof proj>>={}; Object.entries(corners).forEach(([k,v])=>P[k]=proj(v));
        const poly=(pts:string[],fill:string)=>{ ctx.beginPath(); pts.forEach((p,idx)=> idx?ctx.lineTo(P[p].x,P[p].y):ctx.moveTo(P[p].x,P[p].y)); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.strokeStyle="rgba(255,255,255,0.28)"; ctx.lineWidth=1; ctx.stroke(); };
        if(isSel){ ctx.save(); ctx.shadowColor=tk.color; ctx.shadowBlur=34; ctx.fillStyle=tk.color; ctx.beginPath(); ctx.ellipse(P.b1.x+(P.b3.x-P.b1.x)/2, P.b1.y+(P.b3.y-P.b1.y)/2, 52, 14, 0, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
        poly(["b3","b4","t4","t3"], shade(tk.color,-38));
        poly(["b2","b3","t3","t2"], shade(tk.color,-18));
        poly(["t1","t2","t3","t4"], shade(tk.color, isSel?28:8));
        ctx.beginPath(); ctx.moveTo(P.t1.x,P.t1.y); ctx.lineTo(P.t2.x,P.t2.y); ctx.lineTo(P.t3.x,P.t3.y); ctx.lineTo(P.t4.x,P.t4.y); ctx.closePath();
        ctx.strokeStyle=isSel?tk.color:"rgba(0,245,138,0.65)"; ctx.lineWidth=isSel?2.5:1.2; ctx.stroke();
        const lx=(P.t1.x+P.t3.x)/2, ly=Math.min(P.t1.y,P.t3.y)-18;
        hitsRef.current.push({id:tk.id,x:lx,y:ly+18});
        const label=`${tk.symbol}  ${fmtPrice(tk)}`;
        ctx.font=`700 ${w<520?11:13}px "Space Grotesk", sans-serif`;
        const tw=ctx.measureText(label).width;
        ctx.fillStyle="rgba(0,0,0,0.78)"; roundRect(ctx,lx-tw/2-10,ly-14,tw+20,24,12); ctx.fill();
        ctx.strokeStyle=isSel?tk.color:"rgba(0,245,138,0.5)"; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle=isSel?tk.color:"#EAFBF2"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(label,lx,ly-1);
        ctx.fillStyle=tk.change>=0?"#00F58A":"#FF4D6D"; ctx.beginPath(); ctx.arc(lx+tw/2+18,ly-1,4,0,Math.PI*2); ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect(); };
  },[]);

  useEffect(()=>{
    const canvas=ribbonRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    let raf=0,w=0,h=0;
    const resize=()=>{ const r=canvas.getBoundingClientRect(); w=r.width; h=r.height; const d=Math.min(window.devicePixelRatio||1,2); canvas.width=w*d; canvas.height=h*d; ctx.setTransform(d,0,0,d,0,0); };
    resize(); const ro=new ResizeObserver(resize); ro.observe(canvas);
    const draw=(time:number)=>{
      const tSec=time/1000; ctx.clearRect(0,0,w,h);
      const mn=Math.min(...hist), mx=Math.max(...hist);
      const pts=hist.map((v,i)=>{ const x=(i/59-0.5)*(w-70); const y=((v-mn)/(mx-mn||1)-0.5)*110; const z=(i/59-0.5)*180; const r=rotate({x,y:y,z},0.55+Math.sin(tSec*0.2)*0.04,0.28); const f=480; const s=f/(f+r.z+260); return {x:w/2+r.x*s, y:h*0.52-r.y*s, s}; });
      ctx.strokeStyle="rgba(0,245,138,0.12)"; ctx.lineWidth=1;
      for(let i=0;i<5;i++){ const y=20+i*(h-40)/4; ctx.beginPath(); ctx.moveTo(18,y); ctx.lineTo(w-18,y); ctx.stroke(); }
      ctx.beginPath(); pts.forEach((p,i)=> i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle=token.color; ctx.lineWidth=2.6; ctx.shadowColor=token.color; ctx.shadowBlur=14; ctx.stroke(); ctx.shadowBlur=0;
      ctx.lineTo(pts[pts.length-1].x,h-18); ctx.lineTo(pts[0].x,h-18); ctx.closePath(); ctx.fillStyle=hexA(token.color,0.14); ctx.fill();
      const last=pts[pts.length-1]; ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(last.x,last.y,5,0,Math.PI*2); ctx.fill(); ctx.fillStyle=token.color; ctx.beginPath(); ctx.arc(last.x,last.y,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#8AA696"; ctx.font="600 11px Space Grotesk"; ctx.textAlign="left"; ctx.fillText("60H ATRÁS",16,18); ctx.textAlign="right"; ctx.fillText("AGORA",w-16,18);
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw); return ()=>{cancelAnimationFrame(raf); ro.disconnect();};
  },[hist,token]);

  const onPointerDown=(e:React.PointerEvent)=>{ (e.target as HTMLElement).setPointerCapture(e.pointerId); dragRef.current={x:e.clientX,y:e.clientY,down:true,startX:e.clientX,startY:e.clientY}; };
  const onPointerMove=(e:React.PointerEvent)=>{ const d=dragRef.current; if(!d?.down) return; yawRef.current+=(e.clientX-d.x)*0.008; pitchRef.current=Math.max(0.08,Math.min(1.1,pitchRef.current+(e.clientY-d.y)*0.005)); d.x=e.clientX; d.y=e.clientY; };
  const onPointerUp=(e:React.PointerEvent)=>{
    const d=dragRef.current; dragRef.current=null;
    if(!d) return;
    if(Math.hypot(e.clientX-d.startX, e.clientY-d.startY)>10) return;
    const rect=canvasRef.current?.getBoundingClientRect(); if(!rect) return;
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    const hit=hitsRef.current.find(h=>Math.hypot(h.x-x,h.y-y)<58);
    if(hit){ setSelected(hit.id); setFocus(hit.id); }
  };
  const select=(id:string)=>{ setSelected(id); setFocus(id); fetchRef.current(false); };
  const refresh=()=>{ setStatus("Atualizando dados reais da Binance…"); fetchAll(true); };

  return (
    <div data-safe-area-inset-root style={{boxSizing:"border-box", paddingTop:"var(--safe-area-inset-top)"}} className="min-h-[100dvh] bg-[var(--bg)] text-[var(--text)] overflow-x-clip">
      <header className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#00F58A] shadow-[0_0_18px_#00F58A]"/><span className="text-[11px] tracking-[0.28em] font-bold text-[#00F58A]">BINANCE • DADOS REAIS</span></div>
          <h1 className="font-display text-[clamp(32px,6vw,58px)] leading-[0.95] mt-2">CRYPY <span className="text-[#00F58A]">• GRÁFICO<br/>3D REAL</span></h1>
          <p className="text-[#8AA696] text-sm mt-2 max-w-[560px]">Arraste para girar. Role para zoom. Toque num pilar para focar. Sem gráficos 2D antigos — só profundidade, luz e preço.</p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
          {offline ? <span className="inline-flex items-center gap-1.5 bg-[#FFF1D6] text-black text-[11px] font-bold px-2.5 py-1.5 rounded-full"><WifiOff size={13}/> SEM INTERNET — ÚLTIMO PREÇO SALVO</span> : <span className="inline-flex items-center gap-1.5 bg-[#00F58A] text-black text-[11px] font-bold px-2.5 py-1.5 rounded-full"><Wifi size={13}/> AO VIVO • BINANCE</span>}
          <span className="text-xs text-[#8AA696]">Última atualização: <b className="text-white">{lastUpdate} Brasília</b></span>
          <span className="text-xs text-[#00F58A] font-bold">próxima atualização em {count}s</span>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 pb-10">
        <div className="sm:hidden flex flex-wrap gap-2 my-1">
          {offline ? <span className="inline-flex items-center gap-1.5 bg-[#FFF1D6] text-black text-[11px] font-bold px-2.5 py-1.5 rounded-full"><WifiOff size={13}/> SEM INTERNET — ÚLTIMO PREÇO SALVO</span> : <span className="inline-flex items-center gap-1.5 bg-[#00F58A] text-black text-[11px] font-bold px-2.5 py-1.5 rounded-full"><Wifi size={13}/> AO VIVO • BINANCE</span>}
          <span className="text-xs text-[#8AA696]">Última atualização: <b className="text-white">{lastUpdate} Brasília</b> • próxima em {count}s</span>
        </div>
        <p className="text-xs text-[#8AA696] mt-1" aria-live="polite">{status}</p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="flex flex-wrap gap-1.5 bg-[#0B120E] border border-[rgba(0,245,138,.22)] rounded-full p-1">
            {tokens.map(t=>(<button key={t.id} onClick={()=>select(t.id)} aria-pressed={selected===t.id} className={`px-3 py-1.5 rounded-full text-xs font-bold ${selected===t.id?"bg-[#00F58A] text-black":"text-[#EAFBF2] hover:bg-white/10"}`}>{t.symbol}</button>))}
          </div>
          <button onClick={refresh} className="inline-flex items-center gap-2 bg-[#00F58A] text-black font-bold text-sm px-4 py-2.5 rounded-full"><RefreshCw size={16} className={flash?"animate-spin":""}/> ATUALIZAR AGORA</button>
          <button onClick={()=>setRotating(v=>!v)} aria-pressed={rotating} className="inline-flex items-center gap-2 border border-[rgba(0,245,138,.4)] text-[#00F58A] font-bold text-sm px-4 py-2.5 rounded-full">{rotating?<><Pause size={16}/> PAUSAR ROTAÇÃO</>:<><Play size={16}/> GIRAR</>}</button>
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#8AA696]"><MousePointer2 size={13}/> Arrastar = girar • <ZoomIn size={13}/> Scroll = zoom</span>
        </div>

        <section className="mt-4 rounded-[22px] overflow-hidden border border-[rgba(0,245,138,.25)] bg-black relative">
          <div className="absolute top-3 left-3 z-10 flex gap-2"><span className="bg-black/70 border border-[rgba(0,245,138,.3)] text-[11px] font-bold px-2.5 py-1 rounded-full text-[#00F58A]">● AO VIVO • CENA 3D</span><span className="bg-black/70 border border-white/15 text-[11px] px-2.5 py-1 rounded-full">ALTURA = LOG DO PREÇO</span></div>
          <div className="absolute top-3 right-3 z-10 bg-black/70 border border-white/15 text-[11px] px-2.5 py-1 rounded-full">SELECIONADO: <b style={{color:token.color}}>{token.symbol}</b></div>
          <canvas ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onWheel={(e)=>{ e.preventDefault(); zoomRef.current=Math.max(0.7,Math.min(1.7,zoomRef.current - e.deltaY*0.0006)); }} className="w-full h-[380px] sm:h-[460px] cursor-grab active:cursor-grabbing touch-none" aria-label="Gráfico 3D com 6 pilares de criptomoedas, arraste para girar"/>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
            <p className="text-[11px] text-[#8AA696] max-w-[260px]">Toque num pilar para selecionar e focar a câmera nele.</p>
            <p className="text-[11px] font-bold" style={{color:token.color}}>{token.name} • {fmtPrice(token)}</p>
          </div>
        </section>

        <section className="grid md:grid-cols-[1.65fr_1fr] gap-4 mt-4">
          <div className="card rounded-[22px] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2"><h2 className="font-display text-lg leading-none">FITA 3D • {token.symbol} / USDT</h2><span className="inline-flex items-center gap-1 text-xs text-[#8AA696]"><Activity size={14}/> 60 CANDLES • 1H</span></div>
            <p className="text-xs text-[#8AA696] mt-1">Linha 3D com os últimos 60 pontos de 1 hora, terminando no preço atual.</p>
            <canvas ref={ribbonRef} className="w-full h-[210px] sm:h-[240px] mt-2"/>
            <div className="flex justify-between text-[11px] text-[#8AA696]"><span>Preço inicial da janela</span><span>Preço atual: <b className="text-white">{fmtPrice(token)}</b></span></div>
          </div>
          <aside className="card rounded-[22px] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3"><span className="w-11 h-11 rounded-2xl grid place-items-center font-display text-lg text-black" style={{background:token.color}}>{token.symbol[0]}</span><div><p className="font-bold leading-none">{token.name}</p><p className="text-xs text-[#8AA696]">{token.symbol} / USDT</p></div><span className={`ml-auto inline-flex items-center gap-1 text-sm font-bold ${token.change>=0?"text-[#00F58A]":"text-[#FF4D6D]"}`}>{token.change>=0?<TrendingUp size={16}/>:<TrendingDown size={16}/>} {token.change>=0?"+":""}{fmt(token.change,2)}%</span></div>
              <p className="font-display text-[clamp(34px,5vw,46px)] mt-5 leading-none [overflow-wrap:anywhere]">{fmtPrice(token)}</p>
              <p className="text-xs text-[#8AA696] mt-1">Variação 24h • Binance • atualizado {lastUpdate} Brasília</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-black/50 border border-white/10 rounded-2xl p-3"><p className="text-[11px] text-[#8AA696]">MÁXIMA 24H</p><p className="font-bold text-[#00F58A] mt-1 [overflow-wrap:anywhere]">${fmt(token.high, token.decimals>4?8:token.decimals)}</p></div>
              <div className="bg-black/50 border border-white/10 rounded-2xl p-3"><p className="text-[11px] text-[#8AA696]">MÍNIMA 24H</p><p className="font-bold text-[#FF4D6D] mt-1 [overflow-wrap:anywhere]">${fmt(token.low, token.decimals>4?8:token.decimals)}</p></div>
            </div>
            <p className="text-[11px] text-[#8AA696] mt-4">Toque num card abaixo para trocar o token da fita e do pilar em destaque.</p>
          </aside>
        </section>

        <section className="mt-4">
          <h2 className="font-display text-sm tracking-wide text-[#8AA696] mb-2">6 TOKENS • TOQUE PARA SELECIONAR</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {tokens.map(t=>{ const active=t.id===selected; return (
              <button key={t.id} onClick={()=>select(t.id)} aria-pressed={active} className={`card text-left rounded-[20px] p-4 transition ${active?"card-active":"hover:border-[rgba(0,245,138,.5)]"}`}>
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><span className="w-8 h-8 rounded-full grid place-items-center text-black font-display text-sm" style={{background:t.color}}>{t.symbol[0]}</span><span className="font-bold text-sm">{t.name}</span></span><span className="text-[11px] text-[#8AA696] font-bold">{t.symbol}</span></div>
                <p className="font-display text-[clamp(20px,3vw,26px)] mt-3 leading-none [overflow-wrap:anywhere]">{fmtPrice(t)}</p>
                <p className={`inline-flex items-center gap-1 text-sm font-bold mt-2 ${t.change>=0?"text-[#00F58A]":"text-[#FF4D6D]"}`}>{t.change>=0?<TrendingUp size={15}/>:<TrendingDown size={15}/>} {t.change>=0?"+":""}{fmt(t.change,2)}% 24h</p>
                <div className="flex justify-between text-[11px] text-[#8AA696] mt-3 border-t border-white/10 pt-2"><span>Máx ${fmt(t.high, t.decimals>4?8:t.decimals)}</span><span>Mín ${fmt(t.low, t.decimals>4?8:t.decimals)}</span></div>
              </button>
            )})}
          </div>
        </section>
        <footer className="mt-8 pt-4 border-t border-white/10 text-center text-xs text-[#8AA696]">Conteúdo educacional. Não é recomendação financeira. Fonte: Binance.</footer>
      </main>
    </div>
  );
}
function shade(hex:string, amt:number){
  const n=parseInt(hex.slice(1),16); let r=(n>>16)+amt, g=((n>>8)&255)+amt, b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
  return `rgb(${r},${g},${b})`;
}
function hexA(hex:string,a:number){ const n=parseInt(hex.slice(1),16); return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`; }
function roundRect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
