/* BABY LANGUAGE v1.0.0 — parser determinístico, sem rede/disco/execução. */
(function(root){"use strict";
const alphabet={A:"∆",B:"β",C:"¢",D:"ժ",E:"ε",F:"ƒ",G:"ց",H:"հ",I:"ï",J:"յ",K:"κ",L:"Ł",M:"ʍ",N:"ռ",O:"ø",P:"þ",Q:"ҩ",R:"я",S:"§",T:"†",U:"µ",V:"ν",W:"ω",X:"ж",Y:"¥",Z:"ζ"};
const reverse=Object.fromEntries(Object.entries(alphabet).map(([k,v])=>[v,k]));
const allowed=["LER","IDENTIFICAR","EXPLICAR","PROPOR"];
function norm(s){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();}
function codificar(s){return norm(s).split("").map(c=>c===" "?"·":(alphabet[c]||c)).join("");}
function decodificar(s){let out="";for(const c of String(s)){if(c==="·")out+=" ";else if(reverse[c])out+=reverse[c];else if(/^[A-Z0-9.,!?;:'"()\-_/]$/.test(c))out+=c;else return {ok:false,error:"Símbolo desconhecido: "+c};}return {ok:true,text:out};}
function paraBinario(s){return Array.from(norm(s)).map(c=>{const n=c.charCodeAt(0);if(n>127)throw Error("ASCII necessário");return n.toString(2).padStart(8,"0");}).join(" ");}
function deBinario(s){const a=String(s).trim().split(/\s+/).filter(Boolean);if(a.some(x=>!/^[01]{8}$/.test(x)))return {ok:false,error:"Esperado grupos de 8 bits"};return {ok:true,text:a.map(x=>String.fromCharCode(parseInt(x,2))).join("")};}
function criarEnvelope(intencao,conteudo,origem){const i=String(intencao||"").toUpperCase();if(!allowed.includes(i))return {ok:false,error:"Intenção não permitida"};return {ok:true,formato:"BABY-IA/1",intencao:i,conteudo:String(conteudo||""),origem:String(origem||"desconhecida"),permissao:"READ_ONLY",execucao:false};}
function interpretar(input,formato){let texto=String(input??"");if(formato==="BABY"){const r=decodificar(texto);if(!r.ok)return r;texto=r.text;}else if(formato==="BINARIO"){const r=deBinario(texto);if(!r.ok)return r;texto=r.text;}const u=norm(texto);const intencao=allowed.find(x=>u.startsWith(x+":"))||"IDENTIFICAR";return {ok:true,formato:"BABY-IA/1",texto,intencao,requerAprovacao:true,execucao:false,hdMatriz:"SOMENTE_LEITURA"};}
const api=Object.freeze({versao:"1.0.0",alfabeto:Object.freeze(alphabet),codificar,decodificar,paraBinario,deBinario,criarEnvelope,interpretar});
if(typeof module!=="undefined"&&module.exports)module.exports=api;root.BABYLanguage=api;
})(typeof globalThis!=="undefined"?globalThis:this);
