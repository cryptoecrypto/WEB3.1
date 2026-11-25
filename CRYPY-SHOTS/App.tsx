import React, { useMemo, useState } from 'react';
import { Search, Play, Heart, Eye, Clock, Flame, Coins, Trophy, Zap, Sparkles, Check, Plus, Bell, X, ChevronRight, Gift, Video, Users, TrendingUp, BadgeCheck, Radio, Star, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';
import logoUrl from 'container:///mnt/data/src/assets/c79087ae85000514-Gemini_Generated_Image_v40fuav40fuav40f.jpg';

type Video = {
  id: number; title: string; creator: string; handle: string; views: string; likes: number; duration: string;
  kind: 'curto' | 'longo' | 'live'; vertical: boolean; emoji: string; gradient: string; tag: string; coins: number; liveViewers?: string;
};

const VIDEOS: Video[] = [
  { id: 1, title: 'O truque de edição que fez esse vídeo bater 1 milhão em 6 horas', creator: 'Marina Edita', handle: '@marinaedita', views: '1,2 mi', likes: 98412, duration: '0:42', kind: 'curto', vertical: true, emoji: '✂️', gradient: 'linear-gradient(145deg,#00FF88,#059669,#0f172a)', tag: 'Viral', coins: 24 },
  { id: 2, title: 'Documentário completo: como nascem os criadores que vivem de vídeo', creator: 'Estúdio Norte', handle: '@estudionorte', views: '842 mil', likes: 51200, duration: '48:12', kind: 'longo', vertical: false, emoji: '🎬', gradient: 'linear-gradient(145deg,#064e3b,#10b981,#cbd5e1)', tag: 'Documentário', coins: 80 },
  { id: 3, title: 'AO VIVO: maratona de dança + recompensas em dobro até meia-noite', creator: 'Léo & Cia', handle: '@leoecia', views: '38,4 mil assistindo', likes: 18400, duration: 'AO VIVO', kind: 'live', vertical: true, emoji: '🔥', gradient: 'linear-gradient(145deg,#00FF88,#047857,#e5e7eb)', tag: 'Ao vivo', coins: 50, liveViewers: '38,4 mil' },
  { id: 4, title: 'Receita de 15 segundos que virou febre no feed inteiro', creator: 'Cozinha da Bia', handle: '@cozinhadabia', views: '2,8 mi', likes: 221300, duration: '0:15', kind: 'curto', vertical: true, emoji: '🍳', gradient: 'linear-gradient(145deg,#34d399,#065f46,#94a3b8)', tag: 'Popular', coins: 18 },
  { id: 5, title: 'O que eu faria para crescer um canal do zero em 2026', creator: 'Rafa Cresce', handle: '@rafacresce', views: '311 mil', likes: 27400, duration: '22:47', kind: 'longo', vertical: false, emoji: '📈', gradient: 'linear-gradient(145deg,#00FF88,#0f766e,#f8fafc)', tag: 'Estratégia', coins: 62 },
  { id: 6, title: 'Bastidores de um show: 60 segundos que ninguém viu', creator: 'Som Ao Vivo', handle: '@somavivo', views: '967 mil', likes: 76300, duration: '0:58', kind: 'curto', vertical: true, emoji: '🎤', gradient: 'linear-gradient(145deg,#a7f3d0,#059669,#111827)', tag: 'Música', coins: 28 },
  { id: 7, title: 'AO VIVO: gameplay, sorteios e chat com recompensa para quem fica', creator: 'Nina Joga', handle: '@ninajoga', views: '12,1 mil assistindo', likes: 9800, duration: 'AO VIVO', kind: 'live', vertical: false, emoji: '🎮', gradient: 'linear-gradient(145deg,#00e676,#065f46,#e2e8f0)', tag: 'Games', coins: 44, liveViewers: '12,1 mil' },
  { id: 8, title: 'Um dia inteiro criando o vídeo mais ambicioso do canal', creator: 'Dupla Criativa', handle: '@duplacriativa', views: '1,5 mi', likes: 118000, duration: '1:04:20', kind: 'longo', vertical: false, emoji: '🎥', gradient: 'linear-gradient(145deg,#6ee7b7,#047857,#334155)', tag: 'Vlog', coins: 90 },
  { id: 9, title: 'Dica rápida: 3 cortes que deixam qualquer vídeo mais viciante', creator: 'Marina Edita', handle: '@marinaedita', views: '654 mil', likes: 49200, duration: '0:31', kind: 'curto', vertical: true, emoji: '⚡', gradient: 'linear-gradient(145deg,#00FF88,#10b981,#94a3b8)', tag: 'Dica', coins: 16 },
];

const TABS = [
  { id: 'voce', label: 'Para Você', desc: 'Descoberta infinita' },
  { id: 'curtos', label: 'Curtos', desc: 'Estilo Kwai' },
  { id: 'longos', label: 'Longos', desc: 'Estilo YouTube' },
  { id: 'live', label: 'Ao Vivo', desc: 'Agora' },
  { id: 'recompensas', label: 'Recompensas', desc: 'Ganhe CRYPYCOIN' },
] as const;

type TabId = typeof TABS[number]['id'];

const MISSIONS0 = [
  { id: 1, title: 'Assistir a 10 vídeos', detail: 'Vale para curtos, longos e lives', coins: 120, progress: '7/10' },
  { id: 2, title: 'Curtir 5 vídeos que você gostou', detail: 'Use o coração nos cards do feed', coins: 50, progress: '0/5' },
  { id: 3, title: 'Publicar o seu primeiro vídeo', detail: 'Curto ou longo — o formato é seu', coins: 250, progress: '0/1' },
  { id: 4, title: 'Seguir 3 criadores novos', detail: 'Descubra vozes diferentes da sua bolha', coins: 80, progress: '0/3' },
];

const PLANS = [
  { id: 'iniciante', name: 'Iniciante', price: 'Grátis', color: '#e2e8f0', desc: 'Para testar, postar e entender o seu público.', items: ['Vídeos ilimitados', 'Recompensas diárias', 'Estatísticas básicas', 'Comunidade de criadores'], cta: 'Começar grátis' },
  { id: 'criador', name: 'Criador', price: 'R$ 29 /mês', color: '#00FF88', desc: 'Para quem posta toda semana e quer crescer.', items: ['Tudo do Iniciante', 'Monetização por views', 'Edição avançada + capas', 'Prioridade na descoberta', 'Suporte em até 24h'], cta: 'Virar Criador', popular: true },
  { id: 'lenda', name: 'Lenda', price: 'R$ 89 /mês', color: '#cbd5e1', desc: 'Para canais grandes e carreiras profissionais.', items: ['Tudo do Criador', 'Receita maior por 1.000 views', 'Gerente de canal dedicado', 'Eventos e lives exclusivas', 'Selo Lenda verificado'], cta: 'Virar Lenda' },
];

function formatLikes(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')} mil`;
  return String(n);
}

export default function App() {
  const [tab, setTab] = useState<TabId>('voce');
  const [query, setQuery] = useState('');
  const [liked, setLiked] = useState<Set<number>>(new Set([4]));
  const [following, setFollowing] = useState<Set<string>>(new Set(['@marinaedita']));
  const [missions, setMissions] = useState(MISSIONS0.map(m => ({ ...m, done: false })));
  const [selectedPlan, setSelectedPlan] = useState('criador');
  const [modal, setModal] = useState<'entrar' | 'criar' | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VIDEOS.filter(v => {
      if (tab === 'curtos' && v.kind !== 'curto') return false;
      if (tab === 'longos' && v.kind !== 'longo') return false;
      if (tab === 'live' && v.kind !== 'live') return false;
      if (tab === 'recompensas' && v.coins < 40) return false;
      if (q && !(`${v.title} ${v.creator} ${v.handle} ${v.tag}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [tab, query]);

  const toggleLike = (id: number) => setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleFollow = (handle: string) => setFollowing(prev => { const n = new Set(prev); n.has(handle) ? n.delete(handle) : n.add(handle); return n; });
  const toggleMission = (id: number) => setMissions(prev => prev.map(m => m.id === id ? { ...m, done: !m.done } : m));

  const doneMissions = missions.filter(m => m.done).length;
  const earned = missions.filter(m => m.done).reduce((s, m) => s + m.coins, 0);
  const balance = 1240 + earned;
  const progress = Math.round((doneMissions / missions.length) * 100);
  const nextReward = 2000;
  const bar = Math.min(100, Math.round((balance / nextReward) * 100));

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const pickTab = (id: TabId) => { setTab(id); scrollTo('feed'); };

  return (
    <div data-safe-area-inset-root style={{ boxSizing: 'border-box', paddingTop: 'var(--safe-area-inset-top)' }} className="min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-x-clip">
      {/* TOPO */}
      <header data-safe-area-sticky-top style={{ top: 'var(--safe-area-inset-top)' }} className="sticky z-40 border-b border-white/10 bg-[#050805]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
          <a href="#topo" className="flex shrink-0 items-center gap-2.5" aria-label="CRYPYSHOTS — voltar ao topo">
            <img src={logoUrl} alt="Logo oficial CRYPYSHOTS — emblema verde neon e prata com coração/diamante" className="h-11 w-11 shrink-0 rounded-full border border-[#00FF88]/50 object-cover shadow-[0_0_22px_rgba(0,255,136,.35)]" />
            <span className="leading-none"><span className="font-display block text-[20px] font-black tracking-tight">CRYPY<span className="text-[#00FF88]">SHOTS</span></span><span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">Short Videos • Community • Web3.1</span></span>
          </a>

          <div className="order-3 flex w-full min-w-0 sm:order-2 sm:mx-4 sm:flex-1">
            <label className="flex w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 focus-within:border-[#00FF88]">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false), 150)} placeholder="Buscar vídeos, criadores, temas…" className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-zinc-500" aria-label="Buscar vídeos e criadores" />
              {query && <button onClick={() => setQuery('')} className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs" aria-label="Limpar busca">Limpar</button>}
            </label>
          </div>

          <div className="order-2 ml-auto flex shrink-0 items-center gap-2 sm:order-3 sm:ml-0">
            <button onClick={() => setModal('entrar')} className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold hover:bg-white/10">Entrar</button>
            <button onClick={() => setModal('criar')} className="hidden items-center gap-1.5 rounded-full bg-[#00FF88] px-4 py-2.5 text-sm font-extrabold text-black shadow-lg shadow-[#00FF88]/25 hover:brightness-110 sm:flex"><Plus className="h-4 w-4" /> Criar</button>
            <button onClick={() => scrollTo('recompensas')} className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10" aria-label="Ver recompensas"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#00FF88]" /></button>
          </div>
        </div>
        {searchOpen && query.trim() && (
          <div className="mx-auto max-w-[1320px] px-4 pb-3 sm:px-6"><p className="text-xs text-zinc-400"><strong className="text-white">{filtered.length}</strong> resultado{filtered.length === 1 ? '' : 's'} para “<span className="[overflow-wrap:anywhere]">{query}</span>” no feed abaixo.</p></div>
        )}
      </header>

      <main id="topo">
        {/* HERO */}
        <section className="hero-glow relative overflow-hidden border-b border-white/10">
          <div className="grain absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-[1320px] gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#00FF88]/50 bg-[#00FF88]/15 px-3 py-1 text-xs font-bold text-[#7dffc4]">✦ A FUSÃO QUE FALTAVA</span>
                <span className="rounded-full bg-[#00FF88] px-3 py-1 text-xs font-extrabold text-black">+ CRYPYCOIN POR ASSISTIR</span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <img src={logoUrl} alt="Logo oficial CRYPYSHOTS" className="h-16 w-16 rounded-full border-2 border-[#00FF88]/60 object-cover shadow-[0_0_32px_rgba(0,255,136,.45)] sm:h-20 sm:w-20" />
                <p className="font-display text-[13px] font-bold uppercase leading-tight tracking-[0.22em] text-zinc-200 sm:text-sm">Short Videos<br /><span className="text-[#00FF88]">• Community •</span><br />Web3.1</p>
              </div>
              <h1 className="font-display text-balance mt-5 text-[clamp(2.6rem,7vw,5.2rem)] font-black leading-[0.92] tracking-tight">CRYPYSHOTS<br /><span className="text-[clamp(1.6rem,4vw,3rem)] leading-[1.05]">Um só lugar.</span><br /><span className="bg-gradient-to-r from-[#00FF88] via-[#a7f3d0] to-[#e2e8f0] bg-clip-text text-transparent">Todos os vídeos.</span></h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">Recompensa de Kwai, descoberta viciante de TikTok e a força dos canais longos de YouTube. Sem trocar de app, sem perder o que você ama.</p>
              <p className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-zinc-200"><span className="text-[#00FF88]">●</span> Short Videos • Community • Web3.1</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => scrollTo('feed')} className="flex items-center gap-2 rounded-full bg-[#00FF88] px-6 py-3.5 font-extrabold text-black shadow-xl shadow-[#00FF88]/25 hover:brightness-110"><Play className="h-5 w-5 fill-black" /> Assistir Agora</button>
                <button onClick={() => setModal('criar')} className="flex items-center gap-2 rounded-full border-2 border-white/25 bg-white/5 px-6 py-3.5 font-extrabold hover:bg-white/10"><Video className="h-5 w-5 text-[#00FF88]" /> Criar Vídeo</button>
              </div>
              <dl className="mt-9 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/25 backdrop-blur">
                <div className="px-3 py-4 text-center sm:px-5"><dt className="text-[11px] uppercase tracking-wider text-zinc-400">Criadores</dt><dd className="font-display mt-1 text-xl font-bold sm:text-3xl">2,4 mi</dd></div>
                <div className="px-3 py-4 text-center sm:px-5"><dt className="text-[11px] uppercase tracking-wider text-zinc-400">Vídeos</dt><dd className="font-display mt-1 text-xl font-bold sm:text-3xl">38 mi+</dd></div>
                <div className="px-3 py-4 text-center sm:px-5"><dt className="text-[11px] uppercase tracking-wider text-zinc-400">Recompensas</dt><dd className="font-display mt-1 text-xl font-bold text-[#00FF88] sm:text-3xl">R$ 12 mi</dd></div>
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-[400px]">
              <div className="relative overflow-hidden rounded-[28px] border border-[#00FF88]/30 bg-gradient-to-br from-[#052e1d] via-[#07120c] to-[#111827] p-1 shadow-2xl shadow-[#00FF88]/20">
                <div className="relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[22px] bg-[#07120c] p-5">
                  <img src={logoUrl} alt="Emblema oficial CRYPYSHOTS" className="absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full border-2 border-[#00FF88]/50 object-cover shadow-[0_0_40px_rgba(0,255,136,.45)]" />
                  <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-extrabold">AO VIVO</span>
                  <span className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs">38,4 mil</span>
                  <p className="text-xs font-bold text-[#7dffc4]">@leoecia • dança</p>
                  <p className="mt-1 text-xl font-extrabold leading-tight [overflow-wrap:anywhere]">A maratona que paga você por assistir</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">Short Videos • Community • Web3.1</p>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/45 p-3 backdrop-blur"><span className="text-sm"><Coins className="mr-1 inline h-4 w-4 text-[#00FF88]" /><strong>+50</strong> CRYPYCOIN</span><span className="rounded-full bg-[#00FF88] px-3 py-1 text-xs font-extrabold text-black">Resgatar</span></div>
                </div>
              </div>
              <div className="absolute -left-2 top-8 rounded-2xl border border-white/15 bg-[#0a120d] px-3 py-2 shadow-xl sm:-left-8"><p className="text-xs text-zinc-400">Hoje você ganhou</p><p className="font-display text-lg font-bold text-[#00FF88]">+ 340 CRYPYCOIN</p></div>
              <div className="absolute -bottom-4 right-2 rounded-2xl border border-white/15 bg-white px-3 py-2 text-black shadow-xl"><p className="text-xs font-bold">🔥 Em alta agora</p><p className="text-xs text-zinc-600">1,2 mi assistindo</p></div>
            </div>
          </div>
        </section>

        {/* ABAS */}
        <section className="sticky top-[var(--safe-area-inset-top)] z-30 border-b border-white/10 bg-[#050805]/95 backdrop-blur-xl" data-safe-area-sticky-top>
          <div className="mx-auto flex max-w-[1320px] items-center gap-2 overflow-x-auto px-4 py-3 no-scrollbar sm:px-6">
            {TABS.map(t => (
              <button key={t.id} onClick={() => pickTab(t.id)} aria-pressed={tab === t.id} className={`shrink-0 rounded-full px-4 py-2.5 text-left transition ${tab === t.id ? 'bg-[#00FF88] text-black shadow-lg shadow-[#00FF88]/25' : 'border border-white/15 bg-white/[0.04] text-zinc-200 hover:bg-white/10'}`}>
                <span className="block text-sm font-extrabold">{t.label}</span><span className={`block text-[11px] ${tab === t.id ? 'text-emerald-900' : 'text-zinc-500'}`}>{t.desc}</span>
              </button>
            ))}
            <span className="ml-auto hidden shrink-0 items-center gap-1 text-xs text-zinc-400 lg:flex"><Flame className="h-4 w-4 text-[#00FF88]" /> O feed muda com a sua aba</span>
          </div>
        </section>

        {/* FEED */}
        <section id="feed" className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#00FF88]">Feed • {TABS.find(t => t.id === tab)?.label}</p><h2 className="font-display mt-2 text-3xl font-black sm:text-4xl">Feito para você não parar de rolar</h2><p className="mt-2 text-sm text-zinc-400">Curtos verticais, longos horizontais e lives — tudo no mesmo lugar.</p></div>
            <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-xs"><span className="h-2 w-2 rounded-full bg-[#00FF88]" /> {filtered.length} vídeo{filtered.length === 1 ? '' : 's'} neste filtro</div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/20 p-10 text-center"><p className="text-4xl">🔍</p><h3 className="mt-3 text-xl font-bold">Nenhum vídeo aqui ainda</h3><p className="mt-1 text-sm text-zinc-400">Tente outra aba ou limpe a busca.</p><button onClick={() => { setQuery(''); setTab('voce'); }} className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">Ver tudo em Para Você</button></div>
          ) : (
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(v => {
                const isLiked = liked.has(v.id);
                const isFollowing = following.has(v.handle);
                const totalLikes = v.likes + (isLiked ? 1 : 0);
                return (
                  <article key={v.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-[var(--surface)] transition hover:-translate-y-1 hover:border-[#00FF88]/50 hover:shadow-2xl hover:shadow-[#00FF88]/10">
                    <div className="relative overflow-hidden p-1.5">
                      <div className={`relative flex ${v.vertical ? 'aspect-[4/5]' : 'aspect-video'} items-center justify-center overflow-hidden rounded-[20px]`} style={{ background: v.gradient }}>
                        <span className="absolute inset-0 opacity-25 grain" aria-hidden="true" />
                        <span className="relative text-[76px] drop-shadow-[0_12px_24px_rgba(0,0,0,.45)] transition group-hover:scale-110 sm:text-[88px]" aria-hidden="true">{v.emoji}</span>
                        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold backdrop-blur">{v.tag}</span>
                        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold"><Clock className="h-3 w-3" /> {v.duration}</span>
                        <button onClick={() => setModal('criar')} className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100" aria-label={`Assistir ${v.title}`}><span className="grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-2xl"><Play className="ml-1 h-7 w-7 fill-black" /></span></button>
                        <span className="absolute bottom-3 left-3 rounded-full bg-[#00FF88] px-2.5 py-1 text-[11px] font-extrabold text-black">+{v.coins} CRYPYCOIN</span>
                        {v.kind === 'live' && <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-[11px] font-extrabold"><Radio className="h-3 w-3" /> {v.liveViewers}</span>}
                      </div>
                    </div>
                    <div className="p-4 pt-2">
                      <h3 className="min-h-[3.25rem] text-[17px] font-bold leading-snug [overflow-wrap:anywhere]">{v.title}</h3>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold">{v.creator.slice(0, 1)}</span>
                        <div className="min-w-0 flex-1"><p className="flex items-center gap-1 truncate text-sm font-bold">{v.creator} <BadgeCheck className="h-4 w-4 shrink-0 text-[#00FF88]" /></p><p className="truncate text-xs text-zinc-500">{v.handle} • {v.views} visualizações</p></div>
                        <button onClick={() => toggleFollow(v.handle)} aria-pressed={isFollowing} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold ${isFollowing ? 'bg-[#00FF88]/15 text-[#7dffc4] ring-1 ring-[#00FF88]/40' : 'bg-white text-black'}`}>{isFollowing ? '✓ Seguindo' : '+ Seguir'}</button>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                        <button onClick={() => toggleLike(v.id)} aria-pressed={isLiked} className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-bold transition ${isLiked ? 'text-[#00FF88]' : 'text-zinc-300 hover:text-white'}`}><Heart className={`h-5 w-5 ${isLiked ? 'fill-[#00FF88] text-[#00FF88] scale-110' : ''}`} /> {formatLikes(totalLikes)}</button>
                        <span className="flex items-center gap-1 text-sm text-zinc-400"><Eye className="h-4 w-4" /> {v.views}</span>
                        <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-xs font-bold text-[#7dffc4]">Assistir</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* COMO FUNCIONA */}
        <section className="border-y border-white/10 bg-[#070d09]">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16">
            <div className="max-w-3xl"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#00FF88]">A fusão explicada</p><h2 className="font-display mt-2 text-3xl font-black sm:text-5xl">Como funciona a fusão</h2><p className="mt-3 text-zinc-400">Três mundos, uma experiência só. Você escolhe como assistir — e como ganhar.</p></div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { n: '01', icon: Gift, title: 'Assista e Ganhe', origin: 'O melhor do Kwai', color: 'text-[#00FF88]', bg: 'bg-[#00FF88]/15', text: 'Cada minuto conta. Assista, complete missões e transforme atenção em CRYPYCOIN — sem complicação.', points: ['Missões diárias simples', 'Recompensa por tempo assistido', 'Resgate rápido e transparente'] },
                { n: '02', icon: Zap, title: 'Descubra e Viralize', origin: 'O melhor do TikTok', color: 'text-zinc-100', bg: 'bg-white/10', text: 'Um feed que aprende com você e entrega o próximo vídeo certo — antes mesmo de você saber que queria ver.', points: ['Feed Para Você inteligente', 'Tendências em tempo real', 'Formato vertical viciante'] },
                { n: '03', icon: TrendingUp, title: 'Crie e Monetize', origin: 'O melhor do YouTube', color: 'text-[#7dffc4]', bg: 'bg-emerald-500/15', text: 'Canais, vídeos longos, séries e receita de verdade. Cresça com estrutura, não só com sorte.', points: ['Canais e séries', 'Monetização profissional', 'Ferramentas para criadores'] },
              ].map(item => (
                <article key={item.n} className="rounded-3xl border border-white/10 bg-[var(--surface)] p-6">
                  <div className="flex items-start justify-between"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${item.bg}`}><item.icon className={`h-6 w-6 ${item.color}`} /></span><span className="font-display text-4xl font-black text-white/10">{item.n}</span></div>
                  <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-zinc-400">{item.origin}</p><h3 className="mt-1 text-2xl font-extrabold">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.text}</p>
                  <ul className="mt-5 space-y-2">{item.points.map(p => <li key={p} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00FF88]" /> {p}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* RECOMPENSAS */}
        <section id="recompensas" className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16">
          <div className="overflow-hidden rounded-[28px] border border-[#00FF88]/25 bg-gradient-to-br from-[#071a10] via-[#0a120c] to-[#111827] p-5 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-start">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#00FF88] px-3 py-1 text-xs font-extrabold text-black"><Coins className="h-4 w-4" /> CRYPYCOIN</span>
                <h2 className="font-display mt-4 text-3xl font-black sm:text-5xl">Seu tempo vale moeda.</h2>
                <p className="mt-3 text-zinc-300">Complete missões, acumule CRYPYCOIN e acompanhe o seu progresso. Toque em uma missão para marcar ou desmarcar.</p>
                <div className="mt-6 rounded-3xl border border-white/15 bg-black/30 p-5">
                  <div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-zinc-400">Saldo atual</p><p className="font-display text-4xl font-black text-[#00FF88] sm:text-5xl">{balance.toLocaleString('pt-BR')} <span className="text-base text-white">CRYPY</span></p></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{doneMissions}/{missions.length} missões</span></div>
                  <div className="mt-5"><div className="flex justify-between text-xs text-zinc-400"><span>Progresso até 2.000 CRYPY</span><span>{bar}%</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#00FF88] via-[#a7f3d0] to-[#e2e8f0] transition-all duration-500" style={{ width: `${bar}%` }} /></div></div>
                  <div className="mt-5 flex flex-wrap gap-2"><button onClick={() => scrollTo('feed')} className="rounded-full bg-[#00FF88] px-4 py-2.5 text-sm font-extrabold text-black">Ganhar assistindo</button><button onClick={() => setMissions(MISSIONS0.map(m => ({ ...m, done: false })))} className="rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold">Zerar missões de hoje</button></div>
                </div>
                <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-zinc-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#00FF88]" /> Recompensas são uma forma de reconhecer a sua atenção. Os valores desta página são uma demonstração do produto.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-xl font-bold">Missões diárias</h3>
                {missions.map(m => (
                  <button key={m.id} onClick={() => toggleMission(m.id)} aria-pressed={m.done} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${m.done ? 'border-[#00FF88]/40 bg-[#00FF88]/10' : 'border-white/12 bg-black/25 hover:bg-black/40'}`}>
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${m.done ? 'border-[#00FF88] bg-[#00FF88] text-black' : 'border-white/25'}`}>{m.done ? <Check className="h-5 w-5" /> : <span className="text-xs font-bold">{m.id}</span>}</span>
                    <span className="min-w-0 flex-1"><span className={`block font-bold [overflow-wrap:anywhere] ${m.done ? 'line-through opacity-70' : ''}`}>{m.title}</span><span className="block text-xs text-zinc-400">{m.detail} • {m.progress}</span></span>
                    <span className="shrink-0 rounded-full bg-[#00FF88] px-3 py-1 text-xs font-extrabold text-black">+{m.coins}</span>
                  </button>
                ))}
                <div className="rounded-2xl border border-dashed border-white/20 p-4 text-sm text-zinc-300"><strong className="text-white">Progresso de missões: {progress}%</strong><p className="mt-1">Você já somou <strong className="text-[#00FF88]">+{earned} CRYPYCOIN</strong> com as missões marcadas nesta visita.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* CRIADORES */}
        <section id="criadores" className="border-t border-white/10 bg-[#070d09]">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#00FF88]">Para criadores</p><h2 className="font-display mt-2 text-3xl font-black sm:text-5xl">Crie em qualquer formato. Cresça de verdade.</h2></div><p className="max-w-xs text-sm text-zinc-400">Escolha um plano para ver os benefícios destacados. O plano selecionado fica em destaque.</p></div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {PLANS.map(p => {
                const active = selectedPlan === p.id;
                return <article key={p.id} className={`relative rounded-3xl border p-6 transition ${active ? 'border-[#00FF88]/50 bg-[var(--surface-2)] shadow-2xl lg:-translate-y-2' : 'border-white/10 bg-[var(--surface)]'}`}>
                  {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-[#00FF88] px-3 py-1 text-xs font-extrabold text-black shadow-lg">MAIS ESCOLHIDO</span>}
                  <div className="flex items-center justify-between"><h3 className="font-display text-xl font-bold">{p.name}</h3><Star className="h-5 w-5" style={{ color: p.color }} /></div>
                  <p className="font-display mt-3 text-3xl font-black">{p.price}</p><p className="mt-2 min-h-[3rem] text-sm text-zinc-400">{p.desc}</p>
                  <ul className="mt-5 space-y-2.5">{p.items.map(i => <li key={i} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: p.color }} /> {i}</li>)}</ul>
                  <button onClick={() => setSelectedPlan(p.id)} aria-pressed={active} className={`mt-6 w-full rounded-full py-3 text-sm font-extrabold transition ${active ? 'bg-[#00FF88] text-black' : 'bg-white/10 hover:bg-white/15'}`}>{active ? '✓ Plano selecionado' : p.cta}</button>
                </article>;
              })}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-[#00FF88]/25 via-emerald-500/20 to-zinc-400/20 p-5 sm:p-6">
              <div className="flex items-center gap-4"><img src={logoUrl} alt="Logo CRYPYSHOTS" className="h-12 w-12 shrink-0 rounded-full border border-[#00FF88]/50 object-cover" /><div><h3 className="text-xl font-extrabold">Pronto para postar o seu primeiro vídeo?</h3><p className="text-sm text-zinc-300">Curto, longo ou ao vivo — comece pelo formato que combina com você.</p></div></div>
              <button onClick={() => setModal('criar')} className="flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 font-extrabold text-black">Começar a criar <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-black/40">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div><a href="#topo" className="flex items-center gap-2"><img src={logoUrl} alt="Logo CRYPYSHOTS" className="h-10 w-10 rounded-full border border-[#00FF88]/50 object-cover" /><span className="font-display text-xl font-black">CRYPY<span className="text-[#00FF88]">SHOTS</span></span></a><p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">Short Videos • Community • Web3.1</p><p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">Kwai + TikTok + YouTube em um só lugar. Assista, descubra, crie e ganhe.</p><div className="mt-4 flex gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">🎬 Vídeos</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">🪙 CRYPYCOIN</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">🔴 Ao vivo</span></div></div>
          <nav aria-label="Explorar"><h3 className="text-sm font-extrabold uppercase tracking-widest">Explorar</h3><ul className="mt-4 space-y-2.5 text-sm text-zinc-400">{['Para Você', 'Curtos', 'Longos', 'Ao Vivo', 'Recompensas'].map((x, i) => <li key={x}><button onClick={() => pickTab(TABS[i].id)} className="hover:text-white">{x}</button></li>)}</ul></nav>
          <nav aria-label="Criadores"><h3 className="text-sm font-extrabold uppercase tracking-widest">Criadores</h3><ul className="mt-4 space-y-2.5 text-sm text-zinc-400"><li><button onClick={() => scrollTo('criadores')} className="hover:text-white">Planos</button></li><li><button onClick={() => setModal('criar')} className="hover:text-white">Publicar vídeo</button></li><li><button onClick={() => scrollTo('recompensas')} className="hover:text-white">Monetização</button></li><li><button onClick={() => scrollTo('recompensas')} className="hover:text-white">Programa de recompensas</button></li></ul></nav>
          <nav aria-label="Ajuda"><h3 className="text-sm font-extrabold uppercase tracking-widest">Ajuda</h3><ul className="mt-4 space-y-2.5 text-sm text-zinc-400"><li><button onClick={() => setModal('entrar')} className="hover:text-white">Entrar</button></li><li><button onClick={() => scrollTo('recompensas')} className="hover:text-white">Como ganhar CRYPYCOIN</button></li><li><button onClick={() => scrollTo('topo')} className="hover:text-white">Segurança</button></li><li><button onClick={() => scrollTo('topo')} className="hover:text-white">Termos e privacidade</button></li></ul></nav>
        </div>
        <div className="border-t border-white/10"><div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-zinc-500 sm:px-6"><span>© 2026 CRYPYSHOTS. Feito para quem ama vídeo.</span><span className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5 text-[#00FF88]" /> Um só lugar. Todos os vídeos.</span></div></div>
      </footer>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm pt-[max(1rem,var(--safe-area-inset-top))] pb-6" role="dialog" aria-modal="true" aria-label={modal === 'entrar' ? 'Entrar no CRYPYSHOTS' : 'Criar vídeo'}>
          <div className="mx-auto flex min-h-full w-full max-w-lg items-center justify-center px-4">
            <div className="w-full rounded-[28px] border border-white/15 bg-[#0a120d] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4"><div><img src={logoUrl} alt="Logo CRYPYSHOTS" className="h-12 w-12 rounded-full border border-[#00FF88]/50 object-cover" /><h2 className="font-display mt-4 text-2xl font-black">{modal === 'entrar' ? 'Bem-vindo de volta' : 'Crie o seu próximo vídeo'}</h2><p className="mt-1 text-sm text-zinc-400">{modal === 'entrar' ? 'Entre para salvar seus vídeos, seguir criadores e ganhar CRYPYCOIN.' : 'Escolha um formato e comece. Você pode publicar curto, longo ou ao vivo.'}</p></div><button onClick={() => setModal(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Fechar"><X className="h-5 w-5" /></button></div>
              <div className="mt-6 space-y-3">
                {(modal === 'entrar' ? [['🎬', 'Seu feed personalizado', 'Curtos, longos e lives no mesmo lugar'], ['🪙', 'Recompensas diárias', 'Ganhe CRYPYCOIN por assistir e criar'], ['🚀', 'Cresça como criador', 'Monetização e ferramentas profissionais']] : [['⚡', 'Curto • 15s a 60s', 'Ideal para viralizar rápido'], ['🎥', 'Longo • 10min a 1h+', 'Ideal para contar histórias completas'], ['🔴', 'Ao Vivo', 'Converse com a sua comunidade agora']]).map(([e, t, d]) => (
                  <div key={t} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><span className="text-2xl">{e}</span><span><span className="block font-bold">{t}</span><span className="block text-sm text-zinc-400">{d}</span></span><ChevronRight className="ml-auto h-4 w-4 text-zinc-500" /></div>
                ))}
              </div>
              <button onClick={() => { setModal(null); scrollTo(modal === 'entrar' ? 'feed' : 'criadores'); }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#00FF88] py-3.5 font-extrabold text-black">{modal === 'entrar' ? 'Explorar como visitante' : 'Ver planos para criadores'} <ArrowRight className="h-4 w-4" /></button>
              <p className="mt-3 text-center text-xs text-zinc-500">Demonstração de produto — nenhuma conta é criada nesta página.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
