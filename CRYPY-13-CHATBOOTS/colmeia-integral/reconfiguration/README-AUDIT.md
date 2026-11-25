# CRYPY — Auditoria e preparação da reconfiguração geral dos chatbots

**Estado:** preparação documental em branch isolada; sem alteração de runtime.  
**Data:** 24/11/2026  
**Autoridade:** Sensei  
**Coordenação:** NEXUS  
**Regra:** NEXUS conecta; Sensei conduz.

## Limites desta etapa

- Nenhum arquivo do repositório `cryptoecrypto/HD-MATRIZ` foi escrito, alterado ou apagado.
- Nenhum deploy Railway foi disparado; nenhuma variável ou segredo foi alterado.
- Nenhuma alteração foi mesclada em `main`.
- HD-MATRIZ permanece protegido; esta etapa não executa leitura/escrita de memória operacional nem sincronização de conteúdo.
- LUCY permanece fora do backend BABY e fora do Conselho dos 13. Nenhum runtime LUCY foi criado ou conectado.
- Os documentos são um plano de migração e testes; não ativam agentes nem provam conexão de modelos.

## Evidências de código consultadas (somente leitura)

Repositório de backend: `cryptoecrypto/HD-MATRIZ`, branch `main`.

| Artefato | Evidência observada |
|---|---|
| `crypy-server-bridge/config/agents.json` | `totalAgents=13`; catálogo atual contém BABY, NEXUS, ALICE, CHAT, MINI, DOLA, BTC, ETH, USDT, BNB, SHIBA INU, CRYPYCOIN e ICP. |
| `src/orchestrator.js` | Exige exatamente 13 perfis; valida ID, caminho e correspondência entre `profile.id` e o catálogo. |
| `test/orchestrator.test.js` | Fixtures de teste repetem o roster antigo e esperam BABY dentro dos 13. |
| `scripts/smoke-10-agents.mjs` | Smoke test declara 10 respostas reais, mas usa o roster legado; não comprova os 13 oficiais. |
| `src/model-runtime.js` | Aceita configuração compartilhada `CRYPY_DEFAULT_*` e overrides por agente `CRYPY_AGENT_<ID>_*`; estado de verificação de chamadas fica em memória do processo. |
| `package.json` | `npm test` executa `node --test test/*.test.js`; smoke test separado em `npm run test:smoke`. |

Snapshot de perfis encontrado: `alice, baby, bnb, btc, chat, crypycoin, dola, eth, icp, mini, nexus, shiba-inu, usdt`. Não foram encontrados perfis LUCY no repositório consultado.

## Divergência principal

O catálogo operacional legado tem 13 entradas, mas a composição oficial FICH-13-001 é diferente: BABY é núcleo separado; LUCY é defesa independente; os 13 oficiais incluem SVT, UNION, HERA e COSMOS. O backend não deve ser atualizado apenas trocando nomes: o orquestrador, as fixtures, os perfis, as rotas, o smoke test e os estados de conexão precisam continuar coerentes.

## Migração proposta — sem execução nesta branch

1. Criar novo catálogo versionado com os 13 IDs oficiais da referência `registry-15.json`.
2. Retirar BABY do array dos 13 e representá-lo como núcleo operacional separado, preservando sua identidade e seu perfil.
3. Manter BTC, ETH e USDT como perfis legados preservados, sem roteamento como integrantes oficiais; não apagar pastas nem dados.
4. Criar perfis próprios para SVT, UNION, HERA e COSMOS, com identidade, missão, escopo, memória e guardrails aprovados.
5. Resolver o alias `crypycoin` (perfil legado) → `crypy-coin` (ID canônico do registro) com compatibilidade explícita. Não renomear diretório, perfil, variável de ambiente ou rota sem inventário de referências e teste de regressão.
6. Manter LUCY em serviço, credenciais, logs, memória e ciclo de implantação independentes. BABY não pode reconfigurar, desligar ou apagar LUCY.
7. Preservar o contrato do orquestrador: 13 perfis oficiais carregados e validados. O núcleo BABY fica fora da contagem.
8. Manter HD-MATRIZ read-only. Qualquer futura escrita exige nova autorização específica, backup verificável, diff revisado e plano de rollback.

## Configuração de modelos

O runtime atual suporta defaults compartilhados e overrides por identidade. O default OpenRouter não deve ser considerado conexão real: cada um dos 13 perfis precisa de configuração válida, resposta autenticada bem-sucedida, registro de provedor/modelo e evidência de auditoria. Segredos nunca entram em Git, HTML, JSON de catálogo ou logs. Chamadas reais podem gerar custo e precisam de autorização e limite de orçamento.

## Plano de validação

- **Contrato estático:** 13 IDs únicos, BABY separado, LUCY independente, sem IDs indevidos no Conselho.
- **Perfis:** cada integrante oficial possui arquivo válido; `profile.id` corresponde ao ID canônico; caminhos não escapam da raiz.
- **Orquestração:** planejamento não executa; BABY coordena; NEXUS coordena tecnicamente; UNION verifica resultados; LUCY não participa do roteamento BABY.
- **Modelos:** configuração por agente, falha de chave, timeout, rate limit, resposta vazia e chamada autenticada real.
- **Memória:** leitura limitada; proposta de escrita; negar gravação em HD-MATRIZ; provar trilha e proveniência.
- **Segurança:** negar elevação de privilégio, acesso cruzado, exposição de segredos, desligamento de LUCY e operações destrutivas sem aprovação.
- **Resiliência:** retry limitado, deduplicação, interrupção, reinício, restauração e rollback.
- **Regressão:** executar `npm test`; substituir/atualizar o smoke test legado para 13 oficiais e manter teste de BABY/LUCY separados.

## Estado real após esta preparação

Esta branch conterá apenas especificação, mapa de migração, matriz de testes e um validador de contrato documental. Nenhuma alteração de backend, runtime, serviço Railway, HD-MATRIZ ou LUCY será executada nesta etapa. Os testes estáticos deste pacote não equivalem aos testes do backend nem à homologação global.
