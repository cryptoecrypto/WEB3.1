import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowDownUp, Clock3, Download, ExternalLink, Eye, RefreshCw, Search, WifiOff, Zap } from "lucide-react";

type Token = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  color: string;
  pair: string;
};

const TOKENS: Token[] = [
  { symbol: "BTC", name: "Bitcoin", price: 61359, change: 0.73, color: "#F7931A", pair: "BTCUSDT" },
  { symbol: "ETH", name: "Ethereum", price: 1718, change: 0.83, color: "#7A8DFF", pair: "ETHUSDT" },
  { symbol: "USDT", name: "Tether", price: 0.9991, change: 0.01, color: "#26A17B", pair: "USDTUSD" },
  { symbol: "BNB", name: "BNB", price: 560.3, change: 0.36, color: "#F0B90B", pair: "BNBUSDT" },
  { symbol: "ICP", name: "Internet Computer", price: 2.005, change: 0.8, color: "#29ABE2", pair: "ICPUSDT" },
  { symbol: "SHIB", name: "Shiba Inu", price: 0.00000365, change: 0.55, color: "#FF6B35", pair: "SHIBUSDT" },
];

type Material = { n: string; title: string; file: string; bytes: string; human: string; };

const MATERIALS: Material[] = [
  { n: "01", title: "BABY-APRENDIZADO", file: "baby-aprendizado-inject.html", bytes: "3.905 bytes", human: "3,81 KB" },
  { n: "02", title: "HOME-MATRIX-INDEX5", file: "home-matrix-index5.html", bytes: "16.366 bytes", human: "15,98 KB" },
  { n: "03", title: "COMEIA-WEB31", file: "comeia-web31.html", bytes: "3.120.867 bytes", human: "2,98 MB" },
  { n: "04", title: "HOME-MATRIX-CRYPY", file: "home-matrix-crypy.html", bytes: "343.875 bytes", human: "335,81 KB" },
  { n: "05", title: "BACKUP-ANTES-FUSAO", file: "backup-antes-fusao.html", bytes: "13.342.095 bytes", human: "12,72 MB" },
  { n: "06", title: "CRYPY-WEB31-PURO", file: "CRYPY-WEB31-HTML-PURO-SEM-MENSAGEM.html", bytes: "6.358.338 bytes", human: "6,06 MB" },
  { n: "07", title: "FUSAO-V4-CORRIGIDA", file: "FUSAO-V4-CORRIGIDA-ABRE-NA-HORA.html", bytes: "13.345.049 bytes", human: "12,73 MB" },
];

