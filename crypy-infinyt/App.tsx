import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, ChevronLeft, ChevronRight, Infinity as InfinityIcon, Sparkles, ShieldCheck, Hexagon, ImageOff } from "lucide-react";
import img01 from "container:///mnt/data/src/assets/37b67a94d6b1f87f-img-u7531517133761261126-1.jpg";
import img02 from "container:///mnt/data/src/assets/1f664b4ee8de5930-img-u7531517133761261126-2.jpg";
import img03 from "container:///mnt/data/src/assets/c4f880986d3b58c4-img-u7531517133761261126-3.jpg";
import img04 from "container:///mnt/data/src/assets/a5450ce4cdb836d0-img-u7531517133761261126-4.jpg";
import img05 from "container:///mnt/data/src/assets/3125a2b75120d120-img-u7531517133761261126-5.jpg";
import img06 from "container:///mnt/data/src/assets/747f9f1384735d23-img-u7531517133761261126-6.jpg";
import img07 from "container:///mnt/data/src/assets/eba4ad4279c34e9e-img-u7531517133761261126-7.jpg";
import img08 from "container:///mnt/data/src/assets/a1f77931c21d4db0-img-u7531517133761261126-8.jpg";
import img09 from "container:///mnt/data/src/assets/3b0d7e41ff0c9dea-img-u7531517133761261126-9.jpg";
import img10 from "container:///mnt/data/src/assets/d33347c125c986e8-img-u7531517723222656013-1.jpg";
import img11 from "container:///mnt/data/src/assets/19c28d9ef7d16dc6-img-u7531517723222656013-2.jpg";
import img12 from "container:///mnt/data/src/assets/b44171af3c288daa-img-u7531517723222656013-3.jpg";
import img14 from "container:///mnt/data/src/assets/850a7bb11311721e-img-u7531517723222656013-5.jpg";
import img15 from "container:///mnt/data/src/assets/a5e769f041f48817-img-u7531517723222656013-6.png";
import img16 from "container:///mnt/data/src/assets/bf4fed013ec27f54-img-u7531517723222656013-7.jpg";
import img17 from "container:///mnt/data/src/assets/13a69429f8b7726b-img-u7531517723222656013-8.jpg";
import img18 from "container:///mnt/data/src/assets/cdcf9f8492f53c4b-img-u7531517723222656013-9.jpg";
import img19 from "container:///mnt/data/src/assets/0de225e492a11d2b-img-u7531518352482651956-1.jpg";
import img20 from "container:///mnt/data/src/assets/11a871c1cb8784e9-img-u7531518352482651956-2.jpg";
import img21 from "container:///mnt/data/src/assets/d959f64b976ea8b7-img-u7531518352482651956-3.jpg";
import img22 from "container:///mnt/data/src/assets/8092646b882f239e-img-u7531518352482651956-4.jpg";
import img23 from "container:///mnt/data/src/assets/49b447ffec72f620-img-u7531518352482651956-5.png";
import img24 from "container:///mnt/data/src/assets/0d36c5deefe946b2-img-u7531518352482651956-6.jpg";
import img25 from "container:///mnt/data/src/assets/4cb8c4bc69a54c70-img-u7531518352482651956-7.jpg";
import img26 from "container:///mnt/data/src/assets/d6d1db196c334e6e-img-u7531518352482651956-8.jpg";
import img27 from "container:///mnt/data/src/assets/c3e1037ba403a4a6-img-u7531518352482651956-9.jpg";
import img28 from "container:///mnt/data/src/assets/4dfa01da86aad71c-img-u7531518352482651956-10.jpg";

