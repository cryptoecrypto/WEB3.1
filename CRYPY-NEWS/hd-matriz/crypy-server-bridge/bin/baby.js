#!/usr/bin/env node
// CLI do BABY — as mesmas operações do servidor, com a mesma política e a mesma trilha.
import { createBaby } from '../src/baby.js';

const [cmd, ...rest] = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith('--')) flags[key] = true;
    else { flags[key] = next; i++; }
  } else positional.push(a);
}

const baby = await createBaby();
const out = (o) => console.log(typeof o === 'string' ? o : JSON.stringify(o, null, 2));

function approval() {
  return flags.token ? { by: flags.by || 'sensei', token: String(flags.token) } : null;
}

switch (cmd) {
  case 'status': out(await baby.status()); break;
  case 'index': out(await baby.run('memory.index', { root: flags.root, label: flags.label || 'cli' })); break;
  case 'search': out(await baby.memory.search(positional.join(' '), { limit: Number(flags.limit || 10) })); break;
  case 'relations': out(await baby.run('memory.relations', {})); break;
  case 'snapshot': out(await baby.run('vault.snapshot', { root: flags.root, label: flags.label || 'cli' })); break;
  case 'verify': out(await baby.run('vault.verify', { manifestId: flags.id })); break;
  case 'audit': out(await baby.run('audit.verify', {})); break;
  case 'integrity': out(await baby.run('integrity.check', { root: flags.root })); break;
  case 'review': out(await baby.run('self.review', {})); break;
  case 'organize':
    out(await baby.run('files.organize', { dir: flags.dir, dryRun: !flags.execute, approval: approval() }));
    break;
  case 'restore':
    out(await baby.run('vault.restore', { manifestId: flags.id, dest: flags.dest, dryRun: !flags.execute, approval: approval() }));
    break;
  case 'ledger': {
    if (flags.advance) {
      try {
        out(await baby.ledger.advance(flags.advance, {
          to: flags.to,
          evidence: flags.evidence ? JSON.parse(flags.evidence) : null,
          approval: approval(),
        }));
      } catch (err) { out({ ok: false, code: err.code, reason: err.message }); process.exitCode = 1; }
    } else out(await baby.ledger.status());
    break;
  }
  case 'run': out(await baby.run(positional[0], { dryRun: !flags.execute, approval: approval(), ...(flags.opts ? JSON.parse(flags.opts) : {}) })); break;
  default:
    console.log(`BABY v${baby.version} — MODO REAL
Uso: node bin/baby.js <comando> [opções]

  status                          estado das 5 capacidades + saúde ao vivo
  index [--root DIR]              inventário + SHA-256 + diff
  search <termos> [--limit N]     busca em nomes e conteúdo
  relations                       grafo de dependências
  snapshot [--label X]            backup com dedupe + manifesto
  verify [--id SNAP]              re-hash do cofre
  audit                           verificação da trilha encadeada
  integrity                       deriva do corpus vs último backup
  review                          autoanálise + propostas (não aplica nada)
  organize [--dir D] [--execute --token T]   organiza (simulação por padrão)
  restore [--id SNAP] [--dest D] [--execute --token T]
  ledger [--advance C1 --to testada --evidence '{"kind":"test",...}']
  run <task.id> [--execute --token T] [--opts '{"..."}']`);
}
