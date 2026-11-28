import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fixture } from './helpers.js';

describe('C4 / cofre: backup, integridade e restauração', () => {
  it('snapshot com dedupe por conteúdo e verificação íntegra', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await fsp.writeFile(path.join(f.targetRoot, 'copia.md'), '# CRYPY\nMemoria viva do ecossistema.\n', 'utf8'); // mesmo conteúdo de nota.md
    const s1 = await f.baby.vault.snapshot({ root: f.targetRoot, label: 'primeiro' });
    assert.equal(s1.stats.fileCount, 4);
    assert.equal(s1.stats.objects, 3, 'conteúdo duplicado não gera novo blob');
    assert.ok(s1.stats.dedupBytes > 0);
    const s2 = await f.baby.vault.snapshot({ root: f.targetRoot, label: 'segundo' });
    assert.equal(s2.stats.objects, 0, 'segundo snapshot não duplica nada');
    assert.equal(s2.rootHash, s1.rootHash);
    const v = await f.baby.vault.verify(s1.id);
    assert.equal(v.ok, true);
    assert.equal(v.checked, 4);
    assert.equal(v.rootHashOk, true);
  });

  it('detecta blob corrompido (bit rot) pelo re-hash', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const s = await f.baby.vault.snapshot({ root: f.targetRoot });
    const m = await f.baby.vault.manifest(s.id);
    const obj = f.baby.vault.objectPath(m.files[0].hash);
    await fsp.writeFile(obj, 'conteúdo corrompido', 'utf8');
    const v = await f.baby.vault.verify(s.id);
    assert.equal(v.ok, false);
    assert.equal(v.corrupt.length, 1);
    assert.equal(v.corrupt[0].expected, m.files[0].hash);
  });

  it('detecta blob ausente', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const s = await f.baby.vault.snapshot({ root: f.targetRoot });
    const m = await f.baby.vault.manifest(s.id);
    await fsp.unlink(f.baby.vault.objectPath(m.files[0].hash));
    const v = await f.baby.vault.verify(s.id);
    assert.equal(v.ok, false);
    assert.equal(v.missing.length, 1);
  });

  it('detecta manifesto adulterado (rootHash não confere)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const s = await f.baby.vault.snapshot({ root: f.targetRoot });
    const file = path.join(f.dataDir, 'vault', 'manifests', `${s.id}.json`);
    const m = JSON.parse(await fsp.readFile(file, 'utf8'));
    m.rootHash = 'f'.repeat(64);
    await fsp.writeFile(file, JSON.stringify(m), 'utf8');
    const v = await f.baby.vault.verify(s.id);
    assert.equal(v.ok, false);
    assert.equal(v.rootHashOk, false);
  });

  it('restauração: dry-run não escreve; execução sem aprovação é negada', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const s = await f.baby.vault.snapshot({ root: f.targetRoot });
    const dry = await f.baby.vault.restore(s.id, { dest: f.sandboxDir, dryRun: true });
    assert.equal(dry.dryRun, true);
    assert.equal(dry.planned, 3);
    assert.deepEqual(await fsp.readdir(f.sandboxDir), []);
    const negado = await f.baby.vault.restore(s.id, { dest: f.sandboxDir, dryRun: false });
    assert.equal(negado.denied, true);
    assert.deepEqual(await fsp.readdir(f.sandboxDir), []);
  });

  it('restauração aprovada recupera bytes idênticos (hash conferido arquivo a arquivo)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const s = await f.baby.vault.snapshot({ root: f.targetRoot });
    await fsp.rm(path.join(f.targetRoot, 'a.js'));
    await fsp.writeFile(path.join(f.targetRoot, 'nota.md'), 'destruído', 'utf8');
    const r = await f.baby.vault.restore(s.id, { dest: f.sandboxDir, dryRun: false, approval: { by: 'sensei', token: 'token-de-teste' } });
    assert.equal(r.ok, true);
    assert.equal(r.restored, 3);
    assert.equal(r.verified, true);
    const m = await f.baby.vault.manifest(s.id);
    for (const file of m.files) {
      const txt = await fsp.readFile(path.join(f.sandboxDir, file.path), 'utf8');
      const { hashFile } = await import('../src/util.js');
      const tmp = path.join(f.root, 'check.tmp');
      await fsp.writeFile(tmp, txt, 'utf8');
      assert.equal(await hashFile(tmp), file.hash, `hash confere em ${file.path}`);
    }
  });

  it('recusa restaurar a partir de cofre corrompido', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const s = await f.baby.vault.snapshot({ root: f.targetRoot });
    const m = await f.baby.vault.manifest(s.id);
    await fsp.writeFile(f.baby.vault.objectPath(m.files[0].hash), 'lixo', 'utf8');
    const r = await f.baby.vault.restore(s.id, { dest: f.sandboxDir, dryRun: false, approval: { by: 'sensei', token: 'token-de-teste' } });
    assert.equal(r.ok, false);
    assert.match(r.reason, /não íntegro/);
  });
});
