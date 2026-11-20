import assert from 'node:assert/strict';
import { createBaby } from '../src/baby.js';

const baby = await createBaby();
const indexed = await baby.run('memory.index-matriz', {});
assert.equal(indexed.ok, true, indexed.summary || 'falha ao indexar HD MATRIZ');

const query = await baby.memory.search('BABY-ASCII-001 ASCII 01000010');
const hit = query.hits.find((item) => item.path === 'ABECEDARIO-BINARIO-BABY-IA.txt');
assert.ok(hit, 'BABY não encontrou o documento BABY-ASCII-001 após indexar a HD MATRIZ');
assert.match(hit.snippet || '', /BABY-ASCII-001|01000010|ASCII/i);

const mediaQuery = await baby.memory.search('BABY-MEDIA-PHD-001 Photoshop vídeo imagem');
const mediaHit = mediaQuery.hits.find((item) => item.path === 'CURSO-EDICAO-IMAGEM-VIDEO-PHD-001.md');
assert.ok(mediaHit, 'BABY não encontrou o currículo BABY-MEDIA-PHD-001 após indexar a HD MATRIZ');
assert.match(mediaHit.snippet || '', /BABY-MEDIA-PHD-001|CURSO COMPLETO/i);
const mediaDetail = await baby.memory.search('frequência separada timecode avaliação final');
assert.ok(
  mediaDetail.hits.some((item) => item.path === 'CURSO-EDICAO-IMAGEM-VIDEO-PHD-001.md'),
  'BABY encontrou o arquivo, mas não recuperou assuntos específicos do currículo de mídia'
);

console.log(JSON.stringify({
  ok: true,
  etapa: 'indexacao-e-busca',
  corpus: indexed.summary,
  documentosEncontrados: [hit.path, mediaHit.path],
  trechos: [hit.snippet, mediaHit.snippet],
  topicosDoCursoEncontrados: mediaDetail.hits.some((item) => item.path === 'CURSO-EDICAO-IMAGEM-VIDEO-PHD-001.md'),
  fingerprint: indexed.data.rootHash,
}, null, 2));
