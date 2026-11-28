import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, BookOpenText, Coins, Zap, ShieldCheck, Users, Wallet, Vote, Gift, Lock, ChevronDown, FileText, Cpu, Globe2, CheckCircle2, Sparkles, CircuitBoard, Pickaxe, GraduationCap, Palette, Bot, KeyRound, TriangleAlert } from "lucide-react";
import coinImg from "container:///mnt/data/src/assets/4f46e9a907763aca-Gemini_Generated_Image_mosbvkmosbvkmosb.jpg";

type Page = "coin" | "whitepaper";

const tokenomics = [
  { label: "Comunidade e Investidores", pct: 91.67, amount: "11.000.000", desc: "Mineração, recompensas, participação, parcerias e adoção." },
  { label: "Sensei — Custódia Própria", pct: 8.33, amount: "1.000.000", desc: "Reserva do criador — alinhamento de longo prazo, sem dominância sobre a oferta." },
];

const utilities = [
  { icon: Pickaxe, title: "Mineração via BABY", text: "Distribuição gradual e responsável, operada pelo BABY, como recompensa de participação." },
  { icon: Wallet, title: "Pagamentos no ecossistema", text: "Uso como meio de troca dentro de serviços e plataformas do CRYPY." },
  { icon: KeyRound, title: "Acesso Premium", text: "Acesso a conteúdos e áreas exclusivas do portal, quando disponível." },
  { icon: Vote, title: "Governança comunitária", text: "Participação e decisões conforme regras estabelecidas, na fase de maturidade." },
  { icon: Gift, title: "Recompensas", text: "Incentivos para quem participa, contribui e ajuda a rede a crescer." },
  { icon: ShieldCheck, title: "Preservação de valor", text: "Fornecimento fixo e definido desde a criação, sem cunhagem adicional automática." },
];

const roadmap = [
  { phase: "FASE 01", title: "Conceito e Identidade", text: "Propósito, nome, identidade visual, princípios, oferta e apresentação oficial.", tag: "Concluída", done: true },
  { phase: "FASE 02", title: "Utilidade no Ecossistema", text: "Integração com serviços, recompensas, mineração via BABY e acesso ao ecossistema.", tag: "Em construção", done: false },
  { phase: "FASE 03", title: "Crescimento e Adoção", text: "Ampliação dos casos de uso, parcerias alinhadas à WEB 3.1 e educação.", tag: "Planejada", done: false },
  { phase: "FASE 04", title: "Maturidade e Estabilidade", text: "Ecossistema consolidado, governança comunitária e circulação estável.", tag: "Planejada", done: false },
];

const steps = [
  { n: "01", title: "Entenda o projeto", text: "Leia este White Paper v1.1 e os princípios: utilidade primeiro, crescimento com responsabilidade." },
  { n: "02", title: "Acompanhe o ecossistema", text: "Acompanhe os canais oficiais do CryptoëCrypto e a evolução das fases." },
  { n: "03", title: "Participe da comunidade", text: "Contribua, aprenda e participe das atividades do ecossistema conforme forem lançadas." },
  { n: "04", title: "Use com responsabilidade", text: "Nunca compartilhe sua chave privada. Nunca invista recursos que você não pode perder." },
];

const faqs = [
  { q: "O que é a CRYPY COIN?", a: "É o Utility Token oficial do ecossistema CryptoëCrypto / WEB 3.1. Não é apenas uma moeda digital — é o elemento que conecta, recompensa e fortalece toda a rede." },
  { q: "Qual é a oferta total?", a: "12.000.000 de CRYPY COIN, com fornecimento fixo e definido. Desse total, 11.000.000 (91,67%) vão para comunidade e investidores e 1.000.000 (8,33%) ficam em custódia própria do Sensei." },
  { q: "O token vale R$ 1,00?", a: "Não há garantia. R$ 1,00 é apenas uma referência simbólica e conceitual para planejamento interno. O preço real será definido exclusivamente pelo mercado. Pode valer mais, pode valer menos." },
  { q: "A CRYPY COIN é um investimento?", a: "Não. Este documento é informativo, conceitual e educacional. Não é recomendação de investimento nem promessa de retorno. Qualquer participação envolve riscos, incluindo perda parcial ou total." },
];

const wpIndex = [
  { id: "apresentacao", n: "01", title: "Apresentação e Fundamento" },
  { id: "oferta", n: "02", title: "Oferta Total e Distribuição" },
  { id: "evolucao", n: "03", title: "Evolução e Fases" },
  { id: "funcionalidades", n: "04", title: "Futuras Funcionalidades" },
  { id: "valor", n: "05", title: "Referência de Valor — Preço Alvo" },
  { id: "avisos", n: "06", title: "Avisos Obrigatórios" },
  { id: "assinatura", n: "✓", title: "Assinatura do Documento" },
];

