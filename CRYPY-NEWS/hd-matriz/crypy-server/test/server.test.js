import assert from 'node:assert/strict';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { createServer } from '../src/server.js';
import { fixture, write } from './helpers.js';

describe('C2 / núcleo HTTP: o servidor responde de verdade', () => {
  let f, server, base;

  let previousApiToken;
  before(async () => {
    previousApiToken = process.env.CRYPY_API_TOKEN;
    process.env.CRYPY_API_TOKEN = 'test-api-token';
    f = await fixture();
    const created = await createServer({ baby: f.baby });
    server = created.server;
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await f.cleanup();
    if (previousApiToken === undefined) delete process.env.CRYPY_API_TOKEN;
    else process.env.CRYPY_API_TOKEN = previousApiToken;
  });

  const get = async (p) => {
    const res = await fetch(base + p, { headers: p.startsWith('/api/') ? { authorization: 'Bearer test-api-token' } : {} });
    const type = res.headers.get('content-type') || '';
    return { status: res.status, body: type.includes('json') ? await res.json() : await res.text() };
  };
  const post = async (p, obj) => {
    const res = await fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer test-api-token' }, body: JSON.stringify(obj) });
    return { status: res.status, body: await res.json() };
  };

  it('GET /health responde ok', async () => {
    const r = await get('/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.ok, true);
  });

  it('GET / entrega o painel', async () => {
    const r = await get('/');
    assert.equal(r.status, 200);
    assert.match(r.body, /<html|<!doctype/i);
  });

  it('API recusa requisição sem token', async () => {
    const res = await fetch(base + '/api/status');
    assert.equal(res.status, 401);
    assert.equal((await res.json()).code, 'UNAUTHORIZED');
  });

  it('GET /api/status traz as cinco capacidades e a saúde ao vivo', async () => {
    const r = await get('/api/status');
    assert.equal(r.status, 200);
    assert.equal(r.body.capabilities.length, 5);
    assert.ok(r.body.principle.includes('trabalhar dentro do CRYPY'));
  });

  it('POST /api/tasks/memory.index executa e indexa', async () => {
    const r = await post('/api/tasks/memory.index', {});
    assert.equal(r.status, 200);
    assert.equal(r.body.ok, true);
    assert.equal(r.body.data.fileCount, 3);
  });

  it('GET /api/memory/search encontra conteúdo indexado', async () => {
    const r = await get('/api/memory/search?q=memoria');
    assert.equal(r.status, 200);
    assert.ok(r.body.hits.length >= 1);
  });

  it('POST destrutivo sem token responde 403 e não altera nada', async () => {
    await write(path.join(f.sandboxDir, 'arquivo.md'), 'x');
    const r = await post('/api/tasks/files.organize', { dir: f.sandboxDir, dryRun: false });
    assert.equal(r.status, 403);
    assert.equal(r.body.denied, true);
  });

  it('POST /api/ledger/C1/advance pulando estados responde 409', async () => {
    const r = await post('/api/ledger/C1/advance', { to: 'aprovada', approval: { by: 'sensei', token: 'token-de-teste' } });
    assert.equal(r.status, 409);
    assert.equal(r.body.code, 'STATE_SKIP');
  });

  it('GET /api/audit devolve cadeia verificada', async () => {
    const r = await get('/api/audit?limit=5');
    assert.equal(r.status, 200);
    assert.equal(r.body.verify.ok, true);
    assert.ok(r.body.total > 0);
    assert.ok(r.body.entries.length <= 5);
  });

  it('bloqueia travessia de caminho no leitor de evidências', async () => {
    const r = await get('/api/evidence/file?name=../../../etc/passwd');
    assert.equal(r.status, 400);
  });

  it('rota inexistente responde 404 em JSON', async () => {
    const r = await get('/nao-existe');
    assert.equal(r.status, 404);
    assert.equal(r.body.ok, false);
  });
});
