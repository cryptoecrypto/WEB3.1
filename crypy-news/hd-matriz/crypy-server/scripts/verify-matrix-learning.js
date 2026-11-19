import assert from 'node:assert/strict';
import { createBaby } from '../src/baby.js';

const baby = await createBaby();
const indexed = await baby.run('memory.index-matriz', {});
assert.equal(indexed.ok, true, indexed.summary || 'falha ao indexar HD MATRIZ');

const query = await baby.memory.search('BABY-ASCII-001 ASCII 01000010');
const hit = query.hits.find((item) => item.path === 'ABECEDARIO-BINARIO-BABY-IA.txt');
assert.ok(hit, 'BABY não encontrou o documento BABY-ASCII-001 após indexar a HD MATRIZ');
assert.match(hit.snippet || '', /BABY-ASCII-001|01000010|ASCII/i);

console.log(JSON.stringify({
  ok: true,
  etapa: 'indexacao-e-busca',
  corpus: indexed.summary,
  documentoEncontrado: hit.path,
  trecho: hit.snippet,
  fingerprint: indexed.data.rootHash,
}, null, 2));