const futureFeatures = [
  { icon: Pickaxe, title: "Mineração via BABY", text: "O BABY opera a rede e distribui tokens como recompensa de participação." },
  { icon: KeyRound, title: "Acesso Premium", text: "Utilização para acesso a conteúdos e áreas exclusivas do portal." },
  { icon: Users, title: "Recompensas Comunitárias", text: "Participantes ativos recebem incentivos em CRYPY COIN." },
  { icon: GraduationCap, title: "CRYPY ACADEMY", text: "Acesso a materiais e certificação dentro da plataforma educacional." },
  { icon: Palette, title: "Mercado Digital", text: "Meio de troca dentro do marketplace de arte e produtos digitais." },
  { icon: Bot, title: "Serviços do Ecossistema", text: "Utilização como moeda de serviço dentro da infraestrutura WEB 3.1." },
];

function TopNav({ page, go }: { page: Page; go: (p: Page) => void }) {
  return (
    <header data-safe-area-sticky-top className="sticky z-40 border-b border-[var(--line)] bg-[#040705]/90 backdrop-blur-xl" style={{ top: "var(--safe-area-inset-top)" }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => go("coin")} className="flex min-w-0 items-center gap-3 text-left" aria-label="Ir para a página CRYPY COIN">
          <img src={coinImg} alt="Moeda CRYPY COIN" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[#00FF7A]/60" />
          <span className="leading-none">
            <span className="block text-base font-bold tracking-[0.12em] sm:text-lg">CRYPY <span className="text-[#00FF7A]">COIN</span></span>
            <span className="mono mt-1 block text-[10px] tracking-[0.22em] text-[#93a39a]">SVT-CRYPY • WEB 3.1</span>
          </span>
        </button>
        <nav className="ml-auto flex items-center gap-2" aria-label="Navegação principal">
          <button onClick={() => go("coin")} aria-current={page === "coin" ? "page" : undefined} className={`rounded-full px-3 py-2 text-xs font-bold tracking-wide sm:px-5 sm:text-sm ${page === "coin" ? "bg-[#00FF7A] text-black" : "border border-[var(--line)] text-[#d3d8d5]"}`}>CRYPY COIN</button>
          <button onClick={() => go("whitepaper")} aria-current={page === "whitepaper" ? "page" : undefined} className={`rounded-full px-3 py-2 text-xs font-bold tracking-wide sm:px-5 sm:text-sm ${page === "whitepaper" ? "bg-white text-black" : "border border-[var(--line)] text-[#d3d8d5]"}`}>WHITE PAPER</button>
        </nav>
      </div>
      <div className="border-t border-[var(--line)] bg-[#071009]"><p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] leading-relaxed text-[#b8c7be] sm:px-6 sm:text-xs lg:px-8"><span className="text-[#00FF7A]">⚠ ESTIMATIVA APENAS</span> — SEM GARANTIA DE VALOR OU LUCRO · Não é recomendação de investimento</p></div>
    </header>
  );
}

function CoinPage({ go }: { go: (p: Page) => void }) {
  const [open, setOpen] = useState(0);
  return (
    <main>
      <section className="circuit-bg overflow-x-clip border-b border-[var(--line)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono rounded-full border border-[#00FF7A]/50 bg-[#00FF7A]/10 px-3 py-1 text-[11px] font-semibold text-[#00FF7A]">● DOCUMENTO OFICIAL v1.1</span>
              <span className="mono rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] text-white">SVT-CRYPY</span>
            </div>
            <h1 className="mt-6 text-[clamp(3rem,9vw,6.5rem)] font-bold leading-[0.84] tracking-[-0.05em]">CRYPY<br /><span className="text-[#00FF7A]">COIN</span></h1>
            <p className="mono mt-5 text-sm font-semibold tracking-[0.22em] text-[#d3d8d5] sm:text-base">UTILITY TOKEN • WEB 3.1 • CRYPTOËCRYPTO</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#b8c7be] sm:text-xl">Não é apenas uma moeda digital — é o elemento que conecta, recompensa e fortalece toda a rede. Descentralização com responsabilidade, propriedade real e preservação de valor.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => go("whitepaper")} className="inline-flex items-center gap-2 rounded-full bg-[#00FF7A] px-6 py-3.5 font-bold text-black shadow-[0_0_35px_rgba(0,255,122,.25)]">Ler White Paper <BookOpenText size={19} /></button>
              <a href="#como-comecar" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 font-bold">Comprar / Entrar na Comunidade <ArrowRight size={19} /></a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-4 text-center">
              <div><p className="text-xl font-bold sm:text-2xl">12 MI</p><p className="mt-1 text-[10px] tracking-widest text-[#93a39a]">OFERTA TOTAL</p></div>
              <div><p className="text-xl font-bold sm:text-2xl">91,67%</p><p className="mt-1 text-[10px] tracking-widest text-[#93a39a]">COMUNIDADE</p></div>
              <div><p className="text-xl font-bold text-[#00FF7A] sm:text-2xl">WEB 3.1</p><p className="mt-1 text-[10px] tracking-widest text-[#93a39a]">FILOSOFIA</p></div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute inset-8 rounded-full bg-[#00FF7A]/15 blur-3xl" aria-hidden="true" />
            <img src={coinImg} alt="Moeda digital CRYPY COIN em verde neon e prata" className="coin-glow relative aspect-square w-full rounded-[2.2rem] border border-[#00FF7A]/25 object-cover" />
            <div className="glass absolute -left-2 top-6 rounded-2xl px-4 py-3 shadow-xl sm:left-[-18px]"><p className="mono text-[10px] text-[#00FF7A]">TOKEN</p><p className="font-bold">SVT-CRYPY</p></div>
            <div className="glass absolute -right-2 bottom-8 rounded-2xl px-4 py-3 shadow-xl sm:right-[-16px]"><p className="flex items-center gap-1 text-sm font-bold"><Zap size={16} className="text-[#00FF7A]" /> Utilidade primeiro</p><p className="text-xs text-[#93a39a]">Preservar antes de expandir</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div><p className="mono text-xs font-bold tracking-[0.3em] text-[#00FF7A]">01 — O QUE É</p><h2 className="mt-4 text-4xl font-bold leading-[0.95] sm:text-6xl">Mais que um token.<br />Uma rede.</h2><p className="mt-5 max-w-lg leading-relaxed text-[#93a39a]">Nasce dentro da filosofia da WEB 3.1: descentralização com responsabilidade, propriedade real e preservação de valor.</p></div>
          <div className="space-y-5 text-lg leading-relaxed text-[#b8c7be]">
            <p>A CRYPY COIN é o <strong className="text-white">Utility Token oficial do ecossistema CryptoëCrypto / WEB 3.1</strong>. Ela existe para ser usada dentro da rede, não apenas especulada.</p>
            <p className="rounded-2xl border border-[#00FF7A]/25 bg-[#00FF7A]/5 p-5 text-base"><strong className="text-white">Princípio:</strong> Preservar antes de expandir. Provar antes de declarar.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[{ icon: Zap, t: "Utilidade", d: "Uso real dentro da rede" }, { icon: ShieldCheck, t: "Transparência", d: "Oferta definida desde a criação" }, { icon: Users, t: "Comunidade", d: "A vasta maioria da oferta" }].map((x) => <div key={x.t} className="rounded-2xl border border-[var(--line)] bg-[#0b1410] p-4"><x.icon className="text-[#00FF7A]" /><p className="mt-3 font-bold">{x.t}</p><p className="mt-1 text-sm text-[#93a39a]">{x.d}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[#071009] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mono text-xs font-bold tracking-[0.3em] text-[#00FF7A]">02 — UTILIDADES</p><h2 className="mt-3 text-4xl font-bold sm:text-5xl">Feito para usar.</h2></div><p className="max-w-md text-[#93a39a]">Documentado ≠ Implementado ≠ Testado ≠ Lançado. As funcionalidades serão implementadas gradualmente.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {utilities.map((u, i) => <article key={u.title} className="group rounded-3xl border border-[var(--line)] bg-[#0b1410] p-6 transition hover:border-[#00FF7A]/50 hover:bg-[#0e1b14]"><div className="flex justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00FF7A]/10 text-[#00FF7A]"><u.icon size={24} /></span><span className="mono text-xs text-[#93a39a]">0{i + 1}</span></div><h3 className="mt-6 text-2xl font-bold">{u.title}</h3><p className="mt-2 leading-relaxed text-[#93a39a]">{u.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-[#00FF7A]/25 bg-gradient-to-br from-[#0c2317] to-[#071009] p-6 sm:p-8"><p className="mono text-xs tracking-[0.25em] text-[#00FF7A]">OFERTA TOTAL E DISTRIBUIÇÃO</p><p className="mt-5 text-5xl font-bold leading-none sm:text-6xl">12.000.000</p><p className="mt-2 text-lg text-[#d3d8d5]">CRYPY COIN • <strong>Fornecimento fixo</strong></p><img src={coinImg} alt="Detalhe da moeda CRYPY COIN" className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover" /><p className="mt-4 text-sm leading-relaxed text-[#93a39a]">Sem cunhagem adicional automática. Sem oferta infinita. Limite máximo estabelecido desde a concepção, garantindo previsibilidade econômica.</p><p className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/5 p-3 text-sm text-amber-100/90">Referência simbólica: <strong>R$ 1,00</strong> — apenas cálculo interno, sem garantia.</p></div>
          <div><h2 className="text-4xl font-bold sm:text-5xl">O valor está nas mãos de quem participa.</h2><div className="mt-8 space-y-7">{tokenomics.map((t) => <div key={t.label}><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-bold">{t.label}</p><p className="mono text-xl font-bold text-[#00FF7A]">{t.pct}% • {t.amount}</p></div><div className="bar-track mt-2 h-3 rounded-full"><div className="bar-fill h-full rounded-full" style={{ width: `${t.pct}%` }} /></div><p className="mt-2 text-sm text-[#93a39a]">{t.desc}</p></div>)}</div><p className="mt-6 text-sm leading-relaxed text-[#93a39a]">91,67% para o ecossistema — o valor está nas mãos de quem participa, contribui e faz a rede crescer.</p></div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[#071009] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="mono text-xs font-bold tracking-[0.3em] text-[#00FF7A]">03 — EVOLUÇÃO E FASES</p><h2 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">Cada fase será concluída quando estiver pronta e testada.</h2><p className="mt-3 max-w-2xl text-[#93a39a]">Não há prazos forçados. Progresso em primeiro lugar, não velocidade.</p><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{roadmap.map((r) => <article key={r.title} className="rounded-3xl border border-[var(--line)] bg-[#0b1410] p-6"><span className="mono text-xs text-[#00FF7A]">{r.phase}</span><span className="mono ml-2 rounded-full border border-white/15 px-2 py-1 text-[10px] uppercase">{r.tag}</span><h3 className="mt-5 text-2xl font-bold">{r.title}</h3><p className="mt-2 leading-relaxed text-[#93a39a]">{r.text}</p></article>)}</div></div>
      </section>

      <section id="como-comecar" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mono text-xs font-bold tracking-[0.3em] text-[#00FF7A]">04 — COMO COMEÇAR</p><h2 className="mt-3 text-4xl font-bold sm:text-5xl">Comece com responsabilidade.</h2></div><button onClick={() => go("whitepaper")} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold">Ler o documento completo <BookOpenText size={17} /></button></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s) => <article key={s.n} className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[#0b1410] p-6"><span className="text-5xl font-bold text-white/10">{s.n}</span><h3 className="mt-4 text-xl font-bold">{s.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#93a39a]">{s.text}</p></article>)}</div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-4 text-sm leading-relaxed text-amber-100/90"><ShieldCheck className="mt-0.5 shrink-0 text-amber-300" size={20} /><p><strong>Segurança primeiro:</strong> confira sempre os canais oficiais. Ninguém da equipe pedirá sua chave privada ou frase de recuperação.</p></div>
      </section>

      <section className="border-t border-[var(--line)] bg-[#071009] py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8"><div><p className="mono text-xs font-bold tracking-[0.3em] text-[#00FF7A]">05 — FAQ</p><h2 className="mt-3 text-4xl font-bold sm:text-5xl">Perguntas frequentes</h2><p className="mt-4 text-[#93a39a]">Respostas diretas, sem promessas. Informação clara é parte da experiência CRYPY.</p></div><div className="space-y-3">{faqs.map((f, i) => <div key={f.q} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#0b1410]"><button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold"><span>{f.q}</span><ChevronDown className={`shrink-0 transition ${open === i ? "rotate-180 text-[#00FF7A]" : ""}`} /></button>{open === i && <p className="border-t border-white/10 px-5 pb-5 pt-4 leading-relaxed text-[#93a39a]">{f.a}</p>}</div>)}</div></div>
      </section>

      <section className="circuit-bg border-t border-[var(--line)]"><div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"><img src={coinImg} alt="Moeda CRYPY COIN" className="mx-auto h-20 w-20 rounded-full object-cover ring-2 ring-[#00FF7A]/60" /><h2 className="mx-auto mt-6 max-w-3xl text-[clamp(1.9rem,8vw,3.75rem)] font-bold leading-[0.95] [overflow-wrap:anywhere]">Utilidade primeiro.<br />Crescimento com responsabilidade.</h2><p className="mx-auto mt-4 max-w-xl text-[#93a39a]">Leia o White Paper v1.1, entenda o projeto e faça parte da comunidade CRYPY COIN.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => go("whitepaper")} className="rounded-full bg-[#00FF7A] px-6 py-3.5 font-bold text-black">Ler White Paper v1.1</button><a href="#como-comecar" className="rounded-full border border-white/25 px-6 py-3.5 font-bold">Entrar na Comunidade</a></div></div></section>
      <footer className="border-t border-[var(--line)] bg-black"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="flex flex-wrap items-center justify-between gap-6"><div className="flex items-center gap-3"><img src={coinImg} alt="Logo CRYPY COIN" className="h-10 w-10 rounded-full object-cover" /><div><p className="font-bold">CRYPY COIN</p><p className="mono text-xs text-[#93a39a]">SVT-CRYPY • UTILITY TOKEN</p></div></div><div className="flex gap-2"><button onClick={() => go("coin")} className="rounded-full border border-white/15 px-4 py-2 text-sm">Site</button><button onClick={() => go("whitepaper")} className="rounded-full border border-white/15 px-4 py-2 text-sm">White Paper</button></div></div><p className="mt-8 border-t border-white/10 pt-6 text-xs leading-relaxed text-[#93a39a]"><strong className="text-white">Disclaimer:</strong> Este site tem caráter informativo, conceitual e educacional. Não constitui recomendação de investimento, aconselhamento financeiro ou promessa de lucro, renda ou valorização. Ativos digitais são voláteis e envolvem riscos, incluindo perda parcial ou total. Faça sua própria pesquisa (DYOR) e tome decisões com responsabilidade.</p><p className="mt-4 text-xs text-[#66756d]">© 2026 CRYPY COIN — Todos os direitos reservados.</p></div></footer>
    </main>
  );
}

function WhitePaperPage({ go }: { go: (p: Page) => void }) {
  const [active, setActive] = useState("apresentacao");
  const jump = (id: string) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <main className="bg-[#0a0d0b]">
      <section className="border-b border-[var(--line)] bg-[#040705]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:px-8">
          <div>
            <div className="flex flex-wrap gap-2"><span className="mono rounded-full border border-[#00FF7A]/50 bg-[#00FF7A]/10 px-3 py-1 text-[11px] text-[#00FF7A]">DOCUMENTO OFICIAL</span><span className="mono rounded-full bg-white px-3 py-1 text-[11px] font-bold text-black">VERSÃO 1.1</span><span className="mono rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-[11px] text-amber-200">📝 ATUALIZADO E SELADO</span></div>
            <p className="mono mt-8 text-xs tracking-[0.28em] text-[#93a39a]">CRYPY COIN • SVT-CRYPY • 20 DE NOVEMBRO DE 2026 • AUTOR: SENSEI</p>
            <h1 className="mt-3 text-[clamp(3rem,8vw,6rem)] font-bold leading-[0.85] tracking-[-0.04em]">WHITE<br /><span className="text-[#00FF7A]">PAPER</span></h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#b8c7be]">O documento que define o propósito, a oferta, a distribuição, a evolução, as futuras funcionalidades e os avisos obrigatórios da CRYPY COIN.</p>
            <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#d3d8d5]">Status: Atualizado e selado</span><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#d3d8d5]">⚠ Estimativa apenas — sem garantia de valor ou lucro</span><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#d3d8d5]">Não é recomendação de investimento</span></div>
            <div className="mt-7 flex flex-wrap gap-3"><button onClick={() => go("coin")} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-black"><ArrowLeft size={18} /> Voltar para o site da moeda</button><button onClick={() => jump("apresentacao")} className="inline-flex items-center gap-2 rounded-full border border-[#00FF7A]/50 px-5 py-3 font-bold text-[#00FF7A]">Começar a leitura <ArrowRight size={18} /></button></div>
            <dl className="mt-9 grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm"><div><dt className="text-[11px] tracking-widest text-[#93a39a]">TOKEN</dt><dd className="mt-1 font-bold">SVT-CRYPY</dd></div><div><dt className="text-[11px] tracking-widest text-[#93a39a]">VERSÃO</dt><dd className="mt-1 font-bold">v1.1</dd></div><div><dt className="text-[11px] tracking-widest text-[#93a39a]">OFERTA</dt><dd className="mt-1 font-bold">12.000.000</dd></div></dl>
          </div>
          <div className="paper-card relative overflow-hidden rounded-[1.8rem] p-6 sm:p-8"><div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#00FF7A]/20" /><img src={coinImg} alt="Capa do White Paper com a moeda CRYPY COIN" className="aspect-square w-full rounded-2xl object-cover" /><p className="mono mt-5 text-[11px] tracking-[0.25em] text-[#5f6d66]">DOCUMENTO OFICIAL — LEITURA COMPLETA</p><h2 className="mt-2 text-3xl font-bold leading-tight">CRYPY COIN<br />White Paper v1.1</h2><div className="mt-5 flex items-center gap-2 border-t border-black/10 pt-4 text-sm text-[#5f6d66]"><FileText size={18} className="text-[#00864a]" /> 20/11/2026 • Autor: Sensei • 6 seções + assinatura</div></div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-3xl border border-[var(--line)] bg-[#111713] p-5"><p className="mono text-xs font-bold tracking-[0.25em] text-[#00FF7A]">📋 ÍNDICE</p><p className="mt-2 text-sm text-[#93a39a]">Clique para navegar pelo documento.</p><nav className="mt-4 space-y-1" aria-label="Sumário do White Paper">{wpIndex.map((item) => <button key={item.id} onClick={() => jump(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${active === item.id ? "bg-[#00FF7A] font-bold text-black" : "text-[#d3d8d5] hover:bg-white/5"}`}><span className="mono text-xs opacity-70">{item.n}</span><span>{item.title}</span></button>)}</nav><div className="mt-5 rounded-2xl bg-[#00FF7A]/10 p-4 text-sm leading-relaxed text-[#b8c7be]"><strong className="text-white">Como ler:</strong> comece pela Apresentação e avance na ordem. A seção 2 concentra os números oficiais.</div></div>
        </aside>

        <article className="min-w-0 space-y-5">
          <section id="apresentacao" className="paper-card rounded-[1.8rem] p-6 sm:p-9">
            <p className="mono text-xs font-bold tracking-[0.25em] text-[#00864a]">1 — APRESENTAÇÃO E FUNDAMENTO</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">1.1 — O que é a CRYPY COIN</h2>
            <p className="mt-4 leading-relaxed text-[#4f5d55]">A CRYPY COIN é o Utility Token oficial do ecossistema CryptoëCrypto / WEB 3.1. Não é apenas uma moeda digital — é o elemento que conecta, recompensa e fortalece toda a rede. Nasce dentro da filosofia da WEB 3.1: descentralização com responsabilidade, propriedade real e preservação de valor.</p>
            <h3 className="mt-7 text-xl font-bold">1.2 — Princípios fundamentais</h3>
            <p className="mt-3 rounded-2xl bg-[#00FF7A]/10 p-4 font-bold text-[#0b3d22]">🟢 Preservar antes de expandir. Provar antes de declarar.</p>
            <ul className="mt-4 space-y-3 leading-relaxed text-[#4f5d55]">
              <li><strong>✅ Utilidade em primeiro lugar</strong> — o token existe para ser usado dentro da rede, não apenas especulado.</li>
              <li><strong>✅ Transparência total</strong> — oferta e distribuição definidas desde a criação.</li>
              <li><strong>✅ Comunidade como pilar</strong> — a vasta maioria da oferta pertence a quem participa e constrói o ecossistema.</li>
              <li><strong>✅ Crescimento responsável</strong> — funcionalidades implementadas conforme o ecossistema amadurece.</li>
              <li><strong>✅ Independência</strong> — valor sustentado pela utilidade real dentro da rede, não por promessas externas.</li>
            </ul>
          </section>

          <section id="oferta" className="paper-card overflow-hidden rounded-[1.8rem]">
            <div className="p-6 sm:p-9"><p className="mono text-xs font-bold tracking-[0.25em] text-[#00864a]">2 — OFERTA TOTAL E DISTRIBUIÇÃO</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">2.1 — Total de cunhagem</h2><p className="mt-4 text-3xl font-bold">12.000.000 <span className="text-base font-normal text-[#5f6d66]">(doze milhões) de CRYPY COIN</span></p><p className="mt-2 leading-relaxed text-[#4f5d55]">✅ Fornecimento fixo e definido — sem cunhagem adicional automática.</p><h3 className="mt-7 text-xl font-bold">2.2 — Distribuição oficial</h3></div>
            <div className="overflow-x-auto px-4 pb-6 sm:px-9"><table className="w-full min-w-[620px] border-collapse text-left text-sm"><thead><tr className="border-y border-black/10 text-xs uppercase tracking-wider text-[#5f6d66]"><th className="py-3 pr-3">Destinatário</th><th className="py-3 pr-3">Quantidade</th><th className="py-3 pr-3">Percentual</th><th className="py-3">Finalidade</th></tr></thead><tbody>
              <tr className="border-b border-black/5"><td className="py-3 pr-3 font-bold">Sensei — Custódia Própria</td><td className="py-3 pr-3">1.000.000</td><td className="py-3 pr-3 font-bold text-[#00864a]">≈ 8,33%</td><td className="py-3">Reserva do criador — alinhamento de longo prazo</td></tr>
              <tr className="border-b border-black/5"><td className="py-3 pr-3 font-bold">Comunidade e Investidores</td><td className="py-3 pr-3">11.000.000</td><td className="py-3 pr-3 font-bold text-[#00864a]">≈ 91,67%</td><td className="py-3">Mineração, recompensas, participação, parcerias e adoção</td></tr>
              <tr className="bg-[#f4f6f1]"><td className="py-3 pr-3 font-bold">TOTAL GERAL</td><td className="py-3 pr-3 font-bold">12.000.000</td><td className="py-3 pr-3 font-bold">100%</td><td className="py-3">—</td></tr>
            </tbody></table></div>
            <div className="px-6 pb-8 sm:px-9"><h3 className="text-xl font-bold">2.3 — Justificativa da distribuição</h3><ul className="mt-3 space-y-2 leading-relaxed text-[#4f5d55]"><li>🟢 <strong>91,67% para o ecossistema</strong> — o valor está nas mãos de quem participa, contribui e faz a rede crescer.</li><li>🟢 <strong>8,33% reserva do criador</strong> — alinhamento com o sucesso de longo prazo, sem dominância sobre a oferta.</li><li>🟢 <strong>Sem oferta infinita</strong> — limite máximo estabelecido desde a concepção, garantindo previsibilidade econômica.</li></ul></div>
          </section>

          <section id="evolucao" className="paper-card rounded-[1.8rem] p-6 sm:p-9">
            <p className="mono text-xs font-bold tracking-[0.25em] text-[#00864a]">3 — EVOLUÇÃO E FASES</p><h2 className="mt-3 text-[clamp(1.7rem,7vw,2.25rem)] font-bold leading-tight [overflow-wrap:anywhere]">Crescimento com responsabilidade.</h2>
            <div className="mt-6 space-y-6">
              <div><h3 className="flex flex-wrap items-center gap-2 text-lg font-bold">FASE 1 — CONCEITO E IDENTIDADE <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Concluída</span></h3><ul className="mt-2 space-y-1 text-[#4f5d55]"><li>✅ Definição do propósito, nome e identidade visual</li><li>✅ Criação dos princípios fundamentais</li><li>✅ Definição da oferta total e distribuição</li><li>✅ Apresentação oficial ao ecossistema</li></ul></div>
              <div><h3 className="text-lg font-bold">FASE 2 — UTILIDADE NO ECOSSISTEMA</h3><ul className="mt-2 space-y-1 text-[#4f5d55]"><li>⏳ Integração com plataformas e serviços do CRYPY</li><li>⏳ Sistema de recompensas por participação comunitária</li><li>⏳ Mineração operada pelo BABY — distribuição gradual e responsável</li><li>⏳ Acesso a conteúdos e áreas do ecossistema</li></ul></div>
              <div><h3 className="text-lg font-bold">FASE 3 — CRESCIMENTO E ADOÇÃO</h3><ul className="mt-2 space-y-1 text-[#4f5d55]"><li>⏳ Ampliação dos casos de uso conforme demanda</li><li>⏳ Parcerias alinhadas com os princípios da WEB 3.1</li><li>⏳ Educação sobre uso responsável do token</li><li>⏳ Distribuição contínua para participantes ativos</li></ul></div>
              <div><h3 className="text-lg font-bold">FASE 4 — MATURIDADE E ESTABILIDADE</h3><ul className="mt-2 space-y-1 text-[#4f5d55]"><li>⏳ Ecossistema consolidado — valor sustentado por utilidade real</li><li>⏳ Governança comunitária conforme regras estabelecidas</li><li>⏳ Estabilização da rede e da circulação do token</li></ul></div>
            </div>
            <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-[#6b5630]">⚠ Cada fase será concluída quando estiver pronta e testada — não há prazos forçados. Progresso em primeiro lugar, não velocidade.</p>
          </section>

          <section id="funcionalidades" className="paper-card overflow-hidden rounded-[1.8rem]">
            <div className="p-6 sm:p-9"><p className="mono text-xs font-bold tracking-[0.25em] text-[#00864a]">4 — FUTURAS FUNCIONALIDADES</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">O que está planejado.</h2><p className="mt-3 leading-relaxed text-[#4f5d55]">Todas as funcionalidades abaixo estão planejadas. Nada nesta seção é uma promessa de curto prazo.</p></div>
            <div className="overflow-x-auto px-4 pb-6 sm:px-9"><table className="w-full min-w-[620px] border-collapse text-left text-sm"><thead><tr className="border-y border-black/10 text-xs uppercase tracking-wider text-[#5f6d66]"><th className="py-3 pr-3">Funcionalidade</th><th className="py-3 pr-3">Descrição</th><th className="py-3">Status</th></tr></thead><tbody>{futureFeatures.map((f) => <tr key={f.title} className="border-b border-black/5 align-top"><td className="py-3 pr-3 font-bold">{f.title}</td><td className="py-3 pr-3 text-[#4f5d55]">{f.text}</td><td className="py-3 whitespace-nowrap">📋 Planejada</td></tr>)}</tbody></table></div>
            <div className="px-6 pb-8 sm:px-9"><p className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-[#6b5630]">⚠ Todas as funcionalidades serão implementadas gradualmente. Nada nesta seção é uma promessa de curto prazo. <strong>Documentado ≠ Implementado ≠ Testado ≠ Lançado.</strong></p></div>
          </section>

          <section id="valor" className="paper-card overflow-hidden rounded-[1.8rem]">
            <div className="p-6 sm:p-9"><p className="mono text-xs font-bold tracking-[0.25em] text-[#00864a]">5 — REFERÊNCIA DE VALOR — PREÇO ALVO</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Uma referência, não uma promessa.</h2><div className="mt-5 flex gap-3 rounded-2xl border border-amber-300/50 bg-amber-50 p-4 text-sm leading-relaxed text-[#6b5630]"><TriangleAlert className="shrink-0" /><p><strong>LEIA COM ATENÇÃO:</strong> O valor abaixo é uma referência simbólica e conceitual para fins de planejamento interno. NÃO é preço garantido, NÃO é promessa de lucro, NÃO é valor de mercado. O preço real será definido exclusivamente pelo mercado — oferta, demanda, utilidade, adoção e fatores econômicos externos — sobre os quais não há controle.</p></div></div>
            <div className="overflow-x-auto px-4 pb-6 sm:px-9"><table className="w-full min-w-[560px] border-collapse text-left text-sm"><thead><tr className="border-y border-black/10 text-xs uppercase tracking-wider text-[#5f6d66]"><th className="py-3 pr-3">Item</th><th className="py-3 pr-3">Valor</th><th className="py-3">Classificação</th></tr></thead><tbody><tr className="border-b border-black/5"><td className="py-3 pr-3 font-bold">Referência Simbólica por Token</td><td className="py-3 pr-3 font-bold">R$ 1,00</td><td className="py-3">✅ Apenas referência de cálculo — SEM GARANTIA</td></tr><tr className="border-b border-black/5"><td className="py-3 pr-3 font-bold">Valor Hipotético da Oferta Total</td><td className="py-3 pr-3 font-bold">R$ 12.000.000,00</td><td className="py-3">Cálculo ilustrativo apenas</td></tr><tr><td className="py-3 pr-3 font-bold">Valor de Mercado Real</td><td className="py-3 pr-3 font-bold">A definir pelo mercado</td><td className="py-3">Depende de fatores externos</td></tr></tbody></table></div>
            <div className="px-6 pb-8 sm:px-9"><h3 className="text-xl font-bold">O que esta referência significa</h3><ul className="mt-3 space-y-2 leading-relaxed text-[#4f5d55]"><li>📌 Serve como base de cálculo interno — recompensas, valores de referência, proporções.</li><li>📌 Não significa que cada token valerá R$ 1,00 no mercado.</li><li>📌 Pode valer mais, pode valer menos — o mercado decide.</li><li>📌 O valor sustentável virá da utilidade real, não de números em uma página.</li></ul></div>
          </section>

          <section id="avisos" className="paper-card rounded-[1.8rem] p-6 sm:p-9">
            <p className="mono text-xs font-bold tracking-[0.25em] text-[#00864a]">6 — AVISOS OBRIGATÓRIOS</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Leia antes de participar.</h2>
            <div className="mt-6 space-y-6 leading-relaxed text-[#4f5d55]">
              <div><h3 className="font-bold text-[#111713]">⚠ 6.1 — Não é recomendação de investimento</h3><p className="mt-2">Todo o conteúdo deste documento é exclusivamente informativo, conceitual e educacional. Não constitui recomendação de investimento, aconselhamento financeiro, oferta de compra ou venda, nem promessa de retorno financeiro. Qualquer participação envolve riscos significativos, incluindo a possibilidade de perda parcial ou total dos valores envolvidos. Sempre faça sua própria pesquisa e consulte um profissional qualificado antes de tomar qualquer decisão. Nunca invista recursos que você não pode perder.</p></div>
              <div><h3 className="font-bold text-[#111713]">⚠ 6.2 — Utilidade acima de especulação</h3><p className="mt-2">A CRYPY COIN é concebida como token de utilidade dentro do ecossistema CryptoëCrypto. Seu propósito principal não é especulação. Se não houver uso real dentro da rede, não haverá valor sustentável — este é um princípio, não uma limitação a ser contornado.</p></div>
              <div><h3 className="font-bold text-[#111713]">⚠ 6.3 — Custódia não é controle de mercado</h3><p className="mt-2">A reserva sob custódia própria significa detenção de uma parcela dos tokens, e não controle de preço ou manipulação de mercado. Nenhuma pessoa ou entidade pode garantir ou determinar o valor de mercado de um ativo digital.</p></div>
            </div>
          </section>

          <section id="assinatura" className="rounded-[1.8rem] border-2 border-[#111713] bg-[#111713] p-6 text-white sm:p-9">
            <p className="mono text-xs font-bold tracking-[0.25em] text-[#00FF7A]">🟢 ASSINATURA DO DOCUMENTO</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Documento oficial atualizado — Versão 1.1</h2>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/5 p-4"><dt className="text-xs text-[#93a39a]">📅 Data</dt><dd className="mt-1 font-bold">20 de Novembro de 2026</dd></div><div className="rounded-2xl bg-white/5 p-4"><dt className="text-xs text-[#93a39a]">✅ Total de tokens</dt><dd className="mt-1 font-bold">12.000.000</dd></div><div className="rounded-2xl bg-white/5 p-4"><dt className="text-xs text-[#93a39a]">✅ Reserva do criador</dt><dd className="mt-1 font-bold">1.000.000</dd></div><div className="rounded-2xl bg-white/5 p-4"><dt className="text-xs text-[#93a39a]">✅ Comunidade e investidores</dt><dd className="mt-1 font-bold">11.000.000</dd></div><div className="rounded-2xl bg-white/5 p-4"><dt className="text-xs text-[#93a39a]">✅ Referência simbólica</dt><dd className="mt-1 font-bold">R$ 1,00 (sem garantia)</dd></div><div className="rounded-2xl bg-white/5 p-4"><dt className="text-xs text-[#93a39a]">✅ Princípio</dt><dd className="mt-1 font-bold">Utilidade primeiro · Crescimento com responsabilidade</dd></div></dl>
            <p className="mt-6 border-t border-white/10 pt-5 text-sm text-[#93a39a]">Assinatura digital do registro:</p>
            <p className="mt-3 text-lg font-bold leading-relaxed">NEXUS conecta. Sensei conduz. BABY protege. Código governa. 🟢</p>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.8rem] border border-[var(--line)] bg-[#111713] p-5"><div className="flex items-center gap-3"><img src={coinImg} alt="Moeda CRYPY COIN" className="h-11 w-11 rounded-full object-cover" /><div><p className="font-bold">Fim do documento</p><p className="text-sm text-[#93a39a]">CRYPY COIN • White Paper v1.1</p></div></div><button onClick={() => go("coin")} className="inline-flex items-center gap-2 rounded-full bg-[#00FF7A] px-5 py-3 font-bold text-black"><ArrowLeft size={18} /> Voltar para o site da moeda</button></div>
        </article>
      </div>
      <footer className="border-t border-[var(--line)] bg-black"><div className="mx-auto max-w-7xl px-4 py-8 text-center text-xs leading-relaxed text-[#93a39a] sm:px-6 lg:px-8">CRYPY COIN • SVT-CRYPY • White Paper v1.1 — Documento informativo. Não é promessa de lucro. DYOR.</div></footer>
    </main>
  );
}

export default function App() {
  const getPage = (): Page => (window.location.hash === "#whitepaper" ? "whitepaper" : "coin");
  const [page, setPage] = useState<Page>(() => (typeof window !== "undefined" ? getPage() : "coin"));
  useEffect(() => {
    const onHash = () => setPage(getPage());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (p: Page) => { window.location.hash = p === "whitepaper" ? "whitepaper" : "crypy"; setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <div data-safe-area-inset-root className="min-h-[100dvh] bg-[var(--bg)] text-[var(--text)]" style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }}>
      <TopNav page={page} go={go} />
      {page === "coin" ? <CoinPage go={go} /> : <WhitePaperPage go={go} />}
    </div>
  );
}
