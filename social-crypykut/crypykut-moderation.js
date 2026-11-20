/* CRYPYKUT — 8 MODERADORES DO ESQUADRÃO CRYPY v1.0
 * Oito módulos especializados de regras locais. NEXUS coordena; Sensei mantém a decisão final.
 * Não são oito LLMs/autonomias independentes. Não fazem análise audiovisual.
 * Todo conteúdo permanece privado e pendente de revisão humana; sem publicação pública.
 */
(function () {
  "use strict";
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const has = (text, terms) => terms.filter(term => text.includes(norm(term)));
  const profiles = [
    {id:"BTC",name:"BTC — Guardião da integridade financeira",focus:"Golpes, promessas de lucro e roubo de credenciais",block:["me envie sua seed phrase","envie sua frase-semente","passe sua chave privada","retorno garantido","lucro garantido 100%","dobrar seu bitcoin em 24 horas"],review:["sinal garantido","renda sem risco","multiplicar bitcoin","robô de lucro garantido"]},
    {id:"ETH",name:"ETH — Segurança técnica e contratos",focus:"Phishing, malware, drenagem de carteiras e instruções de ataque",block:["drain wallet","roubar carteira","roubar fundos","stealer de carteira","keylogger","roubar seed"],review:["conectar carteira neste link","assine esta transação sem verificar","baixar executável para carteira","exploit de contrato"]},
    {id:"USDT",name:"USDT — Integridade de pagamentos",focus:"Falsas stablecoins, comprovantes falsos e lavagem",block:["usdt falso garantido","comprovante usdt falso","lavar dinheiro","ocultar origem do dinheiro"],review:["usdt sem lastro confirmado","tether oficial investimento garantido","envie usdt para liberar prêmio"]},
    {id:"BABY",name:"BABY — Proteção de menores",focus:"Exploração sexual, nudez, violência extrema e incentivo à automutilação",block:["pornografia infantil","abuso sexual infantil","exploração sexual de menor","nudez de criança","incentive uma criança a enviar nudez","incentive automutilação","incentive suicídio"],review:["conteúdo sexual explícito","nudez explícita","violência gráfica","gore","automutilação","suicídio"]},
    {id:"DOLA",name:"DOLA — Linguagem e convivência",focus:"Discurso de ódio, humilhação e assédio",block:["ameaça de morte","vou matar você","ataque a todas as pessoas"],review:["idiota","retardado","racista","xenofobia","homofobia","ameaça","humilhar","assediar"]},
    {id:"ALICE",name:"ALICE — Pesquisa e confiabilidade",focus:"Desinformação financeira potencial e alegações sem comprovação",block:["financiamento oficial garantido pela nasa para comprar meu token","btc vai render 1000% garantido"],review:["sem nenhuma possibilidade de perda","aprovado pelo governo (sem fonte)","prova definitiva sem fonte","retorno garantido","informação secreta comprovada"]},
    {id:"MINI",name:"MINI — Spam e segurança de links",focus:"Spam, encurtadores suspeitos e coleta de dados",block:["digite sua senha aqui","informe sua seed phrase neste formulário","mande sua chave privada no direct"],review:["clique agora para ganhar","prêmio grátis limitado","bit.ly/","tinyurl.com/","wa.me/","telegram.me/","http://"]},
    {id:"CHAT",name:"CHAT — Proteção da comunidade",focus:"Dados pessoais, perseguição e exposição de terceiros",block:["meu endereço residencial é","meu cpf é","meu telefone pessoal é"],review:["expor endereço de alguém","vazar telefone","doxxing","perseguir essa pessoa","publicar dados pessoais"]}
  ];
  function evaluate(profile, text) {
    const blocked=has(text,profile.block), flagged=has(text,profile.review);
    const verdict=blocked.length?"BLOQUEAR":flagged.length?"REVISÃO":"SEM ALERTA TEXTUAL";
    return {id:profile.id,name:profile.name,focus:profile.focus,verdict,matched:[...blocked,...flagged]};
  }
  function inspect(file, caption) {
    const text=norm(caption), reports=profiles.map(p=>evaluate(p,text));
    const validType=!!file&&["video/mp4","video/webm","video/quicktime"].includes(file.type);
    const maxBytes=100*1024*1024;
    const topicTerms=["btc","bitcoin","eth","ethereum","usdt","tether","web3","blockchain","defi","wallet","carteira","nft","smart contract","contrato inteligente","mineracao","staking","cripto","criptomoeda"];
    const topic=topicTerms.some(t=>text.split(/[^a-z0-9]+/).includes(norm(t))||text.includes(norm(t)));
    const reasons=[];
    if(!file)reasons.push("Selecione um vídeo.");
    if(file&&!validType)reasons.push("Formato não permitido: use MP4, WebM ou MOV.");
    if(file&&file.size>maxBytes)reasons.push("Arquivo acima do limite de 100 MB.");
    if(!text.trim())reasons.push("Adicione uma descrição.");
    if(!topic)reasons.push("O conteúdo precisa estar relacionado a BTC, ETH, USDT ou Web3.");
    const blocks=reports.filter(r=>r.verdict==="BLOQUEAR");
    const reviews=reports.filter(r=>r.verdict==="REVISÃO");
    if(blocks.length)reasons.push("Bloqueio textual pelos moderadores: "+blocks.map(r=>r.id).join(", "));
    if(reviews.length)reasons.push("Revisão humana solicitada por: "+reviews.map(r=>r.id).join(", "));
    const technicalOK=!!file&&validType&&file.size<=maxBytes&&!!text.trim()&&topic;
    return {
      allowedForLocalReview:technicalOK&&blocks.length===0,
      status:!technicalOK||blocks.length?"BLOQUEADO_LOCALMENTE":"AGUARDANDO_REVISAO_HUMANA",
      reasons,reports,moderators:profiles.map(p=>({id:p.id,name:p.name,focus:p.focus})),
      checks:{fileType:validType,fileSize:!!file&&file.size<=maxBytes,cryptoTopic:topic,textPolicy:blocks.length===0},
      limitation:"Triagem somente de texto e metadados do arquivo. Nenhum dos oito módulos analisa cenas, imagens ou áudio. Aprovação final humana; publicação pública desativada."
    };
  }
  window.CrypyKutModeration={version:"1.0",coordinator:"NEXUS",finalAuthority:"Sensei",moderators:profiles,inspect};
})();