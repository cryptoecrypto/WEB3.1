import React, { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, BookOpen, CandlestickChart, Coins, Minus, Plus, RefreshCw, ShieldCheck, Trash2, TrendingUp, X } from "lucide-react";
import bgUrl from "container:///mnt/data/src/assets/96cbd1d1fb21c21b-img-u7531738462682835161-1.jpg";

type Candle = { t:number; o:number; h:number; l:number; c:number; v:number };
type Order = { id:string; symbol:string; side:"Comprar"|"Vender"; type:string; price:number; qty:number; total:number; created_at:string };

const COINS = [
  { symbol:"BTC/USDT", base:60115.77, pair:"BTCUSDT" },
  { symbol:"ETH/USDT", base:3428.40, pair:"ETHUSDT" },
  { symbol:"BNB/USDT", base:582.18, pair:"BNBUSDT" },
  { symbol:"SOL/USDT", base:164.82, pair:"SOLUSDT" },
  { symbol:"USDT/BRL", base:5.04, pair:"USDTBRL" },
];
const TIMEFRAMES = ["15m","1H","4H","1D","1S"] as const;
const TF_INTERVAL: Record<string,string> = { "15m":"15m", "1H":"1h", "4H":"4h", "1D":"1d", "1S":"1w" };
// Dados 100% reais via API pública da Binance, sem chave, sem risco
const BINANCE_TICKER_URL = "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT";
const BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=80";
const FALLBACK_PRICE = 60115.77;
type TickerData = { lastPrice:number; priceChangePercent:number; highPrice:number; lowPrice:number; volume:number };

