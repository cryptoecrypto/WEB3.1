/* Coleção completa, ordem aleatória, loop contínuo e carrossel 3D. */
(function(){
  "use strict";
  const panel=document.querySelector(".gallery-panel");
  const trackA=document.getElementById("gallery-track-a"),trackB=document.getElementById("gallery-track-b");
  const count=document.getElementById("image-count"),status=document.getElementById("gallery-status"),message=document.getElementById("gallery-message");
  const pause=document.getElementById("pause-gallery"),speed=document.getElementById("gallery-speed"),filter=document.getElementById("gallery-filter");
  const orbit=document.getElementById("image-orbit"),orbitCount=document.getElementById("orbit-count");
  const tiltButton=document.getElementById("tilt-toggle"),calendar=document.getElementById("calendar-card");
  if(!panel||!trackA||!trackB||!window.CrpyImageCollector)return;
  let allImages=[],paused=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,tilt=true;
  const sampleLimit=24;
  function shuffle(source){
    const a=source.slice();
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function category(path){
    const p=path.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(/nft|marketplace|token|collection/.test(p))return "NFTs";
    if(/museu|museum|gallery|galeria/.test(p))return "MUSEU";
    if(/esquad|alice|baby|lucy|nexus|dola|mini|chat|btc|eth|usdt/.test(p))return "ESQUADRÃO";
    if(/cosmos|dragao|dragon|space|universo/.test(p))return "COSMOS";
    if(/colmeia|hd|memory|memoria|painel/.test(p))return "COLMEIA";
    return "CRYPY";
  }
  function currentImages(){
    const selected=filter.value;
    return shuffle(selected==="TODOS"?allImages:allImages.filter(item=>category(item.path)===selected));
  }
  function makeTile(item){
    const figure=document.createElement("figure");figure.className="photo-tile";
    const img=document.createElement("img");img.loading="lazy";img.decoding="async";img.src=item.url;img.alt="Imagem pública da Colmeia: "+item.path;
    img.addEventListener("error",()=>{figure.classList.add("image-unavailable");img.alt="Imagem indisponível";},{once:true});
    const caption=document.createElement("figcaption");caption.textContent=item.path.split("/").pop();
    figure.append(img,caption);return figure;
  }
  function fillTrack(track,items,reverse){
    track.replaceChildren();
    const ordered=reverse?shuffle(items).reverse():items;
    const fragment=document.createDocumentFragment();
    ordered.forEach(item=>fragment.appendChild(makeTile(item)));
    track.appendChild(fragment);
    const copy=track.cloneNode(true);copy.removeAttribute("id");copy.className="gallery-track gallery-copy";copy.setAttribute("aria-hidden","true");
    copy.querySelectorAll("img").forEach(img=>{img.alt="";});
    track.appendChild(copy);
  }
  function makeOrbit(items){
    orbit.replaceChildren();
    const chosen=shuffle(items).slice(0,Math.min(sampleLimit,items.length));
    const radius=Math.max(190,Math.min(330,chosen.length*12));
    chosen.forEach((item,index)=>{
      const card=document.createElement("figure");card.className="orbit-card";
      const img=document.createElement("img");img.src=item.url;img.alt="";img.loading="eager";img.decoding="async";
      img.addEventListener("error",()=>card.classList.add("image-unavailable"),{once:true});
      card.appendChild(img);card.style.transform="rotateY("+(index*360/chosen.length)+"deg) translateZ("+radius+"px)";
      orbit.appendChild(card);
    });
    orbitCount.textContent=chosen.length+" IMAGENS ALEATÓRIAS";
  }
  function applySpeed(){
    const seconds=Number(speed.value)||58;
    trackA.style.setProperty("--duration",seconds+"s");trackB.style.setProperty("--duration",Math.round(seconds*1.24)+"s");
    orbit.style.animationDuration=Math.max(20,Math.round(seconds*.72))+"s";
  }
  function setPaused(value){
    paused=value;panel.classList.toggle("paused",paused);orbit.classList.toggle("paused",paused);
    pause.setAttribute("aria-pressed",String(paused));pause.textContent=paused?"▶ RETOMAR TUDO":"Ⅱ PAUSAR TUDO";
    orbit.style.animationPlayState=paused?"paused":"running";
  }
  function render(){
    const items=currentImages();
    count.textContent=items.length+" de "+allImages.length+" imagens na ordem aleatória";
    if(!items.length){
      trackA.replaceChildren();trackB.replaceChildren();orbit.replaceChildren();
      orbitCount.textContent="SEM IMAGENS NESTE FILTRO";
      message.textContent="Nenhuma imagem corresponde a este filtro. Escolha TODOS para ver a coleção completa.";
      return;
    }
    fillTrack(trackA,items,false);fillTrack(trackB,items,true);makeOrbit(items);applySpeed();setPaused(paused);
    message.textContent="Todas as imagens públicas elegíveis deste inventário estão nas duas faixas; a ordem é embaralhada a cada carregamento e mudança de filtro. A galeria repete a sequência continuamente. Pastas privadas, HDs protegidos, backups e segredos são excluídos.";
  }
  pause.addEventListener("click",()=>setPaused(!paused));
  speed.addEventListener("change",applySpeed);
  filter.addEventListener("change",render);
  tiltButton.addEventListener("click",()=>{
    tilt=!tilt;tiltButton.setAttribute("aria-pressed",String(tilt));tiltButton.textContent="TILT 3D: "+(tilt?"LIGADO":"DESLIGADO");
    if(!tilt)calendar.style.transform="";
  });
  calendar.addEventListener("pointermove",event=>{
    if(!tilt||event.pointerType==="touch")return;
    const r=calendar.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;
    calendar.style.transform="perspective(1000px) rotateY("+(x*5)+"deg) rotateX("+(-y*4)+"deg) translateZ(5px)";
  });
  calendar.addEventListener("pointerleave",()=>{calendar.style.transform="";});
  setPaused(paused);applySpeed();
  window.CrpyImageCollector.collect().then(result=>{
    allImages=result.images||[];
    count.textContent=allImages.length+" imagens públicas inventariadas";
    status.textContent=result.truncated?"INVENTÁRIO PARCIAL":result.fallback?"INVENTÁRIO RECURSIVO":"INVENTÁRIO COMPLETO";
    if(!allImages.length){message.textContent="Nenhum arquivo de imagem público elegível foi localizado.";return;}
    render();
    if(result.truncated)message.textContent="ATENÇÃO: a API informou inventário truncado; a lista pode não conter todas as imagens. "+message.textContent;
    else if(result.fallback)message.textContent="Inventário recuperado por consulta recursiva de pastas; diretórios com mais de 1.000 itens podem exigir verificação adicional. "+message.textContent;
    else message.textContent="Inventário completo pela árvore Git pública (sem sinalização de truncamento). "+message.textContent;
  }).catch(error=>{
    status.textContent="INVENTÁRIO INDISPONÍVEL";count.textContent="Não foi possível contar as imagens";
    message.textContent=error.message+" Nenhuma imagem ou arquivo original foi alterado.";
  });
})();