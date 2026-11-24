import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectBuffer } from '../scanner.mjs';

test('detecta assinatura EICAR de teste', () => {
  const sample = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-' + 'ANTIVIRUS-TEST-FILE!$H+H*';
  const hits = inspectBuffer('sample.txt', Buffer.from(sample));
  assert.ok(hits.some(x => x.rule === 'TEST.EICAR' && x.severity === 'critical'));
});
test('detecta padrão de execução JavaScript ofuscada', () => {
  const sample = ['eval', '(', 'atob', '("Y29kZQ=="))'].join('');
  const hits = inspectBuffer('payload.js', Buffer.from(sample));
  assert.ok(hits.some(x => x.rule === 'JS.OBFUSCATED_EXECUTION'));
});
test('não sinaliza texto comum sem padrão perigoso', () => {
  assert.equal(inspectBuffer('readme.txt', Buffer.from('Documentação normal do projeto CRYPY.')).length, 0);
});
test('detecta comando PowerShell codificado', () => {
  const sample = 'powershell.exe -' + 'EncodedCommand AAAA';
  const hits = inspectBuffer('script.ps1', Buffer.from(sample));
  assert.ok(hits.some(x => x.rule === 'PS.ENCODED_COMMAND'));
});
