# CRYPY — Arquitetura de Segurança da Colmeia

**Status:** baseline documental / proposta de implementação controlada  
**Data:** 2026-11-21  
**Pasta canônica:** `cf-web-system`  
**Central de controle:** repositório `cryptoecrypto/SECURYTY-SUBC`

## 1. Regra de nomenclatura e distribuição

A pasta oficial de segurança nos três repositórios é `cf-web-system`:

- `cryptoecrypto/HD-MATRIZ` — matriz e serviços de memória; origem protegida.
- `cryptoecrypto/WEB3.1` — site e interfaces públicas do ecossistema.
- `cryptoecrypto/SECURYTY-SUBC` — central de segurança e futuro painel de controle.

Os três diretórios devem manter uma base documental compatível. O repositório SECURYTY-SUBC é a fonte de governança e coordenação; os outros dois mantêm os componentes e adaptadores locais correspondentes. Sincronização deve ser versionada, auditável e não destrutiva.

## 2. Responsabilidade do painel central

O painel central, a ser implementado em SECURYTY-SUBC, deverá consolidar o estado de segurança da Colmeia sem presumir que um componente está protegido apenas porque está listado.

Escopo funcional planejado:
- inventário de repositórios, serviços, módulos e versões;
- estado de autenticação, sessões e fatores adicionais;
- matriz de permissões de leitura, escrita e operações destrutivas;
- integridade de arquivos, snapshots e manifestos;
- estado de backups, verificações e restaurações isoladas;
- eventos de auditoria, alertas e incidentes;
- estado dos conectores e sincronizações;
- trilha de evidências, responsável, horário e resultado de cada verificação.

Cada indicador deverá distinguir: **não verificado**, **planejado**, **implementado**, **teste executado**, **aprovado** e **homologado**. Não apresentar um estado como aprovado sem evidência verificável.

## 3. Regras de segurança obrigatórias

1. Não armazenar senhas, tokens, chaves privadas, códigos MFA ou segredos em arquivos versionados, logs ou backups.
2. Usar menor privilégio e separar leitura, escrita, administração e aprovação de operações destrutivas.
3. Exigir autenticação forte para ações administrativas; MFA/TOTP permanece pendente até implementação e teste comprovados.
4. Proteger a integridade dos backups com hashes e autenticação criptográfica verificável. Uma âncora guardada no mesmo volume dos dados não é suficiente contra adulteração conjunta.
5. Manter evidências de auditoria append-only e, para resistência a adulteração, ancoragem externa protegida.
6. Executar restaurações primeiro em ambiente isolado, com dry-run, aprovação explícita e revalidação.
7. Sincronizar de forma aditiva e revisável; nunca sobrescrever ou apagar conteúdo original automaticamente.
8. Não liberar operação plena do BABY antes da auditoria e homologação.

## 4. Proteção especial da HD-MATRIZ

A HD-MATRIZ permanece como fonte protegida. Este documento não autoriza alterações em arquivos existentes, configurações de produção, variáveis, segredos, volumes persistentes ou deploys. Qualquer implementação futura deve ocorrer em branch isolada, com revisão e aprovação próprias. A branch desta baseline é documental e não altera a branch `main`.

## 5. Critérios mínimos para considerar o painel operacional

- inventário obtido de fontes reais e atualizado;
- identidade e permissões verificadas por testes;
- telemetria autenticada, com origem e horário;
- integridade e autenticidade de backups verificadas;
- restauração isolada demonstrada com evidências;
- trilha de auditoria protegida contra alteração;
- testes negativos de acesso indevido;
- alertas testados;
- documentação de limitações e estado de cada controle;
- aprovação explícita e homologação registrada.

## 6. Estado desta entrega

Esta entrega registra a arquitetura, a nomenclatura correta e a distribuição de responsabilidades. **Não implementa ainda o painel funcional, não sincroniza automaticamente os diretórios e não comprova controles operacionais.** Esses trabalhos exigem implementação incremental, testes e evidências próprias.
