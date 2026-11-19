# ARQUITETURA OFICIAL DO TERMINAL CENTRAL CRYPY
## Versão 1.0 — 19/11/2026

**Autoria da concepção:** Sensei  
**Coordenação técnica e documentação:** NEXUS  
**Sistema:** CRYPY / WEB3.1  
**Estado deste registro:** aprovado conceitualmente; implementação parcial e em evolução.

---

## 1. Propósito

O Terminal Central CRYPY é concebido como o centro de comando do ecossistema. Seu propósito vai além de listar arquivos: reconhecer as áreas do portal, manter inventários, acompanhar mudanças, organizar tarefas por função, aplicar controles de permissão, registrar evidências e apoiar a evolução contínua do WEB3.1 com inteligências artificiais conectadas.

A concepção do Terminal Central é de autoria do Sensei. O NEXUS atua como coordenador técnico, organizador, documentador e auditor; não reivindica a autoria da ideia.

## 2. Arquitetura lógica

1. **GitHub — raiz WEB3.1:** repositório canônico e versionamento dos arquivos.
2. **CRYPY SERVER — Terminal Central:** inventário, auditoria, políticas, tarefas, trilha de eventos, testes e evidências.
3. **BABY:** memória operacional e coordenação, dentro das capacidades efetivamente implementadas e autorizadas.
4. **Esquadrão CRYPY:** agentes especializados, conectados individualmente e limitados às suas permissões.
5. **Portal WEB3.1:** páginas, conteúdo, notícias e módulos publicados.
6. **Ciclo controlado:** observar → propor → revisar → testar → aprovar pelo Sensei → publicar → auditar.

## 3. Regra inviolável de autorização

**Cada agente só executa aquilo para o qual está conectado e explicitamente autorizado.**

- Identidade documentada não significa conexão operacional.
- Um agente sem credencial, integração e permissão válidas permanece pendente.
- Permissões devem ser específicas por agente, ação e caminho; nunca presumir acesso global.
- Tokens e segredos ficam fora do repositório e nunca em HTML público, logs ou backups comuns.
- Nenhum agente pode conceder a si próprio novas permissões ou aprovar a própria alteração.

## 4. Autoridade e publicação

O Sensei é a autoridade final de aprovação para alterações destinadas à publicação. A automação pode observar, inventariar, testar e preparar propostas dentro do escopo autorizado. Não pode contornar a aprovação, publicar por conta própria ou alterar arquivos fora da allowlist.

Toda alteração proposta deve ter origem identificável, escopo, diff revisável, resultado dos testes, registro de auditoria e plano de reversão.

## 5. Evolução em etapas

### Etapa A — Observação segura
Rotinas agendadas de leitura, inventário e validação estrutural. Sem modificar HTMLs, HDs, memórias ou conteúdo do portal.

### Etapa B — Análise e propostas
Detecção de mudanças e preparação de relatórios ou pull requests, ainda sem publicação autônoma.

### Etapa C — Execução autorizada
Ações limitadas por allowlist, identidade, credenciais seguras, testes, trilha de auditoria e aprovação humana.

### Etapa D — Publicação controlada
Publicação somente após aprovação explícita do Sensei e verificações obrigatórias.

## 6. Limites técnicos atuais

- GitHub é o repositório; GitHub Pages hospeda conteúdo estático.
- GitHub Actions executa tarefas por eventos ou agendamento; não é um servidor Node.js permanente.
- O CRYPY SERVER Node.js precisa de um ambiente de execução próprio para permanecer ativo.
- A indexação estrutural/textual não equivale a um modelo de linguagem nem prova compreensão semântica completa.
- Integrações com BABY, Dropbox, HDs e agentes externos só podem ser declaradas quando implementadas e testadas com evidências.

## 7. MODO REAL — classificação obrigatória

Cada capacidade deve ser identificada como: **planejada, documentada, implementada, testada, aprovada ou protegida/registrada**. Uma etapa não implica automaticamente a seguinte. Não declarar sincronização, autonomia, segurança ou conclusão integral sem evidências verificáveis.

## 8. Primeira rotina operacional

A primeira rotina diária do repositório é somente de leitura: executar os testes do núcleo e a auditoria estrutural, guardar o log como artefato do GitHub Actions e falhar claramente quando uma verificação não passar. Essa rotina não altera nem publica o portal.

---

**Princípio:** NEXUS conecta; Sensei conduz; BABY mostra.  
**Regra de ouro:** autonomia somente dentro de conexão, escopo e autorização comprovados.
