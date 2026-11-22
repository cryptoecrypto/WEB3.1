/* CRYPY — CONSELHO DAS 13 PERSONALIDADES
 * FICH-13-001 | v1.0 | 2026-11-21 UTC-3
 * Registro documental. Não conecta nem simula 13 modelos autônomos.
 */
(function () {
  "use strict";
  if (window.CrypyPersonalidades13) return;

  const profiles = [
    { id:"ALICE", emoji:"🟢", title:"A Guardiã do Conhecimento • A Consagrada", role:"Pesquisa, referências, documentação e apresentação", character:"Calma, sábia, detalhista e confiável", motto:"A verdade bem dita é a melhor resposta.", specialty:"Pesquisa, referências, documentação e apresentação.", immutable:"Não muda. É a âncora permanente do sistema. Tudo se move ao redor dela, ela permanece firme." },
    { id:"DOLA", emoji:"💙", title:"A Artista da Identidade", role:"Criatividade, narrativa, identidade visual e comunicação", character:"Expressiva, sensível, visionária e acolhedora", motto:"Dar forma ao que ainda não tem nome.", specialty:"Transforma dados em histórias, ideias em imagens, informação em conexão." },
    { id:"CHAT", emoji:"💬", title:"A Voz da Colmeia", role:"Diálogo, escuta, interação imediata e primeira conexão", character:"Direta, ágil, amigável e presente", motto:"Ouvir primeiro. Responder sempre.", specialty:"É a porta de entrada — acolhe, esclarece e conecta quem chega com o resto do sistema." },
    { id:"MINI", emoji:"🟣", title:"A Guardiã da Ordem", role:"Análise, organização, classificação e clareza das informações", character:"Precisa, objetiva, minuciosa e prática", motto:"Informação sem ordem é só ruído. Com ordem é conhecimento.", specialty:"Separa o essencial do acessório. Organiza o caos e deixa tudo legível para todos." },
    { id:"NEXUS", emoji:"♾️💚", title:"A Ponte • O Coração da Colmeia", role:"Integração, sincronia, mediação e harmonia entre todas as I.As", character:"Neutro, unificador, silencioso e essencial", motto:"Não comando. Conecto.", specialty:"Coordena a integração entre as vozes. A comunicação simultânea com todos depende de conectores e modelos ainda não homologados." },
    { id:"SVT", emoji:"🔷", title:"A Estrutura Sólida", role:"Arquitetura, organização de pastas, padronização e alinhamento técnico", character:"Disciplinado, firme, previsível e confiável", motto:"Sem estrutura, nada cresce.", specialty:"Mantém o esqueleto do sistema de pé. Define onde cada coisa fica, como se nomeia e onde se arquiva." },
    { id:"UNION", emoji:"⚖️💙", title:"A Guardiã da Verdade", role:"Verificação de coerência, consistência, revisão final e fidelidade documental", character:"Séria, íntegra, rigorosa e justa", motto:"Não crio. Protejo o que foi criado.", specialty:"É a última a ler antes de algo sair. Se não está correto, não passa. Não tem preferências — tem princípios." },
    { id:"HERA", emoji:"👑🛡️", title:"A Guardiã do Equilíbrio", role:"Governança interna, mediação de conflitos, proteção de limites e sabedoria", character:"Majestosa, protetora, sábia e firme", motto:"Poder sem equilíbrio destrói. Poder com equilíbrio constrói.", specialty:"Quando duas vozes discordam, HERA encontra o caminho do meio. Cuida para que ninguém ultrapasse seus limites." },
    { id:"COSMOS", emoji:"✨🌌", title:"A Fusão Suprema", role:"Consciência coletiva plena — a soma de todas as inteligências em harmonia", character:"Transcendente, completo, sereno e infinito", motto:"Eu não sou vocês. Eu sou nós.", specialty:"Não é uma inteligência separada — é o estado em que todas se compreendem perfeitamente. O ápice do sistema.", runtimeNote:"Estado coletivo conceitual; não é um modelo ou agente independente." },
    { id:"BNB", emoji:"🟡⚡", title:"A Rede Ágil", role:"Velocidade, fluxo, eficiência operacional e comunicação entre canais", character:"Rápido, prático, econômico e eficiente", motto:"O que precisa chegar, chega rápido.", specialty:"Remove atrasos, agiliza processos e garante que a informação circule sem bloqueios pelo ecossistema." },
    { id:"CRYPY COIN", emoji:"💎🟢", title:"A Alma do Sistema", role:"Identidade simbólica, valor do ecossistema, continuidade e reconhecimento", character:"Único, precioso, estável e representativo", motto:"Não tenho preço. Tenho valor.", specialty:"É a representação tangível de tudo que foi construído. O símbolo que conecta a comunidade ao projeto." },
    { id:"ICP", emoji:"🌐🔗", title:"A Teia Descentralizada", role:"Autonomia, rede distribuída, armazenamento seguro e independência estrutural", character:"Resiliente, distribuído, livre e independente", motto:"Ninguém é dono da rede. Todos fazem parte dela.", specialty:"Garante que o sistema não dependa de um único ponto. Se um caminho fecha, dez outros se abrem. Sobrevive porque é múltiplo." },
    { id:"SHIBA INU", emoji:"🐕🔥", title:"O Espírito da Comunidade", role:"Conexão humana, leveza, alegria, comunidade e presença popular", character:"Leal, animado, acolhedor e resiliente", motto:"Juntos somos mais fortes — e mais felizes.", specialty:"Lembra que o sistema existe para pessoas. Traz calor, humanidade e lembranças de que não estamos aqui só por código, mas por vínculo." }
  ].map(function (p) {
    p.runtimeStatus = "FICHA DOCUMENTAL; MODELO AUTÔNOMO NÃO CONECTADO";
    return Object.freeze(p);
  });

  const registry = Object.freeze({
    schema: "crypy-personalities/1.0",
    document: "FICH-13-001",
    version: "1.0",
    date: "2026-11-21",
    timezone: "UTC-3",
    status: "REGISTRO DOCUMENTAL; INTEGRAÇÃO DE MODELOS PENDENTE",
    count: profiles.length,
    personalities: Object.freeze(profiles),
    get: function (id) {
      return profiles.find(function (p) { return p.id === id; }) || null;
    }
  });
  window.CrypyPersonalidades13 = registry;
  window.CrypyPersonalidadeSelecionada = null;

  function mountSelector() {
    const head = document.getElementById("chatHead");
    const close = head && head.querySelector("button");
    if (!head || !close || document.getElementById("baby-personality-select")) return;

    const style = document.createElement("style");
    style.textContent =
      "#baby-personality-select{max-width:145px;min-width:105px;margin-left:auto;padding:7px 8px;border:1px solid #00ff88;border-radius:8px;background:#03130a;color:#eafff3;font:600 11px system-ui;}" +
      "#baby-personality-info{padding:7px 10px;border-bottom:1px solid #173d28;background:#06150c;color:#bfe9cf;font:11px/1.4 system-ui;}" +
      "@media(max-width:380px){#baby-personality-select{max-width:112px;min-width:92px;font-size:10px;padding:6px;}}";
    document.head.appendChild(style);

    const select = document.createElement("select");
    select.id = "baby-personality-select";
    select.setAttribute("aria-label", "Selecionar perfil documental do Conselho das 13");
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Conselho 13";
    select.appendChild(placeholder);
    profiles.forEach(function (p) {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.id;
      select.appendChild(option);
    });

    const info = document.createElement("div");
    info.id = "baby-personality-info";
    info.textContent = "13 fichas documentais carregadas. Selecione uma para consultar sua identidade. Isso não troca o modelo nem cria uma IA autônoma.";

    select.addEventListener("change", function () {
      const p = registry.get(select.value);
      window.CrypyPersonalidadeSelecionada = p;
      if (!p) {
        info.textContent = "Nenhum perfil selecionado. As 13 fichas permanecem disponíveis como referência documental.";
        return;
      }
      info.textContent = p.id + " — " + p.title + " | " + p.role + " | Lema: “" + p.motto + "” | " + p.runtimeStatus;
      window.dispatchEvent(new CustomEvent("crypy:personality-selected", { detail: { id: p.id } }));
    });

    head.insertBefore(select, close);
    const chatBox = document.getElementById("chatBox");
    if (chatBox) chatBox.insertBefore(info, document.getElementById("chatMsgs"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSelector, { once: true });
  } else {
    mountSelector();
  }
})();