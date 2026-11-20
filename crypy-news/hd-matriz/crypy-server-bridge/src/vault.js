// CAPACIDADE 4 — Autoproteção: cofre content-addressed (dedupe por SHA-256),
// manifestos versionados, verificação de integridade e restauração controlada.
import fsp from 'node:fs/promises';
import path from 'node:path';
import { ensureDir, fingerprint, hashFile, nowIso, readJson, relPosix, shortId, walkFiles, writeJsonAtomic } from './util.js';

export class Vault {
  constructor({ dir, policy, audit = null }) {
    this.dir = dir;
    this.objects = path.join(dir, 'objects');
    this.manifestDir = path.join(dir, 'manifests');
    this.policy = policy;
    this.audit = audit;
  }

  async init() {
    await ensureDir(this.objects);
    await ensureDir(this.manifestDir);
    return this;
  }

  objectPath(hash) {
    return path.join(this.objects, hash.slice(0, 2), hash);
  }

  async manifests() {
    let names = [];
    try {
      names = await fsp.readdir(this.manifestDir);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
    const out = [];
    for (const n of names.filter((n) => n.endsWith('.json'))) {
      const m = await readJson(path.join(this.manifestDir, n), null);
      if (m) out.push({ id: m.id, ts: m.ts, label: m.label, root: m.root, fileCount: m.files.length, rootHash: m.rootHash, stats: m.stats });
    }
    return out.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  }

  async manifest(id) {
    return readJson(path.join(this.manifestDir, `${id}.json`), null);
  }

  async latest() {
    const list = await this.manifests();
    return list.length ? this.manifest(list[0].id) : null;
  }

  /** Snapshot aditivo (não destrutivo): copia só os blobs inéditos. */
  async snapshot({ root, label = 'snapshot' }) {
    const { abs } = await this.policy.resolve(root, 'read');
    const paths = await walkFiles(abs);
    const files = [];
    let newObjects = 0;
    let newBytes = 0;
    let dedupBytes = 0;
    for (const p of paths) {
      const st = await fsp.stat(p);
      const hash = await hashFile(p);
      const obj = this.objectPath(hash);
      let exists = true;
      try { await fsp.access(obj); } catch { exists = false; }
      if (!exists) {
        await ensureDir(path.dirname(obj));
        await fsp.copyFile(p, obj);
        newObjects++;
        newBytes += st.size;
      } else {
        dedupBytes += st.size;
      }
      files.push({ path: relPosix(abs, p), size: st.size, hash });
    }
    const m = {
      id: shortId('snap'),
      ts: nowIso(),
      label,
      root: abs,
      rootHash: fingerprint(files),
      files,
      stats: { objects: newObjects, newBytes, dedupBytes, fileCount: files.length },
    };
    await writeJsonAtomic(path.join(this.manifestDir, `${m.id}.json`), m);
    if (this.audit) await this.audit.append({ action: 'vault.snapshot', target: abs, detail: { id: m.id, rootHash: m.rootHash, ...m.stats } });
    return { ...m, files: undefined };
  }

  /** Verificação byte a byte: objeto existe? hash confere? manifesto é autoconsistente? */
  async verify(id = null, { quiet = false } = {}) {
    const m = id ? await this.manifest(id) : await this.latest();
    if (!m) return { ok: false, reason: 'nenhum manifesto no cofre' };
    const missing = [];
    const corrupt = [];
    for (const f of m.files) {
      const obj = this.objectPath(f.hash);
      try {
        await fsp.access(obj);
      } catch {
        missing.push(f.path);
        continue;
      }
      const actual = await hashFile(obj);
      if (actual !== f.hash) corrupt.push({ path: f.path, expected: f.hash, actual });
    }
    const rootHashOk = fingerprint(m.files) === m.rootHash;
    const ok = missing.length === 0 && corrupt.length === 0 && rootHashOk;
    const result = {
      ok, id: m.id, checked: m.files.length, missing, corrupt, rootHashOk,
      reason: ok ? 'cofre íntegro' : `falhas: ${missing.length} ausentes, ${corrupt.length} corrompidos, rootHash ${rootHashOk ? 'ok' : 'divergente'}`,
    };
    if (this.audit && !quiet) await this.audit.append({ action: 'vault.verify', target: m.id, ok, detail: { checked: result.checked, missing: missing.length, corrupt: corrupt.length, rootHashOk } });
    return result;
  }

  /** Restauração é destrutiva: dry-run por padrão, execução exige aprovação. */
  async restore(id, { dest, approval = null, dryRun = true, only = null }) {
    const m = await this.manifest(id);
    if (!m) throw new Error(`manifesto inexistente: ${id}`);
    const auth = this.policy.authorize({ task: 'vault.restore', destructive: true, dryRun, approval });
    if (!auth.allowed) return { ok: false, denied: true, reason: auth.reason, dryRun };
    const { abs } = await this.policy.resolve(dest, 'write');
    const selected = only ? m.files.filter((f) => only.includes(f.path)) : m.files;
    const plan = [];
    for (const f of selected) {
      const target = await this.policy.resolve(path.join(abs, f.path), 'write');
      plan.push({ from: this.objectPath(f.hash), to: target.abs, path: f.path, hash: f.hash, size: f.size });
    }
    if (dryRun) return { ok: true, dryRun: true, id, dest: abs, planned: plan.length, plan: plan.map((p) => ({ path: p.path, size: p.size })) };

    const pre = await this.verify(id);
    if (!pre.ok) return { ok: false, reason: `cofre não íntegro antes de restaurar: ${pre.reason}` };
    const restored = [];
    for (const p of plan) {
      await ensureDir(path.dirname(p.to));
      await fsp.copyFile(p.from, p.to);
      const actual = await hashFile(p.to);
      if (actual !== p.hash) throw new Error(`restauração corrompida em ${p.path}`);
      restored.push(p.path);
    }
    if (this.audit) await this.audit.append({ action: 'vault.restore', target: abs, detail: { id, restored: restored.length, approvedBy: auth.approvedBy } });
    return { ok: true, dryRun: false, id, dest: abs, restored: restored.length, verified: true, approvedBy: auth.approvedBy };
  }
}
