import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  ['package.json', 'file'],
  ['CNAME', 'file'],
  ['index.html', 'file'],
  ['src/server.js', 'file'],
  ['src/config.js', 'file'],
  ['src/memory.js', 'file'],
  ['bin/baby.js', 'file'],
  ['test', 'dir'],
  ['public/index.html', 'file'],
  ['scripts', 'dir'],
  ['crypy-server-bridge/README.md', 'file'],
];
const errors = [];
for (const [rel, kind] of required) {
  try {
    const st = await fs.stat(path.join(root, rel));
    if (kind === 'file' && !st.isFile()) errors.push(`Esperado arquivo: ${rel}`);
    if (kind === 'dir' && !st.isDirectory()) errors.push(`Esperada pasta: ${rel}`);
  } catch {
    errors.push(`Ausente: ${rel}`);
  }
}

let html = 0;
let js = 0;
let json = 0;
const ignored = new Set(['.git', 'node_modules', '.baby', 'coverage', 'dist', 'build']);
async function walk(dir) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch (err) { errors.push(`Não foi possível ler ${path.relative(root, dir)}: ${err.message}`); return; }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.html' || ext === '.htm') html++;
      if (ext === '.js' || ext === '.mjs' || ext === '.cjs') js++;
      if (ext === '.json') json++;
    }
  }
}
await walk(root);

console.log('CRYPY / WEB3.1 — auditoria estrutural');
console.log(`Raiz: ${root}`);
console.log(`HTML/HTM: ${html} | JavaScript: ${js} | JSON: ${json}`);
if (errors.length) {
  console.error('\nFALHAS:');
  for (const e of errors) console.error(`- ${e}`);
  process.exitCode = 1;
} else {
  console.log('OK: caminhos mínimos do núcleo e arquivos de proteção encontrados.');
}
console.log('Nota: esta verificação não valida links de cada HTML, aparência visual, serviços externos, Dropbox, HDs ou deploy.');
