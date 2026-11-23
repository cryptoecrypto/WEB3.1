(function(){
"use strict";
const KEY="crypykut.orkut.v1";
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(_){return {}}};
const state=read();
const write=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(_){alert("Armazenamento local cheio ou indisponível.");return false}};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const babyReply=q=>{
 const s=q.toLowerCase();
 if(/comunidade|scrap/.test(s))return "O CRYPYKUT aproxima pessoas por perfis, amigos, grupos e recados, com privacidade e respeito.";
 if(/senha|golpe|seguran|link|phishing/.test(s))return "Dica do BABY: nunca compartilhe senha, código 2FA, frase-semente ou chave privada. Confira links e remetentes antes de clicar.";
 if(/web3|blockchain|carteira|nft/.test(s))return "WEB3 reúne carteiras, redes e contratos. Leia o que está assinando e confirme a rede correta antes de qualquer transação.";
 if(/foto|imagem|privacidade|menor/.test(s))return "Antes de publicar fotos de outras pessoas, peça consentimento. Evite dados pessoais, documentos, localização e imagens de menores.";
 if(/amizade|amigo/.test(s))return "Amizade no CRYPYKUT deve ser voluntária. Confira o perfil e não aceite pedidos suspeitos.";
 if(/oi|olá|ola|bom dia|boa noite/.test(s))return "Olá! 💜 Eu sou o BABY Moderador do CRYPYKUT. Quer conversar sobre comunidades, Web3, tecnologia ou segurança?";
 return "Entendi. Posso ajudar com a organização da comunidade, boas práticas digitais, privacidade, Web3 e segurança. Conte um pouco mais.";
};
function addRecord(type,record){state[type]=Array.isArray(state[type])?state[type]:[];state[type].unshift(record);write()}
function renderRecords(type,selector,template){
 const el=document.querySelector(selector);if(!el)return;const records=state[type]||[];if(!records.length)return;el.innerHTML=records.map(template).join("")+el.innerHTML;
}
function startChat(){
 const old=document.getElementById("ok-chat-float");if(old)return;
 const launch=document.createElement("button");launch.className="ok-chat-launch";launch.id="ok-chat-launch";launch.textContent="✉ Conversar com BABY";
 const panel=document.createElement("section");panel.className="ok-chat-float ok-chat";panel.id="ok-chat-float";panel.hidden=true;
 panel.innerHTML='<div class="ok-chat-head"><span>💬</span><b>BABY · Chat da comunidade</b><button type="button" id="ok-chat-close" style="background:transparent;color:white;border:0;font-size:18px">×</button></div><div class="ok-chat-messages" id="ok-chat-messages"><div class="ok-bubble">Oi! Este é o chat do CRYPYKUT. As conversas desta demonstração ficam neste navegador.</div></div><form class="ok-chat-form" id="ok-chat-form"><input name="message" maxlength="500" placeholder="Escreva uma mensagem..." required><button class="ok-btn pink" type="submit">Enviar</button></form>';
 document.body.append(launch,panel);
 const msgs=panel.querySelector("#ok-chat-messages");
 const chat=Array.isArray(state.chat)?state.chat:[];
 chat.forEach(m=>{const div=document.createElement("div");div.className="ok-bubble "+(m.from==="user"?"user":"");div.textContent=m.text;msgs.appendChild(div)});
 launch.addEventListener("click",()=>{panel.hidden=false;launch.hidden=true;msgs.scrollTop=msgs.scrollHeight});
 panel.querySelector("#ok-chat-close").addEventListener("click",()=>{panel.hidden=true;launch.hidden=false});
 panel.querySelector("#ok-chat-form").addEventListener("submit",e=>{
   e.preventDefault();const input=e.currentTarget.message;const text=input.value.trim();if(!text)return;
   const answer=babyReply(text);state.chat=Array.isArray(state.chat)?state.chat:[];state.chat.push({from:"user",text},{from:"baby",text:answer});write();
   for(const item of [{from:"user",text},{from:"baby",text:answer}]){const div=document.createElement("div");div.className="ok-bubble "+(item.from==="user"?"user":"");div.textContent=item.text;msgs.appendChild(div)}
   input.value="";msgs.scrollTop=msgs.scrollHeight;
 });
}
function bindSearch(){
 document.querySelectorAll("[data-ok-search]").forEach(input=>input.addEventListener("input",()=>{
  const q=input.value.toLowerCase().trim();const target=input.dataset.okSearch;
  document.querySelectorAll(target).forEach(el=>{el.hidden=!el.textContent.toLowerCase().includes(q)});
 }));
}
function bindForms(){
 document.querySelectorAll("[data-ok-form]").forEach(form=>form.addEventListener("submit",e=>{
  e.preventDefault();const kind=form.dataset.okForm;const fd=new FormData(form);const name=String(fd.get("name")||"Visitante").trim();const text=String(fd.get("text")||"").trim();if(!text)return;
  const record={name,text,createdAt:new Date().toISOString()};
  const types={scrap:"scraps",testimonial:"testimonials",community:"communities",message:"messages"};
  addRecord(types[kind],record);
  const target=form.dataset.okTarget;const container=target?document.querySelector(target):null;
  if(container){const div=document.createElement("article");div.className=kind==="scrap"?"ok-scrap":"ok-post";div.innerHTML='<span class="ok-avatar">'+esc(name.charAt(0).toUpperCase())+'</span><div><b>'+esc(name)+'</b><p>'+esc(text)+'</p><small>Agora · salvo neste navegador</small></div>';container.prepend(div)}
  form.reset();const note=form.querySelector("[data-ok-note]");if(note)note.textContent="Registrado somente neste navegador. Para compartilhar com todos, o backend ainda precisa ser conectado.";
 }));
}
function bindButtons(){
 document.querySelectorAll("[data-ok-toggle]").forEach(btn=>btn.addEventListener("click",()=>{
  const key=btn.dataset.okToggle;state.toggles=state.toggles||{};state.toggles[key]=!state.toggles[key];write();
  btn.classList.toggle("active",state.toggles[key]);btn.textContent=state.toggles[key]?(btn.dataset.onText||"✓ Adicionado"):(btn.dataset.offText||"Adicionar");
 }));
 document.querySelectorAll("[data-ok-quiz]").forEach(btn=>btn.addEventListener("click",()=>{
  const answer=btn.dataset.okQuiz;const result=document.querySelector(btn.dataset.result||"#ok-quiz-result");if(result)result.textContent=answer==="safe"?"Correto! Confirme sempre o domínio e nunca compartilhe sua frase-semente.":"Vamos revisar: links urgentes e pedidos de credenciais são sinais de alerta.";
 }));
 document.querySelectorAll("[data-ok-auth]").forEach(btn=>btn.addEventListener("click",()=>alert("Login "+btn.dataset.okAuth+" ainda não está conectado. É necessário registrar o aplicativo OAuth e configurar um backend seguro; nenhuma autenticação foi simulada.")));
}
function bindPhotos(){
 document.querySelectorAll("[data-ok-photo-input]").forEach(input=>input.addEventListener("change",()=>{
  const target=document.querySelector(input.dataset.target);if(!target)return;target.innerHTML="";
  Array.from(input.files||[]).forEach(file=>{if(!file.type.startsWith("image/"))return;const figure=document.createElement("figure");figure.className="ok-photo";const img=document.createElement("img");img.src=URL.createObjectURL(file);img.alt="Prévia local de "+file.name;figure.appendChild(img);target.appendChild(figure)});
  const note=document.querySelector("[data-ok-photo-note]");if(note)note.textContent="Prévia apenas local. Estas imagens ainda não foram enviadas para o servidor.";
 }));
}
function bindShotVideos(){
 document.querySelectorAll("[data-ok-shot-input]").forEach(input=>input.addEventListener("change",()=>{
  const file=input.files&&input.files[0];if(!file)return;if(!file.type.startsWith("video/")){alert("Escolha um arquivo de vídeo.");return}if(file.size>100*1024*1024){alert("Vídeo acima de 100 MB.");return}
  const video=document.querySelector(input.dataset.target);if(!video)return;video.src=URL.createObjectURL(file);video.controls=true;const note=document.querySelector("[data-ok-shot-note]");if(note)note.textContent="Prévia reproduzida neste navegador. Não foi publicada nem enviada à nuvem.";
 }));
}
renderRecords("scraps","[data-ok-scraps]",r=>'<article class="ok-scrap"><span class="ok-avatar">'+esc(r.name.charAt(0))+'</span><div><b>'+esc(r.name)+'</b><p>'+esc(r.text)+'</p><small>Salvo neste navegador</small></div></article>');
renderRecords("testimonials","[data-ok-testimonials]",r=>'<article class="ok-post"><b>'+esc(r.name)+'</b><p>'+esc(r.text)+'</p><small>Salvo neste navegador</small></article>');
renderRecords("communities","[data-ok-communities]",r=>'<article class="ok-list-item"><span class="ok-avatar">C</span><div class="ok-grow"><b>'+esc(r.name)+'</b><small>'+esc(r.text)+'</small></div></article>');
startChat();bindSearch();bindForms();bindButtons();bindPhotos();bindShotVideos();
})();