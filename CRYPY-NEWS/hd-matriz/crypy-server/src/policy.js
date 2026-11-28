// CAPACIDADE 3 — Autonomia operacional COM permissões controladas.
// Regras: jail de raízes, modo read/readwrite por raiz, ops destrutivas exigem aprovação do Sensei.
import fsp from 'node:fs/promises';
import path from 'node:path';

export class PolicyError extends Error {
  constructor(message, code = 'POLICY_DENIED') {
    super(message);
    this.name = 'PolicyError';
    this.code = code;
  }
}

async function realpathDeepest(abs) {
  // realpath do ancestral existente mais profundo (alvo pode ainda não existir)
  let cur = abs;
  const tail = [];
  for (;;) {
    try {
      const real = await fsp.realpath(cur);
      return path.join(real, ...tail.reverse());
    } catch (err) {
      if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') throw err;
      const parent = path.dirname(cur);
      if (parent === cur) return abs;
      tail.push(path.basename(cur));
      cur = parent;
    }
  }
}

export class Policy {
  /** roots: [{ path, mode: 'read'|'readwrite', label }] */
  constructor({ roots = [], approvalToken = null, allowedTasks = null }) {
    this.roots = roots.map((r) => ({ ...r, path: path.resolve(r.path) }));
    this.approvalToken = approvalToken;
    this.allowedTasks = allowedTasks; // null = todas as tarefas registradas
  }

  async describe() {
    const out = [];
    for (const r of this.roots) out.push({ ...r, real: await realpathDeepest(r.path) });
    return out;
  }

  rootFor(realAbs) {
    // raiz mais específica (mais profunda) vence — permite dataDir readwrite dentro de projectRoot read
    const matches = this.roots.filter((r) => realAbs === r.path || realAbs.startsWith(r.path + path.sep));
    matches.sort((a, b) => b.path.length - a.path.length);
    return matches[0] || null;
  }

  /** Resolve um caminho e prova que está dentro de uma raiz com o modo exigido. */
  async resolve(target, mode = 'read') {
    if (typeof target !== 'string' || target.includes('\0')) throw new PolicyError('caminho inválido');
    const abs = path.resolve(target);
    const real = await realpathDeepest(abs);
    const root = this.rootFor(real);
    if (!root) throw new PolicyError(`fora das raízes autorizadas: ${real}`, 'OUT_OF_ROOT');
    if (mode === 'write' && root.mode !== 'readwrite') {
      throw new PolicyError(`raiz '${root.label || root.path}' é somente leitura`, 'READ_ONLY_ROOT');
    }
    return { abs: real, root };
  }

  /** Autorização de tarefa. Destrutivo + efetivo => exige token de aprovação. */
  authorize({ task, destructive = false, dryRun = true, approval = null }) {
    if (this.allowedTasks && !this.allowedTasks.includes(task)) {
      return { allowed: false, reason: `tarefa '${task}' não está na lista permitida` };
    }
    if (destructive && !dryRun) {
      const token = approval && approval.token;
      if (!this.approvalToken || token !== this.approvalToken) {
        return { allowed: false, reason: 'operação destrutiva exige aprovação do Sensei (token)', requiresApproval: true };
      }
      if (!approval.by) return { allowed: false, reason: 'aprovação sem autor identificado', requiresApproval: true };
      return { allowed: true, reason: `aprovado por ${approval.by}`, approvedBy: approval.by };
    }
    return { allowed: true, reason: dryRun ? 'permitido (simulação/dry-run)' : 'permitido (não destrutivo)' };
  }
}
