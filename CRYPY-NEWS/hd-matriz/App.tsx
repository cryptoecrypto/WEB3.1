import React, { useState } from 'react';
import { ArrowLeft, Coins, Wallet, Users, ArrowUpRight, ShieldCheck, Zap, Globe } from 'lucide-react';

type Screen = 'menu' | 'token' | 'carteira' | 'comunidade';

type PageContent = {
  id: Exclude<Screen, 'menu'>;
  title: string;
  kicker: string;
  icon: React.ReactNode;
  intro: string;
  points: string[];
  exampleLabel: string;
  exampleHref: string;
  badge: string;
  statValue: string;
  statLabel: string;
};

const pages: PageContent[] = [
  {
    id: 'token',
    title: 'TOKEN',
    kicker: 'Ativo digital • Protótipo',
    icon: <Coins className="h-7 w-7" />,
    intro: 'Este é o espaço de exemplo do TOKEN. Aqui vai entrar a descrição oficial, as regras principais e o caminho para quem quiser conhecer o projeto com calma.',
    points: ['Conceito e utilidade do token', 'Informações essenciais em linguagem simples', 'Próximos passos para a comunidade'],
    exampleLabel: 'Ver exemplo do TOKEN',
    exampleHref: '#exemplo-token',
    badge: 'EXEMPLO • 01',
    statValue: '1.0',
    statLabel: 'Versão do protótipo',
  },
  {
    id: 'carteira',
    title: 'CARTEIRA',
    kicker: 'Acesso • Protótipo',
    icon: <Wallet className="h-7 w-7" />,
    intro: 'Esta é a página de exemplo da CARTEIRA. Aqui vão entrar as instruções de acesso, os cuidados de segurança e o atalho principal para começar.',
    points: ['Como acessar a carteira', 'Boas práticas de segurança', 'Suporte e perguntas frequentes'],
    exampleLabel: 'Ver exemplo da CARTEIRA',
    exampleHref: '#exemplo-carteira',
    badge: 'EXEMPLO • 02',
    statValue: '3 passos',
    statLabel: 'Fluxo de acesso',
  },
  {
    id: 'comunidade',
    title: 'COMUNIDADE',
    kicker: 'Pessoas • Protótipo',
    icon: <Users className="h-7 w-7" />,
    intro: 'Esta é a página de exemplo da COMUNIDADE. Aqui vão entrar os canais oficiais, as regras de convivência e os avisos mais importantes do projeto.',
    points: ['Canais oficiais da comunidade', 'Regras de convivência', 'Avisos e novidades'],
    exampleLabel: 'Ver exemplo da COMUNIDADE',
    exampleHref: '#exemplo-comunidade',
    badge: 'EXEMPLO • 03',
    statValue: 'Aberta',
    statLabel: 'Para novos membros',
  },
];

