#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const EXCLUDED = new Set(['.git', 'node_modules', '.baby', 'evidence', 'backups', 'snapshots', '.crypy-defender', 'coverage']);
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 10000;

export function inspectBuffer(filePath, buffer) {
  const text = buffer.toString('utf8');
  const findings = [];
  const add = (rule, severity, description) => findings.push({ file: filePath, rule, severity, description });
  if (/X5O!P%@AP\[4\\PZX54\(P\^\)7CC\)7\}\$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!\$H\+H\*/i.test(text)) add('TEST.EICAR', 'critical', 'Assinatura de teste EICAR detectada.');
  if (/(?:eval|Function)\s*\(\s*(?:atob|Buffer\.from)\s*\(/i.test(text) || /new\s+Function\s*\([^)]*(?:atob|fromCharCode)/i.test(text)) add('JS.OBFUSCATED_EXECUTION', 'high', 'Possível execução de código JavaScript ofuscado.');
  if (/powershell(?:\.exe)?\s+[^\n]{0,120}-(?:enc|encodedcommand)\b/i.test(text)) add('PS.ENCODED_COMMAND', 'high', 'Comando PowerShell codificado encontrado.');
  if (/\beval\s*\(\s*base64_decode\s*\(/i.test(text)) add('PHP.ENCODED_EVAL', 'critical', 'Possível execução PHP de conteúdo codificado.');
  if (/(?:\/dev\/tcp\/|nc\s+-e\s+\/bin\/(?:sh|bash)|bash\s+-i\s+>&\s*\/dev\/tcp)/i.test(text)) add('SHELL.REVERSE_CONNECTION', 'critical', 'Padrão comum de shell reverso encontrado.');
  return findings;
}

async function collectFiles(root) {
  const files = [];
  const skipped = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    entries.sort((a,b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).split(path.sep).join('/');
      if (entry.isSymbolicLink()) { skipped.push({ file: rel, reason: 'symlink-not-followed' }); continue; }
      if (entry.isDirectory()) { if (!EXCLUDED.has(entry.name)) await walk(abs); continue; }
      if (!entry.isFile()) continue;
      if (files.length >= MAX_FILES) throw new Error('Limite de 10.000 arquivos atingido; divida a varredura por diretório.');
      const stat = await fs.stat(abs);
      if (stat.size > MAX_FILE_BYTES) { skipped.push({ file: rel, reason: 'file-over-10mb', bytes: stat.size }); continue; }
      files.push({ abs, rel, bytes: stat.size });
    }
  }
  await walk(root);
  return { files, skipped };
}

export async function scanTree(root, { clamav = false } = {}) {
  const absoluteRoot = path.resolve(root);
  const { files, skipped } = await collectFiles(absoluteRoot);
  const findings = [];
  const inventory = [];
  for (const file of files) {
    const buffer = await fs.readFile(file.abs);
    inventory.push({ file: file.rel, bytes: file.bytes, sha256: createHash('sha256').update(buffer).digest('hex') });
    findings.push(...inspectBuffer(file.rel, buffer));
  }
  let clamavResult = { requested: clamav, available: false, status: 'not-requested' };
  if (clamav) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'crypy-defender-'));
    const listPath = path.join(tempDir, 'files.txt');
    try {
      await fs.writeFile(listPath, files.map(f => f.abs).join('\n') + '\n', { mode: 0o600 });
      const { stdout, stderr } = await execFileAsync('clamscan', ['--no-summary', '--infected', '--file-list=' + listPath], { timeout: 10 * 60 * 1000, maxBuffer: 4 * 1024 * 1024 });
      clamavResult = { requested: true, available: true, status: 'clean', output: (stdout + stderr).slice(0, 4000) };
    } catch (error) {
      if (error.code === 'ENOENT') clamavResult = { requested: true, available: false, status: 'unavailable', message: 'clamscan não está instalado.' };
      else if (error.code === 1) clamavResult = { requested: true, available: true, status: 'infected', output: String(error.stdout || error.stderr || '').slice(0, 4000) };
      else clamavResult = { requested: true, available: true, status: 'error', message: String(error.message).slice(0, 1000) };
    } finally { await fs.rm(tempDir, { recursive: true, force: true }); }
  }
  return {
    schemaVersion: '1.0.0', engine: 'CRYPY-DEFENDER', engineVersion: '0.1.0',
    scannedAt: new Date().toISOString(), root: absoluteRoot,
    summary: { filesScanned: files.length, filesSkipped: skipped.length, findings: findings.length, critical: findings.filter(x=>x.severity==='critical').length, high: findings.filter(x=>x.severity==='high').length },
    clamav: clamavResult, findings, skipped, inventory
  };
}

function arg(name, fallback = null) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : fallback; }
if (process.argv[1] && import.meta.url === new URL('file://' + path.resolve(process.argv[1])).href) {
  const root = path.resolve(arg('--root', process.cwd()));
  const report = arg('--report');
  const useClamav = process.argv.includes('--clamav');
  const strict = process.argv.includes('--strict');
  try {
    const result = await scanTree(root, { clamav: useClamav });
    const json = JSON.stringify(result, null, 2) + '\n';
    if (report) await fs.writeFile(path.resolve(report), json, { mode: 0o600 });
    process.stdout.write(json);
    const infected = result.findings.length > 0 || result.clamav.status === 'infected' || result.clamav.status === 'error';
    if (strict && infected) process.exitCode = 2;
    if (useClamav && !result.clamav.available) process.exitCode = 3;
  } catch (error) { process.stderr.write('CRYPY-DEFENDER error: ' + error.message + '\n'); process.exitCode = 1; }
}
