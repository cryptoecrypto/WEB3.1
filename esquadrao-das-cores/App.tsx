import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ChevronRight, Clock3, Expand, Menu, Shield, Sparkles, X, Zap } from "lucide-react";

type Hero = { name: string; short: string; color: string; glow: string; role: string; power: string };

const quartet: Hero[] = [
  { name: "Alice", short: "A", color: "#a855f7", glow: "rgba(168,85,247,.55)", role: "VOZ • ESTRATÉGIA", power: "HARMONIA" },
  { name: "Dola", short: "D", color: "#38bdf8", glow: "rgba(56,189,248,.55)", role: "FLUXO • PROTEÇÃO", power: "CORRENTE" },
  { name: "Chat", short: "C", color: "#ff3b5c", glow: "rgba(255,59,92,.55)", role: "ENERGIA • RESPOSTA", power: "IGNIÇÃO" },
  { name: "Mini", short: "M", color: "#00f58a", glow: "rgba(0,245,138,.55)", role: "PRECISÃO • FOCO", power: "PULSO" },
];

const shellStyle = { boxSizing: "border-box" as const, paddingTop: "var(--safe-area-inset-top)" };

function ArmorFigure({ hero, large = false }: { hero: Hero; large?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`relative flex items-center justify-center rounded-full border-2 bg-black/75 ${large ? "h-24 w-24 sm:h-32 sm:w-32" : "h-20 w-20 sm:h-24 sm:w-24"}`}
        style={{ borderColor: hero.color, boxShadow: `0 0 28px ${hero.glow}, inset 0 0 22px ${hero.glow}` }}
      >
        <div className="absolute -top-2 h-4 w-12 rounded-t-full bg-black/80" style={{ border: `1px solid ${hero.color}` }} />
        <span className="font-display text-3xl font-black sm:text-4xl" style={{ color: hero.color }}>{hero.short}</span>
        <div className="absolute -bottom-2 flex h-7 w-7 items-center justify-center rounded-full border bg-black text-base font-black" style={{ borderColor: hero.color, color: hero.color }}>∞</div>
      </div>
      <div className="mt-4 font-display text-sm font-extrabold tracking-[0.22em] sm:text-base" style={{ color: hero.color }}>{hero.name.toUpperCase()}</div>
      <div className="mt-1 text-[11px] font-bold tracking-[0.18em] text-zinc-300">{hero.role}</div>
    </div>
  );
}

function Quintet({ large = false }: { large?: boolean }) {
  return (
    <div className="cosmic relative overflow-hidden rounded-2xl border border-emerald-400/40 px-3 py-8 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-emerald-300"><Sparkles size={14} /> QUINTETO OFICIAL <span className="text-zinc-400">• V13</span></div>
      <div className="pointer-events-none absolute right-4 top-4 hidden rounded-full border border-yellow-300/50 px-3 py-1 text-[10px] font-bold tracking-[0.25em] text-yellow-200 sm:block">BABY V13 DOURADO</div>
      <div className="mt-7 flex flex-wrap items-end justify-center gap-5 sm:gap-8">
        {quartet.map((hero) => <ArmorFigure key={hero.name} hero={hero} large={large} />)}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-300 bg-yellow-400/10 shadow-[0_0_34px_rgba(255,215,94,.65)] sm:h-24 sm:w-24">
            <span className="font-display text-3xl font-black text-yellow-300">B</span>
            <span className="absolute -top-3 rounded-full bg-yellow-300 px-2 py-0.5 text-[9px] font-black text-black">V13</span>
            <div className="absolute -bottom-2 flex h-7 w-7 items-center justify-center rounded-full border border-yellow-300 bg-black text-base font-black text-yellow-300">∞</div>
          </div>
          <div className="mt-4 font-display text-sm font-extrabold tracking-[0.22em] text-yellow-300 sm:text-base">BABY</div>
          <div className="mt-1 text-[11px] font-bold tracking-[0.18em] text-zinc-300">OURO • NOVA ERA</div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {["ALICE", "DOLA", "CHAT", "MINI", "BABY V13"].map((n) => (
          <span key={n} className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-zinc-100">{n}</span>
        ))}
      </div>
    </div>
  );
}

