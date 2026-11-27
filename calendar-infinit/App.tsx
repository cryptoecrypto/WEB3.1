import React, { useEffect, useMemo, useState } from "react";
import { Pause, Play, ChevronLeft, ChevronRight, CalendarDays, Clock3, Sparkles, Trash2, Plus, Filter, Gauge, X, Check } from "lucide-react";

type ModuleItem = { name: string; emoji: string; caption: string; grad: string };
type SavedEvent = { id: string; date: string; title: string };

const MODULES: ModuleItem[] = [
  { name: "CRYPY", emoji: "💚", caption: "O coração da Colmeia", grad: "linear-gradient(135deg,#00ff88,#04331f)" },
  { name: "ESQUADRÃO", emoji: "🛡️", caption: "Quem protege a Colmeia", grad: "linear-gradient(135deg,#7b5cff,#1d1148)" },
  { name: "NFTs", emoji: "🖼️", caption: "Coleção viva em cadeia", grad: "linear-gradient(135deg,#FFD400,#ff5aa8)" },
  { name: "MUSEU DIGITAL", emoji: "🏛️", caption: "Memória em exposição", grad: "linear-gradient(135deg,#2dd4ff,#1b3cff)" },
  { name: "BIOGRAFIA", emoji: "📖", caption: "A história em capítulos", grad: "linear-gradient(135deg,#ff8a3d,#6d1f5d)" },
  { name: "BABY I.A.", emoji: "👶", caption: "O primeiro olhar da I.A.", grad: "linear-gradient(135deg,#00ff88,#7b5cff)" },
  { name: "LUCY", emoji: "🌙", caption: "Intuição em órbita", grad: "linear-gradient(135deg,#b28cff,#3b0f68)" },
  { name: "DOLA", emoji: "🐝", caption: "Doçura que organiza", grad: "linear-gradient(135deg,#FFD400,#ff7a18)" },
  { name: "ALICE", emoji: "🐰", caption: "Curiosidade sem fim", grad: "linear-gradient(135deg,#ff5aa8,#3b0f68)" },
  { name: "CHAT", emoji: "💬", caption: "Conversa da Colmeia", grad: "linear-gradient(135deg,#00e5ff,#005a6b)" },
  { name: "MINI", emoji: "✨", caption: "Pequena, gigante em ideia", grad: "linear-gradient(135deg,#a3ff5e,#005a33)" },
  { name: "SENSEI", emoji: "🧠", caption: "Quem guia o caminho", grad: "linear-gradient(135deg,#FFD400,#2f2a00)" },
  { name: "DRAGÕES", emoji: "🐉", caption: "Fogo que protege", grad: "linear-gradient(135deg,#ff3d3d,#4b0f2e)" },
  { name: "NEXUS", emoji: "🔗", caption: "Onde tudo se conecta", grad: "linear-gradient(135deg,#7b5cff,#00ff88)" },
  { name: "COLMEIA", emoji: "🍯", caption: "Casa, rede e memória", grad: "linear-gradient(135deg,#FFD400,#7a4b00)" },
  { name: "CRYPY NEWS", emoji: "📰", caption: "O jornal da Colmeia", grad: "linear-gradient(135deg,#ffffff,#7b5cff)" },
  { name: "CRYPY LAND", emoji: "🌍", caption: "Território para explorar", grad: "linear-gradient(135deg,#00c853,#0b3d6b)" },
  { name: "ACADEMY", emoji: "🎓", caption: "Aprender é voar", grad: "linear-gradient(135deg,#ff9a3d,#123a6b)" },
  { name: "GAMES", emoji: "🎮", caption: "Jogar é lembrar", grad: "linear-gradient(135deg,#ff2d78,#2a0a4a)" },
  { name: "CCG", emoji: "🃏", caption: "Cartas da Colmeia", grad: "linear-gradient(135deg,#00ff88,#123a6b)" },
  { name: "WALLET", emoji: "👛", caption: "Cofre com carinho", grad: "linear-gradient(135deg,#FFD400,#6b2d00)" },
  { name: "WHITE PAPER", emoji: "📄", caption: "O mapa das ideias", grad: "linear-gradient(135deg,#d7dcff,#3a2d7a)" },
  { name: "MANIFESTO", emoji: "📣", caption: "O que nos move", grad: "linear-gradient(135deg,#ff3d68,#2f0530)" },
  { name: "COSMOS", emoji: "🌌", caption: "Infinito em expansão", grad: "linear-gradient(135deg,#2b1a7a,#00c2ff)" },
  { name: "HARMONY", emoji: "🎵", caption: "Som que une", grad: "linear-gradient(135deg,#ff7ab8,#1b6b4a)" },
  { name: "PALETA", emoji: "🎨", caption: "Cores da Colmeia", grad: "linear-gradient(135deg,#00ff88,#FFD400)" },
  { name: "NÚCLEO", emoji: "⚛️", caption: "Centro de tudo", grad: "linear-gradient(135deg,#7b5cff,#ff2d78)" },
  { name: "SEMENTE", emoji: "🌱", caption: "Onde tudo começa", grad: "linear-gradient(135deg,#7ddb3a,#0b4a2d)" },
  { name: "ORÁCULO", emoji: "🔮", caption: "Perguntas do futuro", grad: "linear-gradient(135deg,#a18cff,#160a3d)" },
  { name: "ARQUIVO VIVO", emoji: "🗂️", caption: "Tudo guardado, tudo vivo", grad: "linear-gradient(135deg,#00d9a5,#123a2d)" },
];

