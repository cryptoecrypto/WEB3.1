import React, { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Share2, MessageCircle, Play, Pause, Plus, X, Send, Bot, Sparkles, ShieldCheck, Users, Star, MapPin, Search, Bell, Home, Video, Eye, ChevronRight, BadgeCheck, ThumbsUp, BookOpen, Zap, Lock, Cpu, Globe, Wrench, Check, Signal, Wifi, BatteryFull, Radio, Bookmark, Music2, Disc3, CircleUserRound, Rocket } from "lucide-react";

type ThemeKey = "WEB3" | "CIBERSEGURANÇA" | "I.A." | "TECNOLOGIA" | "ENGENHARIA DIGITAL";
type Reel = { id:string; title:string; theme:ThemeKey; author:string; handle:string; desc:string; likes:number; shares:number; duration:string; grad:string; tag:string; lesson:string; saves?:number; commentsCount?:number };
type ChatMsg = { from:"bot"|"user"; text:string };
type Scrap = { id:string; from:string; text:string; when:string };
type Testimonial = { id:string; from:string; text:string };

const THEMES: {key:ThemeKey; color:string; bg:string}[] = [
  { key:"WEB3", color:"#00FF88", bg:"#0a2a1a" },
  { key:"CIBERSEGURANÇA", color:"#FF4DA6", bg:"#2a0a1e" },
  { key:"I.A.", color:"#FFD43B", bg:"#2a2105" },
  { key:"TECNOLOGIA", color:"#4DC6FF", bg:"#071e2e" },
  { key:"ENGENHARIA DIGITAL", color:"#B48CFF", bg:"#1c1230" },
];
const themeColor = (t:ThemeKey)=> THEMES.find(x=>x.key===t)?.color || "#00FF88";
const formatK = (n:number)=> n>=1000 ? `${(n/1000).toFixed(1).replace(".0","")}K` : `${n}`;

const SEED_REELS: Reel[] = [
  { id:"r0", title:"COMO MINERAR CRYPY COIN NO PC EM 2026?!", theme:"WEB3", author:"CryptoëCrypto", handle:"@cryptoecrypto", desc:"BABY I.A. mostrando como funciona o ecossistema CRYPY COIN! O futuro da Web3.1 é agora.", likes:48200, shares:12400, duration:"0:59", grad:"linear-gradient(160deg,#00FF88,#06281a 55%,#000)", tag:"CRYPYSHOTS", lesson:"Mineração no CRYPY é sobre entender o ecossistema antes de clicar: carteira, rede e regra visível. Comece pequeno, confira tudo e pergunte ao BABY.", saves:8900, commentsCount:3100 },
  { id:"r1", title:"WEB3 em 40 segundos: carteira, chave e contrato", theme:"WEB3", author:"Maya Cripto", handle:"@maya.web3", desc:"Antes de clicar em qualquer link, entenda o que você assina. Sua chave é sua identidade.", likes:1284, shares:214, duration:"0:42", grad:"linear-gradient(160deg,#00FF88,#06281a 55%,#000)", tag:"COMECE AQUI", lesson:"Carteira guarda chaves, não moedas. Contrato inteligente executa regras, não promessas.", saves:342, commentsCount:96 },
  { id:"r2", title:"Phishing tem cara de e-mail urgente. Não caia.", theme:"CIBERSEGURANÇA", author:"Rafa Shield", handle:"@rafa.shield", desc:"Urgência + link + pedido de senha = sinal vermelho. Respire, confira o remetente.", likes:2410, shares:512, duration:"0:37", grad:"linear-gradient(160deg,#FF4DA6,#2b0719 55%,#000)", tag:"ALERTA", lesson:"Nenhum serviço sério pede senha por mensagem. Verifique o endereço real do remetente.", saves:511, commentsCount:148 },
  { id:"r3", title:"I.A. que resume, I.A. que inventa: como conferir", theme:"I.A.", author:"Lia Neuronal", handle:"@lia.ia", desc:"Use a I.A. para rascunhar, não para decidir sozinha. Peça fontes e compare.", likes:1876, shares:301, duration:"0:51", grad:"linear-gradient(160deg,#FFD43B,#2a2100 55%,#000)", tag:"PRÁTICA", lesson:"Peça 3 fontes, verifique uma por uma e nunca cole dado sensível no prompt.", saves:428, commentsCount:121 },
  { id:"r4", title:"Seu celular pode ser um laboratório de tecnologia", theme:"TECNOLOGIA", author:"Theo Bits", handle:"@theo.bits", desc:"Sensores, automação e nuvem cabem no bolso. Comece com um projeto pequeno.", likes:932, shares:88, duration:"0:48", grad:"linear-gradient(160deg,#4DC6FF,#041a2e 55%,#000)", tag:"FAÇA VOCÊ", lesson:"Um projeto pequeno e terminado vale mais que dez ideias gigantes.", saves:210, commentsCount:64 },
  { id:"r5", title:"Engenharia digital: do protótipo ao produto que aguenta", theme:"ENGENHARIA DIGITAL", author:"Eng. Nilo", handle:"@nilo.build", desc:"Protótipo prova a ideia. Engenharia prova que ela aguenta gente de verdade.", likes:1543, shares:176, duration:"0:59", grad:"linear-gradient(160deg,#B48CFF,#160b2e 55%,#000)", tag:"BASTIDORES", lesson:"Teste, documente e versione. O que não está testado, vai falhar na hora errada.", saves:388, commentsCount:89 },
  { id:"r6", title:"Contrato inteligente não é mágica: é regra visível", theme:"WEB3", author:"Maya Cripto", handle:"@maya.web3", desc:"Se você não entende a regra, não assine. Leia o resumo, simule e pergunte.", likes:1102, shares:143, duration:"0:44", grad:"linear-gradient(160deg,#00FF88,#042a1f 55%,#000)", tag:"SEGURO", lesson:"Regra visível pode ser auditada. Promessa invisível não pode ser cobrada.", saves:274, commentsCount:77 },
];

const BOT_BY_THEME: Record<ThemeKey,{explain:string; safe:string; learn:string}> = {
  "WEB3":{ explain:"WEB3 é a web em que você guarda suas próprias chaves e pode verificar regras públicas, sem depender de um único intermediário.", safe:"É seguro quando você confere o que assina, usa senha forte, verificação em duas etapas e nunca compartilha sua frase secreta.", learn:"Você aprende a diferenciar carteira, rede e contrato — e a ler um resumo antes de confirmar." },
  "CIBERSEGURANÇA":{ explain:"Cibersegurança é o cuidado diário com senhas, links, aparelhos e permissões. Pequenos hábitos evitam grandes prejuízos.", safe:"É seguro quando você desconfia da urgência, confere o remetente e mantém o aparelho atualizado.", learn:"Você aprende a reconhecer phishing, criar senhas fortes e revisar permissões dos apps." },
  "I.A.":{ explain:"I.A. aqui é uma ferramenta que organiza, resume e sugere — não uma fonte automática de verdade.", safe:"É segura quando você não envia dado sensível, pede fontes e verifica o resultado antes de usar.", learn:"Você aprende a fazer boas perguntas, pedir fontes e comparar respostas." },
  "TECNOLOGIA":{ explain:"Tecnologia é a ponte entre uma ideia e algo que funciona na vida real: app, automação, sensor ou serviço.", safe:"É segura quando o projeto respeita privacidade, tem backup e explica o que faz com seus dados.", learn:"Você aprende a começar pequeno, testar rápido e melhorar com feedback." },
  "ENGENHARIA DIGITAL":{ explain:"Engenharia digital é transformar protótipo em produto confiável: testes, documentação e manutenção.", safe:"É segura quando cada mudança é testada, registrada e pode ser desfeita sem perder dados.", learn:"Você aprende a planejar, testar e documentar como quem constrói para durar." },
};

