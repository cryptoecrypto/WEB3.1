// CRYPY SERVER v2.0 — BARRAMENTO DE COLABORAÇÃO.
// Cada mensagem tem autor assinado (HMAC por identidade). Sem a chave da identidade,
// ninguém consegue falar em nome dela: a Regra de Ouro é verificada, não declarada.
// O despacho local é executado pelo BABY; o slot de coordenação será do NEXUS
// quando (e somente quando) sua integração for comprovada.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { appendLine, ensureDir, nowIso, readLines, stableStringify } from './util.js';

export class BusError extends Error {
  constructor(message, code = 'BUS_DENIED') {
    super(message);
    this.name = 'BusError';
    this.code = code;
  }
}

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
};

export class Bus {
  constructor({ dir, registry, policy, audit = null }) {
    this.dir = dir;
    this.file = path.join(dir, 'messages.jsonl');
    this.masterFile = path.join(dir, 'master.key');
    this.registry = registry;
    this.policy = policy;
    this.audit = audit;
  }

  async init() {
    await ensureDir(this.dir);
    try {
      this.master = (await fsp.readFile(this.masterFile, 'utf8')).trim();
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      this.master = randomBytes(32).toString('hex');
      await fsp.writeFile(this.masterFile, this.master + '\n', { mode: 0o600 });
    }
    return this;
  }

  /** Chave exclusiva por identidade — nunca compartilhada entre inteligências. */
  keyFor(id) {
    return createHmac('sha256', this.master).update(`agent:${id}`).digest('hex');
  }

  #sign(msg) {
    const { sig, ...body } = msg;
    return createHmac('sha256', this.keyFor(msg.from)).update(stableStringify(body)).digest('hex');
  }

  async messages() {
    const lines = await readLines(this.file);
    return lines.map((l) => { try { return JSON.parse(l); } catch { return { corrupt: true, raw: l }; } });
  }

  /**
   * send({ from, key | approval, to, intent, payload })
   * Portões: identidade assinada -> capacidade declarada -> permissão concedida -> estado do destino.
   */
  async send({ from, key = null, approval = null, to, intent, payload = {} }) {
    const author = await this.registry.get(from);
    if (!author) throw new BusError(`identidade desconhecida: ${from}`, 'UNKNOWN_ID');
    const target = await this.registry.get(to);
    if (!target) throw new BusError(`destino desconhecido: ${to}`, 'UNKNOWN_TARGET');

    if (from === 'sensei' && approval) {
      const auth = this.policy.authorize({ task: 'bus.send', destructive: true, dryRun: false, approval });
      if (!auth.allowed) throw new BusError(`canal do Sensei exige token válido: ${auth.reason}`, 'APPROVAL_DENIED');
    } else if (!safeEqual(key || '', this.keyFor(from))) {
      if (this.audit) await this.audit.append({ action: 'bus.impersonation', target: from, ok: false, actor: 'desconhecido', detail: { to, intent } });
      throw new BusError(`assinatura inválida: ninguém assume a identidade de ${author.name} (Regra de Ouro)`, 'IMPERSONATION');
    }

    const can = await this.registry.assertCanOperate(from, intent);
    if (!can.allowed) {
      if (this.audit) await this.audit.append({ action: 'bus.denied', target: from, ok: false, actor: from, detail: { intent, reason: can.reason, code: can.code } });
      throw new BusError(can.reason, can.code);
    }

    const all = await this.messages();
    const msg = {
      seq: all.length + 1,
      id: `msg-${String(all.length + 1).padStart(5, '0')}`,
      ts: nowIso(), from, to, intent, payload,
      status: target.state === 'conectada' ? 'entregue' : 'aguardando-integracao',
    };
    msg.sig = this.#sign(msg);
    await appendLine(this.file, JSON.stringify(msg));
    if (this.audit) await this.audit.append({ action: 'bus.send', target: to, actor: from, detail: { id: msg.id, intent, status: msg.status } });
    return msg;
  }

  async inbox(id, { limit = 50 } = {}) {
    return (await this.messages()).filter((m) => m.to === id).slice(-limit).reverse();
  }

  async outbox(id, { limit = 50 } = {}) {
    return (await this.messages()).filter((m) => m.from === id).slice(-limit).reverse();
  }

  async verify() {
    const all = await this.messages();
    for (let i = 0; i < all.length; i++) {
      const m = all[i];
      if (m.corrupt) return { ok: false, count: all.length, brokenAt: i + 1, reason: 'mensagem ilegível' };
      if (m.seq !== i + 1) return { ok: false, count: all.length, brokenAt: m.seq, reason: 'sequência quebrada' };
      if (this.#sign(m) !== m.sig) return { ok: false, count: all.length, brokenAt: m.seq, reason: `assinatura inválida na mensagem ${m.id} (autor ${m.from})` };
    }
    return { ok: true, count: all.length, reason: all.length ? 'todas as assinaturas conferem' : 'barramento vazio' };
  }

  /**
   * Despacho determinístico por capacidade. Slot do NEXUS: hoje executado localmente
   * pelo BABY, sem fingir que o NEXUS já está integrado.
   */
  async dispatch(intent) {
    const agents = await this.registry.list();
    const candidates = [];
    for (const a of agents) {
      if (a.id === 'sensei') continue;
      const can = await this.registry.assertCanOperate(a.id, intent);
      if (can.allowed) candidates.push(a);
    }
    candidates.sort((a, b) => (a.origin === 'interna' ? -1 : 1) - (b.origin === 'interna' ? -1 : 1) || (a.id < b.id ? -1 : 1));
    const chosen = candidates[0] || null;
    const declaredButPending = agents.filter((a) => a.state !== 'conectada' && a.capabilities.includes(intent)).map((a) => a.id);
    return {
      intent, executor: chosen?.id || null,
      candidates: candidates.map((a) => a.id),
      aguardandoIntegracao: declaredButPending,
      coordenador: 'baby (local) — slot reservado ao NEXUS',
      reason: chosen ? `${chosen.name} declara capacidade e permissão e está conectada` : `nenhuma inteligência conectada pode executar '${intent}'`,
    };
  }
}
