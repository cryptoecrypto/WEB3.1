#!/usr/bin/env node
// Registra evidência REAL: roda os testes, guarda o log, avança o ledger até 'testada'
// e PARA na fronteira da aprovação. O BABY não se autoaprova. MODO REAL.
import { spawn } from 'node:child_process';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createBaby } from '../src/baby.js';
import { STATES } from '../src/ledger.js';
import { ensureDir, hashFile, nowIso } from '../src/util.js';

const baby = await createBaby();
const { projectRoot, evidenceDir } = baby.config;
const log = (...a) => console.log(...a);

function runTests() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--test', 'test/'], { cwd: projectRoot });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('close', (code) => resolve({ code, out }));
  });
}

log('▸ executando a suíte de testes de verdade…');
const { code, out } = await runTests();
const num = (re) => Number((out.match(re) || [0, 0])[1]);
const meta = {
  command: 'node --test test/',
  exitCode: code,
  tests: num(/^# tests (\d+)$/m),
  passed: num(/^# pass (\d+)$/m),
  failed: num(/^# fail (\d+)$/m),
  suites: num(/^# suites (\d+)$/m),
  durationMs: Math.round(num(/^# duration_ms ([\d.]+)$/m)),
  ranAt: nowIso(),
};
await ensureDir(evidenceDir);
const logPath = path.join(evidenceDir, 'test-run.log');
await fsp.writeFile(logPath, `# comando: ${meta.command}\n# quando: ${meta.ranAt}\n# exitCode: ${code}\n\n${out}`, 'utf8');
log(`  ${meta.passed}/${meta.tests} testes verdes · ${meta.failed} falhas · exit ${code} · ${meta.durationMs} ms`);
if (code !== 0 || meta.failed > 0) {
  log('✖ testes não estão verdes: nada será declarado. Veja evidence/test-run.log');
  process.exit(1);
}

const testEv = { kind: 'test', path: 'evidence/test-run.log', meta: { command: meta.command, exitCode: meta.exitCode, passed: meta.passed, failed: meta.failed, tests: meta.tests, ranAt: meta.ranAt } };
const doc = { kind: 'doc', path: 'docs/ARQUITETURA.md' };

const PLAN = [
  { id: 'C1', steps: [['documentada', doc], ['implementada', { kind: 'code', paths: ['src/memory.js'] }], ['testada', testEv]] },
  { id: 'C2', steps: [['documentada', doc], ['implementada', { kind: 'code', paths: ['src/config.js', 'src/registry.js', 'src/bus.js', 'src/server.js'], note: 'Arquitetura coordenada (registro + barramento + núcleo HTTP) implementada e testada. NÃO avanço para testada: WEB3.1, HDs, Dropbox e IAs externas seguem sem integração comprovada.' }]] },
  { id: 'C3', steps: [['documentada', { kind: 'doc', path: 'docs/MODO-REAL.md' }], ['implementada', { kind: 'code', paths: ['src/policy.js', 'src/tasks.js', 'src/baby.js'] }], ['testada', testEv]] },
  { id: 'C4', steps: [['documentada', doc], ['implementada', { kind: 'code', paths: ['src/vault.js', 'src/audit.js'] }], ['testada', testEv]] },
  { id: 'C5', steps: [['documentada', { kind: 'doc', path: 'docs/MODO-REAL.md' }], ['implementada', { kind: 'code', paths: ['src/tasks.js', 'src/ledger.js'] }], ['testada', testEv]] },
];

log('▸ registrando provas no ledger (uma etapa por vez, sem pular)…');
for (const cap of PLAN) {
  const db = await baby.ledger.read();
  let cur = STATES.indexOf(db.capabilities[cap.id].state);
  for (const [to, evidence] of cap.steps) {
    const target = STATES.indexOf(to);
    if (target <= cur) { log(`  ${cap.id} ${to}: já registrado`); continue; }
    if (target !== cur + 1) { log(`  ${cap.id} ${to}: BLOQUEADO (estado atual ${STATES[cur]})`); continue; }
    const r = await baby.ledger.advance(cap.id, { to, evidence });
    cur = target;
    log(`  ${cap.id}: ${r.from} → ${r.to} (${r.proof.length} prova(s) com SHA-256)`);
  }
}

log('▸ executando o ciclo operacional real…');
const runs = {};
for (const t of ['memory.index', 'memory.relations', 'registry.status', 'bus.verify', 'squadron.check', 'self.review']) {
  runs[t] = await baby.run(t, {});
  log(`  ${t}: ${runs[t].summary}`);
}
const snap = await baby.run('vault.snapshot', { label: 'baseline-001' });
log(`  vault.snapshot: ${snap.summary}`);
const vv = await baby.run('vault.verify', { manifestId: snap.data.id });
const av = await baby.run('audit.verify', {});
log(`  vault.verify: ${vv.summary}`);
log(`  audit.verify: ${av.summary}`);

const status = await baby.status();
const artifacts = ['src/baby.js', 'src/ledger.js', 'src/registry.js', 'src/bus.js', 'src/policy.js', 'src/memory.js', 'src/vault.js', 'src/audit.js', 'public/index.html', 'evidence/test-run.log'];
const hashes = [];
for (const a of artifacts) hashes.push({ path: a, sha256: await hashFile(path.join(projectRoot, a)) });

const protecao = [
  '# Prova de proteção — baseline-001', '',
  `Gerado em ${nowIso()}.`, '',
  `- manifesto: \`${snap.data.id}\``,
  `- fingerprint do corpus: \`${snap.data.rootHash}\``,
  `- arquivos protegidos: ${snap.data.stats.fileCount}`,
  `- blobs novos: ${snap.data.stats.objects} · bytes deduplicados: ${snap.data.stats.dedupBytes}`,
  `- verificação do cofre: ${vv.data.ok ? 'ÍNTEGRA' : 'FALHOU'} (${vv.data.checked} blobs re-hasheados)`,
  `- trilha de auditoria: ${av.data.ok ? 'ÍNTEGRA' : 'QUEBRADA'} (${av.data.count} registros, head ${av.data.head})`, '',
  'Este arquivo é a evidência `kind:"protection"` para o estado **protegida**,',
  'que só pode ser registrado depois da aprovação do Sensei.', '',
].join('\n');
await fsp.writeFile(path.join(evidenceDir, 'protecao.md'), protecao, 'utf8');

const capTable = status.capabilities.map((c) => `| ${c.id} | ${c.title} | **${c.state}** | ${c.evidenceCount} | ${c.next || '—'} |`).join('\n');
const squadTable = status.squadron.map((a) => `| ${a.name} | ${a.origin} | ${a.role} | **${a.state}** | ${a.integration ? a.integration.kind : '—'} |`).join('\n');

const relatorio = [
  '# RELATÓRIO DE EVIDÊNCIA 001 — CRYPY SERVER / BABY', '',
  `**Gerado:** ${nowIso()} · **núcleo:** v${status.version} · **modo:** REAL`, '',
  '> Não estamos construindo uma IA para conversar sobre o CRYPY. Estamos construindo uma IA para trabalhar dentro do CRYPY.', '',
  '## 1. Testes executados (não simulados)', '',
  '```', `comando: ${meta.command}`, `exitCode: ${meta.exitCode}`,
  `testes: ${meta.tests}  verdes: ${meta.passed}  falhas: ${meta.failed}  suítes: ${meta.suites}`,
  `duração: ${meta.durationMs} ms`, '```', '',
  'Log completo e reexecutável: `evidence/test-run.log`.', '',
  'Inclui testes de ataque: impostor no barramento, autoria adulterada, symlink para fora',
  'da raiz, escrita em raiz somente leitura, blob corrompido, blob ausente, manifesto',
  'adulterado, trilha truncada, autoaprovação e pulo de estados. Todos exigem recusa.', '',
  '## 2. Estado MODO REAL das cinco capacidades', '',
  '| cap | capacidade | estado | provas | próximo |', '|---|---|---|---|---|', capTable, '',
  '**C2 permanece em `implementada` de propósito:** a arquitetura coordenada existe e é',
  'testada, mas WEB3.1, HDs, Dropbox e as IAs externas não têm integração comprovada.',
  'Declarar `testada` aqui seria entusiasmo, não evidência.', '',
  '## 3. Esquadrão — estado operacional honesto', '',
  '| identidade | origem | função | estado | integração |', '|---|---|---|---|---|', squadTable, '',
  `Barramento: ${status.bus.reason} (${status.bus.count} mensagens).`, '',
  '## 4. Integridade ao vivo', '',
  `- cofre: **${vv.data.ok ? 'íntegro' : 'FALHA'}** — ${vv.data.checked} blobs re-hasheados, manifesto \`${snap.data.id}\``,
  `- trilha: **${av.data.ok ? 'íntegra' : 'QUEBRADA'}** — ${av.data.count} registros, head \`${av.data.head}\``,
  `- memória: ${status.live.memory.fileCount} arquivos, fingerprint \`${status.live.memory.rootHash}\``,
  `- relações entre módulos: ${runs['memory.relations'].data.edges.length} arestas`, '',
  '## 5. SHA-256 dos artefatos deste núcleo', '',
  '| arquivo | sha256 |', '|---|---|',
  ...hashes.map((h) => `| ${h.path} | \`${h.sha256}\` |`), '',
  '## 6. O que NÃO está provado (e não será declarado)', '',
  '- Integração real com WEB3.1, HDs, Dropbox, `baby-core.js`, `baby-bridge.js`, Memory Boost.',
  '- Integração operacional de NEXUS, ALICE, MINI, DOLA, CHAT, BTC/ETH/USDT.',
  '- Qualquer capacidade `aprovada` ou `protegida`: depende do token do Sensei.',
  '- Aprendizado com LLM: o núcleo atual é determinístico, sem modelo de linguagem.',
  '- Execução fora deste ambiente (servidor próprio, domínio, produção).', '',
  '## 7. Próximo passo — decisão do Sensei', '',
  '```bash',
  '# aprovar uma capacidade testada (exemplo C4)',
  'node bin/baby.js ledger --advance C4 --to aprovada --by sensei --token "$CRYPY_SENSEI_TOKEN"',
  '',
  '# registrar proteção com o manifesto já verificado',
  `node bin/baby.js ledger --advance C4 --to protegida \\`,
  `  --evidence '{"kind":"protection","path":"evidence/protecao.md","meta":{"manifestId":"${snap.data.id}"}}'`,
  '```', '',
  `Autoanálise do próprio ambiente: \`evidence/${path.basename(runs['self.review'].data.report)}\`.`, '',
].join('\n');
await fsp.writeFile(path.join(evidenceDir, 'RELATORIO-001.md'), relatorio, 'utf8');

const final = await baby.run('vault.snapshot', { label: 'relatorio-001' });
const drift = await baby.run('integrity.check', {});
await fsp.writeFile(path.join(evidenceDir, 'ultimo-manifesto.json'), JSON.stringify({ baseline: snap.data.id, final: final.data.id, rootHash: final.data.rootHash, ts: nowIso() }, null, 2) + '\n');

log('');
log('✔ evidência registrada: evidence/RELATORIO-001.md');
log(`✔ provas de teste: evidence/test-run.log (${meta.passed} verdes)`);
log(`✔ cofre: ${final.data.id} · deriva após relatório: ${drift.data.drift ? 'sim' : 'não'}`);
log('⏸  PARADO na fronteira da aprovação — aprovada/protegida dependem do Sensei.');
