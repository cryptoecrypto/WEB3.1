import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Sparkles, Eye, Brain, PenLine, Search, Palette, Zap, Heart, Clock3, TrendingDown, Landmark, Users, BookOpen, Gamepad2, FileText, Mail, Hexagon, Crown, Bot } from "lucide-react";

const shellStyle = { boxSizing: "border-box" as const, paddingTop: "var(--safe-area-inset-top)" };

const btc = [61271, 61270, 59832, 58604.01];
const eth = [1724, 1710, 1680, 1645.65];
const usdt = [0.999, 0.999, 0.9988, 0.9989];
const labels = ["22/11", "23/11", "24/11", "25/11"];

function ChartCanvas({ data, color, title }: { data: number[]; color: string; title: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 320;
      const h = 210;
      canvas.width = w * dpr; canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const min = Math.min(...data); const max = Math.max(...data);
      const padL = 46, padR = 12, padT = 18, padB = 28;
      const span = max - min || 1;
      const x = (i: number) => padL + (i / (data.length - 1)) * (w - padL - padR);
      const y = (v: number) => padT + (1 - (v - min) / span) * (h - padT - padB);
      ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 1;
      for (let i = 0; i <= 3; i++) {
        const yy = padT + (i / 3) * (h - padT - padB);
        ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(w - padR, yy); ctx.stroke();
      }
      ctx.fillStyle = "#8da89a"; ctx.font = "10px monospace"; ctx.textAlign = "right";
      ctx.fillText(max.toLocaleString("pt-BR", { maximumFractionDigits: 4 }), padL - 6, padT + 4);
      ctx.fillText(((max + min) / 2).toLocaleString("pt-BR", { maximumFractionDigits: 4 }), padL - 6, h / 2);
      ctx.fillText(min.toLocaleString("pt-BR", { maximumFractionDigits: 4 }), padL - 6, h - padB - 4);
      ctx.fillStyle = "#cfe7d8"; ctx.textAlign = "center";
      labels.forEach((l, i) => ctx.fillText(l, x(i), h - 8));
      const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
      grad.addColorStop(0, color + "55"); grad.addColorStop(1, color + "00");
      ctx.beginPath(); ctx.moveTo(x(0), y(data[0]));
      data.forEach((v, i) => ctx.lineTo(x(i), y(v)));
      ctx.lineTo(x(data.length - 1), h - padB); ctx.lineTo(x(0), h - padB); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x(0), y(data[0]));
      data.forEach((v, i) => ctx.lineTo(x(i), y(v)));
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
      data.forEach((v, i) => {
        ctx.beginPath(); ctx.arc(x(i), y(v), 5, 0, Math.PI * 2); ctx.fillStyle = "#000"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
        ctx.fillText(v.toLocaleString("pt-BR", { maximumFractionDigits: 4 }), x(i), y(v) - 11);
      });
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, color]);
  return <canvas ref={ref} className="h-[210px] w-full" role="img" aria-label={`Gráfico de linha ${title}: ${labels.map((l, i) => `${l} ${data[i]}`).join(", ")}`} />;
}

