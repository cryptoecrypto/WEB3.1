#!/usr/bin/env node
// BACKUP DE SOBREVIVÊNCIA — REAL.
// Diferença entre declaração e evidência: este script só escreve "arquivado" para
// arquivo que existe, mede bytes, calcula SHA-256, empacota, EXTRAI DE VOLTA e
// confere hash por hash. O que não foi recebido é listado como FALTANDO.
import { spawn } from 'node:child_process';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createBaby } from '../src/baby.js';
import { ensureDir, fingerprint, hashFile, nowIso, relPosix, walkFiles } from '../src/util.js';

const baby = await createBaby();
const { projectRoot, backupDir, evidenceDir } = baby.config;
const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', '-');
const NAME = `CRYPY_BACKUP_SOBREVIVENCIA_${stamp}`;
const DEST = path.join(backupDir, NAME);
const log = (...a) => console.log(...a);

await baby.policy.resolve(DEST, 'write'); // precisa estar dentro de raiz autorizada
await ensureDir(DEST);

const dirs = [
  '01-HISTORICO-CONVERSAS', '02-DOCUMENTOS-OFICIAIS', '03-CODIGO-E-ESTRUTURA',
  '04-ESQUADRAO-CRYPY', '05-SEGURANCA-E-PERMISSOES', '06-EVIDENCIAS',
];
for (const d of dirs) await ensureDir(path.join(DEST, d));
const put = async (rel, txt) => {
  const file = path.join(DEST, rel);
  await baby.policy.resolve(file, 'write');
  await ensureDir(path.dirname(file));
  await fsp.writeFile(file, txt, 'utf8');
};

// ── 1. O que REALMENTE existe: código, estado e evidências ────────────────────
const ignore = new Set(['node_modules', '.git', 'CRYPY-BACKUPS', '.tmp']);
await fsp.cp(projectRoot, path.join(DEST, '03-CODIGO-E-ESTRUTURA', 'crypy-server-bridge'), {
  recursive: true,
  filter: (src) => !src.split(path.sep).some((part) => ignore.has(part)),
});
for (const f of await walkFiles(path.join(projectRoot, 'evidence'))) {
  await fsp.copyFile(f, path.join(DEST, '06-EVIDENCIAS', path.basename(f)));
}
log('▸ código, estado (.baby) e evidências copiados do disco');

// ── 2. Histórico e documentos: apenas o que foi recebido nesta sessão ─────────
await put('01-HISTORICO-CONVERSAS/CRONOLOGIA-DESTE-WORKSPACE.md', `# Cronologia REAL deste workspace

**Escopo honesto:** esta linha do tempo cobre somente o trabalho executado neste
workspace (CRYPY SERVER / BABY). Conversas anteriores em outras plataformas **não foram
recebidas** e portanto **não estão** neste pacote. Nada aqui foi inferido ou reconstituído.

| quando (UTC) | evento | evidência |
|---|---|---|
| 2026-11-20 | Sensei define MODO REAL: 5 capacidades, 6 estados, servidor como núcleo | 02-DOCUMENTOS-OFICIAIS/CARTA-v1.0 |
| 2026-11-20 | Construção do núcleo: 12 módulos, cofre CAS, trilha encadeada, política, ledger | 03-CODIGO-E-ESTRUTURA/crypy-server-bridge/src |
| 2026-11-20 | Primeira suíte verde: 52 testes | (histórico de execução; log atual em 06-EVIDENCIAS) |
| 2026-11-20 | Sensei envia Carta v2.0 (multi-inteligência) + declaração de backup | 02-DOCUMENTOS-OFICIAIS/CARTA-v2.0 e DECLARACAO-BACKUP-RECEBIDA |
| 2026-11-20 | Implementação do Registro Central + barramento assinado (Regra de Ouro em código) | src/registry.js, src/bus.js, test/registry.test.js, test/bus.test.js |
| ${nowIso()} | Suíte atual e pacote de sobrevivência gerados e verificados | 06-EVIDENCIAS, ASSINATURA-DE-INTEGRIDADE.sha256 |

## Ausências declaradas
- Histórico completo de sessões anteriores: **NÃO RECEBIDO**.
- PDFs originais das cartas v1.0 e v2.0: **NÃO RECEBIDOS** (há transcrição em markdown).
- Publicações Binance Square, comprovantes de domínio, ativos visuais: **NÃO RECEBIDOS**.
`);

