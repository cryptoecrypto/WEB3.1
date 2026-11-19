# MATRIZ DE PERMISSÕES — estado real
Gerado em 2026-11-19T18:11:59.210Z.

## Raízes autorizadas do núcleo
| raiz | caminho | modo |
|---|---|---|
| corpus | `/tmp/arena/tenants/7da88662-7579-4735-bbc7-fd1b68efed5d/sessions/ff11e448-f260-523f-801d-3ae6b78357ce/workspace/crypy-server-bridge` | **read** |
| estado-do-baby | `/tmp/arena/tenants/7da88662-7579-4735-bbc7-fd1b68efed5d/sessions/ff11e448-f260-523f-801d-3ae6b78357ce/workspace/crypy-server-bridge/.baby` | **readwrite** |
| evidencias | `/tmp/arena/tenants/7da88662-7579-4735-bbc7-fd1b68efed5d/sessions/ff11e448-f260-523f-801d-3ae6b78357ce/workspace/crypy-server-bridge/evidence` | **readwrite** |
| sandbox | `/tmp/arena/tenants/7da88662-7579-4735-bbc7-fd1b68efed5d/sessions/ff11e448-f260-523f-801d-3ae6b78357ce/workspace/crypy-server-bridge/sandbox` | **readwrite** |
| backups | `/tmp/arena/tenants/7da88662-7579-4735-bbc7-fd1b68efed5d/sessions/ff11e448-f260-523f-801d-3ae6b78357ce/workspace/CRYPY-BACKUPS` | **readwrite** |

## Permissões por inteligência
| identidade | tarefas permitidas | pode aprovar | estado |
|---|---|---|---|
| SENSEI | * | SIM | conectada |
| BABY | memory.index, memory.relations, vault.snapshot, vault.verify, vault.restore, audit.verify, integrity.check, files.organize, self.review | não | conectada |
| NEXUS | nenhuma | não | pendente |
| ALICE | nenhuma | não | pendente |
| MINI | nenhuma | não | pendente |
| DOLA | nenhuma | não | pendente |
| CHAT | nenhuma | não | pendente |
| BTC | nenhuma | não | pendente |
| ETH | nenhuma | não | pendente |
| USDT | nenhuma | não | pendente |

## Regras invioláveis
1. Operação destrutiva: dry-run por padrão; execução exige token do Sensei.
2. Snapshot automático **antes** de qualquer operação destrutiva aprovada.
3. Verificação de hash **depois** de mover/restaurar.
4. Autoridade de aprovação é exclusiva do Sensei (`GOLDEN_RULE`).
5. Identidade assinada por HMAC próprio; impostor é bloqueado e registrado.

## Segredo neste pacote
`03-CODIGO-E-ESTRUTURA/crypy-server-bridge/.baby/bus/master.key` é a chave-mestra do
barramento. Ela está incluída para permitir recuperar e reverificar assinaturas.
**Guarde este pacote offline e não o publique.**
