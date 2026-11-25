import React, { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Hexagon, Users, Cpu, Sparkles, CheckCircle2, Lock, Eye, Zap, Globe, ChevronDown, ChevronUp, Pause, Play, Coins, Crown, MessageSquare, Star, BookOpen, FlaskConical } from "lucide-react";
import coinUrl from "container:///mnt/data/src/assets/941931cb90bd262f-coin-oficial.jpg";
import icon512Url from "container:///mnt/data/src/assets/3dc931cb1d99e2bf-icon-512.png";
import ogUrl from "container:///mnt/data/src/assets/490666e36858c18d-og-image-1200x630.jpg";

const NAV = [
  { id: "inicio", label: "INÍCIO" },
  { id: "icone", label: "ÍCONE OFICIAL" },
  { id: "comeia", label: "COMEIA" },
  { id: "esquadrao", label: "ESQUADRÃO" },
  { id: "matrix", label: "MATRIX" },
  { id: "fusao", label: "FUSÃO V4" },
  { id: "svt", label: "SVT" },
  { id: "constituicao", label: "CONSTITUIÇÃO" },
];

const COMEIA = [
  { name: "LUCY", role: "Anticorpo do BABY", desc: "Segurança geral da colmeia. Vigia, protege e isola qualquer ameaça antes que ela alcance o enxame.", tag: "SEGURANÇA", color: "#00FF88", icon: ShieldCheck },
  { name: "SVT", role: "Autoridade Monetária", desc: "Satoshi • Vitalik • Tether. Fusão BTC + ETH + USDT. Dragão dourado e verde, guardião do valor e da ordem monetária.", tag: "AUTORIDADE MONETÁRIA", color: "#FFD35A", icon: Coins },
  { name: "COSMOS", role: "Sonhador do Universo", desc: "Olha além da colmeia. Imagina rotas, mundos e futuros que ainda não existem — e traz o mapa de volta.", tag: "VISÃO", color: "#7dd3ff", icon: Globe },
  { name: "ALICE", role: "Guerreira Verde", desc: "Linha de frente. Coragem, precisão e presença. Defende a colmeia com estratégia e lealdade.", tag: "GUERREIRA", color: "#00FF88", icon: Star },
  { name: "DOLA", role: "Quinteto • Esquadrão", desc: "Energia, ritmo e união. Parte do quinteto que sustenta o centro da colmeia em movimento.", tag: "QUINTETO", color: "#FFD35A", icon: Users },
  { name: "CHAT", role: "Quinteto • Esquadrão", desc: "Voz e conexão. Traduz o que a colmeia sente em palavra, diálogo e decisão coletiva.", tag: "QUINTETO", color: "#00FF88", icon: MessageSquare },
  { name: "HERA", role: "Guardiã da Colmeia", desc: "Ordem, cuidado e continuidade. Mantém a estrutura viva para que ninguém fique para trás.", tag: "GUARDIÃ", color: "#FFD35A", icon: Crown },
  { name: "SENSEI", role: "Mestre • Orientação", desc: "Disciplina e método. Ensina o caminho, corrige a rota e prepara o enxame para o próximo nível.", tag: "MESTRE", color: "#7dffb8", icon: BookOpen },
  { name: "BABY", role: "Coração • V13 Dourado", desc: "O centro protegido por todos. BABY V13 Dourado: pureza, futuro e a razão de existir da colmeia.", tag: "BABY V13", color: "#FFD35A", icon: Sparkles },
];

const SQUAD = [
  { name: "ALICE", detail: "Guerreira verde — liderança em campo." },
  { name: "DOLA", detail: "Força e ritmo do quinteto." },
  { name: "CHAT", detail: "Comunicação e conexão." },
  { name: "MINI", detail: "Agilidade, leveza e precisão." },
  { name: "HERA", detail: "Guardiã e estrutura." },
  { name: "BABY V13", detail: "Dourado. O centro protegido." },
];

