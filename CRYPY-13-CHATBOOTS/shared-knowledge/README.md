# CRYPY — Base compartilhada de conhecimento

## Arquitetura entregue
- Um índice global de metadados: `assets/data/crypy-file-index.json`.
- Uma política única de acesso: `CRYPY-13-CHATBOOTS/shared-knowledge/agent-access.json`.
- Um adaptador comum: `assets/js/crypy-shared-knowledge.js`.
- O leitor local existente do BABY: `assets/js/baby-knowledge-sync.js`, que grava os documentos permitidos no IndexedDB do mesmo navegador/origem.

## Fluxo
1. O BABY carrega o inventário.
2. Só arquivos marcados `access: "público"`, com extensão textual e até 900 KB são ingeridos.
3. O conteúdo extraído é guardado localmente no IndexedDB `crypy_baby_knowledge_v1`.
4. Os 13 perfis chamam `CRPYSharedKnowledge.search(agentId, query, limit)` e recebem trechos com caminho de origem.
5. Escrita é somente por proposta: `proposeWrite` retorna `approval_required`.

## Limites comprovados
- A base é compartilhada no mesmo navegador e origem, não é armazenamento remoto entre dispositivos.
- A sincronização é iniciada pelo botão do BABY; a publicação do índice no GitHub não atualiza automaticamente o IndexedDB de todos os usuários.
- O adaptador não chama LLMs. O barramento atual continua com zero endpoints generativos.
- Para compartilhar entre dispositivos/usuários e conectar modelos, ainda é necessário backend autenticado, armazenamento remoto, autorização por documento, logs, rate limits e configuração segura dos provedores.
- HD-MATRIZ, backups, memórias pessoais, segredos e arquivos protegidos ficam excluídos.
