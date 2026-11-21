# CRYPY / BABY I.A. — Baseline e auditoria de segurança

**Data da revisão:** 2026-11-21  
**Repositório deste registro:** `cryptoecrypto/WEB3.1`  
**Backend observado:** serviço Railway `baby-site-auth`, projeto `CRYPY-BABY-Backend`  
**Estado:** revisão documental e de código concluída parcialmente; controles existentes identificados; lacunas de implementação e testes continuam abertas.

## Regra de liberação

O BABY não deve ser liberado para operação plena até que os controles abaixo tenham sido implementados, testados em ambiente apropriado e documentados com evidências reproduzíveis. Serviço online ou deploy bem-sucedido não equivale a homologação de segurança.

## 1. Constatações verificadas nesta revisão

A revisão consultou os arquivos de backend no repositório privado `cryptoecrypto/HD-MATRIZ` em modo somente leitura e a configuração/estado do serviço Railway. Nenhum arquivo da HD MATRIZ, variável, volume ou configuração de produção foi alterado nesta etapa.

### Controles já presentes no código-fonte

- `src/memory.js`: inventário de arquivos com SHA-256, comparação de alterações e histórico.
- `src/vault.js`: snapshots aditivos content-addressed, manifestos, deduplicação e verificação de hashes; restauração com dry-run por padrão, aprovação e revalidação antes da cópia.
- `src/audit.js`: trilha append-only encadeada por hashes, com verificação de sequência, conteúdo e âncora local.
- `src/policy.js`: raízes permitidas, modos read/readwrite e exigência de aprovação para operações destrutivas efetivas.
- `src/auth.js`: senha administrativa mínima de 24 caracteres, sessões em cookie HttpOnly/SameSite=Strict/Secure em produção, expiração e bloqueio temporário após tentativas inválidas.
- `src/server.js`: autenticação das rotas `/api/*`, comparação de token em tempo constante, allowlist CORS exata, limite de corpo HTTP e cabeçalhos defensivos.
- `test/vault.test.js` e `test/server.test.js`: existem casos automatizados para corrupção/ausência de blobs, manifesto adulterado, restauração, autenticação, CORS, bloqueio sem login e outras rotas.

**Limite da evidência:** inspeção de código e existência de testes não comprovam que os testes passaram nesta revisão nem que todos os cenários foram exercitados em produção.

### Estado observado no Railway

- Serviço `baby-site-auth`: estado Online.
- Último deployment consultado: `SUCCESS`.
- Uma réplica ativa; sem falhas recentes ou alertas reportados no resumo consultado.
- Volume persistente de 500 MB montado em `/data`.
- Nomes de variáveis de configuração relevantes presentes: `CRYPY_ADMIN_PASSWORD`, `CRYPY_API_TOKEN`, `CRYPY_ALLOWED_ORIGINS`, `CRYPY_SENSEI_TOKEN`, `CRYPY_DATA_DIR`, `CRYPY_EVIDENCE_DIR`, `CRYPY_SANDBOX_DIR` e `DROPBOX_APP_KEY`.
- Os valores das variáveis foram ocultados e não foram lidos nem alterados.

**Limite da evidência:** estado Online/SUCCESS e presença de nomes de variáveis não comprovam que os valores sejam fortes, corretos, rotacionados ou que a configuração completa esteja segura.

## 2. Integridade criptográfica e backups

**Parcialmente implementado no código.** O cofre calcula SHA-256 por objeto e raiz do manifesto, verifica objetos ausentes/corrompidos e revalida antes da restauração. Snapshots são aditivos e não sobrescrevem os objetos existentes.

**Lacuna importante:** manifesto e âncora de auditoria ficam no mesmo armazenamento persistente. Isso detecta corrupção acidental e adulterações parciais, mas não prova autenticidade contra um invasor capaz de alterar simultaneamente objetos, manifestos e âncora. Falta uma âncora externa ou assinatura criptográfica protegida separadamente.

Ações pendentes:
- Proteger manifestos por assinatura ou âncora externa imutável, com chave fora do volume de dados.
- Testar corrupção de manifesto, blob, remoção e truncamento da trilha no ambiente de teste.
- Criar cópia independente e testar recuperação em ambiente isolado.
- Não restaurar nem sincronizar diretamente sobre a HD MATRIZ.

## 3. Permissões de leitura e gravação

