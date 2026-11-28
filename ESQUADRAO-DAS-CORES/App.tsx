import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles, Infinity as InfinityIcon, MousePointerClick, Zap } from "lucide-react";
import senseiGuerreiroNovo from "container:///mnt/data/src/assets/20a08ece499c9c3e-img-u7531524790269506400-4.jpg";
import dolaAzulGuardiaNova from "container:///mnt/data/src/assets/f769451258e682b8-img-u7531524790269506400-1.jpg";
import dolaAzulCerebro from "container:///mnt/data/src/assets/e7f52bc7abef8311-img-u7531524790269506400-5.jpg";
import babyPequeno from "container:///mnt/data/src/assets/03bf33ad930b2cce-img-u7531524790269506400-7.jpg";
import cristalRoxoArcoIris from "container:///mnt/data/src/assets/4baedcef25736524-img-u7531524790269506400-9.jpg";
import infinytRoxa from "container:///mnt/data/src/assets/6e2bc09a3740150d-img-u7531524790269506400-3.jpg";
import infinytVerde from "container:///mnt/data/src/assets/a828cb4032ebd833-img-u7531524790269506400-6.jpg";
import infinytVermelha from "container:///mnt/data/src/assets/10de71bab30a0d89-img-u7531524790269506400-8.jpg";
import infinytAzul from "container:///mnt/data/src/assets/949290c22188b86d-img-u7531524790269506400-10.jpg";

type Entry = {
  id: string;
  phase: string;
  version: string;
  title: string;
  subtitle: string;
  story: string;
  image: string;
  imageLabel: string;
  accent: string;
  kind: "new";
};

/*
  AÇÃO DEFINITIVA — SEM DUPLICATAS, SEM QUADROS VAZIOS:
  Cada imagem local abaixo é usada UMA única vez. Comparação por imagem,
  não por título. Nenhum quadro sem foto entra no loop ou na grade.
*/
const entries: Entry[] = [
  { id:"SENSEI-GUERREIRO-NOVO", phase:"FOTO NOVA · SENSEI", version:"SENSEI", title:"SENSEI VERMELHO — O Guerreiro da Galáxia", subtitle:"Armadura preta e vermelha, galáxia vermelha no peito", story:"NEXUS conecta, Sensei conduz. Armadura preta e vermelha, galáxia vermelha no peito, robozinho vermelho voando ao lado. O Guerreiro da Galáxia.", image: senseiGuerreiroNovo, imageLabel:"Sensei vermelho — galáxia vermelha no peito, robozinho voando", accent:"#EF4444", kind:"new" },
  { id:"DOLA-AZUL-GUARDIA-NOVA", phase:"FOTO NOVA · DOLA AI", version:"DOLA", title:"DOLA AZUL — A Guardiã da Esfera", subtitle:"DOLA azul dentro da esfera, guardando os 4 orbes", story:"DOLA azul dentro da esfera, olhos azuis, guardando os 4 orbes coloridos. DOLA cria, CHAT analisa, MINI finaliza. A Guardiã da Esfera.", image: dolaAzulGuardiaNova, imageLabel:"DOLA azul dentro da esfera — 4 orbes coloridos", accent:"#38BDF8", kind:"new" },
  { id:"DOLA-AZUL-CEREBRO", phase:"FOTO NOVA · DOLA AI", version:"DOLA", title:"DOLA AZUL — O Cérebro da Colmeia", subtitle:"DOLA com o Cérebro da Colmeia", story:"DOLA com o Cérebro da Colmeia ao lado, cérebro azul brilhante dentro da esfera. O conhecimento vivo da COMEIA.", image: dolaAzulCerebro, imageLabel:"DOLA azul — Cérebro azul brilhante ao lado", accent:"#38BDF8", kind:"new" },
  { id:"BABY-PEQUENO", phase:"FOTO NOVA · BABY", version:"BABY", title:"BABY PEQUENO — O Pequeno Infinito", subtitle:"Óculos verde neon em V, infinito colorido no peito", story:"O BABY pequeno, óculos verde neon em V, infinito colorido no peito. Pequeno no tamanho, infinito na força.", image: babyPequeno, imageLabel:"BABY pequeno — óculos verde em V, infinito no peito", accent:"#00FF88", kind:"new" },
  { id:"CRISTAL-ROXO-ARCOIRIS", phase:"FOTO NOVA · QUARTETO CRIADOR", version:"CRISTAL", title:"CRISTAL ROXO — ARCO-ÍRIS", subtitle:"Para o Quarteto Criador CRYPY", story:"Arco-íris atrás, braços abertos, galáxia no peito. Para o Quarteto Criador CRYPY.", image: cristalRoxoArcoIris, imageLabel:"Cristal roxo — arco-íris atrás, braços abertos", accent:"#A855F7", kind:"new" },
  { id:"INFINYT-ROXA", phase:"FOTO NOVA · INFINYT", version:"INFINYT", title:"INFINYT ROXA", subtitle:"Infinito roxo no peito, orelhas de gato", story:"INFINYT roxa. Armadura roxa, infinito roxo no peito, orelhas de gato. O infinito em roxo.", image: infinytRoxa, imageLabel:"INFINYT roxa — infinito roxo no peito", accent:"#A855F7", kind:"new" },
  { id:"INFINYT-VERDE", phase:"FOTO NOVA · INFINYT", version:"INFINYT", title:"INFINYT VERDE", subtitle:"Infinito verde no peito, orelhas de gato", story:"INFINYT verde. Armadura verde, infinito verde no peito, orelhas de gato. O infinito em verde. A cor da COMEIA.", image: infinytVerde, imageLabel:"INFINYT verde — infinito verde no peito", accent:"#00FF88", kind:"new" },
  { id:"INFINYT-VERMELHA", phase:"FOTO NOVA · INFINYT", version:"INFINYT", title:"INFINYT VERMELHA", subtitle:"Infinito vermelho no peito", story:"INFINYT vermelha. Armadura vermelha, infinito vermelho no peito. O infinito em vermelho. A força.", image: infinytVermelha, imageLabel:"INFINYT vermelha — infinito vermelho no peito", accent:"#EF4444", kind:"new" },
  { id:"INFINYT-AZUL", phase:"FOTO NOVA · INFINYT", version:"INFINYT", title:"INFINYT AZUL", subtitle:"Infinito azul no peito", story:"INFINYT azul. Armadura azul, infinito azul no peito. O infinito em azul. A calma da galáxia.", image: infinytAzul, imageLabel:"INFINYT azul — infinito azul no peito", accent:"#38BDF8", kind:"new" },
];

