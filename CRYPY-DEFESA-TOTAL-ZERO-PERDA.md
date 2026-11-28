# CRYPY — DEFESA TOTAL
## Plano de implantação e homologação

**Status:** proposta aprovada para planejamento; implementação técnica parcial ou pendente conforme evidências abaixo.  
**Data da verificação:** 26/11/2026.  
**Repositório examinado:** `cryptoecrypto/WEB3.1`, branch `main`.  
**Regra central:** proteger o que existe antes de construir o que falta.

> Este documento não declara que o universo CRYPY está integralmente protegido. Registra evidências observadas no GitHub e define trabalho, critérios de aceitação e limites. Contas externas, dispositivos, cofres físicos, Dropbox e HDs locais não foram auditados por este documento.

## 1. Salvaguardas obrigatórias

1. Não modificar nem sobrescrever arquivos originais da BABY, HD MATRIZ, páginas especiais ou estrutura da WEB3.1 sem autorização específica.
2. Fazer inventário e registrar hashes antes de qualquer alteração crítica.
3. Não sincronizar quando houver divergência, origem não autenticada ou integridade não confirmada.
4. Manter cópia offline e cópia independente antes de mudanças.
5. Toda mudança deve ser revisável, testada e reversível.
6. Segredos, tokens, senhas, chaves privadas e códigos de recuperação nunca devem ser gravados no repositório, logs ou backups em texto aberto.
7. Falhas devem resultar em bloqueio seguro (fail closed), não em sincronização permissiva.
8. Nenhuma IA, agente ou automação pode apagar a matriz ou autorizar a própria alteração crítica.

## 2. Evidências iniciais observadas no GitHub

- O repositório está público e a branch padrão é `main`.
- A branch `main` foi retornada como protegida; o objeto de proteção legado retornou `enabled: false`.
- Existe um ruleset ativo chamado `PROTECAO-CRYPY-MAIN`.
- O ruleset exige histórico linear, assinaturas, implantação no ambiente `github-pages`, verificações de status e CodeQL (alertas altos ou superiores); também proíbe exclusão, criação e atualização fora das regras.
- O ruleset permite bypass a vários tipos de atores, inclusive papéis de repositório e integrações com modo `always`; o usuário conectado foi reportado com bypass `always`. Isso precisa de revisão mínima e documentada.
- A configuração de pull request exige zero aprovações. Portanto, revisão por outra pessoa não está efetivamente exigida pelo ruleset atual.
- O commit mais recente consultado foi reportado como não assinado (`verification: unsigned`). A exigência de assinatura deve ser testada com um commit real elegível e com o fluxo operacional.
- `SECURITY.md` contém texto genérico de modelo, incluindo versões não relacionadas claramente ao projeto e instruções incompletas para reportar vulnerabilidades.
- Há workflows existentes em `.github/workflows`; a mera presença dos arquivos não comprova execução bem-sucedida nem cobertura de segurança.

Estas observações são um retrato do momento da consulta, não uma auditoria completa do GitHub, das contas ou da infraestrutura.

## 3. Dez frentes de defesa

### 3.1 Identidade e acesso
**Trabalho:** MFA resistente a phishing/passkeys; chaves físicas para contas críticas; revisão de sessões e dispositivos; alertas de login; recuperação de conta testada; menor privilégio e remoção de acessos obsoletos.

**Aceitação:** contas administrativas críticas protegidas por MFA forte; métodos de recuperação guardados offline; sessões revogáveis; teste documentado de recuperação sem depender de uma única conta/dispositivo.

### 3.2 Cofre criptográfico independente
**Trabalho:** criptografia autenticada de backups; chaves separadas dos dados; gestão de chaves e rotação; cópias de recuperação em locais distintos; procedimento de recuperação com dupla conferência.

**Aceitação:** restauração testada em ambiente limpo; chaves não presentes no repositório, no mesmo local dos backups ou em logs; algoritmo, parâmetros, responsáveis e procedimento documentados.

### 3.3 Backups imutáveis e offline
**Trabalho:** política 3-2-1-1-0 adaptada ao projeto; uma cópia offline; retenção imutável quando suportada; versionamento; verificação automática e ensaios de restauração.

**Aceitação:** evidência de cópias em domínios de falha distintos; exclusão/alteração bloqueada durante a retenção; restauração de amostra e recuperação integral cronometradas e registradas.

### 3.4 Integridade dos HDs
**Trabalho:** inventário real dos dispositivos e dos 13 destinos previstos; manifesto por arquivo; SHA-256 para detecção de alteração acidental; assinatura digital do manifesto para autenticação; comparação matriz/espelhos; bloqueio de sync em divergência.

**Aceitação:** cada dispositivo/destino identificado sem ambiguidade; manifesto assinado validado por chave confiável; alteração, arquivo ausente, arquivo extra e origem não confiável detectados; nenhuma sincronização destrutiva em caso de falha.

**Nota:** hash sozinho não prova autoria ou autenticidade. A assinatura digital e a proteção da chave de assinatura são necessárias para essa finalidade.

### 3.5 Lucy — Defesa Global
**Trabalho:** especificar fontes de eventos, permissões somente leitura por padrão, regras de detecção, alertas, trilha de auditoria e escalonamento humano. Ações de contenção devem ser limitadas e explicitamente autorizadas.