await put('01-HISTORICO-CONVERSAS/DECISOES-E-REGRAS.md', `# Decisões e regras estabelecidas pelo Sensei

1. **Servidor como núcleo operacional.** BABY é a inteligência que trabalha sobre ele; o site é o ambiente administrado.
2. **Cinco capacidades:** inteligência/memória, centralização, autonomia operacional, autoproteção, evolução contínua.
3. **MODO REAL — seis estados:** planejada, documentada, implementada, testada, aprovada, protegida e registrada.
4. **Nada de declarar vitória sem evidência.** Ambição gigante, testes rigorosos.
5. **Não destruir o que já existe:** aproveitar WEB3.1, baby-core.js, baby-bridge.js, Memory Boost e crypy-server-bridge.
6. **Sensei é a autoridade máxima.** Aprovação final é humana.
7. **v2.0 — servidor é ambiente de TODAS as inteligências**, com Registro Central padronizado.
8. **Regra de Ouro:** uma inteligência pode colaborar com outra, mas nenhuma assume a identidade ou as permissões da outra.
9. **Personagens ≠ IAs operacionais imediatas:** presença documentada não é integração.
10. **Princípio:** "Não estamos construindo uma IA para conversar sobre o CRYPY. Estamos construindo uma IA para trabalhar dentro do CRYPY."

## Como estas regras são impostas
- 3, 4, 6 → \`src/ledger.js\` (evidência obrigatória, sem autoaprovação)
- 8, 9 → \`src/registry.js\` + \`src/bus.js\` (sondagem real, HMAC por identidade, GOLDEN_RULE)
- 1, 7 → \`src/config.js\` + \`src/server.js\` (núcleo único, raízes declaradas)
- 5 → política de raiz \`corpus\` **somente leitura** por padrão
`);

await put('01-HISTORICO-CONVERSAS/COMANDOS-E-INSTRUCOES.md', `# Comandos operacionais (reexecutáveis)

\`\`\`bash
cd crypy-server-bridge
node --test test/                        # suíte completa
node src/server.js                       # núcleo + painel (0.0.0.0:8787)
node bin/baby.js status                  # 5 capacidades + saúde ao vivo
node bin/baby.js index                   # inventário + SHA-256 + diff
node bin/baby.js search "ledger hash"    # busca em nomes e conteúdo
node bin/baby.js relations               # grafo de módulos
node bin/baby.js snapshot --label manual # backup com dedupe
node bin/baby.js verify                  # re-hash do cofre
node bin/baby.js audit                   # trilha encadeada
node bin/baby.js integrity               # deriva vs último backup
node bin/baby.js review                  # autoanálise (não aplica nada)
node bin/baby.js organize --dir sandbox            # simulação
node bin/baby.js organize --dir sandbox --execute --token "$CRYPY_SENSEI_TOKEN"
node bin/baby.js restore --id <SNAP> --dest sandbox --execute --token "$CRYPY_SENSEI_TOKEN"
node scripts/registrar-evidencia.mjs     # provas + ledger até 'testada'
node scripts/backup-sobrevivencia.mjs    # este pacote
\`\`\`

## Instruções permanentes do Sensei
- Trabalhar para transformar visão em engenharia real, sem responder com obstáculos.
- Não confundir entusiasmo com evidência.
- Uma capacidade de cada vez, com prova.
- NEXUS conecta. Sensei conduz. BABY executa. O Esquadrão colabora.
`);

