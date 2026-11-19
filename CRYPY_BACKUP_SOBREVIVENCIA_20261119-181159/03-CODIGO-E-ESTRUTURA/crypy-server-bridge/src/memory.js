// CAPACIDADE 1 — Inteligência e memória: inventário, impressão digital, histórico,
// busca textual e mapa de relações entre módulos. Nada de "achismo": tudo vem do disco.
import fsp from 'node:fs/promises';
import path from 'node:path';
import {
  TEXT_EXT, appendLine, ensureDir, fingerprint, hashFile, nowIso, readJson,
  relPosix, shortId, tokenize, walkFiles, writeJsonAtomic,
} from './util.js';

const MAX_CONTENT_BYTES = 512 * 1024;

export class Memory {
  constructor({ dir, policy, audit = null }) {
    this.dir = dir;
    this.policy = policy;
    this.audit = audit;
    this.indexFile = path.join(dir, 'index.json');
    this.historyFile = path.join(dir, 'history.jsonl');
  }

  async init() {
    await ensureDir(this.dir);
    return this;
  }

  async latest() {
    return readJson(this.indexFile, null);
  }

  /** Indexa uma raiz autorizada e calcula o diff real contra o índice anterior. */
  async index({ root, label = 'corpus' }) {
    const { abs } = await this.policy.resolve(root, 'read');
    const prev = await this.latest();
    const abs_files = await walkFiles(abs);
    const files = [];
    for (const f of abs_files) {
      const st = await fsp.stat(f);
      files.push({
        path: relPosix(abs, f),
        size: st.size,
        mtimeMs: Math.round(st.mtimeMs),
        ext: path.extname(f).toLowerCase(),
        hash: await hashFile(f),
      });
    }
    const rootHash = fingerprint(files);
    const prevMap = new Map((prev?.files || []).map((f) => [f.path, f.hash]));
    const curMap = new Map(files.map((f) => [f.path, f.hash]));
    const added = files.filter((f) => !prevMap.has(f.path)).map((f) => f.path);
    const changed = files.filter((f) => prevMap.has(f.path) && prevMap.get(f.path) !== f.hash).map((f) => f.path);
    const removed = [...prevMap.keys()].filter((p) => !curMap.has(p));
    const unchanged = files.length - added.length - changed.length;

    const record = {
      indexId: shortId('idx'),
      ts: nowIso(),
      label,
      root: abs,
      rootHash,
      fileCount: files.length,
      totalBytes: files.reduce((s, f) => s + f.size, 0),
      files,
    };
    const sameCorpus = prev && prev.root === abs;
    const diff = sameCorpus
      ? { added, changed, removed, unchanged }
      : { added: files.map((f) => f.path), changed: [], removed: [], unchanged: 0, note: 'raiz diferente do índice anterior' };

    await writeJsonAtomic(this.indexFile, record);
    await appendLine(this.historyFile, JSON.stringify({
      indexId: record.indexId, ts: record.ts, root: abs, rootHash, fileCount: record.fileCount,
      added: diff.added.length, changed: diff.changed.length, removed: diff.removed.length,
    }));
    if (this.audit) {
      await this.audit.append({
        action: 'memory.index', target: abs,
        detail: { indexId: record.indexId, rootHash, fileCount: record.fileCount, added: diff.added.length, changed: diff.changed.length, removed: diff.removed.length },
      });
    }
    return { ...record, files: undefined, diff };
  }

  /** Busca real por nome de arquivo e conteúdo (arquivos texto até 512 KB). */
  async search(query, { limit = 10, content = true } = {}) {
    const idx = await this.latest();
    if (!idx) return { query, hits: [], searched: 0, note: 'memória vazia: rode memory.index primeiro' };
    const tokens = tokenize(query);
    if (!tokens.length) return { query, hits: [], searched: 0 };
    const hits = [];
    let searched = 0;
    for (const f of idx.files) {
      const lowerPath = f.path.toLowerCase();
      const base = path.basename(lowerPath);
      let score = 0;
      let snippet = null;
      for (const t of tokens) {
        if (base.includes(t)) score += 5;
        else if (lowerPath.includes(t)) score += 2;
      }
      if (content && TEXT_EXT.has(f.ext) && f.size <= MAX_CONTENT_BYTES) {
        searched++;
        let txt = '';
        try {
          txt = await fsp.readFile(path.join(idx.root, f.path), 'utf8');
        } catch { /* arquivo pode ter sumido; índice é a fonte do diff */ }
        const low = txt.toLowerCase();
        for (const t of tokens) {
          let i = low.indexOf(t);
          let n = 0;
          while (i !== -1 && n < 20) { n++; i = low.indexOf(t, i + t.length); }
          if (n) {
            score += n;
            if (!snippet) {
              const line = txt.split('\n').find((l) => l.toLowerCase().includes(t)) || '';
              snippet = line.trim().slice(0, 180);
            }
          }
        }
      }
      if (score > 0) hits.push({ path: f.path, score, size: f.size, hash: f.hash.slice(0, 12), snippet });
    }
    hits.sort((a, b) => b.score - a.score || (a.path < b.path ? -1 : 1));
    return { query, tokens, searched, total: hits.length, hits: hits.slice(0, limit) };
  }

  /** Relações: imports/require em JS e <script src> em HTML -> grafo verificável. */
  async relations() {
    const idx = await this.latest();
    if (!idx) return { nodes: [], edges: [], note: 'memória vazia' };
    const known = new Set(idx.files.map((f) => f.path));
    const edges = [];
    const unresolved = [];
    const candidates = ['.js', '.mjs', '.cjs', '/index.js', '.json'];
    for (const f of idx.files) {
      if (!['.js', '.mjs', '.cjs', '.html', '.htm'].includes(f.ext)) continue;
      let txt = '';
      try {
        txt = await fsp.readFile(path.join(idx.root, f.path), 'utf8');
      } catch { continue; }
      const specs = new Set();
      if (f.ext === '.html' || f.ext === '.htm') {
        for (const m of txt.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) specs.add(m[1]);
        for (const m of txt.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)) specs.add(m[1]);
      } else {
        for (const m of txt.matchAll(/\bfrom\s+["']([^"']+)["']/g)) specs.add(m[1]);
        for (const m of txt.matchAll(/\brequire\(\s*["']([^"']+)["']\s*\)/g)) specs.add(m[1]);
        for (const m of txt.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)) specs.add(m[1]);
      }
      for (const spec of specs) {
        if (!spec.startsWith('.') && !spec.startsWith('/')) continue; // pacotes externos
        const baseDir = path.posix.dirname(f.path);
        let target = path.posix.normalize(path.posix.join(baseDir, spec));
        if (target.startsWith('./')) target = target.slice(2);
        let resolved = known.has(target) ? target : null;
        if (!resolved) for (const c of candidates) if (known.has(target + c)) { resolved = target + c; break; }
        if (resolved) edges.push({ from: f.path, to: resolved, spec });
        else unresolved.push({ from: f.path, spec });
      }
    }
    const nodes = [...new Set(edges.flatMap((e) => [e.from, e.to]))].sort();
    return { nodes, edges, unresolved, generatedAt: nowIso(), indexId: idx.indexId };
  }

  async history({ limit = 20 } = {}) {
    const { readLines } = await import('./util.js');
    const lines = await readLines(this.historyFile);
    return lines.slice(-limit).map((l) => JSON.parse(l)).reverse();
  }
}
