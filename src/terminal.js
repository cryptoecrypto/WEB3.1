#!/usr/bin/env node
/**
 * Entrada do Terminal Central CRYPY v1.1.
 * --audit executa auditoria somente leitura; --inventory lista a raiz.
 * Sem argumento inicia o servidor operacional existente.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv[2];

if (arg === '--audit') {
  const { default: unused } = await import('node:module').catch(() => ({ default: null }));
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/audit.js')], { cwd: root, stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} else if (arg === '--inventory') {
  const ignored = new Set(['.git', 'node_modules']);
  const entries = (await fs.readdir(root, { withFileTypes: true }))
    .filter(entry => !ignored.has(entry.name))
    .map(entry => ({ name: entry.name, type: entry.isDirectory() ? 'directory' : 'file' }))
    .sort((a, b) => a.name.localeCompare(b.name));
  console.log(JSON.stringify({ source: 'WEB3.1', root: '.', readOnly: true, entries }, null, 2));
} else {
  const { createServer } = await import('./server.js');
  const { server, baby } = await createServer();
  const { host, port } = baby.config;
  server.listen(port, host, () => {
    console.log(`[CRYPY TERMINAL] ativo em http://${host}:${port}`);
    console.log('[CRYPY TERMINAL] publicação automática desativada; aprovação humana obrigatória.');
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