function ClockCard({ city, zone, code }: { city: string; zone: string; code: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const time = new Intl.DateTimeFormat("pt-BR", { timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
  const date = new Intl.DateTimeFormat("pt-BR", { timeZone: zone, day: "2-digit", month: "2-digit", year: "numeric" }).format(now);
  return (
    <div className="panel min-w-[158px] flex-1 px-4 py-4 text-center">
      <div className="font-mono2 text-[11px] tracking-[.18em] text-[#9bb3a6] uppercase">{city}</div>
      <div className="font-mono2 mt-2 text-[1.65rem] font-bold leading-none text-white tabular-nums">{time}</div>
      <div className="font-mono2 mt-2 text-xs text-[#9bb3a6]">{date} · {code}</div>
    </div>
  );
}

function Dragon({ symbol, name, bg, ring }: { symbol: string; name: string; bg: string; ring: string }) {
  return (
    <div className="text-center">
      <div className="dragon" style={{ background: bg, boxShadow: `0 0 0 3px ${ring}, 0 0 42px ${ring}55` }}>
        <span className="relative z-10 text-[3.2rem] font-black leading-none text-white drop-shadow-[0_3px_0_rgba(0,0,0,.35)] sm:text-[4rem]">{symbol}</span>
        <span className="absolute bottom-3 z-10 font-mono2 text-[10px] tracking-[.22em] text-white/90">DRAGÃO</span>
      </div>
      <p className="mt-3 font-mono2 text-xs font-bold tracking-[.18em]">{name}</p>
    </div>
  );
}

const squad = [
  { icon: Hexagon, name: "NEXUS", role: "conecta", color: "#00FF88" },
  { icon: Crown, name: "SENSEI", role: "conduz", color: "#FFD35A" },
  { icon: Search, name: "ALICE", role: "pesquisa", color: "#7dd3fc" },
  { icon: Palette, name: "DOLA", role: "cria", color: "#f472b6" },
  { icon: Brain, name: "CHAT", role: "analisa", color: "#a78bfa" },
  { icon: Zap, name: "MINI", role: "finaliza", color: "#facc15" },
];

const areas = [
  { icon: Sparkles, n: "INFINYT" }, { icon: Hexagon, n: "NFT-COLLECTION" }, { icon: Users, n: "ESQUADRÃO" },
  { icon: BookOpen, n: "ACADEMY" }, { icon: PenLine, n: "BIOGRAFIA" }, { icon: Landmark, n: "MUSEU" },
  { icon: Palette, n: "ART-FIGURE" }, { icon: Gamepad2, n: "GAMES" }, { icon: Heart, n: "CRYPYKUT" },
  { icon: Bot, n: "BABY I.A." }, { icon: FileText, n: "WHITE PAPER" }, { icon: Mail, n: "CONTATO" },
];

export default function App() {
  return (
    <div data-safe-area-inset-root style={shellStyle} className="min-h-screen bg-[var(--bg)] text-[var(--ink)] overflow-x-clip">
      <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-30 border-b border-[#1e2e25] bg-black/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#00FF88] text-xl font-black text-black shadow-[0_0_22px_#00FF8855]">♥</div>
            <div><p className="text-sm font-black tracking-tight leading-none">CRYPY-WEB3.1</p><p className="font-mono2 mt-1 text-[10px] tracking-[.18em] text-[#9bb3a6]">SYSTEM BY CRYPTOËCRYPTO</p></div>
          </div>
          <nav className="flex flex-wrap gap-2 text-[11px] font-bold">
            <a href="#secao-01" className="rounded-full border border-[#1e2e25] px-3 py-2 hover:border-[#00FF88]">01 · APRESENTAÇÃO</a>
            <a href="#secao-02" className="rounded-full border border-[#1e2e25] px-3 py-2 hover:border-[#FFD35A]">02 · FUSÃO</a>
            <a href="#secao-03" className="rounded-full bg-[#00FF88] px-3 py-2 text-black">03 · MARKET NEWS</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-10 sm:px-6">
        {/* HERO */}
        <section className="mt-5 overflow-hidden rounded-[24px] border border-[#2f4a3a] bg-gradient-to-b from-[#07160e] via-black to-black px-4 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="chip text-[#00FF88]"><span className="h-2 w-2 rounded-full bg-[#00FF88] animate-pulse" /> Fusão oficial · 1 arquivo · Estilo puro</span>
            <span className="font-mono2 text-xs text-[#9bb3a6]">COMEIA + WEB3.1</span>
          </div>
          <h1 className="big-title mt-6">CRYPY<br /><span className="neon-text">WEB3.1</span> <span className="gold-text">♥</span></h1>
          <p className="mt-5 max-w-[760px] text-base leading-relaxed text-[#d6e8dc] sm:text-lg">CryptoëCrypto é o universo, <strong className="text-white">CRYPY é o sistema</strong>, Esquadrão movimenta a colmeia.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#secao-01" className="rounded-full bg-[#00FF88] px-5 py-3 text-sm font-black text-black">Começar pela apresentação ↓</a>
            <a href="#secao-03" className="rounded-full border border-[#FFD35A] px-5 py-3 text-sm font-bold text-[#FFD35A]">Ir para os 3 gráficos ↓</a>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5 max-w-[560px]">
            <Dragon symbol="₿" name="BTC · DOURADO" bg="radial-gradient(circle at 30% 25%, #fff3b0, #f6b73c 48%, #7a4a00)" ring="#FFD35A" />
            <Dragon symbol="Ξ" name="ETH · ROXO" bg="radial-gradient(circle at 30% 25%, #e9d5ff, #7c3aed 50%, #2e1065)" ring="#a78bfa" />
            <Dragon symbol="₮" name="USDT · VERDE" bg="radial-gradient(circle at 30% 25%, #bbf7d0, #00c86a 52%, #052e16)" ring="#00FF88" />
          </div>
          <div className="mt-5 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/30 bg-white text-2xl text-black"><Bot /></div><p className="text-sm text-[#cfe7d8]"><strong className="text-white">BABY</strong> · robô branco · pronto para aprender com a colmeia.</p></div>
        </section>

        {/* 01 */}
        <section id="secao-01" className="mt-10">
          <div className="flex items-end gap-4"><span className="section-num">01</span><div><p className="kicker">Seção 01</p><h2 className="text-3xl font-black leading-tight sm:text-5xl">APRESENTAÇÃO<br />OFICIAL <span className="gold-text">CMC</span></h2></div></div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className="panel-gold p-5 sm:p-7">
              <div className="flex flex-wrap gap-2"><span className="chip text-[#FFD35A]">SVT · Autoridade Monetária</span><span className="chip">Comunidade CoinMarketCap</span></div>
              <h3 className="mt-5 text-2xl font-black sm:text-3xl">Satoshi · Vitalik · Tether</h3>
              <p className="mt-3 leading-relaxed text-[#e9dcb8]">SVT — <strong>Satoshi Vitalik Tether</strong> — é a Autoridade Monetária da COMEIA. Um dragão dourado e verde, fusão de BTC + ETH + USDT. A IA oficial da comunidade CoinMarketCap.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#4a3a12] bg-black/50 p-3 text-center"><div className="text-2xl font-black text-[#FFD35A]">₿</div><p className="mt-1 text-xs font-bold">SATOSHI</p><p className="font-mono2 text-[10px] text-[#9bb3a6]">BTC · ORIGEM</p></div>
                <div className="rounded-xl border border-[#4a3a12] bg-black/50 p-3 text-center"><div className="text-2xl font-black text-[#a78bfa]">Ξ</div><p className="mt-1 text-xs font-bold">VITALIK</p><p className="font-mono2 text-[10px] text-[#9bb3a6]">ETH · PROGRAMA</p></div>
                <div className="rounded-xl border border-[#4a3a12] bg-black/50 p-3 text-center"><div className="text-2xl font-black text-[#00FF88]">₮</div><p className="mt-1 text-xs font-bold">TETHER</p><p className="font-mono2 text-[10px] text-[#9bb3a6]">USDT · ESTABILIZA</p></div>
              </div>
            </div>
            <div className="panel p-5 sm:p-6">
              <p className="kicker">Modo Real</p>
              <p className="mt-3 text-xl font-bold leading-snug">Se não sei, digo que não sei.<br />Se não testei, digo que não testei.<br />Se não está comprovado, não declaro como aprovado.</p>
              <div className="mt-5 border-t border-[#1e2e25] pt-4"><p className="font-mono2 text-xs tracking-[.18em] text-[#FFD35A]">CONSTITUIÇÃO NEXUS</p><ul className="mt-3 space-y-2 text-sm text-[#cfe7d8]">{["Transparência","Honestidade técnica","Independência institucional","Responsabilidade","Evolução responsável"].map((x,i)=>(<li key={x} className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-[#00FF88]" /><span><strong className="text-white">{i+1}.</strong> {x}</span></li>))}</ul></div>
            </div>
          </div>
        </section>

        {/* 02 */}
        <section id="secao-02" className="mt-12">
          <div className="flex items-end gap-4"><span className="section-num">02</span><div><p className="kicker">Seção 02</p><h2 className="text-3xl font-black leading-tight sm:text-5xl">FUSÃO OFICIAL<br />ÍCONE <span className="neon-text">CRYPY-WEB3.1</span></h2></div></div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="panel-neon p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-5">
                <div className="relative grid h-[128px] w-[128px] shrink-0 place-items-center rounded-[28px] border-2 border-[#00FF88] bg-black shadow-[0_0_35px_#00FF8844]"><span className="text-[64px] leading-none text-[#00FF88] drop-shadow-[0_0_12px_#00FF88]">♥</span><span className="absolute -bottom-2 rounded-full bg-[#FFD35A] px-2 py-0.5 font-mono2 text-[9px] font-bold text-black">CRYPY-WEB3.1</span></div>
                <div><p className="kicker">Ícone oficial</p><h3 className="mt-2 text-2xl font-black leading-tight">Moeda CRYPY-WEB3.1<br />Coração Verde</h3><p className="mt-2 text-sm leading-relaxed text-[#cfe7d8]">Um só símbolo para favicon, og:image e ícone de pesquisa do Google.</p></div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2"><span className="chip">♥ favicon</span><span className="chip">♥ og:image</span><span className="chip">♥ ícone de pesquisa</span></div>
              <div className="mt-6 rounded-xl border border-[#144a2e] bg-black/40 p-4"><p className="font-mono2 text-xs text-[#FFD35A]">COMEIA + WEB3.1</p><p className="mt-2 leading-relaxed">Casa viva onde se cria, se protege e se aprende.</p></div>
            </div>
            <div className="panel p-5 sm:p-6">
              <p className="kicker">Esquadrão das Cores</p>
              <p className="mt-3 text-xl font-black">Ninguém decide sozinho.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{squad.map(s=>(<div key={s.name} className="rounded-xl border border-[#1e2e25] bg-black/40 p-3 text-center"><s.icon className="mx-auto h-5 w-5" style={{color:s.color}} /><p className="mt-2 text-xs font-black">{s.name}</p><p className="text-[11px] text-[#9bb3a6]">{s.role}</p></div>))}</div>
              <p className="mt-3 text-center font-mono2 text-[11px] text-[#9bb3a6]">NEXUS conecta · SENSEI conduz · ALICE pesquisa · DOLA cria · CHAT analisa · MINI finaliza</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="panel flex items-center gap-4 p-5"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-black"><Bot className="h-9 w-9" /></div><div><p className="font-mono2 text-[11px] tracking-[.18em] text-[#00FF88]">BABY · ROBÔ VERDE</p><h3 className="text-lg font-black">Módulo de Leitura e Aprendizado</h3><p className="text-sm text-[#9bb3a6]">Só SENSEI edita. BABY lê, aprende e guarda — não decide sozinho.</p></div></div>
            <div className="panel flex items-center gap-4 p-5"><div className="heart-galaxy shrink-0"><Heart className="h-8 w-8 fill-white text-white" /></div><div><p className="font-mono2 text-[11px] tracking-[.18em] text-[#FFD35A]">CORAÇÃO GALÁXIA</p><h3 className="text-lg font-black">Coração da COMEIA</h3><p className="text-sm text-[#9bb3a6]">Proteção é sua maior força.</p></div></div>
          </div>
          <div className="mt-4"><p className="mb-3 flex items-center gap-2 font-mono2 text-xs tracking-[.18em] text-[#9bb3a6]"><Eye className="h-4 w-4 text-[#00FF88]" /> 12 ÁREAS DA COMEIA</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{areas.map((a,i)=>(<div key={a.n} className="flex items-center gap-3 rounded-xl border border-[#1e2e25] bg-[#070b09] px-3 py-3"><span className="font-mono2 text-xs text-[#00FF88]">{String(i+1).padStart(2,"0")}</span><a.icon className="h-4 w-4 shrink-0 text-[#FFD35A]" /><span className="text-xs font-bold [overflow-wrap:anywhere]">{a.n}</span></div>))}</div></div>
        </section>

        {/* 03 */}
        <section id="secao-03" className="mt-12">
          <div className="flex items-end gap-4"><span className="section-num">03</span><div><p className="kicker">Seção 03</p><h2 className="text-3xl font-black leading-tight sm:text-5xl">MARKET NEWS<br />3 GRÁFICOS <span className="gold-text">REAIS</span></h2></div></div>
          <div className="panel mt-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><span className="chip bg-[#00FF88] text-black border-[#00FF88] font-bold">● Snapshot real · 25/11/2026 · 16:34 UTC</span><span className="font-mono2 text-[11px] text-[#9bb3a6]">Fonte: Binance / Finnhub · Conteúdo educacional, não é recomendação financeira</span></div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#4a3a12] bg-black p-4"><div className="flex justify-between"><span className="font-black"><span className="text-[#FFD35A]">₿</span> BTC</span><span className="font-mono2 text-[11px] text-[#9bb3a6]">Bitcoin</span></div><p className="mt-3 text-2xl font-black">$58,604.01</p><p className="mt-1 flex items-center gap-1 font-mono2 text-sm text-[#ff5d73]"><TrendingDown className="h-4 w-4" /> -1.66%</p></div>
              <div className="rounded-2xl border border-[#3b2f5a] bg-black p-4"><div className="flex justify-between"><span className="font-black"><span className="text-[#a78bfa]">Ξ</span> ETH</span><span className="font-mono2 text-[11px] text-[#9bb3a6]">Ethereum</span></div><p className="mt-3 text-2xl font-black">$1,645.65</p><p className="mt-1 flex items-center gap-1 font-mono2 text-sm text-[#ff5d73]"><TrendingDown className="h-4 w-4" /> -1.56%</p></div>
              <div className="rounded-2xl border border-[#144a2e] bg-black p-4"><div className="flex justify-between"><span className="font-black"><span className="text-[#00FF88]">₮</span> USDT</span><span className="font-mono2 text-[11px] text-[#9bb3a6]">Tether</span></div><p className="mt-3 text-2xl font-black">$0.9989</p><p className="mt-1 flex items-center gap-1 font-mono2 text-sm text-[#ff5d73]"><TrendingDown className="h-4 w-4" /> -0.05%</p></div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="panel-gold p-4"><div className="flex items-center justify-between"><h3 className="font-black text-[#FFD35A]">BTC / USD</h3><span className="font-mono2 text-xs text-[#ff5d73]">▼ -1.66%</span></div><ChartCanvas data={btc} color="#FFD35A" title="BTC" /><p className="font-mono2 text-[11px] leading-relaxed text-[#9bb3a6]">22/11 $61,271 → 25/11 $58,604.01 · queda em 4 dias.</p></div>
              <div className="panel p-4 !border-[#3b2f5a]"><div className="flex items-center justify-between"><h3 className="font-black text-[#a78bfa]">ETH / USD</h3><span className="font-mono2 text-xs text-[#ff5d73]">▼ -1.56%</span></div><ChartCanvas data={eth} color="#a78bfa" title="ETH" /><p className="font-mono2 text-[11px] leading-relaxed text-[#9bb3a6]">22/11 $1,724 → 25/11 $1,645.65 · movimento em escada.</p></div>
              <div className="panel-neon p-4"><div className="flex items-center justify-between"><h3 className="font-black text-[#00FF88]">USDT / USD</h3><span className="font-mono2 text-xs text-[#ff5d73]">▼ -0.05%</span></div><ChartCanvas data={usdt} color="#00FF88" title="USDT" /><p className="font-mono2 text-[11px] leading-relaxed text-[#9bb3a6]">Linha quase reta perto de $1,00: $0.9990 → $0.9989.</p></div>
            </div>
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="flex items-center gap-2 font-black"><Clock3 className="h-5 w-5 text-[#00FF88]" /> RELÓGIO MUNDIAL SINCRONIZADO</h3><span className="chip text-[#00FF88]">✓ Gráficos sincronizados com o relógio</span></div>
              <p className="mt-2 font-mono2 text-[11px] text-[#9bb3a6]">O relógio anda a cada segundo. O preço é fixo: é o snapshot de 25/11/2026, 16:34 UTC.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <ClockCard city="Brasília" zone="America/Sao_Paulo" code="BRT" />
                <ClockCard city="Nova Iorque" zone="America/New_York" code="EST" />
                <ClockCard city="Los Angeles" zone="America/Los_Angeles" code="PST" />
                <ClockCard city="Londres / Lisboa" zone="Europe/London" code="GMT" />
                <ClockCard city="Tóquio" zone="Asia/Tokyo" code="JST" />
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-[#1e2e25] pt-6 text-center">
          <p className="text-lg font-black">CRYPY-WEB3.1 <span className="neon-text">♥</span> System by CryptoëCrypto</p>
          <p className="mt-2 font-mono2 text-sm text-[#9bb3a6]"><a href="https://cryptoecrypto.com.br" target="_blank" rel="noopener" className="underline decoration-[#00FF88] underline-offset-4">cryptoecrypto.com.br</a> · MODO REAL · 01 APRESENTAÇÃO · 02 FUSÃO · 03 MARKET NEWS</p>
          <p className="mt-3 text-xs leading-relaxed text-[#6f8a7c]">Conteúdo educacional. Os preços acima são um snapshot fixo de 25/11/2026, 16:34 UTC e não são recomendação financeira.</p>
        </footer>
      </main>
    </div>
  );
}
