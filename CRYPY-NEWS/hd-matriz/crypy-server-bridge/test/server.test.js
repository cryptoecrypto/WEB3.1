import assert from 'node:assert/strict';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { createServer } from '../src/server.js';
import { fixture, write } from './helpers.js';

describe('C2 / núcleo HTTP: servidor, autenticação e operações', () => {
  let f, server, base, cookie;
  const username = 'sensei';
  const password = 'test-password-that-is-longer-than-24-chars';

  before(async () => {
    f = await fixture();
    const created = await createServer({
      baby: f.baby,
      auth: { username, password, secure: false, ttlSeconds: 60 },
    });
    server = created.server;
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await f.cleanup();
  });

  const get = async (p) => {
    const headers = cookie ? { cookie } : {};
    const res = await fetch(base + p, { headers });
    const type = res.headers.get('content-type') || '';
    return { status: res.status, body: type.includes('json') ? await res.json() : await res.text() };
  };
  const post = async (p, obj, options = {}) => {
    const headers = { 'content-type': 'application/json', origin: base, ...(cookie ? { cookie } : {}), ...(options.headers || {}) };
    const res = await fetch(base + p, { method: 'POST', headers, body: JSON.stringify(obj || {}) });
    return { status: res.status, body: await res.json(), headers: res.headers };
  };
  const login = async () => {
    const r = await post('/auth/login', { username, password });
    const setCookie = r.headers.get('set-cookie');
    assert.equal(r.status, 200);
    assert.ok(setCookie, 'login precisa emitir cookie de sessão');
    cookie = setCookie.split(';')[0];
    return r;
  };

  it('GET /health é público e responde ok sem revelar estado interno', async () => {
    const r = await get('/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.ok, true);
    assert.equal(r.body.service, 'crypy-baby-server');
    assert.equal('paths' in r.body, false);
  });

  it('GET / entrega o painel com formulário de autenticação', async () => {
    const r = await get('/');
    assert.equal(r.status, 200);
    assert.match(r.body, /authForm/);
    assert.match(r.body, /ENTRAR NO SERVIDOR/);
  });

  it('bloqueia a API sem login', async () => {
    const r = await get('/api/status');
    assert.equal(r.status, 401);
    assert.equal(r.body.code, 'AUTH_REQUIRED');
  });

  it('nega credenciais incorretas e aceita credenciais válidas com sessão HttpOnly', async () => {
    const bad = await post('/auth/login', { username, password: 'wrong-password-that-is-long-enough' });
    assert.equal(bad.status, 401);
    const ok = await login();
    assert.match(ok.headers.get('set-cookie'), /HttpOnly/);
    assert.match(ok.headers.get('set-cookie'), /SameSite=Strict/);
    const session = await get('/auth/session');
    assert.equal(session.status, 200);
    assert.equal(session.body.authenticated, true);
    assert.equal(session.body.username, username);
  });

  it('GET /api/status autenticado traz cinco capacidades e saúde real', async () => {
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

  it('POST destrutivo sem token de aprovação responde 403 e não altera nada', async () => {
    await write(path.join(f.sandboxDir, 'arquivo.md'), 'x');
    const r = await post('/api/tasks/files.organize', { dir: f.sandboxDir, dryRun: false });
    assert.equal(r.status, 403);
    assert.equal(r.body.denied, true);
  });

  it('POST de API vindo de origem externa é bloqueado', async () => {
    const r = await post('/api/tasks/memory.index', {}, { headers: { origin: 'https://evil.example' } });
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'ORIGIN_DENIED');
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

  it('logout encerra sessão e bloqueia a API novamente', async () => {
    const r = await post('/auth/logout', {});
    assert.equal(r.status, 200);
    assert.equal(r.body.ok, true);
    const check = await get('/api/status');
    assert.equal(check.status, 401);
    cookie = '';
  });

  it('rota inexistente responde 404 em JSON', async () => {
    const r = await get('/nao-existe');
    assert.equal(r.status, 404);
    assert.equal(r.body.ok, false);
  });
});
