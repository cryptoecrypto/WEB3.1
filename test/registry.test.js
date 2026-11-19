import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { describe, it } from 'node:test';
import { RegistryError } from '../src/registry.js';
import { fixture, write } from './helpers.js';

const APPROVAL = { by: 'sensei', token: 'token-de-teste' };

describe('v2.0 / Registro Central de Inteligências', () => {
  it('registra o esquadrão com identidade, função, origem, motor, capacidades e permissões', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const agents = await f.baby.registry.list();
    assert.equal(agents.length, 10);
    for (const a of agents) {
      for (const campo of ['id', 'name', 'role', 'origin', 'engine', 'capabilities', 'permissions', 'state']) {
        assert.ok(a[campo] !== undefined, `${a.id} sem campo ${campo}`);
      }
    }
    const ids = agents.map((a) => a.id).sort();
    assert.deepEqual(ids, ['alice', 'baby', 'btc', 'chat', 'dola', 'eth', 'mini', 'nexus', 'sensei', 'usdt']);
  });

  it('presença documentada NÃO é integração operacional: só BABY e Sensei conectados', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const agents = await f.baby.registry.list();
    const conectadas = agents.filter((a) => a.state === 'conectada').map((a) => a.id).sort();
    assert.deepEqual(conectadas, ['baby', 'sensei']);
    const nexus = agents.find((a) => a.id === 'nexus');
    assert.equal(nexus.state, 'pendente');
    assert.equal(nexus.declaredOnly, true);
    assert.equal(nexus.integration, null);
    assert.deepEqual(nexus.permissions.tasks, [], 'função documentada não concede permissão');
  });

  it('identidade é imutável e exige aprovação para registrar nova', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await assert.rejects(() => f.baby.registry.register({ id: 'nova', origin: 'externa' }), (e) => e.code === 'APPROVAL_DENIED');
    const a = await f.baby.registry.register({ id: 'nova', name: 'NOVA', origin: 'externa', role: 'teste' }, { approval: APPROVAL });
    assert.equal(a.state, 'pendente');
    await assert.rejects(() => f.baby.registry.register({ id: 'nova', origin: 'externa' }, { approval: APPROVAL }), (e) => e.code === 'IMMUTABLE_ID');
    await assert.rejects(() => f.baby.registry.register({ id: 'baby', origin: 'externa' }, { approval: APPROVAL }), (e) => e.code === 'IMMUTABLE_ID');
  });

  it('não conecta sem sondagem real: endpoint morto mantém o estado não-operacional', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const r = await f.baby.registry.connect('alice', { integration: { kind: 'http', endpoint: 'http://127.0.0.1:1/health', timeoutMs: 500 }, approval: APPROVAL });
    assert.equal(r.ok, false);
    const alice = await f.baby.registry.get('alice');
    assert.equal(alice.state, 'desconectada');
    assert.equal(alice.declaredOnly, true);
    assert.ok(alice.history.some((h) => h.event === 'conexao-falhou'));
  });

  it('conecta IA externa quando o endpoint responde de verdade (sondagem HTTP real)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const srv = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, agent: 'alice' }));
    });
    await new Promise((r) => srv.listen(0, '127.0.0.1', r));
    t.after(() => new Promise((r) => srv.close(r)));
    const endpoint = `http://127.0.0.1:${srv.address().port}/health`;
    const r = await f.baby.registry.connect('alice', { integration: { kind: 'http', endpoint }, approval: APPROVAL });
    assert.equal(r.ok, true);
    assert.equal(r.probe.status, 200);
    const alice = await f.baby.registry.get('alice');
    assert.equal(alice.state, 'conectada');
    assert.equal(alice.declaredOnly, false);
    assert.equal(alice.integration.probe.ok, true);
    const check = await f.baby.run('squadron.check', {});
    assert.ok(check.data.results.find((x) => x.id === 'alice').ok);
  });

  it('conexão local exige módulo existente no disco', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const ruim = await f.baby.registry.connect('mini', { integration: { kind: 'local', module: 'src/fantasma.js' }, approval: APPROVAL });
    assert.equal(ruim.ok, false);
    await write(path.join(f.projectRoot, 'src', 'adaptador-mini.js'), 'export default {};\n');
    const bom = await f.baby.registry.connect('mini', { integration: { kind: 'local', module: 'src/adaptador-mini.js' }, approval: APPROVAL });
    assert.equal(bom.ok, true);
    assert.match(bom.probe.sha256, /^[0-9a-f]{64}$/);
  });

  it('Regra de Ouro: autoridade de aprovação jamais é transferida', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await assert.rejects(() => f.baby.registry.grant('baby', { permissions: { approve: true }, approval: APPROVAL }), (e) => e.code === 'GOLDEN_RULE');
    await assert.rejects(() => f.baby.registry.grant('baby', { permissions: { tasks: ['x'] }, approval: { by: 'baby', token: 'token-de-teste' } }), (e) => e.code === 'NOT_SENSEI');
    const r = await f.baby.registry.grant('nexus', { permissions: { tasks: ['coordenar'] }, approval: APPROVAL });
    assert.deepEqual(r.permissions.tasks, ['coordenar']);
    assert.equal(r.permissions.approve, false);
    const baby = await f.baby.registry.get('baby');
    assert.equal(baby.permissions.approve, false);
  });

  it('portão de operação: identidade + estado + capacidade + permissão', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    assert.equal((await f.baby.registry.assertCanOperate('fantasma', 'x')).code, 'UNKNOWN_ID');
    assert.equal((await f.baby.registry.assertCanOperate('alice', 'pesquisar')).code, 'NOT_CONNECTED');
    assert.equal((await f.baby.registry.assertCanOperate('baby', 'pesquisar')).code, 'NO_CAPABILITY');
    assert.equal((await f.baby.registry.assertCanOperate('baby', 'memory.index')).allowed, true);
  });

  it('histórico e trilha registram cada alteração do registro', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.registry.grant('mini', { permissions: { tasks: ['analisar'] }, approval: APPROVAL });
    const mini = await f.baby.registry.get('mini');
    assert.ok(mini.history.length >= 2);
    assert.equal(mini.history.at(-1).event, 'permissoes-concedidas');
    const entries = await f.baby.audit.entries();
    assert.ok(entries.some((e) => e.action === 'registry.permissoes-concedidas' && e.target === 'mini'));
    assert.equal((await f.baby.audit.verify()).ok, true);
  });

  it('registro sobrevive a reinício do núcleo', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.registry.grant('dola', { permissions: { tasks: ['criar-visual'] }, approval: APPROVAL });
    const { createBaby } = await import('../src/baby.js');
    const novo = await createBaby({ projectRoot: f.projectRoot, targetRoot: f.targetRoot, dataDir: f.dataDir, evidenceDir: f.evidenceDir, sandboxDir: f.sandboxDir, approvalToken: 'token-de-teste' });
    const dola = await novo.registry.get('dola');
    assert.deepEqual(dola.permissions.tasks, ['criar-visual']);
    assert.equal(dola.state, 'pendente');
  });
});