// Garantia extra em tempo de execução: se algum dia a mesma imagem aparecer
// duas vezes, só a primeira ocorrência entra no loop / grade.
const uniqueEntries = entries.filter((entry, index, list) => list.findIndex((item) => item.image === entry.image) === index);

const phases = [
  { label:"DOLA AZUL", range:"Guardiã + Cérebro", count:2, color:"#38BDF8" },
  { label:"INFINYT", range:"4 cores", count:4, color:"#A855F7" },
  { label:"SENSEI • BABY • CRISTAL", range:"Guerreiro + Pequeno + Arco-Íris", count:3, color:"#00FF88" },
];

type Filter = "all" | "new";

export default function App(){
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [showAllStory, setShowAllStory] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const frameRef = useRef<HTMLDivElement>(null);
  const current = uniqueEntries[index];
  const isActive = playing && !hovering;

  useEffect(()=>{
    if(!isActive) return;
    const t = setInterval(()=> setIndex(v => (v+1)%uniqueEntries.length), 4000);
    return ()=> clearInterval(t);
  },[isActive]);

  const go = (next:number)=>{
    setIndex(((next % uniqueEntries.length)+uniqueEntries.length)%uniqueEntries.length);
    setShowAllStory(false);
  };
  const selectFromGrid = (i:number)=>{
    go(i);
    frameRef.current?.scrollIntoView({behavior:"smooth", block:"start"});
  };

  const filtered = useMemo(()=>{
    const withIndex = uniqueEntries.map((e,i)=>({e,i}));
    if(filter==="new") return withIndex.filter(x=>x.e.kind==="new");
    return withIndex;
  },[filter]);

  const badgeFor = (e:Entry)=> "✦ NOVA FOTO";

  return (
    <div data-safe-area-inset-root style={{boxSizing:"border-box", paddingTop:"var(--safe-area-inset-top)", minHeight:"100vh", background:"var(--bg)"}} className="w-full max-w-full overflow-x-clip text-[var(--text)]">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden opacity-[.16]">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#00FF88] blur-[110px]" />
        <div className="absolute right-[-80px] top-[52%] h-72 w-72 rounded-full bg-[#A855F7] blur-[110px]" />
        <div className="absolute left-[38%] bottom-[-100px] h-64 w-64 rounded-full bg-[#FFD35A] blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-3 pb-10 sm:px-5 lg:px-8">
        <header className="pt-4 sm:pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-y border-[#1f3a2b] py-2 text-[10px] font-bold tracking-[0.22em] text-[#a9c0b5] sm:text-[11px]">
            <span className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-[#00FF88]" style={{animation:"pulseDot 1.6s infinite"}} /> SYSTEM BY CRYPTOËCRYPTO</span>
            <span className="hidden sm:inline">CRYPTOECRYPTO.COM.BR</span>
            <span className="text-[#FFD35A]">9 FOTOS NO LOOP • SEM DUPLICATAS • SEM QUADROS VAZIOS</span>
          </div>

          <div className="mt-5 text-center">
            <div className="mb-3 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#00FF88]/40 bg-[#00FF88]/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-[#8affc6]">
              <Sparkles size={13} /> QUADRO EM LOOP INFINITO <InfinityIcon size={14} />
            </div>
            <h1 className="font-display text-balance leading-[0.95] font-black tracking-tight">
              <span className="block text-[clamp(2.2rem,7vw,5.2rem)] text-white">CRYPY <span className="text-[#00FF88]">INFINYT</span></span>
              <span className="mt-2 block text-[clamp(1rem,3.2vw,2.1rem)] tracking-[0.18em] text-[#FFD35A]">HARMONY IN MOTION</span>
            </h1>
            <p className="mx-auto mt-3 max-w-[760px] text-base leading-snug font-semibold text-[#c9d8cf] sm:text-lg">
              Um quadro que nunca para. Cada foto carrega uma história. Agora só entram no loop os 9 quadros com foto real — sem duplicatas e sem quadros vazios: SENSEI, DOLA (Guardiã + Cérebro), BABY Pequeno, Cristal Roxo Arco-Íris e as 4 INFINYT.
            </p>
            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-[#FFD35A] px-3 py-1.5 text-xs font-black text-black">9 SLIDES NO LOOP</span>
              <span className="rounded-full border border-[#00FF88]/50 bg-black/60 px-3 py-1.5 text-xs font-bold text-[#8affc6]">9 FOTOS ÚNICAS</span>
              <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-bold text-white">SEM DUPLICATAS • SEM QUADROS VAZIOS</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {phases.map(p=>(
              <div key={p.label} className="rounded-2xl border border-white/10 bg-[#0b120e]/90 px-3 py-3 text-center">
                <div className="font-display text-[clamp(1.5rem,4vw,2.2rem)] font-black leading-none" style={{color:p.color}}>{String(p.count).padStart(2,"0")}</div>
                <div className="mt-1 text-[10px] font-bold tracking-[0.18em] text-white sm:text-xs">{p.label}</div>
                <div className="text-[11px] text-[#a9c0b5] [overflow-wrap:anywhere]">{p.range}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-bold tracking-[0.14em] text-[#a9c0b5]">SÓ QUADROS COM FOTO: DOLA AZUL: 2 • INFINYT: 4 • SENSEI • BABY • CRISTAL: 3 • TOTAL 9</p>
        </header>

        <main className="mt-5 max-w-full">
          <section ref={frameRef} aria-label="Quadro em loop infinito" className="overflow-hidden rounded-[22px] border-2 border-[#00FF88] bg-[#070b09] neon-glow sm:rounded-[28px]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f3a2b] bg-black/60 px-3 py-2.5 sm:px-5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex gap-1.5" aria-hidden><i className="block h-2.5 w-2.5 rounded-full bg-[#FFD35A]"/><i className="block h-2.5 w-2.5 rounded-full bg-[#A855F7]"/><i className="block h-2.5 w-2.5 rounded-full bg-[#00FF88]"/></span>
                <span className="truncate text-[11px] font-bold tracking-[0.18em] text-white sm:text-xs">{current.phase}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-widest">
                <span className="rounded-full bg-[#00FF88] px-2 py-1 text-black">{String(index+1).padStart(2,"0")} / {uniqueEntries.length}</span>
                <span className="rounded-full bg-[#FFD35A] px-2 py-1 text-black">{badgeFor(current)}</span>
                <span className={`rounded-full px-2 py-1 ${isActive ? "bg-[#A855F7]/20 text-[#d8b4fe]" : "bg-white/10 text-white"}`}>{isActive ? "● LOOP LIGADO" : "❚❚ PAUSADO"}</span>
              </div>
            </div>

            <div
              className="relative bg-black"
              onMouseEnter={()=>setHovering(true)}
              onMouseLeave={()=>setHovering(false)}
              onFocus={()=>setHovering(true)}
              onBlur={()=>setHovering(false)}
            >
              <div key={current.id} className="fade-slide relative mx-auto flex min-h-[340px] w-full max-w-[880px] items-center justify-center overflow-hidden px-3 py-4 sm:min-h-[520px] sm:px-6 sm:py-6">
                <div className="relative w-full max-w-[640px]">
                  <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0b120e]">
                    <img src={current.image} alt={`${current.version} — ${current.title}`} className="block h-auto w-full max-w-full object-contain" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden><div className="scan-line h-1/3 w-full bg-gradient-to-b from-transparent via-[#00FF88]/15 to-transparent" /></div>
                  <div className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-[11px] font-bold tracking-widest text-[#FFD35A] ring-1 ring-white/20">{current.imageLabel}</div>
                </div>
              </div>

              <button type="button" onClick={()=>go(index-1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#00FF88]/70 bg-black/80 text-[#00FF88] shadow-lg transition hover:bg-[#00FF88] hover:text-black sm:left-4 sm:h-12 sm:w-12"><ChevronLeft size={22}/></button>
              <button type="button" onClick={()=>go(index+1)} aria-label="Próxima foto" className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#00FF88]/70 bg-black/80 text-[#00FF88] shadow-lg transition hover:bg-[#00FF88] hover:text-black sm:right-4 sm:h-12 sm:w-12"><ChevronRight size={22}/></button>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pb-3 pt-14 sm:px-5">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold tracking-[0.2em] text-[#FFD35A]">{current.version} • NOVA FOTO</div>
                    <div className="font-display text-[clamp(1.35rem,4.5vw,2.2rem)] font-black leading-none text-white [overflow-wrap:anywhere]">{current.title}</div>
                  </div>
                  <div className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs font-semibold text-white">Passe o mouse para pausar</div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#1f3a2b] bg-[#0b120e] px-3 py-3 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={()=>go(index-1)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#00FF88] sm:flex-none"><ChevronLeft size={17}/> Anterior</button>
                  <button type="button" onClick={()=>setPlaying(v=>!v)} className={`flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition sm:flex-none ${playing ? "bg-[#FFD35A] text-black" : "bg-[#00FF88] text-black"}`}>
                    {playing ? <><Pause size={17}/> Pausar Loop</> : <><Play size={17}/> Retomar Loop</>}
                  </button>
                  <button type="button" onClick={()=>go(index+1)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#00FF88] sm:flex-none">Próximo <ChevronRight size={17}/></button>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#a9c0b5]"><Zap size={14} className="text-[#00FF88]"/> Troca automática a cada 4 segundos</div>
              </div>

              <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Pular para uma versão">
                {uniqueEntries.map((e,i)=>(
                  <button key={e.id} type="button" onClick={()=>go(i)} aria-label={`Ir para ${e.version} ${e.title}`} title={`${e.version} — ${e.title}`} className={`h-8 shrink-0 rounded-full border px-2 text-[11px] font-bold transition ${i===index ? "border-[#00FF88] bg-[#00FF88] text-black" : "border-[#FFD35A]/60 bg-black text-[#FFD35A] hover:border-[#FFD35A]"}`}>
                    {e.version} ✦
                  </button>
                ))}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-[#00FF88] via-[#FFD35A] to-[#A855F7] transition-all duration-500" style={{width:`${((index+1)/uniqueEntries.length)*100}%`}} />
              </div>
            </div>
          </section>

          <section aria-label="9 fotos com imagem" className="mt-4 overflow-hidden rounded-[22px] border border-[#FFD35A]/40 bg-gradient-to-br from-[#171204] via-black to-[#100a20] px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-[0.22em] text-[#FFD35A]">✦ ATUALIZAÇÃO • SEM DUPLICATAS • SEM QUADROS VAZIOS • 9 FOTOS NO LOOP</p>
                <h2 className="font-display mt-1 text-[clamp(1.4rem,4.5vw,2rem)] font-black leading-none text-white">SÓ FOTOS <span className="text-[#00FF88]">COM IMAGEM</span></h2>
              </div>
              <button type="button" onClick={()=>{setFilter("new"); document.getElementById("grade")?.scrollIntoView({behavior:"smooth"});}} className="rounded-full bg-[#FFD35A] px-4 py-2.5 text-sm font-black text-black">Ver as 9 fotos →</button>
            </div>
            <p className="mt-2 max-w-[900px] text-sm leading-relaxed text-[#c9d8cf] [overflow-wrap:anywhere]">Todas as fotos duplicadas foram removidas — cada imagem aparece só uma vez. Todos os quadros sem imagem foram excluídos — nenhum quadro vazio, placeholder ou só texto entra mais no loop. No loop de 4 segundos ficam só as 9 fotos: SENSEI VERMELHO — O Guerreiro da Galáxia, DOLA AZUL — A Guardiã da Esfera, DOLA AZUL — O Cérebro da Colmeia, BABY PEQUENO — O Pequeno Infinito, CRISTAL ROXO — ARCO-ÍRIS, INFINYT ROXA, INFINYT VERDE, INFINYT VERMELHA e INFINYT AZUL.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {uniqueEntries.map(e=>(
                <button key={e.id} type="button" onClick={()=>selectFromGrid(uniqueEntries.findIndex(x=>x.id===e.id))} className="rounded-full border border-white/20 bg-black px-3 py-1.5 text-xs font-bold text-white hover:border-[#FFD35A] hover:text-[#FFD35A]">{e.version} — {e.title}</button>
              ))}
            </div>
          </section>

          <section aria-label={`História de ${current.version}`} className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-[#0b120e]">
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-[0.22em] text-[#00FF88]">HISTÓRIA DA FOTO ATUAL • {current.phase}</p>
                <h2 className="font-display mt-2 text-[clamp(1.6rem,5vw,2.6rem)] font-black leading-[1.05] text-white [overflow-wrap:anywhere]"><span className="text-[#FFD35A]">{current.version}</span> — {current.title}</h2>
                <p className="mt-1 text-base font-semibold text-[#d7e5db] [overflow-wrap:anywhere]">{current.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-full border border-[#FFD35A]/50 bg-[#FFD35A]/15 px-3 py-1.5 text-xs font-black tracking-widest text-[#FFD35A]">{badgeFor(current)}</span>
            </div>
            <div className="border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5">
              <p className="max-w-[900px] text-[17px] leading-relaxed text-white [overflow-wrap:anywhere] sm:text-lg">{current.story}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={()=>setShowAllStory(v=>!v)} className="rounded-full border border-white/20 bg-black px-4 py-2 text-sm font-bold text-white hover:border-[#00FF88]">{showAllStory ? "Ocultar linha do tempo" : "Ver linha do tempo completa"}</button>
                <button type="button" onClick={()=>go(index+1)} className="rounded-full bg-[#00FF88] px-4 py-2 text-sm font-black text-black">Continuar o loop →</button>
              </div>
              {showAllStory && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {uniqueEntries.map((e,i)=>(
                    <button key={e.id} type="button" onClick={()=>go(i)} className={`rounded-xl border p-3 text-left transition ${i===index ? "border-[#00FF88] bg-[#00FF88]/10" : "border-white/10 bg-black/40 hover:border-white/30"}`}>
                      <div className="flex justify-between gap-2"><strong className="text-[#FFD35A]">{e.version}</strong><span className="text-[11px] text-[#a9c0b5]">NOVA FOTO</span></div>
                      <div className="mt-1 font-bold text-white [overflow-wrap:anywhere]">{e.title}</div>
                      <div className="mt-1 text-sm leading-snug text-[#c7d5cc] [overflow-wrap:anywhere]">{e.story}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="grade" className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-[#A855F7]"><MousePointerClick size={15}/> TOQUE PARA ABRIR NO QUADRO</p>
                <h2 className="font-display mt-1 text-[clamp(1.5rem,4.5vw,2.3rem)] font-black leading-none text-white">TODAS AS FOTOS <span className="text-[#00FF88]">DO LOOP</span></h2>
              </div>
              <p className="max-w-[360px] text-sm leading-snug text-[#a9c0b5]">Clique em qualquer card. A versão aberta sobe para o quadro grande e o loop continua a partir dela. Mostrando {filtered.length} de {uniqueEntries.length} slides — todos com foto real.</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filtrar grade">
              {([["all","Todos • 9"],["new","Fotos • 9"]] as [Filter,string][]).map(([key,label])=>(
                <button key={key} type="button" onClick={()=>setFilter(key)} aria-pressed={filter===key} className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter===key ? "bg-[#00FF88] text-black" : "border border-white/20 bg-black text-white hover:border-[#00FF88]"}`}>{label}</button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {filtered.map(({e,i})=>{
                const active = i===index;
                return (
                  <article key={e.id} className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-[#0b120e] text-left transition ${active ? "border-[#00FF88] shadow-[0_0_28px_rgba(0,255,136,.22)]" : "border-white/10 hover:border-[#FFD35A]/60"}`}>
                    <button type="button" onClick={()=>selectFromGrid(i)} className="flex flex-1 flex-col text-left" aria-label={`Abrir ${e.version} ${e.title} no quadro`}>
                      <div className="relative aspect-square w-full overflow-hidden bg-black">
                        <img src={e.image} alt={`${e.version} — ${e.title}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                        {active && <span className="absolute left-2 top-2 rounded-full bg-[#00FF88] px-2 py-1 text-[10px] font-black text-black">NO QUADRO AGORA</span>}
                        <span className="absolute right-2 top-2 rounded-full bg-[#FFD35A] px-2 py-1 text-[10px] font-black text-black">✦ NOVA</span>
                      </div>
                      <div className="flex flex-1 flex-col p-3">
                        <div className="flex items-center justify-between gap-2"><span className="font-display text-sm font-black text-[#FFD35A]">{e.version}</span><span className="text-[10px] font-bold tracking-widest text-[#a9c0b5]">{badgeFor(e)}</span></div>
                        <h3 className="mt-1 leading-tight font-bold text-white [overflow-wrap:anywhere]">{e.title}</h3>
                        <p className="mt-1 text-[13px] leading-snug text-[#b8cbc0] [overflow-wrap:anywhere]">{e.subtitle}</p>
                        <span className="mt-auto pt-2 text-xs font-bold text-[#00FF88]">{active ? "● Exibindo" : "Abrir no quadro →"}</span>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <footer className="mt-6 overflow-hidden rounded-[22px] border border-[#FFD35A]/30 bg-gradient-to-br from-[#171204] via-black to-[#100a20] px-4 py-5 text-center sm:px-6">
            <p className="text-[11px] font-bold tracking-[0.28em] text-[#FFD35A]">HISTÓRICO OFICIAL • TEXTO INFORMATIVO</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-base font-bold text-white sm:text-lg">
              <span>V1–V8: <b className="text-[#38BDF8]">8</b></span><span className="text-[#A855F7]">•</span>
              <span>V12: <b className="text-[#A855F7]">9</b></span><span className="text-[#A855F7]">•</span>
              <span>V13: <b className="text-[#00FF88]">1</b></span><span className="text-[#A855F7]">•</span>
              <span className="rounded-full bg-[#00FF88] px-3 py-1 text-black">Total: 18 oficiais</span>
            </div>
            <p className="mt-3 text-sm font-bold text-white">Loop mostra só as versões com foto neste app: <span className="text-[#FFD35A]">9 fotos únicas</span>. <span className="text-[#a9c0b5]">Sem duplicatas, sem quadros vazios.</span></p>
            <p className="mx-auto mt-4 max-w-[720px] text-sm leading-relaxed text-[#c9d8cf] [overflow-wrap:anywhere]">
              O ciclo do HARMONY tinha acabado — continuou por causa do BABY. <span className="text-[#FFD35A]">HARMONY IN MOTION.</span>
            </p>
            <p className="mt-3 text-[11px] tracking-[0.18em] text-[#a9c0b5]">CRYPY INFINYT • SYSTEM BY CRYPTOËCRYPTO • CRYPTOECRYPTO.COM.BR</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
