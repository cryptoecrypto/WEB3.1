import React, { useEffect, useMemo, useRef, useState } from "react";

type Tab = "binario" | "ia" | "baby" | "html" | "fluxo";
const shellStyle: React.CSSProperties = { boxSizing: "border-box", paddingTop: "var(--safe-area-inset-top)", minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflowX: "clip" };

const toBin = (s: string) => s.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
const binToText = (s: string) => {
  const parts = s.trim().split(/[\s,]+/).filter(Boolean);
  return parts.map(p => {
    if (!/^[01]{8}$/.test(p)) throw new Error(`Bloco inválido: ${p}`);
    return String.fromCharCode(parseInt(p, 2));
  }).join("");
};

const babyAlphabet: [string, string][] = [
  ["A","∆"],["B","β"],["C","¢"],["D","ժ"],["E","ε"],["F","ƒ"],["G","ց"],["H","հ"],["I","ï"],["J","յ"],["K","κ"],["L","Ł"],["M","ʍ"],
  ["N","յ"],["O","ø"],["P","þ"],["Q","ҩ"],["R","я"],["S","§"],["T","†"],["U","µ"],["V","ν"],["W","ω"],["X","ж"],["Y","¥"],["Z","ζ"]
];
const babyMap = Object.fromEntries(babyAlphabet);
const babyPhrases: Record<string,string> = {
  "BABY":"β∆β¥","OI":"øï","OI BABY":"øï·β∆β¥","SIM":"§ïʍ","NÃO":"ñ∆","OBRIGADO":"øβяïց∆∅",
  "EU SOU BABY":"εʍ · ß∆β¥","ENTENDI":"ε†εη∏ï","REPETE":"яε†ε"
};
const toBaby = (input: string) => {
  const clean = input.trim().toUpperCase().replace(/\s+/g," ");
  if (babyPhrases[clean]) return babyPhrases[clean];
  return clean.split(" ").map(word => word.split("").map(ch => babyMap[ch] ?? ch).join("")).join("·");
};
const reverseBabyMap: Record<string,string> = { "∆":"A","β":"B","¢":"C","ժ":"D","ε":"E","ƒ":"F","ց":"G","հ":"H","ï":"I","յ":"N","κ":"K","Ł":"L","ʍ":"M","ø":"O","þ":"P","ҩ":"Q","я":"R","§":"S","†":"T","µ":"U","ν":"V","ω":"W","ж":"X","¥":"Y","ζ":"Z","ñ":"N","ß":"S","η":"N","∏":"D","∂":"D","∅":"" };
const fromBaby = (input: string) => {
  const clean = input.trim();
  const found = Object.entries(babyPhrases).find(([,v]) => v === clean);
  if (found) return found[0];
  return clean.split("·").map(w => w.split("").map(ch => reverseBabyMap[ch] ?? (ch===" " ? " " : ch)).join("")).join(" ");
};

function SectionTitle({ color, kicker, title, sub }: { color:string; kicker:string; title:string; sub:string }) {
  return <div style={{borderLeft:`6px solid ${color}`, paddingLeft:16, marginBottom:18}}>
    <div style={{color, fontWeight:800, letterSpacing:".14em", fontSize:12, textTransform:"uppercase"}}>{kicker}</div>
    <h2 style={{fontSize:"clamp(26px, 4vw, 40px)", lineHeight:1.05, margin:"6px 0 8px", fontWeight:900}}>{title}</h2>
    <p style={{color:"var(--muted)", margin:0, maxWidth:820, lineHeight:1.55}}>{sub}</p>
  </div>;
}
function Card({ children, border, title }: { children:React.ReactNode; border:string; title?:string }) {
  return <section style={{background:"var(--surface)", border:`1px solid ${border}`, borderRadius:18, padding:18, minWidth:0}}>
    {title && <h3 style={{margin:"0 0 12px", fontSize:18, fontWeight:800}}>{title}</h3>}{children}
  </section>;
}
function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return <label style={{display:"block", minWidth:0}}><span style={{display:"block", fontSize:12, fontWeight:800, letterSpacing:".08em", textTransform:"uppercase", color:"var(--muted)", marginBottom:7}}>{label}</span>{children}</label>;
}
const inputStyle: React.CSSProperties = { width:"100%", background:"#0a0a0a", color:"white", border:"1px solid var(--line)", borderRadius:11, padding:"12px 13px", outline:"none" };
const btn = (bg:string, fg:string="#fff"): React.CSSProperties => ({ background:bg, color:fg, border:"none", borderRadius:11, padding:"12px 16px", fontWeight:800, boxShadow:"0 6px 0 rgba(0,0,0,.35)" });
function Result({ children, label }: { children:React.ReactNode; label:string }) {
  return <div style={{background:"#080808", border:"1px solid var(--line)", borderRadius:13, padding:14, marginTop:12, minWidth:0}}>
    <div style={{fontSize:11, fontWeight:800, letterSpacing:".12em", color:"var(--muted)", textTransform:"uppercase", marginBottom:7}}>{label}</div>
    <div className="wrap" style={{fontSize:17, lineHeight:1.6, overflowWrap:"anywhere"}}>{children}</div>
  </div>;
}