async function callApi(action:string, args:any){
  const res = await fetch("actions", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ action, args }) });
  const json = await res.json().catch(()=>({}));
  if(!res.ok || json?.error) throw new Error(json?.error || `Falha na ação ${action}`);
  return json.data;
}
const uid = ()=> `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;

export default function App(){
  const [tab,setTab]=useState<"reels"|"orkut">("reels");
  const [filter,setFilter]=useState<"TODOS"|ThemeKey>("TODOS");
  const [playing,setPlaying]=useState<string|null>(null);
  const [liked,setLiked]=useState<Record<string,boolean>>({});
  const [likeCount,setLikeCount]=useState<Record<string,number>>({});
  const [shareCount,setShareCount]=useState<Record<string,number>>({});
  const [shared,setShared]=useState<Record<string,boolean>>({});
  const [savedMap,setSavedMap]=useState<Record<string,boolean>>({});
  const [followingMap,setFollowingMap]=useState<Record<string,boolean>>({});
  const [openComments,setOpenComments]=useState<string|null>(null);
  const [commentText,setCommentText]=useState<Record<string,string>>({});
  const [comments,setComments]=useState<Record<string,{id:string;author:string;text:string}[]>>({});
  const [userReels,setUserReels]=useState<Reel[]>([]);
  const [showPost,setShowPost]=useState(false);
  const [postTitle,setPostTitle]=useState(""); const [postDesc,setPostDesc]=useState(""); const [postTheme,setPostTheme]=useState<ThemeKey>("WEB3"); const [postAuthor,setPostAuthor]=useState("");
  const [postStatus,setPostStatus]=useState<string|null>(null); const [postBusy,setPostBusy]=useState(false);
  const [botOpen,setBotOpen]=useState(false); const [botHasNew,setBotHasNew]=useState(true);
  const [chat,setChat]=useState<ChatMsg[]>([{from:"bot", text:"Oi! Eu sou o BABY MODERADOR. Clique em qualquer Reel e eu explico o tema, por que é seguro e o que você vai aprender. Sem pressa, sem jargão."}]);
  const [chatInput,setChatInput]=useState(""); const [activeReel,setActiveReel]=useState<Reel>(SEED_REELS[0]);
  const [apiNote,setApiNote]=useState<string|null>(null);
  const [featuredId,setFeaturedId]=useState<string>(SEED_REELS[0].id);
  const [feedTab,setFeedTab]=useState<"seguindo"|"para-voce">("para-voce");
  const [shareOpen,setShareOpen]=useState(false);
  const [phoneCommentsOpen,setPhoneCommentsOpen]=useState(false);
  const [shareNote,setShareNote]=useState<string|null>(null);
  const postRef=useRef<HTMLDivElement>(null);

  // Orkut state
  const [scraps,setScraps]=useState<Scrap[]>([
    {id:"s1", from:"Maya Cripto", text:"Sensei, sua explicação de WEB3 salvou minha carteira! Obrigada por deixar tudo simples.", when:"hoje • 09:12"},
    {id:"s2", from:"Rafa Shield", text:"Bora revisar as permissões dos apps na live de amanhã? Trago o checklist.", when:"ontem • 21:04"},
    {id:"s3", from:"Lia Neuronal", text:"Adorei o Reel sobre conferir fontes da I.A. Já virei fã!", when:"ontem • 18:30"},
  ]);
  const [testimonials,setTestimonials]=useState<Testimonial[]>([
    {id:"t1", from:"Theo Bits", text:"Sensei explica tecnologia sem complicar. Virei fã na hora!"},
    {id:"t2", from:"Eng. Nilo", text:"Comunidade organizada, conteúdo seguro e gente boa. Recomendo!"},
  ]);
  const [scrapName,setScrapName]=useState(""); const [scrapText,setScrapText]=useState(""); const [scrapStatus,setScrapStatus]=useState<string|null>(null);
  const [testiName,setTestiName]=useState(""); const [testiText,setTestiText]=useState(""); const [testiStatus,setTestiStatus]=useState<string|null>(null);
  const [joined,setJoined]=useState<Record<string,boolean>>({}); const [isFriend,setIsFriend]=useState(false);
  const [commentStatus,setCommentStatus]=useState<string|null>(null);
  const chatEndRef=useRef<HTMLDivElement>(null);

  const allReels = useMemo(()=> [...userReels, ...SEED_REELS], [userReels]);
  const filtered = useMemo(()=> filter==="TODOS" ? allReels : allReels.filter(r=>r.theme===filter), [allReels, filter]);
  const featured = useMemo(()=> allReels.find(r=>r.id===featuredId) || filtered[0] || allReels[0], [allReels, featuredId, filtered]);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[chat, botOpen]);
  useEffect(()=>{ loadAll(); },[]);

  async function loadAll(){
    try{
      const [r,c,s,t]=await Promise.all([
        callApi("records.list",{collection:"crypykut_reels"}),
        callApi("records.list",{collection:"crypykut_comments"}),
        callApi("records.list",{collection:"crypykut_scraps"}),
        callApi("records.list",{collection:"crypykut_testimonials"}),
      ]);
      const reels = (r?.records||[]).map((rec:any)=> rec.value as Reel).reverse();
      setUserReels(reels);
      const cm:Record<string,any[]>={};
      (c?.records||[]).forEach((rec:any)=>{ const v=rec.value; if(!cm[v.reelId]) cm[v.reelId]=[]; cm[v.reelId].push({id:rec.id, author:v.author, text:v.text}); });
      setComments(cm);
      if((s?.records||[]).length) setScraps((s.records as any[]).map((rec:any)=>({id:rec.id, ...rec.value})).reverse());
      if((t?.records||[]).length) setTestimonials((t.records as any[]).map((rec:any)=>({id:rec.id, ...rec.value})).reverse());
    }catch(e){ setApiNote("Conteúdo de exemplo carregado. Suas publicações serão salvas quando a conexão estiver disponível."); }
  }

  function explainReel(reel:Reel){
    setActiveReel(reel); setFeaturedId(reel.id); setBotOpen(true); setBotHasNew(true);
    const b=BOT_BY_THEME[reel.theme];
    setChat(prev=>[...prev, {from:"bot", text:`Vamos falar de “${reel.title}” — tema ${reel.theme}.`}, {from:"bot", text:`O QUE É: ${b.explain}`}, {from:"bot", text:`POR QUE É SEGURO: ${b.safe}`}, {from:"bot", text:`O QUE VOCÊ APRENDE: ${b.learn} Lição do Reel: ${reel.lesson}`}]);
  }
  function askBot(q:string){
    setChat(prev=>[...prev,{from:"user",text:q}]);
    const up=q.toUpperCase();
    const found = THEMES.find(t=> up.includes(t.key) || (t.key==="I.A." && up.includes("IA")) || (t.key==="CIBERSEGURANÇA" && up.includes("SEGURAN")) );
    setTimeout(()=>{
      if(found){ const b=BOT_BY_THEME[found.key]; setChat(p=>[...p,{from:"bot",text:`Sobre ${found.key}: ${b.explain} ${b.safe} ${b.learn}`}]); }
      else if(up.includes("SEGURO")||up.includes("GOLPE")||up.includes("PHISHING")) setChat(p=>[...p,{from:"bot",text:"Boa pergunta! Desconfie de urgência + link + pedido de senha. Confira o remetente, não clique no impulso e ative a verificação em duas etapas."}]);
      else if(up.includes("COMEÇ")||up.includes("COMEÇAR")||up.includes("INICIO")||up.includes("INÍCIO")) setChat(p=>[...p,{from:"bot",text:"Comece por WEB3 básico, depois Cibersegurança. Assista um Reel por vez, anote uma lição e pratique com calma."}]);
      else setChat(p=>[...p,{from:"bot",text:"Entendi! Posso explicar WEB3, Cibersegurança, I.A., Tecnologia ou Engenharia Digital. Toque em um tema abaixo ou clique em um Reel."}]);
    },350);
  }
  function sendChat(){ if(!chatInput.trim()) return; const v=chatInput; setChatInput(""); askBot(v); }

  async function submitReel(){
    if(!postTitle.trim()||!postDesc.trim()||!postAuthor.trim()){ setPostStatus("Preencha título, descrição e seu nome para postar."); return; }
    const value:Reel={ id:uid(), title:postTitle.trim(), theme:postTheme, author:postAuthor.trim(), handle:"@"+postAuthor.trim().toLowerCase().replace(/[^a-z0-9]+/g,".").replace(/^\.+|\.+$/g,"")||"@voce", desc:postDesc.trim(), likes:0, shares:0, duration:"0:45", grad:"linear-gradient(160deg,#00FF88,#06281a 55%,#000)", tag:"NOVO DA COMUNIDADE", lesson:"Conteúdo da comunidade CRYPY — confira com calma e pergunte ao BABY MODERADOR.", saves:0, commentsCount:0 };
    setPostBusy(true); setPostStatus(null);
    try{ await callApi("records.create",{collection:"crypykut_reels", value, idempotency_key:`reel-${value.id}`}); setUserReels(p=>[value,...p]); setFeaturedId(value.id); setPostStatus("Reel publicado e salvo! Ele já aparece no topo do feed."); setPostTitle(""); setPostDesc(""); setPostAuthor(""); }
    catch(e:any){ setPostStatus(`Não foi possível salvar agora: ${e.message||"tente novamente"}`); }
    finally{ setPostBusy(false); }
  }
  async function submitComment(reelId:string){
    const txt=(commentText[reelId]||"").trim(); if(!txt) return;
    const value={ reelId, author:"Você", text:txt };
    try{ const created=await callApi("records.create",{collection:"crypykut_comments", value, idempotency_key:`comment-${uid()}`}); setComments(p=>({...p,[reelId]:[...(p[reelId]||[]),{id:created.id, author:"Você", text:txt}]})); setCommentText(p=>({...p,[reelId]:""})); setCommentStatus("Comentário salvo."); }
    catch(e:any){ setCommentStatus(`Comentário não salvo: ${e.message}`); }
  }
  async function submitScrap(){
    if(!scrapName.trim()||!scrapText.trim()){ setScrapStatus("Escreva seu nome e o recado."); return; }
    const value={ from:scrapName.trim(), text:scrapText.trim(), when:"agora" };
    try{ const created=await callApi("records.create",{collection:"crypykut_scraps", value, idempotency_key:`scrap-${uid()}`}); setScraps(p=>[{id:created.id,...value},...p]); setScrapName(""); setScrapText(""); setScrapStatus("Scrap enviado e salvo no mural do Sensei!"); }
    catch(e:any){ setScrapStatus(`Não foi possível salvar: ${e.message}`); }
  }
  async function submitTestimonial(){
    if(!testiName.trim()||!testiText.trim()){ setTestiStatus("Escreva seu nome e o depoimento."); return; }
    const value={ from:testiName.trim(), text:testiText.trim() };
    try{ const created=await callApi("records.create",{collection:"crypykut_testimonials", value, idempotency_key:`testi-${uid()}`}); setTestimonials(p=>[{id:created.id,...value},...p]); setTestiName(""); setTestiText(""); setTestiStatus("Depoimento salvo! Obrigado por fazer parte."); }
    catch(e:any){ setTestiStatus(`Não foi possível salvar: ${e.message}`); }
  }

  const likeOf=(r:Reel)=> (likeCount[r.id] ?? r.likes) + (liked[r.id]?1:0);
  const shareOf=(r:Reel)=> (shareCount[r.id] ?? r.shares) + (shared[r.id]?1:0);
  const saveOf=(r:Reel)=> (r.saves ?? 0) + (savedMap[r.id]?1:0);
  const commentCountOf=(r:Reel)=> (r.commentsCount ?? 0) + (comments[r.id]?.length||0);
  const openPost=()=>{ setShowPost(true); setTimeout(()=>postRef.current?.scrollIntoView({behavior:"smooth"}),80); };

  const isFeaturedPlaying = playing===featured.id;
  const isFeatured = featured.id==="r0";

  return (
    <div data-safe-area-inset-root style={{boxSizing:"border-box", paddingTop:"var(--safe-area-inset-top)"}} className="min-h-screen bg-[#020403] text-[#eafff3] overflow-x-clip">
      {/* TOP MENU */}
      <header data-safe-area-sticky-top style={{top:"var(--safe-area-inset-top)"}} className="sticky z-40 border-b border-[#1d3a2a] bg-[#050807]/95 backdrop-blur">
        <div className="mx-auto max-w-[1240px] px-3 sm:px-5">
          <div className="flex items-center justify-between gap-2 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#00FF88] text-black font-bold text-lg">C</div>
              <div className="leading-none">
                <p className="font-bold tracking-[0.18em] text-[clamp(18px,4vw,26px)]">CRYPY<span className="text-[#00FF88]">KUT</span></p>
                <p className="mono text-[10px] tracking-[0.22em] text-[#9db8a8]">REELS + ORKUT • UM SÓ MENU</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[12px] mono"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#00FF88] animate-pulse"/> COMUNIDADE ONLINE</span><span className="text-[#9db8a8]">• Conteúdo de exemplo CRYPY</span></div>
            <button onClick={()=>{setBotOpen(true); setBotHasNew(false);}} className="flex items-center gap-1.5 rounded-full border border-[#00FF88] px-3 py-1.5 text-[12px] font-bold hover:bg-[#00FF88] hover:text-black"><Bot size={16}/> BABY MODERADOR {botHasNew && <span className="h-2 w-2 rounded-full bg-[#FF4DA6]"/>}</button>
          </div>
          <nav className="flex gap-2 pb-3" aria-label="Menu CRYPYKUT">
            <button onClick={()=>setTab("reels")} className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] sm:text-sm font-bold transition ${tab==="reels"?"bg-[#00FF88] text-black shadow-[0_0_24px_#00FF8844]":"bg-[#0b1510] border border-[#1d3a2a] hover:border-[#00FF88]"}`}><Video size={17}/> CRYPYKUT REELS <span className="hidden sm:inline mono text-[10px] opacity-70">PÁGINA 1</span></button>
            <button onClick={()=>setTab("orkut")} className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] sm:text-sm font-bold transition ${tab==="orkut"?"bg-[#FF4DA6] text-white shadow-[0_0_24px_#FF4DA655]":"bg-[#0b1510] border border-[#1d3a2a] hover:border-[#FF4DA6]"}`}><Users size={17}/> CRYPYKUT ORKUT <span className="hidden sm:inline mono text-[10px] opacity-70">PÁGINA 2</span></button>
          </nav>
        </div>
      </header>

      {tab==="reels" ? (
        <main className="mx-auto max-w-[1240px] px-3 sm:px-5 pb-28">
          {/* ============ CRYPYSHOTS PHONE ============ */}
          <section className="pt-5 flex justify-center">
            <div className="relative w-full max-w-[430px] overflow-hidden rounded-[0px] sm:rounded-[38px] border-0 sm:border-[3px] border-[#1d3a2a] bg-black shadow-[0_30px_80px_rgba(0,255,136,0.12)] flex flex-col">
              {/* STATUS BAR */}
              <div className="flex items-center justify-between px-5 pt-3 pb-1 text-white bg-[#03130c]">
                <span className="text-[13px] font-semibold tracking-wide">05:32</span>
                <div className="flex items-center gap-1.5"><Signal size={14}/><Wifi size={14}/><BatteryFull size={18}/></div>
              </div>

              {/* CRYPYSHOTS HEADER */}
              <div className="flex items-center justify-between gap-2 bg-[#03130c] px-3 py-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-[#00FF88] bg-[#03130c] text-[#00FF88] font-black text-[14px] shadow-[0_0_14px_#00FF8888]">C</span>
                  <span className="font-black tracking-tight text-[17px] leading-none">CRYPY<span className="text-[#00FF88]">SHOTS</span></span>
                  <span className="rounded-full bg-[#00FF88] px-1.5 py-0.5 text-[9px] font-black text-black leading-none">WEB3.1</span>
                </div>
                <div className="flex items-center gap-1 text-white">
                  <button aria-label="Pesquisa" onClick={()=>{setFilter("TODOS"); setFeedTab("para-voce");}} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><Search size={18}/></button>
                  <button aria-label="Criar novo Reel" onClick={openPost} className="grid h-8 w-8 place-items-center rounded-full bg-white/10 border border-white/20 hover:bg-[#00FF88] hover:text-black"><Plus size={18}/></button>
                  <button aria-label="Notificações" onClick={()=>{setBotOpen(true); setBotHasNew(false);}} className="relative grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><Bell size={18}/>{botHasNew && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#FF4DA6]"/>}</button>
                  <button aria-label="Live" onClick={()=>explainReel(featured)} className="flex items-center gap-1 rounded-full bg-[#FF2D55]/15 border border-[#FF2D55]/40 px-2 py-1 text-[10px] font-bold text-[#FF6B81]"><span className="h-1.5 w-1.5 rounded-full bg-[#FF2D55] animate-pulse"/>LIVE</button>
                </div>
              </div>

              {/* TABS */}
              <div className="flex items-center justify-center gap-8 bg-[#03130c] px-4 pb-1 text-[14px] font-semibold">
                <button onClick={()=>setFeedTab("seguindo")} className={`pb-1.5 ${feedTab==="seguindo"?"text-white border-b-[3px] border-[#00FF88]":"text-white/60 border-b-[3px] border-transparent"}`}>Seguindo</button>
                <button onClick={()=>setFeedTab("para-voce")} className={`pb-1.5 ${feedTab==="para-voce"?"text-white border-b-[3px] border-[#00FF88]":"text-white/60 border-b-[3px] border-transparent"}`}>Para Você</button>
              </div>

              {/* VIDEO STAGE */}
              <div className="relative flex-1 overflow-hidden bg-[#04281a]" style={{minHeight:"600px"}}>
                {/* office background */}
                <div className="absolute inset-0" style={{background:"radial-gradient(ellipse at 50% 20%, #0a4a2a 0%, #04281a 45%, #010a05 100%)"}}/>
                <div className="absolute inset-0 opacity-40" style={{backgroundImage:"linear-gradient(rgba(0,255,136,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.07) 1px, transparent 1px)", backgroundSize:"34px 34px"}}/>
                <div className="absolute -left-10 top-24 h-40 w-40 rounded-full bg-[#00FF88]/20 blur-3xl"/><div className="absolute -right-8 top-56 h-44 w-44 rounded-full bg-[#FFD43B]/15 blur-3xl"/>
                <div className="absolute left-4 top-16 h-8 w-24 rounded bg-white/5 border border-white/10"/><div className="absolute right-6 top-24 h-6 w-16 rounded bg-white/5 border border-white/10"/>
                {/* CRYPY logo left */}
                <div className="absolute left-3 top-[38%] z-10 flex items-center gap-1.5">
                  <span className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-[#00FF88] bg-[#03130c] text-[#00FF88] font-black text-[20px] shadow-[0_0_22px_#00FF88]">C</span>
                  <span className="font-black text-[18px] tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">CRYPY</span>
                </div>

                {/* BABY */}
                <div className="absolute left-1/2 top-[16%] -translate-x-1/2 z-[5] flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute -top-2 left-1/2 h-5 w-[3px] -translate-x-1/2 bg-[#0a0a0a]"/><div className="absolute -top-4 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#00FF88] shadow-[0_0_16px_#00FF88]"/>
                    <div className="relative h-[188px] w-[188px] rounded-full border border-[#2a4a35] bg-gradient-to-b from-[#151515] via-[#0a0a0a] to-[#000] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                      <div className="absolute left-1/2 top-[46%] h-[52px] w-[138px] -translate-x-1/2 rounded-[28px] border border-[#00FF88]/70 bg-gradient-to-r from-[#00FF88] via-[#7dffc4] to-[#00FF88] shadow-[0_0_28px_#00FF88]"/>
                      <div className="absolute left-[30%] top-[56%] h-2 w-2 rounded-full bg-black/70"/><div className="absolute right-[30%] top-[56%] h-2 w-2 rounded-full bg-black/70"/>
                      <div className="absolute left-1/2 top-[72%] h-[3px] w-[70px] -translate-x-1/2 rounded bg-white/20"/>
                    </div>
                    {/* coin in hand */}
                    <div className="absolute -right-6 bottom-2 z-10 grid h-[82px] w-[82px] place-items-center rounded-full bg-gradient-to-br from-[#FFF3A3] via-[#FFD43B] to-[#B8860B] border-[3px] border-[#FFF7C0] shadow-[0_0_30px_#FFD43B]">
                      <span className="grid h-[58px] w-[58px] place-items-center rounded-full border-2 border-dashed border-[#8a6500]/60 font-black text-[28px] text-[#6b4d00]">C</span>
                    </div>
                    <div className="absolute -left-1 bottom-6 grid h-10 w-10 place-items-center rounded-full bg-[#0a0a0a] border border-white/20 text-[16px]">✋</div>
                  </div>
                  <div className="mt-[-10px] h-[72px] w-[220px] rounded-t-[36px] bg-gradient-to-b from-[#101010] to-[#03130c] border border-white/10"/>
                </div>
                <button onClick={()=>setPlaying(isFeaturedPlaying?null:featured.id)} aria-label={isFeaturedPlaying?"Pausar vídeo":"Assistir vídeo"} className="absolute left-1/2 top-[46%] z-20 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-black/45 border border-white/40 text-white backdrop-blur">
                  {isFeaturedPlaying ? <Pause size={24}/> : <Play size={24} className="ml-1"/>}
                </button>

                {/* HEADLINE */}
                <div className="absolute inset-x-3 bottom-[218px] z-10 text-center">
                  <p className="font-black leading-[1.05] text-[clamp(22px,6vw,30px)] drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] [overflow-wrap:anywhere]">
                    <span className="mr-1">🚀</span>
                    {isFeatured ? <><span className="text-[#00FF88]">COMO MINERAR<br/>CRYPY COIN</span><br/><span className="text-white">NO PC EM 2026?!</span></> : <><span className="text-[#00FF88]">{featured.title}</span></>}
                  </p>
                  {isFeaturedPlaying && <p className="mono mt-2 text-[10px] tracking-[0.25em] text-[#00FF88]">● TOCANDO • BABY EXPLICA</p>}
                </div>

                {/* RIGHT RAIL */}
                <div className="absolute right-2 bottom-[150px] z-20 flex flex-col items-center gap-3">
                  <button onClick={()=>setLiked(p=>({...p,[featured.id]:!p[featured.id]}))} aria-label="Curtir" className="flex flex-col items-center gap-0.5">
                    <span className={`grid h-11 w-11 place-items-center rounded-full bg-black/45 border backdrop-blur ${liked[featured.id]?"border-[#FF4DA6] text-[#FF4DA6]":"border-white/25 text-white"}`}><Heart size={22} fill={liked[featured.id]?"currentColor":"none"}/></span>
                    <span className="text-[11px] font-bold text-white drop-shadow">{formatK(likeOf(featured))}</span>
                  </button>
                  <button onClick={()=>setPhoneCommentsOpen(true)} aria-label="Ver comentários" className="flex flex-col items-center gap-0.5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-black/45 border border-white/25 text-white backdrop-blur"><MessageCircle size={22}/></span>
                    <span className="text-[11px] font-bold text-white drop-shadow">{formatK(commentCountOf(featured))}</span>
                  </button>
                  <button onClick={()=>{setShareOpen(true); setShareNote(null);}} aria-label="Compartilhar" className="flex flex-col items-center gap-0.5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-black/45 border border-white/25 text-white backdrop-blur"><Share2 size={22}/></span>
                    <span className="text-[11px] font-bold text-white drop-shadow">{formatK(shareOf(featured))}</span>
                  </button>
                  <button onClick={()=>setSavedMap(p=>({...p,[featured.id]:!p[featured.id]}))} aria-label="Salvar" className="flex flex-col items-center gap-0.5">
                    <span className={`grid h-11 w-11 place-items-center rounded-full bg-black/45 border backdrop-blur ${savedMap[featured.id]?"border-[#FFD43B] text-[#FFD43B]":"border-white/25 text-white"}`}><Bookmark size={22} fill={savedMap[featured.id]?"currentColor":"none"}/></span>
                    <span className="text-[11px] font-bold text-white drop-shadow">{formatK(saveOf(featured))}</span>
                  </button>
                  <button onClick={()=>explainReel(featured)} aria-label="Abrir disco do BABY" className="mt-1 grid h-12 w-12 place-items-center rounded-full border-2 border-[#00FF88]/70 bg-black shadow-[0_0_18px_#00FF8855] animate-[spin_4s_linear_infinite]">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#03130c] text-[#00FF88] font-black text-[14px]">C</span>
                  </button>
                </div>

                {/* BOTTOM INFO */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent px-3 pb-2 pt-10">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2b6cff] to-[#FF4DA6] font-bold text-white">C</span>
                    <button onClick={()=>setFollowingMap(p=>({...p,[featured.id]:!p[featured.id]}))} className="flex items-center gap-1 font-bold text-[14px] text-white [overflow-wrap:anywhere]">{featured.handle} <BadgeCheck size={16} className="text-[#00FF88] shrink-0"/></button>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${followingMap[featured.id]?"bg-white/15 text-white border border-white/30":"bg-[#00FF88] text-black"}`}>{followingMap[featured.id]?"Seguindo":"Seguir"}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-white/95 [overflow-wrap:anywhere]">{featured.desc}</p>
                  <p className="mt-1 text-[12px] font-semibold text-[#7dffc4] [overflow-wrap:anywhere]">#crypyshots #babyia #web3 #crypycoin #cryptoecrypto #nexus</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-white/80"><MapPin size={12} className="text-[#FF4DA6]"/> HD-MATRIZ • Central</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/85"><Music2 size={12}/> CryptoëCrypto • Som Original <span className="ml-auto mono">0:14 / {featured.duration}</span></p>
                  <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/25"><div className="h-full w-[24%] rounded-full bg-[#00FF88]"/></div>
                  {shareNote && <p className="mt-1.5 rounded-lg bg-[#00FF88]/15 border border-[#00FF88]/30 px-2 py-1 text-[11px] text-[#aaffd6]">{shareNote}</p>}
                </div>

                {/* SHARE SHEET */}
                {shareOpen && (
                  <div className="absolute inset-0 z-30 flex items-end bg-black/60" onClick={()=>setShareOpen(false)}>
                    <div className="w-full rounded-t-[22px] bg-[#0b1510] p-4" onClick={e=>e.stopPropagation()}>
                      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20"/>
                      <p className="font-bold">Compartilhar este Reel</p>
                      <p className="text-[12px] text-[#9db8a8]">Escolha para onde ele vai dentro da comunidade.</p>
                      <div className="mt-3 grid gap-2">
                        <button onClick={()=>{setShared(p=>({...p,[featured.id]:true})); setShareNote("Marcado para compartilhar com a comunidade. Obrigado!"); setShareOpen(false);}} className="rounded-xl bg-[#00FF88] px-4 py-3 font-bold text-black text-left">Compartilhar com a comunidade</button>
                        <button onClick={()=>{setShareNote("Enviado para o BABY MODERADOR explicar este Reel."); setShareOpen(false); explainReel(featured);}} className="rounded-xl border border-white/20 px-4 py-3 font-bold text-left">Enviar para o BABY MODERADOR</button>
                        <button onClick={()=>setShareOpen(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-[13px]">Fechar</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* COMMENTS SHEET */}
                {phoneCommentsOpen && (
                  <div className="absolute inset-0 z-30 flex items-end bg-black/60" onClick={()=>setPhoneCommentsOpen(false)}>
                    <div className="max-h-[70%] w-full overflow-y-auto rounded-t-[22px] bg-[#0b1510] p-4" onClick={e=>e.stopPropagation()}>
                      <div className="flex items-center justify-between"><p className="font-bold">Comentários • {formatK(commentCountOf(featured))}</p><button aria-label="Fechar comentários" onClick={()=>setPhoneCommentsOpen(false)} className="rounded-full border p-1"><X size={16}/></button></div>
                      <div className="mt-3 grid gap-2 text-[13px]">
                        <p className="text-[#9db8a8]"><b className="text-white">Ana Cripto:</b> Explicação clara! Já anotei a lição.</p>
                        <p className="text-[#9db8a8]"><b className="text-white">Theo Bits:</b> Quero a parte 2 desse tema.</p>
                        {(comments[featured.id]||[]).map(cm=><p key={cm.id} className="text-[#9db8a8] [overflow-wrap:anywhere]"><b className="text-white">{cm.author}:</b> {cm.text}</p>)}
                      </div>
                      <div className="mt-3 flex gap-2"><input value={commentText[featured.id]||""} onChange={e=>setCommentText(p=>({...p,[featured.id]:e.target.value}))} placeholder="Escreva um comentário..." className="min-w-0 flex-1 rounded-full bg-black/50 border border-[#1d3a2a] px-3 py-2 text-[13px] outline-none"/><button onClick={()=>submitComment(featured.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#00FF88] text-black"><Send size={16}/></button></div>
                      {commentStatus && <p className="mt-1 text-[12px] text-[#00FF88]">{commentStatus}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* PHONE BOTTOM NAV */}
              <nav className="flex items-center justify-around border-t border-white/10 bg-black px-2 py-2.5 text-white" aria-label="Navegação CRYPYSHOTS">
                <button onClick={()=>{setFeaturedId(filtered[0]?.id||SEED_REELS[0].id); setShareOpen(false); setPhoneCommentsOpen(false);}} className="flex flex-col items-center gap-0.5 text-[#00FF88]"><Home size={22}/><span className="text-[10px] font-semibold">Home</span></button>
                <button onClick={()=>{setFilter("TODOS"); postRef.current?.scrollIntoView({behavior:"smooth"});}} className="flex flex-col items-center gap-0.5 text-white/80"><Search size={22}/><span className="text-[10px]">Pesquisa</span></button>
                <button onClick={openPost} aria-label="Criar novo Reel" className="grid h-12 w-12 -translate-y-2 place-items-center rounded-full bg-[#00FF88] text-black shadow-[0_0_24px_#00FF88]"><Plus size={26}/></button>
                <button onClick={()=>{setBotOpen(true); setBotHasNew(false);}} className="flex flex-col items-center gap-0.5 text-white/80"><MessageCircle size={22}/><span className="text-[10px]">Mensagens</span></button>
                <button onClick={()=>setTab("orkut")} className="flex flex-col items-center gap-0.5 text-white/80"><CircleUserRound size={22}/><span className="text-[10px]">Perfil</span></button>
              </nav>
            </div>
          </section>

          {/* FILTERS + POST + FEED BELOW PHONE */}
          <div className="mx-auto mt-5 max-w-[430px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="mono text-[11px] tracking-[0.2em] text-[#00FF88]">CRYPYSHOTS • WEB3.1 • PARA VOCÊ</p>
              <button onClick={openPost} className="flex items-center gap-1.5 rounded-full bg-[#00FF88] px-4 py-2 text-[13px] font-bold text-black"><Plus size={16}/> Postar novo Reel</button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Filtrar por tema">
              {(["TODOS", ...THEMES.map(t=>t.key)] as const).map(k=>(
                <button key={k} onClick={()=>{setFilter(k); const first = k==="TODOS" ? allReels[0] : allReels.find(r=>r.theme===k); if(first) setFeaturedId(first.id);}} className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold border ${filter===k?"bg-white text-black border-white":"bg-transparent text-white border-[#2a4a35]"}`}>{k==="TODOS"?"TODOS OS TEMAS":k}</button>
              ))}
              <span className="shrink-0 self-center mono text-[11px] text-[#9db8a8] ml-1">{filtered.length} Reels • {filter}</span>
            </div>
            {apiNote && <p className="mt-3 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-[13px] text-yellow-100">{apiNote}</p>}
          </div>

          <div ref={postRef} className="mx-auto mt-4 max-w-[860px]">
            {showPost && (
              <section className="rounded-3xl border border-[#00FF88] bg-[#0b1510] p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold flex items-center gap-2"><Plus className="text-[#00FF88]"/> Postar novo Reel</h2><p className="text-[13px] text-[#9db8a8]">Escolha um tema fixo. Seu Reel é salvo e aparece no topo do feed.</p></div><button aria-label="Fechar formulário" onClick={()=>setShowPost(false)} className="rounded-full border p-2"><X size={16}/></button></div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-[13px] font-bold">Seu nome<input value={postAuthor} onChange={e=>setPostAuthor(e.target.value)} placeholder="Ex.: Ana Cripto" className="rounded-xl bg-black/50 border border-[#1d3a2a] px-3 py-2.5 font-normal outline-none focus:border-[#00FF88]"/></label>
                  <label className="grid gap-1 text-[13px] font-bold">Tema fixo<select value={postTheme} onChange={e=>setPostTheme(e.target.value as ThemeKey)} className="rounded-xl bg-black/50 border border-[#1d3a2a] px-3 py-2.5 font-normal outline-none">{THEMES.map(t=><option key={t.key} value={t.key}>{t.key}</option>)}</select></label>
                  <label className="grid gap-1 text-[13px] font-bold sm:col-span-2">Título do Reel<input value={postTitle} onChange={e=>setPostTitle(e.target.value)} placeholder="Ex.: Como criar uma senha forte em 1 minuto" className="rounded-xl bg-black/50 border border-[#1d3a2a] px-3 py-2.5 font-normal outline-none focus:border-[#00FF88]"/></label>
                  <label className="grid gap-1 text-[13px] font-bold sm:col-span-2">Descrição<textarea value={postDesc} onChange={e=>setPostDesc(e.target.value)} rows={3} placeholder="Explique em poucas linhas o que a pessoa vai aprender..." className="rounded-xl bg-black/50 border border-[#1d3a2a] px-3 py-2.5 font-normal outline-none focus:border-[#00FF88]"/></label>
                </div>
                {postStatus && <p className="mt-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 px-3 py-2 text-[13px]">{postStatus}</p>}
                <div className="mt-4 flex flex-wrap gap-2"><button disabled={postBusy} onClick={submitReel} className="rounded-full bg-[#00FF88] px-6 py-3 font-bold text-black disabled:opacity-50">{postBusy?"Publicando...":"Publicar Reel"}</button><button onClick={()=>setShowPost(false)} className="rounded-full border px-5 py-3">Cancelar</button></div>
              </section>
            )}
          </div>

          {/* FEED — tap to play in phone */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((reel)=>{
              const isPlaying=playing===reel.id; const c=themeColor(reel.theme);
              const isActive = reel.id===featuredId;
              return (
                <article key={reel.id} className={`overflow-hidden rounded-[24px] border bg-[#0b1510] transition ${isActive?"border-[#00FF88] shadow-[0_0_24px_#00FF8844]":"border-[#1d3a2a] hover:border-[#00FF88]/60"}`}>
                  <div className="relative aspect-[9/13] sm:aspect-[9/12] p-4 flex flex-col justify-between cursor-pointer" style={{background:reel.grad}} onClick={()=>{setFeaturedId(reel.id); explainReel(reel);}} role="button" aria-label={`Ver explicação de ${reel.title}`}>
                    <div className="flex justify-between items-start">
                      <span className="rounded-full px-3 py-1 text-[11px] font-bold bg-black/60 border" style={{color:c, borderColor:c}}>{reel.theme}</span>
                      <span className="mono text-[11px] bg-black/60 px-2 py-1 rounded-full flex items-center gap-1"><Eye size={12}/>{reel.duration}</span>
                    </div>
                    <div className="flex justify-center"><div className="relative grid h-20 w-20 place-items-center rounded-full bg-black/55 border border-white/30 backdrop-blur">{isPlaying ? <Pause size={28}/> : <Play size={28} className="ml-1"/>}<span className="absolute inset-0 rounded-full border border-[#00FF88]/50" style={{animation:"pulse-ring 1.6s infinite"}}/></div></div>
                    <div>
                      {isPlaying && <div className="mb-2 flex h-7 items-end gap-1">{[0,1,2,3,4,5,6,7].map(i=><span key={i} className="eq-bar w-2 rounded-t bg-white/90" style={{animationDelay:`${i*0.09}s`}}/>) }<span className="mono text-[11px] ml-1 pb-1">TOCANDO • TOQUE PARA EXPLICAÇÃO</span></div>}
                      <p className="mono text-[10px] tracking-[0.2em] text-white/80">{reel.tag} • CLIQUE PARA O BABY EXPLICAR</p>
                      <h3 className="mt-1 text-[20px] font-bold leading-tight [overflow-wrap:anywhere]">{reel.title}</h3>
                      <p className="mt-1 text-[13px] text-white/85 [overflow-wrap:anywhere]">{reel.desc}</p>
                      <p className="mt-2 text-[12px] font-bold">{reel.author} <span className="opacity-70 font-normal">{reel.handle}</span></p>
                    </div>
                    <button onClick={(e)=>{e.stopPropagation(); setFeaturedId(reel.id); setPlaying(isPlaying?null:reel.id);}} className="absolute bottom-4 right-4 rounded-full bg-white text-black px-3 py-1.5 text-[12px] font-bold">{isPlaying?"Pausar":"Assistir"}</button>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-1">
                      <button onClick={()=>setLiked(p=>({...p,[reel.id]:!p[reel.id]}))} className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold ${liked[reel.id]?"bg-[#FF4DA6]/15 text-[#FF4DA6]":"hover:bg-white/5"}`} aria-label="Curtir Reel"><Heart size={18} fill={liked[reel.id]?"currentColor":"none"}/> {formatK(likeOf(reel))}</button>
                      <button onClick={()=>{setFeaturedId(reel.id); setShared(p=>({...p,[reel.id]:true})); setShareCount(p=>({...p,[reel.id]:(p[reel.id]??reel.shares)}));}} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold hover:bg-white/5" aria-label="Compartilhar Reel"><Share2 size={18}/> {formatK(shareOf(reel))}</button>
                      <button onClick={()=>setOpenComments(openComments===reel.id?null:reel.id)} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold hover:bg-white/5" aria-label="Comentar Reel"><MessageCircle size={18}/> {commentCountOf(reel)}</button>
                      <button onClick={()=>explainReel(reel)} className="flex items-center gap-1 rounded-full bg-[#00FF88] px-3 py-2 text-[12px] font-bold text-black"><Bot size={15}/> BABY</button>
                    </div>
                    {shared[reel.id] && <p className="mt-1 rounded-lg bg-white/5 px-2 py-1 text-[12px] text-[#00FF88]">Marcado para compartilhar com a comunidade. Obrigado!</p>}
                    {openComments===reel.id && (
                      <div className="mt-3 border-t border-[#1d3a2a] pt-3">
                        <p className="text-[13px] font-bold flex items-center gap-1"><MessageCircle size={15}/> Comentários</p>
                        <div className="mt-2 grid gap-2">
                          <p className="text-[13px] text-[#9db8a8]"><b className="text-white">Ana Cripto:</b> Explicação clara! Já anotei a lição.</p>
                          <p className="text-[13px] text-[#9db8a8]"><b className="text-white">Theo Bits:</b> Quero a parte 2 desse tema.</p>
                          {(comments[reel.id]||[]).map(cm=><p key={cm.id} className="text-[13px] text-[#9db8a8] [overflow-wrap:anywhere]"><b className="text-white">{cm.author}:</b> {cm.text}</p>)}
                        </div>
                        <div className="mt-2 flex gap-2"><input value={commentText[reel.id]||""} onChange={e=>setCommentText(p=>({...p,[reel.id]:e.target.value}))} placeholder="Escreva um comentário..." className="min-w-0 flex-1 rounded-full bg-black/50 border border-[#1d3a2a] px-3 py-2 text-[13px] outline-none focus:border-[#00FF88]"/><button onClick={()=>submitComment(reel.id)} className="rounded-full bg-[#00FF88] px-3 py-2 text-black"><Send size={16}/></button></div>
                        {commentStatus && <p className="mt-1 text-[12px] text-[#00FF88]">{commentStatus}</p>}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {filtered.length===0 && <p className="mt-8 text-center text-[#9db8a8]">Nenhum Reel neste tema ainda. Seja a primeira pessoa a postar!</p>}

          {/* BABY EXPLAINER CARD */}
          <section className="mt-8 rounded-3xl border border-[#00FF88]/40 bg-gradient-to-br from-[#0b1510] to-black p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mono text-[11px] tracking-[0.25em] text-[#00FF88]">AGORA NO BABY MODERADOR</p><h2 className="mt-1 text-[clamp(20px,4vw,28px)] font-bold leading-tight">“{activeReel.title}”</h2><p className="text-[#9db8a8] text-[13px]">Tema <b style={{color:themeColor(activeReel.theme)}}>{activeReel.theme}</b> • por {activeReel.author}</p></div><button onClick={()=>{setBotOpen(true); setBotHasNew(false);}} className="rounded-full bg-[#00FF88] px-4 py-2.5 font-bold text-black text-[13px]">Abrir chat do BABY</button></div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="flex items-center gap-2 font-bold text-[#00FF88]"><BookOpen size={17}/> O QUE É</p><p className="mt-2 text-[13px] text-[#c8ddd0] [overflow-wrap:anywhere]">{BOT_BY_THEME[activeReel.theme].explain}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="flex items-center gap-2 font-bold text-[#FF4DA6]"><ShieldCheck size={17}/> POR QUE É SEGURO</p><p className="mt-2 text-[13px] text-[#c8ddd0] [overflow-wrap:anywhere]">{BOT_BY_THEME[activeReel.theme].safe}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><p className="flex items-center gap-2 font-bold text-[#FFD43B]"><Sparkles size={17}/> O QUE VOCÊ APRENDE</p><p className="mt-2 text-[13px] text-[#c8ddd0] [overflow-wrap:anywhere]">{BOT_BY_THEME[activeReel.theme].learn}</p></div>
            </div>
          </section>
        </main>
      ) : (
        /* ================= ORKUT ================= */
        <main className="orkut-font bg-[#d9e6f7] text-[#1a1a1a] min-h-screen pb-16">
          <div className="bg-gradient-to-r from-[#2b6cff] via-[#3a7bff] to-[#ff4da6] text-white">
            <div className="mx-auto max-w-[1100px] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 text-[12px] sm:text-[13px]">
              <div className="flex items-center gap-3"><span className="font-bold text-[20px] tracking-tight">crypy<span className="text-[#ffd43b]">kut</span></span><span className="hidden sm:inline opacity-90">Início • Perfil • Amigos • Comunidades • Scraps</span></div>
              <div className="flex items-center gap-2"><span className="hidden md:inline">Olá, Sensei!</span><span className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1"><Bell size={14}/> 3</span><span className="bg-white text-[#2b6cff] rounded-full px-2 py-1 font-bold">Sair</span></div>
            </div>
          </div>
          <div className="mx-auto max-w-[1100px] px-3 sm:px-4 pt-4">
            <div className="rounded-xl bg-white border border-[#a8c0e8] p-3 flex flex-wrap items-center gap-2 text-[12px]"><span className="bg-[#ff4da6] text-white rounded-full px-2 py-1 font-bold">NOVIDADE</span><span>Bem-vindo de volta, Sensei! Você tem <b>3 scraps novos</b> e <b>2 convites</b> de comunidade.</span><button onClick={()=>setTab("reels")} className="ml-auto text-[#2b6cff] font-bold underline">Ver Reels CRYPY →</button></div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr_230px] items-start">
              {/* LEFT */}
              <aside className="grid gap-4">
                <section className="rounded-xl bg-white border border-[#f0a8cc] overflow-hidden">
                  <div className="bg-[#ff4da6] text-white px-3 py-2 font-bold text-[14px]">Perfil</div>
                  <div className="p-3 text-center">
                    <div className="mx-auto grid h-[120px] w-[120px] place-items-center rounded-full bg-gradient-to-br from-[#2b6cff] to-[#ff4da6] text-white text-[48px] font-bold border-4 border-white shadow">S</div>
                    <h2 className="mt-2 text-[18px] font-bold">Sensei</h2>
                    <p className="text-[12px] text-[#666] flex items-center justify-center gap-1"><BadgeCheck size={14} className="text-[#2b6cff]"/> Guia da comunidade CRYPY</p>
                    <p className="mt-1 text-[12px] flex items-center justify-center gap-1"><MapPin size={12}/> Brasil • Online agora</p>
                    <div className="mt-3 grid grid-cols-3 gap-1 text-[11px]"><div className="bg-[#eef3ff] rounded-lg p-2"><b className="block text-[16px]">128</b>amigos</div><div className="bg-[#fff0f7] rounded-lg p-2"><b className="block text-[16px]">42</b>fãs</div><div className="bg-[#fff8e0] rounded-lg p-2"><b className="block text-[16px]">12</b>comun.</div></div>
                    <button onClick={()=>setIsFriend(true)} className={`mt-3 w-full rounded-full py-2 font-bold text-[13px] ${isFriend?"bg-[#e8f5e9] text-green-700 border border-green-300":"bg-[#2b6cff] text-white"}`}>{isFriend?"✓ Você já é amigo do Sensei":"＋ Adicionar amigo"}</button>
                    <p className="mt-2 text-[11px] text-[#888]">Quem sou eu: explico tecnologia com calma, sem golpe e sem pressa.</p>
                  </div>
                </section>
                <section className="rounded-xl bg-white border border-[#a8c0e8]"><div className="px-3 py-2 font-bold text-[13px] border-b border-[#d9e6f7] text-[#2b6cff]">Meus amigos (6)</div><div className="p-3 grid grid-cols-3 gap-2 text-center text-[11px]">{["Maya","Rafa","Lia","Theo","Nilo","Ana"].map((n,i)=><div key={n}><div className="mx-auto grid h-12 w-12 place-items-center rounded-full text-white font-bold" style={{background:["#00b894","#ff4da6","#ffb703","#4dc6ff","#b48cff","#00c853"][i]}}>{n[0]}</div><p className="mt-1 [overflow-wrap:anywhere]">{n}</p><p className="text-green-600">● online</p></div>)}</div><button className="w-full py-2 text-[12px] text-[#2b6cff] font-bold border-t">ver todos os 128 amigos →</button></section>
                <section className="rounded-xl bg-white border border-[#f0a8cc] p-3"><p className="font-bold text-[13px] text-[#ff4da6]">Fãs do Sensei</p><div className="mt-2 flex -space-x-2">{["M","R","L","T","N"].map((x,i)=><span key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#2b6cff] text-white text-[12px] font-bold">{x}</span>)}</div><p className="mt-2 text-[12px] text-[#666]">42 pessoas marcaram Sensei como fã. Obrigado, comunidade!</p></section>
              </aside>

              {/* CENTER */}
              <section className="grid gap-4 min-w-0">
                <div className="rounded-xl bg-white border border-[#a8c0e8] overflow-hidden">
                  <div className="bg-[#2b6cff] text-white px-3 py-2 font-bold text-[14px] flex justify-between"><span>Recados / Scraps</span><span>✉️ {scraps.length}</span></div>
                  <div className="p-3">
                    <div className="rounded-lg bg-[#fff0f7] border border-[#f0a8cc] p-3 grid gap-2">
                      <p className="font-bold text-[13px]">✍️ Enviar scrap para Sensei</p>
                      <input value={scrapName} onChange={e=>setScrapName(e.target.value)} placeholder="Seu nome" className="rounded-md border border-[#ccc] px-2 py-2 text-[13px] outline-none"/>
                      <textarea value={scrapText} onChange={e=>setScrapText(e.target.value)} rows={2} placeholder="Deixe um recado carinhoso e sem links estranhos..." className="rounded-md border border-[#ccc] px-2 py-2 text-[13px] outline-none"/>
                      <button onClick={submitScrap} className="w-fit rounded-full bg-[#ff4da6] text-white px-4 py-2 font-bold text-[13px]">Enviar scrap</button>
                      {scrapStatus && <p className="text-[12px] text-[#2b6cff]">{scrapStatus}</p>}
                    </div>
                    <div className="mt-3 grid gap-3">{scraps.map(s=>(
                      <div key={s.id} className="flex gap-3 border-b border-dashed border-[#ddd] pb-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#2b6cff] text-white font-bold">{s.from[0]}</div><div className="min-w-0"><p className="text-[13px]"><b className="text-[#2b6cff]">{s.from}</b> <span className="text-[#999] text-[11px]">{s.when}</span></p><p className="text-[13px] [overflow-wrap:anywhere]">{s.text}</p><p className="mt-1 text-[12px] text-[#ff4da6]">Responder • Curtir • Denunciar</p></div></div>
                    ))}</div>
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-[#a8c0e8] overflow-hidden">
                  <div className="bg-[#ff4da6] text-white px-3 py-2 font-bold text-[14px]">Comunidades CRYPY</div>
                  <div className="grid sm:grid-cols-2 gap-3 p-3">
                    {[
                      {name:"WEB3 com calma", members:"12.480 membros", desc:"Carteiras, contratos e boas práticas sem pressa.", icon:<Globe/>},
                      {name:"Cibersegurança para todos", members:"18.204 membros", desc:"Senhas fortes, golpes e proteção no dia a dia.", icon:<Lock/>},
                      {name:"I.A. na prática", members:"15.932 membros", desc:"Prompts, fontes e uso responsável da I.A.", icon:<Cpu/>},
                      {name:"Engenharia Digital", members:"9.417 membros", desc:"Protótipos, testes e produtos que duram.", icon:<Wrench/>},
                    ].map(c=>(
                      <div key={c.name} className="rounded-lg border border-[#d9e6f7] p-3"><div className="flex items-center gap-2 text-[#2b6cff]">{c.icon}<b className="text-[14px] text-black">{c.name}</b></div><p className="mt-1 text-[12px] text-[#666]">{c.members} • {c.desc}</p><button onClick={()=>setJoined(p=>({...p,[c.name]:!p[c.name]}))} className={`mt-2 rounded-full px-3 py-1.5 text-[12px] font-bold ${joined[c.name]?"bg-green-100 text-green-700 border border-green-300":"bg-[#2b6cff] text-white"}`}>{joined[c.name]?"✓ Você entrou na comunidade":"Entrar em comunidade"}</button></div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-[#f0a8cc] overflow-hidden">
                  <div className="bg-[#ff4da6] text-white px-3 py-2 font-bold text-[14px]">Depoimentos</div>
                  <div className="p-3">
                    <div className="grid gap-2 bg-[#fff8e0] rounded-lg border border-yellow-200 p-3"><p className="font-bold text-[13px]">💌 Deixar depoimento para Sensei</p><input value={testiName} onChange={e=>setTestiName(e.target.value)} placeholder="Seu nome" className="rounded-md border px-2 py-2 text-[13px]"/><textarea value={testiText} onChange={e=>setTestiText(e.target.value)} rows={2} placeholder="O que você aprendeu com o Sensei?" className="rounded-md border px-2 py-2 text-[13px]"/><button onClick={submitTestimonial} className="w-fit rounded-full bg-[#ff4da6] text-white px-4 py-2 font-bold text-[13px]">Deixar depoimento</button>{testiStatus && <p className="text-[12px] text-[#2b6cff]">{testiStatus}</p>}</div>
                    <div className="mt-3 grid gap-3">{testimonials.map(t=>(
                      <div key={t.id} className="flex gap-3"><div className="text-[#ffb703]"><Star size={20} fill="currentColor"/></div><div><p className="text-[13px] font-bold text-[#2b6cff]">{t.from}</p><p className="text-[13px] [overflow-wrap:anywhere]">“{t.text}”</p></div></div>
                    ))}</div>
                  </div>
                </div>
              </section>

              {/* RIGHT */}
              <aside className="grid gap-4">
                <section className="rounded-xl bg-white border border-[#a8c0e8]"><div className="px-3 py-2 font-bold text-[13px] text-[#2b6cff] border-b">Amigos online agora</div><div className="p-3 grid gap-2 text-[12px]">{["Maya Cripto","Rafa Shield","Lia Neuronal","Theo Bits"].map((n,i)=><div key={n} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"/><b>{n}</b><span className="ml-auto text-[#999]">agora</span></div>)}</div></section>
                <section className="rounded-xl bg-white border border-[#f0a8cc] p-3"><p className="font-bold text-[13px] text-[#ff4da6]">Comunidades em destaque</p><ul className="mt-2 grid gap-2 text-[12px]"><li>• WEB3 com calma — 12.480 membros</li><li>• Cibersegurança para todos — 18.204 membros</li><li>• I.A. na prática — 15.932 membros</li><li>• Engenharia Digital — 9.417 membros</li></ul><button onClick={()=>setTab("reels")} className="mt-3 w-full rounded-full bg-[#00FF88] py-2 font-bold text-[12px] text-black">Ver Reels dessas comunidades</button></section>
                <section className="rounded-xl bg-[#fff8e0] border border-yellow-300 p-3"><p className="font-bold text-[13px]">🛡️ Regras da casa</p><p className="mt-1 text-[12px] leading-relaxed">Sem links estranhos. Sem pedido de senha. Respeito sempre. Dúvida? Pergunte ao BABY MODERADOR nos Reels.</p><button onClick={()=>{setTab("reels"); setBotOpen(true);}} className="mt-2 rounded-full bg-[#2b6cff] text-white px-3 py-1.5 text-[12px] font-bold">Perguntar ao BABY</button></section>
              </aside>
            </div>
          </div>
        </main>
      )}

      {/* BABY MODERADOR */}
      {tab==="reels" && (
        <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-24px)] max-w-[360px]">
          {!botOpen ? (
            <button onClick={()=>{setBotOpen(true); setBotHasNew(false);}} className="ml-auto flex items-center gap-3 rounded-full bg-[#00FF88] p-2 pr-4 text-black shadow-[0_10px_30px_#00FF8855] animate-floaty" aria-label="Abrir BABY MODERADOR">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-black text-[#00FF88] text-[20px] font-bold">B</span><span className="text-left leading-none"><b className="block text-[14px]">BABY MODERADOR</b><span className="text-[11px]">Toque e pergunte • online</span></span>{botHasNew && <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#FF4DA6] text-white text-[11px] font-bold">1</span>}
            </button>
          ) : (
            <div className="overflow-hidden rounded-[22px] border border-[#00FF88] bg-[#07120c] shadow-2xl">
              <div className="flex items-center gap-2 bg-[#00FF88] px-3 py-2.5 text-black"><span className="grid h-8 w-8 place-items-center rounded-full bg-black text-[#00FF88] font-bold">B</span><div className="min-w-0 flex-1 leading-none"><p className="font-bold text-[14px]">BABY MODERADOR</p><p className="text-[11px]">Explica tudo • sem jargão • sem golpe</p></div><button onClick={()=>setBotOpen(false)} aria-label="Fechar chat" className="rounded-full bg-black/10 p-1.5"><X size={16}/></button></div>
              <div className="h-[300px] overflow-y-auto p-3 grid gap-2 content-start">
                {chat.map((m,i)=>(<div key={i} className={`max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed [overflow-wrap:anywhere] ${m.from==="bot"?"bg-white/10 text-white rounded-tl-md":"ml-auto bg-[#00FF88] text-black rounded-tr-md font-medium"}`}>{m.text}</div>))}
                <div ref={chatEndRef}/>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-3 pb-2">{THEMES.map(t=><button key={t.key} onClick={()=>askBot(`Explique ${t.key}`)} className="shrink-0 rounded-full border border-[#00FF88]/40 px-2.5 py-1 text-[11px] font-bold">{t.key}</button>)}</div>
              <form onSubmit={e=>{e.preventDefault(); sendChat();}} className="flex gap-2 border-t border-white/10 p-2"><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Pergunte sobre WEB3, I.A...." className="min-w-0 flex-1 rounded-full bg-black/50 border border-white/15 px-3 py-2 text-[13px] outline-none"/><button type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#00FF88] text-black"><Send size={16}/></button></form>
            </div>
          )}
        </div>
      )}
      {tab==="orkut" && (
        <div className="fixed bottom-3 right-3 z-40"><button onClick={()=>setTab("reels")} className="flex items-center gap-2 rounded-full bg-[#00FF88] px-4 py-3 font-bold text-black shadow-xl text-[13px]"><Video size={16}/> Ir para Reels • BABY</button></div>
      )}
    </div>
  );
}
