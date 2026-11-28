import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fixture } from './helpers.js';

describe('C1 / memória, indexação e relações', () => {
  it('indexa com SHA-256 real e fingerprint estável do corpus', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const r1 = await f.baby.memory.index({ root: f.targetRoot });
    assert.equal(r1.fileCount, 3);
    assert.equal(r1.diff.added.length, 3);
    assert.match(r1.rootHash, /^[0-9a-f]{64}$/);
    const idx = await f.baby.memory.latest();
    const a = idx.files.find((x) => x.path === 'a.js');
    assert.equal(a.hash.length, 64);
    const r2 = await f.baby.memory.index({ root: f.targetRoot });
    assert.equal(r2.rootHash, r1.rootHash, 'mesmo conteúdo => mesma impressão digital');
    assert.equal(r2.diff.unchanged, 3);
  });

  it('detecta adição, alteração e remoção no diff', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.memory.index({ root: f.targetRoot });
    await fsp.writeFile(path.join(f.targetRoot, 'novo.txt'), 'novo arquivo', 'utf8');
    await fsp.writeFile(path.join(f.targetRoot, 'nota.md'), '# CRYPY\nconteúdo alterado\n', 'utf8');
    await fsp.unlink(path.join(f.targetRoot, 'sub', 'b.js'));
    const r = await f.baby.memory.index({ root: f.targetRoot });
    assert.deepEqual(r.diff.added, ['novo.txt']);
    assert.deepEqual(r.diff.changed, ['nota.md']);
    assert.deepEqual(r.diff.removed, ['sub/b.js']);
    assert.equal(r.fileCount, 3);
  });

  it('busca por nome e por conteúdo com pontuação e trecho', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.memory.index({ root: f.targetRoot });
    const r = await f.baby.memory.search('memoria viva');
    assert.ok(r.hits.length >= 1);
    assert.equal(r.hits[0].path, 'nota.md');
    assert.ok(r.hits[0].score > 0);
    const porNome = await f.baby.memory.search('a.js');
    assert.ok(porNome.hits.some((h) => h.path === 'a.js'));
    const vazio = await f.baby.memory.search('zzz-inexistente-zzz');
    assert.equal(vazio.hits.length, 0);
  });

  it('extrai relações reais entre módulos (import relativo)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.memory.index({ root: f.targetRoot });
    const g = await f.baby.memory.relations();
    assert.deepEqual(g.edges.map((e) => `${e.from}->${e.to}`), ['a.js->sub/b.js']);
    assert.equal(g.unresolved.length, 0);
    assert.deepEqual(g.nodes, ['a.js', 'sub/b.js']);
  });

  it('guarda histórico de indexações (recuperação de linha do tempo)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.memory.index({ root: f.targetRoot });
    await fsp.writeFile(path.join(f.targetRoot, 'x.txt'), 'x', 'utf8');
    await f.baby.memory.index({ root: f.targetRoot });
    const h = await f.baby.memory.history({ limit: 10 });
    assert.equal(h.length, 2);
    assert.equal(h[0].added, 1);
    assert.notEqual(h[0].rootHash, h[1].rootHash);
  });

  it('recusa indexar raiz não autorizada', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await assert.rejects(() => f.baby.memory.index({ root: '/etc' }), (e) => e.code === 'OUT_OF_ROOT');
  });
});
