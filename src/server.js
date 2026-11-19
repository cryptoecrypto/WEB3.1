// CAPACIDADE 2 — o servidor é o núcleo operacional. BABY trabalha sobre ele.
// HTTP puro (node:http), sem dependências, sem allowlist de host: funciona atrás do proxy de preview.
import http from 'node:http';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createBaby } from './baby.js';
import { LedgerError } from './ledger.js';
import { PolicyError } from './policy.js';

const MAX_BODY = 1024 * 1024;

function json(res, code, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw new Error('corpo da requisição excede 1 MB');
    chunks.push(c);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('JSON inválido');
  }
}

export async function createServer({ baby = null, ...overrides } = {}) {
  const b = baby || (await createBaby(overrides));
  const indexFile = path.join(b.config.projectRoot, 'public', 'index.html');

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://nucleo.local');
    const p = url.pathname;
    try {
      if (req.method === 'GET' && (p === '/' || p === '/index.html')) {
        const html = await fsp.readFile(indexFile, 'utf8');
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(html);
      }
      if (req.method === 'GET' && p === '/health') return json(res, 200, { ok: true, version: b.version, now: new Date().toISOString() });
      if (req.method === 'GET' && p === '/api/status') return json(res, 200, await b.status());
      if (req.method === 'GET' && p === '/api/tasks') return json(res, 200, { tasks: b.taskList() });
      if (req.method === 'GET' && p === '/api/ledger') return json(res, 200, { capabilities: await b.ledger.status() });
      if (req.method === 'GET' && p === '/api/memory/search') {
        const q = url.searchParams.get('q') || '';
        const limit = Math.min(Number(url.searchParams.get('limit') || 10), 50);
        return json(res, 200, await b.memory.search(q, { limit }));
      }
      if (req.method === 'GET' && p === '/api/memory/relations') return json(res, 200, await b.memory.relations());
      if (req.method === 'GET' && p === '/api/memory/history') return json(res, 200, { history: await b.memory.history({ limit: 20 }) });
      if (req.method === 'GET' && p === '/api/vault/manifests') return json(res, 200, { manifests: await b.vault.manifests() });
      if (req.method === 'GET' && p === '/api/audit') {
        const limit = Math.min(Number(url.searchParams.get('limit') || 40), 200);
        const entries = await b.audit.entries();
        return json(res, 200, { verify: await b.audit.verify(), total: entries.length, entries: entries.slice(-limit).reverse() });
      }
      if (req.method === 'GET' && p === '/api/evidence') {
        const names = (await fsp.readdir(b.config.evidenceDir)).filter((n) => !n.startsWith('.')).sort().reverse();
        const files = [];
        for (const n of names) {
          const st = await fsp.stat(path.join(b.config.evidenceDir, n));
          if (st.isFile()) files.push({ name: n, size: st.size, mtime: st.mtimeMs });
        }
        return json(res, 200, { files });
      }
      if (req.method === 'GET' && p === '/api/evidence/file') {
        const name = url.searchParams.get('name') || '';
        if (!/^[\w.-]+$/.test(name)) return json(res, 400, { ok: false, reason: 'nome inválido' });
        const { abs } = await b.policy.resolve(path.join(b.config.evidenceDir, name), 'read');
        const txt = await fsp.readFile(abs, 'utf8');
        res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(txt);
      }
      if (req.method === 'POST' && p.startsWith('/api/tasks/')) {
        const id = decodeURIComponent(p.slice('/api/tasks/'.length));
        const opts = await readBody(req);
        const result = await b.run(id, opts);
        return json(res, result.ok ? 200 : (result.denied ? 403 : 400), result);
      }
      if (req.method === 'POST' && p.startsWith('/api/ledger/') && p.endsWith('/advance')) {
        const id = decodeURIComponent(p.slice('/api/ledger/'.length, -'/advance'.length));
        const body = await readBody(req);
        try {
          const r = await b.ledger.advance(id, body);
          return json(res, 200, r);
        } catch (err) {
          if (err instanceof LedgerError) return json(res, 409, { ok: false, code: err.code, reason: err.message });
          throw err;
        }
      }
      return json(res, 404, { ok: false, reason: `rota inexistente: ${req.method} ${p}` });
    } catch (err) {
      const code = err instanceof PolicyError ? 403 : 500;
      return json(res, code, { ok: false, code: err.code || 'INTERNAL', reason: err.message });
    }
  });

  return { server, baby: b };
}

const isMain = process.argv[1] && import.meta.url === `file://${path.resolve(process.argv[1])}`;
if (isMain) {
  const { server, baby } = await createServer();
  const { host, port } = baby.config;
  server.listen(port, host, () => {
    console.log(`[BABY] núcleo operacional em http://${host}:${port}  (projeto: ${baby.config.projectRoot})`);
    console.log(`[BABY] MODO REAL ativo — nenhuma capacidade é declarada sem evidência.`);
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