function MuseumCard({ hero }: { hero: Hero }) {
  return (
    <article className="card-glow group overflow-hidden rounded-2xl border bg-[#040705] text-left" style={{ borderColor: `${hero.color}88` }}>
      <div className="cosmic relative flex min-h-[310px] flex-col items-center justify-center overflow-hidden px-4 py-8">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: hero.color }} />
        <span className="absolute left-3 top-3 font-display text-[10px] font-bold tracking-[0.3em] text-white/80">0{quartet.indexOf(hero) + 1} // MUSEU</span>
        <span className="absolute right-3 top-3 rounded-full border px-2 py-1 text-[9px] font-black tracking-[0.2em]" style={{ borderColor: hero.color, color: hero.color }}>{hero.power}</span>
        <ArmorFigure hero={hero} large />
        <div className="mt-6 flex gap-1.5" aria-hidden="true">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="h-1.5 w-8 rounded-full" style={{ background: hero.color, opacity: 1 - i * 0.16 }} />)}</div>
      </div>
      <div className="p-5">
        <div className="flex items-end justify-between gap-3">
          <h3 className="font-display text-2xl font-black leading-none" style={{ color: hero.color }}>{hero.name.toUpperCase()}</h3>
          <span className="text-2xl font-black" style={{ color: hero.color }}>∞</span>
        </div>
        <p className="mt-3 text-sm font-semibold leading-5 text-zinc-300 [overflow-wrap:anywhere]">{hero.role} — armadura neon, símbolo infinito no peito e fundo cósmico com galáxias.</p>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-[11px] font-bold tracking-[0.24em] text-zinc-400">ESQUADRÃO DAS CORES</span>
          <Shield size={18} style={{ color: hero.color }} />
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [museumNote, setMuseumNote] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = useMemo(() => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now), [now]);
  const date = useMemo(() => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric" }).format(now), [now]);

  const goTo = (id: string, label = "") => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
    if (label) setMuseumNote(label);
  };

  return (
    <div data-safe-area-inset-root style={shellStyle} className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] overflow-x-clip bg-black">
        <div className="matrix-edge hidden w-[5px] shrink-0 opacity-70 sm:block" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-30 border-b border-emerald-400/30 bg-black/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
              <button onClick={() => goTo("inicio")} className="flex min-w-0 items-center gap-3 text-left" aria-label="Ir para o início">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-400 bg-emerald-400/10 font-display text-lg font-black text-[#00F58A] shadow-[0_0_20px_rgba(0,245,138,.35)]">C</span>
                <span className="leading-none">
                  <span className="font-display block text-2xl font-black tracking-[0.12em] text-[#00F58A] text-glow sm:text-3xl">CRYPY</span>
                  <span className="mt-1 block text-[10px] font-bold tracking-[0.32em] text-zinc-400">V12 • HARMONY SYSTEM</span>
                </span>
              </button>
              <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-full border border-[#00F58A] bg-[#00F58A]/10 px-4 py-2.5 text-xs font-black tracking-[0.18em] text-[#00F58A] hover:bg-[#00F58A] hover:text-black sm:px-5" aria-expanded={menuOpen}>
                {menuOpen ? <X size={17} /> : <Menu size={17} />} MENU CRYPY
              </button>
            </div>
            {menuOpen && (
              <nav className="border-t border-emerald-400/20 bg-[#030805] px-4 py-4 sm:px-6">
                <div className="mx-auto grid max-w-[1240px] gap-2 sm:grid-cols-3">
                  {[
                    { id: "inicio", label: "INÍCIO", desc: "Foto principal e Quarteto" },
                    { id: "quarteto", label: "CAIXA DO QUARTETO", desc: "Home limpa e acesso direto" },
                    { id: "museu", label: "MUSEU DIGITAL", desc: "Quarteto — Esquadrão das Cores" },
                  ].map((item) => (
                    <button key={item.id} onClick={() => goTo(item.id, item.id === "museu" ? "Você está no Museu Digital / Quarteto." : "")} className="group flex items-center justify-between rounded-xl border border-emerald-400/25 bg-black px-4 py-3 text-left hover:border-[#00F58A] hover:bg-emerald-400/10">
                      <span><span className="font-display block text-sm font-extrabold tracking-[0.16em] text-[#00F58A]">{item.label}</span><span className="mt-1 block text-xs font-semibold text-zinc-400">{item.desc}</span></span><ChevronRight className="text-[#00F58A]" size={18} />
                    </button>
                  ))}
                </div>
              </nav>
            )}
          </header>

          <main id="inicio" className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6">
            <section className="pt-6 sm:pt-9">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black tracking-[0.28em] text-emerald-300 sm:text-xs">
                <span className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1.5">HOME DIRETA</span>
                <span className="rounded-full border border-white/20 px-3 py-1.5 text-zinc-300">FOTO PRINCIPAL ATUALIZADA</span>
              </div>
              <h1 className="mt-5 font-display text-[clamp(2rem,6vw,4.4rem)] font-black leading-[0.98] tracking-tight [overflow-wrap:anywhere]">
                PROTEÇÃO É SUA<br /><span className="text-[#00F58A] text-glow">MAIOR FORÇA.</span>
              </h1>
              <p className="mt-4 max-w-3xl text-lg font-semibold leading-6 text-zinc-200 sm:text-xl">CRYPY V12 HARMONY SYSTEM — o quinteto em formação, energia em sintonia e o futuro dourado já em cena.</p>

              <div className="mt-7"><Quintet /></div>
              <p className="mt-4 text-center text-sm font-bold tracking-[0.08em] text-zinc-200 sm:text-base [overflow-wrap:anywhere]">QUINTETO OFICIAL — Alice, Dola, Chat, Mini + BABY V13 DOURADO — Foto principal atualizada.</p>
              <div className="mt-5 flex justify-center">
                <button onClick={() => setPhotoOpen(true)} className="flex items-center gap-2 rounded-full bg-[#00F58A] px-6 py-3.5 font-display text-xs font-black tracking-[0.16em] text-black shadow-[0_0_32px_rgba(0,245,138,.45)] hover:bg-white sm:text-sm"><Expand size={18} /> [ ABRIR FOTO PRINCIPAL ]</button>
              </div>
            </section>

            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Fotos individuais do Quarteto na Home">
              {quartet.map((hero) => (
                <article key={hero.name} className="overflow-hidden rounded-2xl border bg-[#040705] p-4" style={{ borderColor: `${hero.color}66` }}>
                  <div className="cosmic flex min-h-[230px] items-center justify-center rounded-xl"><ArmorFigure hero={hero} /></div>
                  <div className="mt-4 flex items-center justify-between"><h2 className="font-display text-lg font-black tracking-[0.16em]" style={{ color: hero.color }}>{hero.name.toUpperCase()}</h2><span className="text-xs font-bold tracking-[0.2em] text-zinc-400">INDIVIDUAL</span></div>
                  <p className="mt-2 text-sm font-semibold text-zinc-300">{hero.role}</p>
                </article>
              ))}
            </section>

            <section id="quarteto" className="mt-10 scroll-mt-28 rounded-3xl border-2 border-[#00F58A] bg-black p-5 shadow-[0_0_50px_rgba(0,245,138,.14)] sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-[#00F58A] px-3 py-1.5 font-display text-[10px] font-black tracking-[0.25em] text-black">QUARTETO · HOME LIMPA</span>
                <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-emerald-300"><Zap size={14} /> ACESSO DIRETO</span>
              </div>
              <h2 className="mt-5 font-display text-[clamp(1.7rem,4.5vw,3.2rem)] font-black leading-[1.02] [overflow-wrap:anywhere]">QUARTETO — Ver todas as fotos no <span className="text-[#00F58A]">MUSEU DIGITAL</span></h2>
              <p className="mt-4 max-w-3xl text-base font-semibold leading-6 text-zinc-200 sm:text-lg">Na HOME ficam só a foto de capa e as 4 individuais: Dola, Alice, Chat, Mini. As demais fotos do Quarteto / Quinteto estão no Museu Digital.</p>
              <button onClick={() => goTo("museu", "Você está no Museu Digital / Quarteto.")} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00F58A] to-[#00D8FF] px-6 py-4 font-display text-sm font-black tracking-[0.16em] text-black shadow-[0_0_32px_rgba(0,216,255,.25)] hover:brightness-110 sm:w-auto sm:min-w-[320px]">ABRIR — MUSEU <ArrowDown size={18} /></button>
              {museumNote && <p role="status" className="mt-4 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-100">{museumNote}</p>}
            </section>

            <section id="museu" className="mt-14 scroll-mt-28 border-t border-emerald-400/25 pt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.3em] text-[#00F58A]">MUSEU DIGITAL / QUARTETO</p>
                  <h2 className="mt-3 font-display text-[clamp(1.9rem,5vw,3.6rem)] font-black leading-[1.02] [overflow-wrap:anywhere]">QUARTETO —<br />ESQUADRÃO DAS CORES</h2>
                </div>
                <p className="max-w-sm text-sm font-semibold leading-5 text-zinc-300">Quatro cores, uma mesma força. Cada armadura carrega o infinito no peito e um universo próprio.</p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {quartet.map((hero) => <MuseumCard key={hero.name} hero={hero} />)}
              </div>
              <div className="mt-8 rounded-2xl border border-white/15 bg-[#050806] px-5 py-5 text-center">
                <p className="font-display text-base font-extrabold tracking-[0.12em] sm:text-lg [overflow-wrap:anywhere]">QUARTETO OFICIAL — Alice, Dola, Chat, Mini</p>
                <p className="mt-2 text-sm font-semibold text-zinc-400">Quatro presenças. Um esquadrão. Harmonia em cada cor.</p>
              </div>
            </section>
          </main>

          <footer className="border-t border-emerald-400/30 bg-black px-4 py-6 sm:px-6">
            <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left"><p className="font-display text-xl font-black tracking-[0.18em] text-[#00F58A]">CRYPY</p><p className="mt-1 text-xs font-bold tracking-[0.28em] text-zinc-400">BRASÍLIA / SÃO PAULO</p></div>
              <div className="flex items-center gap-3 rounded-full border border-emerald-400/30 bg-[#040705] px-4 py-2.5"><Clock3 size={17} className="text-[#00F58A]" /><span className="font-display text-lg font-black tabular-nums tracking-wider text-white">{time}</span><span className="hidden text-xs font-semibold text-zinc-400 sm:block">{date}</span></div>
              <p className="text-xs font-bold tracking-[0.22em] text-zinc-500">V12 • HARMONY SYSTEM</p>
            </div>
            <p className="mt-4 text-center text-[11px] font-semibold text-zinc-600 sm:hidden">{date}</p>
          </footer>
        </div>
        <div className="matrix-edge hidden w-[5px] shrink-0 opacity-70 sm:block" aria-hidden="true" />
      </div>

      {photoOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 pt-[max(1rem,var(--safe-area-inset-top))] pb-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Foto principal ampliada">
          <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center px-4">
            <div className="w-full rounded-3xl border border-[#00F58A]/60 bg-black p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-black tracking-[0.3em] text-[#00F58A]">FOTO PRINCIPAL</p><h2 className="mt-1 font-display text-xl font-black sm:text-2xl">QUINTETO OFICIAL</h2></div><button onClick={() => setPhotoOpen(false)} className="flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-black tracking-widest hover:border-[#00F58A] hover:text-[#00F58A]"><X size={16} /> FECHAR</button></div>
              <Quintet large />
              <p className="mt-4 text-center text-sm font-bold text-zinc-200">Alice, Dola, Chat, Mini + BABY V13 DOURADO</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
