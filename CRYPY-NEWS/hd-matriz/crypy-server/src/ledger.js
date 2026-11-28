// MODO REAL — máquina de estados das seis fases, com evidência obrigatória.
// É impossível "declarar vitória": cada avanço exige prova verificável no disco,
// e as duas últimas fases exigem aprovação humana e proteção comprovada.
import path from 'node:path';
import { CAPABILITIES } from './capabilities.js';
import { hashFile, nowIso, readJson, writeJsonAtomic } from './util.js';

export const STATES = ['planejada', 'documentada', 'implementada', 'testada', 'aprovada', 'protegida'];

export const REQUIREMENTS = {
  documentada: 'evidência kind="doc" apontando para documento existente',
  implementada: 'evidência kind="code" apontando para arquivo(s) existente(s)',
  testada: 'evidência kind="test" com log existente e meta {exitCode:0, failed:0, passed>0}',
  aprovada: 'aprovação explícita do Sensei {by, token} validada pela política',
  protegida: 'evidência kind="protection" + cofre íntegro + trilha de auditoria íntegra (verificados ao vivo)',
};

export class LedgerError extends Error {
  constructor(message, code = 'LEDGER_DENIED') {
    super(message);
    this.name = 'LedgerError';
    this.code = code;
  }
}

export class Ledger {
  constructor({ dir, projectRoot, policy, audit = null, vault = null }) {
    this.file = path.join(dir, 'ledger.json');
    this.projectRoot = projectRoot;
    this.policy = policy;
    this.audit = audit;
    this.vault = vault;
  }

  async init() {
    const existing = await readJson(this.file, null);
    if (existing) return this;
    const caps = {};
    for (const c of CAPABILITIES) {
      caps[c.id] = {
        ...c,
        state: 'planejada',
        evidence: [],
        history: [{ from: null, to: 'planejada', ts: nowIso(), by: 'system' }],
      };
    }
    await writeJsonAtomic(this.file, { version: 1, createdAt: nowIso(), states: STATES, capabilities: caps });
    return this;
  }

  async read() {
    return readJson(this.file, null);
  }

  async status() {
    const db = await this.read();
    return Object.values(db.capabilities).map((c) => ({
      id: c.id, title: c.title, key: c.key, state: c.state,
      stateIndex: STATES.indexOf(c.state),
      next: STATES[STATES.indexOf(c.state) + 1] || null,
      nextRequirement: REQUIREMENTS[STATES[STATES.indexOf(c.state) + 1]] || 'ciclo completo',
      evidenceCount: c.evidence.length,
      lastTransition: c.history[c.history.length - 1],
    }));
  }

  async #hashEvidence(ev) {
    const paths = Array.isArray(ev.paths) ? ev.paths : ev.path ? [ev.path] : [];
    if (!paths.length) throw new LedgerError('evidência sem arquivo: MODO REAL não aceita afirmação sem prova');
    const out = [];
    for (const p of paths) {
      const abs = path.resolve(this.projectRoot, p);
      let hash;
      try {
        hash = await hashFile(abs);
      } catch {
        throw new LedgerError(`evidência inexistente no disco: ${p}`);
      }
      out.push({ path: p, sha256: hash });
    }
    return out;
  }

  /**
   * advance(id, { to, evidence, approval })
   * Regras: sem pular estados; sem evidência não há avanço; aprovação e proteção são checadas ao vivo.
   */
  async advance(id, { to, evidence = null, approval = null }) {
    const db = await this.read();
    const cap = db.capabilities[id];
    if (!cap) throw new LedgerError(`capacidade desconhecida: ${id}`);
    const cur = STATES.indexOf(cap.state);
    const target = STATES.indexOf(to);
    if (target === -1) throw new LedgerError(`estado inválido: ${to}`);
    if (target !== cur + 1) {
      throw new LedgerError(`transição proibida: ${cap.state} -> ${to}. Próximo estado válido: ${STATES[cur + 1] || 'nenhum'}`, 'STATE_SKIP');
    }

    let proof = [];
    if (to === 'documentada' || to === 'implementada') {
      const kind = to === 'documentada' ? 'doc' : 'code';
      if (!evidence || evidence.kind !== kind) throw new LedgerError(`estado '${to}' exige ${REQUIREMENTS[to]}`);
      proof = await this.#hashEvidence(evidence);
    } else if (to === 'testada') {
      if (!evidence || evidence.kind !== 'test') throw new LedgerError(REQUIREMENTS.testada);
      const m = evidence.meta || {};
      if (m.exitCode !== 0 || m.failed !== 0 || !(m.passed > 0)) {
        throw new LedgerError(`teste não passou de verdade: ${JSON.stringify(m)}`, 'TEST_NOT_GREEN');
      }
      if (!m.command) throw new LedgerError('evidência de teste sem comando reexecutável');
      proof = await this.#hashEvidence(evidence);
    } else if (to === 'aprovada') {
      const auth = this.policy.authorize({ task: 'ledger.approve', destructive: true, dryRun: false, approval });
      if (!auth.allowed) throw new LedgerError(`aprovação negada: ${auth.reason}`, 'APPROVAL_DENIED');
    } else if (to === 'protegida') {
      if (!evidence || evidence.kind !== 'protection') throw new LedgerError(REQUIREMENTS.protegida);
      const manifestId = evidence.meta?.manifestId;
      if (!manifestId) throw new LedgerError('proteção sem manifestId do cofre');
      if (!this.vault) throw new LedgerError('cofre indisponível: não é possível comprovar proteção');
      const v = await this.vault.verify(manifestId);
      if (!v.ok) throw new LedgerError(`cofre não íntegro: ${v.reason}`, 'VAULT_BAD');
      const a = await this.audit.verify();
      if (!a.ok) throw new LedgerError(`trilha de auditoria não íntegra: ${a.reason}`, 'AUDIT_BAD');
      proof = await this.#hashEvidence(evidence);
      proof.push({ live: true, vault: { id: v.id, checked: v.checked, ok: v.ok }, audit: { count: a.count, ok: a.ok, head: a.head } });
    }

    const transition = {
      from: cap.state, to, ts: nowIso(),
      by: to === 'aprovada' ? approval.by : 'baby',
      evidence: proof,
      note: evidence?.note || null,
    };
    cap.state = to;
    if (proof.length) cap.evidence.push({ kind: evidence.kind, ts: transition.ts, files: proof.filter((p) => p.path), meta: evidence.meta || null });
    cap.history.push(transition);
    await writeJsonAtomic(this.file, db);
    if (this.audit) await this.audit.append({ action: 'ledger.advance', target: id, detail: { from: transition.from, to, by: transition.by, proof: proof.length } });
    return { ok: true, id, from: transition.from, to, proof };
  }
}