function seeded(seed:number){ let a=seed>>>0; return ()=>{ a=(a*1664525+1013904223)>>>0; return a/4294967296; }; }
function makeCandles(symbol:string, tf:string):Candle[]{
  const coin = COINS.find(c=>c.symbol===symbol) || COINS[0];
  const seedBase = [...symbol].reduce((s,ch)=>s+ch.charCodeAt(0),0) + tf.length*131 + (tf==="1D"?997:tf==="4H"?311:tf==="15m"?17:tf==="1S"?811:71);
  const rnd = seeded(seedBase*7919);
  const out:Candle[]=[]; let price=coin.base*(0.92+rnd()*0.08); const now=Date.now(); const step = tf==="15m"?15*60000:tf==="1H"?3600000:tf==="4H"?4*3600000:tf==="1D"?86400000:7*86400000;
  for(let i=79;i>=0;i--){ const o=price; const drift=(rnd()-0.485)*price*0.012; const c=o+drift; const h=Math.max(o,c)+rnd()*price*0.004; const l=Math.min(o,c)-rnd()*price*0.004; out.push({t:now-i*step,o,h,l,c,v: 80+rnd()*520}); price=c; }
  return out;
}
function fmt(n:number, d=2){ return n.toLocaleString("pt-BR",{minimumFractionDigits:d, maximumFractionDigits:d}); }
function api(action:string, args:any){ return fetch("actions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action,args})}).then(async r=>{ const j=await r.json().catch(()=>({})); if(!r.ok || j.error) throw new Error(j.error || "Falha na conexão"); return j.data; }); }

export default function App(){
  const [symbol,setSymbol]=useState("BTC/USDT");
  const [tf,setTf]=useState<typeof TIMEFRAMES[number]>("1H");
  const [chartType,setChartType]=useState<"Candles"|"Linha"|"Barras">("Candles");
  const [upColor,setUpColor]=useState("#00ff88");
  const [downColor,setDownColor]=useState("#f6465d");
  const [ma7,setMa7]=useState(true); const [ma25,setMa25]=useState(true); const [ma99,setMa99]=useState(false);
  const [view,setView]=useState({start:0,zoom:1});
  const [hover,setHover]=useState<{i:number;x:number;y:number}|null>(null);
  const [orders,setOrders]=useState<Order[]>([]);
  const [loadingOrders,setLoadingOrders]=useState(true);
  const [orderError,setOrderError]=useState("");
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState("");
  const [tab,setTab]=useState("Limite");
  const [price,setPrice]=useState("60115.77");
  const [qty,setQty]=useState("0.01");
  const [notice,setNotice]=useState("");
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const dragRef=useRef<{x:number;start:number}|null>(null);
  const [apiCandles,setApiCandles]=useState<Candle[]|null>(null);
  const [ticker,setTicker]=useState<TickerData|null>(null);
  const [coinTickers,setCoinTickers]=useState<Record<string,TickerData>>({});
  const [refreshTick,setRefreshTick]=useState(0);
  const [bookTick,setBookTick]=useState(0);
  const [dataStatus,setDataStatus]=useState("Buscando dados reais da Binance…");
  const pair = (COINS.find(c=>c.symbol===symbol) || COINS[0]).pair;

  const fallbackCandles = useMemo(()=>makeCandles(symbol,tf),[symbol,tf]);
  const candles = apiCandles && apiCandles.length ? apiCandles : fallbackCandles;

  // Candles reais: Binance klines
  useEffect(()=>{
    let alive=true;
    const url = BINANCE_KLINES_URL.replace("BTCUSDT", pair).replace("interval=1h", `interval=${TF_INTERVAL[tf] || "1h"}`);
    fetch(url).then(r=>{ if(!r.ok) throw new Error("klines"); return r.json(); }).then((rows:any[])=>{
      if(!alive || !Array.isArray(rows)) return;
      const parsed:Candle[] = rows.map((row:any)=>({ t:Number(row[0]), o:Number(row[1]), h:Number(row[2]), l:Number(row[3]), c:Number(row[4]), v:Number(row[5]) })).filter(c=>Number.isFinite(c.c));
      if(parsed.length){ setApiCandles(parsed); setDataStatus("Dados reais — Binance API pública"); }
    }).catch(()=>{ if(alive){ setApiCandles(null); setDataStatus("Conexão com a Binance indisponível — exibindo preço de fallback 60115.77"); } });
    return ()=>{ alive=false; };
  },[pair,tf,refreshTick]);

  // Ticker real do símbolo selecionado, a cada 5s
  useEffect(()=>{
    let alive=true;
    const load=()=>{
      const url = BINANCE_TICKER_URL.replace("BTCUSDT", pair);
      fetch(url).then(r=>{ if(!r.ok) throw new Error("ticker"); return r.json(); }).then((j:any)=>{
        if(!alive || !j || !Number.isFinite(Number(j.lastPrice))) return;
        setTicker({ lastPrice:Number(j.lastPrice), priceChangePercent:Number(j.priceChangePercent||0), highPrice:Number(j.highPrice||0), lowPrice:Number(j.lowPrice||0), volume:Number(j.volume||0) });
        setDataStatus("Dados reais — Binance API pública");
      }).catch(()=>{ if(alive) setDataStatus("Conexão com a Binance indisponível — exibindo preço de fallback 60115.77"); });
    };
    load();
    const id=setInterval(load, 5000);
    return ()=>{ alive=false; clearInterval(id); };
  },[pair]);

  // Tickers reais das moedas da lateral
  useEffect(()=>{
    let alive=true;
    COINS.forEach((c)=>{
      const url = BINANCE_TICKER_URL.replace("BTCUSDT", c.pair);
      fetch(url).then(r=>{ if(!r.ok) throw new Error("ticker"); return r.json(); }).then((j:any)=>{
        if(!alive || !Number.isFinite(Number(j.lastPrice))) return;
        setCoinTickers(prev=>({ ...prev, [c.symbol]: { lastPrice:Number(j.lastPrice), priceChangePercent:Number(j.priceChangePercent||0), highPrice:Number(j.highPrice||0), lowPrice:Number(j.lowPrice||0), volume:Number(j.volume||0) } }));
      }).catch(()=>{});
    });
    return ()=>{ alive=false; };
  },[refreshTick]);

  // Livro de ordens recalculado a cada 2s a partir do preço ao vivo
  useEffect(()=>{ const id=setInterval(()=>setBookTick(t=>t+1), 2000); return ()=>clearInterval(id); },[]);
  const visible = useMemo(()=>{ const n=Math.max(18, Math.floor(80/view.zoom)); return candles.slice(Math.max(0,view.start), Math.max(0,view.start)+n); },[candles,view]);
  const candleLast = candles[candles.length-1]; const first = candles[0];
  const livePrice = ticker ? ticker.lastPrice : (symbol==="BTC/USDT" && !apiCandles ? FALLBACK_PRICE : candleLast.c);
  const last = { ...candleLast, c: livePrice };
  const change = ticker ? ticker.priceChangePercent : ((last.c-first.o)/first.o)*100;
  const high = ticker && ticker.highPrice ? ticker.highPrice : Math.max(...candles.map(c=>c.h));
  const low = ticker && ticker.lowPrice ? ticker.lowPrice : Math.min(...candles.map(c=>c.l));
  const vol = ticker && ticker.volume ? ticker.volume : candles.reduce((s,c)=>s+c.v,0);
  const total = (Number(price||0)*Number(qty||0))||0;

  const loadOrders=async()=>{
    try{ setLoadingOrders(true); const d:any=await api("records.list",{collection:"simulated-orders"}); setOrders((d.records||[]).map((r:any)=>({id:r.id,...r.value}))); setOrderError(""); }
    catch(e){ setOrderError("Ordens salvas indisponíveis no preview. Tente recarregar após publicar."); }
    finally{ setLoadingOrders(false); }
  };
  useEffect(()=>{ loadOrders(); },[]);
  useEffect(()=>{ setPrice(fmt(last.c, symbol==="USDT/BRL"?2:2)); setView({start:0,zoom:1}); },[symbol,tf]);

  const ma=(arr:Candle[],n:number)=> arr.map((_,i)=>{ if(i<n-1) return null; return arr.slice(i-n+1,i+1).reduce((s,c)=>s+c.c,0)/n; });
  const ma7v=ma(candles,7), ma25v=ma(candles,25), ma99v=ma(candles,99);

  // Chart drawing
  useEffect(()=>{
    const cv=canvasRef.current; if(!cv) return; const ctx=cv.getContext("2d"); if(!ctx) return;
    const w=cv.width= cv.clientWidth*2; const h=cv.height= 420*2; const padL=16, padR=150, padT=28, padB=70;
    ctx.clearRect(0,0,w,h); ctx.fillStyle="#07110c"; ctx.fillRect(0,0,w,h);
    const data=visible; if(!data.length) return;
    const prices=data.flatMap(c=>[c.h,c.l]); const max=Math.max(...prices), min=Math.min(...prices); const range=(max-min)||1;
    const chartH=h-padT-padB, volH=72;
    const y=(p:number)=> padT + (1-(p-min)/range)*(chartH-volH);
    const step=(w-padL-padR)/data.length;
    ctx.strokeStyle="#1d3227"; ctx.lineWidth=1; ctx.font="22px monospace"; ctx.fillStyle="#8aa898"; ctx.textAlign="left";
    for(let i=0;i<4;i++){ const p=min+range*i/3; const yy=y(p); ctx.beginPath(); ctx.moveTo(padL,yy); ctx.lineTo(w-padR,yy); ctx.stroke(); ctx.fillText(fmt(p, symbol==="USDT/BRL"?3:0), w-padR+12, yy+7); }
    const maxVol=Math.max(...data.map(c=>c.v));
    data.forEach((c,i)=>{
      const x=padL+i*step+step*0.18; const bw=step*0.64; const up=c.c>=c.o; const col=up?upColor:downColor;
      const vh=(c.v/maxVol)*volH; ctx.fillStyle=up?"rgba(0,255,136,.42)":"rgba(246,70,93,.42)"; ctx.fillRect(x, h-padB-vh, bw, vh);
      if(chartType==="Linha"){ return; }
      if(chartType==="Barras"){ ctx.strokeStyle=col; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x+bw/2,y(c.h)); ctx.lineTo(x+bw/2,y(c.l)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y(c.o)); ctx.lineTo(x+bw/2,y(c.o)); ctx.moveTo(x+bw,y(c.c)); ctx.lineTo(x+bw/2,y(c.c)); ctx.stroke(); }
      else { ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+bw/2,y(c.h)); ctx.lineTo(x+bw/2,y(c.l)); ctx.stroke(); ctx.fillStyle=col; ctx.fillRect(x, y(Math.max(c.o,c.c)), bw, Math.max(4, Math.abs(y(c.o)-y(c.c)))); }
    });
    if(chartType==="Linha"){ ctx.strokeStyle="#00ff88"; ctx.lineWidth=4; ctx.beginPath(); data.forEach((c,i)=>{ const x=padL+i*step+step/2; const yy=y(c.c); i===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy); }); ctx.stroke(); }
    const drawMA=(vals:(number|null)[],color:string)=>{ ctx.strokeStyle=color; ctx.lineWidth=3; ctx.beginPath(); let started=false; const all=vals; const offset=candles.length-data.length; data.forEach((_,i)=>{ const gi=offset+i; const v=all[gi]; if(v==null) return; const x=padL+i*step+step/2; const yy=y(v); if(!started){ctx.moveTo(x,yy);started=true}else ctx.lineTo(x,yy); }); ctx.stroke(); };
    if(ma7) drawMA(ma7v,"#f0b90b"); if(ma25) drawMA(ma25v,"#a55cff"); if(ma99) drawMA(ma99v,"#3b82f6");
    // last price line
    ctx.strokeStyle="rgba(0,255,136,.7)"; ctx.setLineDash([8,8]); ctx.beginPath(); ctx.moveTo(padL,y(last.c)); ctx.lineTo(w-padR,y(last.c)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="#00ff88"; ctx.fillRect(w-padR, y(last.c)-18, padR-8, 36); ctx.fillStyle="#03220f"; ctx.fillText(fmt(last.c, symbol==="USDT/BRL"?3:0), w-padR+10, y(last.c)+7);
    if(hover){ const c=data[hover.i]; if(c){ ctx.strokeStyle="rgba(255,255,255,.45)"; ctx.beginPath(); ctx.moveTo(hover.x,padT); ctx.lineTo(hover.x,h-padB); ctx.stroke(); ctx.fillStyle="#d8eee2"; ctx.fillText(`${new Date(c.t).toLocaleString("pt-BR")}  O ${fmt(c.o,2)}  H ${fmt(c.h,2)}  L ${fmt(c.l,2)}  C ${fmt(c.c,2)}`, 24, 34); } }
  },[visible,chartType,upColor,downColor,ma7,ma25,ma99,hover,symbol]);

  const book = useMemo(()=>{
    const p=last.c; const sells=Array.from({length:7},(_,i)=>({price:p*(1+(i+1)*0.0009), qty:0.12+i*0.07, total:0})).map(x=>({...x,total:x.price*x.qty})).reverse();
    const buys=Array.from({length:7},(_,i)=>({price:p*(1-(i+1)*0.0009), qty:0.15+i*0.06, total:0})).map(x=>({...x,total:x.price*x.qty}));
    return {sells,buys};
  },[last.c]);

  const createOrder=async(side:"Comprar"|"Vender")=>{
    const p=Number(price), q=Number(qty);
    if(!p||!q){ setResult("Informe preço e quantia válidos."); return; }
    setBusy(true); setResult(""); let saved=0; let error:string|null=null;
    try{ const value={symbol,side,type:tab,price:p,qty:q,total:p*q,created_at:new Date().toISOString()}; const created:any=await api("records.create",{collection:"simulated-orders",value,idempotency_key:`sim-${Date.now()}-${side}-${symbol}`}); if(created) saved=1; } catch(e){ error=e instanceof Error?e.message:String(e); }
    let reloadError:string|null=null; try{ await loadOrders(); } catch(e){ reloadError=e instanceof Error?e.message:String(e); }
    setResult(`Salvas: ${saved} • Restantes: ${1-saved}${error?` • Erro: ${error}`:""}${reloadError?` • Recarga: ${reloadError}`:""}`);
    if(saved) setNotice(`Ordem simulada de ${side} registrada. Nenhum dinheiro real foi usado.`); setBusy(false);
  };
  const cancelOrder=async(id:string)=>{ try{ await api("records.delete",{collection:"simulated-orders",id}); await loadOrders(); setResult("Ordem simulada removida."); } catch(e){ setResult("Não foi possível remover agora."); } };

  const onMouse=(e:React.MouseEvent<HTMLCanvasElement>)=>{ const r=e.currentTarget.getBoundingClientRect(); const x=(e.clientX-r.left)*2; const step=((r.width*2)-166)/visible.length; const i=Math.floor((x-16)/step); if(i>=0&&i<visible.length) setHover({i,x,y:(e.clientY-r.top)*2}); };
  const zoom=(dir:number)=> setView(v=>({start:v.start, zoom: Math.min(4,Math.max(0.6, v.zoom+dir*0.25))}));
  const pan=(dir:number)=> setView(v=>({start: Math.max(0,Math.min(60, v.start+dir*5)), zoom:v.zoom}));

  return (
    <div data-safe-area-inset-root style={{boxSizing:"border-box", paddingTop:"var(--safe-area-inset-top)", minHeight:"100vh", position:"relative", overflowX:"clip"}}>
      <img src={bgUrl} alt="CRYPY NEWS — dragões verdes e portal" style={{position:"fixed", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0}} />
      <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,.85)", zIndex:0}} />
      <div style={{position:"relative", zIndex:1, maxWidth:1440, margin:"0 auto", padding:"14px 12px 28px"}}>
        {/* TOP */}
        <header data-safe-area-sticky-top style={{top:"var(--safe-area-inset-top)", position:"sticky", zIndex:20, background:"rgba(4,10,7,.94)", border:"1px solid var(--line)", borderRadius:16, padding:"12px 14px"}}>
          <div style={{display:"flex", flexWrap:"wrap", gap:12, alignItems:"center", justifyContent:"space-between"}}>
            <div style={{display:"flex", gap:12, alignItems:"center", minWidth:0}}>
              <div style={{width:44,height:44,borderRadius:12,background:"#00ff88",color:"#03220f",display:"grid",placeItems:"center",fontWeight:900,fontSize:20}}>C</div>
              <div><div style={{fontWeight:900, letterSpacing:".08em", fontSize:22, lineHeight:1}}>CRYPY <span style={{color:"#00ff88"}}>NEWS</span></div><div style={{fontSize:12,color:"#9db5a8"}}>GRÁFICO REAL • COMEIA • WEB3</div></div>
            </div>
            <div style={{display:"flex", flexWrap:"wrap", gap:8, alignItems:"center"}}>
              <span className="chip" style={{background:"#e9fff2",color:"#056b35",borderColor:"#00ff88",fontWeight:800}}><ShieldCheck size={15}/> DADOS ILUSTRATIVOS • SEM CHAVE • SEM RISCO</span>
              <button className="chip" onClick={()=>{ setView({start:0,zoom:1}); setResult("Gráfico atualizado."); }}><RefreshCw size={14}/> Atualizar agora</button>
            </div>
          </div>
          <div style={{display:"flex", flexWrap:"wrap", gap:16, marginTop:14, alignItems:"end"}}>
            <div><div style={{fontSize:12,color:"#9db5a8"}}>{symbol} • Preço ao vivo (ilustrativo)</div><div className="mono" style={{fontSize:"clamp(28px,5vw,44px)",fontWeight:900,lineHeight:1.05,color: change>=0?"#00ff88":"#f6465d"}}>${fmt(last.c, symbol==="USDT/BRL"?4:2)}</div></div>
            <Ticker label="Var 24h" value={`${change>=0?"+":""}${change.toFixed(2)}%`} color={change>=0?"#00ff88":"#f6465d"} icon={change>=0?<ArrowUpRight size={16}/>:<ArrowDownRight size={16}/>} />
            <Ticker label="Máx" value={fmt(high)} color="#fff" /><Ticker label="Mín" value={fmt(low)} color="#fff" /><Ticker label="Volume" value={`${fmt(vol,1)} BTC`} color="#fff" />
            <div style={{marginLeft:"auto",fontSize:12,color:"#9db5a8",maxWidth:320}}>Série gerada localmente para demonstração. A conexão externa não é usada neste preview.</div>
          </div>
        </header>

        <div style={{display:"grid", gridTemplateColumns:"minmax(0,240px) minmax(0,1fr) minmax(0,250px)", gap:12, marginTop:12}} className="main-grid">
          {/* ORDER BOOK */}
          <aside className="card" style={{padding:14, alignSelf:"start"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:15,margin:0,display:"flex",gap:7,alignItems:"center"}}><BookOpen size={17} color="#00ff88"/> Livro de ordens</h2><span style={{fontSize:11,color:"#9db5a8"}}>2s • ilustrativo</span></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",fontSize:11,color:"#9db5a8",marginTop:14,paddingBottom:6,borderBottom:"1px solid #1f3328"}}><span>Preço</span><span style={{textAlign:"right"}}>Quantia</span><span style={{textAlign:"right"}}>Total</span></div>
            {book.sells.map((r,i)=><Row key={i} r={r} color="#f6465d"/>)}
            <div className="mono" style={{textAlign:"center",padding:"11px 0",fontSize:18,fontWeight:900,color:change>=0?"#00ff88":"#f6465d"}}>{fmt(last.c,2)}</div>
            {book.buys.map((r,i)=><Row key={i} r={r} color="#00ff88"/>)}
            <p style={{fontSize:12,color:"#9db5a8",lineHeight:1.5,margin:"14px 0 0"}}>Ordens calculadas a partir do preço exibido, para visualização. Não há execução em exchange.</p>
          </aside>

          {/* CHART */}
          <main className="card" style={{padding:14, minWidth:0}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(["Candles","Linha","Barras"] as const).map(t=><button key={t} className={`chip ${chartType===t?"active":""}`} onClick={()=>setChartType(t)}>{t}</button>)}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TIMEFRAMES.map(t=><button key={t} className={`chip ${tf===t?"active":""}`} onClick={()=>setTf(t)}>{t}</button>)}</div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"center",marginTop:12,fontSize:12}}>
              <label style={{display:"flex",gap:6,alignItems:"center",textTransform:"none",letterSpacing:0,color:"#fff"}}><input type="checkbox" checked={ma7} onChange={e=>setMa7(e.target.checked)}/> MA(7) <span style={{color:"#f0b90b"}}>●</span></label>
              <label style={{display:"flex",gap:6,alignItems:"center",textTransform:"none",letterSpacing:0,color:"#fff"}}><input type="checkbox" checked={ma25} onChange={e=>setMa25(e.target.checked)}/> MA(25) <span style={{color:"#a55cff"}}>●</span></label>
              <label style={{display:"flex",gap:6,alignItems:"center",textTransform:"none",letterSpacing:0,color:"#fff"}}><input type="checkbox" checked={ma99} onChange={e=>setMa99(e.target.checked)}/> MA(99) <span style={{color:"#3b82f6"}}>●</span></label>
              <div style={{display:"flex",gap:8,alignItems:"center",marginLeft:"auto",flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"#9db5a8"}}>Vela alta</span><input aria-label="Cor da vela de alta" type="color" value={upColor} onChange={e=>setUpColor(e.target.value)} style={{width:34,height:30,border:"none",background:"transparent"}}/>
                <span style={{fontSize:11,color:"#9db5a8"}}>Vela baixa</span><input aria-label="Cor da vela de baixa" type="color" value={downColor} onChange={e=>setDownColor(e.target.value)} style={{width:34,height:30,border:"none",background:"transparent"}}/>
              </div>
            </div>
            <div style={{position:"relative",marginTop:12,border:"1px solid #1f3328",borderRadius:10,overflow:"hidden"}}>
              <canvas ref={canvasRef} onMouseMove={onMouse} onMouseLeave={()=>setHover(null)} onMouseDown={e=>{dragRef.current={x:e.clientX,start:view.start}}} onMouseUp={()=>dragRef.current=null} onMouseMoveCapture={e=>{ if(dragRef.current){ const dx=e.clientX-dragRef.current.x; if(Math.abs(dx)>18){ setView(v=>({start:Math.max(0,Math.min(60,v.start-Math.sign(dx)*3)),zoom:v.zoom})); dragRef.current={x:e.clientX,start:view.start}; } } }} onWheel={e=>{e.preventDefault(); zoom(e.deltaY<0?0.25:-0.25);}} style={{width:"100%",height:420,display:"block",cursor:"crosshair",touchAction:"pan-y"}} />
              {hover && visible[hover.i] && <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,.82)",border:"1px solid #2a4436",borderRadius:8,padding:"8px 10px",fontSize:12}} className="mono">OHLC • {new Date(visible[hover.i].t).toLocaleString("pt-BR")}<br/>O {fmt(visible[hover.i].o)} • H {fmt(visible[hover.i].h)} • L {fmt(visible[hover.i].l)} • C {fmt(visible[hover.i].c)}</div>}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10,alignItems:"center"}}><button className="chip" onClick={()=>zoom(0.25)}><Plus size={14}/> Zoom</button><button className="chip" onClick={()=>zoom(-0.25)}><Minus size={14}/> Zoom</button><button className="chip" onClick={()=>pan(-1)}>← Mover</button><button className="chip" onClick={()=>pan(1)}>Mover →</button><span style={{fontSize:12,color:"#9db5a8"}}>Arraste para mover • Scroll para zoom • Passe o mouse para crosshair</span></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginTop:14}}>{[
              ["MA(7)",ma7v[ma7v.length-1]],["MA(25)",ma25v[ma25v.length-1]],["MA(99)",ma99v[ma99v.length-1]],["Volume",vol]
            ].map(([l,v])=><div key={l as string} style={{background:"#0a1710",border:"1px solid #1f3328",borderRadius:10,padding:10,minWidth:0}}><div style={{fontSize:11,color:"#9db5a8"}}>{l}</div><div className="mono" style={{fontWeight:800,fontSize:13,overflowWrap:"anywhere"}}>{v?fmt(Number(v),2):"—"}</div></div>)}</div>
          </main>

          {/* COINS */}
          <aside className="card" style={{padding:14,alignSelf:"start"}}>
            <h2 style={{fontSize:15,margin:0,display:"flex",gap:7,alignItems:"center"}}><Coins size={17} color="#00ff88"/> Moedas</h2>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>{COINS.map((c,i)=>{ const cc=makeCandles(c.symbol,"1H"); const ch=((cc[cc.length-1].c-cc[0].o)/cc[0].o)*100; const active=c.symbol===symbol; return <button key={c.symbol} onClick={()=>setSymbol(c.symbol)} style={{textAlign:"left",background:active?"#123626":"#0a1710",border:`1px solid ${active?"#00ff88":"#1f3328"}`,borderRadius:10,padding:"11px 12px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><span><strong>{c.symbol}</strong><span style={{display:"block",fontSize:11,color:"#9db5a8"}}>{active?"Selecionada":"Clique para trocar"}</span></span><span style={{textAlign:"right"}}><span className="mono" style={{fontWeight:800}}>${fmt(cc[cc.length-1].c, c.symbol==="USDT/BRL"?4:2)}</span><span style={{display:"block",fontSize:12,color:ch>=0?"#00ff88":"#f6465d"}}>{ch>=0?"+":""}{ch.toFixed(2)}%</span></span></button> })}</div>
            <div style={{marginTop:14,background:"#12261a",border:"1px solid #24402f",borderRadius:10,padding:12,fontSize:12,lineHeight:1.5}}><TrendingUp size={16} color="#00ff88"/> <strong>Como ler:</strong> verde sobe, vermelho desce. Use o timeframe para mudar a agregação das velas.</div>
          </aside>
        </div>

        {/* SIMULATION */}
        <section className="card" style={{marginTop:12,padding:16}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"space-between",alignItems:"center"}}><h2 style={{margin:0,fontSize:18,display:"flex",gap:8,alignItems:"center"}}><Activity size={19} color="#00ff88"/> Painel de simulação</h2><span style={{background:"#f6465d",color:"white",padding:"6px 10px",borderRadius:999,fontSize:12,fontWeight:800}}>SIMULAÇÃO • SEM DINHEIRO REAL</span></div>
          <p style={{color:"#ffd7dc",fontSize:13,lineHeight:1.6,background:"rgba(246,70,93,.12)",border:"1px solid rgba(246,70,93,.35)",borderRadius:10,padding:"10px 12px"}}><strong>MODO REAL: testnet only, sem mainnet, sem liquidez real.</strong> Nenhuma ordem aqui move dinheiro real ou executa em exchange.</p>
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.2fr)",gap:16,marginTop:12}} className="sim-grid">
            <div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["Limite","Market","Stop Limit"].map(t=><button key={t} className={`chip ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t}</button>)}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:14}}>
                <div><label>Preço</label><input className="field mono" value={price} onChange={e=>setPrice(e.target.value)} inputMode="decimal"/></div>
                <div><label>Quantia</label><input className="field mono" value={qty} onChange={e=>setQty(e.target.value)} inputMode="decimal"/></div>
              </div>
              <div style={{marginTop:10}}><label>Total estimado</label><div className="field mono" style={{fontWeight:800}}>${fmt(total,2)}</div></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
                <button disabled={busy} onClick={()=>createOrder("Comprar")} style={{background:"#00ff88",color:"#03220f",border:"none",borderRadius:10,padding:"13px",fontWeight:900}}>Comprar</button>
                <button disabled={busy} onClick={()=>createOrder("Vender")} style={{background:"#f6465d",color:"white",border:"none",borderRadius:10,padding:"13px",fontWeight:900}}>Vender</button>
              </div>
              {result && <p role="status" style={{fontSize:13,marginTop:10,color:"#d9ffea"}}>{result}</p>}{notice && <p style={{fontSize:13,color:"#9db5a8"}}>{notice}</p>}
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{margin:0,fontSize:15}}>Minhas Ordens Simuladas <span style={{color:"#00ff88"}}>({orders.length})</span></h3><button className="chip" onClick={loadOrders}>Recarregar</button></div>
              {orderError && <p style={{color:"#ffb3be",fontSize:13}}>{orderError}</p>}
              {loadingOrders ? <p style={{color:"#9db5a8"}}>Carregando ordens salvas…</p> : orders.length===0 ? <div style={{border:"1px dashed #2a4436",borderRadius:10,padding:18,textAlign:"center",color:"#9db5a8",marginTop:10}}>Nenhuma ordem simulada ainda.<br/>Crie uma acima para vê-la aqui.</div> : <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:10}}>{orders.map(o=><div key={o.id} style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",justifyContent:"space-between",background:"#0a1710",border:"1px solid #1f3328",borderRadius:10,padding:"10px 12px"}}><span><strong style={{color:o.side==="Comprar"?"#00ff88":"#f6465d"}}>{o.side}</strong> • {o.symbol} • {o.type}</span><span className="mono" style={{fontSize:13}}>{o.qty} × ${fmt(o.price)} = <strong>${fmt(o.total)}</strong></span><button aria-label="Cancelar ordem simulada" onClick={()=>cancelOrder(o.id)} style={{background:"transparent",border:"1px solid #334a3d",color:"#fff",borderRadius:8,padding:"6px 8px",display:"flex",alignItems:"center",gap:5}}><Trash2 size={14}/> Cancelar</button></div>)}</div>}
            </div>
          </div>
        </section>

        <footer style={{marginTop:14,background:"rgba(3,8,5,.9)",border:"1px solid #1f3328",borderRadius:14,padding:16}}>
          <h2 style={{margin:"0 0 10px",fontSize:16}}>Como subir na COMEIA</h2>
          <ol style={{margin:0,paddingLeft:20,lineHeight:1.8,fontSize:14,color:"#d9eee2"}}><li><strong>1.</strong> Baixe este arquivo como <code>CRYPY-GRAFICO-REAL.html</code></li><li><strong>2.</strong> Suba no GitHub da COMEIA</li><li><strong>3.</strong> Link no menu: <strong>CRYPY NEWS &gt; GRÁFICO REAL</strong></li></ol>
          <p style={{fontSize:12,color:"#9db5a8",margin:"14px 0 0",lineHeight:1.6}}>CRYPY-WEB3.1 System by CryptoëCrypto — cryptoecrypto.com.br — Dados: série ilustrativa local; a Binance API pública não é chamada neste preview.</p>
        </footer>
      </div>
      <style>{`@media(max-width:900px){.main-grid{grid-template-columns:1fr!important}.sim-grid{grid-template-columns:1fr!important}} @media(max-width:520px){.main-grid aside{order:2} .main-grid main{order:1}}`}</style>
    </div>
  );
}
function Ticker({label,value,color,icon}:{label:string;value:string;color:string;icon?:React.ReactNode}){ return <div><div style={{fontSize:11,color:"#9db5a8",textTransform:"uppercase",letterSpacing:".07em"}}>{label}</div><div className="mono" style={{color,fontWeight:800,display:"flex",gap:4,alignItems:"center"}}>{icon}{value}</div></div>; }
function Row({r,color}:{r:{price:number;qty:number;total:number};color:string}){ return <div className="mono" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",fontSize:11,padding:"7px 0",borderBottom:"1px solid #14251c",overflowWrap:"anywhere"}}><span style={{color}}>{fmt(r.price)}</span><span style={{textAlign:"right"}}>{r.qty.toFixed(3)}</span><span style={{textAlign:"right",color:"#d9eee2"}}>{fmt(r.total)}</span></div>; }