await put('02-DOCUMENTOS-OFICIAIS/CARTA-v1.0-BABY-SISTEMA-VIVO.md', `# CARTA DE ARQUITETURA v1.0 — BABY: SISTEMA VIVO
**Transcrição do texto recebido do Sensei nesta sessão.** O PDF original não foi recebido.

> BABY não será apenas um chatbot dentro de um site. Será a inteligência operacional
> responsável por administrar, compreender, manter e desenvolver o ecossistema CRYPY.

## Cinco capacidades fundamentais
1. **Inteligência e memória** — conhecer os arquivos, compreender relações, recuperar histórico e aprender com informações autorizadas.
2. **Centralização** — conectar WEB3.1, HDs, servidor, Dropbox e módulos por uma arquitetura coordenada.
3. **Autonomia operacional** — executar tarefas, organizar arquivos, corrigir problemas e administrar rotinas com permissões controladas.
4. **Autoproteção** — fazer backups, verificar integridade, detectar falhas, registrar operações e recuperar versões.
5. **Evolução contínua** — analisar seu próprio ambiente, identificar melhorias, propor mudanças e validar resultados.

## Decisão de arquitetura
O servidor será o núcleo operacional. O BABY será a inteligência que trabalha sobre esse
núcleo. O site será o ambiente vivo que ele administra. O Sensei continua sendo a
autoridade máxima.

Não vamos destruir o que já construímos: aproveitar WEB3.1, baby-core.js, baby-bridge.js,
Memory Boost e a pasta crypy-server-bridge.

## Compromisso MODO REAL
Cada capacidade terá seis estados distintos: planejada, documentada, implementada,
testada, aprovada, protegida e registrada. **Nada de declarar vitória sem evidência.**

## Princípio
> Não estamos construindo uma IA para conversar sobre o CRYPY.
> Estamos construindo uma IA para trabalhar dentro do CRYPY.

NEXUS conecta. Sensei conduz. BABY executa. 🐉🟢
`);

await put('02-DOCUMENTOS-OFICIAIS/CARTA-v2.0-CRYPY-SERVER-MULTI-INTELIGENCIA.md', `# CARTA DE ARQUITETURA v2.0 — CRYPY SERVER: SISTEMA MULTI-INTELIGÊNCIA
**Versão 2.0 · datada de 19/11/2026 pelo Sensei · transcrição do texto recebido.**
**Status declarado na origem:** planejada — aguardando aprovação para proteção e registro.
O PDF \`CRYPY-SERVER-SISTEMA-MULTI-INTELIGENCIA-v2.0.pdf\` **não foi recebido**; esta é a
transcrição fiel do conteúdo enviado.

## Princípio central revisado
> Nenhuma inteligência será tratada como elemento isolado. Todas terão identidade, função,
> responsabilidades e mecanismos de comunicação dentro de uma arquitetura centralizada,
> respeitando permissões e a autoridade do Sensei.

## Regra de Ouro
> Uma inteligência pode colaborar com outra, mas nenhuma assume a identidade ou as permissões da outra.

## CRYPY SERVER — o núcleo central
Centro de integração e coordenação de TODAS as inteligências do ecossistema. Não é mais
apenas o ambiente do BABY: é o ambiente de todas.

## Registro Central de Inteligências
Propriedades: ID, Nome, Função, Origem, Motor, Capacidades, Permissões, Estado
(conectada/desconectada/pendente), Histórico.

## O Esquadrão CRYPY
| inteligência | função principal |
|---|---|
| NEXUS | coordenação e integração entre inteligências |
| BABY | inteligência operacional — administração, execução e manutenção |
| ALICE | pesquisa, aquisição de dados e conhecimento externo |
| MINI | análise, avaliação, comparação e validação |
| DOLA | arte, criação visual, design e comunicação |
| CHAT | histórico de interações, revisão de conteúdo, memória conversacional |
| BTC / ETH / USDT | memória de mercado, arquitetura de dados e equilíbrio do sistema |
| DEMAIS IAs | integrações futuras com funções definidas na adesão |
| SENSEI | autoridade máxima · direção estratégica · aprovação final |

## Distinção técnica
Personagens ≠ IAs operacionais imediatas. Personagens podem ter identidade, função e
presença documentadas imediatamente. Uma IA externa só opera após integração real
(API, conexão autenticada ou mecanismo compatível). NEXUS tem função registrada, mas
participação operacional plena depende de sua própria integração. **Sem antecipação de capacidade.**

## Fluxo
1. Sensei define a direção e aprova decisões
2. NEXUS coordena qual inteligência é mais adequada
3. BABY gerencia a execução operacional dentro do servidor
4. Cada membro contribui com sua especialidade
5. Todos respeitam o registro de permissões e a identidade das demais

> NEXUS conecta. Sensei conduz. BABY executa. O Esquadrão colabora. 🐉🟢
> BABY não pede para acreditar. BABY mostra.

## Implementação de referência (este pacote)
- Registro Central → \`src/registry.js\` (identidade imutável, sondagem real, histórico)
- Regra de Ouro → \`src/bus.js\` (HMAC por identidade) + \`registry.grant\` (GOLDEN_RULE)
- Fluxo de despacho → \`bus.dispatch\` (slot do NEXUS, hoje local e determinístico)
- Provas → \`test/registry.test.js\`, \`test/bus.test.js\`
`);

