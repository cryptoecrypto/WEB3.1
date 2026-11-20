import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { Policy, PolicyError } from '../src/policy.js';
import { fixture } from './helpers.js';
import { loadConfig } from '../src/config.js';

describe('C3 / política de permissões', () => {
  it('nega caminho fora das raízes autorizadas', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    await assert.rejects(() => f.baby.policy.resolve('/etc/passwd', 'read'), (e) => e instanceof PolicyError && e.code === 'OUT_OF_ROOT');
  });

  it('nega escrita em raiz somente leitura (o código do site é intocável por padrão)', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const alvo = path.join(f.targetRoot, 'a.js');
    const ok = await f.baby.policy.resolve(alvo, 'read');
    assert.equal(ok.abs, alvo);
    await assert.rejects(() => f.baby.policy.resolve(alvo, 'write'), (e) => e.code === 'READ_ONLY_ROOT');
  });

  it('nega escape por symlink que aponta para fora da raiz', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const fora = path.join(f.root, 'segredo.txt');
    await fsp.writeFile(fora, 'confidencial', 'utf8');
    const link = path.join(f.targetRoot, 'atalho.txt');
    await fsp.symlink(fora, link);
    await assert.rejects(() => f.baby.policy.resolve(link, 'read'), (e) => e.code === 'OUT_OF_ROOT');
  });

  it('nega escape por ../ antes de resolver', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const alvo = path.join(f.targetRoot, '..', 'segredo.txt');
    await assert.rejects(() => f.baby.policy.resolve(alvo, 'read'), (e) => e.code === 'OUT_OF_ROOT');
  });

  it('raiz mais específica vence: subdir gravável dentro de raiz somente leitura', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const p = new Policy({
      roots: [
        { path: f.root, mode: 'read', label: 'tudo' },
        { path: f.sandboxDir, mode: 'readwrite', label: 'sandbox' },
      ],
      approvalToken: 't',
    });
    const dentro = await p.resolve(path.join(f.sandboxDir, 'novo.txt'), 'write');
    assert.equal(dentro.root.label, 'sandbox');
    await assert.rejects(() => p.resolve(path.join(f.targetRoot, 'a.js'), 'write'), (e) => e.code === 'READ_ONLY_ROOT');
  });

  it('operação destrutiva: dry-run liberado, execução exige token correto e autor', async (t) => {
    const f = await fixture();
    t.after(f.cleanup);
    const p = f.baby.policy;
    assert.equal(p.authorize({ task: 'files.organize', destructive: true, dryRun: true }).allowed, true);
    const semToken = p.authorize({ task: 'files.organize', destructive: true, dryRun: false });
    assert.equal(semToken.allowed, false);
    assert.equal(semToken.requiresApproval, true);
    const tokenErrado = p.authorize({ task: 'files.organize', destructive: true, dryRun: false, approval: { by: 'sensei', token: 'errado' } });
    assert.equal(tokenErrado.allowed, false);
    const semAutor = p.authorize({ task: 'files.organize', destructive: true, dryRun: false, approval: { token: 'token-de-teste' } });
    assert.equal(semAutor.allowed, false);
    const ok = p.authorize({ task: 'files.organize', destructive: true, dryRun: false, approval: { by: 'sensei', token: 'token-de-teste' } });
    assert.equal(ok.allowed, true);
    assert.equal(ok.approvedBy, 'sensei');
  });

  it('respeita allowlist de tarefas quando definida', async () => {
    const p = new Policy({ roots: [], approvalToken: 't', allowedTasks: ['memory.index'] });
    assert.equal(p.authorize({ task: 'memory.index' }).allowed, true);
    assert.equal(p.authorize({ task: 'files.organize' }).allowed, false);
  });
});


describe('configuração segura do token de aprovação', () => {
  it('não usa token de desenvolvimento conhecido quando nenhum segredo foi configurado', () => {
    const previous = process.env.CRYPY_SENSEI_TOKEN;
    delete process.env.CRYPY_SENSEI_TOKEN;
    try {
      assert.equal(loadConfig().approvalToken, null);
    } finally {
      if (previous === undefined) delete process.env.CRYPY_SENSEI_TOKEN;
      else process.env.CRYPY_SENSEI_TOKEN = previous;
    }
  });
});
