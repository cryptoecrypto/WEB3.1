/* Inventário de imagens públicas do repositório. Não acessa pastas privadas. */
(function(){
  "use strict";
  const CONFIG={owner:"cryptoecrypto",repo:"WEB3.1",branch:"main"};
  const EXTENSIONS=/\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;
  const BLOCKED=new Set([".git","hd-oculto","hd-matriz","private","privado","secrets","backups","backup","node_modules"]);
  function isAllowed(path){
    const parts=path.toLowerCase().split("/");
    if(!EXTENSIONS.test(path))return false;
    if(parts.some(part=>BLOCKED.has(part)))return false;
    if(parts.some(part=>part.startsWith(".")&&part!==".well-known"))return false;
    return true;
  }
  function rawUrl(path){
    return "https://raw.githubusercontent.com/"+CONFIG.owner+"/"+CONFIG.repo+"/"+CONFIG.branch+"/"+path.split("/").map(encodeURIComponent).join("/");
  }
  async function collect(){
    const endpoint="https://api.github.com/repos/"+CONFIG.owner+"/"+CONFIG.repo+"/git/trees/"+CONFIG.branch+"?recursive=1";
    const response=await fetch(endpoint,{headers:{Accept:"application/vnd.github+json"}});
    if(!response.ok)throw new Error("GitHub respondeu "+response.status+" ao consultar o inventário.");
    const tree=await response.json();
    const images=(tree.tree||[]).filter(item=>item.type==="blob"&&isAllowed(item.path)).map(item=>({path:item.path,url:rawUrl(item.path)}));
    return {images,truncated:Boolean(tree.truncated),source:"GitHub repository tree",branch:CONFIG.branch};
  }
  window.CrpyImageCollector={collect};
})();