// CAPACIDADE 4 — Autoproteção: trilha de auditoria append-only encadeada por hash.
// Cada registro referencia o hash anterior; uma âncora externa (audit.head) detecta truncamento.
import path from 'node:path';
import { appendLine, ensureDir, hashObject, nowIso, readJson, readLines, writeJsonAtomic } from './util.js';

const GENESIS = '0'.repeat(64);

export class AuditLog {
  constructor({ dir, actor = 'baby' }) {
    this.dir = dir;
    this.file = path.join(dir, 'audit.jsonl');
    this.anchor = path.join(dir, 'audit.head');
    this.actor = actor;
  }

  async init() {
    await ensureDir(this.dir);
    const head = await readJson(this.anchor, null);
    if (!head) await writeJsonAtomic(this.anchor, { seq: 0, hash: GENESIS });
    return this;
  }

  async head() {
    return (await readJson(this.anchor, null)) || { seq: 0, hash: GENESIS };
  }

  async append({ action, target = null, detail = {}, actor = this.actor, ok = true }) {
    const prev = await this.head();
    const record = {
      seq: prev.seq + 1,
      ts: nowIso(),
      actor,
      action,
      target,
      ok,
      detail,
      prev: prev.hash,
    };
    record.hash = hashObject(record);
    await appendLine(this.file, JSON.stringify(record));
    await writeJsonAtomic(this.anchor, { seq: record.seq, hash: record.hash });
    return record;
  }

  async entries() {
    const lines = await readLines(this.file);
    return lines.map((l, i) => {
      try {
        return JSON.parse(l);
      } catch {
        return { seq: i + 1, corrupt: true, raw: l };
      }
    });
  }

  /** Verificação real: sequência, encadeamento, hash de cada registro e âncora final. */
  async verify() {
    const entries = await this.entries();
    const anchor = await this.head();
    let prev = GENESIS;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (e.corrupt) return { ok: false, count: entries.length, brokenAt: i + 1, reason: 'registro ilegível (JSON inválido)' };
      if (e.seq !== i + 1) return { ok: false, count: entries.length, brokenAt: e.seq, reason: `sequência quebrada: esperado ${i + 1}` };
      if (e.prev !== prev) return { ok: false, count: entries.length, brokenAt: e.seq, reason: 'encadeamento quebrado (prev não confere)' };
      const { hash, ...body } = e;
      if (hashObject(body) !== hash) return { ok: false, count: entries.length, brokenAt: e.seq, reason: 'hash não confere: conteúdo adulterado' };
      prev = hash;
    }
    if (entries.length === 0 && anchor.seq === 0) {
      return { ok: true, count: 0, head: GENESIS, reason: 'trilha vazia (gênese)' };
    }
    if (anchor.seq !== entries.length || anchor.hash !== prev) {
      return {
        ok: false,
        count: entries.length,
        brokenAt: entries.length,
        reason: 'âncora divergente: registros removidos/truncados ou âncora adulterada',
      };
    }
    return { ok: true, count: entries.length, head: prev, reason: 'cadeia íntegra' };
  }
}
