import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { exists, fixture, write } from './helpers.js';

const APPROVAL = { by: 'sensei', token: 'token-de-teste' };

describe('C3+C5 / orquestrador BABY: autorização, execução, proteção e registro', () => {
  it('tarefa desconhecida é recusada e registrada', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const r = await f.baby.run('tarefa.fantasma', {});
    assert.equal(r.ok, false);
    const entries = await f.baby.audit.entries();
    assert.equal(entries.at(-1).action, 'task.unknown');
  });

  it('cada tarefa deixa rastro task.start / task.end com hash do resultado', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const r = await f.baby.run('memory.index', {});
    assert.equal(r.ok, true);
    assert.ok(r.audit.end > r.audit.start);
    const entries = await f.baby.audit.entries();
    const end = entries.find((e) => e.seq === r.audit.end);
    assert.equal(end.action, 'task.end');
    assert.match(end.detail.resultHash, /^[0-9a-f]{64}$/);
    assert.equal((await f.baby.audit.verify()).ok, true);
  });

  it('files.organize em dry-run NÃO toca o disco', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await write(path.join(f.sandboxDir, 'foto.png'), 'png');
    await write(path.join(f.sandboxDir, 'texto.md'), 'md');
    await write(path.join(f.sandboxDir, 'dados.json'), '{}');
    const r = await f.baby.run('files.organize', { dir: f.sandboxDir });
    assert.equal(r.ok, true);
    assert.equal(r.data.dryRun, true);
    assert.equal(r.data.plan.length, 3);
    const nomes = (await fsp.readdir(f.sandboxDir)).sort();
    assert.deepEqual(nomes, ['dados.json', 'foto.png', 'texto.md'], 'nada foi movido');
  });

  it('files.organize efetivo sem aprovação é NEGADO e auditado', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await write(path.join(f.sandboxDir, 'texto.md'), 'md');
    const r = await f.baby.run('files.organize', { dir: f.sandboxDir, dryRun: false });
    assert.equal(r.denied, true);
    assert.equal(r.requiresApproval, true);
    assert.equal(await exists(path.join(f.sandboxDir, 'docs', 'texto.md')), false);
    const entries = await f.baby.audit.entries();
    assert.equal(entries.at(-1).action, 'task.denied');
  });

  it('files.organize aprovado move, verifica hash e cria snapshot de proteção antes', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await write(path.join(f.sandboxDir, 'foto.png'), 'png-fake');
    await write(path.join(f.sandboxDir, 'texto.md'), '# titulo');
    const r = await f.baby.run('files.organize', { dir: f.sandboxDir, dryRun: false, approval: APPROVAL });
    assert.equal(r.ok, true);
    assert.equal(r.data.moved.length, 2);
    assert.ok(r.protection, 'snapshot automático antes da operação destrutiva');
    assert.equal(await exists(path.join(f.sandboxDir, 'images', 'foto.png')), true);
    assert.equal(await exists(path.join(f.sandboxDir, 'docs', 'texto.md')), true);
    assert.equal(await exists(path.join(f.sandboxDir, 'foto.png')), false);
    const v = await f.baby.vault.verify(r.protection, { quiet: true });
    assert.equal(v.ok, true);
    assert.equal((await f.baby.audit.verify()).ok, true);
    const entries = await f.baby.audit.entries();
    assert.ok(entries.some((e) => e.action === 'vault.snapshot' && e.detail.id === r.protection));
  });

  it('organizar fora da raiz gravável é bloqueado pela política', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const r = await f.baby.run('files.organize', { dir: f.targetRoot, dryRun: false, approval: APPROVAL });
    assert.equal(r.ok, false);
    assert.equal(r.code, 'READ_ONLY_ROOT');
    assert.equal((await f.baby.audit.entries()).at(-1).action, 'task.error');
  });

  it('integrity.check detecta deriva do corpus em relação ao último backup', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.run('vault.snapshot', {});
    const antes = await f.baby.run('integrity.check', {});
    assert.equal(antes.data.drift, false);
    await write(path.join(f.targetRoot, 'nota.md'), '# CRYPY\nalterado depois do backup\n');
    await write(path.join(f.targetRoot, 'intruso.txt'), 'novo');
    const depois = await f.baby.run('integrity.check', {});
    assert.equal(depois.data.drift, true);
    assert.deepEqual(depois.data.changed, ['nota.md']);
    assert.deepEqual(depois.data.added, ['intruso.txt']);
  });

  it('self.review analisa o próprio ambiente e gera relatório sem aplicar mudanças', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const r = await f.baby.run('self.review', {});
    assert.equal(r.ok, true);
    assert.equal(r.data.modules.length, 2);
    const semTeste = r.data.proposals.filter((p) => p.kind === 'teste-ausente');
    assert.equal(semTeste.length, 1);
    assert.equal(semTeste[0].target, 'src/mod1.js');
    assert.ok(r.data.proposals.some((p) => p.kind === 'divida-marcada' && p.target === 'src/mod2.js'));
    assert.ok(r.data.proposals.some((p) => p.kind === 'modo-real'));
    const report = path.join(f.projectRoot, r.data.report);
    assert.equal(await exists(report), true);
    const md = await fsp.readFile(report, 'utf8');
    assert.match(md, /Proposta não é mudança/);
    const st = await f.baby.ledger.status();
    assert.ok(st.every((c) => c.state === 'planejada'), 'autoanálise não promove estado sozinha');
  });

  it('status agrega saúde ao vivo das cinco capacidades', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await f.baby.run('memory.index', {});
    await f.baby.run('vault.snapshot', {});
    const s = await f.baby.status();
    assert.equal(s.capabilities.length, 5);
    assert.equal(s.live.audit.ok, true);
    assert.equal(s.live.vault.ok, true);
    assert.equal(s.live.memory.fileCount, 3);
    assert.ok(s.tasks.length >= 9);
    assert.ok(s.roots.some((r) => r.label === 'corpus' && r.mode === 'read'));
  });
});
