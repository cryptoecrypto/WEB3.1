import React, { useRef, useState } from "react";
import { Mail, Globe, Instagram, Facebook, Twitter, Github, Waves, Copy, Check, Send, Sparkles, ShieldCheck, Rocket, Palette, Gamepad2, Landmark, ArrowUpRight, Star } from "lucide-react";

const EMAIL = "cryptoecryptosubc@gmail.com";
const SITE = "www.cryptoecrypto.com.br";
const SITE_URL = "https://www.cryptoecrypto.com.br";

const contacts = [
  { icon: Globe, label: "Site Oficial", value: SITE, href: SITE_URL, detail: "Portal oficial do projeto", color: "#ffd35a" },
  { icon: Mail, label: "E-mail", value: EMAIL, href: `mailto:${EMAIL}`, detail: "Canal direto com o NEXUS", color: "#42ffa8" },
  { icon: Instagram, label: "Instagram", value: "@cryptoecryptosubc", href: "https://www.instagram.com/cryptoecryptosubc", detail: "Bastidores, arte e novidades", color: "#ff6ec7" },
  { icon: Facebook, label: "Facebook", value: "Cryptoe Crypto", href: "https://www.facebook.com/search/top?q=Cryptoe%20Crypto", detail: "Perfil oficial da comunidade", color: "#38bdf8" },
  { icon: Twitter, label: "X (Twitter)", value: "@cryptosubc", href: "https://x.com/cryptosubc", detail: "Atualizações rápidas do projeto", color: "#e8e8ff" },
  { icon: Github, label: "GitHub", value: "cryptoecrypto / WEB3.1", href: "https://github.com/cryptoecrypto/WEB3.1", detail: "Código e construção em Web3", color: "#a855f7" },
  { icon: Waves, label: "OpenSea", value: "CryptoeCrypto", href: "https://opensea.io/CryptoeCrypto", detail: "Coleção e arte digital", color: "#42ffa8" },
];

function Dragon() {
  return (
    <svg viewBox="0 0 520 360" className="w-full max-w-[560px] floaty pulse-glow" role="img" aria-label="Dragão dourado e verde do CRYPY sobre uma galáxia roxa">
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff3a6"/><stop offset=".5" stopColor="#ffd35a"/><stop offset="1" stopColor="#ff8a00"/></linearGradient>
        <linearGradient id="green" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b8ffe0"/><stop offset="1" stopColor="#12d98a"/></linearGradient>
        <linearGradient id="purple" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e5b8ff"/><stop offset="1" stopColor="#8b2ff0"/></linearGradient>
      </defs>
      <path d="M48 268 C100 188 155 225 206 173 C255 123 310 150 353 100 L395 64 L384 107 C421 108 455 78 475 42 C475 91 448 130 407 151 C448 171 458 210 438 248 C404 285 347 283 322 252 C296 275 255 271 233 243 C195 282 126 299 74 280 C51 273 36 268 48 268Z" fill="url(#gold)" opacity=".96"/>
      <path d="M76 266 C125 252 163 254 205 230 C229 217 255 216 283 228 C320 244 354 234 379 208 C407 225 417 250 397 267 C343 295 267 304 205 281 C164 269 112 276 76 266Z" fill="url(#green)"/>
      <path d="M250 140 L305 81 L317 118 L360 99 L338 142 L382 159 L331 170 L349 210 L304 189 L281 232 L272 184 Z" fill="url(#purple)"/>
      <circle cx="375" cy="96" r="10" fill="#fff"/><circle cx="377" cy="96" r="5" fill="#160a38"/>
      <path d="M394 112 C408 121 420 130 425 147 L402 137 C392 131 386 121 394 112Z" fill="#ff4d6d"/>
      <path d="M106 246 L76 198 L120 215 L137 163 L162 209 L209 193 L192 236 L238 252 L192 262 L203 306 L161 284 L130 318 L133 270Z" fill="#fff7b8"/>
      <path d="M67 286 Q135 326 230 316 Q295 312 358 282 Q275 333 165 325 Q98 317 67 286Z" fill="#8b2ff0" opacity=".7"/>
    </svg>
  );
}