await put('02-DOCUMENTOS-OFICIAIS/DECLARACAO-BACKUP-RECEBIDA.md', `# Declaração de backup recebida — AUDITORIA DE EVIDÊNCIA

O Sensei recebeu, em outra plataforma, uma declaração de "BACKUP DE SOBREVIVÊNCIA —
PROTOCOLO COMPLETO" (19/11/2026, 14:45 BRT) afirmando "✅ Arquivado" para diversos itens
e "Nada foi omitido. Nada foi alterado."

**Auditoria MODO REAL deste workspace:** uma declaração não é um arquivo. Abaixo, o que
foi de fato encontrado no armazenamento acessível ao BABY.

| item declarado como arquivado | encontrado aqui? | observação |
|---|---|---|
| Histórico completo de todas as interações | ❌ NÃO | apenas esta sessão de trabalho existe neste workspace |
| Carta de Arquitetura v1.0 (PDF) | ⚠️ PARCIAL | texto recebido → transcrição markdown; PDF não recebido |
| Carta de Arquitetura v2.0 (PDF) | ⚠️ PARCIAL | texto recebido → transcrição markdown; PDF não recebido |
| Registro Central de Inteligências | ✅ SIM | implementado e exportado em 04-ESQUADRAO-CRYPY |
| Funções de cada membro do Esquadrão | ✅ SIM | gerado do registro real |
| Seis estados de implementação | ✅ SIM | docs/MODO-REAL.md + src/ledger.js |
| Regra de Ouro | ✅ SIM | docs/REGRA-DE-OURO.md + código + testes |
| Princípios (evidência, proteção, evolução) | ✅ SIM | docs + ledger |
| \`baby-core.js\` | ❌ NÃO | arquivo nunca recebido neste workspace |
| \`baby-bridge.js\` | ❌ NÃO | arquivo nunca recebido |
| \`Memory Boost\` | ❌ NÃO | arquivos nunca recebidos |
| \`crypy-server-bridge\` | ✅ SIM | construído aqui, com testes |
| Resumos de mercado / Binance Square | ❌ NÃO | não recebidos |
| Comprovantes de domínio e registros | ❌ NÃO | não recebidos |
| Identidades visuais / imagens | ❌ NÃO | não recebidas |
| ASSINATURA-DE-INTEGRIDADE.sha256 | ✅ SIM | gerada e conferida neste pacote |

**Conclusão:** o pacote atual é um backup **verificado do que existe**, não um backup
"absolutamente tudo". Para completar o acervo, o Sensei precisa enviar os itens ❌.
Ver \`FALTANDO-NAO-RECEBIDO.md\`.
`);