**Aceitação:** simulações controladas geram alertas corretos; falsos positivos e falsos negativos medidos; Lucy não altera nem apaga dados críticos por iniciativa própria. Até os testes, Lucy é requisito de arquitetura, não agente ativo.

### 3.6 GitHub e WEB3.1
**Trabalho:** revisar rulesets e bypass; exigir revisão independente quando viável; exigir checks reais; testar assinatura de commits; revisar permissões de Actions e dependências; habilitar e validar scanners; separar desenvolvimento, homologação e produção.

**Aceitação:** regras efetivas testadas com conta sem bypass; exceções justificadas e minimizadas; workflows concluídos com sucesso; alertas tratados; publicação só após checks e aprovação definidos.

### 3.7 Proteção contra sabotagem interna
**Trabalho:** RBAC e menor privilégio; dupla autorização para operações destrutivas; logs append-only fora do ambiente administrado pelo agente; bloqueio de exclusão/overwrite; processo de rollback independente.

**Aceitação:** agente e sincronizador não conseguem apagar ou substituir a matriz sem autorização externa; todas as operações críticas ficam auditáveis; recuperação não depende do agente que iniciou a alteração.

### 3.8 Centro de monitoramento
**Trabalho:** painel de saúde de backups, hashes, sincronização, dispositivos, permissões, workflows, alertas e incidentes; alertas com severidade e responsável.

**Aceitação:** cada indicador tem fonte, horário da última coleta e estado verificável; indisponibilidade da telemetria aparece como desconhecida, nunca como saudável.

### 3.9 Plano de sobrevivência
**Trabalho:** runbooks para perda de conta, indisponibilidade do GitHub/Dropbox, perda de dispositivo, comprometimento de chave, corrupção de backup e reconstrução da BABY/WEB3.1; cópias offline dos procedimentos.

**Aceitação:** exercício de recuperação realizado por pessoa autorizada, usando apenas os materiais de contingência; dependências únicas identificadas e removidas ou aceitas formalmente.

### 3.10 Testes de resistência
**Trabalho:** ambiente isolado; cenários de credencial comprometida, exclusão, corrupção, sync interrompido, alteração maliciosa e indisponibilidade; dados fictícios; plano de reversão.

**Aceitação:** testes não atingem produção; resultados, evidências, falhas e correções registrados; critérios de aprovação definidos antes da execução.

## 4. PROTOCOLO CRYPY ZERO PERDA

Antes de toda alteração crítica:

1. Identificar o ativo e seu proprietário.
2. Registrar versão, origem, permissões e hash atual.
3. Validar autenticidade e integridade do original.
4. Criar backup independente, verificável e recuperável.
5. Obter autorização humana explícita para a alteração.
6. Trabalhar em branch/ambiente isolado, nunca diretamente na matriz/produção.
7. Executar testes automatizados e revisão humana.
8. Comparar o resultado com o estado anterior e verificar itens protegidos.
9. Promover somente após aprovação e checks.
10. Manter rollback testado e registrar o resultado.

**Condição de bloqueio:** se qualquer etapa crítica falhar, houver divergência ou não existir backup recuperável, interromper a operação. Não tentar “corrigir” sobrescrevendo a origem.

## 5. Ordem de execução

**Fase 0 — Preservação e inventário:** congelar mudanças destrutivas; registrar estado e hashes; identificar ativos, cópias e responsáveis.

**Fase 1 — Backups, chaves e recuperação:** validar criptografia, separação de chaves, cópias offline/imutáveis e restauração.

**Fase 2 — Identidade e permissões:** MFA, passkeys, sessões, recuperação, menor privilégio e revisão de bypass.

**Fase 3 — GitHub e sincronização:** rulesets, revisões, assinaturas, checks, scanners e bloqueio de overwrite.

**Fase 4 — Monitoramento e Lucy:** telemetria, alertas, auditoria e testes em modo observação.

**Fase 5 — Testes de resistência e homologação:** simulações isoladas, correções, recuperação e aprovação formal.

## 6. Estado de execução

| Item | Estado |
|---|---|
| Diretriz Defesa Total | Aprovada para planejamento |
| Protocolo Zero Perda | Especificado neste documento |
| Leitura inicial de metadados GitHub | Realizada |
| Auditoria de contas, dispositivos, Dropbox e cofre físico | Pendente |
| Auditoria completa dos HDs e seus conteúdos | Pendente |
| Revisão/ajuste do ruleset e bypass | Pendente |
| MFA/passkeys e recuperação de contas | Pendente de verificação |
| Criptografia e imutabilidade dos backups | Pendente de verificação |
| Lucy em operação | Não comprovada; não declarar ativa |
| Painel central | Não implementado por este documento |
| Testes de restauração e resistência | Pendentes |
| Homologação final | Pendente |

## 7. Regra de comunicação — MODO REAL

Distinguir sempre: planejado, documentado, implementado, testado, aprovado e homologado. Não declarar “100% seguro”, “sincronizado”, “protegido” ou “concluído” sem evidências específicas. Esta documentação não altera configurações de conta, dispositivos, cofres externos ou serviços de terceiros.
