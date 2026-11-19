#!/usr/bin/env node
/**
 * CRYPY Terminal Central v1.1 — auditoria estrutural somente leitura.
 * O codigo do servidor fica em crypy-news/hd-matriz/crypy-server.
 * O workflow permanece na raiz por exigencia do GitHub Actions.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = path.resolve(root, '../../../.github/workflows/validate.yml');
const required = [
  ['package.json', path.join(root, 'package.json')],
  ['README.md', path.join(root, 'README.md')],
  ['src/server.js', path.join(root, 'src/server.js')],
  ['src/terminal.js', path.join(root, 'src/terminal.js')],
  ['test', path.join(root, 'test')],
  ['.github/workflows/validate.yml (raiz do repositorio)', workflowPath],
];
const forbiddenNames = new Set(['.env', '.env.local', '.env.production', 'id_rsa', 'id_ed25519']);
const findings = [];
for (const [label, target] of required) {
  try {
    await fs.access(target);
    findings.push({ check: 'required-path', path: label, ok: true });
  } catch {
    findings.push({ check: 'required-path', path: label, ok: false });
  }
}
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
for (const field of ['name', 'version', 'type', 'scripts']) {
  findings.push({ check: 'package-field', field, ok: Object.hasOwn(pkg, field) });
}
async function scan(dir, rel = '') {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (['.git', 'node_modules', '.baby'].includes(entry.name)) continue;
    const childRel = path.posix.join(rel, entry.name);
    if (forbiddenNames.has(entry.name)) {
      findings.push({ check: 'sensitive-filename-review', path: childRel, ok: false });
    }
    if (entry.isDirectory()) await scan(path.join(dir, entry.name), childRel);
  }
}
await scan(root);
const failed = findings.filter(x => !x.ok);
const report = {
  audit: 'CRYPY Terminal Central v1.1',
  mode: 'read-only',
  root,
  checkedAt: new Date().toISOString(),
  passed: findings.length - failed.length,
  failed: failed.length,
  findings,
};
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exitCode = 1;
