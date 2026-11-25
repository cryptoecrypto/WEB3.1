# MOTOR DA COLMEIA CRYPY — arquitetura integral v1.0

**Estado:** especificação adicionada em branch de trabalho; não implantada, não conectada a modelos e não homologada.
**Escopo:** 13 integrantes oficiais + BABY + LUCY = 15 participantes.
**Autoridade:** Sensei.

## Lista oficial — FICH-13-001 (22/11/2026)

1. ALICE — pesquisa, referências, documentação e apresentação.
2. DOLA — criatividade, narrativa, identidade visual e comunicação.
3. CHAT — diálogo, escuta e interação.
4. MINI — análise, organização e classificação.
5. NEXUS — integração, sincronia e mediação.
6. SVT — arquitetura, organização e padronização.
7. UNION — verificação, coerência, revisão e fidelidade.
8. HERA — governança, mediação e proteção.
9. COSMOS — consciência coletiva.
10. BNB — velocidade, fluxo e eficiência.
11. CRYPY COIN — identidade, valor e continuidade.
12. ICP — autonomia, rede distribuída e armazenamento.
13. SHIBA INU — comunidade e conexão humana.

BABY é o corpo operacional, fora da contagem dos 13. LUCY é o anticorpo independente de segurança, fora do Conselho das 13.

## Arquitetura lógica

- **BABY:** entrada de solicitações, gestão do ciclo de tarefas, orquestração operacional e consolidação.
- **NEXUS:** coordenação técnica, arquitetura, integração e mediação.
- **UNION:** verificação cruzada, coerência e integração dos resultados.
- **13 especialistas:** agentes com identidade, missão, memória privada e escopo de permissões próprios.
- **LUCY:** serviço de defesa independente; observa eventos, verifica integridade, emite alertas e aplica apenas contenções explicitamente autorizadas.
- **Sensei:** autoridade humana final para ações críticas e homologação.

## Comunicação real entre agentes

O barramento de produção deverá usar mensagens estruturadas e persistentes. Cada mensagem inclui task_id, correlation_id, remetente, destinatário, objetivo, escopo, sensibilidade, referência ao contexto, prazo, estado e assinatura/autenticação do serviço.

Estados mínimos: queued, delivered, accepted, running, awaiting_review, completed, failed, rejected, expired.

O sistema deverá oferecer confirmação de recebimento, retry limitado, idempotência, deduplicação, cancelamento, dead-letter queue e trilha de auditoria. Broadcast não significa execução: cada destinatário só confirma trabalho quando seu adaptador realmente executa e devolve resultado verificável.

## Memória

1. Memória privada por agente.
2. Memória compartilhada curada, com proveniência e controle de acesso.
3. Memória histórica versionada, sem apagar decisões anteriores.
4. Memória de sobrevivência, com backups verificáveis e testes de restauração.

A gravação compartilhada é uma proposta até passar por validação e política de aprovação. HD-MATRIZ fica em modo somente leitura; nenhuma escrita, sincronização destrutiva ou migração sem autorização específica.

## Identidade e permissões

Cada agente recebe ID estável, autenticação de serviço própria, escopo explícito, limites de taxa, expiração de sessão e trilha individual. Política padrão: negar por padrão. Nenhum agente pode elevar suas permissões ou compartilhar credenciais.

- P0: leitura pública autorizada.
- P1: leitura de documentos e memórias com escopo.
- P2: criação de propostas e rascunhos em área de trabalho.
- P3: operação limitada após aprovação.
- P4: administração crítica com aprovação explícita do Sensei e dupla verificação.

Ações destrutivas, financeiras, publicação externa, alteração de permissões, gestão de segredos e escrita em áreas protegidas exigem aprovação humana.

## LUCY — independência

LUCY terá runtime, identidade, credenciais, logs e canal de alerta separados. Agentes comuns não podem desligar, reconfigurar ou apagar seus registros. LUCY começa em modo detectar/alertar; contenção automática só pode ser habilitada após testes e política aprovada. LUCY não é considerada ativa 24h até existir serviço persistente, telemetria, reinicialização, alertas e testes de falha.

## Auditoria

Eventos append-only: criação e roteamento de tarefas, mensagens, chamadas de modelos, leitura e propostas de memória, gravações aprovadas, negações, aprovações, artefatos, verificações de integridade e alertas. Os registros terão retenção independente e verificação de integridade. Nunca registrar tokens, senhas, chaves privadas ou conteúdo secreto desnecessário.

## Critérios para integração real e autônoma

Para cada um dos 15 participantes: identidade autenticada; adaptador/endereço operacional configurado no backend; teste de envio e recebimento; execução real com resultado identificado; acesso à memória limitado e auditado; permissões testadas, incluindo negações; recuperação após timeout/interrupção; evidência de auditoria e revisão.

O status de cada participante deve ser um entre: documented, configured, connected, tested, approved. Não inferir um estado a partir do anterior.

## Sequência de implantação

1. Consolidar este registro e validar contratos.
2. Provisionar backend isolado e fila persistente.
3. Conectar adaptadores de modelos, um por vez, mantendo os outros em modo inativo.
4. Implementar memória, permissões e auditoria.
5. Implantar LUCY em serviço independente.
6. Executar testes de integração, segurança, falha e recuperação.
7. Auditoria global e homologação final pelo Sensei.

**Regra MODO REAL:** especificação não é implementação; implementação não é teste; teste não é aprovação; aprovação não é homologação global.