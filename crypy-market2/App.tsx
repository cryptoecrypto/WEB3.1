import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Baby, Brain, Clock3, Coins, Eye, Flame, Gauge, Newspaper, Play, RefreshCw, Search, Sparkles, Star, Trash2, Zap } from "lucide-react";

type Coin = { symbol:string; name:string; price:string; change:string; high:string; low:string; up:boolean; special?:boolean };
type NewsItem = { id:string; source:string; title:string; summary:string; date:string; tags:string[] };
type Memory = { id:string; title:string; date:string; source:string; absorbedAt:string };
type LogItem = { time:string; text:string };

const COINS: Coin[] = [
  { symbol:"BTC", name:"Bitcoin", price:"$ 61.359", change:"+0,73%", high:"$ 62.410", low:"$ 60.180", up:true },
  { symbol:"ETH", name:"Ethereum", price:"$ 1.718", change:"+0,83%", high:"$ 1.752", low:"$ 1.684", up:true },
  { symbol:"USDT", name:"Tether", price:"$ 0,9991", change:"+0,01%", high:"$ 1,0002", low:"$ 0,9978", up:true },
  { symbol:"BNB", name:"BNB", price:"$ 560,30", change:"+0,36%", high:"$ 568,90", low:"$ 552,40", up:true },
  { symbol:"ICP", name:"Internet Computer", price:"$ 2,005", change:"+0,80%", high:"$ 2,084", low:"$ 1,964", up:true },
  { symbol:"SHIB", name:"Shiba Inu", price:"$ 0,00000365", change:"+0,55%", high:"$ 0,00000381", low:"$ 0,00000352", up:true },
  { symbol:"CRYPYCOIN", name:"CRYPYCOIN", price:"0,0000", change:"—", high:"—", low:"—", up:true, special:true },
];

const NEWS: NewsItem[] = [
  { id:"n1", source:"OFFLINE", title:"Como ler uma variação de 24 horas sem confundir preço com tendência", summary:"Um guia prático para entender o que muda em um dia, o que é apenas ruído de curto prazo e por que um único número nunca conta a história completa do mercado.", date:"Edição de hoje", tags:["BTC","ETH","BNB"] },
  { id:"n2", source:"OFFLINE", title:"Stablecoins na rotina: o que observar antes de usar uma moeda pareada ao dólar", summary:"Entenda liquidez, transparência, custódia e uso cotidiano. O foco aqui é educação financeira, não indicação de compra ou venda.", date:"Edição de hoje", tags:["USDT"] },
  { id:"n3", source:"OFFLINE", title:"Redes e taxas: por que a mesma transferência pode custar valores diferentes", summary:"Congestionamento, tipo de rede e momento da transação influenciam o custo. Aprenda a comparar antes de confirmar qualquer operação.", date:"Edição de hoje", tags:["ETH","BNB","ICP"] },
  { id:"n4", source:"OFFLINE", title:"Memecoins e volatilidade: como separar comunidade, narrativa e risco", summary:"Projetos movidos por comunidade podem oscilar muito rápido. Este texto explica perguntas básicas de checagem antes de qualquer decisão.", date:"Edição de hoje", tags:["SHIB"] },
  { id:"n5", source:"OFFLINE", title:"Segurança primeiro: chaves, golpes comuns e hábitos que protegem sua carteira", summary:"Frases-semente, links falsos e promessas de retorno garantido estão entre os sinais mais repetidos. Veja uma lista de cuidados essenciais.", date:"Edição de hoje", tags:["BTC","ETH"] },
  { id:"n6", source:"OFFLINE", title:"CRYPYCOIN: o que significa um token ainda em construção", summary:"Um projeto em construção pode ter documento, testes e comunidade antes de qualquer listagem pública. Até lá, não existe cotação oficial para acompanhar.", date:"Edição de hoje", tags:["CRYPYCOIN"] },
];

const FILTERS = ["TODAS","BTC","ETH","USDT","BNB","ICP","SHIB","CRYPYCOIN"];

