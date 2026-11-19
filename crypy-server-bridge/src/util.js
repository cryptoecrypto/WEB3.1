// CRYPY / BABY — utilidades determinísticas (sem dependências externas)
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

export const sha256 = (data) => createHash('sha256').update(data).digest('hex');

/** JSON canônico: chaves ordenadas -> hash estável entre execuções. */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

export const hashObject = (obj) => sha256(stableStringify(obj));

export const nowIso = () => new Date().toISOString();

export async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

export async function writeJsonAtomic(file, obj) {
  await ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  await fsp.rename(tmp, file);
}

export async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fsp.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

export async function appendLine(file, line) {
  await ensureDir(path.dirname(file));
  await fsp.appendFile(file, line.endsWith('\n') ? line : line + '\n', 'utf8');
}

export async function readLines(file) {
  try {
    const txt = await fsp.readFile(file, 'utf8');
    return txt.split('\n').filter((l) => l.trim().length > 0);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function hashFile(file) {
  const h = createHash('sha256');
  await new Promise((resolve, reject) => {
    const s = fs.createReadStream(file);
    s.on('data', (c) => h.update(c));
    s.on('error', reject);
    s.on('end', resolve);
  });
  return h.digest('hex');
}

export const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.baby', '.tmp', '.cache', '.venv', '__pycache__',
  'dist', 'build', 'coverage', 'out', 'target', '.next', '.vite',
]);

export const TEXT_EXT = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.html',
  '.css', '.yml', '.yaml', '.csv', '.svg', '.env', '.sh', '.py', '.sql', '.xml',
]);

/** Caminhada determinística. Não segue symlinks (evita escapar da raiz). */
export async function walkFiles(root, { ignore = IGNORE_DIRS, maxFiles = 50000 } = {}) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch (err) {
      if (err.code === 'ENOENT' || err.code === 'EACCES') continue;
      throw err;
    }
    entries.sort((a, b) => (a.name < b.name ? -1 : 1));
    for (const e of entries) {
      const abs = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        if (!ignore.has(e.name)) stack.push(abs);
      } else if (e.isFile()) {
        out.push(abs);
        if (out.length >= maxFiles) return out.sort();
      }
    }
  }
  return out.sort();
}

export const relPosix = (root, abs) => path.relative(root, abs).split(path.sep).join('/');

export function fingerprint(files) {
  // files: [{path, hash}] -> impressão digital única do corpus inteiro
  const pairs = files.map((f) => [f.path, f.hash]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return hashObject(pairs);
}

export function tokenize(q) {
  return String(q || '')
    .toLowerCase()
    .split(/[^a-z0-9_áàâãéêíóôõúüç.-]+/i)
    .filter((t) => t.length >= 2);
}

export const shortId = (prefix) =>
  `${prefix}-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${Math.random().toString(36).slice(2, 7)}`;