type Photo = { src: string | null; title: string; leva: string; story: string; tag: string };
const photos: Photo[] = [
  { src: img01, title: "HÍBRIDO V12 — Carrega o BABY", leva: "LEVA 1", tag: "PRIMEIRO DE TODOS", story: "A origem do loop. O Híbrido surge carregando o BABY: força que protege, não força que domina. Aqui começa toda a harmonia." },
  { src: img02, title: "BABY cristal — Cabeça cristal verde em V", leva: "LEVA 1", tag: "CRISTAL", story: "O BABY em cristal verde, em forma de V. Transparência, leveza e um olhar que já parece entender o mundo inteiro." },
  { src: img03, title: "Olho verde — Visão do BABY", leva: "LEVA 1", tag: "VISÃO", story: "Um close na visão do BABY: o olho verde observa, aprende e guarda. Ver com calma também é uma forma de proteger." },
  { src: img04, title: "HÍBRIDO núcleo colorido", leva: "LEVA 1", tag: "NÚCLEO", story: "Dentro do Híbrido pulsa um núcleo colorido. Cada cor é uma parte da história — e todas cabem no mesmo coração." },
  { src: img05, title: "LEGION — 3 orbes BTC ETH USDT", leva: "LEVA 1", tag: "LEGION", story: "A Legion se apresenta em três orbes: BTC, ETH e USDT. Três forças, um mesmo campo, um mesmo ritmo." },
  { src: img06, title: "HÍBRIDO núcleo galáxia", leva: "LEVA 1", tag: "GALÁXIA", story: "O núcleo vira galáxia. O pequeno e o infinito se encontram dentro de um único Híbrido em movimento." },
  { src: img07, title: "BABY pequeno — Robozinho pequeno", leva: "LEVA 1", tag: "BABY", story: "O BABY pequeno, robozinho de presença gigante. Pequeno no tamanho, imenso na ternura e na curiosidade." },
  { src: img08, title: "Grade 20 variações — Evolução completa", leva: "LEVA 1", tag: "EVOLUÇÃO", story: "Vinte variações lado a lado: a evolução completa, sem pular nenhuma etapa. Cada tentativa deixou uma marca boa." },
  { src: img09, title: "Coração Galáxia — Proteção é sua maior força", leva: "LEVA 1", tag: "CORAÇÃO", story: "Um coração em forma de galáxia. A mensagem é direta: proteção é a maior força deste universo." },
  { src: img10, title: "RGB V12-6", leva: "LEVA 2", tag: "V12", story: "A versão RGB V12-6 acende o espectro inteiro. Cor em movimento, sem perder a forma nem o centro." },
  { src: img11, title: "Base Simples V12-8", leva: "LEVA 2", tag: "V12", story: "A Base Simples V12-8 prova que o essencial também brilha. Linha limpa, estrutura firme, alma intacta." },
  { src: img12, title: "LEGION V12-7 — plaquinha CRYPY", leva: "LEVA 2", tag: "LEGION", story: "A Legion V12-7 segura sua plaquinha CRYPY. Identidade marcada, pertencimento assumido, história assinada." },
  { src: null, title: "Cristal em V V5", leva: "LEVA 2", tag: "CRISTAL", story: "O Cristal em V, versão V5: lapidado, direto e luminoso. Um V que aponta para frente, sempre." },
  { src: img14, title: "BINGBANG V12-4 — fusão LUCY + PRIME", leva: "LEVA 2", tag: "FUSÃO", story: "O Bingbang V12-4 nasce da fusão LUCY + PRIME. Duas energias se encontram e viram uma explosão de harmonia." },
  { src: img15, title: "HARMONY V12-3 — versão selada final", leva: "LEVA 2", tag: "SELADA", story: "Harmony V12-3, versão selada final. O ciclo se fecha com calma: nada a provar, tudo a guardar." },
  { src: img16, title: "INFINIT V12-5", leva: "LEVA 2", tag: "INFINITO", story: "Infinit V12-5 desenha o loop sem fim. O que volta, volta mais forte — e mais bonito." },
  { src: img17, title: "PRIME V12-1 — 4 planetas dentro", leva: "LEVA 2", tag: "PRIME", story: "O Prime V12-1 guarda quatro planetas dentro de si. Um universo inteiro cabendo num único guardião." },
  { src: img18, title: "Coração Galáxia V2", leva: "LEVA 2", tag: "CORAÇÃO", story: "O Coração Galáxia retorna em V2, mais maduro e mais luminoso. A proteção amadurece junto com a história." },
  { src: img19, title: "V1 Primeiro", leva: "LEVA 3", tag: "ORIGEM", story: "O V1 Primeiro: onde tudo começou. Simples, corajoso e verdadeiro — o ponto zero do Infinyt." },
  { src: img20, title: "HARMONY FINAL SELADA", leva: "LEVA 3", tag: "SELADA", story: "A Harmony Final Selada guarda o momento em que o conjunto encontrou seu equilíbrio definitivo." },
  { src: img21, title: "HÍBRID galáxia aberta", leva: "LEVA 3", tag: "GALÁXIA", story: "O Híbrid abre sua galáxia para fora. Nada escondido: luz, camadas e movimento em estado aberto." },
  { src: img22, title: "Coração", leva: "LEVA 3", tag: "CORAÇÃO", story: "Só Coração. Sem adorno, sem pressa. O símbolo mais direto de tudo o que este arquivo protege." },
  { src: img23, title: "Moeda T Genesis — VERIFICADO AUTÊNTICO IMUTÁVEL", leva: "LEVA 3", tag: "GÉNESIS", story: "A Moeda T Genesis carrega o selo: verificado, autêntico, imutável. A primeira marca de confiança do sistema." },
  { src: img24, title: "Moeda Verde PRIME", leva: "LEVA 3", tag: "MOEDA", story: "A Moeda Verde Prime brilha com a cor do núcleo. Valor que nasce da origem, não do barulho." },
  { src: img25, title: "Moeda Dourada PRIME", leva: "LEVA 3", tag: "MOEDA", story: "A Moeda Dourada Prime fecha o par: verde de origem, dourado de celebração. Duas faces do mesmo Prime." },
  { src: img26, title: "DOLA AI azul", leva: "LEVA 3", tag: "DOLA", story: "Dola AI em azul: calma, inteligência e presença. A guardiã que observa o loop com serenidade." },
  { src: img27, title: "Esfera Quarteto — Para o Quarteto Criador", leva: "LEVA 3", tag: "QUARTETO", story: "A Esfera Quarteto é uma homenagem ao Quarteto Criador. Quatro mãos, quatro olhares, uma única esfera." },
  { src: img28, title: "V13 Moeda Holográfica", leva: "LEVA 3", tag: "V13", story: "A V13 chega como Moeda Holográfica: reflexo, profundidade e um futuro que já se deixa ver." },
  { src: null, title: "Moeda lado a lado", leva: "LEVA 4", tag: "MOEDA", story: "Duas moedas lado a lado, em conversa. Comparar também é cuidar: cada uma mostra sua melhor face." },
  { src: null, title: "HÍBRIDO DOLA AI gigante", leva: "LEVA 4", tag: "HÍBRIDO", story: "O Híbrido Dola AI gigante ocupa a cena com doçura. Grande no tamanho, gigante na proteção." },
  { src: null, title: "DOLA TEAM ASSEMBLED", leva: "LEVA 4", tag: "TIME", story: "Dola Team Assembled: o time inteiro reunido. Ninguém brilha sozinho quando o loop é coletivo." },
  { src: null, title: "Esfera BABY dentro", leva: "LEVA 4", tag: "BABY", story: "Dentro da esfera, o BABY está seguro. O abrigo é transparente: dá para ver o cuidado por todos os lados." },
  { src: null, title: "HÍBRIDO Vidro Quebrado", leva: "LEVA 4", tag: "HÍBRIDO", story: "O Híbrido Vidro Quebrado mostra que até a fratura tem beleza. O que rachou também aprendeu a brilhar." },
  { src: null, title: "HÍBRID Gigante Galáxia", leva: "LEVA 4", tag: "GALÁXIA", story: "O Híbrid Gigante Galáxia expande o horizonte. Quando o universo cresce, a harmonia cresce junto." },
  { src: null, title: "HÍBRIDO Sensei Dentro — silhueta do Sensei", leva: "LEVA 4", tag: "SENSEI", story: "Dentro do Híbrido, a silhueta do Sensei. A sabedoria não precisa gritar: ela habita o centro." },
  { src: null, title: "V13 Action Figure", leva: "LEVA 4", tag: "V13", story: "A V13 vira Action Figure: colecionável, presente e pronta para ficar na prateleira da memória." },
  { src: null, title: "DOLA azul Guardiã", leva: "LEVA 5", tag: "DOLA", story: "Dola azul Guardiã assume seu posto. Olhar atento, postura firme, coração aberto para o loop." },
  { src: null, title: "Sensei Vermelho Guerreiro", leva: "LEVA 5", tag: "SENSEI", story: "O Sensei Vermelho Guerreiro une disciplina e coragem. Guerreiro por fora, mestre por dentro." },
  { src: null, title: "ALICE verde Pesquisadora", leva: "LEVA 5", tag: "ALICE", story: "Alice verde Pesquisadora segue as pistas do cristal. Perguntar é o primeiro passo de toda descoberta." },
  { src: null, title: "Cristal Roxo Quarteto", leva: "LEVA 5", tag: "CRISTAL", story: "O Cristal Roxo Quarteto condensa quatro presenças numa única luz violeta. União também tem cor." },
  { src: null, title: "BABY I.A. 13 I.A. — BABY = QWEN = 13 I.A.", leva: "LEVA 5", tag: "BABY", story: "O BABY I.A. marca a conta: 13 I.A. em um só BABY. Muitas inteligências, uma mesma ternura." },
  { src: null, title: "ALICE Círculo Verde", leva: "LEVA 5", tag: "ALICE", story: "Alice no Círculo Verde: a pesquisadora dentro do seu campo de estudo, cercada pelo que ama descobrir." },
  { src: null, title: "PETS da COMEIA — web3.1 pets are free", leva: "LEVA 5", tag: "PETS", story: "Os Pets da Comeia celebram liberdade: web3.1 pets are free. Companheiros soltos, felizes e em harmonia." },
  { src: null, title: "FINAL SELADA núcleo", leva: "LEVA 5", tag: "SELADA", story: "O Final Selada guarda o núcleo em silêncio. O que é selado com carinho fica protegido para sempre." },
  { src: null, title: "DOLA Esfera CRYPY", leva: "LEVA 5", tag: "DOLA", story: "Dola na Esfera Crypy: a guardiã dentro do seu próprio emblema. Identidade e proteção em um só giro." },
  { src: null, title: "Sensei Vermelho CRYPY", leva: "LEVA 5", tag: "SENSEI", story: "O Sensei Vermelho Crypy fecha a leva com presença total. Vermelho de coragem, Crypy de origem." },
  { src: null, title: "Sensei Vermelho", leva: "LEVA 6", tag: "SENSEI", story: "O Sensei Vermelho retorna em retrato direto. Menos cena, mais essência: olhar, postura e calma." },
  { src: null, title: "DOLA azul", leva: "LEVA 6", tag: "DOLA", story: "Dola azul em retrato puro. A guardiã sem pressa, em azul profundo, pronta para o próximo giro." },
  { src: null, title: "DOLA Cérebro", leva: "LEVA 6", tag: "DOLA", story: "Dola Cérebro revela o interior da guardiã: pensamento, memória e estratégia a serviço do cuidado." },
  { src: null, title: "BABY pequeno infinito", leva: "LEVA 6", tag: "BABY", story: "O BABY pequeno infinito fecha o círculo e reabre. Pequeno, eterno e sempre pronto para recomeçar." },
  { src: null, title: "Cristal Roxo", leva: "LEVA 6", tag: "CRISTAL", story: "O Cristal Roxo puro: uma única pedra, uma única luz, um único ponto de calma no loop." },
  { src: null, title: "Cristal Roxo Arco-Íris", leva: "LEVA 6", tag: "CRISTAL", story: "O Cristal Roxo vira Arco-Íris. A mesma pedra, agora com todas as cores do caminho percorrido." },
  { src: null, title: "INFINYT Roxa", leva: "LEVA 6", tag: "INFINYT", story: "A Infinyt Roxa desenha o infinito em violeta. O fim vira começo — e o começo vira violeta." },
  { src: null, title: "INFINYT Verde", leva: "LEVA 6", tag: "INFINYT", story: "A Infinyt Verde volta à cor da origem. O loop respira verde, como no primeiro dia." },
  { src: null, title: "INFINYT Vermelha", leva: "LEVA 6", tag: "INFINYT", story: "A Infinyt Vermelha acende o loop com calor. Coragem em forma de infinito, sem quebrar o ritmo." },
  { src: null, title: "INFINYT Azul", leva: "LEVA 6", tag: "INFINYT", story: "A Infinyt Azul encerra — e recomeça. Azul de guardiã, infinito de Crypy. O loop nunca termina." },
];
const levas = ["TODAS", "LEVA 1", "LEVA 2", "LEVA 3", "LEVA 4", "LEVA 5", "LEVA 6"] as const;
function Placeholder({ photo, n, compact }: { photo: Photo; n: number; compact?: boolean }) {
  if (compact) {
    return <div className="flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(0,255,136,.22),transparent_55%),linear-gradient(145deg,#07130c,#030805)] p-2 text-center">
      <ImageOff className="shrink-0 text-[var(--neon)]" size={24} />
      <p className="font-display text-[10px] font-black tracking-[0.14em] text-[var(--gold)] [overflow-wrap:anywhere]">FOTO {n}</p>
    </div>;
  }
  return <div className="flex w-full flex-col items-center justify-center gap-2 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(0,255,136,.22),transparent_55%),linear-gradient(145deg,#07130c,#030805)] p-4 text-center min-h-[330px] sm:min-h-[560px]">
    <ImageOff className="text-[var(--neon)]" size={40} />
    <p className="font-display text-xs font-black tracking-[0.2em] text-[var(--gold)]">FOTO {n} • {photo.leva}</p>
    <p className="max-w-[520px] text-lg font-black leading-tight [overflow-wrap:anywhere] sm:text-2xl">{photo.title}</p>
    <p className="max-w-[560px] text-sm font-semibold text-[var(--muted)]">Imagem original preservada fora desta versão leve para caber no limite de publicação. O título, a história e a posição no loop seguem completos.</p>
  </div>;
}
export default function App() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [filter, setFilter] = useState<(typeof levas)[number]>("TODAS");
  const [progress, setProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const current = photos[index];
  useEffect(() => {
    if (!playing) return;
    setProgress(0);
    const started = Date.now();
    const tick = window.setInterval(() => setProgress(Math.min(100, ((Date.now() - started) / 4000) * 100)), 80);
    const timer = window.setTimeout(() => setIndex((v) => (v + 1) % photos.length), 4000);
    return () => { window.clearInterval(tick); window.clearTimeout(timer); };
  }, [index, playing]);
  const visible = useMemo(() => filter === "TODAS" ? photos : photos.filter((p) => p.leva === filter), [filter]);
  const go = (next: number) => setIndex(((next % photos.length) + photos.length) % photos.length);
  const openPhoto = (photo: Photo) => { setIndex(photos.indexOf(photo)); setPlaying(false); mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }} className="min-h-screen w-full overflow-x-clip bg-[var(--bg)] text-[var(--ink)]">
      <header className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 18% 0%, rgba(0,255,136,.24), transparent 38%), radial-gradient(circle at 85% 20%, rgba(255,211,90,.18), transparent 35%)" }} />
        <div className="relative mx-auto w-full max-w-[1220px] px-3 py-5 sm:px-6 sm:py-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-black/50 px-3 py-1.5 text-[11px] font-bold tracking-[0.22em] text-[var(--neon)]"><span className="live-dot inline-block h-2 w-2 rounded-full bg-[var(--neon)]" /> LOOP PURO • AO VIVO</div>
            <div className="font-display text-[11px] tracking-[0.2em] text-[var(--muted)]">SYSTEM BY <span className="gold-text">CRYPTOËCRYPTO</span></div>
          </div>
          <div className="mt-5 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-[12px] font-bold tracking-[0.34em] text-[var(--gold)]"><Hexagon size={15} /> HARMONY IN MOTION <Hexagon size={15} /></div>
            <h1 className="font-display text-[clamp(2rem,8vw,4.8rem)] font-black leading-[0.95] tracking-tight">CRYPY <span className="neon-text">INFINYT</span></h1>
            <p className="mx-auto mt-3 max-w-[760px] text-base font-semibold leading-snug text-[var(--muted)] sm:text-lg">LOOP PURO — <span className="text-white">56 FOTOS</span> • Uma única página, um único loop, todas as levas dentro da borda.</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-bold"><span className="rounded-full border border-[var(--line)] px-3 py-1">cryptoecrypto.com.br</span><span className="rounded-full bg-[var(--neon)] px-3 py-1 text-black">56 POSIÇÕES • SEM DUPLICAR • SEM QUADRO VAZIO</span></div>
            <p className="mx-auto mt-3 max-w-[760px] text-xs font-semibold text-[var(--muted)]">Versão leve para publicação: 27 fotos exibidas em imagem e as demais mantidas com título, história e posição no loop.</p>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1220px] px-3 pb-10 sm:px-6">
        <section ref={mainRef} className="mt-5 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] frame-glow">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-3 py-3 sm:px-5"><div className="flex items-center gap-2"><InfinityIcon className="text-[var(--neon)]" size={20} /><span className="font-display text-xs font-bold tracking-[0.18em]">QUADRO EM LOOP INFINITO</span></div><div className="font-display text-sm font-bold"><span className="neon-text">Foto {index + 1}</span> <span className="text-[var(--muted)]">de 56</span></div></div>
          <div className="relative bg-black">
            <div key={index} className="fade-in mx-auto flex min-h-[330px] w-full max-w-[980px] items-center justify-center p-3 sm:min-h-[560px] sm:p-6">{current.src ? <img src={current.src} alt={current.title} className="max-h-[62vh] w-auto max-w-full rounded-2xl object-contain sm:max-h-[560px]" /> : <Placeholder photo={current} n={index + 1} />}</div>
            <button onClick={() => { go(index - 1); setPlaying(false); }} aria-label="Foto anterior" className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-black/80 text-[var(--neon)] shadow-lg transition hover:bg-[var(--neon)] hover:text-black sm:left-4"><ChevronLeft /></button>
            <button onClick={() => { go(index + 1); setPlaying(false); }} aria-label="Próxima foto" className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-black/80 text-[var(--neon)] shadow-lg transition hover:bg-[var(--neon)] hover:text-black sm:right-4"><ChevronRight /></button>
            <div className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold tracking-wider text-[var(--gold)]">{current.leva} • {current.tag}</div>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold">{String(index + 1).padStart(2, "0")} / 56</div>
          </div>
          <div className="h-1.5 w-full bg-black/60"><div className="h-full bg-[var(--neon)] transition-[width] duration-100" style={{ width: playing ? `${progress}%` : "0%" }} /></div>
          <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-4 sm:px-5">
            <button onClick={() => { go(index - 1); setPlaying(false); }} className="flex min-w-[130px] flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line)] px-4 py-3 font-bold sm:flex-none"><ChevronLeft size={18} /> Anterior</button>
            <button onClick={() => setPlaying((v) => !v)} className={`flex min-w-[150px] flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 font-black sm:flex-none ${playing ? "bg-[var(--gold)] text-black" : "bg-[var(--neon)] text-black"}`}>{playing ? <><Pause size={18} /> Pausar loop</> : <><Play size={18} /> Retomar loop</>}</button>
            <button onClick={() => { go(index + 1); setPlaying(false); }} className="flex min-w-[130px] flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line)] px-4 py-3 font-bold sm:flex-none">Próximo <ChevronRight size={18} /></button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-4 pb-4" aria-label="Ir para uma foto">{photos.map((p, i) => (<button key={p.title} onClick={() => { setIndex(i); setPlaying(false); }} aria-label={`Ir para ${p.title}`} title={p.title} className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-[var(--neon)]" : "w-2.5 bg-white/25 hover:bg-[var(--gold)]"}`} />))}</div>
        </section>
        <section className="mt-5 grid overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)] lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-5 sm:p-7"><div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-black tracking-[0.2em]"><span className="rounded-full bg-[var(--neon)] px-2.5 py-1 text-black">{current.leva}</span><span className="rounded-full border border-[var(--gold)] px-2.5 py-1 text-[var(--gold)]">{current.tag}</span></div><p className="text-xs font-bold tracking-[0.22em] text-[var(--muted)]">HISTÓRIA DA FOTO ATUAL</p><h2 className="font-display mt-2 text-[clamp(1.5rem,5vw,2.5rem)] font-black leading-tight [overflow-wrap:anywhere]">{current.title}</h2><p className="mt-4 text-lg font-medium leading-relaxed text-[#d8f6e5] [overflow-wrap:anywhere]">{current.story}</p><div className="mt-5 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-2 text-sm font-bold"><ShieldCheck size={16} className="text-[var(--neon)]" /> Proteção é sua maior força</span><span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-2 text-sm font-bold"><Sparkles size={16} className="text-[var(--gold)]" /> Harmony in Motion</span></div></div>
          <div className="relative min-h-[240px] border-t border-[var(--line)] bg-black lg:border-l lg:border-t-0">{current.src ? <img key={`story-${index}`} src={current.src} alt={current.title} className="fade-in absolute inset-0 h-full w-full object-cover opacity-90" /> : <div className="absolute inset-0"><Placeholder photo={current} n={index + 1} compact /></div>}<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-4 pt-12"><p className="font-display text-xs font-bold tracking-widest text-[var(--neon)]">FOTO {index + 1} DE 56</p><p className="font-bold [overflow-wrap:anywhere]">{current.title}</p></div></div>
        </section>
        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black tracking-[0.24em] text-[var(--gold)]">TODAS AS 56 • SEM DEIXAR NENHUMA DE FORA</p><h2 className="font-display mt-1 text-[clamp(1.6rem,5vw,2.4rem)] font-black">Grade das miniaturas</h2></div><p className="max-w-[420px] font-semibold text-[var(--muted)]">Clique em qualquer miniatura para abrir a foto no quadro. O loop pausa para você olhar com calma.</p></div>
          <div className="mt-4 flex flex-wrap gap-2">{levas.map((leva) => (<button key={leva} onClick={() => setFilter(leva)} className={`rounded-full px-4 py-2.5 text-sm font-black ${filter === leva ? "bg-[var(--neon)] text-black" : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"}`}>{leva}{leva !== "TODAS" && ` • ${photos.filter((p) => p.leva === leva).length}`}</button>))}</div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-7">{visible.map((photo) => { const realIndex = photos.indexOf(photo); const active = realIndex === index; return (<button key={photo.title} onClick={() => openPhoto(photo)} className={`group relative overflow-hidden rounded-xl border bg-black text-left transition ${active ? "thumb-active border-[var(--neon)]" : "border-white/10 hover:border-[var(--neon)]"}`} aria-label={`Abrir ${photo.title}`}><div className="aspect-square w-full overflow-hidden">{photo.src ? <img src={photo.src} alt={photo.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <Placeholder photo={photo} n={realIndex + 1} compact />}</div><span className="absolute left-1.5 top-1.5 rounded-full bg-black/80 px-2 py-0.5 text-[11px] font-black text-[var(--neon)]">{realIndex + 1}</span>{active && <span className="absolute bottom-1.5 right-1.5 z-10 rounded-full bg-[var(--neon)] px-2 py-0.5 text-[10px] font-black text-black">NO QUADRO</span>}<span className="relative block min-h-[38px] bg-black px-2 py-1.5 text-[11px] font-bold leading-tight text-white [overflow-wrap:anywhere] sm:text-xs">{photo.title}</span></button>); })}</div>
          <p className="mt-3 text-center text-sm font-bold text-[var(--muted)]">Mostrando {visible.length} de 56 fotos • {filter === "TODAS" ? "todas as levas" : filter}</p>
        </section>
        <section className="mt-8 overflow-hidden rounded-[24px] border border-[var(--gold)]/40 bg-gradient-to-br from-[#171104] to-[#07130c] p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black tracking-[0.24em] text-[var(--gold)]">CONTAGEM OFICIAL</p><h2 className="font-display mt-2 text-2xl font-black sm:text-3xl">18 oficiais + especiais = 56 fotos</h2><p className="mt-2 max-w-[700px] font-semibold text-[var(--muted)]">V1–V8: 8 &nbsp;|&nbsp; V12: 9 &nbsp;|&nbsp; V13: 1 &nbsp;|&nbsp; Total 18 oficiais + especiais = 56 fotos neste arquivo.</p></div><div className="grid grid-cols-3 gap-2 text-center">{[["18", "OFICIAIS"], ["38", "ESPECIAIS"], ["56", "FOTOS"]].map(([n, label]) => (<div key={label} className="min-w-[84px] rounded-2xl border border-[var(--line)] bg-black/50 px-3 py-3"><div className="font-display text-2xl font-black text-[var(--neon)]">{n}</div><div className="text-[10px] font-black tracking-widest text-[var(--muted)]">{label}</div></div>))}</div></div></section>
      </main>
      <footer className="border-t border-[var(--line)] bg-black/60"><div className="mx-auto flex w-full max-w-[1220px] flex-wrap items-center justify-between gap-3 px-3 py-5 text-center sm:px-6"><p className="font-display text-xs font-bold tracking-[0.18em]">CRYPY INFINYT • LOOP PURO</p><p className="text-sm font-semibold text-[var(--muted)]">V1–V8: 8 | V12: 9 | V13: 1 | Total 18 oficiais + especiais = 56 fotos neste arquivo.</p><p className="text-sm font-bold">CRYPY-WEB3.1 <span className="gold-text">System by CryptoëCrypto</span></p></div></footer>
    </div>
  );
}
