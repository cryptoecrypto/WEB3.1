# CRYPY / BABY I.A. — Baseline de Segurança

**Data:** 2026-11-21  
**Repositório:** `cryptoecrypto/WEB3.1`  
**Estado:** protocolo registrado em branch isolada; implementação técnica e homologação pendentes.

## Regra de liberação

O BABY não deve ser liberado para operação plena até que os controles abaixo tenham sido implementados, testados e documentados com evidências reproduzíveis. Este documento, por si só, não comprova que qualquer controle já esteja ativo.

## 1. Integridade criptográfica dos backups

- Gerar um manifesto SHA-256 para cada conjunto de backup, cobrindo caminho relativo, tamanho em bytes e hash de cada arquivo.
- Guardar o manifesto separado do conjunto de dados e protegê-lo contra alteração não autorizada.
- Verificar novamente os hashes antes de aceitar, sincronizar ou restaurar um backup.
- Rejeitar arquivos ausentes, extras inesperados ou divergências de hash; registrar o resultado da validação.
- Não incluir tokens, senhas, segredos OAuth, códigos TOTP ou chaves privadas nos backups.
- Definir retenção e cópias independentes; nunca sobrescrever automaticamente a HD MATRIZ.

**Evidência exigida:** manifesto SHA-256, relatório de validação e teste negativo que demonstre rejeição após alteração intencional de um arquivo.

## 2. Permissões de leitura e gravação

- Inventariar identidades, serviços, tokens e diretórios que acessam os dados.
- Aplicar menor privilégio: leitura separada de gravação; exclusão e administração restritas.
- Restringir credenciais a escopos mínimos e ambientes específicos.
- Verificar permissões de repositório, armazenamento, API e sincronizador.
- Registrar concessões, revogações e operações administrativas.
- Não colocar segredos em HTML público, JavaScript entregue ao navegador, commits ou arquivos de configuração versionados.

**Evidência exigida:** matriz identidade × recurso × permissão, configuração revisada e testes comprovando que uma identidade somente-leitura não consegue gravar ou excluir.

## 3. Autenticação e acesso indevido

- Concluir OAuth 2.0 Authorization Code com PKCE para integrações aplicáveis; validar `state`, `redirect_uri`, expiração e revogação.
- Manter tokens e segredos somente em backend/secret manager; nunca no cliente público.
- Exigir MFA/TOTP para funções administrativas quando suportado, com proteção contra repetição e limitação de tentativas.
- Negar por padrão rotas e operações sem autenticação e autorização válidas.
- Validar autorização no servidor em cada operação; ocultar botões na interface não é controle de segurança.
- Registrar eventos de autenticação e autorização sem registrar tokens, senhas ou códigos.

**Evidência exigida:** testes de sessão ausente/expirada, token inválido/revogado, usuário sem permissão, tentativa de repetição e limitação de tentativas.

## 4. Recuperação e continuidade

- Restaurar primeiro em ambiente isolado, nunca diretamente sobre a HD MATRIZ.
- Validar hashes, estrutura, contagem e legibilidade dos arquivos restaurados.
- Documentar RPO/RTO pretendidos, responsáveis e sequência de recuperação.
- Fazer simulação de perda/corrupção e registrar tempos, falhas e resultado.
- Exigir aprovação humana antes de qualquer promoção de restauração para ambiente operacional.

**Evidência exigida:** relatório de restauração isolada, comparação de integridade antes/depois e aprovação registrada.

## 5. Portões de auditoria

| Controle | Estado em 2026-11-21 |
|---|---|
| Regras e baseline documental | Registrado nesta branch |
| SHA-256 em backups reais | Pendente de implementação e teste |
| Auditoria de permissões | Pendente |
| OAuth/PKCE e gestão segura de tokens | Pendente de verificação |
| MFA/TOTP administrativo | Pendente de implementação e teste |
| Testes de acesso indevido | Pendente |
| Restauração isolada | Pendente |
| Auditoria técnica independente | Pendente |
| Homologação geral | Bloqueada |

## 6. Proteção da HD MATRIZ

A HD MATRIZ é tratada como fonte original protegida. Esta baseline não autoriza alterações, migrações, exclusões, sincronizações destrutivas nem restaurações sobre ela. Qualquer operação desse tipo exige autorização específica, backup verificado e plano de reversão.

## 7. Critério de conclusão

Um item só pode mudar para **concluído** quando houver implementação identificável, teste reproduzível, evidência registrada e revisão. Planejamento, documentação ou criação de branch não equivalem a implementação, teste ou homologação.

## Referências de orientação

- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework

---
**Decisão CRYPY:** proteger a memória antes de ampliar a autonomia.  
**NEXUS conecta; Sensei conduz.**