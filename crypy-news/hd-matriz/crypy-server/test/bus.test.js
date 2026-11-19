import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fixture } from './helpers.js';

const APPROVAL = { by: 'sensei', token: 'token-de-teste' };

describe('v2.0 / barramento: colaboração sem transferência de identidade', () => {
  it('mensagem assinada pela própria identidade é entregue e verificável', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const { bus } = f.baby;
    const m = await bus.send({ from: 'baby', key: bus.keyFor('baby'), to: 'sensei', intent: 'memory.index', payload: { raiz: 'corpus' } });
    assert.equal(m.status, 'entregue');
    assert.equal(m.seq, 1);
    assert.match(m.sig, /^[0-9a-f]{64}$/);
    assert.equal((await bus.verify()).ok, true);
    assert.equal((await bus.inbox('sensei'))[0].id, m.id);
    assert.equal((await bus.outbox('baby'))[0].id, m.id);
  });

  it('Regra de Ouro: ninguém fala em nome de outra inteligência (impostor bloqueado)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const { bus } = f.baby;
    await assert.rejects(
      () => bus.send({ from: 'baby', key: bus.keyFor('alice'), to: 'sensei', intent: 'memory.index' }),
      (e) => e.code === 'IMPERSONATION',
    );
    await assert.rejects(() => bus.send({ from: 'sensei', key: 'chave-chutada', to: 'baby', intent: 'definir-direcao' }), (e) => e.code === 'IMPERSONATION');
    const entries = await f.baby.audit.entries();
    assert.equal(entries.filter((e) => e.action === 'bus.impersonation').length, 2);
    assert.equal((await bus.messages()).length, 0, 'nada foi gravado');
  });

  it('identidade pendente não opera, mesmo com a própria chave', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const { bus } = f.baby;
    await assert.rejects(
      () => bus.send({ from: 'alice', key: bus.keyFor('alice'), to: 'baby', intent: 'pesquisar' }),
      (e) => e.code === 'NOT_CONNECTED',
    );
    const entries = await f.baby.audit.entries();
    assert.ok(entries.some((e) => e.action === 'bus.denied' && e.detail.code === 'NOT_CONNECTED'));
  });

  it('escalação de capacidade é negada (BABY não pesquisa como ALICE)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const { bus } = f.baby;
    await assert.rejects(
      () => bus.send({ from: 'baby', key: bus.keyFor('baby'), to: 'sensei', intent: 'pesquisar' }),
      (e) => e.code === 'NO_CAPABILITY',
    );
  });

  it('mensagem para inteligência pendente fica em espera — não é executada', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const { bus } = f.baby;
    const m = await bus.send({ from: 'baby', key: bus.keyFor('baby'), to: 'nexus', intent: 'memory.index', payload: { pedido: 'coordenar' } });
    assert.equal(m.status, 'aguardando-integracao');
    assert.equal((await bus.inbox('nexus')).length, 1);
  });

  it('canal do Sensei usa token de aprovação, não chave de outra identidade', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const { bus } = f.baby;
    const m = await bus.send({ from: 'sensei', approval: APPROVAL, to: 'baby', intent: 'definir-direcao', payload: { ordem: 'indexar o corpus' } });
    assert.equal(m.status, 'entregue');
    await assert.rejects(() => bus.send({ from: 'sensei', approval: { by: 'sensei', token: 'errado' }, to: 'baby', intent: 'definir-direcao' }), (e) => e.code === 'APPROVAL_DENIED');
  });

  it('adulteração de mensagem é detectada pela assinatura', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const { bus } = f.baby;
    await bus.send({ from: 'baby', key: bus.keyFor('baby'), to: 'sensei', intent: 'memory.index', payload: { valor: 1 } });
    const file = path.join(f.dataDir, 'bus', 'messages.jsonl');
    const lines = (await fsp.readFile(file, 'utf8')).trim().split('\n');
    const m = JSON.parse(lines[0]);
    m.payload.valor = 999; // ataque sem a chave do autor
    m.from = 'sensei';      // tentativa de trocar a autoria
    lines[0] = JSON.stringify(m);
    await fsp.writeFile(file, lines.join('\n') + '\n', 'utf8');
    const v = await bus.verify();
    assert.equal(v.ok, false);
    assert.match(v.reason, /assinatura inválida/);
  });

  it('despacho escolhe por capacidade + permissão + estado, sem antecipar integração', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const d1 = await f.baby.bus.dispatch('memory.index');
    assert.equal(d1.executor, 'baby');
    const d2 = await f.baby.bus.dispatch('pesquisar');
    assert.equal(d2.executor, null);
    assert.deepEqual(d2.aguardandoIntegracao, ['alice']);
    assert.match(d2.coordenador, /slot reservado ao NEXUS/);
  });

  it('coordenação continua local mesmo com permissão concedida ao NEXUS pendente', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.registry.grant('nexus', { permissions: { tasks: ['coordenar'] }, approval: APPROVAL });
    const d = await f.baby.bus.dispatch('coordenar');
    assert.equal(d.executor, null, 'permissão não substitui integração');
    assert.deepEqual(d.aguardandoIntegracao, ['nexus']);
  });

  it('barramento e trilha permanecem íntegros após uma sessão de colaboração', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const { bus } = f.baby;
    await bus.send({ from: 'sensei', approval: APPROVAL, to: 'baby', intent: 'definir-direcao', payload: { ordem: 'proteger' } });
    await bus.send({ from: 'baby', key: bus.keyFor('baby'), to: 'sensei', intent: 'vault.snapshot', payload: {} });
    await f.baby.run('vault.snapshot', {});
    assert.equal((await bus.verify()).ok, true);
    assert.equal((await f.baby.audit.verify()).ok, true);
    const r = await f.baby.run('bus.verify', {});
    assert.equal(r.ok, true);
    assert.equal(r.data.count, 2);
  });
});
