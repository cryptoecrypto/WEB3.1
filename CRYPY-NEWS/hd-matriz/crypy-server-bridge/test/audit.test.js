import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { AuditLog } from '../src/audit.js';
import { fixture } from './helpers.js';

describe('C4 / trilha de auditoria encadeada', () => {
  it('encadeia registros e verifica a cadeia íntegra', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const a = f.baby.audit;
    const r1 = await a.append({ action: 'teste.um', detail: { x: 1 } });
    const r2 = await a.append({ action: 'teste.dois', detail: { x: 2 } });
    assert.equal(r1.seq, 1);
    assert.equal(r2.seq, 2);
    assert.equal(r2.prev, r1.hash);
    assert.equal(r1.prev, '0'.repeat(64));
    const v = await a.verify();
    assert.equal(v.ok, true);
    assert.equal(v.count, 2);
    assert.equal(v.head, r2.hash);
  });

  it('detecta adulteração de conteúdo de um registro', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const a = f.baby.audit;
    await a.append({ action: 'original', detail: { valor: 10 } });
    await a.append({ action: 'seguinte' });
    const file = path.join(f.dataDir, 'audit', 'audit.jsonl');
    const lines = (await fsp.readFile(file, 'utf8')).trim().split('\n');
    const rec = JSON.parse(lines[0]);
    rec.detail.valor = 9999; // ataque: muda o passado sem refazer a cadeia
    lines[0] = JSON.stringify(rec);
    await fsp.writeFile(file, lines.join('\n') + '\n', 'utf8');
    const v = await a.verify();
    assert.equal(v.ok, false);
    assert.equal(v.brokenAt, 1);
    assert.match(v.reason, /adulterado/);
  });

  it('detecta truncamento (registros apagados) pela âncora externa', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const a = f.baby.audit;
    await a.append({ action: 'um' });
    await a.append({ action: 'dois' });
    await a.append({ action: 'tres' });
    const file = path.join(f.dataDir, 'audit', 'audit.jsonl');
    const lines = (await fsp.readFile(file, 'utf8')).trim().split('\n');
    await fsp.writeFile(file, lines.slice(0, 2).join('\n') + '\n', 'utf8');
    const v = await a.verify();
    assert.equal(v.ok, false);
    assert.match(v.reason, /âncora divergente/);
  });

  it('detecta quebra de sequência e JSON inválido', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const dir = path.join(f.root, 'auditoria-isolada');
    const a = await new AuditLog({ dir }).init();
    await a.append({ action: 'um' });
    await a.append({ action: 'dois' });
    const file = path.join(dir, 'audit.jsonl');
    await fsp.writeFile(file, '{ isto não é json }\n', 'utf8');
    const v = await a.verify();
    assert.equal(v.ok, false);
    assert.match(v.reason, /ilegível/);
  });
});
