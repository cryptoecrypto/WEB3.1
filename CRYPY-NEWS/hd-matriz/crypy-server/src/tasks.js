// CAPACIDADES 3 e 5 — tarefas operacionais reais e autoanálise do próprio ambiente.
// Toda tarefa é determinística, auditável e passa pela política antes de tocar o disco.
import fsp from 'node:fs/promises';
import path from 'node:path';
import { CAPABILITIES } from './capabilities.js';
import { ensureDir, fingerprint, hashFile, nowIso, relPosix, shortId, walkFiles } from './util.js';

const CATEGORIES = {
  code: ['.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx', '.py', '.sh', '.html', '.css'],
  docs: ['.md', '.txt', '.pdf', '.docx', '.pptx', '.rtf'],
  images: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'],
  data: ['.json', '.csv', '.xlsx', '.db', '.sqlite', '.jsonl', '.xml', '.yml', '.yaml'],
  audio: ['.mp3', '.wav', '.ogg', '.flac', '.m4a'],
  video: ['.mp4', '.mov', '.webm', '.mkv'],
};

const categoryOf = (ext) => Object.keys(CATEGORIES).find((k) => CATEGORIES[k].includes(ext)) || 'other';

export const TASKS = {
  'memory.index': {
    capability: 'C1', destructive: false,
    description: 'Inventaria a raiz autorizada, calcula SHA-256 por arquivo e o diff real.',
    async run(ctx, opts) {
      const r = await ctx.memory.index({ root: opts.root || ctx.config.targetRoot, label: opts.label || 'corpus' });
      return { ok: true, summary: `${r.fileCount} arquivos, fingerprint ${r.rootHash.slice(0, 12)} (+${r.diff.added.length} ~${r.diff.changed.length} -${r.diff.removed.length})`, data: r };
    },
  },

  'memory.index-matriz': {
    capability: 'C1', destructive: false,
    description: 'Indexa a HD MATRIZ inteira em modo somente leitura, com hashes e diff.',
    async run(ctx, opts) {
      const r = await ctx.memory.index({ root: opts.root || ctx.config.matrixRoot, label: opts.label || 'hd-matriz' });
      return { ok: true, summary: `HD MATRIZ: ${r.fileCount} arquivos, fingerprint ${r.rootHash.slice(0, 12)} (+${r.diff.added.length} ~${r.diff.changed.length} -${r.diff.removed.length})`, data: r };
    },
  },

  'memory.relations': {
    capability: 'C1', destructive: false,
    description: 'Extrai o grafo de dependências entre módulos (import/require/script src).',
    async run(ctx) {
      const g = await ctx.memory.relations();
      return { ok: true, summary: `${g.nodes.length} nós, ${g.edges.length} arestas, ${g.unresolved.length} não resolvidos`, data: g };
    },
  },

  'vault.snapshot': {
    capability: 'C4', destructive: false,
    description: 'Backup aditivo com dedupe por conteúdo e manifesto versionado.',
    async run(ctx, opts) {
      const m = await ctx.vault.snapshot({ root: opts.root || ctx.config.targetRoot, label: opts.label || 'manual' });
      return { ok: true, summary: `${m.id}: ${m.stats.fileCount} arquivos, ${m.stats.objects} blobs novos, ${m.stats.dedupBytes} B deduplicados`, data: m };
    },
  },

  'vault.verify': {
    capability: 'C4', destructive: false,
    description: 'Re-hash de todos os blobs do manifesto + consistência do rootHash.',
    async run(ctx, opts) {
      const v = await ctx.vault.verify(opts.manifestId || null);
      return { ok: v.ok, summary: v.reason, data: v };
    },
  },

  'vault.restore': {
    capability: 'C4', destructive: true,
    description: 'Restaura versões do cofre (dry-run por padrão; execução exige aprovação).',
    async run(ctx, opts) {
      const id = opts.manifestId || (await ctx.vault.latest())?.id;
      if (!id) return { ok: false, summary: 'cofre vazio', data: null };
      const r = await ctx.vault.restore(id, {
        dest: opts.dest || ctx.config.sandboxDir,
        approval: opts.approval || null,
        dryRun: opts.dryRun !== false,
        only: opts.only || null,
      });
      return { ok: r.ok, summary: r.denied ? r.reason : (r.dryRun ? `${r.planned} arquivos planejados (simulação)` : `${r.restored} arquivos restaurados e verificados`), data: r };
    },
  },

  'audit.verify': {
    capability: 'C4', destructive: false,
    description: 'Verifica sequência, encadeamento de hashes e âncora da trilha.',
    async run(ctx) {
      const a = await ctx.audit.verify();
      return { ok: a.ok, summary: `${a.count} registros — ${a.reason}`, data: a };
    },
  },

  'integrity.check': {
    capability: 'C4', destructive: false,
    description: 'Compara o estado atual do corpus com o último manifesto (detecta deriva).',
    async run(ctx, opts) {
      const root = path.resolve(opts.root || ctx.config.targetRoot);
      const m = await ctx.vault.latest();
      const paths = await walkFiles(root);
      const files = [];
      for (const p of paths) {
        const st = await fsp.stat(p);
        files.push({ path: relPosix(root, p), size: st.size, hash: await hashFile(p) });
      }
      const currentHash = fingerprint(files);
      if (!m) return { ok: true, summary: 'sem manifesto de referência ainda', data: { baseline: null, currentHash, fileCount: files.length } };
      const base = new Map(m.files.map((f) => [f.path, f.hash]));
      const cur = new Map(files.map((f) => [f.path, f.hash]));
      const added = [...cur.keys()].filter((p) => !base.has(p));
      const removed = [...base.keys()].filter((p) => !cur.has(p));
      const changed = [...cur.keys()].filter((p) => base.has(p) && base.get(p) !== cur.get(p));
      const drift = added.length + removed.length + changed.length > 0;
      const data = { baseline: m.id, baselineRoot: m.root, currentHash, baselineHash: m.rootHash, drift, added, removed, changed };
      return { ok: true, summary: drift ? `deriva detectada: +${added.length} ~${changed.length} -${removed.length}` : 'corpus idêntico ao último backup', data };
    },
  },

  'files.organize': {
    capability: 'C3', destructive: true,
    description: 'Organiza arquivos por tipo dentro de uma raiz gravável (sandbox). Simulação por padrão.',
    async run(ctx, opts) {
      const dir = path.resolve(opts.dir || ctx.config.sandboxDir);
      const dryRun = opts.dryRun !== false;
      const { abs } = await ctx.policy.resolve(dir, 'write');
      const entries = await fsp.readdir(abs, { withFileTypes: true });
      const plan = [];
      const conflicts = [];
      for (const e of entries) {
        if (!e.isFile()) continue;
        const cat = categoryOf(path.extname(e.name).toLowerCase());
        const to = path.join(abs, cat, e.name);
        try { await fsp.access(to); conflicts.push(e.name); continue; } catch { /* livre */ }
        plan.push({ from: path.join(abs, e.name), to, name: e.name, category: cat });
      }
      if (dryRun || plan.length === 0) {
        return { ok: true, summary: `${plan.length} movimentos planejados (simulação), ${conflicts.length} conflitos`, data: { dryRun: true, dir: abs, plan: plan.map((p) => ({ name: p.name, category: p.category })), conflicts } };
      }
      const moved = [];
      for (const p of plan) {
        const src = await ctx.policy.resolve(p.from, 'write');
        const dst = await ctx.policy.resolve(p.to, 'write');
        const before = await hashFile(src.abs);
        await ensureDir(path.dirname(dst.abs));
        await fsp.rename(src.abs, dst.abs);
        const after = await hashFile(dst.abs);
        if (before !== after) throw new Error(`conteúdo alterado na movimentação: ${p.name}`);
        moved.push({ name: p.name, category: p.category, hash: after });
      }
      return { ok: true, summary: `${moved.length} arquivos movidos com hash verificado`, data: { dryRun: false, dir: abs, moved, conflicts } };
    },
  },

  'registry.status': {
    capability: 'C2', destructive: false,
    description: 'Registro Central de Inteligências: identidade, função, permissões e estado real.',
    async run(ctx) {
      const agents = await ctx.registry.list();
      const por = (s) => agents.filter((a) => a.state === s).length;
      return { ok: true, summary: `${agents.length} identidades — ${por('conectada')} conectadas, ${por('pendente')} pendentes, ${por('desconectada')} desconectadas`, data: { agents, goldenRule: (await ctx.registry.read()).goldenRule } };
    },
  },

  'bus.verify': {
    capability: 'C2', destructive: false,
    description: 'Verifica a assinatura de cada mensagem do barramento (anti-impostor).',
    async run(ctx) {
      const v = await ctx.bus.verify();
      return { ok: v.ok, summary: `${v.count} mensagens — ${v.reason}`, data: v };
    },
  },

  'squadron.check': {
    capability: 'C2', destructive: false,
    description: 'Sonda ao vivo cada integração declarada. Não promove ninguém sem resposta real.',
    async run(ctx) {
      const agents = await ctx.registry.list();
      const results = [];
      for (const a of agents) {
        if (!a.integration) { results.push({ id: a.id, state: a.state, probe: null, note: 'sem integração declarada — presença documentada apenas' }); continue; }
        const probe = await ctx.registry.probe(a.integration);
        results.push({ id: a.id, name: a.name, state: a.state, ok: probe.ok, probe });
      }
      const degradados = results.filter((r) => r.state === 'conectada' && r.probe && !r.probe.ok).map((r) => r.id);
      return {
        ok: degradados.length === 0,
        summary: degradados.length ? `integrações degradadas: ${degradados.join(', ')}` : `${results.filter((r) => r.probe?.ok).length} integrações respondendo; ${results.filter((r) => !r.probe).length} identidades só documentadas`,
        data: { results, degradados },
      };
    },
  },

  'self.review': {
    capability: 'C5', destructive: false,
    description: 'Autoanálise do ambiente: cobertura de testes, dívidas, próximos passos por capacidade.',
    async run(ctx) {
      const srcDir = path.join(ctx.config.projectRoot, 'src');
      const testDir = path.join(ctx.config.projectRoot, 'test');
      const modules = (await fsp.readdir(srcDir)).filter((f) => f.endsWith('.js')).sort();
      let tests = [];
      try { tests = await fsp.readdir(testDir); } catch { tests = []; }
      const rows = [];
      const proposals = [];
      let todos = 0;
      for (const m of modules) {
        const txt = await fsp.readFile(path.join(srcDir, m), 'utf8');
        const lines = txt.split('\n').length;
        const t = (txt.match(/TODO|FIXME|XXX/g) || []).length;
        todos += t;
        const testFile = `${m.replace(/\.js$/, '')}.test.js`;
        const covered = tests.includes(testFile);
        rows.push({ module: m, lines, todos: t, test: covered ? testFile : null });
        if (!covered) proposals.push({ kind: 'teste-ausente', target: `src/${m}`, action: `criar test/${testFile}` });
        if (lines > 350) proposals.push({ kind: 'modulo-grande', target: `src/${m}`, action: `avaliar divisão (${lines} linhas)` });
        if (t > 0) proposals.push({ kind: 'divida-marcada', target: `src/${m}`, action: `resolver ${t} marcador(es) TODO/FIXME` });
      }
      const ledger = await ctx.ledger.status();
      for (const c of ledger) {
        if (c.next) proposals.push({ kind: 'modo-real', target: `${c.id} ${c.title}`, action: `avançar para '${c.next}': ${c.nextRequirement}` });
      }
      const id = shortId('review');
      const file = path.join(ctx.config.evidenceDir, `${id}.md`);
      await ctx.policy.resolve(file, 'write');
      const md = [
        `# Autoanálise BABY — ${id}`,
        '', `Gerado em ${nowIso()} por \`self.review\` (determinístico, sem LLM).`, '',
        '## Cobertura de módulos', '',
        '| módulo | linhas | TODO/FIXME | teste |', '|---|---|---|---|',
        ...rows.map((r) => `| src/${r.module} | ${r.lines} | ${r.todos} | ${r.test ? 'test/' + r.test : '**AUSENTE**'} |`),
        '', `Total de marcadores de dívida: **${todos}**`, '',
        '## Estado MODO REAL', '',
        '| capacidade | estado | próximo | requisito |', '|---|---|---|---|',
        ...ledger.map((c) => `| ${c.id} ${c.title} | ${c.state} | ${c.next || '—'} | ${c.nextRequirement} |`),
        '', '## Propostas (não executadas)', '',
        ...proposals.map((p, i) => `${i + 1}. **${p.kind}** — \`${p.target}\` → ${p.action}`),
        '', '> Proposta não é mudança. Nada aqui foi aplicado automaticamente.', '',
      ].join('\n');
      await ensureDir(path.dirname(file));
      await fsp.writeFile(file, md, 'utf8');
      return { ok: true, summary: `${rows.length} módulos analisados, ${proposals.length} propostas, relatório ${path.basename(file)}`, data: { id, report: relPosix(ctx.config.projectRoot, file), modules: rows, proposals } };
    },
  },
};

export const taskList = () =>
  Object.entries(TASKS).map(([id, t]) => ({ id, capability: t.capability, destructive: t.destructive, description: t.description, capabilityTitle: CAPABILITIES.find((c) => c.id === t.capability)?.title }));
