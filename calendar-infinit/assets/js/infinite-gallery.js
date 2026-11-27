/* Galeria dupla, contínua e com recorte uniforme. */
(function(){
  "use strict";
  const panel=document.querySelector(".gallery-panel");
  const trackA=document.getElementById("gallery-track-a");
  const trackB=document.getElementById("gallery-track-b");
  const count=document.getElementById("image-count");
  const status=document.getElementById("gallery-status");
  const message=document.getElementById("gallery-message");
  const pause=document.getElementById("pause-gallery");
  const speed=document.getElementById("gallery-speed");
  if(!panel||!trackA||!trackB||!window.CrpyImageCollector)return;
  let paused=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tile(item,index){
    const figure=document.createElement("figure");figure.className="photo-tile";
    const img=document.createElement("img");img.loading="lazy";img.decoding="async";img.src=item.url;img.alt="Imagem pública da Colmeia: "+item.path;img.onerror=()=>figure.remove();
    const caption=document.createElement("figcaption");caption.textContent=item.path.split("/").pop();
    figure.append(img,caption);return figure;
  }
  function fill(track,items,reverse){
    track.replaceChildren();
    const ordered=reverse?items.slice().reverse():items;
    const fragment=document.createDocumentFragment();
    ordered.forEach((item,index)=>fragment.appendChild(tile(item,index)));
    track.appendChild(fragment);
    const copy=track.cloneNode(true);copy.removeAttribute("id");copy.setAttribute("aria-hidden","true");
    Array.from(copy.querySelectorAll("img")).forEach(img=>{img.loading="lazy";img.alt="";});
    track.appendChild(copy);
  }
  function applySpeed(){const seconds=Number(speed.value)||58;trackA.style.setProperty("--duration",seconds+"s");trackB.style.setProperty("--duration",Math.round(seconds*1.24)+"s");}
  function setPaused(value){paused=value;panel.classList.toggle("paused",paused);pause.setAttribute("aria-pressed",String(paused));pause.textContent=paused?"▶ RETOMAR":"Ⅱ PAUSAR";}
  pause.addEventListener("click",()=>setPaused(!paused));
  speed.addEventListener("change",applySpeed);
  setPaused(paused);applySpeed();
  window.CrpyImageCollector.collect().then(result=>{
    const images=result.images;
    count.textContent=images.length+" arquivos de imagem pública encontrados";
    status.textContent=result.truncated?"INVENTÁRIO PARCIAL":"INVENTÁRIO CARREGADO";
    if(!images.length){message.textContent="Nenhum arquivo de imagem público foi localizado no inventário.";return;}
    fill(trackA,images,false);fill(trackB,images,true);
    message.textContent=(result.truncated?"A API informou que o inventário foi truncado; a cobertura pode estar incompleta. ":"")+ "Imagens do repositório público. Arquivos privados, HDs protegidos e backups são excluídos. A miniatura usa object-fit: cover; os originais não são alterados.";
  }).catch(error=>{
    status.textContent="INVENTÁRIO INDISPONÍVEL";count.textContent="Não foi possível contar as imagens";
    message.textContent=error.message+" Abra a página novamente mais tarde; nenhuma imagem local foi modificada.";
  });
})();