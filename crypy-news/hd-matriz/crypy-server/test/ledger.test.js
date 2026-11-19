import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { STATES } from '../src/ledger.js';
import { createBaby } from '../src/baby.js';
import { fixture, write } from './helpers.js';

const APPROVAL = { by: 'sensei', token: 'token-de-teste' };

async function comEvidencias(f) {
  await write(path.join(f.projectRoot, 'docs', 'C1.md'), '# C1 — documento de arquitetura\n');
  await write(path.join(f.projectRoot, 'evidence', 'test.log'), '# pass 5\n# fail 0\n');
  return {
    doc: { kind: 'doc', path: 'docs/C1.md' },
    code: { kind: 'code', paths: ['src/mod1.js', 'src/mod2.js'] },
    test: { kind: 'test', path: 'evidence/test.log', meta: { command: 'node --test test/', exitCode: 0, passed: 5, failed: 0 } },
  };
}

describe('MODO REAL / máquina de estados com evidência obrigatória', () => {
  it('os seis estados existem na ordem definida', () => {
    assert.deepEqual(STATES, ['planejada', 'documentada', 'implementada', 'testada', 'aprovada', 'protegida']);
  });

  it('nasce em planejada e não permite pular estados', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const st = await f.baby.ledger.status();
    assert.equal(st.length, 5);
    assert.ok(st.every((c) => c.state === 'planejada'));
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'implementada' }), (e) => e.code === 'STATE_SKIP');
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'aprovada', approval: APPROVAL }), (e) => e.code === 'STATE_SKIP');
    const depois = await f.baby.ledger.status();
    assert.equal(depois[0].state, 'planejada', 'tentativa negada não altera o estado');
  });

  it('exige documento existente para documentada', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'documentada' }), /exige/);
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'documentada', evidence: { kind: 'doc', path: 'docs/fantasma.md' } }), /inexistente/);
  });

  it('exige código existente para implementada', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const ev = await comEvidencias(f);
    await f.baby.ledger.advance('C1', { to: 'documentada', evidence: ev.doc });
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'implementada', evidence: { kind: 'code', path: 'src/fantasma.js' } }), /inexistente/);
    const r = await f.baby.ledger.advance('C1', { to: 'implementada', evidence: ev.code });
    assert.equal(r.to, 'implementada');
    assert.equal(r.proof.length, 2);
    assert.match(r.proof[0].sha256, /^[0-9a-f]{64}$/);
  });

  it('recusa "testada" sem teste verde de verdade', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const ev = await comEvidencias(f);
    await f.baby.ledger.advance('C1', { to: 'documentada', evidence: ev.doc });
    await f.baby.ledger.advance('C1', { to: 'implementada', evidence: ev.code });
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'testada', evidence: { ...ev.test, meta: { command: 'node --test', exitCode: 1, passed: 4, failed: 1 } } }), (e) => e.code === 'TEST_NOT_GREEN');
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'testada', evidence: { ...ev.test, meta: { command: 'node --test', exitCode: 0, passed: 0, failed: 0 } } }), (e) => e.code === 'TEST_NOT_GREEN');
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'testada', evidence: { kind: 'test', path: 'evidence/test.log', meta: { exitCode: 0, passed: 3, failed: 0 } } }), /comando/);
    const ok = await f.baby.ledger.advance('C1', { to: 'testada', evidence: ev.test });
    assert.equal(ok.to, 'testada');
  });

  it('aprovação exige a autoridade do Sensei (token)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const ev = await comEvidencias(f);
    await f.baby.ledger.advance('C1', { to: 'documentada', evidence: ev.doc });
    await f.baby.ledger.advance('C1', { to: 'implementada', evidence: ev.code });
    await f.baby.ledger.advance('C1', { to: 'testada', evidence: ev.test });
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'aprovada' }), (e) => e.code === 'APPROVAL_DENIED');
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'aprovada', approval: { by: 'baby', token: 'chute' } }), (e) => e.code === 'APPROVAL_DENIED');
    const r = await f.baby.ledger.advance('C1', { to: 'aprovada', approval: APPROVAL });
    assert.equal(r.to, 'aprovada');
  });

  it('protegida exige cofre íntegro + trilha íntegra, verificados ao vivo', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const ev = await comEvidencias(f);
    await f.baby.ledger.advance('C1', { to: 'documentada', evidence: ev.doc });
    await f.baby.ledger.advance('C1', { to: 'implementada', evidence: ev.code });
    await f.baby.ledger.advance('C1', { to: 'testada', evidence: ev.test });
    await f.baby.ledger.advance('C1', { to: 'aprovada', approval: APPROVAL });
    await assert.rejects(() => f.baby.ledger.advance('C1', { to: 'protegida', evidence: { kind: 'protection', path: 'evidence/test.log', meta: { manifestId: 'snap-fantasma' } } }), (e) => e.code === 'VAULT_BAD');

    const snap = await f.baby.vault.snapshot({ root: f.targetRoot, label: 'protecao-C1' });
    await write(path.join(f.projectRoot, 'evidence', 'protecao.md'), `# Proteção C1\nmanifesto: ${snap.id}\n`);
    const r = await f.baby.ledger.advance('C1', { to: 'protegida', evidence: { kind: 'protection', path: 'evidence/protecao.md', meta: { manifestId: snap.id } } });
    assert.equal(r.to, 'protegida');
    const live = r.proof.find((p) => p.live);
    assert.equal(live.vault.ok, true);
    assert.equal(live.audit.ok, true);
    const st = (await f.baby.ledger.status()).find((c) => c.id === 'C1');
    assert.equal(st.state, 'protegida');
    assert.equal(st.next, null);
    assert.equal(st.evidenceCount, 4);
  });

  it('estado e evidências sobrevivem a reinício do núcleo (persistência)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const ev = await comEvidencias(f);
    await f.baby.ledger.advance('C4', { to: 'documentada', evidence: ev.doc });
    await f.baby.ledger.advance('C4', { to: 'implementada', evidence: ev.code });
    const reaberto = await createBaby({
      projectRoot: f.projectRoot, targetRoot: f.targetRoot, dataDir: f.dataDir,
      evidenceDir: f.evidenceDir, sandboxDir: f.sandboxDir, approvalToken: 'token-de-teste',
    });
    const st = (await reaberto.ledger.status()).find((c) => c.id === 'C4');
    assert.equal(st.state, 'implementada');
    assert.equal(st.evidenceCount, 2);
    const audit = await reaberto.audit.verify();
    assert.equal(audit.ok, true, 'trilha continua íntegra após reinício');
    assert.ok(audit.count >= 2);
  });
});
