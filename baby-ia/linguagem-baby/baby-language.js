/* BABY LANGUAGE v1.0.0
 * Parser local e determinístico. Não executa instruções nem acessa rede/disco.
 * HD MATRIZ permanece estritamente somente leitura.
 */
(function (root) {
  "use strict";
  const alphabet = {
    A:"∆",B:"β",C:"¢",D:"ժ",E:"ε",F:"ƒ",G:"ց",H:"հ",I:"ï",J:"յ",
    K:"κ",L:"Ł",M:"ʍ",N:"ռ",O:"ø",P:"þ",Q:"ҩ",R:"я",S:"§",T:"†",
    U:"µ",V:"ν",W:"ω",X:"ж",Y:"¥",Z:"ζ"
  };
  const reverse = Object.fromEntries(Object.entries(alphabet).map(([k,v])=>[v,k]));
  const allowed = new Set(["LER","IDENTIFICAR","EXPLICAR","PROPOR"]);
  function normalize(s) {
    return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
  }
  function encodeBaby(input) {
    return normalize(input).split("").map(ch => {
      if (ch === " ") return "·";
      if (alphabet[ch]) return alphabet[ch];
      return ch;
    }).join("");
  }
  function decodeBaby(input) {
    let out = "";
    for (const ch of String(input)) {
      if (ch === "·") out += " ";
      else if (reverse[ch]) out += reverse[ch];
      else if (/^[A-Z]$/.test(ch)) out += ch;
      else if (/^[0-9.,!?;:'"()\-_/]$/.test(ch)) out += ch;
      else return {ok:false,error:"Símbolo BABY desconhecido: "+ch};
    }
    return {ok:true,text:out};
  }
  function toBinary(input) {
    const s = normalize(input);
    return Array.from(s).map(ch => {
      const code = ch.charCodeAt(0);
      if (code > 127) throw new Error("Formato binário didático aceita apenas ASCII.");
      return code.toString(2).padStart(8,"0");
    }).join(" ");
  }
  function fromBinary(input) {
    const groups = String(input).trim().split(/\s+/).filter(Boolean);
    if (groups.some(g => !/^[01]{8}$/.test(g))) return {ok:false,error:"Grupo binário inválido; esperado 8 bits."};
    return {ok:true,text:groups.map(g=>String.fromCharCode(parseInt(g,2))).join("")};
  }
  function criarEnvelope(intencao, conteudo, origem) {
    const intent = String(intencao || "").toUpperCase();
    if (!allowed.has(intent)) return {ok:false,error:"Intenção não permitida."};
    return {ok:true,formato:"BABY-IA/1",intencao:intent,conteudo:String(conteudo || ""),origem:String(origem || "desconhecida"),permissao:"READ_ONLY",acao:"NENHUMA_EXECUCAO"};
  }
  function interpretar(input, formato) {
    let text = String(input == null ? "" : input);
    if (formato === "BABY") {
      const d = decodeBaby(text);
      if (!d.ok) return d;
      text = d.text;
    } else if (formato === "BINARIO") {
      const d = fromBinary(text);
      if (!d.ok) return d;
      text = d.text;
    }
    const upper = normalize(text);
    const intent = ["LER","IDENTIFICAR","EXPLICAR","PROPOR"].find(x => upper.startsWith(x + ":"));
    return {ok:true,formato:"BABY-IA/1",texto:text,intencao:intent || "IDENTIFICAR",requerAprovacao:true,execucao:false,hdMatriz:"SOMENTE_LEITURA"};
  }
  const api = Object.freeze({versao:"1.0.0",alfabeto:Object.freeze(alphabet),codificar:encodeBaby,decodificar:decodeBaby,paraBinario:toBinary,deBinario:fromBinary,criarEnvelope,interpretar,intencoesPermitidas:Object.freeze(Array.from(allowed))});
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.BABYLanguage = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