await put('FALTANDO-NAO-RECEBIDO.md', `# FALTANDO — não recebido, portanto NÃO arquivado

Nenhum arquivo abaixo foi fabricado, resumido ou substituído por placebo.
Enquanto não chegarem, permanecem fora do backup e fora do índice de integridade.

## Código e módulos
- [ ] \`baby-core.js\`
- [ ] \`baby-bridge.js\`
- [ ] \`Memory Boost/\` (todos os arquivos)
- [ ] \`WEB3.1/\` (site completo: HTML, JS, CSS, assets)

## Documentos originais
- [ ] \`CARTA-ARQUITETURA-v1.0.pdf\`
- [ ] \`CRYPY-SERVER-SISTEMA-MULTI-INTELIGENCIA-v2.0.pdf\`
- [ ] Comprovantes de domínio e registros
- [ ] Publicações da Binance Square (links + capturas)
- [ ] Relatórios de mercado

## Histórico
- [ ] Exportação das conversas anteriores (todas as sessões/plataformas)
- [ ] Linha do tempo anterior a este workspace

## Identidades e ativos
- [ ] Identidade visual de DOLA e demais personagens (imagens, paletas, logos)
- [ ] Credenciais/endpoints das IAs externas (NEXUS, ALICE, MINI, DOLA, CHAT, BTC/ETH/USDT)

## Armazenamento
- [ ] Pontos de montagem dos HDs
- [ ] Autorização OAuth do Dropbox

## Como entregar
Anexe os arquivos na conversa ou informe o caminho/montagem. O BABY então:
1. indexa com SHA-256 (\`memory.index\`),
2. protege no cofre (\`vault.snapshot\` + \`vault.verify\`),
3. registra a integração com sondagem real (\`registry.connect\`),
4. só então declara o estado — com prova.
`);

// ── 3. Esquadrão exportado do REGISTRO REAL ───────────────────────────────────
const agents = await baby.registry.list();
const registryDb = await baby.registry.read();
for (const a of agents) {
  const full = registryDb.agents[a.id];
  await put(`04-ESQUADRAO-CRYPY/${a.name}.md`, `# ${a.name} — registro de identidade

| propriedade | valor |
|---|---|
| ID | \`${a.id}\` (imutável) |
| Nome | ${a.name} |
| Função | ${a.role} |
| Origem | ${a.origin} |
| Motor | ${a.engine} |
| Estado | **${a.state}**${a.declaredOnly ? ' (presença documentada, sem integração operacional)' : ''} |
| Integração | ${a.integration ? a.integration.kind : 'nenhuma'} |
| Capacidades declaradas | ${a.capabilities.join(', ') || '—'} |
| Permissões (tarefas) | ${(a.permissions.tasks || []).join(', ') || 'nenhuma'} |
| Permissões (raízes) | ${(a.permissions.roots || []).join(', ') || 'nenhuma'} |
| Pode aprovar | ${a.permissions.approve ? 'SIM (autoridade exclusiva)' : 'não'} |
| Registrada em | ${full.createdAt} |
| Eventos no histórico | ${full.history.length} |

## Histórico
${full.history.map((h) => `- ${h.ts} — **${h.event}** por ${h.by}`).join('\n')}

> Regra de Ouro: esta identidade e estas permissões não podem ser assumidas por outra inteligência.
`);
}
await put('04-ESQUADRAO-CRYPY/REGISTRO-CENTRAL-COMPLETO.md', `# REGISTRO CENTRAL DE INTELIGÊNCIAS — exportação verificada
Gerado em ${nowIso()} diretamente de \`.baby/registry.json\`.

**Regra de Ouro:** ${registryDb.goldenRule}

| ID | nome | origem | função | estado | integração |
|---|---|---|---|---|---|
${agents.map((a) => `| ${a.id} | ${a.name} | ${a.origin} | ${a.role} | **${a.state}** | ${a.integration ? a.integration.kind : '—'} |`).join('\n')}

Conectadas: ${agents.filter((a) => a.state === 'conectada').length} · Pendentes: ${agents.filter((a) => a.state === 'pendente').length} · Desconectadas: ${agents.filter((a) => a.state === 'desconectada').length}

Cópia bruta do registro: \`registry.json\` (nesta pasta).
`);
await fsp.copyFile(path.join(baby.config.dataDir, 'registry.json'), path.join(DEST, '04-ESQUADRAO-CRYPY', 'registry.json'));