**Parcialmente implementado no código.** A política separa raízes e modos `read`/`readwrite`, e operações destrutivas exigem aprovação.

Ações pendentes:
- Auditar a configuração efetiva de raízes e modos em produção sem expor caminhos ou segredos em relatórios públicos.
- Testar identidade somente-leitura contra operações de escrita e exclusão.
- Confirmar que rotas e tarefas não oferecem bypass da política.
- Revisar permissões do volume, do serviço Railway e dos tokens externos.

## 4. Autenticação e acesso indevido

**Parcialmente implementado no código e no serviço ativo.** Há autenticação administrativa por sessão e suporte a Bearer token, CORS com origens exatas e limite temporário de tentativas inválidas.

Ações pendentes:
- Testar sessão ausente/expirada, logout, token inválido/revogado, origem não autorizada e tentativas repetidas.
- Revisar rotação e armazenamento dos segredos no Railway; esta revisão não leu seus valores.
- Avaliar proteção contra CSRF, limites distribuídos de tentativas e invalidação de sessões em múltiplas réplicas.
- Não foi identificado fluxo OAuth 2.0 Authorization Code + PKCE nem TOTP no código inspecionado; esses controles permanecem pendentes.

## 5. Dropbox e armazenamento externo

**Não implementado como integração operacional no backend inspecionado.** O README do serviço classifica Dropbox e sincronização de outros HDs como adaptadores planejados. A variável `DROPBOX_APP_KEY` existe, mas sua presença não comprova OAuth, PKCE, escopos, armazenamento seguro de tokens ou sincronização.

Ações pendentes:
- Projetar OAuth 2.0 Authorization Code + PKCE, validação de `state`, escopos mínimos, refresh/revogação e armazenamento de tokens exclusivamente no backend.
- Implementar operações de upload/download com versionamento, sem sobrescrita automática.
- Verificar hash antes e depois de cada transferência.
- Excluir segredos, memória privada, evidências e backups de qualquer fluxo para repositórios públicos.
- Executar primeiro em sandbox e com conta/pasta de teste.

## 6. Recuperação e continuidade

**Parcialmente implementado no código; recuperação real não homologada.** A restauração tem dry-run padrão, aprovação e verificação de hash após a cópia.

Ações pendentes:
- Executar restauração isolada com dados de teste.
- Demonstrar que a HD MATRIZ original permanece inalterada.
- Registrar RPO/RTO, inventário restaurado, hashes e resultado.
- Exigir aprovação humana antes de promover qualquer restauração para ambiente operacional.

## 7. Estado consolidado

| Controle | Estado em 2026-11-21 |
|---|---|
| Baseline documental | Registrada |
| Hash SHA-256 em memória/cofre | Implementado no código; teste de produção pendente |
| Manifestos e snapshots aditivos | Implementados no código; proteção externa pendente |
| Trilha de auditoria encadeada | Implementada no código; âncora externa pendente |
| Política read/readwrite | Implementada no código; auditoria efetiva pendente |
| Sessão administrativa e Bearer | Implementados no código; testes independentes pendentes |
| CORS por allowlist | Implementado no código; teste de produção pendente |
| OAuth 2.0 + PKCE Dropbox | Pendente |
| TOTP/MFA administrativo | Pendente |
| Testes de acesso indevido | Parcialmente cobertos por testes existentes; execução/auditoria pendente |
| Restauração isolada | Testes automatizados existentes; ensaio operacional pendente |
| Homologação técnica independente | Pendente |
| Liberação plena do BABY | Bloqueada até evidências e homologação |

## 8. Proteção da HD MATRIZ

A HD MATRIZ permanece como fonte original protegida. Esta revisão foi somente leitura. Este registro não autoriza alterações, migrações, exclusões, sincronizações destrutivas, mudanças de variáveis, deploys ou restaurações sobre ela. Qualquer operação futura exige autorização específica, backup verificado e plano de reversão.

## 9. Critério de conclusão

Um item só pode mudar para **concluído** quando houver implementação identificável, teste reproduzível, evidência registrada e revisão. Planejamento, documentação, código presente, testes apenas escritos ou deploy bem-sucedido não equivalem a homologação.

## Referências de orientação

- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework

---
**Decisão CRYPY:** proteger a memória antes de ampliar a autonomia.  
**NEXUS conecta; Sensei conduz.**