function formatPrice(v: number) {
  if (v >= 1000) return `$${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (v >= 1) return `$${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  if (v >= 0.01) return `$${v.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  return `$${v.toLocaleString("pt-BR", { minimumFractionDigits: 8, maximumFractionDigits: 8 })}`;
}
function brTime(d = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Sao_Paulo" }).format(d);
}
function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * f)));
  return `rgb(${r},${g},${b})`;
}

export default function App() {
  const [selected, setSelected] = useState("BTC");
  const [angle, setAngle] = useState(0.35);
  const [zoom, setZoom] = useState(1);
  const [countdown, setCountdown] = useState(60);
  const [lastUpdate, setLastUpdate] = useState(() => brTime());
  const [updateNote, setUpdateNote] = useState("");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<{ file: string; action: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; angle: number } | null>(null);
  const hitsRef = useRef<{ x: number; y: number; w: number; h: number; symbol: string }[]>([]);
  const selectedToken = TOKENS.find((t) => t.symbol === selected) ?? TOKENS[0];

  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown((c) => (c <= 1 ? 60 : c - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // 3D-like pillars drawn in canvas (sem CDN, sem Three.js externo)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // grade / chão
    ctx.strokeStyle = "rgba(0,245,138,.14)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = 28 + (i / 10) * (h - 58);
      ctx.beginPath(); ctx.moveTo(18, y); ctx.lineTo(w - 18, y); ctx.stroke();
    }
    const cx = w / 2, baseY = h - 48;
    const logs = TOKENS.map((t) => Math.log10(t.price));
    const min = Math.min(...logs), max = Math.max(...logs);
    const items = TOKENS.map((t, i) => {
      const a = angle + (i * Math.PI * 2) / TOKENS.length;
      const px = cx + Math.cos(a) * (w * 0.34 * zoom);
      const py = baseY - Math.abs(Math.sin(a)) * (h * 0.12);
      const norm = (Math.log10(t.price) - min) / (max - min);
      const ph = (38 + norm * (h * 0.42)) * zoom;
      return { t, px, py, ph, depth: Math.sin(a), a };
    }).sort((a, b) => a.depth - b.depth);
    hitsRef.current = [];
    for (const it of items) {
      const bw = Math.max(42, Math.min(78, w / 9.2) * zoom);
      const depth = 14 * zoom;
      const x = it.px - bw / 2, y = it.py - it.ph;
      const isSel = it.t.symbol === selected;
      if (isSel) {
        ctx.fillStyle = "rgba(0,245,138,.13)";
        ctx.beginPath(); ctx.ellipse(it.px, it.py + 16, bw * 0.9, 11, 0, 0, Math.PI * 2); ctx.fill();
      }
      // topo
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + depth, y - depth * 0.55); ctx.lineTo(x + bw + depth, y - depth * 0.55); ctx.lineTo(x + bw, y); ctx.closePath();
      ctx.fillStyle = shade(it.t.color, 1.35); ctx.fill();
      // lateral
      ctx.beginPath();
      ctx.moveTo(x + bw, y); ctx.lineTo(x + bw + depth, y - depth * 0.55); ctx.lineTo(x + bw + depth, y + it.ph - depth * 0.55); ctx.lineTo(x + bw, y + it.ph); ctx.closePath();
      ctx.fillStyle = shade(it.t.color, 0.55); ctx.fill();
      // frente
      ctx.fillStyle = it.t.color; ctx.fillRect(x, y, bw, it.ph);
      ctx.strokeStyle = isSel ? "#00F58A" : "rgba(0,0,0,.42)"; ctx.lineWidth = isSel ? 3 : 1; ctx.strokeRect(x, y, bw, it.ph);
      // rótulo
      ctx.fillStyle = "#fff"; ctx.font = `800 ${Math.max(12, 13 * zoom)}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(it.t.symbol, x + bw / 2, y + 21);
      ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.font = `600 ${Math.max(9, 10 * zoom)}px system-ui`;
      ctx.fillText(it.t.change > 0 ? `+${it.t.change.toFixed(2)}%` : `${it.t.change.toFixed(2)}%`, x + bw / 2, y + 38);
      ctx.fillStyle = "#9ec7b3"; ctx.font = "600 11px system-ui";
      ctx.fillText(it.t.symbol, it.px, it.py + 32);
      hitsRef.current.push({ x: x - 4, y: y - 18, w: bw + depth + 8, h: it.ph + 48, symbol: it.t.symbol });
    }
    ctx.fillStyle = "#6f8f7f"; ctx.font = "600 11px system-ui"; ctx.textAlign = "center";
    ctx.fillText("Altura pelo log do preço  •  Arraste para girar  •  Role para zoom  •  Clique num pilar", cx, 20);
  }, [angle, zoom, selected]);

  // fita de histórico — sem rede, mostra estado offline, sem inventar klines
  useEffect(() => {
    const canvas = historyRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(0,245,138,.16)";
    for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, (h / 6) * i); ctx.lineTo(w, (h / 6) * i); ctx.stroke(); }
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#d7ffec"; ctx.font = "700 13px system-ui"; ctx.textAlign = "center";
    ctx.fillText(`HISTÓRICO 1H • ${selectedToken.symbol} — INDISPONÍVEL OFFLINE`, w / 2, h / 2 - 8);
    ctx.fillStyle = "#8fb0a0"; ctx.font = "500 11px system-ui";
    ctx.fillText("Último preço salvo preservado abaixo. Nenhuma linha inventada.", w / 2, h / 2 + 12);
  }, [selectedToken]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); setZoom((z) => Math.min(1.45, Math.max(0.72, z + (e.deltaY < 0 ? 0.08 : -0.08)))); };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MATERIALS;
    return MATERIALS.filter((m) => `${m.title} ${m.file}`.toLowerCase().includes(q));
  }, [query]);

  const refreshNow = () => {
    setCountdown(60);
    setUpdateNote(`Tentativa às ${brTime()} — atualização ao vivo indisponível neste ambiente. Mantidos os últimos preços salvos de 27/11/2026.`);
  };

  const onPointerDown = (e: React.PointerEvent) => { setDragging(true); dragRef.current = { x: e.clientX, angle }; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onPointerMove = (e: React.PointerEvent) => { if (!dragRef.current) return; setAngle(dragRef.current.angle + (e.clientX - dragRef.current.x) * 0.008); };
  const onPointerUp = (e: React.PointerEvent) => { setDragging(false); dragRef.current = null; };
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const hit = hitsRef.current.find((h) => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h);
    if (hit) setSelected(hit.symbol);
  };

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", minHeight: "100vh", background: "#000" }} className="overflow-x-clip">
      <div className="mx-auto w-full max-w-[1180px] px-3 pb-10 sm:px-5 lg:px-8">
        {/* TOPO */}
        <header className="pt-5 sm:pt-7">
          <div className="flex items-center gap-2">
            <span className="mono inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[#07130d] px-2.5 py-1 text-[11px] font-bold tracking-[0.18em] text-[var(--neon)]"><span className="h-2 w-2 rounded-full bg-[var(--neon)]" /> CRYPY • PAINEL</span>
            <span className="mono hidden text-[11px] tracking-[0.18em] text-[#6f8f7f] sm:inline">MATERIAIS EXATOS + PREÇO 3D</span>
          </div>
          <h1 className="mt-4 text-[clamp(1.9rem,7vw,4.2rem)] font-black leading-[0.95] tracking-tight [overflow-wrap:anywhere]">CRYPY <span className="text-[var(--neon)]">♾️</span> PAINEL<br />DE CONTROLE</h1>
          <p className="mt-3 max-w-[820px] text-[15px] leading-relaxed text-[#c8e8d8]">Conteúdo recortado da home, inteiro, sem misturar e sem alterar. Clique em <strong className="text-[var(--neon)]">ABRIR EXATO</strong> para ver cada HTML do jeito que ele é, isolado.</p>
        </header>

        {/* PAINEL DE PREÇO 3D */}
        <section aria-label="Painel de preço 3D" className="mt-7 overflow-hidden rounded-[22px] border border-[var(--line)] bg-[#050a07] shadow-[0_0_0_1px_rgba(0,245,138,0.08),0_24px_70px_rgba(0,245,138,0.08)]">
          <div className="flex flex-col gap-4 border-b border-[var(--line)] bg-[#07130d] p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
            <div>
              <div className="mono text-[11px] font-bold tracking-[0.22em] text-[var(--neon)]">PAINEL DE PREÇO 3D REAL</div>
              <h2 className="mt-1 text-[clamp(1.35rem,5vw,2.1rem)] font-black leading-none">MERCADO <span className="text-[var(--neon)]">AO VIVO*</span></h2>
              <p className="mt-2 text-[12px] text-[#8fb0a0]">* Preços-base salvos em 27/11/2026 — Binance. A atualização automática pela rede está bloqueada neste ambiente.</p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2a130f] px-3 py-1.5 text-[11px] font-bold text-[#ffb3b3]"><WifiOff size={14} /> SEM INTERNET — ÚLTIMO PREÇO SALVO</span>
              <div className="mono text-[12px] text-[#c8e8d8]">Última atualização: <strong>{lastUpdate}</strong> Brasília</div>
              <div className="mono text-[12px] text-[#8fb0a0]">próxima em <strong className="text-[var(--neon)]">{countdown}s</strong></div>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <div className="relative overflow-hidden rounded-2xl border border-[#173326] bg-[radial-gradient(circle_at_50%_0%,#0d2a1c_0%,#020604_62%)]">
              <canvas
                ref={canvasRef}
                onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onClick={onCanvasClick}
                className="h-[300px] w-full cursor-grab touch-none sm:h-[360px]"
                style={{ touchAction: "none" }}
                role="img" aria-label={`Pilares 3D de preços. Token selecionado: ${selectedToken.symbol}. Arraste para girar.`}
              />
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                {TOKENS.map((t) => <button key={t.symbol} onClick={() => setSelected(t.symbol)} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${selected === t.symbol ? "border-[var(--neon)] bg-[var(--neon)] text-black" : "border-white/15 bg-black/55 text-white"}`}>{t.symbol}</button>)}
              </div>
              <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-[11px] text-[#9ec7b3]">{dragging ? "Girando…" : "Arraste • Role p/ zoom • Clique"} • Zoom {Math.round(zoom * 100)}%</div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={refreshNow} className="inline-flex items-center gap-2 rounded-full bg-[var(--neon)] px-4 py-2.5 text-[13px] font-black text-black"><RefreshCw size={16} /> ATUALIZAR AGORA</button>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#8fb0a0]"><Clock3 size={14} /> Ciclo de 60s • sem inventar cotação</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#8fb0a0]"><ArrowDownUp size={14} /> Selecionado: <strong className="text-white">{selectedToken.symbol} — {selectedToken.name}</strong></span>
            </div>
            {updateNote && <p role="status" className="mt-3 rounded-xl border border-[#3a2a0b] bg-[#171204] px-3 py-2.5 text-[13px] leading-relaxed text-[#ffe9ad]">{updateNote}</p>}

            {/* CARDS */}
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              {TOKENS.map((t) => {
                const active = selected === t.symbol;
                return (
                  <button key={t.symbol} onClick={() => setSelected(t.symbol)} aria-pressed={active} className={`min-w-0 rounded-2xl border p-3 text-left transition ${active ? "border-[var(--neon)] bg-[#0d2a1c] shadow-[0_0_24px_rgba(0,245,138,0.22)]" : "border-[var(--line)] bg-[#0a120d] hover:border-[#2d5a40]"}`}>
                    <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 font-black"><span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />{t.symbol}</span><span className="text-[11px] text-[#8fb0a0]">{t.name}</span></div>
                    <div className="mono mt-3 text-[17px] font-black leading-none [overflow-wrap:anywhere] sm:text-[19px]">{formatPrice(t.price)}</div>
                    <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${t.change >= 0 ? "bg-[#0f2a1a] text-[var(--neon)]" : "bg-[#2a0f14] text-[#ff8a9a]"}`}>{t.change >= 0 ? "▲" : "▼"} {t.change >= 0 ? "+" : ""}{t.change.toFixed(2)}% • 24h</div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-2 text-[11px]"><div><dt className="text-[#8fb0a0]">Máx. 24h</dt><dd className="mono font-bold">—</dd></div><div><dt className="text-[#8fb0a0]">Mín. 24h</dt><dd className="mono font-bold">—</dd></div></dl>
                    <div className="mt-2 text-[11px] text-[#6f8f7f]">Par: {t.pair} • {active ? "SELECIONADO" : "Clique p/ selecionar"}</div>
                  </button>
                );
              })}
            </div>

            {/* HISTÓRICO */}
            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[#071009] p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="mono text-[11px] font-bold tracking-[0.18em] text-[var(--neon)]">FITA DE HISTÓRICO • 1H</div><h3 className="mt-1 text-[18px] font-black">{selectedToken.symbol}/USDT — {formatPrice(selectedToken.price)} <span className="text-[var(--neon)]">+{selectedToken.change.toFixed(2)}%</span></h3></div><span className="rounded-full border border-[#3a2a0b] bg-[#171204] px-3 py-1 text-[11px] font-bold text-[#ffdf8a]">60 CANDLES • SEM REDE</span></div>
              <canvas ref={historyRef} className="mt-3 h-[118px] w-full rounded-xl bg-black/40" role="img" aria-label={`Histórico de 1 hora de ${selectedToken.symbol} indisponível offline`} />
              <p className="mt-2 text-[12px] text-[#8fb0a0]">Máx./Mín. 24h e klines 1h dependem da API da Binance. Sem rede neste ambiente, o painel preserva apenas os preços iniciais — sem desenhar uma série inventada.</p>
            </div>

            <div className="mt-4 flex flex-col gap-1 border-t border-[var(--line)] pt-3 text-[12px] text-[#8fb0a0] sm:flex-row sm:items-center sm:justify-between">
              <span>Conteúdo educacional. Não é recomendação financeira.</span><span>Fonte: Binance.</span>
            </div>
          </div>
        </section>

        {/* PAINEL DE MATERIAIS */}
        <section aria-label="Painel de materiais" className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="mono text-[11px] font-bold tracking-[0.22em] text-[var(--neon)]">PAINEL DE MATERIAIS</div><h2 className="mt-1 text-[clamp(1.5rem,6vw,2.5rem)] font-black leading-none">7 ARQUIVOS <span className="text-[var(--neon)]">EXATOS</span></h2><p className="mt-2 text-[13px] text-[#8fb0a0]">Mesma ordem do registro original. Nada misturado, nada reescrito.</p></div>
            <div className="flex items-center gap-2 text-[12px] text-[#8fb0a0]"><Zap size={14} className="text-[var(--neon)]" /> {filtered.length} de 7 exibidos</div>
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[#0a120d] px-3 py-3 focus-within:border-[var(--neon)]">
            <Search size={18} className="shrink-0 text-[var(--neon)]" /><span className="sr-only">Buscar no painel</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar no painel — ex.: FUSAO, COMEIA, HOME…" className="w-full bg-transparent text-[15px] text-white placeholder:text-[#617d6d] focus:outline-none" />
            {query && <button onClick={() => setQuery("")} className="shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-bold">LIMPAR</button>}
          </label>

          {notice && (
            <div role="status" className="mt-4 flex items-start gap-2 rounded-2xl border border-[#3a2a0b] bg-[#171204] px-4 py-3 text-[13px] leading-relaxed text-[#ffe9ad]">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" /><span><strong>Marcador de lugar — {notice.action}:</strong> Arquivo original não anexado aqui — este painel preserva o registro exato; anexe o arquivo para ligar o botão. <span className="mono [overflow-wrap:anywhere]">{notice.file}</span></span>
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filtered.map((m) => (
              <article key={m.file} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#0a120d] p-4">
                <div className="flex items-start justify-between gap-3"><span className="mono rounded-lg bg-[var(--neon)] px-2 py-1 text-[12px] font-black text-black">{m.n}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold tracking-wider text-[#8fb0a0]">EXATO • SEM MODIFICAR</span></div>
                <h3 className="mt-3 text-[18px] font-black leading-tight [overflow-wrap:anywhere]">{m.title}</h3>
                <p className="mono mt-2 text-[12px] leading-relaxed text-[#9ec7b3] [overflow-wrap:anywhere]">{m.file}</p>
                <p className="mono mt-1 text-[12px] text-[#8fb0a0]">{m.bytes} • {m.human}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => setNotice({ file: m.file, action: "ABRIR EXATO" })} className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--neon)] px-2 py-3 text-[12px] font-black text-black sm:text-[13px]"><Eye size={16} /> ABRIR EXATO</button>
                  <button onClick={() => setNotice({ file: m.file, action: "BAIXAR EXATO" })} className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--yellow)] px-2 py-3 text-[12px] font-black text-black sm:text-[13px]"><Download size={16} /> BAIXAR EXATO</button>
                </div>
                <p className="mt-2 flex items-center gap-1 text-[11px] text-[#617d6d]"><ExternalLink size={12} /> Botão marcador de lugar — aguarda o arquivo original.</p>
              </article>
            ))}
          </div>
          {filtered.length === 0 && <div className="mt-4 rounded-2xl border border-dashed border-[var(--line)] p-6 text-center text-[#8fb0a0]">Nenhum material encontrado para “<strong className="text-white [overflow-wrap:anywhere]">{query}</strong>”. Limpe a busca para ver os 7 itens.</div>}

          <footer className="mt-6 rounded-2xl border border-[var(--line)] bg-[#07130d] p-4 text-[13px] leading-relaxed text-[#c8e8d8]">
            <strong className="text-[var(--neon)]">FIM INJEÇÃO EXATA:</strong> 2 arquivos vazios registrados como vazios: <span className="mono [overflow-wrap:anywhere]">index_07719f.html (2 bytes)</span> e <span className="mono [overflow-wrap:anywhere]">index4.html (2 bytes)</span> — preservados como vazios, sem inventar conteúdo.
          </footer>
          <p className="mt-4 text-center text-[11px] text-[#617d6d]">CRYPY ♾️ • Painel de controle • Registro exato • Sem conteúdo inventado</p>
        </section>
      </div>
    </div>
  );
}