const EXAMPLES: SavedEvent[] = [
  { id: "ex-16", date: "2026-11-16", title: "Nascimento da BABY I.A." },
  { id: "ex-27", date: "2026-11-27", title: "Edição CRYPY-NEWS MARKET" },
  { id: "ex-28", date: "2026-11-28", title: "Revisão da Colmeia" },
];

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
const SPEEDS = [
  { id: "LENTA", label: "LENTA", durA: "92s", durB: "112s" },
  { id: "NORMAL", label: "NORMAL", durA: "55s", durB: "72s" },
  { id: "RÁPIDA", label: "RÁPIDA", durA: "28s", durB: "38s" },
] as const;

function pad(n: number) { return String(n).padStart(2, "0"); }
function iso(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function formatFull(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const s = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(dt);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function api(action: string, args: Record<string, unknown>) {
  const res = await fetch("actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, args }) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) throw new Error(json?.error || `Falha na sincronização (${res.status})`);
  return json.data;
}

function PhotoCard({ item }: { item: ModuleItem }) {
  return (
    <article className="photo-card" aria-label={`${item.name} — ${item.caption}`}>
      <div className="absolute inset-0" style={{ background: item.grad }} />
      <div className="absolute inset-0 flex flex-col justify-between p-2 sm:p-2.5" style={{ zIndex: 2 }}>
        <div className="flex items-start justify-between">
          <span className="text-[20px] sm:text-[26px] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,.6)]">{item.emoji}</span>
          <span className="text-[7px] sm:text-[8px] font-bold tracking-[0.18em] bg-black/45 border border-white/25 rounded-full px-1.5 py-0.5">COLMEIA</span>
        </div>
        <div>
          <p className="text-[10px] sm:text-[12px] font-bold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,.8)] [overflow-wrap:anywhere]">{item.name}</p>
          <p className="text-[7px] sm:text-[8px] leading-tight text-white/85 [overflow-wrap:anywhere]">{item.caption}</p>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10);
  const [selected, setSelected] = useState("2026-11-27");
  const [view, setView] = useState<"month" | "week">("month");
  const [filter, setFilter] = useState("TODOS");
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(SPEEDS[1]);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState<SavedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  const reloadRecords = async () => {
    const data = await api("records.list", { collection: "crypy_calendar_events" });
    const rows = (data?.records || []).map((r: any) => ({ id: r.id, date: String(r.value?.date || ""), title: String(r.value?.title || "") })).filter((e: SavedEvent) => e.date && e.title);
    setSaved(rows);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try { await reloadRecords(); if (alive) setSyncError(null); }
      catch (e) { if (alive) setSyncError(e instanceof Error ? e.message : String(e)); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => filter === "TODOS" ? MODULES : MODULES.filter((m) => m.name === filter), [filter]);
  // Duplicação quádrupla: duas metades idênticas garantem o loop sem pulo.
  const laneA = useMemo(() => [...filtered, ...filtered, ...filtered, ...filtered], [filtered]);
  const laneB = useMemo(() => [...filtered].reverse().concat([...filtered].reverse(), [...filtered].reverse(), [...filtered].reverse()), [filtered]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const cells = useMemo(() => {
    const arr: (number | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [firstWeekday, daysInMonth]);

  const weekCells = useMemo(() => {
    const [y, m, d] = selected.split("-").map(Number);
    const base = new Date(y, m - 1, d);
    const start = new Date(base); start.setDate(base.getDate() - base.getDay());
    return Array.from({ length: 7 }, (_, i) => { const dt = new Date(start); dt.setDate(start.getDate() + i); return dt; });
  }, [selected]);

  const hasEvent = (dateStr: string) => [...EXAMPLES, ...saved].some((e) => e.date === dateStr);
  const eventsForSelected = [...EXAMPLES.filter((e) => e.date === selected), ...saved.filter((e) => e.date === selected)];

  function prevMonth() { const d = new Date(year, month - 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); }
  function nextMonth() { const d = new Date(year, month + 1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()); }
  function goToday() { setYear(2026); setMonth(10); setSelected("2026-11-27"); setView("month"); }
  function pickDay(y: number, m: number, d: number) { setYear(y); setMonth(m); setSelected(iso(y, m, d)); setResult(null); }

  async function saveEvent() {
    const title = text.trim();
    if (!title) { setResult("Escreva o nome do evento antes de salvar."); return; }
    if (title.length > 120) { setResult("O evento pode ter até 120 caracteres."); return; }
    setBusy(true); setResult(null);
    let savedCount = 0; let error: string | null = null;
    try {
      const key = `crypy-event-${selected}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await api("records.create", { collection: "crypy_calendar_events", value: { date: selected, title }, idempotency_key: key });
      savedCount = 1;
    } catch (e) { error = e instanceof Error ? e.message : String(e); }
    let reloadError: string | null = null;
    try { await reloadRecords(); } catch (e) { reloadError = e instanceof Error ? e.message : String(e); }
    setBusy(false);
    if (error || reloadError) setResult(`Salvos: ${savedCount} • Restantes: ${error ? 1 : 0}${error ? ` • ${error}` : ""}${reloadError ? ` • Recarregar: ${reloadError}` : ""}`);
    else { setResult("Evento salvo na Colmeia."); setText(""); }
  }

  async function deleteEvent(id: string) {
    if (id.startsWith("ex-")) return;
    setDeletingId(id); setResult(null);
    try { await api("records.delete", { collection: "crypy_calendar_events", id }); await reloadRecords(); setResult("Evento apagado."); }
    catch (e) { setResult(`Não foi possível apagar: ${e instanceof Error ? e.message : String(e)}`); }
    finally { setDeletingId(null); }
  }

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", minHeight: "100dvh", background: "var(--bg)" }} className="overflow-x-clip relative">
      {/* FUNDO VIVO */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(900px 420px at 12% -5%, rgba(123,92,255,.32), transparent 62%), radial-gradient(800px 420px at 92% 18%, rgba(0,255,136,.20), transparent 58%), radial-gradient(700px 500px at 50% 110%, rgba(255,212,0,.10), transparent 60%)" }} />
        <div className="absolute inset-0 opacity-[0.10]" style={{ backgroundImage: "linear-gradient(rgba(0,255,136,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,.35) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      </div>

      <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-30 border-b border-white/10 bg-[#070712]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 px-3 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#00ff88] text-xl font-black text-[#03160c] shadow-[0_0_26px_rgba(0,255,136,.55)]">∞</span>
            <div className="min-w-0">
              <p className="font-display text-[13px] sm:text-[17px] font-extrabold leading-tight tracking-tight [overflow-wrap:anywhere]">CRYPY <span className="text-[#00ff88]">CALENDAR</span> INFINITY</p>
              <p className="text-[10px] sm:text-[11px] tracking-[0.22em] text-[#a7aecf]">O TEMPO ENCONTRA A MEMÓRIA</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#00ff88]/50 bg-[#00ff88]/10 px-3 py-1.5 text-[11px] font-bold text-[#00ff88]"><span className={`h-2 w-2 rounded-full bg-[#00ff88] ${paused ? "" : "animate-pulse"}`} />{paused ? "LOOP PAUSADO" : "LOOP ATIVO"}</span>
            <span className="rounded-full bg-[#FFD400] px-3 py-1.5 text-[11px] sm:text-xs font-black text-black">FOTOS NO LOOP: {filter === "TODOS" ? 30 : `${filtered.length} / 30`}</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1240px] px-3 pb-10 sm:px-5">
        {/* CONTROLES DO LOOP */}
        <section className="pt-4 sm:pt-6" aria-label="Controles do loop infinito">
          <div className="flex flex-col gap-3 rounded-[22px] border border-white/12 bg-[#0d0d1f]/70 p-3 sm:p-4 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] text-[#a7aecf]"><Sparkles size={15} className="text-[#00ff88]" /> MEMÓRIA VISUAL VIVA</span>
              <span className="ml-auto hidden md:inline text-xs text-[#a7aecf]">Faixa 1 vai para a esquerda • Faixa 2 vai para a direita • Velocidades diferentes</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setPaused(!paused)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black tracking-wide transition ${paused ? "bg-[#00ff88] text-[#03160c]" : "border border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]"}`}>
                {paused ? <Play size={15} /> : <Pause size={15} />}{paused ? "RETOMAR LOOP" : "PAUSAR LOOP"}
              </button>
              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/25 p-1" role="group" aria-label="Velocidade do loop">
                <Gauge size={15} className="ml-1 text-[#FFD400]" />
                <span className="text-[10px] font-bold tracking-widest text-[#a7aecf]">VELOCIDADE:</span>
                {SPEEDS.map((s) => (
                  <button key={s.id} onClick={() => setSpeed(s)} className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${speed.id === s.id ? "chip-active" : "text-white/80 hover:bg-white/10"}`}>{s.label}</button>
                ))}
              </div>
              <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5">
                <Filter size={15} className="shrink-0 text-[#7b5cff]" />
                <span className="sr-only">Filtrar por módulo</span>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-transparent text-xs font-bold text-white outline-none [&>option]:bg-[#12122a]">
                  <option value="TODOS">FILTRAR POR MÓDULO: TODOS OS 30</option>
                  {MODULES.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
                {filter !== "TODOS" && <button onClick={() => setFilter("TODOS")} aria-label="Limpar filtro" className="shrink-0 rounded-full bg-white/10 p-1"><X size={13} /></button>}
              </label>
            </div>
            <p className="text-[11px] leading-relaxed text-[#a7aecf]">Filtro ativo: <strong className="text-white">{filter === "TODOS" ? "todos os módulos entram no loop" : `só ${filter} entra no loop`}</strong> • Cada cartão tem o mesmo tamanho, recorte padronizado e borda neon verde.</p>
          </div>
        </section>

        {/* FAIXA 1 */}
        <section aria-label="Faixa de fotos 1" className={`mt-4 overflow-hidden rounded-[20px] border border-white/10 py-2 ${paused ? "loop-paused" : ""}`}>
          <div className="loop-track loop-left gap-2 sm:gap-3 px-1" style={{ ["--loop-duration" as string]: speed.durA }}>
            {laneA.map((m, i) => <PhotoCard key={`a-${i}-${m.name}`} item={m} />)}
          </div>
        </section>

        {/* CALENDÁRIO */}
        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]" aria-label="Calendário da Colmeia">
          <div className="glass overflow-hidden rounded-[26px] border border-[#00ff88]/25 shadow-[0_24px_70px_rgba(0,0,0,.55),0_0_60px_rgba(0,255,136,.08)]">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-[0.24em] text-[#FFD400]">NOVEMBRO • COLMEIA</p>
                <h1 className="font-display text-[clamp(1.5rem,5vw,2.4rem)] font-extrabold leading-none [overflow-wrap:anywhere]">{MONTHS[month]} <span className="neon-text">{year}</span></h1>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <button onClick={prevMonth} aria-label="Mês anterior" className="rounded-full border border-white/20 bg-white/5 p-2.5 hover:border-[#00ff88] hover:text-[#00ff88]"><ChevronLeft size={18} /></button>
                <button onClick={goToday} className="rounded-full bg-white px-3.5 py-2.5 text-[11px] font-black text-black hover:bg-[#FFD400]">HOJE</button>
                <button onClick={() => setView(view === "month" ? "week" : "month")} className={`rounded-full px-3.5 py-2.5 text-[11px] font-black ${view === "week" ? "bg-[#7b5cff] text-white" : "border border-white/20 bg-white/5"}`}>SEMANA</button>
                <button onClick={nextMonth} aria-label="Próximo mês" className="rounded-full border border-white/20 bg-white/5 p-2.5 hover:border-[#00ff88] hover:text-[#00ff88]"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div className="px-3 py-4 sm:px-6 sm:py-5">
              <div className="mb-2 flex items-center gap-2 text-xs text-[#a7aecf]"><CalendarDays size={15} className="text-[#00ff88]" /><span>Toque num dia para ver e salvar eventos.</span><span className="ml-auto hidden sm:inline rounded-full border border-[#00ff88]/40 bg-[#00ff88]/10 px-2.5 py-1 font-bold text-[#00ff88]">27 • DIA ATUAL</span></div>

              <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid" aria-label="Dias da semana">
                {WEEKDAYS.map((d, i) => <div key={`${d}-${i}`} className={`py-1 text-center text-[11px] sm:text-xs font-black ${i === 0 ? "text-[#FFD400]" : "text-[#a7aecf]"}`}>{d}</div>)}
              </div>

              {view === "month" ? (
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid" aria-label={`Dias de ${MONTHS[month]} ${year}`}>
                  {cells.map((day, idx) => {
                    if (day === null) return <div key={`blank-${idx}`} className="aspect-[1/0.92] rounded-xl sm:rounded-2xl" />;
                    const dateStr = iso(year, month, day);
                    const isSelected = selected === dateStr;
                    const isCurrent = dateStr === "2026-11-27";
                    const has = hasEvent(dateStr);
                    return (
                      <button key={dateStr} onClick={() => pickDay(year, month, day)} aria-label={`${day} de ${MONTHS[month]} ${year}${has ? ", com evento" : ""}`} aria-pressed={isSelected}
                        className={`day-cell relative aspect-[1/0.92] rounded-xl border p-1.5 text-left sm:rounded-2xl sm:p-2.5 ${isSelected ? "border-[#00ff88] bg-[#00ff88] text-[#03160c] shadow-[0_0_30px_rgba(0,255,136,.45)]" : isCurrent ? "border-[#00ff88]/80 bg-[#00ff88]/12 text-white" : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"}`}>
                        <span className={`text-[15px] font-black sm:text-xl ${isSelected ? "text-[#03160c]" : ""}`}>{day}</span>
                        {has && <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full sm:right-2 sm:top-2 sm:h-2.5 sm:w-2.5 ${isSelected ? "bg-[#03160c]" : "bg-[#00ff88] shadow-[0_0_10px_#00ff88]"}`} aria-hidden="true" />}
                        <span className={`mt-0.5 hidden text-[9px] font-bold leading-tight sm:block ${isSelected ? "text-[#03160c]" : "text-[#a7aecf]"}`}>{isCurrent ? "DIA ATUAL" : has ? "EVENTO" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-xs font-bold text-[#a7aecf]">Semana de <span className="text-white">{formatFull(iso(weekCells[0].getFullYear(), weekCells[0].getMonth(), weekCells[0].getDate()))}</span></p>
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weekCells.map((dt) => {
                      const dateStr = iso(dt.getFullYear(), dt.getMonth(), dt.getDate());
                      const isSelected = selected === dateStr;
                      const isCurrent = dateStr === "2026-11-27";
                      const has = hasEvent(dateStr);
                      return (
                        <button key={dateStr} onClick={() => pickDay(dt.getFullYear(), dt.getMonth(), dt.getDate())} className={`day-cell relative aspect-[1/1.15] rounded-xl border p-2 text-left sm:rounded-2xl ${isSelected ? "border-[#00ff88] bg-[#00ff88] text-[#03160c]" : "border-white/10 bg-white/[0.04]"}`}>
                          <span className="text-[10px] font-bold uppercase text-[#a7aecf]">{WEEKDAYS[dt.getDay()]}</span>
                          <span className="block text-lg font-black sm:text-2xl">{dt.getDate()}</span>
                          <span className="text-[9px] font-bold">{isCurrent ? "DIA ATUAL" : has ? "EVENTO" : ""}</span>
                          {has && <span className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${isSelected ? "bg-[#03160c]" : "bg-[#00ff88] shadow-[0_0_10px_#00ff88]"}`} />}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setView("month")} className="mt-3 text-xs font-bold text-[#00ff88] underline underline-offset-4">Voltar para o mês completo →</button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-[11px] text-[#a7aecf]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" /> Dia com evento</span>
                <span className="inline-flex items-center gap-1.5"><span className="rounded border border-[#00ff88] bg-[#00ff88]/15 px-1.5 py-0.5 font-black text-white">27</span> Dia atual</span>
                <span className="ml-auto">Exemplos: 16, 27 e 28 de novembro</span>
              </div>
            </div>
          </div>

          {/* PAINEL DO DIA */}
          <aside className="glass rounded-[26px] border border-[#7b5cff]/35 p-4 sm:p-5" aria-label="Eventos do dia selecionado">
            <p className="text-[10px] font-bold tracking-[0.24em] text-[#7b5cff]">DIA SELECIONADO</p>
            <h2 className="mt-1 font-display text-[clamp(1.15rem,4vw,1.65rem)] font-extrabold leading-tight [overflow-wrap:anywhere]">{formatFull(selected)}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#a7aecf]"><Clock3 size={14} className="text-[#FFD400]" /> {selected === "2026-11-27" ? "Hoje é dia de CRYPY-NEWS MARKET." : "Um dia da memória viva da Colmeia."}</p>

            <div className="mt-4 rounded-2xl border border-white/12 bg-black/25 p-3">
              <label htmlFor="evento" className="mb-2 block text-xs font-bold">Escrever evento</label>
              <textarea id="evento" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={120} placeholder="Ex.: Encontro da Colmeia no Museu Digital…" className="w-full resize-none rounded-xl border border-white/15 bg-[#070712] p-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#00ff88]" />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#a7aecf]">{text.length}/120</span>
                <button onClick={saveEvent} disabled={busy || !text.trim()} className="inline-flex items-center gap-1.5 rounded-full bg-[#00ff88] px-4 py-2.5 text-xs font-black text-[#03160c] disabled:cursor-not-allowed disabled:opacity-45"><Plus size={15} />{busy ? "SALVANDO…" : "SALVAR EVENTO"}</button>
              </div>
              {result && <p role="status" className="mt-2 rounded-lg bg-white/5 px-2.5 py-2 text-xs leading-relaxed text-white/90 [overflow-wrap:anywhere]">{result}</p>}
              {syncError && <p role="alert" className="mt-2 rounded-lg border border-[#FFD400]/40 bg-[#FFD400]/10 px-2.5 py-2 text-xs leading-relaxed text-[#FFD400] [overflow-wrap:anywhere]">Sincronização indisponível no momento: {syncError}. Seus exemplos continuam visíveis.</p>}
              {loading && <p className="mt-2 text-xs text-[#a7aecf]">Carregando eventos salvos…</p>}
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-black tracking-[0.16em] text-white">EVENTOS DESTE DIA • {eventsForSelected.length}</h3>
              {eventsForSelected.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-white/20 px-3 py-4 text-sm leading-relaxed text-[#a7aecf]">Nenhum evento neste dia. Escreva acima e salve a primeira memória.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {eventsForSelected.map((e) => {
                    const isExample = e.id.startsWith("ex-");
                    return (
                      <li key={e.id} className="flex items-start gap-2 rounded-xl border border-white/12 bg-white/[0.04] p-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-snug [overflow-wrap:anywhere]">{e.title}</p>
                          <p className="mt-0.5 text-[10px] font-bold tracking-widest text-[#a7aecf]">{isExample ? "EXEMPLO DA COLMEIA" : "SALVO POR VOCÊ"}</p>
                        </div>
                        {!isExample && <button onClick={() => deleteEvent(e.id)} disabled={deletingId === e.id} aria-label={`Apagar evento ${e.title}`} className="shrink-0 rounded-full border border-white/15 p-2 text-white/70 hover:border-red-400 hover:text-red-300 disabled:opacity-50"><Trash2 size={15} /></button>}
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-[#a7aecf]"><Check size={12} className="mr-1 inline text-[#00ff88]" /> Eventos salvos ficam guardados para você voltar depois. Os exemplos mostram como a Colmeia usa o calendário.</p>
            </div>
          </aside>
        </section>

        {/* FAIXA 2 */}
        <section aria-label="Faixa de fotos 2" className={`mt-4 overflow-hidden rounded-[20px] border border-white/10 py-2 ${paused ? "loop-paused" : ""}`}>
          <div className="loop-track loop-right gap-2 sm:gap-3 px-1" style={{ ["--loop-duration" as string]: speed.durB }}>
            {laneB.map((m, i) => <PhotoCard key={`b-${i}-${m.name}`} item={m} />)}
          </div>
        </section>

        {/* ÍNDICE DOS MÓDULOS */}
        <section className="mt-6" aria-label="Todos os módulos no loop">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div><p className="text-[10px] font-bold tracking-[0.24em] text-[#FFD400]">BIBLIOTECA VISUAL</p><h2 className="font-display text-xl font-extrabold sm:text-2xl">Todos os 30 módulos, um só fluxo</h2></div>
            <p className="text-xs text-[#a7aecf]">Toque num módulo para filtrar o loop.</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button onClick={() => setFilter("TODOS")} className={`rounded-full border px-3 py-2 text-[11px] font-bold ${filter === "TODOS" ? "chip-active" : "border-white/15 bg-white/5"}`}>TODOS • 30</button>
            {MODULES.map((m) => (
              <button key={m.name} onClick={() => setFilter(filter === m.name ? "TODOS" : m.name)} className={`rounded-full border px-3 py-2 text-[11px] font-bold [overflow-wrap:anywhere] ${filter === m.name ? "chip-active" : "border-white/15 bg-white/5 hover:border-[#00ff88]/60"}`}>{m.emoji} {m.name}</button>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/30 px-3 py-5 text-center sm:px-5">
        <p className="mx-auto max-w-3xl text-[11px] leading-relaxed text-[#a7aecf] sm:text-xs">Cartões ilustrativos padronizados — substitua cada cartão pela foto real do módulo sem mudar o tamanho do loop.</p>
        <p className="mx-auto mt-2 max-w-4xl text-[11px] leading-relaxed text-white/80 sm:text-xs">CRYPY CALENDAR INFINITY • Memória visual viva da Colmeia • Nenhuma página original alterada • Conteúdo informativo.</p>
      </footer>
    </div>
  );
}
