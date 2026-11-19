// BABY — o orquestrador. Um único caminho para qualquer ação:
// planejar -> autorizar (política) -> proteger (se destrutivo) -> executar -> verificar -> registrar.
import path from 'node:path';
import { AuditLog } from './audit.js';
import { Bus } from './bus.js';
import { CAPABILITIES, PRINCIPLE } from './capabilities.js';
import { loadConfig } from './config.js';
import { Ledger } from './ledger.js';
import { Memory } from './memory.js';
import { Policy } from './policy.js';
import { Registry } from './registry.js';
import { TASKS, taskList } from './tasks.js';
import { ensureDir, hashObject, nowIso } from './util.js';
import { Vault } from './vault.js';

export const VERSION = '0.1.0';

export async function createBaby(overrides = {}) {
  const config = loadConfig(overrides);
  await ensureDir(config.dataDir);
  await ensureDir(config.evidenceDir);
  await ensureDir(config.sandboxDir);

  const policy = new Policy({ roots: config.roots, approvalToken: config.approvalToken });
  const audit = await new AuditLog({ dir: path.join(config.dataDir, 'audit') }).init();
  const memory = await new Memory({ dir: path.join(config.dataDir, 'memory'), policy, audit }).init();
  const vault = await new Vault({ dir: path.join(config.dataDir, 'vault'), policy, audit }).init();
  const ledger = await new Ledger({ dir: config.dataDir, projectRoot: config.projectRoot, policy, audit, vault }).init();
  const registry = await new Registry({ dir: config.dataDir, projectRoot: config.projectRoot, policy, audit }).init();
  const bus = await new Bus({ dir: path.join(config.dataDir, 'bus'), registry, policy, audit }).init();

  const ctx = { config, policy, audit, memory, vault, ledger, registry, bus };
  const startedAt = nowIso();

  async function run(taskId, opts = {}) {
    const task = TASKS[taskId];
    if (!task) {
      await audit.append({ action: 'task.unknown', target: taskId, ok: false, detail: {} });
      return { ok: false, taskId, reason: `tarefa não registrada: ${taskId}` };
    }
    const dryRun = opts.dryRun !== false; // MODO REAL: padrão é simular
    const auth = policy.authorize({ task: taskId, destructive: task.destructive, dryRun, approval: opts.approval || null });
    if (!auth.allowed) {
      await audit.append({ action: 'task.denied', target: taskId, ok: false, detail: { reason: auth.reason, dryRun } });
      return { ok: false, denied: true, taskId, reason: auth.reason, requiresApproval: !!auth.requiresApproval };
    }
    const start = await audit.append({ action: 'task.start', target: taskId, detail: { dryRun, capability: task.capability, authorized: auth.reason } });

    let protection = null;
    if (task.destructive && !dryRun && opts.autoProtect !== false) {
      const snap = await vault.snapshot({ root: config.targetRoot, label: `pre-${taskId}` });
      protection = snap.id;
    }

    try {
      const result = await task.run(ctx, { ...opts, dryRun });
      const end = await audit.append({
        action: 'task.end', target: taskId, ok: result.ok,
        detail: { summary: result.summary, dryRun, resultHash: hashObject(result.data ?? null), protection },
      });
      return { ok: result.ok, taskId, dryRun, capability: task.capability, summary: result.summary, data: result.data, protection, audit: { start: start.seq, end: end.seq } };
    } catch (err) {
      await audit.append({ action: 'task.error', target: taskId, ok: false, detail: { message: err.message, code: err.code || null, dryRun } });
      return { ok: false, taskId, error: err.message, code: err.code || 'TASK_ERROR', audit: { start: start.seq } };
    }
  }

  async function status() {
    const [ledgerStatus, auditV, idx, roots, squadron, busV] = await Promise.all([
      ledger.status(), audit.verify(), memory.latest(), policy.describe(), registry.list(), bus.verify(),
    ]);
    const latestManifest = await vault.latest();
    const vaultV = latestManifest ? await vault.verify(latestManifest.id, { quiet: true }) : { ok: false, reason: 'cofre vazio' };
    return {
      version: VERSION, startedAt, now: nowIso(), principle: PRINCIPLE,
      capabilities: ledgerStatus,
      definitions: CAPABILITIES,
      live: {
        audit: auditV,
        vault: vaultV,
        memory: idx ? { indexId: idx.indexId, ts: idx.ts, root: idx.root, fileCount: idx.fileCount, rootHash: idx.rootHash, totalBytes: idx.totalBytes } : null,
      },
      squadron, bus: busV, goldenRule: 'Uma inteligência pode colaborar com outra, mas nenhuma assume a identidade ou as permissões da outra.',
      roots, adapters: config.adapters, tasks: taskList(),
      paths: { projectRoot: config.projectRoot, dataDir: config.dataDir, targetRoot: config.targetRoot, sandboxDir: config.sandboxDir, evidenceDir: config.evidenceDir },
    };
  }

  return { ...ctx, run, status, version: VERSION, startedAt, taskList };
}
