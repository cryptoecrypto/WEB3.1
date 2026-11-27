/* Inventário das imagens públicas do repositório. Nunca acessa áreas privadas. */
(function(){
  "use strict";
  const CONFIG={owner:"cryptoecrypto",repo:"WEB3.1",branch:"main"};
  const EXTENSIONS=/\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;
  const BLOCKED=new Set([".git","hd-oculto","hd-matriz","private","privado","secrets","secret","backups","backup","node_modules","vendor",".github"]);
  function allowed(path){
    const parts=path.toLowerCase().split("/");
    return EXTENSIONS.test(path)&&!parts.some(part=>BLOCKED.has(part)||part.startsWith(".")&&part!==".well-known");
  }
  function rawUrl(path){return "https://raw.githubusercontent.com/"+CONFIG.owner+"/"+CONFIG.repo+"/"+CONFIG.branch+"/"+path.split("/").map(encodeURIComponent).join("/");}
  async function fetchJson(url){
    const response=await fetch(url,{headers:{Accept:"application/vnd.github+json"}});
    if(!response.ok)throw new Error("GitHub respondeu "+response.status+" ao consultar "+url);
    return response.json();
  }
  async function treeInventory(){
    const endpoint="https://api.github.com/repos/"+CONFIG.owner+"/"+CONFIG.repo+"/git/trees/"+CONFIG.branch+"?recursive=1";
    const tree=await fetchJson(endpoint);
    const images=(tree.tree||[]).filter(item=>item.type==="blob"&&allowed(item.path)).map(item=>({path:item.path,url:rawUrl(item.path)}));
    return {images,truncated:Boolean(tree.truncated),source:"git-tree"};
  }
  async function recursiveInventory(){
    const root="https://api.github.com/repos/"+CONFIG.owner+"/"+CONFIG.repo+"/contents/";
    const queue=[""],images=[],seen=new Set();
    while(queue.length){
      const dir=queue.shift();
      const parts=dir.toLowerCase().split("/").filter(Boolean);
      if(parts.some(part=>BLOCKED.has(part)||part.startsWith(".")&&part!==".well-known"))continue;
      const url=root+(dir?dir.split("/").map(encodeURIComponent).join("/"):"")+"?ref="+CONFIG.branch;
      const entries=await fetchJson(url);
      if(!Array.isArray(entries))continue;
      for(const item of entries){
        if(item.type==="dir")queue.push(item.path);
        else if(item.type==="file"&&allowed(item.path)&&!seen.has(item.path)){seen.add(item.path);images.push({path:item.path,url:rawUrl(item.path)});}
      }
    }
    return {images,truncated:false,source:"recursive-contents-api"};
  }
  async function collect(){
    try{
      const result=await treeInventory();
      if(!result.truncated)return {...result,branch:CONFIG.branch};
    }catch(error){/* fallback recursivo abaixo */}
    const fallback=await recursiveInventory();
    return {...fallback,branch:CONFIG.branch};
  }
  window.CrpyImageCollector={collect};
})();