const AREAS = [
  { n: "01", t: "Colmeia Central", d: "Onde tudo começa. Identidade, regras e o coração do ecossistema." },
  { n: "02", t: "Esquadrão das Cores", d: "Quinteto + BABY V13. Ação, defesa e presença em campo." },
  { n: "03", t: "Matrix Infinyt", d: "Fluxo de dados, sinais e a rede viva que conecta a colmeia." },
  { n: "04", t: "Tesouro SVT", d: "Autoridade monetária. Valor, ordem e responsabilidade." },
  { n: "05", t: "Laboratório", d: "Testes, protótipos e aprendizado antes de qualquer decisão real." },
  { n: "06", t: "Biblioteca Nexus", d: "Constituição, registros e memória oficial do projeto." },
  { n: "07", t: "Comunidade CMC", d: "A comunidade CoinMarketCap da CryptoëCrypto." },
  { n: "08", t: "Segurança LUCY", d: "Anticorpo do BABY. Proteção contínua da colmeia." },
  { n: "09", t: "Observatório Cosmos", d: "Visão de futuro, universo e novos horizontes." },
  { n: "10", t: "Arena / Treino", d: "Prática, disciplina e evolução do esquadrão." },
  { n: "11", t: "Ponte Web3.1", d: "Conexão entre a colmeia e o ecossistema Web3." },
  { n: "12", t: "Portal do Visitante", d: "Entrada para quem chega agora. Comece por aqui." },
];

