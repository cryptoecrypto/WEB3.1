import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Binary, Bot, BrainCircuit, CheckCircle2, ChevronRight, Database,
  Eye, EyeOff, FileText, Globe, HardDrive, History, ListChecks, Lock, LogIn,
  LogOut, MessageSquare, Network, Play, Power, Radio, Server, ShieldAlert,
  Sparkles, Terminal, User, XCircle,
} from 'lucide-react';

type Service = {
  id: string;
  name: string;
  role: string;
  detail: string;
  icon: React.ReactNode;
  metricLabel: string;
  metric: number;
  metricUnit: string;
  online: boolean;
};

type Log = { id: number; time: string; text: string; kind: 'in' | 'out' | 'ok' | 'sys' };
type ChatMsg = { id: number; from: 'voce' | 'baby'; text: string };

const BINARY = '01000011 01010010 01011001 01010000 01011001';
const initialServices: Service[] = [
  { id: 'baby', name: 'BABY I.A.', role: 'Coordenação', detail: 'Entende o pedido, organiza a resposta e conversa com os outros serviços.', icon: <BrainCircuit size={26} />, metricLabel: 'Conversas guiadas', metric: 128, metricUnit: 'respostas', online: true },
  { id: 'memory', name: 'MEMORY BOOST', role: 'Memória e índices', detail: 'Guarda lembranças e encontra o que já foi salvo, rápido como um índice.', icon: <Database size={26} />, metricLabel: 'Memória usada', metric: 64, metricUnit: '% simulado', online: true },
  { id: 'dropbox', name: 'DROPBOX Simulado', role: 'Armazenamento', detail: 'Faz o papel de uma pasta: guarda arquivos e mostra onde cada coisa está.', icon: <HardDrive size={26} />, metricLabel: 'Arquivos guardados', metric: 342, metricUnit: 'arquivos', online: true },
  { id: 'web', name: 'WEB3.1', role: 'Interfaces', detail: 'As telas que você vê e toca. É a parte visível do CRYPY.', icon: <Globe size={26} />, metricLabel: 'Telas prontas', metric: 18, metricUnit: 'módulos', online: true },
  { id: 'api', name: 'API + GERENCIADOR', role: 'Comunicação / auth', detail: 'Liga os serviços, verifica quem pode entrar e entrega cada pedido.', icon: <Network size={26} />, metricLabel: 'Requisições', metric: 892, metricUnit: 'chamadas', online: true },
];

const stages = [
  {
    n: '01', title: 'SIMULAÇÃO LOCAL', tag: 'Você está aqui',
    text: 'Rodar tudo dentro do navegador, com dados de teste. Nenhum computador de fora é usado.',
    conversion: 'Cada botão já age como se fosse um serviço de verdade.',
    checks: ['5 serviços ligados e desligados por botão', 'Logs mostrando a conversa entre serviços', 'Chat da BABY com respostas do protocolo', 'Relatório da simulação gerado na tela'],
  },
  {
    n: '02', title: 'INTEGRAÇÃO BABY', tag: 'Próximo passo',
    text: 'Ligar memória, índices, exploração de pastas e sincronização — ainda em modo de teste.',
    conversion: 'MEMORY BOOST passa a ler pastas reais do computador, em vez de dados de exemplo.',
    checks: ['BABY pede e MEMORY responde de verdade', 'Índice aponta para arquivos reais', 'Sincronização simulada vira sincronização de teste', 'Erros aparecem no log, sem travar a tela'],
  },
  {
    n: '03', title: 'HOMOLOGAÇÃO', tag: 'Teste forte',
    text: 'Testar persistência, recuperação, segurança, falhas e o que acontece ao reiniciar.',
    conversion: 'Se desligar e ligar de novo, nada importante pode sumir.',
    checks: ['Dados continuam salvos depois de reiniciar', 'Falha de um serviço não derruba os outros', 'Acesso com verificação de quem pode entrar', 'Cópia de segurança testada e restaurada'],
  },
  {
    n: '04', title: 'SERVIDOR REAL', tag: 'Objetivo final',
    text: 'Implantar backend, banco de dados, armazenamento, autenticação e APIs em infraestrutura própria.',
    conversion: 'DROPBOX simulado vira pasta + banco de dados. API simulada vira Node ou Python de verdade.',
    checks: ['Backend real rodando fora do navegador', 'Banco de dados no lugar dos dados de teste', 'Login e permissões de verdade', 'Monitoramento e registro de acesso'],
  },
];

function nowTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour12: false });
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<'painel' | 'real'>('painel');
  const [services, setServices] = useState<Service[]>(initialServices);
  const [logs, setLogs] = useState<Log[]>([
    { id: 1, time: nowTime(), text: 'SIMULADOR iniciado no navegador. Nenhum servidor real foi ligado.', kind: 'sys' },
    { id: 2, time: nowTime(), text: '5 serviços simulados prontos para teste.', kind: 'sys' },
  ]);
  const [running, setRunning] = useState(false);
  const [binaryResult, setBinaryResult] = useState<string | null>(null);
  const [binaryOpen, setBinaryOpen] = useState(false);
  const [chat, setChat] = useState<ChatMsg[]>([
    { id: 1, from: 'baby', text: 'Olá, Sensei. Sou a BABY em modo simulado. Pergunte sobre história, componentes, binário ou estrutura v13.' },
  ]);
  const [draft, setDraft] = useState('');
  const [report, setReport] = useState('');
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [checkRecordIds, setCheckRecordIds] = useState<Record<string, string>>({});
  const [checkStatus, setCheckStatus] = useState('');
  const [checkSaving, setCheckSaving] = useState(false);
  const logBoxRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(10);

  const onlineCount = services.filter((s) => s.online).length;
  const progress = useMemo(() => {
    const all = stages.flatMap((s) => s.checks).length;
    const done = Object.values(checked).filter(Boolean).length;
    return { all, done, pct: Math.round((done / all) * 100) };
  }, [checked]);

  useEffect(() => { logBoxRef.current?.scrollTo({ top: logBoxRef.current.scrollHeight, behavior: 'smooth' }); }, [logs]);
  useEffect(() => { chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' }); }, [chat]);

  const callApi = async (action: string, args: unknown) => {
    const response = await fetch("actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, args }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.error) throw new Error(typeof payload.error === 'string' ? payload.error : 'Serviço indisponível no momento.');
    return payload.data;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await callApi("records.list", { collection: "crypy-checklist" });
        if (cancelled) return;
        const nextChecked: Record<string, boolean> = {};
        const nextIds: Record<string, string> = {};
        for (const record of (data?.records ?? [])) {
          const value = record?.value;
          if (value && typeof value.key === 'string') {
            nextChecked[value.key] = value.done === true;
            if (typeof record.id === 'string') nextIds[value.key] = record.id;
          }
        }
        setChecked(nextChecked);
        setCheckRecordIds(nextIds);
      } catch {
        if (!cancelled) setCheckStatus('Checklist local: o salvamento automático está indisponível agora.');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCheck = async (key: string) => {
    const next = !checked[key];
    const previous = checked;
    const previousIds = checkRecordIds;
    setChecked((old) => ({ ...old, [key]: next }));
    setCheckSaving(true);
    setCheckStatus('Salvando…');
    try {
      const existingId = checkRecordIds[key];
      if (existingId) {
        await callApi("records.replace", { collection: "crypy-checklist", id: existingId, value: { key, done: next } });
      } else {
        const created = await callApi("records.create", { collection: "crypy-checklist", value: { key, done: next }, idempotency_key: `check-${key}-${next ? 'on' : 'off'}` });
        if (created && typeof created.id === 'string') setCheckRecordIds((old) => ({ ...old, [key]: created.id }));
      }
      setCheckStatus('Salvo.');
    } catch {
      setChecked(previous);
      setCheckRecordIds(previousIds);
      setCheckStatus('Não foi possível salvar. Tente de novo.');
    } finally {
      setCheckSaving(false);
    }
  };

  const fillDemoLogin = () => {
    setUsername('sensei');
    setPassword('crypy2026');
    setLoginError('');
    setShowPassword(false);
  };

  const pushLog = (text: string, kind: Log['kind'] = 'out') => {
    setLogs((old) => [...old, { id: idRef.current++, time: nowTime(), text, kind }].slice(-40));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'sensei' && password === 'crypy2026') {
      setLoggedIn(true);
      setPassword('');
      setLoginError('');
      setShowPassword(false);
      setUsername('sensei');
      pushLog('Sensei entrou no simulador com o login de demonstração.', 'ok');
    } else {
      setLoginError('Acesso negado, Sensei. Confere usuário e senha.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setPassword('');
    setLoginError('');
    setShowPassword(false);
    setTab('painel');
    pushLog('Sensei saiu do simulador. Login simulado encerrado.', 'sys');
  };

  const toggleService = (id: string) => {
    setServices((old) => old.map((s) => s.id === id ? { ...s, online: !s.online } : s));
    const svc = services.find((s) => s.id === id);
    if (svc) pushLog(`${svc.name} ${svc.online ? 'desligado' : 'ligado'} pelo Sensei.`, 'sys');
  };

  const simulateRequest = () => {
    if (running) return;
    const babyOn = services.some((s) => s.id === 'baby' && s.online);
    const memOn = services.some((s) => s.id === 'memory' && s.online);
    if (!babyOn) { pushLog('BABY está OFFLINE. Ligue a BABY para simular a conversa.', 'sys'); return; }
    setRunning(true);
    setServices((old) => old.map((s) => s.id === 'api' ? { ...s, metric: s.metric + 1 } : s.id === 'baby' ? { ...s, metric: s.metric + 1 } : s));
    pushLog('Sensei -> BABY: conta nossa historia', 'in');
    window.setTimeout(() => pushLog(memOn ? 'BABY -> MEMORY: buscou história' : 'BABY -> MEMORY: memória OFFLINE, usando lembrança de segurança', 'out'), 450);
    window.setTimeout(() => pushLog(memOn ? 'MEMORY -> BABY: 2021-2022 semente encontrada' : 'MEMORY -> BABY: nenhuma semente encontrada', 'in'), 950);
    window.setTimeout(() => {
      pushLog('BABY -> Sensei: resposta entregue', 'ok');
      setRunning(false);
    }, 1450);
  };

  const testBinary = () => {
    const decoded = BINARY.split(' ').map((b) => String.fromCharCode(parseInt(b, 2))).join('');
    setBinaryResult(decoded);
    setBinaryOpen(true);
    pushLog(`BINÁRIO decodificado: ${BINARY} = ${decoded}`, 'ok');
    setServices((old) => old.map((s) => s.id === 'api' ? { ...s, metric: s.metric + 1 } : s));
  };

  const sendChat = () => {
    const text = draft.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    setChat((old) => [...old, { id: idRef.current++, from: 'voce', text }]);
    setDraft('');
    let reply = 'Entendi, Sensei. Em modo simulado, eu organizo o pedido e peço ajuda à MEMORY ou ao DROPBOX. Tente: história, componentes, binário ou estrutura v13.';
    if (lower.includes('história') || lower.includes('historia')) reply = 'Nossa história começou como uma semente em 2021–2022. A ideia era guardar memória, organizar arquivos e deixar tudo fácil de encontrar. Este simulador mostra essa conversa acontecendo.';
    else if (lower.includes('componente')) reply = 'Os componentes são: BABY I.A. coordena, MEMORY BOOST lembra, DROPBOX Simulado guarda, WEB3.1 mostra as telas e a API liga tudo. Cada um pode virar um serviço real depois.';
    else if (lower.includes('binário') || lower.includes('binario') || lower.includes('0100')) reply = 'Binário é a língua dos computadores: só 0 e 1. Exemplo: 01000011 01010010 01011001 01010000 01011001 vira CRYPY. Use o botão “Testar binário” para ver a decodificação.';
    else if (lower.includes('estrutura') || lower.includes('v13') || lower.includes('13')) reply = 'A estrutura v13 organiza o CRYPY em módulos claros: interface, coordenação, memória e armazenamento. O simulador mantém essa estrutura sem destruir o que já existe no WEB3.1.';
    else if (lower.includes('real') || lower.includes('servidor')) reply = 'Ainda não sou um servidor real, Sensei. Aqui eu simulo. O caminho é: Simulação Local → Integração BABY → Homologação → Servidor Real. Veja a aba “Como vira real”.';
    else if (lower.includes('olá') || lower.includes('ola') || lower.includes('oi')) reply = 'Olá, Sensei. ♾ Tudo verde por aqui — em modo simulado, claro. O que você quer testar primeiro?';
    window.setTimeout(() => {
      setChat((old) => [...old, { id: idRef.current++, from: 'baby', text: reply }]);
      pushLog(`CHAT: Sensei perguntou sobre “${text.slice(0, 28)}” e BABY respondeu.`, 'out');
    }, 450);
  };

  const exportReport = () => {
    const date = new Date().toLocaleString('pt-BR');
    const lines = services.map((s) => `- ${s.name} (${s.role}): ${s.online ? 'ONLINE simulado' : 'OFFLINE'} • ${s.metricLabel}: ${s.metric} ${s.metricUnit}`).join('\n');
    const text = `CRYPY SERVER — RELATÓRIO DA SIMULAÇÃO v0.1\nGerado em: ${date}\nModo: SIMULAÇÃO LOCAL — NÃO É SERVIDOR REAL AINDA\n\nSERVIÇOS SIMULADOS (${onlineCount}/5 ligados)\n${lines}\n\nLOGS REGISTRADOS: ${logs.length} linhas\nÚltimo log: ${logs[logs.length - 1]?.text ?? '—'}\n\nTESTE BINÁRIO\n${BINARY} = ${binaryResult ?? 'ainda não testado'}\n\nCONCLUSÃO\nO protótipo mostra como os serviços conversam. Para virar real, cada serviço simulado precisa de backend, banco de dados, autenticação e infraestrutura própria.\n♾🟢 CRYPY — construir, testar e só depois transformar.`;
    setReport(text);
    setCopied(false);
    pushLog('Relatório da simulação gerado para copiar.', 'sys');
  };

  const copyReport = () => {
    if (!reportRef.current) return;
    reportRef.current.focus();
    reportRef.current.select();
    const ok = document.execCommand('copy');
    setCopied(ok);
  };

  const quickAsk = (q: string) => { setDraft(q); };

  return (
    <div data-safe-area-inset-root style={{ boxSizing: 'border-box', paddingTop: 'var(--safe-area-inset-top)', minHeight: '100vh', background: 'var(--bg)' }} className="overflow-x-clip">
      {!loggedIn ? (
        <main className="mx-auto flex min-h-[calc(100vh-var(--safe-area-inset-top))] w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--neon)] text-3xl font-black text-[#031007] shadow-[0_0_45px_rgba(0,255,136,0.35)]">C</div>
            <div>
              <p className="text-[clamp(1.4rem,6vw,2rem)] font-black leading-none tracking-tight">CRYPY <span className="neon-text">SERVER</span></p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">Simulador • v0.1</p>
            </div>
          </div>

          <div className="glow mt-7 w-full max-w-[430px] rounded-3xl bg-[var(--surface)] p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffcf4d]/10 px-2.5 py-1.5 text-[11px] font-black text-[#ffcf4d] ring-1 ring-[#ffcf4d]/30"><ShieldAlert size={13} /> LOGIN SIMULADO</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--neon)]/10 px-2.5 py-1.5 text-[11px] font-black text-[var(--neon)] ring-1 ring-[var(--neon)]/30"><span className="h-2 w-2 rounded-full bg-[var(--neon)] pulse-dot" /> SÓ PARA O PROTÓTIPO</span>
            </div>
            <h1 className="mt-4 text-[clamp(1.5rem,6vw,2rem)] font-bold leading-tight">Bem-vindo de volta,<br /><span className="neon-text">Sensei.</span></h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">Entre com o acesso de demonstração para abrir o painel do simulador.</p>

            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="login-user" className="mb-2 block text-sm font-bold">Usuário</label>
                <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-black/40 px-3 focus-within:border-[var(--neon)]">
                  <User size={18} className="shrink-0 text-[var(--muted)]" />
                  <input id="login-user" autoComplete="username" value={username} onChange={(e) => { setUsername(e.target.value); setLoginError(''); }} placeholder="sensei" className="w-full min-w-0 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-[var(--muted)]" />
                </div>
              </div>
              <div>
                <label htmlFor="login-pass" className="mb-2 block text-sm font-bold">Senha</label>
                <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-black/40 px-3 focus-within:border-[var(--neon)]">
                  <Lock size={18} className="shrink-0 text-[var(--muted)]" />
                  <input id="login-pass" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(''); }} placeholder="••••••••" className="w-full min-w-0 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-[var(--muted)]" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'} className="shrink-0 rounded-lg p-1 text-[var(--muted)] hover:text-white">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>

              {loginError && (
                <p role="alert" className="rounded-xl bg-[#ff6b7a]/10 px-3 py-3 text-sm font-bold leading-snug text-[#ff8a96] ring-1 ring-[#ff6b7a]/35 [overflow-wrap:anywhere]">{loginError}</p>
              )}

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--neon)] px-4 py-4 text-base font-black text-[#031007] shadow-[0_0_30px_rgba(0,255,136,0.25)] transition hover:brightness-110 active:scale-[0.99]"><LogIn size={19} /> ENTRAR</button>
            </form>

            <div className="mt-5 rounded-xl bg-black/30 p-3 text-center ring-1 ring-[var(--line)]">
              <p className="text-xs text-[var(--muted)]">Dica para testar</p>
              <p className="mono mt-1 text-sm font-bold text-white [overflow-wrap:anywhere]">Demo: sensei / crypy2026</p>
              <button type="button" onClick={fillDemoLogin} className="mt-3 w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm font-bold text-white ring-1 ring-white/15 hover:bg-white/10">Usar a mesma demo: preencher usuário e senha</button>
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted)]">Login SIMULADO, só para o protótipo.<br />Não é segurança real de servidor. Não use uma senha de verdade aqui.</p>
          </div>
          <p className="mt-5 text-center text-xs text-[var(--muted)]">CRYPY SERVER — Simulador v0.1 ♾🟢 • Simulação local</p>
        </main>
      ) : (
        <>
      <header data-safe-area-sticky-top style={{ top: 'var(--safe-area-inset-top)' }} className="sticky z-30 border-b border-[var(--line)] bg-[#040805]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--neon)] font-black text-[#031007] text-xl">C</div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight sm:text-lg">CRYPY SERVER <span className="neon-text">— Simulador v0.1</span></p>
              <p className="text-xs text-[var(--muted)]">Protótipo no navegador • construir, testar e depois transformar</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffcf4d]/10 px-2.5 py-1.5 font-bold text-[#ffcf4d] ring-1 ring-[#ffcf4d]/30"><Radio size={13} /> SIMULAÇÃO LOCAL</span>
            <span className="hidden rounded-full bg-[var(--neon)]/10 px-2.5 py-1.5 font-bold text-[var(--neon)] ring-1 ring-[var(--neon)]/30 sm:inline-flex"><span className="h-2 w-2 rounded-full bg-[var(--neon)] pulse-dot" /> {onlineCount}/5 ONLINE</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1.5 font-bold text-white ring-1 ring-white/15"><User size={13} className="text-[var(--neon)]" /> Logado como: <span className="text-[var(--neon)]">sensei</span></span>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6b7a]/10 px-3 py-1.5 font-black text-[#ff8a96] ring-1 ring-[#ff6b7a]/30 hover:bg-[#ff6b7a]/20"><LogOut size={13} /> SAIR</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="mt-5 rounded-2xl border border-[#ffcf4d]/35 bg-[#171105] p-4 sm:p-5">
          <div className="flex flex-wrap items-start gap-3">
            <span className="rounded-lg bg-[#ffcf4d] px-2 py-1 text-xs font-black tracking-wide text-black">SIMULAÇÃO LOCAL — NÃO É SERVIDOR REAL AINDA</span>
            <p className="min-w-[220px] flex-1 text-sm leading-relaxed text-[#ffe9a8] [overflow-wrap:anywhere]">Nada aqui liga um servidor de verdade. Este protótipo só <strong>imita</strong> o comportamento, dentro do seu navegador, para você testar a ideia com segurança.</p>
          </div>
        </section>

        <nav className="mt-5 flex gap-2" aria-label="Abas do simulador">
          <button onClick={() => setTab('painel')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold sm:flex-none sm:px-5 ${tab === 'painel' ? 'bg-[var(--neon)] text-[#031007]' : 'bg-[var(--surface)] text-[var(--muted)] ring-1 ring-[var(--line)]'}`}><Activity size={17} /> Painel do simulador</button>
          <button onClick={() => setTab('real')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold sm:flex-none sm:px-5 ${tab === 'real' ? 'bg-[var(--neon)] text-[#031007]' : 'bg-[var(--surface)] text-[var(--muted)] ring-1 ring-[var(--line)]'}`}><ListChecks size={17} /> Como vira real</button>
        </nav>

        {tab === 'painel' ? (
          <>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
              <div><p className="mono text-xs tracking-[0.22em] text-[var(--neon)]">DASHBOARD • ECOSSISTEMA CRYPY</p><h1 className="mt-1 text-[clamp(1.65rem,5vw,2.5rem)] font-bold leading-[1.05]">Cinco serviços.<br />Uma conversa só.</h1></div>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">Ligue, desligue e veja como cada parte reage. O log abaixo registra tudo como se fossem serviços de verdade.</p>
            </div>

            <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Serviços simulados">
              {services.map((s) => (
                <article key={s.id} className="glow flex flex-col rounded-2xl bg-[var(--surface)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[var(--neon)]">{s.icon}</div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${s.online ? 'bg-[var(--neon)]/10 text-[var(--neon)] ring-1 ring-[var(--neon)]/30' : 'bg-white/5 text-[var(--muted)] ring-1 ring-white/10'}`}>
                      <span className={`h-2 w-2 rounded-full ${s.online ? 'bg-[var(--neon)] pulse-dot' : 'bg-[var(--muted)]'}`} />{s.online ? 'ONLINE simulado' : 'OFFLINE'}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold leading-tight">{s.name}</h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--neon)]">{s.role}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">{s.detail}</p>
                  <div className="mt-4 flex items-end justify-between border-t border-[var(--line)] pt-3">
                    <div><p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">{s.metricLabel}</p><p className="mt-1 text-2xl font-bold leading-none"><span className="neon-text">{s.metric}</span> <span className="text-xs font-medium text-[var(--muted)]">{s.metricUnit}</span></p></div>
                    <button onClick={() => toggleService(s.id)} aria-label={`${s.online ? 'Desligar' : 'Ligar'} ${s.name}`} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold ${s.online ? 'bg-white/5 text-white ring-1 ring-white/15' : 'bg-[var(--neon)] text-[#031007]'}`}><Power size={16} />{s.online ? 'Desligar' : 'Ligar'}</button>
                  </div>
                </article>
              ))}
              <article className="flex flex-col justify-between rounded-2xl border border-dashed border-[var(--line)] bg-[#07130b] p-4">
                <div><Server className="text-[var(--neon)]" /><h2 className="mt-3 text-lg font-bold">Status geral</h2><p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">Se a BABY desligar, a simulação avisa. Os outros serviços continuam visíveis, como em um teste real.</p></div>
                <p className="mono mt-4 text-4xl font-bold"><span className="neon-text">{onlineCount}</span><span className="text-lg text-[var(--muted)]"> / 5</span></p>
              </article>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-5">
              <div className="rounded-2xl bg-[var(--surface)] p-4 lg:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Terminal className="text-[var(--neon)]" /><h2 className="text-lg font-bold">LOGS ao vivo</h2></div><span className="mono text-xs text-[var(--muted)]">{logs.length} linhas</span></div>
                <div ref={logBoxRef} className="mono mt-4 h-64 overflow-y-auto rounded-xl bg-black/50 p-3 text-[13px] leading-relaxed ring-1 ring-[var(--line)]" aria-live="polite">
                  {logs.map((l) => (<p key={l.id} className="py-1 [overflow-wrap:anywhere]"><span className="text-[var(--muted)]">[{l.time}]</span> <span className={l.kind === 'ok' ? 'text-[var(--neon)]' : l.kind === 'sys' ? 'text-[#ffcf4d]' : 'text-white'}>{l.text}</span></p>))}
                  {running && <p className="text-[var(--neon)]">processando<span className="blink">…</span></p>}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button onClick={simulateRequest} disabled={running} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--neon)] px-4 py-3.5 font-bold text-[#031007] disabled:opacity-50"><Play size={18} />{running ? 'Simulando…' : 'Simular requisição'}</button>
                  <button onClick={testBinary} className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3.5 font-bold ring-1 ring-white/15"><Binary size={18} /> Testar binário</button>
                </div>
                {binaryOpen && (
                  <div className="mt-3 rounded-xl border border-[var(--neon)]/30 bg-[var(--neon)]/5 p-3">
                    <p className="mono text-xs text-[var(--muted)] [overflow-wrap:anywhere]">{BINARY}</p>
                    <p className="mt-2 text-lg font-bold">= <span className="neon-text tracking-[0.35em]">{binaryResult}</span> <span className="text-sm font-medium text-[var(--muted)]">— decodificação concluída</span></p>
                  </div>
                )}
              </div>

              <div className="flex flex-col rounded-2xl bg-[var(--surface)] p-4 lg:col-span-2">
                <div className="flex items-center gap-2"><Bot className="text-[var(--neon)]" /><h2 className="text-lg font-bold">Mini-chat BABY</h2><span className="ml-auto rounded-full bg-[var(--neon)]/10 px-2 py-1 text-[11px] font-bold text-[var(--neon)]">SÓ TEXTO</span></div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['conta nossa história', 'quais são os componentes?', 'o que é binário?', 'o que é a estrutura v13?'].map((q) => <button key={q} onClick={() => quickAsk(q)} className="rounded-full bg-white/5 px-2.5 py-1.5 text-xs text-[var(--muted)] ring-1 ring-white/10">{q}</button>)}
                </div>
                <div ref={chatBoxRef} className="mt-3 flex-1 space-y-2 overflow-y-auto rounded-xl bg-black/30 p-3" style={{ minHeight: 190 }}>
                  {chat.map((m) => (<div key={m.id} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed [overflow-wrap:anywhere] ${m.from === 'baby' ? 'bg-[var(--neon)]/10 text-white ring-1 ring-[var(--neon)]/20' : 'ml-auto bg-white/10'}`}><strong className="mr-1 text-[11px] uppercase tracking-wide text-[var(--neon)]">{m.from === 'baby' ? 'BABY' : 'Você'}</strong>{m.text}</div>))}
                </div>
                <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); sendChat(); }}>
                  <label className="sr-only" htmlFor="chat-input">Escreva para a BABY</label>
                  <input id="chat-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Pergunte para a BABY…" className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-black/40 px-3 py-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--neon)]" />
                  <button type="submit" className="shrink-0 rounded-xl bg-[var(--neon)] px-4 py-3 text-sm font-bold text-[#031007]">Enviar</button>
                </form>
                <p className="mt-2 text-xs text-[var(--muted)]">Sem áudio. As respostas seguem o protocolo do simulador.</p>
              </div>
            </section>

            <section className="mt-6 rounded-2xl bg-[var(--surface)] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><FileText className="text-[var(--neon)]" /><h2 className="text-lg font-bold">Exportar relatório da simulação</h2></div><button onClick={exportReport} className="rounded-xl bg-[var(--neon)] px-4 py-3 text-sm font-bold text-[#031007]">Gerar relatório</button></div>
              <p className="mt-2 text-sm text-[var(--muted)]">O relatório usa o estado atual do simulador: serviços ligados, logs e teste binário.</p>
              {report ? (<><textarea ref={reportRef} value={report} readOnly rows={9} className="mono mt-3 w-full rounded-xl border border-[var(--line)] bg-black/50 p-3 text-xs leading-relaxed outline-none" /><div className="mt-2 flex flex-wrap items-center gap-3"><button onClick={copyReport} className="rounded-lg bg-white/5 px-4 py-2.5 text-sm font-bold ring-1 ring-white/15">Selecionar e copiar texto</button>{copied && <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--neon)]"><CheckCircle2 size={16} /> Texto selecionado e copiado</span>}<span className="text-xs text-[var(--muted)]">Sem download real — o texto fica aqui para você copiar.</span></div></>) : <p className="mt-3 rounded-xl bg-black/25 p-4 text-sm text-[var(--muted)]">Clique em “Gerar relatório” para ver o resumo completo da simulação.</p>}
            </section>
          </>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mono text-xs tracking-[0.22em] text-[var(--neon)]">DO PROTÓTIPO AO SERVIDOR</p><h1 className="mt-1 max-w-2xl text-[clamp(1.65rem,5vw,2.5rem)] font-bold leading-[1.05]">Como este simulador vira um servidor real</h1></div><div className="w-full max-w-xs"><div className="flex justify-between text-xs text-[var(--muted)]"><span>Checklist do caminho</span><span>{progress.done}/{progress.all} • {progress.pct}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[var(--neon)] transition-all" style={{ width: `${progress.pct}%` }} /></div></div></div>
            <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="flex gap-3"><Sparkles className="mt-0.5 shrink-0 text-[var(--neon)]" /><p className="text-base leading-relaxed [overflow-wrap:anywhere]"><strong>HTML é interface, não substitui backend.</strong> As telas mostram, organizam e conversam — mas não guardam dados sozinhas, não verificam login de verdade e não ficam ligadas quando você fecha o navegador. O backend é o motor que faz isso acontecer.</p></div>
            </section>
            <section className="mt-4 space-y-3" aria-label="Quatro etapas para virar real">
              {stages.map((stage, idx) => (
                <article key={stage.n} className="relative rounded-2xl bg-[var(--surface)] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="text-center"><p className="mono text-3xl font-bold text-[var(--neon)]">{stage.n}</p>{idx < 3 && <ChevronRight className="mx-auto mt-1 rotate-90 text-[var(--muted)]" size={18} />}</div>
                    <div className="min-w-[240px] flex-1">
                      <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold">{stage.title}</h2><span className="rounded-full bg-[var(--neon)]/10 px-2 py-1 text-[11px] font-bold text-[var(--neon)]">{stage.tag}</span></div>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">{stage.text}</p>
                      <p className="mt-3 rounded-xl bg-black/30 p-3 text-sm leading-relaxed"><strong className="text-[var(--neon)]">Como vira real: </strong>{stage.conversion}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">{stage.checks.map((c) => { const key = `${stage.n}-${c}`; const done = !!checked[key]; return (<label key={key} className={`flex cursor-pointer items-start gap-2.5 rounded-xl p-3 text-sm leading-snug ring-1 ${done ? 'bg-[var(--neon)]/10 ring-[var(--neon)]/30' : 'bg-white/[0.02] ring-white/10'}`}><input type="checkbox" checked={done} disabled={checkSaving} onChange={() => toggleCheck(key)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#00ff88]" /><span className="[overflow-wrap:anywhere]">{c}</span></label>); })}</div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
            <section className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-[var(--surface)] p-4"><History className="text-[var(--neon)]" /><h3 className="mt-2 font-bold">Antes</h3><p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">Dados de exemplo e botões que imitam serviços.</p></div>
              <div className="rounded-2xl bg-[var(--surface)] p-4"><MessageSquare className="text-[var(--neon)]" /><h3 className="mt-2 font-bold">Durante</h3><p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">Cada serviço simulado ganha uma versão real, sem destruir o WEB3.1.</p></div>
              <div className="rounded-2xl bg-[var(--surface)] p-4"><CheckCircle2 className="text-[var(--neon)]" /><h3 className="mt-2 font-bold">Depois</h3><p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">Backend, banco de dados, login e arquivos trabalhando juntos.</p></div>
            </section>
          </>
        )}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
          <p>CRYPY SERVER — Simulador v0.1 ♾🟢</p><p className="inline-flex items-center gap-1"><XCircle size={13} className="text-[#ffcf4d]" /> Simulação local. Nenhum servidor real está ligado aqui.</p>
        </footer>
      </main>
        </>
      )}
    </div>
  );
}
