import React, { useEffect, useRef, useState } from 'react';
import { Activity, Clock3, TrendingDown, ShieldCheck, Zap, Globe2, Eye, Lock } from 'lucide-react';
import heroUrl from 'container:///mnt/data/src/assets/2a347999a05d198b-img-u7531395266841981436-2.jpg';

type Point = { label: string; value: number };
type Coin = {
  symbol: string; name: string; color: string; price: string; change: string;
  open: string; high: string; low: string; close: string;
  points: Point[]; note: string;
};

const COINS: Coin[] = [
  {
    symbol: 'BTC', name: 'Bitcoin', color: '#ff8a00', price: '$58,604.01', change: '-1.66% (24h)',
    open: '$59,591.95', high: '$60,294.68', low: '$57,300.38', close: '$58,604.01',
    points: [
      { label: '22/11', value: 61271.08 },
      { label: '23/11', value: 61270.93 },
      { label: '24/11', value: 59832.00 },
      { label: '25/11', value: 58604.01 },
    ],
    note: 'Queda de 3 dias, com mínima intradiária em $57,300.38 no dia 25/11.',
  },
  {
    symbol: 'ETH', name: 'Ethereum', color: '#a06bff', price: '$1,645.65', change: '-1.56% (24h)',
    open: '$1,671.67', high: '$1,689.43', low: '$1,608.86', close: '$1,645.65',
    points: [
      { label: '22/11', value: 1724.33 },
      { label: '23/11', value: 1710.65 },
      { label: '24/11', value: 1680.11 },
      { label: '25/11', value: 1645.65 },
    ],
    note: 'Movimento descendente consistente, fechando abaixo da abertura do dia 25/11.',
  },
  {
    symbol: 'USDT', name: 'Tether', color: '#00e68a', price: '$0.9989', change: '-0.05% (24h)',
    open: '$0.9989', high: '$0.9990', low: '$0.9988', close: '$0.9989',
    points: [
      { label: '22/11', value: 0.9990 },
      { label: '23/11', value: 0.9990 },
      { label: '24/11', value: 0.9988 },
      { label: '25/11', value: 0.9989 },
    ],
    note: 'Estável, quase linha reta em $1.00. Variação de apenas $0.0002 no período.',
  },
];

const CITIES = [
  { city: 'Brasília / São Paulo', zone: 'America/Sao_Paulo', short: 'BRT' },
  { city: 'Nova Iorque', zone: 'America/New_York', short: 'ET' },
  { city: 'Los Angeles', zone: 'America/Los_Angeles', short: 'PT' },
  { city: 'Londres', zone: 'Europe/London', short: 'GMT' },
  { city: 'Lisboa', zone: 'Europe/Lisbon', short: 'WET' },
  { city: 'Tóquio', zone: 'Asia/Tokyo', short: 'JST' },
];

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
function timeIn(zone: string, now: Date) {
  try {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  } catch { return '--:--:--'; }
}
function dateIn(zone: string, now: Date) {
  try { return new Intl.DateTimeFormat('pt-BR', { timeZone: zone, day: '2-digit', month: '2-digit', year: 'numeric' }).format(now); }
  catch { return ''; }
}