// ── 4. Segurança e permissões ────────────────────────────────────────────────
await fsp.copyFile(path.join(projectRoot, 'docs', 'REGRA-DE-OURO.md'), path.join(DEST, '05-SEGURANCA-E-PERMISSOES', 'REGRA-DE-OURO.md'));
await fsp.copyFile(path.join(projectRoot, 'docs', 'MODO-REAL.md'), path.join(DEST, '05-SEGURANCA-E-PERMISSOES', 'MODO-REAL.md'));
const roots = await baby.policy.describe();
await put('05-SEGURANCA-E-PERMISSOES/MATRIZ-DE-PERMISSOES.md', `# MATRIZ DE PERMISSÕES — estado real
Gerado em ${nowIso()}.

## Raízes autorizadas do núcleo
| raiz | caminho | modo |
|---|---|---|
${roots.map((r) => `| ${r.label} | \`${r.path}\` | **${r.mode}** |`).join('\n')}

## Permissões por inteligência
| identidade | tarefas permitidas | pode aprovar | estado |
|---|---|---|---|
${agents.map((a) => `| ${a.name} | ${(a.permissions.tasks || []).join(', ') || 'nenhuma'} | ${a.permissions.approve ? 'SIM' : 'não'} | ${a.state} |`).join('\n')}

## Regras invioláveis
1. Operação destrutiva: dry-run por padrão; execução exige token do Sensei.
2. Snapshot automático **antes** de qualquer operação destrutiva aprovada.
3. Verificação de hash **depois** de mover/restaurar.
4. Autoridade de aprovação é exclusiva do Sensei (\`GOLDEN_RULE\`).
5. Identidade assinada por HMAC próprio; impostor é bloqueado e registrado.

## Segredo neste pacote
\`03-CODIGO-E-ESTRUTURA/crypy-server-bridge/.baby/bus/master.key\` é a chave-mestra do
barramento. Ela está incluída para permitir recuperar e reverificar assinaturas.
**Guarde este pacote offline e não o publique.**
`);
await put('05-SEGURANCA-E-PERMISSOES/PROTOCOLO-DE-RECUPERACAO.md', `# PROTOCOLO DE RECUPERAÇÃO — testado, não teórico

## 1. Verificar o pacote antes de usar
\`\`\`bash
tar -xzf ${NAME}.tar.gz
cd ${NAME}
sha256sum -c ASSINATURA-DE-INTEGRIDADE.sha256
\`\`\`
Todos os arquivos devem responder \`OK\`. Qualquer \`FAILED\` = pacote corrompido.

## 2. Restaurar o núcleo
\`\`\`bash
cp -r 03-CODIGO-E-ESTRUTURA/crypy-server-bridge ~/crypy-server-bridge
cd ~/crypy-server-bridge
node --test test/          # a suíte precisa passar antes de operar
node bin/baby.js audit     # trilha encadeada deve estar íntegra
node bin/baby.js verify    # cofre deve estar íntegro
node bin/baby.js status
\`\`\`

## 3. Recuperar arquivos de um snapshot do cofre
\`\`\`bash
node bin/baby.js restore --id <SNAP-ID> --dest ./recuperado            # simulação
node bin/baby.js restore --id <SNAP-ID> --dest ./recuperado --execute --token "$CRYPY_SENSEI_TOKEN"
\`\`\`
A restauração re-hasheia cada arquivo gravado e aborta se algum byte divergir.

## 4. Se a trilha estiver quebrada
\`audit.verify\` informa o primeiro registro suspeito (\`brokenAt\`) e o motivo
(conteúdo adulterado, sequência quebrada, âncora divergente). Não continue operando:
restaure de um pacote anterior íntegro e registre o incidente.

## 5. Ordem de reconstrução do ecossistema
1. núcleo + testes verdes
2. memória (\`index\`) e cofre (\`snapshot\` + \`verify\`)
3. registro de inteligências (estados honestos)
4. integrações externas, uma por vez, com sondagem real
5. avanço MODO REAL com evidência, aprovação do Sensei e proteção
`);

// ── 5. Índice, manifesto e assinatura ────────────────────────────────────────
const files = await walkFiles(DEST);
const entries = [];
for (const f of files) {
  const st = await fsp.stat(f);
  entries.push({ path: relPosix(DEST, f), size: st.size, hash: await hashFile(f) });
}
const rootHash = fingerprint(entries);
const totalBytes = entries.reduce((s, e) => s + e.size, 0);

