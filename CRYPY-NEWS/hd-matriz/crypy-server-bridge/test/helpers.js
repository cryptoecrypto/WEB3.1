// Fixture isolada por teste: nada de tocar o projeto real.
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createBaby } from '../src/baby.js';

export async function fixture({ corpus = true } = {}) {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'baby-test-'));
  const projectRoot = path.join(root, 'proj');
  const targetRoot = path.join(root, 'corpus');
  const dataDir = path.join(root, 'state');
  const evidenceDir = path.join(projectRoot, 'evidence');
  const sandboxDir = path.join(projectRoot, 'sandbox');

  for (const d of [projectRoot, evidenceDir, sandboxDir, path.join(projectRoot, 'src'), path.join(projectRoot, 'test'), path.join(projectRoot, 'docs'), path.join(projectRoot, 'public')]) {
    await fsp.mkdir(d, { recursive: true });
  }
  await fsp.writeFile(path.join(projectRoot, 'public', 'index.html'), '<!doctype html><html><body><form id="authForm"><button>ENTRAR NO SERVIDOR</button></form></body></html>', 'utf8');
  await fsp.writeFile(path.join(projectRoot, 'src', 'mod1.js'), 'export const a = 1;\n', 'utf8');
  await fsp.writeFile(path.join(projectRoot, 'src', 'mod2.js'), '// TODO: revisar\nexport const b = 2;\n', 'utf8');
  await fsp.writeFile(path.join(projectRoot, 'test', 'mod2.test.js'), '// teste de mod2\n', 'utf8');

  if (corpus) {
    await fsp.mkdir(path.join(targetRoot, 'sub'), { recursive: true });
    await fsp.writeFile(path.join(targetRoot, 'a.js'), "import { b } from './sub/b.js';\nexport const a = b + 1;\n", 'utf8');
    await fsp.writeFile(path.join(targetRoot, 'sub', 'b.js'), 'export const b = 41;\n', 'utf8');
    await fsp.writeFile(path.join(targetRoot, 'nota.md'), '# CRYPY\nMemoria viva do ecossistema.\n', 'utf8');
  }

  const baby = await createBaby({ projectRoot, targetRoot, dataDir, evidenceDir, sandboxDir, approvalToken: 'token-de-teste' });
  const cleanup = () => fsp.rm(root, { recursive: true, force: true });
  return { root, projectRoot, targetRoot, dataDir, evidenceDir, sandboxDir, baby, cleanup };
}

export const write = (file, txt) => fsp.writeFile(file, txt, 'utf8');
export const read = (file) => fsp.readFile(file, 'utf8');
export const exists = async (p) => { try { await fsp.access(p); return true; } catch { return false; } };
