/* BABY COMPUTE ENGINE v0.1 — WebGPU opcional + CPU fallback.
 * Acelera classificação vetorial de metadados; não acelera download/rede.
 * Não executa arquivos encontrados. */
(function(global){
'use strict';
const VERSION='0.1.0', DIM=128, GPU_MIN_ITEMS=32;
let device=null, adapter=null, initPromise=null, lastError=null;

function status(){
  const supported=!!(typeof navigator!=='undefined' && navigator.gpu);
  return {version:VERSION,webgpuSupported:supported,webgpuReady:!!device,backend:device?'webgpu':'cpu',gpuThreshold:GPU_MIN_ITEMS,error:lastError};
}
async function init(){
  if(device) return status();
  if(initPromise) return initPromise;
  initPromise=(async()=>{
    try{
      if(typeof navigator==='undefined'||!navigator.gpu){lastError='WebGPU indisponível neste navegador/dispositivo';return status();}
      adapter=await navigator.gpu.requestAdapter();
      if(!adapter){lastError='Nenhum adaptador GPU disponível';return status();}
      device=await adapter.requestDevice();
      device.lost.then(info=>{device=null;lastError='GPU desconectada: '+(info&&info.message||'motivo não informado');});
      lastError=null;
    }catch(e){device=null;lastError=String(e&&e.message||e);}
    return status();
  })();
  return initPromise;
}
function vectorize(text){
  const v=new Float32Array(DIM);
  const words=String(text||'').toLocaleLowerCase('pt-BR').match(/[\p{L}\p{N}_-]{2,}/gu)||[];
  for(const word of words){
    let h=2166136261;
    for(let i=0;i<word.length;i++){h^=word.charCodeAt(i);h=Math.imul(h,16777619);}
    const idx=(h>>>0)%DIM, sign=(h&0x80000000)?-1:1;
    v[idx]+=sign;
  }
  let norm=0;for(const x of v)norm+=x*x;
  norm=Math.sqrt(norm)||1;for(let i=0;i<DIM;i++)v[i]/=norm;
  return v;
}
function cpuDot(query,vectors){
  return vectors.map(v=>{let s=0;for(let i=0;i<DIM;i++)s+=query[i]*v[i];return s;});
}
async function gpuDot(query,vectors){
  if(!device) throw new Error('GPU não inicializada');
  const count=vectors.length, flat=new Float32Array(count*DIM);
  vectors.forEach((v,i)=>flat.set(v,i*DIM));
  const shader=
    'const DIMS:u32 = '+DIM+'u;\n'+
    'const COUNT:u32 = '+count+'u;\n'+
    '@group(0) @binding(0) var<storage, read> docs: array<f32>;\n'+
    '@group(0) @binding(1) var<storage, read> query: array<f32>;\n'+
    '@group(0) @binding(2) var<storage, read_write> scores: array<f32>;\n'+
    '@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) gid: vec3<u32>) {\n'+
    ' let i=gid.x; if(i>=COUNT){return;} var total:f32=0.0;\n'+
    ' for(var j:u32=0u;j<DIMS;j=j+1u){total+=docs[i*DIMS+j]*query[j];}\n'+
    ' scores[i]=total;\n'+
    '}';
  const U=global.GPUBufferUsage, M=global.GPUMapMode;
  const docsBuf=device.createBuffer({size:flat.byteLength,usage:U.STORAGE|U.COPY_DST});
  const queryBuf=device.createBuffer({size:query.byteLength,usage:U.STORAGE|U.COPY_DST});
  const scoreBuf=device.createBuffer({size:count*4,usage:U.STORAGE|U.COPY_SRC});
  const readBuf=device.createBuffer({size:count*4,usage:U.COPY_DST|U.MAP_READ});
  try{
    device.queue.writeBuffer(docsBuf,0,flat);device.queue.writeBuffer(queryBuf,0,query);
    const module=device.createShaderModule({code:shader});
    const pipeline=device.createComputePipeline({layout:'auto',compute:{module,entryPoint:'main'}});
    const group=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[
      {binding:0,resource:{buffer:docsBuf}},{binding:1,resource:{buffer:queryBuf}},{binding:2,resource:{buffer:scoreBuf}}
    ]});
    const encoder=device.createCommandEncoder(),pass=encoder.beginComputePass();
    pass.setPipeline(pipeline);pass.setBindGroup(0,group);pass.dispatchWorkgroups(Math.ceil(count/64));pass.end();
    encoder.copyBufferToBuffer(scoreBuf,0,readBuf,0,count*4);
    device.queue.submit([encoder.finish()]);
    await readBuf.mapAsync(M.READ);
    const scores=Array.from(new Float32Array(readBuf.getMappedRange().slice(0)));
    readBuf.unmap();return scores;
  }finally{docsBuf.destroy();queryBuf.destroy();scoreBuf.destroy();readBuf.destroy();}
}
async function rankText(query,documents){
  const docs=Array.isArray(documents)?documents:[];
  if(!docs.length)return {backend:'none',items:[]};
  const q=vectorize(query), vectors=docs.map(d=>vectorize(typeof d==='string'?d:(d.text||d.path||'')));
  let scores,backend='cpu';
  if(device&&docs.length>=GPU_MIN_ITEMS){
    try{scores=await gpuDot(q,vectors);backend='webgpu';}
    catch(e){lastError='GPU fallback: '+String(e&&e.message||e);scores=cpuDot(q,vectors);}
  }else scores=cpuDot(q,vectors);
  const items=docs.map((doc,index)=>({index,score:Number(scores[index]||0),document:doc}))
    .sort((a,b)=>b.score-a.score);
  return {backend,items};
}
global.BabyComputeEngine=Object.freeze({VERSION,init,status,rankText,vectorize});
})(window);