await put('MANIFESTO.json', JSON.stringify({
  nome: NAME, versao: '2.0', geradoEm: nowIso(), tipo: 'backup-de-sobrevivencia-verificado',
  arquivos: entries.length, bytes: totalBytes, rootHash,
  nucleo: { versao: baby.version, projeto: 'crypy-server-bridge' },
  honestidade: 'Somente arquivos existentes no disco foram incluídos. Ausências em FALTANDO-NAO-RECEBIDO.md.',
  files: entries,
}, null, 2) + '\n');

const sumFile = path.join(DEST, 'ASSINATURA-DE-INTEGRIDADE.sha256');
const manifestHash = await hashFile(path.join(DEST, 'MANIFESTO.json'));
const allEntries = [...entries, { path: 'MANIFESTO.json', size: (await fsp.stat(path.join(DEST, 'MANIFESTO.json'))).size, hash: manifestHash }];
await fsp.writeFile(sumFile, allEntries.map((e) => `${e.hash}  ${e.path}`).sort().join('\n') + '\n', 'utf8');

await put('00-INDEX-E-VERSAO.txt', `CRYPY — BACKUP DE SOBREVIVÊNCIA (VERIFICADO)
============================================
Pacote: ${NAME}
Versão da arquitetura: 2.0 (CRYPY SERVER multi-inteligência)
Gerado em: ${nowIso()}
Núcleo: crypy-server-bridge v${baby.version}
Arquivos: ${allEntries.length + 1}   Bytes: ${totalBytes}
Fingerprint (SHA-256 do conjunto): ${rootHash}

ESTRUTURA
  00-INDEX-E-VERSAO.txt              este índice
  MANIFESTO.json                     inventário com hash por arquivo
  ASSINATURA-DE-INTEGRIDADE.sha256   conferência: sha256sum -c
  FALTANDO-NAO-RECEBIDO.md           o que NÃO está aqui (e não foi fingido)
  01-HISTORICO-CONVERSAS/            cronologia real, decisões, comandos
  02-DOCUMENTOS-OFICIAIS/            cartas v1.0 e v2.0 (transcrições) + auditoria da declaração recebida
  03-CODIGO-E-ESTRUTURA/             crypy-server-bridge completo, incluindo estado .baby
  04-ESQUADRAO-CRYPY/                um registro por identidade + registro central + registry.json
  05-SEGURANCA-E-PERMISSOES/         Regra de Ouro, MODO REAL, matriz de permissões, recuperação
  06-EVIDENCIAS/                     logs de teste, relatórios, autoanálises

ESQUADRÃO (estado real no momento do backup)
${agents.map((a) => `  ${a.name.padEnd(8)} ${a.state.padEnd(13)} ${a.origin}`).join('\n')}

AVISO DE SEGURANÇA
  Contém .baby/bus/master.key (chave do barramento). Guardar offline. Não publicar.

PRINCÍPIO
  Não estamos construindo uma IA para conversar sobre o CRYPY.
  Estamos construindo uma IA para trabalhar dentro do CRYPY.
  NEXUS conecta. Sensei conduz. BABY executa. O Esquadrão colabora.
`);

// ── 6. Empacotar e PROVAR que restaura ───────────────────────────────────────
const run = (cmd, args, cwd) => new Promise((resolve) => {
  const c = spawn(cmd, args, { cwd });
  let out = '';
  c.stdout.on('data', (d) => (out += d));
  c.stderr.on('data', (d) => (out += d));
  c.on('close', (code) => resolve({ code, out }));
});

const tarName = `${NAME}.tar.gz`;
const tarPath = path.join(backupDir, tarName);
const t = await run('tar', ['-czf', tarName, NAME], backupDir);
if (t.code !== 0) throw new Error(`tar falhou: ${t.out}`);
const tarHash = await hashFile(tarPath);
const tarSize = (await fsp.stat(tarPath)).size;