function brNow(){ return new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"})); }
function fmtDate(d:Date){ return d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",day:"2-digit",month:"2-digit",year:"numeric"}); }
function fmtTime(d:Date){ return d.toLocaleTimeString("pt-BR",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit",second:"2-digit"}); }
function slug(s:string){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,48); }

async function callApi(action:string, args:Record<string,unknown>){
  const res = await fetch("actions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action,args})});
  const json = await res.json().catch(()=>({}));
  if(!res.ok || json?.error) throw new Error(json?.error ? String(json.error) : `Falha na operação (${res.status})`);
  return json.data;
}

export default function App(){
  const [now,setNow] = useState(()=>new Date());
  const [auto,setAuto] = useState(true);
  const [filter,setFilter] = useState("TODAS");
  const [headlineId,setHeadlineId] = useState("n1");
  const [priceTime,setPriceTime] = useState("—");
  const [edition,setEdition] = useState(()=>fmtDate(brNow()));
  const [editionCount,setEditionCount] = useState(1);
  const [memories,setMemories] = useState<Memory[]>([]);
  const [loadingMemory,setLoadingMemory] = useState(true);
  const [apiError,setApiError] = useState("");
  const [absorbingId,setAbsorbingId] = useState("");
  const [absorbAllBusy,setAbsorbAllBusy] = useState(false);
  const [absorbResult,setAbsorbResult] = useState<{saved:number;remaining:number;error:string|null;reloadError:string|null}|null>(null);
  const [babyMsg,setBabyMsg] = useState("BABY pronto para aprender com a edição de hoje.");
  const [logs,setLogs] = useState<LogItem[]>(()=>[
    {time:fmtTime(new Date()),text:"Página aberta • edição atual carregada"},
    {time:fmtTime(new Date()),text:"Painel de preços em modo salvo/offline"},
  ]);
  const [quizChoice,setQuizChoice] = useState("");
  const [quizDone,setQuizDone] = useState(false);
  const [clearing,setClearing] = useState(false);
  const lastDate = useRef(fmtDate(brNow()));
  const logRef = useRef(logs); logRef.current = logs;

  const addLog = useCallback((text:string)=>{
    setLogs(prev=>[{time:fmtTime(new Date()),text},...prev].slice(0,10));
  },[]);

  const reloadRecords = useCallback(async()=>{
    try{
      const data:any = await callApi("records.list",{collection:"baby_memory"});
      const rows:Memory[] = (data?.records||[]).map((r:any)=>({id:r.id,...r.value}));
      rows.sort((a,b)=>String(b.absorbedAt).localeCompare(String(a.absorbedAt)));
      setMemories(rows); setApiError(""); return rows;
    }catch(e){ setApiError(e instanceof Error?e.message:String(e)); throw e; }
    finally{ setLoadingMemory(false); }
  },[]);

  useEffect(()=>{ reloadRecords().catch(()=>{}); },[reloadRecords]);

  useEffect(()=>{
    if(!auto) return;
    const t=setInterval(()=>setNow(new Date()),1000);
    return ()=>clearInterval(t);
  },[auto]);

  useEffect(()=>{
    if(!auto) return;
    const today=fmtDate(brNow());
    if(today!==lastDate.current){
      lastDate.current=today; setEdition(today); setEditionCount(c=>c+1); setHeadlineId("n1"); setQuizChoice(""); setQuizDone(false);
      addLog(`Edição virada automaticamente para ${today}`);
    }
  },[now,auto,addLog]);

  useEffect(()=>{
    if(!auto) return;
    const t=setInterval(()=>{ setPriceTime(fmtTime(new Date()).slice(0,5)); addLog("Checagem automática de preços (60s)"); },60000);
    return ()=>clearInterval(t);
  },[auto,addLog]);

  const filtered = useMemo(()=> filter==="TODAS" ? NEWS : NEWS.filter(n=>n.tags.includes(filter)),[filter]);
  const headline = NEWS.find(n=>n.id===headlineId) || NEWS[0];
  const absorbedCount = memories.length;
  const level = Math.min(100, absorbedCount*14);
  const countdown = useMemo(()=>{
    const d=brNow(); const end=new Date(d); end.setHours(24,0,0,0); const diff=Math.max(0,end.getTime()-d.getTime());
    const h=String(Math.floor(diff/3600000)).padStart(2,"0"); const m=String(Math.floor(diff%3600000/60000)).padStart(2,"0"); const s=String(Math.floor(diff%60000/1000)).padStart(2,"0");
    return `${h}:${m}:${s}`;
  },[now]);

  async function createRow(row:NewsItem){
    const key=`baby-${slug(row.title)}-${edition.replaceAll("/","-")}`;
    await callApi("records.create",{collection:"baby_memory",value:{title:row.title,date:edition,source:row.source,absorbedAt:new Date().toISOString()},idempotency_key:key});
  }
  async function absorbOne(item:NewsItem){
    if(memories.some(m=>m.title===item.title)){ setBabyMsg(`BABY já conhece: ${item.title}`); return; }
    setAbsorbingId(item.id); setBabyMsg("BABY absorvendo...");
    try{ await createRow(item); await reloadRecords(); setBabyMsg(`BABY aprendeu: ${item.title}`); addLog(`BABY absorveu “${item.title}”`); }
    catch(e){ setBabyMsg(`Não foi possível salvar. ${e instanceof Error?e.message:"Tente de novo."}`); }
    finally{ setAbsorbingId(""); }
  }
  async function absorbAll(){
    const rows = NEWS.filter(n=>!memories.some(m=>m.title===n.title));
    if(!rows.length){ setBabyMsg("BABY já absorveu todas as notícias desta edição."); return; }
    setAbsorbAllBusy(true); let saved=0; let error:string|null=null;
    try{ for(const row of rows){ await createRow(row); saved+=1; } }catch(e){ error=e instanceof Error?e.message:String(e); }
    let reloadError:string|null=null; try{ await reloadRecords(); }catch(e){ reloadError=e instanceof Error?e.message:String(e); }
    setAbsorbResult({saved,remaining:rows.length-saved,error,reloadError}); setAbsorbAllBusy(false);
    if(saved) addLog(`BABY absorveu ${saved} notícia(s) desta edição`);
    setBabyMsg(saved?`BABY absorveu ${saved} notícia(s) desta edição.`:`Absorção interrompida. ${error||""}`);
  }
  async function clearMemory(){
    setClearing(true);
    try{ for(const m of memories) await callApi("records.delete",{collection:"baby_memory",id:m.id}); await reloadRecords(); setBabyMsg("Memória do BABY limpa. Ele pode aprender de novo."); addLog("Memória do BABY limpa"); }
    catch(e){ setBabyMsg(`Não foi possível limpar tudo. ${e instanceof Error?e.message:""}`); }
    finally{ setClearing(false); }
  }
  function forceUpdate(){
    setPriceTime(fmtTime(new Date()).slice(0,5)); setNow(new Date()); addLog("Atualização forçada pelo leitor"); setBabyMsg("Atualização forçada: edição e painel revisados.");
  }
  function simulateMidnight(){
    const next=new Date(brNow()); next.setDate(next.getDate()+1); const nextStr=fmtDate(next);
    lastDate.current=nextStr; setEdition(nextStr); setEditionCount(c=>c+1); setHeadlineId("n1"); setQuizChoice(""); setQuizDone(false); setPriceTime(fmtTime(new Date()).slice(0,5));
    addLog(`00:00:03 — Edição virada automaticamente para ${nextStr} (simulação)`); setBabyMsg("Simulação de virada concluída. Destaque manual limpo.");
  }
  function toggleAuto(){ const next=!auto; setAuto(next); addLog(next?"Modo automático ligado":"Modo automático desligado — nada atualiza sozinho"); }

  const quizOptions = useMemo(()=>{ const others=NEWS.filter(n=>n.id!==headline.id).slice(0,2).map(n=>n.title); return [headline.title,...others]; },[headline]);

  return (
    <div data-safe-area-inset-root style={{boxSizing:"border-box",paddingTop:"var(--safe-area-inset-top)",minHeight:"100vh",background:"var(--bg)"}} className="overflow-x-clip text-[var(--text)]">
      <div className="mx-auto max-w-[1240px] px-3 sm:px-6 pb-8">
        {/* TOPO */}
        <header className="pt-4 sm:pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[var(--neon)]"><span className="h-2.5 w-2.5 rounded-full bg-[var(--neon)] pulse-dot" /> PÁGINA AUTÔNOMA • ATUALIZA SOZINHA</div>
            <div className="mono text-xs text-[var(--muted)]">EDIÇÃO <span className="text-white">{edition}</span> • Nº {String(editionCount).padStart(3,"0")}</div>
          </div>
          <div className="grid gap-5 py-6 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="mb-2 text-xs font-bold tracking-[0.3em] text-[var(--yellow)]">CRYPTO • MERCADO • APRENDIZADO</p>
              <h1 className="leading-[0.88] font-bold tracking-tight text-[clamp(2.6rem,8vw,5.6rem)]">CRYPY-NEWS<br/><span className="text-[var(--neon)]">MARKET</span></h1>
              <p className="mt-4 max-w-[620px] text-sm leading-relaxed text-[var(--muted)] sm:text-base">A edição vira sozinha à meia-noite de Brasília. O painel revisa os preços salvos e o BABY transforma a leitura de hoje em conhecimento.</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold"><Clock3 size={16} className="text-[var(--neon)]"/> BRASÍLIA AO VIVO</span><span className="rounded-full bg-[#132b20] px-2 py-1 text-[10px] font-bold text-[var(--neon)]">● AO VIVO</span></div>
              <div className="mono mt-3 text-4xl font-semibold tabular-nums">{fmtTime(now)}</div>
              <div className="mt-3 border-t border-[var(--line)] pt-3 text-sm">Próxima edição automática em <b className="mono text-[var(--yellow)]">{countdown}</b> <span className="text-[var(--muted)]">até 00:00</span></div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={forceUpdate} className="flex items-center justify-center gap-2 rounded-lg bg-[var(--neon)] px-3 py-2.5 text-xs font-bold text-black hover:brightness-110"><RefreshCw size={15}/> FORÇAR ATUALIZAÇÃO AGORA</button>
                <button onClick={toggleAuto} aria-pressed={auto} className={`rounded-lg border px-3 py-2.5 text-xs font-bold ${auto?"border-[var(--neon)] bg-[#10291e] text-[var(--neon)]":"border-[var(--line)] bg-[var(--surface-2)] text-white"}`}>MODO AUTOMÁTICO: {auto?"LIGADO":"DESLIGADO"}</button>
              </div>
              {!auto && <p className="mt-3 rounded-lg bg-[#2a1b0e] px-3 py-2 text-xs text-[#ffce78]">Automação pausada. Use “Forçar atualização” quando quiser revisar a edição.</p>}
            </div>
          </div>
          <div className="overflow-hidden border-y border-[var(--line)] py-2 text-xs mono whitespace-nowrap"><div className="ticker flex w-max gap-8">{[...COINS,...COINS].map((c,i)=><span key={i}><b className="text-[var(--neon)]">{c.symbol}</b> <span className="text-[var(--muted)]">{c.price}</span> <span className="text-[var(--neon)]">{c.change}</span></span>)}</div></div>
        </header>

        {/* PREÇOS */}
        <section className="py-7" aria-labelledby="precos">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div><p className="flex items-center gap-2 text-xs font-bold tracking-widest text-[var(--neon)]"><Coins size={16}/> PAINEL DE PREÇOS</p><h2 id="precos" className="mt-1 text-3xl font-bold sm:text-4xl">Mercado em um olhar</h2></div>
            <div className="text-right text-xs leading-5 text-[var(--muted)]"><div>Última atualização de preços: <b className="text-white">{priceTime}</b></div><div className="mono">Revisão automática a cada 60s</div></div>
          </div>
          <div className="mb-3 flex flex-wrap gap-2"><span className="rounded-full border border-[#ffce78] bg-[#2b210f] px-3 py-1 text-xs font-bold text-[#ffce78]">SEM INTERNET — ÚLTIMO PREÇO SALVO</span><span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted)]">Fonte: Binance • valores de referência salvos em 27/11/2026</span></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COINS.map((c,i)=>c.special?(
              <article key={c.symbol} className="relative overflow-hidden rounded-2xl border border-dashed border-[#ffd400]/70 bg-[#201a08] p-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between"><span className="mono text-xs text-[#ffd400]">PROJETO • EM CONSTRUÇÃO</span><Sparkles size={18} className="text-[#ffd400]"/></div>
                <h3 className="mt-5 text-2xl font-bold">CRYPYCOIN</h3><div className="mono mt-1 text-3xl font-bold text-[#ffd400]">0,0000</div><p className="mt-2 text-sm font-bold text-[#ffd400]">SEM COTAÇÃO PÚBLICA</p><p className="mt-2 text-xs leading-relaxed text-[#d8cfa9]">Token do projeto, ainda sem listagem pública. Não é recomendação.</p><div className="mt-4 grid grid-cols-2 border-t border-[#ffd400]/20 pt-3 text-xs"><span>MÁXIMA —</span><span className="text-right">MÍNIMA —</span></div>
              </article>
            ):(
              <article key={c.symbol} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--neon)]/60">
                <div className="flex items-start justify-between"><div><div className="text-lg font-bold">{c.symbol}</div><div className="text-xs text-[var(--muted)]">{c.name}</div></div><span className="rounded-full bg-[#10291e] px-2 py-1 text-xs font-bold text-[var(--neon)]">{c.change}</span></div>
                <div className="mono mt-4 text-2xl font-semibold [overflow-wrap:anywhere]">{c.price}</div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-3 text-xs text-[var(--muted)]"><span>MÁXIMA 24H<br/><b className="text-white">{c.high}</b></span><span className="text-right">MÍNIMA 24H<br/><b className="text-white">{c.low}</b></span></div>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold tracking-widest text-[var(--muted)]"><span className={`h-1.5 w-1.5 rounded-full ${i%2?"bg-[var(--yellow)]":"bg-[var(--neon)]"}`}/> PAR USDT • 24H</div>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs font-bold tracking-widest text-[var(--neon)]">FONTES AUTOMÁTICAS CONFIGURADAS</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">Endereços de referência usados pela automação da edição. Nesta prévia, a página mantém os valores salvos/offline e não busca dados externos.</p>
            <p className="mt-3 text-xs font-bold">1 • PREÇOS — BINANCE</p>
            <p className="mt-1 text-xs leading-relaxed [overflow-wrap:anywhere]">{`https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","ICPUSDT","SHIBUSDT"]`}</p>
            <p className="mt-3 text-xs font-bold">2 • NOTÍCIAS — COINDESK</p>
            <p className="mt-1 text-xs leading-relaxed [overflow-wrap:anywhere]">https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/</p>
            <p className="mt-3 text-xs font-bold">3 • NOTÍCIAS — COINTELEGRAPH (ALTERNATIVA)</p>
            <p className="mt-1 text-xs leading-relaxed [overflow-wrap:anywhere]">https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss</p>
          </div>
        </section>

        <main className="grid gap-6 lg:grid-cols-[1.65fr_.85fr]">
          {/* NOTÍCIAS */}
          <section aria-labelledby="noticias">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-bold tracking-widest text-[var(--neon)]"><Newspaper size={16}/> NOTÍCIAS AUTOMÁTICAS</p><h2 id="noticias" className="mt-1 text-3xl font-bold">Edição de hoje</h2></div><div className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs">Notícias desta edição: <b className="text-[var(--neon)]">{filtered.length}</b></div></div>
            <p className="mt-3 rounded-xl border border-[#ffce78]/40 bg-[#241d0d] px-3 py-2 text-xs leading-relaxed text-[#ffe9a8]">EXEMPLO OFFLINE — será substituído pela busca automática quando houver internet. Textos educativos, sem fatos datados inventados.</p>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar notícias por moeda">
              {FILTERS.map(f=><button key={f} onClick={()=>setFilter(f)} className={`rounded-full px-3 py-2 text-xs font-bold ${filter===f?"bg-[var(--neon)] text-black":"border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"}`}>{f}</button>)}
            </div>
            <div className="mt-4 space-y-4">
              {filtered.map((n,idx)=>{
                const isHeadline=n.id===headlineId; const absorbed=memories.some(m=>m.title===n.title);
                return <article key={n.id} className={`scan relative overflow-hidden rounded-2xl border bg-[var(--surface)] p-4 sm:p-5 ${isHeadline?"border-[var(--yellow)] bg-[#1d1a0e]":"border-[var(--line)]"}`}>
                  {isHeadline && <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded bg-[var(--yellow)] px-2 py-1 text-[11px] font-bold text-black">★ MANCHETE DO DIA</span><span className="text-xs text-[var(--muted)]">A primeira notícia da edição</span></div>}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold"><span className="rounded-full bg-[#24244a] px-2 py-1">{n.source}</span><span className="text-[var(--muted)]">{n.date}</span>{absorbed && <span className="text-[var(--neon)]">✓ ABSORVIDA PELO BABY</span>}</div>
                  <h3 className="mt-3 text-xl font-bold leading-snug sm:text-2xl [overflow-wrap:anywhere]">{n.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">{n.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{n.tags.map(t=><span key={t} className="rounded bg-[var(--surface-2)] px-2 py-1 text-[10px] font-bold text-[#b9c1d4]">{t}</span>)}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button disabled title="Fonte offline" className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--muted)]">ABRIR FONTE ORIGINAL • OFFLINE</button>
                    <button onClick={()=>{setHeadlineId(n.id); setQuizChoice(""); setQuizDone(false); addLog(`Destaque do dia alterado para “${n.title}”`);}} className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold ${isHeadline?"bg-[var(--yellow)] text-black":"border border-[var(--yellow)] text-[var(--yellow)]"}`}><Star size={14}/> {isHeadline?"DESTAQUE DO DIA":"⭐ DESTAQUE DO DIA"}</button>
                    <button onClick={()=>absorbOne(n)} disabled={!!absorbingId} className="flex items-center gap-1 rounded-lg bg-[var(--neon)] px-3 py-2 text-xs font-bold text-black"><Brain size={14}/> {absorbingId===n.id?"ABSORVENDO...":"🧠 BABY ABSORVER"}</button>
                  </div>
                </article>
              })}
              {!filtered.length && <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">Nenhuma notícia desta edição com o filtro {filter}. Escolha TODAS para ver a edição completa.</div>}
            </div>

            {/* QUIZ */}
            <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5" aria-labelledby="quiz">
              <p className="text-xs font-bold tracking-widest text-[var(--yellow)]">MINI-QUIZ • SÓ PARA BRINCAR E APRENDER</p>
              <h3 id="quiz" className="mt-2 text-xl font-bold">O que a manchete de hoje diz sobre…?</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">O BABY resumiu a manchete atual. Escolha a alternativa que mais combina com ela.</p>
              <div className="mt-4 space-y-2">{quizOptions.map((opt,i)=><button key={opt} onClick={()=>{setQuizChoice(opt); setQuizDone(true);}} className={`w-full rounded-xl border px-3 py-3 text-left text-sm [overflow-wrap:anywhere] ${quizDone && opt===headline.title?"border-[var(--neon)] bg-[#10291e]":quizDone && opt===quizChoice?"border-[var(--red)] bg-[#30141d]":"border-[var(--line)] bg-[var(--surface-2)]"}`}>{String.fromCharCode(65+i)}. {opt}</button>)}</div>
              {quizDone && <p className="mt-3 text-sm font-bold">{quizChoice===headline.title?"🎉 Isso! Você captou a ideia da manchete.":"Quase lá — a alternativa correta é a que resume a manchete em destaque."}</p>}
            </section>
          </section>

          {/* BABY + LOG */}
          <aside className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-[var(--neon)]/50 bg-[var(--surface)]" aria-labelledby="baby">
              <div className="bg-[#0b2418] px-4 py-3"><p className="flex items-center gap-2 text-xs font-bold tracking-widest text-[var(--neon)]"><Baby size={16}/> BABY I.A. • CONHECIMENTO</p></div>
              <div className="p-4">
                <div className="flex items-center gap-4"><div className={`baby-bob flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-[var(--neon)] bg-[#071a12] text-4xl ${absorbingId||absorbAllBusy?"absorbing":""}`} aria-label="Avatar do BABY I.A.">👶</div><div><p className="text-xl font-bold">BABY</p><p className="text-xs text-[var(--muted)]">Nascimento 16/11/2026</p><p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#10291e] px-2 py-1 text-[11px] font-bold text-[var(--neon)]"><Eye size={12}/> {absorbAllBusy||absorbingId?"ABSORVENDO...":"OBSERVANDO A EDIÇÃO"}</p></div></div>
                <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[var(--surface-2)] p-3"><div className="text-xs text-[var(--muted)]">Notícias absorvidas</div><div className="mono mt-1 text-3xl font-bold text-[var(--neon)]">{absorbedCount}</div></div><div className="rounded-xl bg-[var(--surface-2)] p-3"><div className="text-xs text-[var(--muted)]">Nível de conhecimento</div><div className="mono mt-1 text-3xl font-bold text-[var(--yellow)]">{level}%</div></div></div>
                <div className="mt-3"><div className="flex justify-between text-xs"><span>Progresso do BABY</span><span>{level}%</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#22223e]"><div className="h-full rounded-full bg-[var(--neon)] transition-all duration-500" style={{width:`${level}%`}}/></div></div>
                <p className="mt-4 rounded-xl bg-[var(--surface-2)] px-3 py-3 text-sm leading-relaxed [overflow-wrap:anywhere]"><b className="text-[var(--neon)]">BABY diz:</b> {babyMsg}</p>
                {apiError && <p className="mt-3 rounded-lg bg-[#30141d] px-3 py-2 text-xs text-[#ffb0c0]">Memória indisponível no momento: {apiError}. Tente novamente em instantes.</p>}
                {absorbResult && <p className="mt-3 rounded-lg bg-[#10291e] px-3 py-2 text-xs text-[var(--neon)]">Absorção em lote: {absorbResult.saved} salvas • {absorbResult.remaining} restantes {absorbResult.error?`• ${absorbResult.error}`:""} {absorbResult.reloadError?`• Recarga: ${absorbResult.reloadError}`:""}</p>}
                <div className="mt-4 grid gap-2"><button onClick={absorbAll} disabled={absorbAllBusy||!!absorbingId} className="flex items-center justify-center gap-2 rounded-lg bg-[var(--neon)] px-3 py-3 text-xs font-bold text-black"><Zap size={15}/> {absorbAllBusy?"ABSORVENDO TODAS...":"ABSORVER TODAS AS NOTÍCIAS DESTA EDIÇÃO"}</button><button onClick={clearMemory} disabled={clearing||!memories.length} className="flex items-center justify-center gap-2 rounded-lg border border-[var(--red)] px-3 py-3 text-xs font-bold text-[#ff8ca0]"><Trash2 size={15}/> {clearing?"LIMPANDO...":"LIMPAR MEMÓRIA DO BABY"}</button></div>
                <div className="mt-5"><h3 className="flex items-center gap-2 text-sm font-bold"><Brain size={16} className="text-[var(--neon)]"/> MEMÓRIA DO BABY</h3>{loadingMemory?<p className="mt-3 text-xs text-[var(--muted)]">Carregando memória salva…</p>:memories.length?<ul className="mt-3 space-y-2 max-h-[320px] overflow-y-auto pr-1">{memories.map(m=><li key={m.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3"><p className="text-sm font-semibold leading-snug [overflow-wrap:anywhere]">{m.title}</p><p className="mt-1 text-[11px] text-[var(--muted)]">{m.date} • {m.source}</p></li>)}</ul>:<p className="mt-3 rounded-lg border border-dashed border-[var(--line)] p-3 text-xs text-[var(--muted)]">Nenhuma notícia absorvida ainda. Toque em “BABY ABSORVER” para começar.</p>}</div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4" aria-labelledby="log">
              <h3 id="log" className="flex items-center gap-2 font-bold"><Activity size={17} className="text-[var(--neon)]"/> LOG DE AUTOMAÇÃO</h3>
              <p className="mt-1 text-xs text-[var(--muted)]">Últimos 10 eventos da página.</p>
              <ul className="mt-3 space-y-2">{logs.map((l,i)=><li key={i} className="flex gap-3 border-b border-[var(--line)] pb-2 text-xs last:border-0"><span className="mono shrink-0 text-[var(--neon)]">{l.time}</span><span className="leading-relaxed [overflow-wrap:anywhere]">{l.text}</span></li>)}</ul>
              <button onClick={simulateMidnight} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--yellow)] px-3 py-3 text-xs font-bold text-[var(--yellow)]"><Play size={15}/> SIMULAR VIRADA 00:00 (TESTE)</button>
              <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-[var(--muted)]"><Gauge size={14} className="mt-0.5 shrink-0"/> Teste sem esperar meia-noite: limpa o destaque manual e registra a virada no log.</p>
            </section>

            <section className="rounded-2xl bg-[var(--yellow)] p-4 text-black"><p className="flex items-center gap-2 text-xs font-bold tracking-widest"><Flame size={15}/> COMO FUNCIONA</p><ol className="mt-3 space-y-2 text-sm font-medium leading-relaxed"><li><b>1.</b> Às 00:00, a edição vira sozinha.</li><li><b>2.</b> O painel revisa os preços salvos.</li><li><b>3.</b> O BABY pode absorver a edição e guardar na memória.</li></ol></section>
          </aside>
        </main>

        <footer className="mt-10 border-t border-[var(--line)] pt-5 pb-2 text-center text-xs leading-relaxed text-[var(--muted)]">
          <p className="font-bold text-white">CRYPY-NEWS MARKET • Conteúdo informativo. Não é recomendação de investimento.</p>
          <p className="mt-2">Preços: Binance. Notícias: fontes originais linkadas. CRYPYCOIN ainda sem cotação pública.</p>
          <p className="mono mt-3 text-[10px] tracking-widest">MODO OFFLINE • EDIÇÃO {edition} • BABY APRENDENDO COM A EDIÇÃO</p>
        </footer>
      </div>
    </div>
  );
}
