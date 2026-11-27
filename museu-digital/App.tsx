import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, ChevronLeft, ChevronRight, Maximize2, X, Search, Sparkles, Plus, ScanEye, Hexagon, Clock3, Images, Frame, CheckCircle2, AlertCircle } from "lucide-react";
import imgV1 from "container:///mnt/data/src/assets/3494c23e16c11cc1-img-u7532173449733445874-4.webp";
import imgV2 from "container:///mnt/data/src/assets/af0f3471f1375517-img-u7532173449733445874-7.webp";
import imgV3 from "container:///mnt/data/src/assets/b721bbeee47a9a1e-img-u7532173449733445874-6.webp";
import imgV4 from "container:///mnt/data/src/assets/d8ebef10ef29e586-img-u7532173449733445874-3.webp";
import imgV5 from "container:///mnt/data/src/assets/fe6e760e96fdfe5a-img-u7532173449733445874-8.webp";
import imgV6 from "container:///mnt/data/src/assets/3223deaf379819b1-img-u7532173449733445874-2.webp";
import imgV7 from "container:///mnt/data/src/assets/3dc2fd3355b24ab1-img-u7532173449733445874-5.webp";
import imgV8 from "container:///mnt/data/src/assets/594d45b67ce280c8-img-u7532173449733445874-1.webp";
import imgV12Guardiao from "container:///mnt/data/src/assets/f07e92a7ca10ac3a-img-u7532174009095742433-2.webp";
import imgV12Sinergia from "container:///mnt/data/src/assets/efc51a6c94ae5995-img-u7532174009095742433-1.webp";
import imgLucy from "container:///mnt/data/src/assets/b088746ac45cb92a-img-u7532193603611642147-1.jpg";
import imgLegion1 from "container:///mnt/data/src/assets/25971ff14b091062-image_20261127_173236.webp";
import imgLegion2 from "container:///mnt/data/src/assets/78ee6af5772c8d70-image_20261127_173324.webp";

type Piece = { id: string; name: string; group: string; tags: string[]; confidence: number; era: string; src: string; note: string };
type FeedItem = { id: string; text: string; confidence: number; time: string };
type AddedEntry = { recordId: string; pieceId: string; at: string };

const BASE: Piece[] = [
  { id: "v1", name: "V1", group: "V1–V8", tags: ["CRYPY LAND", "ORIGINAL"], confidence: 98, era: "Primeira geração", src: imgV1, note: "A origem da Colmeia." },
  { id: "v2", name: "V2", group: "V1–V8", tags: ["CRYPY LAND", "ORIGINAL"], confidence: 97, era: "Primeira geração", src: imgV2, note: "Registro preservado no acervo." },
  { id: "v3", name: "V3", group: "V1–V8", tags: ["CRYPY LAND", "ORIGINAL"], confidence: 99, era: "Primeira geração", src: imgV3, note: "Reconhecida pela forma e pela cor." },
  { id: "v4", name: "V4", group: "V1–V8", tags: ["CRYPY LAND", "ORIGINAL"], confidence: 96, era: "Primeira geração", src: imgV4, note: "Parte da sequência original." },
  { id: "v5", name: "V5", group: "V1–V8", tags: ["CRYPY LAND", "ORIGINAL"], confidence: 98, era: "Primeira geração", src: imgV5, note: "Guardada com o conjunto inicial." },
  { id: "v6", name: "V6", group: "V1–V8", tags: ["CRYPY LAND", "ORIGINAL"], confidence: 97, era: "Primeira geração", src: imgV6, note: "Identidade visual confirmada." },
  { id: "v7", name: "V7", group: "V1–V8", tags: ["CRYPY LAND", "ORIGINAL"], confidence: 99, era: "Primeira geração", src: imgV7, note: "Uma das peças mais lembradas." },
  { id: "v8", name: "V8", group: "V1–V8", tags: ["CRYPY LAND", "ORIGINAL"], confidence: 98, era: "Primeira geração", src: imgV8, note: "Fecha o primeiro ciclo." },
  { id: "v12-guardiao", name: "V12 Guardião", group: "V12", tags: ["V12", "GUARDIÃO"], confidence: 99, era: "Nova guarda", src: imgV12Guardiao, note: "Presença forte na entrada do Museu." },
  { id: "v12-sinergia", name: "V12 Sinergia", group: "V12", tags: ["V12", "SINERGIA"], confidence: 98, era: "Nova guarda", src: imgV12Sinergia, note: "Energia compartilhada com a Colmeia." },
  { id: "lucy", name: "LUCY", group: "LUCY", tags: ["LUCY", "CRYPY-DEFENDER"], confidence: 99, era: "Defesa da Colmeia", src: imgLucy, note: "LUCY-CRYPY-DEFENDER, reconhecida de imediato." },
  { id: "v12-legion-1", name: "V12 LEGION — Versão 1", group: "LEGION", tags: ["V12", "LEGION"], confidence: 99, era: "Legião", src: imgLegion1, note: "A força coletiva em uma só parede." },
  { id: "v12-legion-2", name: "V12 LEGION — Versão 2", group: "LEGION", tags: ["V12", "LEGION"], confidence: 99, era: "Legião", src: imgLegion2, note: "Segunda leitura da mesma legião." },
];