const FUSAO = [
  { file: "comeia-web3.1.html", kept: "COMEIA + WEB3.1 — Ecossistema CRYPY completo" },
  { file: "index1-backup-antes-fusao.htm", kept: "ESQUADRÃO DAS CORES — Matrix lateral, meio preto absoluto, Quinteto + BABY V13" },
  { file: "index.html", kept: "CRYPY FUSÃO V4 CORRIGIDA — TODAS ABERTAS" },
  { file: "crypy-home-matrix-index.html", kept: "HOME MATRIX INFINYT — Colmeia digital" },
  { file: "index5.html", kept: "HOME MATRIX — Esquadrão reunido e dragão guardião" },
  { file: "index2.html", kept: "HOME MATRIX — 12 áreas conectadas" },
  { file: "index3.html", kept: "Colmeia — Navegação em 6 colunas" },
  { file: "index4.html", kept: "Reservado — registrado, sem conteúdo apagado" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function App() {
  const [active, setActive] = useState("inicio");
  const [filter, setFilter] = useState("TODOS");
  const [open, setOpen] = useState<string | null>("SVT");
  const [matrixOn, setMatrixOn] = useState(true);
  const [area, setArea] = useState(AREAS[0]);
  const [showAllComeia, setShowAllComeia] = useState(false);

  useEffect(() => {
    document.title = "CRYPY-WEB3.1 - System by CryptoëCrypto | COMEIA + Esquadrão + Matrix";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Fusão oficial CRYPY-WEB3.1. COMEIA + Esquadrão das Cores + Home Matrix Infinyt. System by CryptoëCrypto. Modo Real.");
  }, []);

  const comeiaFiltered = useMemo(() => {
    if (filter === "TODOS") return COMEIA;
    if (filter === "QUINTETO") return COMEIA.filter((c) => ["ALICE", "DOLA", "CHAT", "HERA"].includes(c.name));
    return COMEIA.filter((c) => c.tag === filter || c.name === filter);
  }, [filter]);

  const visibleComeia = showAllComeia ? comeiaFiltered : comeiaFiltered.slice(0, 6);
  const matrixChars = "CRYPYWEB31COMEIA010101SVTBABYALICEDOLA$#*+";
  const matrixText = useMemo(() => Array.from({ length: 18 }, (_, i) => matrixChars.slice((i * 7) % matrixChars.length) + matrixChars.slice(0, (i * 3) % 12)).join("\n"), []);

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", minHeight: "100vh", background: "#000" }} className="text-[var(--text)] overflow-x-clip">
      {/* TOP BAR */}
      <div className="bg-[#FFD35A] text-black text-[11px] sm:text-xs font-bold tracking-[0.18em] text-center px-3 py-2 leading-tight">
        FUSÃO OFICIAL &nbsp;•&nbsp; ÚNICO HTML &nbsp;•&nbsp; NENHUM ARQUIVO APAGADO &nbsp;•&nbsp; BACKUP PRESERVADO
      </div>

      {/* HEADER */}
      <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-40 bg-black/95 backdrop-blur border-b border-[#123c26]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[64px] flex items-center justify-between gap-3">
          <button onClick={() => scrollTo("inicio")} className="flex items-center gap-2 min-w-0 text-left" aria-label="Ir para o início">
            <img src={icon512Url} alt="Ícone CRYPY-WEB3.1" className="w-10 h-10 rounded-full object-cover border-2 border-[#FFD35A] shrink-0" />
            <span className="leading-none min-w-0">
              <span className="font-display font-black text-[15px] sm:text-lg tracking-wide block truncate">CRYPY<span className="text-[#FFD35A]">-WEB3.1</span></span>
              <span className="text-[9px] tracking-[0.22em] text-[#9db8a9] font-mono2 block">SYSTEM BY CRYPTOËCRYPTO</span>
            </span>
          </button>
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => { setActive(n.id); scrollTo(n.id); }} className={`px-2.5 py-2 text-[11px] font-bold tracking-widest rounded-full ${active === n.id ? "bg-[#00FF88] text-black" : "text-[#c9e8d5] hover:text-white hover:bg-white/10"}`}>{n.label}</button>
            ))}
          </nav>
          <button onClick={() => scrollTo("comeia")} className="btn-gold rounded-full px-3 sm:px-4 py-2 text-[11px] sm:text-xs tracking-widest shrink-0">ENTRAR NA COLMEIA →</button>
        </div>
        <div className="lg:hidden flex gap-1 overflow-x-auto no-scrollbar px-3 pb-2">
          {NAV.map((n) => <button key={n.id} onClick={() => { setActive(n.id); scrollTo(n.id); }} className={`whitespace-nowrap px-3 py-1.5 text-[10px] font-bold tracking-widest rounded-full border ${active === n.id ? "bg-[#00FF88] text-black border-[#00FF88]" : "border-[#234a33] text-[#bff5d3]"}`}>{n.label}</button>)}
        </div>
      </header>

      {/* HERO */}
      <section id="inicio" className="relative overflow-x-clip">
        <div className="absolute inset-y-0 left-0 w-[72px] sm:w-[110px] hidden md:block overflow-hidden" aria-hidden="true"><div className="matrix-col text-[11px] whitespace-pre">{matrixText}</div></div>
        <div className="absolute inset-y-0 right-0 w-[72px] sm:w-[110px] hidden md:block overflow-hidden" aria-hidden="true"><div className="matrix-col text-[11px] whitespace-pre">{matrixText}</div></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-14 grid lg:grid-cols-[1.15fr_.85fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 chip rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.18em]"><span className="w-2 h-2 rounded-full bg-[#00FF88] blink" /> MODO REAL • SEMANA 1 • TESTNET</div>
            <h1 className="font-display font-black leading-[0.92] mt-5 text-[clamp(2.6rem,8vw,5.2rem)]">CRYPY<br /><span className="gold-text">WEB3.1</span></h1>
            <p className="font-mono2 text-[#00FF88] tracking-[0.22em] text-xs sm:text-sm mt-3">SYSTEM BY CRYPTOËCRYPTO</p>
            <p className="text-lg sm:text-2xl leading-snug text-[#d8efe1] mt-4 max-w-[620px] [overflow-wrap:anywhere]">A fusão oficial. <b>COMEIA + Esquadrão das Cores + Matrix Infinyt</b> em um único HTML — sem duplicar, sem apagar, sem perder o backup.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <button onClick={() => scrollTo("comeia")} className="btn-gold rounded-full px-6 py-3.5 text-sm tracking-wider">ENTRAR NA COLMEIA</button>
              <button onClick={() => scrollTo("esquadrao")} className="btn-ghost rounded-full px-6 py-3.5 text-sm tracking-wider">VER ESQUADRÃO</button>
              <button onClick={() => scrollTo("matrix")} className="rounded-full px-6 py-3.5 text-sm tracking-wider border border-white/20 hover:bg-white/10">VER MATRIX</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-7 text-[11px] font-mono2">
              <span className="chip rounded-full px-3 py-1.5">8 ARQUIVOS FUNDIDOS</span>
              <span className="chip rounded-full px-3 py-1.5">12 ÁREAS CONECTADAS</span>
              <span className="chip rounded-full px-3 py-1.5">INDEX4 = RESERVADO</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="absolute -inset-3 rounded-[36px] border border-[#FFD35A]/40 spin-slow" style={{ borderStyle: "dashed" }} aria-hidden="true" />
            <div className="relative rounded-[30px] overflow-hidden border-2 border-[#FFD35A] bg-[#020805] shadow-[0_0_70px_rgba(255,211,90,.25)]">
              <img src={coinUrl} alt="Moeda oficial CRYPY-WEB3.1 — ícone oficial do site" className="w-full aspect-square object-cover floaty" />
              <div className="absolute left-3 right-3 bottom-3 bg-black/80 backdrop-blur rounded-2xl p-3 flex items-center justify-between gap-2">
                <div className="min-w-0"><p className="font-display font-bold text-sm truncate">ÍCONE OFICIAL</p><p className="text-[11px] text-[#9db8a9] [overflow-wrap:anywhere]">A miniatura que você encontra ao pesquisar o site.</p></div>
                <button onClick={() => scrollTo("icone")} className="shrink-0 bg-[#00FF88] text-black text-[11px] font-bold px-3 py-2 rounded-full">VER ÍCONE →</button>
              </div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-mono2 text-[#9db8a9] px-1"><span>FAVICON • 192 • 512</span><span>APPLE TOUCH 180</span><span>OG 1200×630</span></div>
          </div>
        </div>
      </section>

      {/* ÍCONE OFICIAL */}
      <section id="icone" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="font-mono2 text-[#FFD35A] tracking-[0.25em] text-xs">01 — IDENTIDADE</p><h2 className="font-display font-black text-[clamp(1.9rem,5vw,3.2rem)] leading-none mt-2">ÍCONE <span className="gold-text">OFICIAL</span></h2></div>
          <p className="text-[#9db8a9] max-w-[520px] [overflow-wrap:anywhere]">A mesma moeda em todos os lugares: aba do navegador, tela inicial do celular e prévia ao compartilhar.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-7">
          <figure className="card rounded-3xl overflow-hidden"><img src={coinUrl} alt="Moeda CRYPY-WEB3.1 usada como favicon e logo hero" className="w-full aspect-square object-cover" /><figcaption className="p-4"><b className="font-display">MOEDA OFICIAL</b><p className="text-sm text-[#9db8a9] mt-1 [overflow-wrap:anywhere]">Logo hero + favicon.ico. A foto enviada virou a miniatura oficial do site.</p><span className="chip inline-block mt-3 rounded-full px-3 py-1 text-[11px] font-bold">FAVICON • LOGO HERO</span></figcaption></figure>
          <figure className="card rounded-3xl overflow-hidden"><div className="bg-[#0a0a0a] p-8 flex items-center justify-center"><img src={icon512Url} alt="Ícone CRYPY 512 pixels para instalação e tela inicial" className="w-44 h-44 object-contain" /></div><figcaption className="p-4"><b className="font-display">ICON 512</b><p className="text-sm text-[#9db8a9] mt-1 [overflow-wrap:anywhere]">Para instalar o site e usar como app. Versões 192 e 512 geradas a partir da moeda oficial.</p><span className="chip inline-block mt-3 rounded-full px-3 py-1 text-[11px] font-bold">ICON-192 • ICON-512</span></figcaption></figure>
          <figure className="card rounded-3xl overflow-hidden"><img src={ogUrl} alt="Prévia CRYPY-WEB3.1 de 1200 por 630 pixels para compartilhamento" className="w-full aspect-[1200/630] object-cover" /><figcaption className="p-4"><b className="font-display">OG-IMAGE 1200 × 630</b><p className="text-sm text-[#9db8a9] mt-1 [overflow-wrap:anywhere]">A prévia que aparece quando alguém compartilha o link do site.</p><span className="chip inline-block mt-3 rounded-full px-3 py-1 text-[11px] font-bold">APPLE TOUCH 180</span></figcaption></figure>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm">
          {[["favicon.ico", "Aba do navegador"], ["icon-192.png", "Android / atalho"], ["icon-512.png", "Instalação / app"], ["apple-touch-icon 180", "iPhone / tela inicial"]].map(([a, b]) => <div key={a} className="rounded-2xl border border-[#123c26] bg-[#020805] p-4"><p className="font-mono2 text-[#00FF88] text-xs [overflow-wrap:anywhere]">{a}</p><p className="text-[#9db8a9] mt-1">{b}</p></div>)}
        </div>
      </section>

      {/* COMEIA */}
      <section id="comeia" className="bg-[#020805] border-y border-[#123c26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="font-mono2 text-[#FFD35A] tracking-[0.25em] text-xs">02 — ECOSSISTEMA</p><h2 className="font-display font-black text-[clamp(1.9rem,5vw,3.2rem)] leading-none mt-2">COMEIA <span className="neon-text">WEB3.1</span></h2><p className="text-[#9db8a9] mt-3 max-w-[620px]">Cada membro tem função. Ninguém é enfeite. A colmeia só funciona quando todos protegem o centro.</p></div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar membros da colmeia">
              {["TODOS", "QUINTETO", "SEGURANÇA", "BABY V13"].map((f) => <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-widest ${filter === f ? "bg-[#FFD35A] text-black" : "border border-[#234a33] text-[#bff5d3]"}`}>{f}</button>)}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
            {visibleComeia.map((c) => {
              const Icon = c.icon;
              const isOpen = open === c.name;
              return <article key={c.name} className="card rounded-3xl p-5">
                <div className="flex items-start justify-between gap-3"><div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ borderColor: c.color, color: c.color, background: "#000" }}><Icon size={24} /></div><span className="text-[10px] font-mono2 px-2.5 py-1 rounded-full border border-[#234a33] text-[#bff5d3]">{c.tag}</span></div>
                <h3 className="font-display font-black text-2xl mt-4">{c.name}</h3><p className="font-bold text-sm" style={{ color: c.color }}>{c.role}</p>
                <p className="text-[#c9e8d5] leading-relaxed mt-2 [overflow-wrap:anywhere]">{isOpen ? c.desc : c.desc.slice(0, 88) + "…"}</p>
                <button onClick={() => setOpen(isOpen ? null : c.name)} className="mt-3 inline-flex items-center gap-1 text-[#00FF88] text-xs font-bold tracking-widest">{isOpen ? <>VER MENOS <ChevronUp size={15} /></> : <>VER HISTÓRIA <ChevronDown size={15} /></>}</button>
              </article>;
            })}
          </div>
          <button onClick={() => setShowAllComeia(!showAllComeia)} className="mt-5 w-full sm:w-auto border border-[#00FF88] text-[#00FF88] rounded-full px-6 py-3 text-xs font-bold tracking-widest">{showAllComeia ? "MOSTRAR MENOS MEMBROS ↑" : `MOSTRAR TODOS OS ${comeiaFiltered.length} MEMBROS ↓`}</button>
        </div>
      </section>

      {/* ESQUADRÃO */}
      <section id="esquadrao" className="relative overflow-x-clip border-b border-[#123c26]">
        <div className="grid md:grid-cols-[110px_1fr_110px] min-h-[560px]">
          <div className="hidden md:block bg-black overflow-hidden p-2" aria-hidden="true"><div className="matrix-col text-[12px] whitespace-pre">{matrixOn ? matrixText : "MATRIX\nPAUSADA\n—"}</div></div>
          <div className="bg-black px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center text-center">
            <p className="font-mono2 text-[#FFD35A] tracking-[0.25em] text-xs">03 — MEIO PRETO ABSOLUTO #000</p>
            <h2 className="font-display font-black text-[clamp(1.9rem,5vw,3.4rem)] leading-[0.95] mt-3">ESQUADRÃO<br /><span className="neon-text">DAS CORES</span></h2>
            <p className="text-[#9db8a9] max-w-[620px] mt-3 [overflow-wrap:anywhere]">Matrix só nas laterais. No centro, preto absoluto — para o esquadrão brilhar sem ruído.</p>
            <button onClick={() => setMatrixOn(!matrixOn)} className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#00FF88] px-4 py-2 text-xs font-bold text-[#00FF88]">{matrixOn ? <><Pause size={14} /> PAUSAR MATRIX LATERAL</> : <><Play size={14} /> LIGAR MATRIX LATERAL</>}</button>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mt-8 max-w-[760px] px-1">
              {SQUAD.map((s, i) => <div key={s.name} className={`rounded-3xl border p-4 w-[150px] sm:w-[170px] text-left ${s.name === "BABY V13" ? "border-[#FFD35A] bg-[#171000] shadow-[0_0_36px_rgba(255,211,90,.18)]" : "border-[#123c26] bg-[#020805]"}`}><div className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-black ${s.name === "BABY V13" ? "bg-[#FFD35A] text-black" : "bg-[#00FF88] text-black"}`}>{s.name[0]}</div><p className="font-display font-bold mt-3">{s.name}</p><p className="text-xs text-[#9db8a9] leading-snug mt-1 [overflow-wrap:anywhere]">{s.detail}</p><p className="font-mono2 text-[10px] text-[#5f7d6b] mt-3">0{i + 1} / QUINTETO + BABY</p></div>)}
            </div>
            <div className="mt-8 rounded-2xl border border-[#FFD35A]/50 bg-[#0d0900] px-5 py-4 max-w-[640px]"><p className="font-display text-[#FFD35A] tracking-widest text-sm">★ BABY V13 DOURADO ★</p><p className="text-sm text-[#e8d9a5] mt-1 [overflow-wrap:anywhere]">O quinteto se move. O BABY é o centro protegido. Todos os caminhos da colmeia passam por ele.</p></div>
          </div>
          <div className="hidden md:block bg-black overflow-hidden p-2" aria-hidden="true"><div className="matrix-col text-[12px] whitespace-pre">{matrixOn ? matrixText : "MATRIX\nPAUSADA\n—"}</div></div>
        </div>
      </section>

      {/* MATRIX / 12 ÁREAS */}
      <section id="matrix" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="font-mono2 text-[#FFD35A] tracking-[0.25em] text-xs">04 — HOME MATRIX INFINYT</p>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-2"><h2 className="font-display font-black text-[clamp(1.9rem,5vw,3.2rem)] leading-none">12 ÁREAS <span className="neon-text">CONECTADAS</span></h2><p className="text-[#9db8a9] max-w-[480px]">Toque em uma área para ver como ela se conecta com a colmeia.</p></div>
        <div className="grid lg:grid-cols-[1fr_340px] gap-5 mt-7 items-start">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {AREAS.map((a) => <button key={a.n} onClick={() => setArea(a)} className={`text-left rounded-2xl border p-4 ${area.n === a.n ? "border-[#00FF88] bg-[#04120a] shadow-[0_0_28px_rgba(0,255,136,.12)]" : "border-[#123c26] bg-[#020805] hover:border-[#00FF88]/60"}`}><span className="font-mono2 text-[#FFD35A] text-xs">{a.n}</span><span className="font-display font-bold block mt-1">{a.t}</span><span className="text-sm text-[#9db8a9] block mt-1 leading-snug [overflow-wrap:anywhere]">{a.d}</span></button>)}
          </div>
          <aside className="lg:sticky lg:top-[104px] card rounded-3xl p-5">
            <div className="flex items-center gap-2 text-[#00FF88]"><Hexagon size={20} /><span className="font-mono2 text-xs tracking-[0.22em]">ÁREA SELECIONADA</span></div>
            <p className="font-display font-black text-4xl mt-4 text-[#FFD35A]">{area.n}</p><h3 className="font-display font-bold text-2xl mt-1">{area.t}</h3><p className="text-[#c9e8d5] leading-relaxed mt-3 [overflow-wrap:anywhere]">{area.d}</p>
            <div className="mt-5 rounded-2xl bg-black border border-[#123c26] p-4"><p className="text-xs font-bold tracking-widest text-[#00FF88]">CONEXÃO ATIVA</p><p className="text-sm text-[#9db8a9] mt-1 [overflow-wrap:anywhere]">Esta área conversa com a Colmeia Central, com o SVT e com o Esquadrão. Nada fica isolado.</p></div>
            <button onClick={() => scrollTo("comeia")} className="btn-gold w-full rounded-full py-3 mt-5 text-xs tracking-widest">VOLTAR PARA A COLMEIA →</button>
          </aside>
        </div>
        <div className="mt-6 rounded-3xl border border-[#123c26] bg-[#020805] p-5 flex flex-wrap gap-4 items-center justify-between"><div className="flex items-center gap-3"><Zap className="text-[#FFD35A]" /><p className="font-bold">Dragão guardião ativo. <span className="text-[#9db8a9] font-normal">SVT vigia a rede enquanto a colmeia trabalha.</span></p></div><span className="font-mono2 text-xs text-[#00FF88]">● INFINYT • ONLINE</span></div>
      </section>

      {/* FUSÃO V4 */}
      <section id="fusao" className="bg-[#020805] border-y border-[#123c26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-[1fr_.9fr] gap-8">
          <div><p className="font-mono2 text-[#FFD35A] tracking-[0.25em] text-xs">05 — FUSÃO V4 CORRIGIDA</p><h2 className="font-display font-black text-[clamp(1.9rem,5vw,3.2rem)] leading-none mt-2">TODAS <span className="gold-text">ABERTAS</span></h2><p className="text-[#9db8a9] mt-4 max-w-[560px] [overflow-wrap:anywhere]">Nenhum arquivo foi apagado. O backup foi preservado. O que era separado virou um único caminho — e cada origem continua registrada abaixo.</p>
            <div className="mt-6 space-y-3">
              {["Nenhum arquivo apagado", "Backup preservado antes da fusão", "index4.html registrado como reservado", "Conteúdo preservado, sem duplicar"].map((t) => <div key={t} className="flex gap-3 items-center rounded-2xl border border-[#123c26] bg-black p-4"><CheckCircle2 className="text-[#00FF88] shrink-0" size={22} /><b>{t}</b></div>)}
            </div>
          </div>
          <div className="rounded-3xl border border-[#FFD35A]/40 bg-black p-5 sm:p-6"><p className="font-mono2 text-xs tracking-[0.22em] text-[#FFD35A]">CHECKLIST DA FUSÃO — 8 ARQUIVOS</p><ul className="mt-4 space-y-4">{FUSAO.map((f) => <li key={f.file} className="flex gap-3"><CheckCircle2 className="text-[#00FF88] shrink-0 mt-0.5" size={20} /><span><span className="font-mono2 text-xs text-[#FFD35A] block [overflow-wrap:anywhere]">{f.file}</span><span className="text-sm text-[#c9e8d5] block mt-0.5 [overflow-wrap:anywhere]">{f.kept}</span></span></li>)}</ul></div>
        </div>
      </section>

      {/* SVT */}
      <section id="svt" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-8 items-center">
          <div className="relative rounded-[28px] overflow-hidden border-2 border-[#FFD35A]"><img src={ogUrl} alt="Prévia dourada do SVT, autoridade monetária da colmeia" className="w-full aspect-[4/3] object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-16"><p className="font-mono2 text-[11px] tracking-[0.25em] text-[#FFD35A]">DRAGÃO DOURADO E VERDE</p><p className="font-display font-black text-3xl">SVT</p></div></div>
          <div><p className="font-mono2 text-[#FFD35A] tracking-[0.25em] text-xs">06 — IA OFICIAL CMC</p><h2 className="font-display font-black text-[clamp(1.9rem,5vw,3.2rem)] leading-none mt-2">SVT — IA OFICIAL <span className="neon-text">DA COMUNIDADE</span></h2><p className="text-lg text-[#d8efe1] mt-4 leading-relaxed [overflow-wrap:anywhere]">SVT é a IA oficial da comunidade CoinMarketCap da <b>CryptoëCrypto</b> e a Autoridade Monetária da colmeia.</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {[["S", "Satoshi", "Origem do Bitcoin. Base, escassez e confiança."], ["V", "Vitalik", "Origem do Ethereum. Contratos e construção."], ["T", "Tether", "Origem do USDT. Estabilidade e troca."]].map(([l, n, d]) => <div key={l} className="card rounded-2xl p-4"><span className="font-display font-black text-3xl text-[#FFD35A]">{l}</span><b className="block mt-2">{n}</b><span className="text-sm text-[#9db8a9] leading-snug block mt-1 [overflow-wrap:anywhere]">{d}</span></div>)}
            </div>
            <p className="mt-5 rounded-2xl border border-[#123c26] bg-[#020805] p-4 text-sm leading-relaxed [overflow-wrap:anywhere]"><b className="text-[#FFD35A]">Fusão BTC + ETH + USDT.</b> O dragão dourado e verde não decide sozinho: ele guarda a ordem, a clareza e a responsabilidade monetária.</p>
          </div>
        </div>
      </section>

      {/* CONSTITUIÇÃO */}
      <section id="constituicao" className="bg-[#020805] border-t border-[#123c26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center max-w-[760px] mx-auto"><p className="font-mono2 text-[#FFD35A] tracking-[0.25em] text-xs">07 — CONSTITUIÇÃO NEXUS</p><h2 className="font-display font-black text-[clamp(1.9rem,5vw,3.2rem)] leading-none mt-2">MODO <span className="neon-text">REAL</span></h2><p className="text-[#9db8a9] mt-3">Não é promessa. É compromisso escrito — e cobrado todos os dias.</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-8">
            {[["Transparência", "O que é feito pode ser visto e verificado.", Eye], ["Honestidade técnica", "Nada de exagero técnico. O que não foi testado, não é afirmado.", FlaskConical], ["Independência institucional", "A colmeia decide por si. Sem dono externo.", ShieldCheck], ["Responsabilidade", "Cada decisão tem consequência — e alguém responde por ela.", Lock], ["Evolução responsável", "Crescer sem atropelar a segurança nem a verdade.", Sparkles]].map(([t, d, Icon]: any) => <div key={t} className="card rounded-3xl p-5"><Icon className="text-[#00FF88]" size={26} /><h3 className="font-display font-bold mt-4 leading-tight">{t}</h3><p className="text-sm text-[#9db8a9] leading-relaxed mt-2 [overflow-wrap:anywhere]">{d}</p></div>)}
          </div>
          <blockquote className="mt-6 rounded-3xl border-2 border-[#FFD35A] bg-black p-6 sm:p-8 text-center"><p className="font-display font-bold text-lg sm:text-2xl leading-snug">“Se não sei, digo que não sei.<br />Se não testei, digo que não testei.<br />Se não está comprovado, <span className="text-[#FFD35A]">não declaro como aprovado.</span>”</p><footer className="font-mono2 text-xs text-[#9db8a9] tracking-[0.22em] mt-4">REGRA DE OURO — CONSTITUIÇÃO NEXUS</footer></blockquote>
          <div className="grid sm:grid-cols-3 gap-3 mt-4 text-center">
            <div className="rounded-2xl border border-[#123c26] p-5"><b className="font-display">SEMANA 1</b><p className="text-sm text-[#9db8a9] mt-1">Estamos na primeira semana. Aprender antes de acelerar.</p></div>
            <div className="rounded-2xl border border-[#123c26] p-5"><b className="font-display">TESTNET</b><p className="text-sm text-[#9db8a9] mt-1">Testes em ambiente de teste. Sem atalhos.</p></div>
            <div className="rounded-2xl border border-[#ff5d73]/50 bg-[#140507] p-5"><b className="font-display text-[#ff8a9a]">SEM MAINNET • SEM LIQUIDEZ REAL</b><p className="text-sm text-[#d9aab2] mt-1">Nada de dinheiro real nesta fase. Ponto.</p></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#123c26] bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-[1.2fr_.8fr] gap-8 items-center">
          <div className="flex gap-4 items-start"><div className="w-16 h-16 rounded-full border-2 border-[#FFD35A] bg-[#171000] flex items-center justify-center font-display font-black text-3xl text-[#FFD35A] shrink-0" aria-hidden="true">C</div><div><p className="font-display font-black text-xl leading-none">CRYPY-WEB3.1</p><p className="text-[#9db8a9] mt-2 [overflow-wrap:anywhere]">System by CryptoëCrypto • COMEIA + Esquadrão + Matrix</p><p className="font-mono2 text-xs text-[#00FF88] mt-2 [overflow-wrap:anywhere]">cryptoecrypto.com.br • @cryptoecryptosubc</p></div></div>
          <div className="md:text-right"><p className="font-mono2 text-xs tracking-[0.22em] text-[#FFD35A]">MODO REAL • 25/11/2026</p><p className="text-sm text-[#9db8a9] mt-2 [overflow-wrap:anywhere]">Fusão oficial. Nenhum arquivo apagado. Backup preservado.</p><button onClick={() => scrollTo("inicio")} className="mt-4 btn-gold rounded-full px-5 py-2.5 text-xs tracking-widest">VOLTAR AO TOPO ↑</button></div>
        </div>
      </footer>
    </div>
  );
}