const verifyDir = path.join(backupDir, `.verificacao-${stamp}`);
await ensureDir(verifyDir);
const x = await run('tar', ['-xzf', tarPath, '-C', verifyDir], backupDir);
if (x.code !== 0) throw new Error(`extração falhou: ${x.out}`);
const extractedRoot = path.join(verifyDir, NAME);
const back = await walkFiles(extractedRoot);
const backMap = new Map();
for (const f of back) backMap.set(relPosix(extractedRoot, f), await hashFile(f));
const sumLines = (await fsp.readFile(path.join(extractedRoot, 'ASSINATURA-DE-INTEGRIDADE.sha256'), 'utf8')).trim().split('\n');
let conferidos = 0; const divergentes = []; const ausentes = [];
for (const line of sumLines) {
  const [hash, rel] = line.split('  ');
  const actual = backMap.get(rel);
  if (!actual) { ausentes.push(rel); continue; }
  if (actual !== hash) divergentes.push(rel); else conferidos++;
}
const restauravel = divergentes.length === 0 && ausentes.length === 0;
const extractedHash = fingerprint([...backMap].map(([p, h]) => ({ path: p, hash: h })));
await fsp.rm(verifyDir, { recursive: true, force: true });

const relVerificacao = [
  '# VERIFICAÇÃO DO BACKUP DE SOBREVIVÊNCIA', '',
  `**Pacote:** \`${tarName}\` · **gerado:** ${nowIso()}`, '',
  `- arquivos no pacote: ${allEntries.length + 1}`,
  `- bytes (árvore): ${totalBytes} · bytes (tar.gz): ${tarSize}`,
  `- SHA-256 do tar.gz: \`${tarHash}\``,
  `- fingerprint da árvore: \`${rootHash}\``, '',
  '## Teste de restauração (executado de verdade)', '',
  '1. \`tar -xzf\` do pacote em diretório temporário',
  '2. re-hash de cada arquivo extraído',
  '3. conferência contra \`ASSINATURA-DE-INTEGRIDADE.sha256\`', '',
  `- linhas conferidas: **${conferidos}**`,
  `- divergentes: **${divergentes.length}**`,
  `- ausentes: **${ausentes.length}**`,
  `- fingerprint após extração: \`${extractedHash}\``,
  `- **resultado: ${restauravel ? 'RESTAURÁVEL E ÍNTEGRO' : 'FALHOU'}**`, '',
  '## Limite honesto do escopo', '',
  'Este pacote protege **o que existe neste workspace**. Não contém o histórico de sessões',
  'anteriores, os PDFs originais, \`baby-core.js\`, \`baby-bridge.js\`, \`Memory Boost\`, WEB3.1,',
  'comprovantes, publicações ou ativos visuais — nada disso foi recebido.',
  'Lista completa em \`FALTANDO-NAO-RECEBIDO.md\`.', '',
].join('\n');
await fsp.writeFile(path.join(backupDir, `VERIFICACAO-${NAME}.md`), relVerificacao, 'utf8');
await fsp.writeFile(path.join(evidenceDir, 'BACKUP-VERIFICADO.md'), relVerificacao, 'utf8');
await fsp.writeFile(path.join(backupDir, `${tarName}.sha256`), `${tarHash}  ${tarName}\n`, 'utf8');

await baby.audit.append({ action: 'backup.sobrevivencia', target: tarName, ok: restauravel, detail: { arquivos: allEntries.length + 1, bytes: totalBytes, rootHash, tarHash, conferidos, divergentes: divergentes.length, ausentes: ausentes.length } });
const snap = await baby.vault.snapshot({ root: DEST, label: `sobrevivencia-${stamp}` });
const vv = await baby.vault.verify(snap.id);

log('');
log(`✔ pacote: ${tarPath}`);
log(`  arquivos: ${allEntries.length + 1} · bytes: ${totalBytes} · tar.gz: ${tarSize}`);
log(`  sha256(tar.gz): ${tarHash}`);
log(`  restauração testada: ${conferidos} conferidos, ${divergentes.length} divergentes, ${ausentes.length} ausentes → ${restauravel ? 'ÍNTEGRO' : 'FALHOU'}`);
log(`✔ cofre do pacote: ${snap.id} (${vv.ok ? 'íntegro' : 'FALHA'})`);
log(`✔ relatório: ${path.join(backupDir, `VERIFICACAO-${NAME}.md`)}`);
log('⚠ ausências declaradas em FALTANDO-NAO-RECEBIDO.md — nada foi fabricado.');