const FILTERS = ["TODAS", "V1–V8", "V12", "LUCY", "BABY", "LEGION"] as const;
const nowLabel = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

async function api(action: string, args: Record<string, unknown>) {
  const response = await fetch("actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, args }) });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.error) throw new Error(typeof json.error === "string" ? json.error : "Não foi possível falar com o acervo.");
  return json.data;
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("TODAS");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("v12-legion-1");
  const [added, setAdded] = useState<AddedEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const queueRef = useRef(0);

  const queue = useMemo(() => {
    const extra = added.map((entry) => BASE.find((p) => p.id === entry.pieceId)).filter(Boolean) as Piece[];
    return [...BASE, ...extra];
  }, [added]);

  const current = queue[Math.min(index, Math.max(0, queue.length - 1))] ?? BASE[0];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api("records.list", { collection: "colmeia-entradas" });
        const records = Array.isArray(data?.records) ? data.records : [];
        if (!cancelled) setAdded(records.map((r: any) => ({ recordId: String(r.id), pieceId: String(r.value?.pieceId ?? ""), at: String(r.value?.at ?? "") })).filter((x: AddedEntry) => BASE.some((p) => p.id === x.pieceId)));
      } catch { /* o acervo local continua disponível mesmo sem a conexão */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (paused || fullscreen) return;
    const timer = window.setTimeout(() => setIndex((v) => (v + 1) % queue.length), 6000);
    return () => window.clearTimeout(timer);
  }, [index, paused, fullscreen, queue.length]);

  useEffect(() => {
    if (queueRef.current === index && feed.length) return;
    queueRef.current = index;
    const piece = queue[index] ?? BASE[0];
    setFeed((old) => [{ id: `${Date.now()}-${index}`, text: `I.A. reconheceu: ${piece.name} • ${piece.tags.join(" • ")}`, confidence: piece.confidence, time: nowLabel() }, ...old].slice(0, 6));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, queue.length]);

  const next = () => setIndex((v) => (v + 1) % queue.length);
  const prev = () => setIndex((v) => (v - 1 + queue.length) % queue.length);

  async function addPhoto() {
    const piece = BASE.find((p) => p.id === selected);
    if (!piece || busy) return;
    setBusy(true); setResult(null); setResultError(null);
    const key = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `colmeia-${Date.now()}`;
    const value = { pieceId: piece.id, name: piece.name, at: new Date().toISOString() };
    try {
      const created = await api("records.create", { collection: "colmeia-entradas", value, idempotency_key: key });
      const entry: AddedEntry = { recordId: String(created?.id ?? key), pieceId: piece.id, at: value.at };
      setAdded((old) => [...old, entry]);
      setResult(`Nova foto entrou na Colmeia: ${piece.name}. A I.A. reconheceu e o quadro já incluiu no loop.`);
      setIndex(queue.length);
    } catch (e) {
      setResultError(e instanceof Error ? e.message : "Não foi possível registrar a nova foto.");
    } finally { setBusy(false); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BASE.filter((p) => (filter === "TODAS" || p.group === filter) && (!q || p.name.toLowerCase().includes(q) || p.tags.join(" ").toLowerCase().includes(q) || p.era.toLowerCase().includes(q)));
  }, [filter, search]);

  const frame = (large = false) => (
    <div className={`frame-gold ${large ? "p-3 sm:p-5" : "p-2.5 sm:p-4"} rounded-[4px]`}>
      <div className="frame-inner relative overflow-hidden rounded-[2px]">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 py-2 text-[10px] font-bold tracking-[0.22em] text-[var(--gold-2)] sm:text-xs">
          <span>SALA PRINCIPAL</span><span className="hidden sm:inline">CRYPY • COLMEIA</span><span className="text-[var(--green)]">● AO VIVO</span>
        </div>
        <img key={`${current.id}-${index}`} src={current.src} alt={current.name} className={`fade-photo block w-full object-cover ${large ? "aspect-[4/3] max-h-[68vh] sm:aspect-[16/10]" : "aspect-[4/3] sm:aspect-[16/9]"}`} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent px-3 pb-3 pt-14 sm:px-5 sm:pb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">Peça em exibição</p>
          <h2 className="font-display text-3xl font-semibold leading-none text-white sm:text-5xl">{current.name}</h2>
          <p className="mt-2 text-xs font-semibold text-white/80 sm:text-sm">{current.tags.join(" • ")} • Confiança {current.confidence}%</p>
        </div>
      </div>
    </div>
  );

  return (
    <div data-safe-area-inset-root className="min-h-screen overflow-x-clip bg-[var(--bg)] text-[var(--ink)]" style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }}>
      <div className="honeycomb min-h-screen">
        <header data-safe-area-sticky-top className="sticky top-[var(--safe-area-inset-top)] z-40 border-b border-[var(--line)] bg-[#070805]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--gold)] bg-[#1d1a08] text-[var(--gold-2)]"><Hexagon size={22} /></span>
              <div><p className="text-[10px] font-extrabold tracking-[0.3em] text-[var(--gold)]">MUSEU DIGITAL</p><h1 className="font-display text-xl font-bold leading-none sm:text-2xl">COLMEIA <span className="text-[var(--gold-2)]">•</span> CRYPY</h1></div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold sm:text-[11px]">
              <span className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-300"><span className="pulse-dot h-2 w-2 rounded-full bg-[var(--green)]" />I.A. RECONHECIMENTO: ATIVO</span>
              <span className="rounded-full border border-[var(--gold)]/50 bg-[#1d1a08] px-3 py-1.5 text-[var(--gold-2)]">QUADRO: {paused ? "PAUSADO" : "PASSANDO SOZINHO"}</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <section className="grid gap-6 py-6 sm:py-9 lg:grid-cols-[1.35fr_.65fr]">
            <div>
              <p className="mb-2 text-[11px] font-bold tracking-[0.3em] text-[var(--green)]">O MUSEU ESTÁ ABERTO</p>
              <h2 className="font-display text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[0.9]">A Colmeia guarda.<br /><span className="italic text-[var(--gold-2)]">O Quadro mostra.</span></h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">Você não precisa atualizar nada. Cada foto entra na Colmeia, a I.A. reconhece, o Museu organiza e a parede do Museu passa tudo sozinha, em loop infinito.</p>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-bold sm:text-xs">
                {["COLMEIA GUARDA", "I.A. RECONHECE", "MUSEU ORGANIZA", "QUADRO MOSTRA"].map((s, i) => <span key={s} className="flex items-center gap-2"><span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2">{s}</span>{i < 3 && <span className="text-[var(--gold)]">→</span>}</span>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 self-center">
              {[{ icon: Images, label: "TOTAL FOTOS NA COLMEIA", value: String(queue.length) }, { icon: ScanEye, label: "RECONHECIDAS PELA I.A.", value: String(queue.length) }, { icon: Frame, label: "NO QUADRO AGORA", value: `${index + 1} / ${queue.length}` }, { icon: Clock3, label: "ÚLTIMA ATUALIZAÇÃO", value: "AUTOMÁTICA" }].map(({ icon: Icon, label, value }) => (
                <article key={label} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><Icon className="text-[var(--gold)]" size={20} /><p className="mt-4 text-[10px] font-bold tracking-wider text-[var(--muted)]">{label}</p><p className="mt-1 font-display text-[clamp(1.25rem,5vw,1.9rem)] font-semibold leading-tight text-white [overflow-wrap:anywhere]">{value}</p></article>
              ))}
            </div>
          </section>

          <section id="quadro" className="grid gap-5 lg:grid-cols-[1.65fr_.8fr]">
            <div>
              {frame()}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div key={`${index}-${paused}`} className={`h-full bg-[var(--green)] shadow-[0_0_12px_var(--green)] ${paused ? "" : "progress-run"}`} style={paused ? { width: "100%" } : undefined} /></div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm text-[var(--muted)]">Agora no quadro: <strong className="text-white">{current.name}</strong></p><p className="mt-1 flex items-start gap-2 text-sm text-[var(--green)]"><Sparkles size={17} className="mt-0.5 shrink-0" /><span className="[overflow-wrap:anywhere]">I.A. diz: Reconheci: {current.tags.join(" • ")} • Confiança {current.confidence}%</span></p></div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={prev} className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold hover:border-[var(--gold)]"><ChevronLeft size={16} />ANTERIOR</button>
                  <button onClick={() => setPaused((v) => !v)} className="flex items-center gap-1.5 rounded-full bg-[var(--gold)] px-4 py-2 text-xs font-extrabold text-black hover:bg-[var(--gold-2)]">{paused ? <Play size={16} /> : <Pause size={16} />}{paused ? "RETOMAR" : "PAUSAR QUADRO"}</button>
                  <button onClick={next} className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold hover:border-[var(--gold)]">PRÓXIMA<ChevronRight size={16} /></button>
                  <button onClick={() => setFullscreen(true)} className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300"><Maximize2 size={15} />MODO TELA CHEIA</button>
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-4">
              <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
                <div className="flex items-center justify-between"><h3 className="font-display text-2xl font-semibold">I.A. em tempo real</h3><span className="pulse-dot h-2.5 w-2.5 rounded-full bg-[var(--green)]" /></div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">A leitura muda junto com o quadro. Nada precisa ser marcado à mão.</p>
                <div className="mt-4 space-y-2">
                  {feed.map((item) => <div key={item.id} className="rise rounded-xl border border-white/5 bg-black/25 p-3"><p className="text-[11px] font-bold text-[var(--green)]">{item.time} • {item.confidence}%</p><p className="mt-1 text-sm font-semibold leading-snug [overflow-wrap:anywhere]">{item.text}</p></div>)}
                  {!feed.length && <p className="text-sm text-[var(--muted)]">Aguardando a próxima leitura…</p>}
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--gold)]/40 bg-[#17140a] p-4 sm:p-5">
                <p className="text-[10px] font-extrabold tracking-[0.24em] text-[var(--gold)]">NOVA CHEGADA • SIMULAÇÃO</p>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">Adicionar foto na Colmeia</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">Escolha uma foto do acervo para simular uma nova entrada. Ela é registrada, reconhecida e entra no loop do quadro.</p>
                <label className="mt-4 block text-xs font-bold" htmlFor="nova-foto">Foto que acabou de chegar</label>
                <select id="nova-foto" value={selected} onChange={(e) => setSelected(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#090a08] px-3 py-3 text-sm text-white">
                  {BASE.map((p) => <option key={p.id} value={p.id}>{p.name} • {p.tags.join(" • ")}</option>)}
                </select>
                <button onClick={addPhoto} disabled={busy || loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green)] px-4 py-3 text-sm font-extrabold text-black disabled:opacity-50 hover:bg-[#7dff96]"><Plus size={18} />{busy ? "GUARDANDO NA COLMEIA…" : "ADICIONAR FOTO NA COLMEIA"}</button>
                {result && <p className="mt-3 flex gap-2 text-xs leading-relaxed text-emerald-300"><CheckCircle2 size={17} className="shrink-0" /><span className="[overflow-wrap:anywhere]">{result}</span></p>}
                {resultError && <p className="mt-3 flex gap-2 text-xs leading-relaxed text-rose-300"><AlertCircle size={17} className="shrink-0" /><span className="[overflow-wrap:anywhere]">{resultError}</span></p>}
                <p className="mt-3 border-t border-white/10 pt-3 text-[11px] text-[var(--muted)]">Entradas registradas nesta visita: <strong className="text-white">{added.length}</strong> • O quadro tem agora {queue.length} fotos.</p>
              </section>
            </aside>
          </section>

          <section id="acervo" className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold tracking-[0.3em] text-[var(--gold)]">ACERVO DA COLMEIA</p><h2 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">Tudo guardado, tudo em ordem</h2></div><p className="text-sm text-[var(--muted)]">{filtered.length} {filtered.length === 1 ? "peça" : "peças"} em exibição</p></div>
            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">{FILTERS.map((f) => <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${filter === f ? "border-[var(--gold)] bg-[var(--gold)] text-black" : "border-[var(--line)] bg-[var(--surface)] text-white hover:border-[var(--gold)]"}`}>{f}</button>)}</div>
              <label className="relative block lg:ml-auto lg:w-80"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou tag…" className="w-full rounded-full border border-[var(--line)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm outline-none placeholder:text-[var(--muted)]" /></label>
            </div>
            {filtered.length ? <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((piece) => (
              <article key={piece.id} className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition hover:border-[var(--gold)]/70">
                <div className="relative overflow-hidden"><img src={piece.src} alt={piece.name} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-[var(--green)]">I.A. • {piece.confidence}%</span><span className="absolute right-3 top-3 rounded-full bg-[var(--gold)] px-2.5 py-1 text-[10px] font-extrabold text-black">{piece.group}</span></div>
                <div className="p-4"><h3 className="font-display text-2xl font-semibold leading-none">{piece.name}</h3><p className="mt-2 text-xs text-[var(--muted)]">{piece.era} • {piece.note}</p><div className="mt-3 flex flex-wrap gap-1.5">{piece.tags.map((t) => <span key={t} className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-bold text-[var(--gold-2)]">{t}</span>)}</div><button onClick={() => { setIndex(queue.findIndex((p) => p.id === piece.id)); document.getElementById("quadro")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-4 w-full rounded-lg border border-[var(--gold)]/50 py-2 text-xs font-bold text-[var(--gold-2)] hover:bg-[var(--gold)] hover:text-black">VER NO QUADRO</button></div>
              </article>))}
            </div> : <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-10 text-center"><p className="font-display text-3xl">Nenhuma peça nesta sala, ainda.</p><p className="mt-2 text-sm text-[var(--muted)]">A Colmeia ainda não guardou uma foto com esse filtro. Experimente outra coleção ou limpe a busca.</p><button onClick={() => { setFilter("TODAS"); setSearch(""); }} className="mt-4 rounded-full bg-[var(--gold)] px-5 py-2 text-xs font-extrabold text-black">VER TODO O ACERVO</button></div>}
          </section>
        </main>
        <footer className="border-t border-[var(--line)] bg-black/30"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs font-bold tracking-wide text-[var(--muted)] sm:flex-row sm:px-6 sm:text-left"><span>COLMEIA • MUSEU DIGITAL • CRYPY</span><span className="text-[var(--gold-2)]">Colmeia guarda • I.A. reconhece • Museu organiza • Quadro mostra</span></div></footer>
      </div>

      {fullscreen && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 pt-[max(1rem,var(--safe-area-inset-top))] pb-6" role="dialog" aria-modal="true" aria-label="Quadro em tela cheia"><div className="mx-auto flex min-h-full w-full max-w-6xl flex-col items-center justify-center px-3 sm:px-6"><div className="flex w-full items-center justify-between py-3 text-xs font-bold tracking-widest text-white"><span>QUADRO • TELA CHEIA</span><button onClick={() => setFullscreen(false)} className="flex items-center gap-2 rounded-full border border-white/30 px-3 py-2 hover:bg-white hover:text-black"><X size={16} />FECHAR</button></div><div className="w-full">{frame(true)}</div><div className="mt-4 flex flex-wrap justify-center gap-2"><button onClick={prev} className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-black"><ChevronLeft size={16} />ANTERIOR</button><button onClick={next} className="flex items-center gap-1 rounded-full bg-[var(--gold)] px-4 py-2 text-xs font-extrabold text-black">PRÓXIMA<ChevronRight size={16} /></button></div><p className="mt-3 text-center text-sm text-white/70">Agora no quadro: <strong className="text-white">{current.name}</strong> • I.A. reconheceu com {current.confidence}% de confiança</p></div></div>}
    </div>
  );
}