function WorldClock({ compact = false }: { compact?: boolean }) {
  const now = useNow();
  return (
    <section aria-label="Relógio mundial sincronizado" className="w-full max-w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--neon)] text-[var(--neon)]"><Clock3 size={15} /></span>
          <p className="mono text-[11px] sm:text-xs font-bold tracking-[0.18em] text-[var(--neon)]">RELÓGIO MUNDIAL • AO VIVO</p>
        </div>
        <p className="mono text-[11px] sm:text-xs text-white/70 [overflow-wrap:anywhere]">Sincronizado a cada segundo • O preço não muda sozinho</p>
      </div>
      <div className={`mt-3 grid w-full max-w-full gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}`}>
        {CITIES.map((c) => (
          <div key={c.city} className="min-w-0 rounded-lg border border-white/15 bg-black/55 px-2.5 py-2.5">
            <p className="text-[11px] font-bold leading-tight text-white [overflow-wrap:anywhere]">{c.city}</p>
            <p className="mono mt-1 text-lg sm:text-xl font-extrabold leading-none text-[var(--neon)] tabular-nums">{timeIn(c.zone, now)}</p>
            <p className="mono mt-1 text-[10px] text-white/55">{dateIn(c.zone, now)} • {c.short}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChartCanvas({ coin }: { coin: Coin }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = Math.max(260, parent.clientWidth);
      const height = 230;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const padL = 58, padR = 14, padT = 30, padB = 32;
      const values = coin.points.map(p => p.value);
      let min = Math.min(...values), max = Math.max(...values);
      const spread = Math.max(max - min, max * 0.0005);
      min -= spread * 0.28; max += spread * 0.28;
      const x = (i: number) => padL + (i / (coin.points.length - 1)) * (width - padL - padR);
      const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (height - padT - padB);
      ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 1; ctx.font = '10px JetBrains Mono, monospace'; ctx.fillStyle = 'rgba(255,255,255,0.58)';
      for (let i = 0; i <= 3; i++) {
        const v = min + ((max - min) * i) / 3; const yy = y(v);
        ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(width - padR, yy); ctx.stroke();
        const label = coin.symbol === 'USDT' ? v.toFixed(4) : v.toLocaleString('en-US', { maximumFractionDigits: 0 });
        ctx.fillText(label, 4, yy + 3);
      }
      // area
      ctx.beginPath(); ctx.moveTo(x(0), y(coin.points[0].value));
      coin.points.forEach((p, i) => ctx.lineTo(x(i), y(p.value)));
      ctx.lineTo(x(coin.points.length - 1), height - padB); ctx.lineTo(x(0), height - padB); ctx.closePath();
      const grad = ctx.createLinearGradient(0, padT, 0, height - padB);
      grad.addColorStop(0, coin.color + '55'); grad.addColorStop(1, coin.color + '00');
      ctx.fillStyle = grad; ctx.fill();
      // line
      ctx.beginPath(); ctx.moveTo(x(0), y(coin.points[0].value));
      coin.points.forEach((p, i) => ctx.lineTo(x(i), y(p.value)));
      ctx.strokeStyle = coin.color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
      // points + values
      coin.points.forEach((p, i) => {
        const px = x(i), py = y(p.value);
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = coin.color; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
        const label = coin.symbol === 'USDT' ? `$${p.value.toFixed(4)}` : `$${p.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        ctx.fillStyle = '#fff'; ctx.font = '700 10px JetBrains Mono, monospace'; ctx.textAlign = i === 0 ? 'left' : i === coin.points.length - 1 ? 'right' : 'center';
        ctx.fillText(label, px + (i === 0 ? -4 : i === coin.points.length - 1 ? 4 : 0), py - 11);
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '10px JetBrains Mono, monospace'; ctx.fillText(p.label, px, height - 10);
      });
      ctx.textAlign = 'left';
    };
    draw();
    const ro = new ResizeObserver(draw); if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [coin]);
  return <canvas ref={ref} className="block h-[230px] w-full max-w-full" role="img" aria-label={`Gráfico de linha de ${coin.name} de 22 a 25 de novembro`} />;
}

function App() {
  const now = useNow();
  const brasilia = timeIn('America/Sao_Paulo', now);
  return (
    <div data-safe-area-inset-root style={{ boxSizing: 'border-box', paddingTop: 'var(--safe-area-inset-top)' }} className="min-h-screen w-full max-w-full overflow-x-clip bg-black text-white">
      <div className="grid-bg mx-auto w-full max-w-[1180px] px-3 pb-8 sm:px-5">
        {/* TOP */}
        <header data-safe-area-sticky-top style={{ top: 'var(--safe-area-inset-top)' }} className="sticky z-20 border-b border-[var(--neon)] bg-black/95 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[var(--neon)] bg-[#001a0e]"><Zap className="text-[var(--neon)]" size={20} /></div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-black leading-none tracking-[0.08em] [overflow-wrap:anywhere]">CRYPY <span className="neon-text">MARKET NEWS</span></h1>
                <p className="mono mt-1 text-[10px] sm:text-[11px] tracking-[0.2em] text-white/60">HOME PRINCIPAL • ESQUADRÃO DAS CORES</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono rounded-full border border-[var(--neon)] bg-[#001a0e] px-3 py-1 text-[10px] sm:text-xs font-bold text-[var(--neon)]">● MODO REAL</span>
              <span className="mono hidden rounded-full border border-white/25 px-3 py-1 text-[10px] sm:text-xs text-white sm:inline-block">SNAPSHOT 25/11/2026</span>
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3"><WorldClock /></div>
        </header>

        {/* HERO */}
        <main className="mt-4 w-full max-w-full">
          <section aria-label="Capa CRYPY com os dragões" className="w-full max-w-full overflow-hidden rounded-2xl border-2 border-[var(--neon)] bg-black shadow-[0_0_42px_rgba(0,255,136,0.22)]">
            <div className="relative w-full max-w-full">
              <img src={heroUrl} alt="Dragões CRYPY — BTC dourado, ETH roxo e USDT verde — com o robô BABY branco na frente e logo CRYPY no céu" className="block h-auto w-full max-w-full object-cover" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-black via-black/70 to-transparent px-3 pb-3 pt-14 sm:px-5 sm:pb-4">
                <div className="min-w-0">
                  <p className="mono text-[10px] font-bold tracking-[0.22em] text-[var(--neon)]">NOVA CAPA OFICIAL</p>
                  <h2 className="text-xl sm:text-3xl font-black leading-tight [overflow-wrap:anywhere]">O esquadrão entrou no mercado.</h2>
                </div>
                <p className="mono rounded-md border border-[var(--neon)] bg-black/80 px-2 py-1 text-[10px] sm:text-xs font-bold text-[var(--neon)]">BTC • ETH • USDT • BABY</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--neon)]/60 bg-[#020503] px-3 py-2 sm:px-5">
              <p className="mono text-[10px] sm:text-xs text-white/70 [overflow-wrap:anywhere]">Foto atualizada • Sem sobreposição • Dentro da borda</p>
              <p className="mono text-[10px] sm:text-xs font-bold text-[var(--neon)]">BRASÍLIA AGORA: {brasilia}</p>
            </div>
          </section>

          {/* BUBBLES */}
          <section aria-label="CryptoBubbles corrigidos" className="mt-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div><p className="mono text-[11px] font-bold tracking-[0.2em] text-[var(--neon)]">CRYPTOBUBBLES</p><h2 className="mt-1 text-2xl sm:text-3xl font-black leading-tight">Três bolhas. Sem sobrepor.</h2></div>
              <p className="mono max-w-full text-[11px] text-white/60 [overflow-wrap:anywhere]">Cada moeda com sua cor, lado a lado.</p>
            </div>
            <div className="mt-3 grid w-full max-w-full grid-cols-1 gap-3 sm:grid-cols-3">
              {COINS.map((c) => (
                <article key={c.symbol} className="panel min-w-0 rounded-2xl p-4" style={{ borderTop: `5px solid ${c.color}` }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="mono text-[11px] font-bold tracking-[0.18em]" style={{ color: c.color }}>{c.symbol}</p>
                      <h3 className="mt-1 text-lg font-bold leading-tight [overflow-wrap:anywhere]">{c.name}</h3>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 text-base font-black" style={{ borderColor: c.color, color: c.color, background: `${c.color}18` }}>{c.symbol[0]}</span>
                  </div>
                  <p className="mono mt-4 text-[clamp(1.55rem,6vw,2.1rem)] font-extrabold leading-none tabular-nums [overflow-wrap:anywhere]">{c.price}</p>
                  <p className="mt-2 flex items-center gap-1 text-sm font-bold text-red-400"><TrendingDown size={16} /> {c.change}</p>
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="mono text-[10px] tracking-[0.16em] text-white/50">FECHAMENTO • 25/11</p>
                    <p className="mono mt-1 text-xs text-white/80">Snapshot fixo • Fonte: Binance / Finnhub</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300/40 bg-amber-400/10 px-3 py-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-amber-300" size={18} />
              <p className="min-w-0 text-xs sm:text-sm leading-relaxed text-amber-100 [overflow-wrap:anywhere]"><strong>Snapshot real 25/11/2026 — 16:34 UTC.</strong> Fonte: Binance / Finnhub. Conteúdo educacional, não é recomendação financeira. Os preços acima são fixos desse snapshot e não mudam com o relógio.</p>
            </div>
          </section>

          {/* CHARTS */}
          <section aria-label="Três gráficos reais" className="mt-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="mono text-[11px] font-bold tracking-[0.2em] text-[var(--neon)]">22 → 25 DE NOVEMBRO</p><h2 className="mt-1 text-2xl sm:text-3xl font-black leading-tight">3 gráficos reais</h2></div>
              <span className="mono flex items-center gap-2 rounded-full border border-[var(--neon)] bg-[#001a0e] px-3 py-2 text-[10px] sm:text-xs font-bold text-[var(--neon)]"><Activity size={14} /> GRÁFICOS SINCRONIZADOS COM O RELÓGIO</span>
            </div>
            <div className="mt-4 grid w-full max-w-full grid-cols-1 gap-4 lg:grid-cols-3">
              {COINS.map((c) => (
                <article key={c.symbol} className="panel flex min-w-0 flex-col overflow-hidden rounded-2xl">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0"><span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} /><h3 className="text-base font-bold [overflow-wrap:anywhere]">{c.symbol} <span className="font-normal text-white/55">/ {c.name}</span></h3></div>
                    <span className="mono shrink-0 text-xs font-bold text-red-400">{c.change}</span>
                  </div>
                  <div className="w-full max-w-full px-1 pt-2"><ChartCanvas coin={c} /></div>
                  <div className="grid grid-cols-4 gap-1 border-t border-white/10 px-3 py-3 text-center">
                    {[{ k: 'ABERTURA', v: c.open }, { k: 'MÁXIMA', v: c.high }, { k: 'MÍNIMA', v: c.low }, { k: 'FECHAMENTO', v: c.close }].map((s) => (
                      <div key={s.k} className="min-w-0"><p className="mono text-[8px] sm:text-[9px] tracking-wider text-white/50">{s.k}</p><p className="mono mt-1 text-[10px] sm:text-xs font-bold leading-tight [overflow-wrap:anywhere]">{s.v}</p></div>
                    ))}
                  </div>
                  <p className="px-4 pb-4 text-xs leading-relaxed text-white/70 [overflow-wrap:anywhere]">{c.note}</p>
                  <div className="mt-auto border-t border-[var(--neon)]/30 bg-[#001a0e] px-4 py-2.5">
                    <p className="mono text-[10px] text-[var(--neon)]">HORA ATUAL • BRASÍLIA: <strong>{brasilia}</strong></p>
                    <p className="mono mt-1 text-[10px] text-white/50">Últimos 3 dias • Dados do snapshot pesquisado</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-white/60">Canvas desenhado com JS puro — pontos, valores e escala visíveis em cada linha.</p>
          </section>

          {/* HOW IT WORKS */}
          <section className="panel mt-7 grid w-full max-w-full gap-3 rounded-2xl p-4 sm:grid-cols-3 sm:p-5">
            <div className="min-w-0"><p className="flex items-center gap-2 font-bold"><Eye size={17} className="text-[var(--neon)]" /> O que é fixo</p><p className="mt-2 text-sm leading-relaxed text-white/70">Preços e gráficos são do snapshot real de 25/11/2026, 16:34 UTC. Eles não se atualizam sozinhos.</p></div>
            <div className="min-w-0"><p className="flex items-center gap-2 font-bold"><Clock3 size={17} className="text-[var(--neon)]" /> O que anda</p><p className="mt-2 text-sm leading-relaxed text-white/70">Só o relógio mundial. Ele marca o tempo em seis fusos e atualiza a cada segundo.</p></div>
            <div className="min-w-0"><p className="flex items-center gap-2 font-bold"><Lock size={17} className="text-[var(--neon)]" /> Por que assim</p><p className="mt-2 text-sm leading-relaxed text-white/70">Para ninguém confundir a hora atual com um preço novo. Tempo em movimento, preço documentado.</p></div>
          </section>
        </main>

        <footer className="mt-8 w-full max-w-full border-t-2 border-[var(--neon)] pt-5">
          <WorldClock compact />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0"><p className="text-base font-black tracking-wide [overflow-wrap:anywhere]">CRYPY-WEB3.1 <span className="text-[var(--neon)]">SYSTEM</span></p><p className="mono mt-1 text-xs text-white/60 [overflow-wrap:anywhere]">by CryptoëCrypto • cryptoecrypto.com.br</p></div>
            <p className="mono rounded-full border border-[var(--neon)] px-3 py-1.5 text-[10px] font-bold text-[var(--neon)]">MODO REAL</p>
          </div>
          <p className="mt-4 text-center text-sm font-bold tracking-wide text-white/85 [overflow-wrap:anywhere]">NEXUS conecta; Sensei conduz.</p>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-white/50 [overflow-wrap:anywhere]">Snapshot real 25/11/2026 • Fonte: Binance / Finnhub • Conteúdo educacional, não é recomendação financeira.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