function BackButton({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="ghost-button flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-left text-base font-bold tracking-wide text-white sm:w-auto sm:min-w-[220px]"
      aria-label={label}
    >
      <span aria-hidden="true">⬅</span>
      <span>VOLTAR</span>
    </button>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const active = pages.find((page) => page.id === screen);

  const goMenu = () => setScreen('menu');
  const goTo = (next: Screen) => setScreen(next);

  return (
    <div
      data-safe-area-inset-root
      className="relative min-h-screen overflow-x-clip bg-[var(--bg)] text-[var(--text)]"
      style={{ boxSizing: 'border-box', paddingTop: 'var(--safe-area-inset-top)' }}
    >
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[480px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 top-72 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-6 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goMenu}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold tracking-[0.18em]"
            aria-label="Voltar para o menu principal"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-xs">W</span>
            WEB3.1
          </button>
          <div className="mono flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-[11px] font-semibold text-emerald-300">
            <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            PROTÓTIPO ATIVO
          </div>
        </header>

        {screen === 'menu' ? (
          <main className="enter flex flex-1 flex-col justify-center py-8 sm:py-12">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <section aria-labelledby="main-title">
                <p className="mono mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" /> Teste simples • Navegação direta
                </p>
                <h1 id="main-title" className="hero-title font-bold">
                  WEB<span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">3.1</span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                  Escolha uma porta de entrada. Cada botão abre uma página de exemplo — sem cadastro, sem complicação e com retorno rápido para o menu.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
                  <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Fluxo simples</span>
                  <span className="flex items-center gap-2"><Globe className="h-4 w-4 text-sky-400" aria-hidden="true" /> Feito para celular</span>
                </div>
              </section>

              <nav className="flex flex-col gap-4" aria-label="Menu principal">
                {pages.map((page, index) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => goTo(page.id)}
                    className="glow-button group flex w-full items-center gap-4 rounded-[26px] p-5 text-left sm:p-6"
                    aria-label={`Abrir página ${page.title}`}
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">{page.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="mono block text-[11px] font-semibold tracking-[0.24em] text-cyan-100/80">0{index + 1} • ABRIR PÁGINA</span>
                      <span className="mt-1 block text-2xl font-bold tracking-wide sm:text-3xl">{page.title}</span>
                    </span>
                    <ArrowUpRight className="h-6 w-6 shrink-0 text-white/80 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                ))}
                <p className="px-1 text-center text-sm text-[var(--muted)] sm:text-left">Toque em um botão para ver a página correspondente.</p>
              </nav>
            </div>
          </main>
        ) : active ? (
          <main className="enter flex flex-1 flex-col py-6 sm:py-9" key={active.id}>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <BackButton onBack={goMenu} label="Voltar para o menu principal" />
              <span className="mono rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-violet-200">{active.badge}</span>
            </div>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]" aria-labelledby="page-title">
              <div className="rounded-[28px] border border-white/10 bg-[var(--surface)] p-5 sm:p-8">
                <p className="mono text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">{active.kicker}</p>
                <div className="mt-4 flex items-start gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500">{active.icon}</span>
                  <h1 id="page-title" className="text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl">{active.title}</h1>
                </div>
                <p className="mt-6 text-base leading-relaxed text-[var(--muted)] sm:text-lg">{active.intro}</p>
                <ul className="mt-7 space-y-3">
                  {active.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm sm:text-base">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-violet-400 to-sky-400" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7 rounded-2xl border border-dashed border-sky-300/40 bg-sky-400/5 p-4">
                  <p className="mono text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Link de exemplo</p>
                  <a className="example-link mt-2 inline-flex items-center gap-2 break-words font-semibold" href={active.exampleHref} onClick={(event) => event.preventDefault()}>
                    {active.exampleLabel} <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </a>
                  <p className="mt-2 text-sm text-[var(--muted)]">Este é um link de demonstração. Depois ele pode apontar para o destino final.</p>
                </div>
              </div>

              <aside className="flex flex-col gap-5">
                <div className="rounded-[28px] bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 p-6 sm:p-7">
                  <p className="mono text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Destaque do protótipo</p>
                  <p className="mt-5 text-4xl font-bold sm:text-5xl">{active.statValue}</p>
                  <p className="mt-2 text-white/85">{active.statLabel}</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-[var(--surface-2)] p-6">
                  <h2 className="text-lg font-bold">Como funciona?</h2>
                  <p className="mt-2 leading-relaxed text-[var(--muted)]">Você entrou na página de <strong className="text-white">{active.title}</strong>. Quando terminar, use o botão <strong className="text-white">VOLTAR</strong> no topo ou embaixo para retornar ao menu.</p>
                </div>
              </aside>
            </section>

            <div className="mt-8 flex justify-start sm:justify-end">
              <BackButton onBack={goMenu} label="Voltar para o menu principal, no final da página" />
            </div>
          </main>
        ) : null}

        <footer className="mt-auto border-t border-white/10 pt-5 text-center">
          <p className="text-sm font-semibold text-white sm:text-base">TESTE - depois é só trocar os links prontos dentro de cada botão</p>
          <p className="mono mt-2 text-[11px] tracking-[0.18em] text-[var(--muted)]">WEB3.1 • PROTÓTIPO • SEM LINKS EXTERNOS REAIS</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
