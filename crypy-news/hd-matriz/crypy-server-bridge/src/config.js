// CAPACIDADE 2 — Centralização: um único ponto de configuração do núcleo.
// Fontes (HDs, Dropbox, WEB3.1) entram como RAÍZES declaradas na política — nada implícito.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

export function loadConfig(overrides = {}) {
  const env = process.env;
  const projectRoot = path.resolve(overrides.projectRoot || env.CRYPY_PROJECT_ROOT || PROJECT_ROOT);
  const dataDir = path.resolve(overrides.dataDir || env.CRYPY_DATA_DIR || path.join(projectRoot, '.baby'));
  const targetRoot = path.resolve(overrides.targetRoot || env.CRYPY_TARGET_ROOT || projectRoot);
  const evidenceDir = path.resolve(overrides.evidenceDir || env.CRYPY_EVIDENCE_DIR || path.join(projectRoot, 'evidence'));
  const sandboxDir = path.resolve(overrides.sandboxDir || env.CRYPY_SANDBOX_DIR || path.join(projectRoot, 'sandbox'));
  const isProduction = env.NODE_ENV === 'production';
  const approvalToken = overrides.approvalToken ?? env.CRYPY_SENSEI_TOKEN ?? (isProduction ? null : 'sensei-dev-token');
  if (isProduction && (!approvalToken || Buffer.byteLength(approvalToken, 'utf8') < 32)) {
    throw new Error('CRYPY_SENSEI_TOKEN precisa estar configurado com pelo menos 32 bytes no ambiente de produção.');
  }

  const roots = overrides.roots || [
    { path: targetRoot, mode: 'read', label: 'corpus' },
    { path: dataDir, mode: 'readwrite', label: 'estado-do-baby' },
    { path: evidenceDir, mode: 'readwrite', label: 'evidencias' },
    { path: sandboxDir, mode: 'readwrite', label: 'sandbox' },
  ];

  return {
    projectRoot, dataDir, targetRoot, evidenceDir, sandboxDir, approvalToken, roots,
    host: overrides.host || env.CRYPY_HOST || '0.0.0.0',
    port: Number(overrides.port || env.CRYPY_PORT || env.PORT || 8787),
    // Adaptadores declarados como PLANEJADOS — não existem implementações fingindo existir.
    adapters: [
      { id: 'web3.1', kind: 'site', status: 'planejado', note: 'ingest via raiz de arquivos ou bridge HTTP' },
      { id: 'baby-core.js', kind: 'modulo', status: 'planejado', note: 'a receber do Sensei' },
      { id: 'baby-bridge.js', kind: 'modulo', status: 'planejado', note: 'a receber do Sensei' },
      { id: 'memory-boost', kind: 'modulo', status: 'planejado', note: 'a receber do Sensei' },
      { id: 'hds-locais', kind: 'storage', status: 'planejado', note: 'montar como raiz read/readwrite' },
      { id: 'dropbox', kind: 'storage', status: 'planejado', note: 'exige credencial e adaptador own' },
    ],
  };
}
