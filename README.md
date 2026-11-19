# crypy-server-bridge — núcleo operacional CRYPY / BABY (v2.0)

Implementação de referência do **CRYPY SERVER**: registro central de inteligências,
barramento assinado, memória com integridade, autonomia com permissões, autoproteção
verificável e evolução contínua. **Zero dependências externas** (Node ≥ 20).

```bash
node --test test/                 # 72 testes reais (incluem ataques simulados)
node src/server.js                # núcleo + painel em http://0.0.0.0:8787
node bin/baby.js status           # estado das 5 capacidades + saúde ao vivo
node scripts/registrar-evidencia.mjs      # roda testes, registra provas, PARA na aprovação
node scripts/backup-sobrevivencia.mjs     # pacote real de backup + SHA-256 + tar.gz
```

## O que já é real (verificável)

| peça | prova |
|------|-------|
| Inventário + SHA-256 + diff + busca + grafo de módulos | `test/memory.test.js` |
| Cofre com dedupe, re-hash, detecção de corrupção e restauração | `test/vault.test.js` |
| Trilha append-only encadeada + âncora anti-truncamento | `test/audit.test.js` |
| Política: jail de raízes, somente leitura, symlink, dry-run, token | `test/policy.test.js` |
| MODO REAL: 6 estados, evidência obrigatória, sem autoaprovação | `test/ledger.test.js` |
| Orquestrador: nega, protege antes, verifica depois, registra | `test/baby.test.js` |
| Registro Central + Regra de Ouro + sondagem de integração | `test/registry.test.js` |
| Barramento assinado, anti-impostor, fila para pendentes | `test/bus.test.js` |
| Núcleo HTTP respondendo de verdade | `test/server.test.js` |

## O que NÃO existe aqui (e não é fingido)

`baby-core.js`, `baby-bridge.js`, `Memory Boost`, WEB3.1, HDs, Dropbox e as IAs externas
(NEXUS, ALICE, MINI, DOLA, CHAT, BTC/ETH/USDT) **não foram recebidos nem integrados**.
Estão registrados como `planejado` / `pendente`, com o contrato de entrada documentado
em `docs/ARQUITETURA.md §5`. Nenhuma linha deste código afirma o contrário.

## Mapa

```
src/      núcleo (config, policy, audit, memory, vault, ledger, registry, bus, tasks, baby, server)
bin/      CLI do BABY
public/   painel do núcleo (HTML inline, sem CDN)
test/     72 testes (node:test)
docs/     MODO-REAL, ARQUITETURA v2.0, REGRA-DE-OURO
scripts/  registrar-evidencia, backup-sobrevivencia
evidence/ logs de teste, relatórios, autoanálises
.baby/    estado persistido (ledger, registro, trilha, memória, cofre, barramento)
```

> Não estamos construindo uma IA para conversar sobre o CRYPY.
> Estamos construindo uma IA para trabalhar dentro do CRYPY.
 
---

## CRYPY TERMINAL CENTRAL v1.1 — integração

O Terminal Central adiciona inventário e auditoria estrutural em modo somente leitura, preservando o núcleo CRYPY SERVER existente.

```bash
npm run terminal   # inicia o servidor existente através da entrada do Terminal
npm run inventory  # inventário somente leitura da raiz WEB3.1
npm run audit      # auditoria estrutural
npm test           # suíte original de testes
```

Consulte [TERMINAL-README.md](TERMINAL-README.md) para os limites operacionais, comandos e regras de segurança. O workflow [validate.yml](.github/workflows/validate.yml) executa testes e auditorias em push, pull request e rotina diária. A conclusão do workflow não substitui a aprovação humana do Sensei nem comprova implantação em produção.