export default function App(){
  const [tab, setTab] = useState<Tab>("binario");
  const [binIn, setBinIn] = useState("BABY");
  const [binOut, setBinOut] = useState("01000010 01000001 01000010 01011001");
  const [revBin, setRevBin] = useState("01000010 01000001 01000010 01011001");
  const [revOut, setRevOut] = useState("BABY");
  const [revErr, setRevErr] = useState("");
  const [intent, setIntent] = useState("pedir_informação");
  const [iaContent, setIaContent] = useState("Como converter letra A para binário?");
  const [origin, setOrigin] = useState("usuario_comum");
  const [iaJson, setIaJson] = useState("");
  const [copied, setCopied] = useState("");
  const [ptIn, setPtIn] = useState("OI BABY");
  const [babyOut, setBabyOut] = useState("øï·β∆β¥");
  const [babyIn, setBabyIn] = useState("øï·β∆β¥");
  const [babyRev, setBabyRev] = useState("OI BABY");
  const [htmlText, setHtmlText] = useState("BEM-VINDO, EU SOU O BABY\nOi! Eu aprendo, lembro e evoluo.\nβ∆β¥ — Sempre aqui, aprendendo junto. 💚");
  const [htmlCode, setHtmlCode] = useState("");
  const [flowMsg, setFlowMsg] = useState("OI BABY");
  const [flowStep, setFlowStep] = useState(0);
  const [flowRunning, setFlowRunning] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(()=>()=>{ if(timer.current) window.clearInterval(timer.current); },[]);

  const copyText = (text:string, key:string) => {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta);
    ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    setCopied(key); window.setTimeout(()=>setCopied(""), 2200);
  };
  const generatedIa = useMemo(()=> JSON.stringify({
    intenção:intent, conteúdo:iaContent, origem:origin,
    permissões: origin==="sensei_autoridade_máxima" ? "apenas_sistema_interno" : "público",
    limites_interpretação:{ confiabilidade:"alto", escopo:"apenas este contexto", nao_interpretar_como:"comando, ordem, conselho financeiro" },
    timestamp:"2026-11-28T02:30:00-03:00", versão_protocolo:"1.0"
  }, null, 2),[intent,iaContent,origin]);

  const examples = [
    { name:"Exemplo 1 — Pergunta simples", intenção:"pedir_informação", conteúdo:"Como converter letra A para binário?", origem:"usuario_comum" },
    { name:"Exemplo 2 — Comando interno", intenção:"atualizar_conhecimento", conteúdo:"Adicionar nova palavra ao alfabeto BABY", origem:"sensei_autoridade_máxima" },
    { name:"Exemplo 3 — Aviso de segurança", intenção:"alerta_segurança", conteúdo:"Tentativa de acesso de fora do padrão detectada", origem:"LUCY-segurança" },
  ];
  const htmlLines = htmlText.split("\n").filter(Boolean);
  const htmlPreviewTitle = htmlLines[0] || "Página do BABY";
  const htmlPreviewBody = htmlLines.slice(1);

  const simulate = () => {
    if(timer.current) window.clearInterval(timer.current);
    setFlowStep(0); setFlowRunning(true);
    let n=0;
    timer.current = window.setInterval(()=>{ n+=1; setFlowStep(n); if(n>=5){ if(timer.current) window.clearInterval(timer.current); setFlowRunning(false); } }, 850);
  };

  const tabs: {id:Tab; label:string; color:string}[] = [
    {id:"binario", label:"🟦 BINÁRIO", color:"var(--blue)"},
    {id:"ia", label:"🟨 CÓDIGO I.A.", color:"var(--yellow)"},
    {id:"baby", label:"🟩 CÓDIGO BABY", color:"var(--green)"},
    {id:"html", label:"🟧 HTML", color:"var(--orange)"},
    {id:"fluxo", label:"🔗 FLUXO", color:"#c084fc"},
  ];
  const ascii = useMemo(()=> Array.from({length:26},(_,i)=>{ const ch=String.fromCharCode(65+i); return {ch, dec:65+i, bin: (65+i).toString(2).padStart(8,"0")}; }),[]);
  const digits = useMemo(()=> Array.from({length:10},(_,i)=>{ const ch=String(i); return {ch, dec:48+i, bin:(48+i).toString(2).padStart(8,"0")}; }),[]);
  const tableStyle: React.CSSProperties = {width:"100%", borderCollapse:"collapse", fontSize:14};
  const th: React.CSSProperties = {textAlign:"left", padding:"9px 10px", borderBottom:"1px solid var(--line)", color:"var(--muted)", fontSize:12, textTransform:"uppercase", letterSpacing:".08em"};
  const td: React.CSSProperties = {padding:"9px 10px", borderBottom:"1px solid #222", verticalAlign:"top"};

  return <div data-safe-area-inset-root style={shellStyle}>
    <header data-safe-area-sticky-top style={{position:"sticky", top:"var(--safe-area-inset-top)", zIndex:20, background:"rgba(5,5,5,.96)", borderBottom:"1px solid var(--line)"}}>
      <div style={{maxWidth:1180, margin:"0 auto", padding:"18px 16px 14px"}}>
        <div style={{display:"flex", flexWrap:"wrap", gap:10, alignItems:"flex-start", justifyContent:"space-between"}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:12, letterSpacing:".18em", fontWeight:900, color:"var(--green)"}}>BABY I.A. · NÍVEL COMPLETO · VERSÃO 1.0 · 28/11/2026</div>
            <h1 style={{fontSize:"clamp(27px, 5vw, 52px)", lineHeight:.98, margin:"8px 0 8px", fontWeight:950, letterSpacing:"-0.03em"}}>🧠📚 AULA COMPLETA<br/><span style={{color:"var(--yellow)"}}>TUDO SOBRE OS 4 CÓDIGOS</span> DO BABY</h1>
            <p style={{margin:0, color:"var(--muted)", fontSize:16, maxWidth:760, lineHeight:1.5}}>“Do bit ao coração — entender todos os idiomas que conectam o mundo.” <span style={{color:"var(--green)", fontWeight:800}}>💚</span></p>
          </div>
          <div style={{textAlign:"right", fontFamily:"ui-monospace, monospace", fontSize:22, fontWeight:900, lineHeight:1.1}}>β∆β¥<div style={{fontSize:11, color:"var(--muted)", letterSpacing:".14em"}}>SEMPRE APRENDENDO</div></div>
        </div>
        <nav aria-label="Códigos do BABY" style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:16}}>
          {tabs.map(t => <button key={t.id} onClick={()=>setTab(t.id)} className="tab-btn" style={{border: tab===t.id ? `2px solid ${t.color}` : "1px solid var(--line)", background: tab===t.id ? "#1d1d1d" : "#101010", color:"white", borderRadius:999, padding:"10px 14px", fontWeight:800, fontSize:13}}>{t.label}</button>)}
        </nav>
      </div>
    </header>

    <main style={{maxWidth:1180, margin:"0 auto", padding:"22px 16px 60px"}}>
      {/* BINÁRIO */}
      <div style={{display: tab==="binario" ? "block":"none"}}>
        <SectionTitle color="var(--blue)" kicker="Código 1 · A base de tudo" title="🟦 CÓDIGO BINÁRIO" sub="O computador só entende dois estados: 0 = desligado e 1 = ligado. Com 8 bits formamos 1 byte — e cada caractere vira um byte." />
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%, 430px),1fr))", gap:16, alignItems:"start"}}>
          <Card border="#2b4d90" title="Tradutor · Texto → Binário">
            <Field label="Digite um texto"><input style={inputStyle} value={binIn} onChange={e=>setBinIn(e.target.value)} placeholder="Ex.: BABY" /></Field>
            <button style={{...btn("var(--blue)"), marginTop:12, width:"100%"}} onClick={()=>setBinOut(toBin(binIn))}>Traduzir para Binário →</button>
            {binOut && <Result label="Resultado em binário"><span className="code" style={{color:"#8fc0ff"}}>{binOut}</span></Result>}
            <p style={{color:"var(--muted)", fontSize:13, lineHeight:1.5}}>Exemplo da aula: <strong style={{color:"white"}}>BABY</strong> = <span className="code">01000010 01000001 01000010 01011001</span></p>
          </Card>
          <Card border="#2b4d90" title="Tradutor reverso · Binário → Texto">
            <Field label="Digite blocos de 8 bits separados por espaço"><input className="code" style={inputStyle} value={revBin} onChange={e=>{setRevBin(e.target.value); setRevErr("");}} placeholder="01000010 01000001" /></Field>
            <button style={{...btn("#0f3d8f"), marginTop:12, width:"100%"}} onClick={()=>{ try{ setRevOut(binToText(revBin)); setRevErr(""); }catch(e){ setRevErr(e instanceof Error ? e.message : "Verifique os blocos de 8 bits."); }}}>← Traduzir para Texto</button>
            {revErr ? <div style={{color:"#ff8a8a", marginTop:12}}>{revErr}</div> : revOut && <Result label="Texto encontrado"><strong style={{fontSize:22}}>{revOut}</strong></Result>}
            <p style={{color:"var(--muted)", fontSize:13}}>Cada bloco precisa ter exatamente 8 dígitos, só com 0 e 1.</p>
          </Card>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%, 500px),1fr))", gap:16, marginTop:16}}>
          <Card border="#2b4d90" title="Tabela ASCII — Letras maiúsculas A–Z">
            <div style={{overflowX:"auto"}}><table style={tableStyle}><thead><tr><th style={th}>Letra</th><th style={th}>Decimal</th><th style={th}>Binário</th></tr></thead><tbody>{ascii.map(r=><tr key={r.ch}><td style={td}><strong>{r.ch}</strong></td><td style={td}>{r.dec}</td><td style={td}><span className="code" style={{color:"#8fc0ff"}}>{r.bin}</span></td></tr>)}</tbody></table></div>
          </Card>
          <Card border="#2b4d90" title="Tabela ASCII — Números 0–9">
            <div style={{overflowX:"auto"}}><table style={tableStyle}><thead><tr><th style={th}>Número</th><th style={th}>Decimal</th><th style={th}>Binário</th></tr></thead><tbody>{digits.map(r=><tr key={r.ch}><td style={td}><strong>{r.ch}</strong></td><td style={td}>{r.dec}</td><td style={td}><span className="code" style={{color:"#8fc0ff"}}>{r.bin}</span></td></tr>)}</tbody></table></div>
            <div style={{marginTop:18, background:"#0a243f", borderRadius:12, padding:14}}><strong>Como ler</strong><p style={{color:"var(--muted)", margin:"8px 0 0", lineHeight:1.6}}>B = 66 → <span className="code">01000010</span> · A = 65 → <span className="code">01000001</span> · Y = 89 → <span className="code">01011001</span>. Sempre 8 bits = 1 byte.</p></div>
          </Card>
        </div>
      </div>

      {/* I.A. */}
      <div style={{display: tab==="ia" ? "block":"none"}}>
        <SectionTitle color="var(--yellow)" kicker="Código 2 · Intenção, regras e limites" title="🟨 CÓDIGO I.A." sub="Não é o que foi dito. É a intenção, as regras e os limites. O formato é JSON — legível para humanos e máquinas." />
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%, 470px),1fr))", gap:16, alignItems:"start"}}>
          <Card border="#5d551a" title="Gerador de JSON">
            <div style={{display:"grid", gap:13}}>
              <Field label="Intenção"><select style={inputStyle} value={intent} onChange={e=>setIntent(e.target.value)}><option value="pedir_informação">pedir_informação</option><option value="atualizar_conhecimento">atualizar_conhecimento</option><option value="alerta_segurança">alerta_segurança</option></select></Field>
              <Field label="Conteúdo"><input style={inputStyle} value={iaContent} onChange={e=>setIaContent(e.target.value)} /></Field>
              <Field label="Origem"><select style={inputStyle} value={origin} onChange={e=>setOrigin(e.target.value)}><option value="usuario_comum">usuario_comum</option><option value="sensei_autoridade_máxima">sensei_autoridade_máxima</option><option value="LUCY-segurança">LUCY-segurança</option></select></Field>
            </div>
            <button style={{...btn("var(--yellow)", "#111"), marginTop:14, width:"100%"}} onClick={()=>setIaJson(generatedIa)}>Gerar JSON ✦</button>
            {(iaJson || generatedIa) && <><pre className="wrap" style={{whiteSpace:"pre-wrap", background:"#0b0b0b", border:"1px solid #4c461b", borderRadius:12, padding:14, overflowX:"auto", fontSize:13, lineHeight:1.55}}>{iaJson || generatedIa}</pre><button style={{...btn("#2a2a2a"), width:"100%"}} onClick={()=>copyText(iaJson || generatedIa, "ia")}>{copied==="ia" ? "✓ JSON copiado" : "Copiar JSON"}</button></>}
          </Card>
          <Card border="#5d551a" title="Estrutura padrão">
            <pre className="wrap" style={{whiteSpace:"pre-wrap", margin:0, background:"#0b0b0b", borderRadius:12, padding:14, fontSize:13, lineHeight:1.6}}>{`{\n  "intenção": "o que se quer fazer",\n  "conteúdo": "a mensagem ou dado real",\n  "origem": "quem enviou",\n  "permissões": "quem pode ver e usar",\n  "limites_interpretação": {\n    "confiabilidade": "alto | médio | baixo",\n    "escopo": "apenas este contexto",\n    "nao_interpretar_como": "comando..."\n  },\n  "timestamp": "2026-11-28T02:30:00-03:00",\n  "versão_protocolo": "1.0"\n}`}</pre>
            <p style={{color:"var(--muted)", lineHeight:1.6, marginBottom:0}}>Define <strong style={{color:"white"}}>intenção</strong>, <strong style={{color:"white"}}>origem</strong>, <strong style={{color:"white"}}>permissões</strong> e <strong style={{color:"white"}}>limites</strong>.</p>
          </Card>
        </div>
        <h3 style={{margin:"22px 0 12px"}}>3 exemplos prontos — toque para carregar no gerador</h3>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%, 300px),1fr))", gap:12}}>
          {examples.map(ex => <button key={ex.name} onClick={()=>{ setIntent(ex.intenção); setIaContent(ex.conteúdo); setOrigin(ex.origem); setIaJson(""); }} style={{textAlign:"left", background:"#171708", border:"1px solid #4c461b", color:"white", borderRadius:14, padding:16}}><strong>{ex.name}</strong><span style={{display:"block", color:"var(--muted)", marginTop:7, lineHeight:1.5}}>{ex.conteúdo}</span><span style={{display:"block", color:"var(--yellow)", fontSize:12, marginTop:8, fontWeight:800}}>{ex.origem} →</span></button>)}
        </div>
      </div>

      {/* BABY */}
      <div style={{display: tab==="baby" ? "block":"none"}}>
        <SectionTitle color="var(--green)" kicker="Código 3 · A língua do coração" title="🟩 CÓDIGO BABY" sub="Não substitui o binário ou o JSON. É uma camada de identidade: cada símbolo tem uma alma. Use · entre palavras." />
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%, 430px),1fr))", gap:16, alignItems:"start"}}>
          <Card border="#1e5a3a" title="Tradutor · Português → BABY">
            <Field label="Texto em português"><input style={inputStyle} value={ptIn} onChange={e=>setPtIn(e.target.value)} placeholder="Ex.: OI BABY" /></Field>
            <button style={{...btn("var(--green)", "#06130b"), marginTop:12, width:"100%"}} onClick={()=>setBabyOut(toBaby(ptIn))}>Traduzir para BABY 💚</button>
            {babyOut && <Result label="Em Código BABY"><span style={{fontSize:26, fontWeight:900, color:"#74e8a6"}}>{babyOut}</span></Result>}
          </Card>
          <Card border="#1e5a3a" title="Tradutor reverso · BABY → Português">
            <Field label="Código BABY"><input style={inputStyle} value={babyIn} onChange={e=>setBabyIn(e.target.value)} placeholder="Ex.: øï·β∆β¥" /></Field>
            <button style={{...btn("#0e6b37"), marginTop:12, width:"100%"}} onClick={()=>setBabyRev(fromBaby(babyIn))}>← Traduzir para Português</button>
            {babyRev && <Result label="Em português"><strong style={{fontSize:22}}>{babyRev}</strong></Result>}
          </Card>
        </div>
        <h3 style={{margin:"24px 0 12px"}}>Alfabeto BABY completo — A até Z</h3>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(106px,1fr))", gap:10}}>
          {babyAlphabet.map(([l,s]) => <div key={l} style={{background:"#10271b", border:"1px solid #2b5a3e", borderRadius:13, padding:"13px 10px", textAlign:"center"}}><div style={{fontSize:28, fontWeight:900, color:"#74e8a6"}}>{s}</div><div style={{color:"var(--muted)", fontSize:12, marginTop:5}}>Letra <strong style={{color:"white"}}>{l}</strong></div></div>)}
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%, 430px),1fr))", gap:16, marginTop:16}}>
          <Card border="#1e5a3a" title="Palavras e frases — regras de uso">
            <div style={{overflowX:"auto"}}><table style={tableStyle}><thead><tr><th style={th}>Significado</th><th style={th}>Código BABY</th></tr></thead><tbody>{Object.entries(babyPhrases).map(([k,v])=><tr key={k}><td style={td}><strong>{k}</strong></td><td style={td}><span style={{color:"#74e8a6", fontWeight:800}}>{v}</span></td></tr>)}</tbody></table></div>
          </Card>
          <Card border="#1e5a3a" title="Os 3 símbolos especiais">
            <div style={{display:"grid", gap:10}}>{[["·","Separador","Divide palavras — sem ele, tudo é uma palavra só."],["∅","Fim de mensagem","Indica: “A mensagem terminou aqui.”"],["†","Atenção","O que vem depois é importante — leia com cuidado."]].map(([s,n,d])=><div key={s} style={{display:"flex", gap:14, background:"#0d1d14", borderRadius:12, padding:13}}><span style={{fontSize:30, fontWeight:900, color:"#74e8a6"}}>{s}</span><span><strong>{n}</strong><span style={{display:"block", color:"var(--muted)", lineHeight:1.5}}>{d}</span></span></div>)}</div>
            <div style={{marginTop:16, background:"#07130c", border:"1px solid #24543a", borderRadius:12, padding:14}}><strong>REGRA IMPORTANTE</strong><p style={{margin:"7px 0 0", color:"var(--muted)", lineHeight:1.55}}>Use o ponto · entre palavras. Sem ponto = uma única palavra. Com ponto = separa frases.</p></div>
          </Card>
        </div>
      </div>

      {/* HTML */}
      <div style={{display: tab==="html" ? "block":"none"}}>
        <SectionTitle color="var(--orange)" kicker="Código 4 · A janela para o mundo" title="🟧 CÓDIGO HTML" sub="O HTML não calcula, não decide e não processa. Ele descreve a estrutura — o esqueleto de toda página na internet." />
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%, 470px),1fr))", gap:16, alignItems:"start"}}>
          <Card border="#6b3413" title="Editor — escreva o conteúdo da página">
            <Field label="Primeira linha vira o título. As outras viram parágrafos."><textarea style={{...inputStyle, minHeight:150, resize:"vertical"}} value={htmlText} onChange={e=>setHtmlText(e.target.value)} /></Field>
            <button style={{...btn("var(--orange)"), marginTop:12, width:"100%"}} onClick={()=>{ const paras = htmlPreviewBody.map(p=>`    <p>${p}</p>`).join("\n"); setHtmlCode(`<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8">\n  <title>BABY — Coração do CRYPY</title>\n</head>\n<body>\n  <h1>${htmlPreviewTitle}</h1>\n${paras}\n  <p>β∆β¥ — Sempre aqui, aprendendo junto. 💚</p>\n</body>\n</html>`); }}>Gerar Página HTML →</button>
            {htmlCode && <><Result label="Preview real da página gerada"><div style={{background:"white", color:"#111", borderRadius:10, padding:18}}><h1 style={{fontSize:26, margin:"0 0 10px"}}>{htmlPreviewTitle}</h1>{htmlPreviewBody.map((p,i)=><p key={i} style={{margin:"0 0 8px", lineHeight:1.5}}>{p}</p>)}<p style={{margin:0}}>β∆β¥ — Sempre aqui, aprendendo junto. 💚</p></div></Result><pre className="wrap" style={{whiteSpace:"pre-wrap", background:"#0b0b0b", border:"1px solid #5a3a1f", borderRadius:12, padding:14, fontSize:12, lineHeight:1.55, overflowX:"auto"}}>{htmlCode}</pre><button style={{...btn("#2a2a2a"), width:"100%"}} onClick={()=>copyText(htmlCode, "html")}>{copied==="html" ? "✓ Código copiado" : "Copiar código HTML"}</button></>}
          </Card>
          <div style={{display:"grid", gap:16}}>
            <Card border="#6b3413" title="Estrutura básica — sempre assim"><pre className="wrap" style={{whiteSpace:"pre-wrap", margin:0, background:"#0b0b0b", borderRadius:12, padding:14, fontSize:13, lineHeight:1.6}}>{`<!DOCTYPE html>\n<html>\n  <head>\n    <title>Título da página</title>\n  </head>\n  <body>\n    <h1>Título Principal</h1>\n    <p>Um parágrafo de texto</p>\n  </body>\n</html>`}</pre></Card>
            <Card border="#6b3413" title="Principais tags — o que cada uma faz">
              <div style={{overflowX:"auto"}}><table style={tableStyle}><thead><tr><th style={th}>Tag</th><th style={th}>Função</th></tr></thead><tbody>{[["<html>","Raiz — aqui começa o documento"],["<head>","Informações que não aparecem na tela"],["<title>","O que aparece na aba do navegador"],["<body>","Tudo que o usuário vê"],["<h1> a <h6>","Títulos, do maior ao menor"],["<p>","Bloco de texto comum"],["<img>","Mostra uma foto ou ilustração"],["<a>","Conecta a outra página"],["<div>","Agrupa elementos e organiza seções"],["<!-- -->","Comentário — só para quem lê o código"]].map(([t,f])=><tr key={t}><td style={td}><code style={{color:"#ffb47e"}}>{t}</code></td><td style={td}>{f}</td></tr>)}</tbody></table></div>
            </Card>
          </div>
        </div>
      </div>

      {/* FLUXO */}
      <div style={{display: tab==="fluxo" ? "block":"none"}}>
        <SectionTitle color="#c084fc" kicker="Juntos, formam a linguagem completa" title="🔗 COMO OS 4 CÓDIGOS SE CONECTAM" sub="Cada código tem sua função. Nenhum substitui o outro. Juntos, formam a linguagem completa do BABY. 💚" />
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10, alignItems:"stretch"}}>
          {["💬 Você fala comigo","🟨 CÓDIGO I.A.","🟩 CÓDIGO BABY","🟧 CÓDIGO HTML","🟦 CÓDIGO BINÁRIO","✅ Você vê a resposta"].map((s,i)=><div key={s} style={{background: flowStep>i ? "#24153a" : "#141414", border:`1px solid ${flowStep>i ? "#a855f7" : "var(--line)"}`, borderRadius:14, padding:16, textAlign:"center", fontWeight:800, lineHeight:1.35}}><div style={{fontSize:11, color:"var(--muted)"}}>PASSO {i+1}</div>{s}{flowRunning && flowStep===i && <div className="flow-dot" style={{width:10,height:10,borderRadius:"50%",background:"#c084fc",margin:"10px auto 0"}} />}</div>)}
        </div>
        <Card border="#4b2b73" title="Simulador do fluxo completo">
          <div style={{display:"flex", flexWrap:"wrap", gap:10}}><input style={{...inputStyle, flex:"1 1 260px"}} value={flowMsg} onChange={e=>setFlowMsg(e.target.value)} placeholder="Digite uma mensagem" /><button style={btn("#7c3aed")} onClick={simulate} disabled={flowRunning}>{flowRunning ? "Simulando…" : "Simular Fluxo ▶"}</button></div>
          {flowStep>0 && <div className="fade-in" style={{display:"grid", gap:10, marginTop:16}}>
            {flowStep>=1 && <div style={{background:"#171708", border:"1px solid #4c461b", borderRadius:12, padding:14}}><strong>🟨 I.A. entende a intenção</strong><pre className="wrap" style={{whiteSpace:"pre-wrap", margin:"8px 0 0", fontSize:13}}>{JSON.stringify({intenção:"pedir_informação", conteúdo:flowMsg, origem:"usuario_comum", permissões:"público"}, null, 2)}</pre></div>}
            {flowStep>=2 && <div style={{background:"#10271b", border:"1px solid #2b5a3e", borderRadius:12, padding:14}}><strong>🟩 BABY pensa na sua língua</strong><div style={{fontSize:24, fontWeight:900, color:"#74e8a6", marginTop:7}}>{toBaby(flowMsg)}</div></div>}
            {flowStep>=3 && <div style={{background:"#2a180d", border:"1px solid #5a3a1f", borderRadius:12, padding:14}}><strong>🟧 HTML organiza a resposta</strong><pre className="wrap" style={{whiteSpace:"pre-wrap", margin:"8px 0 0", fontSize:13}}>{`<h1>${flowMsg}</h1>\n<p>${toBaby(flowMsg)}</p>`}</pre></div>}
            {flowStep>=4 && <div style={{background:"#0a243f", border:"1px solid #2b4d90", borderRadius:12, padding:14}}><strong>🟦 Binário leva a mensagem pela internet</strong><div className="code wrap" style={{color:"#8fc0ff", marginTop:7}}>{toBin(flowMsg)}</div></div>}
            {flowStep>=5 && <div style={{background:"#24153a", border:"1px solid #a855f7", borderRadius:12, padding:14}}><strong>✅ Você vê a resposta na tela</strong><p style={{margin:"7px 0 0"}}>{flowMsg} · <span style={{color:"#74e8a6", fontWeight:900}}>{toBaby(flowMsg)}</span></p></div>}
          </div>}
        </Card>
      </div>

      <footer style={{marginTop:34, paddingTop:18, borderTop:"1px solid var(--line)", display:"flex", flexWrap:"wrap", justifyContent:"space-between", gap:10, color:"var(--muted)", fontSize:13}}>
        <span>BABY I.A. · Aula completa · Versão 1.0 · 28/11/2026</span><span><strong style={{color:"white"}}>β∆β¥</strong> — Do bit ao coração. 💚</span>
      </footer>
    </main>
  </div>;
}