export default function App() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Parceria");
  const [message, setMessage] = useState("");
  const [sentNote, setSentNote] = useState("");
  const [copied, setCopied] = useState("");
  const copyRef = useRef<HTMLInputElement>(null);

  const copyText = (value: string, key: string) => {
    if (!copyRef.current) return;
    copyRef.current.value = value;
    copyRef.current.select();
    document.execCommand("copy");
    setCopied(key);
    window.setTimeout(() => setCopied(""), 2200);
  };

  const openMail = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectLine = `[CRYPY • ${subject}] Contato de ${name || "visitante"}`;
    const body = `Olá, NEXUS!%0D%0A%0D%0ANome: ${encodeURIComponent(name)}%0D%0AAssunto: ${encodeURIComponent(subject)}%0D%0A%0D%0AMensagem:%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0AEnviado pela página de contato CRYPY.`;
    setSentNote("Abrindo seu aplicativo de e-mail com a mensagem pronta. É só revisar e enviar!");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subjectLine)}&body=${body}`;
  };

  return (
    <div data-safe-area-inset-root style={{ boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)" }} className="min-h-screen w-full bg-[#05010e] text-[#fff8e8] overflow-x-clip">
      <input ref={copyRef} aria-hidden="true" tabIndex={-1} className="absolute h-1 w-1 opacity-0" readOnly />
      <header data-safe-area-sticky-top style={{ top: "var(--safe-area-inset-top)" }} className="sticky z-30 border-b border-white/10 bg-[#070117]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#inicio" className="flex items-center gap-2 font-display text-sm font-black tracking-widest"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#ffd35a] text-black shadow-[0_0_22px_#ffd35a]">C</span><span>CRYPY<span className="text-[#42ffa8]">.</span></span></a>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-[#cdbff5] sm:flex"><a href="#contatos" className="hover:text-white">Contatos</a><a href="#formulario" className="hover:text-white">Formulário</a><a href="#antes" className="hover:text-white">Antes de mandar</a></nav>
          <a href={`mailto:${EMAIL}`} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-black sm:px-4 sm:text-sm">Falar agora</a>
        </div>
      </header>

      <main id="inicio" className="galaxy relative overflow-x-clip">
        <div className="stars pointer-events-none absolute inset-0 opacity-60" />
        <section className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:pt-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ffd35a]/50 bg-black/40 px-3 py-1 text-xs font-bold tracking-widest text-[#ffd35a]"><Sparkles size={15}/> NEXUS • ESQUADRÃO DAS CORES</div>
            <h1 className="font-display text-[clamp(2.6rem,9vw,5.4rem)] font-black leading-[.92] tracking-tight">CONTATO<br/><span className="bg-gradient-to-r from-[#ffd35a] via-[#42ffa8] to-[#a855f7] bg-clip-text text-transparent">CRYPY</span></h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#e7ddff] sm:text-xl">Fala com o <strong className="text-white">NEXUS</strong> — Esquadrão das Cores, <strong className="text-white">CRYPY Academy</strong> e <strong className="text-white">Museu Digital</strong>.</p>
            <p className="mt-3 max-w-xl text-[#cdbff5]">Um caminho direto, colorido e sem enrolação para parceria, coleção, aprendizado, games e museu.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={`mailto:${EMAIL}`} className="flex min-h-[58px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffd35a] to-[#ff8a00] px-6 text-base font-black text-black shadow-[0_10px_35px_rgba(255,160,0,.35)] sm:flex-none"><Mail/> Falar no E-mail</a>
              <a href={SITE_URL} target="_blank" rel="noopener" className="flex min-h-[58px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 font-black backdrop-blur sm:flex-none"><Globe/> Abrir Site Oficial</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => copyText(EMAIL, "email")} className="flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold">{copied === "email" ? <><Check size={16} className="text-[#42ffa8]"/> Copiado!</> : <><Copy size={16}/> Copiar e-mail</>}</button>
              <button onClick={() => copyText(SITE, "site")} className="flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-semibold">{copied === "site" ? <><Check size={16} className="text-[#42ffa8]"/> Copiado!</> : <><Copy size={16}/> Copiar site</>}</button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[560px] text-center"><Dragon/><div className="mt-1 flex items-center justify-center gap-2 text-sm font-bold tracking-[.22em] text-[#ffd35a]"><Star size={16}/> CRYPY INFINYT <Star size={16}/></div></div>
        </section>

        <div className="relative overflow-hidden border-y border-white/10 bg-black/40 py-3"><div className="marquee flex w-max whitespace-nowrap font-display text-sm font-bold tracking-[.2em] text-white/80"><span className="pr-8">PARCERIA ✦ NFT ✦ CRYPY ACADEMY ✦ MUSEU DIGITAL ✦ GAMES ✦ ESQUADRÃO DAS CORES ✦&nbsp;</span><span className="pr-8">PARCERIA ✦ NFT ✦ CRYPY ACADEMY ✦ MUSEU DIGITAL ✦ GAMES ✦ ESQUADRÃO DAS CORES ✦&nbsp;</span></div></div>

        <section id="contatos" className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-black tracking-[.25em] text-[#42ffa8]"><span className="h-px w-8 bg-[#42ffa8]"/>ONDE ENCONTRAR O CRYPY</div>
          <h2 className="font-display text-3xl font-black sm:text-5xl">Escolha o seu portal.</h2>
          <p className="mt-3 max-w-2xl text-[#cdbff5]">Toque em um card para abrir o canal oficial. Todos os links usam apenas os contatos fornecidos pelo projeto.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((item) => { const Icon = item.icon; return (
              <a key={item.label} href={item.href} target={item.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener" className="neon-card group flex items-start gap-4 rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(168,85,247,.25)]">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-black/50" style={{ color: item.color }}><Icon size={25}/></span>
                <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-sm font-bold text-[#cdbff5]">{item.label}<ArrowUpRight size={18} className="shrink-0 text-white/60 group-hover:text-white"/></span><span className="mt-1 block break-words text-lg font-bold leading-tight text-white">{item.value}</span><span className="mt-1 block text-sm text-[#cdbff5]">{item.detail}</span></span>
              </a>
            );})}
            <div className="neon-card flex flex-col justify-center rounded-3xl p-5 sm:col-span-2 lg:col-span-1"><p className="font-display text-xl font-bold">Prefere e-mail?</p><p className="mt-2 text-sm leading-relaxed text-[#cdbff5]">Conte o projeto, a área e o que você precisa. O NEXUS responde com atenção e cor.</p><a href="#formulario" className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#42ffa8] px-4 py-2 text-sm font-black text-black">Ir para o formulário <Send size={16}/></a></div>
          </div>
        </section>

        <section id="formulario" className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid overflow-hidden rounded-[2rem] border border-white/15 bg-[#120a28]/95 lg:grid-cols-[.85fr_1.15fr]">
            <div className="relative bg-gradient-to-br from-[#3b157a] via-[#170a3b] to-[#071021] p-6 sm:p-9">
              <div className="stars absolute inset-0 opacity-40"/>
              <div className="relative"><span className="rounded-full bg-[#ffd35a] px-3 py-1 text-xs font-black text-black">FORMULÁRIO VISUAL</span><h2 className="mt-5 font-display text-3xl font-black leading-tight sm:text-4xl">Manda a sua ideia para o NEXUS.</h2><p className="mt-4 leading-relaxed text-[#d8cfff]">Preencha os campos e toque em enviar. Seu e-mail vai abrir com tudo pronto — sem cadastro e sem enviar dados por aqui.</p><ul className="mt-7 space-y-3 text-sm font-semibold"><li className="flex gap-2"><Rocket size={19} className="text-[#ffd35a]"/> Resposta pensada para o seu projeto</li><li className="flex gap-2"><ShieldCheck size={19} className="text-[#42ffa8]"/> Você revisa antes de enviar</li><li className="flex gap-2"><Palette size={19} className="text-[#a855f7]"/> Perfeito para arte, coleção e comunidade</li></ul></div>
            </div>
            <form onSubmit={openMail} className="p-6 sm:p-9">
              <label className="block text-sm font-bold" htmlFor="nome">Seu nome</label><input id="nome" value={name} onChange={(e)=>setName(e.target.value)} required placeholder="Como podemos te chamar?" className="mt-2 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder:text-white/40"/>
              <label className="mt-5 block text-sm font-bold" htmlFor="assunto">Assunto</label><select id="assunto" value={subject} onChange={(e)=>setSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white"><option>Parceria</option><option>NFT / Coleção</option><option>CRYPY Academy</option><option>Museu Digital</option><option>Games</option><option>Outro</option></select>
              <label className="mt-5 block text-sm font-bold" htmlFor="mensagem">Mensagem</label><textarea id="mensagem" value={message} onChange={(e)=>setMessage(e.target.value)} required rows={6} placeholder="Conte o que você está criando e o que precisa do CRYPY..." className="mt-2 w-full resize-y rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder:text-white/40"/>
              <button type="submit" className="mt-6 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ffd35a] via-[#42ffa8] to-[#a855f7] px-5 font-black text-black"><Send size={20}/> Enviar e abrir e-mail</button>
              {sentNote && <p role="status" className="mt-4 rounded-xl border border-[#42ffa8]/40 bg-[#42ffa8]/10 px-4 py-3 text-sm font-semibold text-[#b8ffe0]">{sentNote}</p>}
              <p className="mt-3 text-center text-xs text-[#cdbff5]">Destinatário: {EMAIL}</p>
            </form>
          </div>
        </section>

        <section id="antes" className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black tracking-[.25em] text-[#ffd35a]">ANTES DE MANDAR</p><h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">3 dicas para um contato top.</h2></div><p className="max-w-sm text-sm text-[#cdbff5]">Quanto mais claro for o seu recado, mais rápido o NEXUS entende e responde.</p></div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[{n:"01",icon:Rocket,title:"Fale o nome do projeto",text:"Apresente o projeto ou a ideia em uma frase. Assim já sabemos qual universo você está construindo."},{n:"02",icon:Palette,title:"Diga qual área do CRYPY",text:"NFT, Academy, Games ou Museu Digital. Cada área tem uma linguagem, um ritmo e uma equipe criativa."},{n:"03",icon:Gamepad2,title:"Explique o que você precisa",text:"Parceria, divulgação, coleção, aprendizado ou criação? Conte o objetivo, o prazo e o próximo passo."}].map((tip)=>{const Icon=tip.icon;return <article key={tip.n} className="neon-card rounded-3xl p-6"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-black/50 text-[#ffd35a]"><Icon size={25}/></span><span className="font-display text-4xl font-black text-white/15">{tip.n}</span></div><h3 className="mt-5 font-display text-xl font-bold leading-snug">{tip.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#cdbff5]">{tip.text}</p></article>})}
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[#ffd35a]/30 bg-gradient-to-r from-[#ffd35a]/15 via-[#42ffa8]/10 to-[#a855f7]/20 px-5 py-5 sm:flex-row sm:px-7"><div className="text-center sm:text-left"><p className="font-display text-xl font-black">Pronto para falar com o NEXUS?</p><p className="text-sm text-[#cdbff5]">O Esquadrão das Cores está esperando a sua mensagem.</p></div><a href={`mailto:${EMAIL}`} className="flex min-h-[50px] shrink-0 items-center gap-2 rounded-full bg-[#ffd35a] px-6 font-black text-black"><Mail size={19}/> Falar no E-mail</a></div>
          <div className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-[#cdbff5]"><Landmark size={16} className="text-[#42ffa8]"/> CRYPY Academy • Museu Digital • Games • NFT • Comunidade</div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black px-4 py-8 text-center sm:px-6"><p className="font-display text-sm font-black tracking-[.18em] text-white">CRYPY INFINYT</p><a href={SITE_URL} target="_blank" rel="noopener" className="mt-2 inline-block break-words font-semibold text-[#ffd35a] hover:underline">{SITE}</a><p className="mt-2 text-sm text-[#cdbff5]">© 2026 Cryptoe Crypto</p></footer>
    </div>
  );
}
