/* CRYPYKUT / MODERACAO LOCAL v0.1
 * Regras preventivas executadas no navegador. NAO substitui analise audiovisual no servidor.
 * Publicacao remota permanece desativada ate existir backend autenticado + scanner de midia.
 */
(function () {
  "use strict";
  const prohibited = [
    "pornografia","sexo explicito","nudez","nudes","onlyfans","estupro",
    "gore","decapitacao","suicidio","automutilacao","drogas","cocaina",
    "metanfetamina","pedofilia","exploit sexual"
  ];
  const cryptoTerms = [
    "btc","bitcoin","eth","ethereum","usdt","tether","web3","blockchain",
    "defi","wallet","carteira","nft","smart contract","contrato inteligente",
    "mineração","mineracao","staking","cripto","criptomoeda"
  ];
  function normalize(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function inspect(file, caption) {
    const text = normalize(caption);
    const hits = prohibited.filter(term => text.includes(normalize(term)));
    const topic = cryptoTerms.some(term => text.split(/[^a-z0-9]+/).includes(normalize(term)) || text.includes(normalize(term)));
    const validType = !!file && ["video/mp4","video/webm","video/quicktime"].includes(file.type);
    const maxBytes = 100 * 1024 * 1024;
    const reasons = [];
    if (!file) reasons.push("Selecione um vídeo.");
    if (file && !validType) reasons.push("Formato não permitido: use MP4, WebM ou MOV.");
    if (file && file.size > maxBytes) reasons.push("Arquivo acima do limite de 100 MB.");
    if (!text.trim()) reasons.push("Adicione uma descrição para contextualizar o conteúdo.");
    if (!topic) reasons.push("O conteúdo precisa estar relacionado a BTC, ETH, USDT ou Web3.");
    if (hits.length) reasons.push("Texto bloqueado por possível conteúdo impróprio: " + hits.join(", "));
    return {
      allowedForLocalReview: reasons.length === 0,
      status: reasons.length ? "BLOQUEADO_LOCALMENTE" : "AGUARDANDO_REVISAO_HUMANA",
      reasons,
      checks: { fileType: validType, fileSize: !!file && file.size <= maxBytes, cryptoTopic: topic, textPolicy: hits.length === 0 },
      limitation: "O navegador não analisa imagens, áudio nem cenas do vídeo. Nenhum vídeo é publicado publicamente por esta página."
    };
  }
  window.CrypyKutModeration = { version: "0.1", inspect };
})();