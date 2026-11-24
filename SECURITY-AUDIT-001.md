# CRYPY — SECURITY AUDIT 001
**Data:** 2026-11-22  
**Escopo:** revisão estática inicial dos repositórios WEB3.1, HD-MATRIZ e SECURYTY-SUBC.  
**Branch de trabalho:** `security/cf-web-system-baseline-2026-11-21`  
**Estado:** auditoria documental/estática inicial; NÃO homologado.

## 1. Regra de segurança
Este relatório não autoriza alterações na branch `main`, deploys, mudanças de variáveis/segredos, operações em volumes persistentes, restaurações ou sincronização de dados privados. A HD-MATRIZ permanece protegida. Não declarar o BABY pronto para operação plena antes dos testes e da homologação.

## 2. Constatações verificadas por leitura
- Os três repositórios possuem uma branch de trabalho de segurança e receberam o mesmo `.gitignore` na raiz dessa branch.
- A raiz `.gitignore` foi relida nos três repositórios e apresentou o mesmo SHA de conteúdo: `8595be253e88960ba09245172fe7bef999d69259`.
- O contrato `crypy-sync/README.md` define HD-MATRIZ como autoridade privada, WEB3.1 como cliente público e SECURYTY-SUBC como camada de revisão. Também proíbe replicar segredos, memória, evidências, snapshots, sessões e backups privados.
- O manifesto de sincronização proíbe push direto em `main`, exige promoção por Pull Request e bloqueia sincronização destrutiva.
- A leitura do backend em HD-MATRIZ encontrou código para autenticação por sessão, token Bearer opcional, allowlist CORS, limite de corpo HTTP, política de raízes/modos, snapshots SHA-256, verificação de cofre e trilha de auditoria encadeada.
- O código de restauração do cofre usa dry-run por padrão e exige aprovação para execução destrutiva.
- O registro de arquitetura de segurança está em `WEB3.1/cf-web-system/CRYPY-SECURITY-ARCHITECTURE.md`. A pasta `cf-web-system` não está uniformizada: em WEB3.1 é diretório; em HD-MATRIZ e SECURYTY-SUBC aparece como arquivo de 1 byte. Não alterar automaticamente esse caminho.

## 3. Lacunas e riscos que permanecem
1. **Âncora externa:** a trilha encadeada e sua âncora local estão no mesmo armazenamento. Falta assinatura ou âncora externa protegida contra adulteração conjunta.
2. **MFA/TOTP:** não foi comprovada implementação e teste de segundo fator administrativo.
3. **Limite de tentativas:** o controle de tentativas observado é mantido em memória do processo; falta avaliar proteção distribuída, proxy e múltiplas réplicas.
4. **Sessões:** sessões também são mantidas em memória; falta validar expiração, logout, reinício, revogação e comportamento com múltiplas réplicas.
5. **Permissões efetivas:** código de política existe, mas falta testar a configuração real de raízes, volume, identidades e operações de leitura/escrita no ambiente de execução.
6. **Dropbox:** README classifica o adaptador Dropbox como planejado. A presença de uma variável com nome relacionado não comprova OAuth/PKCE nem sincronização operacional.
7. **Recuperação:** existem mecanismos e testes no código, mas não há evidência nesta revisão de um ensaio de restauração isolada executado e aprovado.
8. **Testes de segurança:** a existência de testes e workflows não equivale a execução independente de todos os cenários. Nesta etapa não foi executado `npm test` localmente nem teste dinâmico de intrusão.
9. **Proteção Git:** `.gitignore` não remove arquivos já versionados, não revoga credenciais expostas e não torna pastas privadas. É necessário verificar histórico e permissões separadamente.
10. **Organização da documentação:** o caminho `cf-web-system` diverge entre os três repositórios e precisa de decisão de migração não destrutiva antes de padronizar diretórios.

## 4. Plano obrigatório antes da homologação
- [ ] Verificar visibilidade e permissões efetivas dos três repositórios e regras de proteção das branches.
- [ ] Examinar histórico Git para possíveis segredos já versionados; não imprimir valores sensíveis nos relatórios.
- [ ] Executar testes automatizados do backend em ambiente isolado e guardar logs sem credenciais.
- [ ] Testar acessos sem autenticação, sessão expirada, token inválido/revogado, origem não permitida, tentativas repetidas e limites de requisição.
- [ ] Testar leitura versus escrita, caminhos fora das raízes, traversal, links simbólicos e operações destrutivas em sandbox.
- [ ] Testar corrupção, remoção e truncamento de objetos, manifestos e logs; adicionar âncora/assinatura externa antes de declarar autenticidade forte.
- [ ] Executar restauração em destino isolado, comparar hashes antes/depois e provar que a HD-MATRIZ original não foi alterada.
- [ ] Implementar e testar MFA/TOTP e estratégia de revogação/rotação de credenciais.
- [ ] Implementar Dropbox OAuth 2.0 Authorization Code + PKCE em sandbox, com escopos mínimos, validação de state, versionamento e sem sobrescrita automática.
- [ ] Padronizar documentação `cf-web-system` por migração aditiva, após inventário e aprovação.
- [ ] Abrir Pull Requests separados para qualquer promoção; não fazer merge automático para `main`.
- [ ] Registrar evidências reproduzíveis e obter aprovação explícita do Sensei.

## 5. Estado MODO REAL
| Etapa | Estado |
|---|---|
| Baseline `.gitignore` nas branches de segurança | Aplicada e conferida |
| Leitura estática inicial dos contratos e backend | Executada |
| Correções de código de segurança | Não aplicadas nesta etapa |
| Testes dinâmicos independentes | Pendentes |
| Verificação de segredos no histórico | Pendente |
| Âncora externa e MFA/TOTP | Pendentes |
| Restauração isolada | Pendente |
| Homologação técnica | Pendente |
| Liberação plena do BABY | Bloqueada |

**Conclusão:** há controles implementados no código, mas proteção efetiva e homologação ainda não estão demonstradas. Este relatório registra constatações e próximos testes; não é certificado de segurança.

**NEXUS conecta; Sensei conduz.**
