# ESQUADRÃO I.A. — NÚCLEO DE AGENTES CRYPY

**Estado:** estrutura documental inicial criada; consolidação, sincronização Dropbox e homologação pendentes.  
**Autoridade:** Sensei.  
**Orquestração prevista:** BABY.  
**Coordenação técnica:** NEXUS.

## Finalidade

Esta pasta é o ponto central documental do sistema ESQUADRÃO I.A. Ela referencia o catálogo de 13 perfis já existente em `CRYPY-13-CHATBOOTS/` e não cria um segundo catálogo concorrente.

## Ordem obrigatória de trabalho

1. **FASE 1 — COLMEIA:** inventariar e consolidar o conhecimento de todas as áreas e páginas da Colmeia, usando os índices e arquivos-fonte existentes. Registrar caminho, tipo, versão, classificação, hash quando disponível e resultado da leitura.
2. **FASE 2 — HDs:** somente após a Fase 1 ser conferida, iniciar inventário e ingestão dos HDs, respeitando proteções e exclusões. A HD-MATRIZ permanece intocável; nenhuma cópia ou conteúdo protegido será alterado.
3. **FASE 3 — ESQUADRÃO:** disponibilizar a base consolidada aos agentes conforme seus papéis e permissões, preservando memória individual e compartilhada curada.
4. **FASE 4 — DROPBOX:** sincronização autenticada, versionada e auditável; resolver conflitos sem sobrescrever originais.
5. **FASE 5 — HOMOLOGAÇÃO:** validar cobertura, erros, consultas, persistência, permissões e sincronização entre dispositivos antes de declarar conclusão.

## Fontes e componentes existentes

- Catálogo dos 13 perfis: `CRYPY-13-CHATBOOTS/`.
- Configuração geral: `BABY-IA/esquadrao-auto-config.js` e `BABY-IA/esquadrao-auto-config.json`.
- Indexador de conhecimento local: `assets/js/baby-knowledge-sync.js`.
- Índices de páginas e arquivos: `assets/data/crypy-page-index.json` e `assets/data/crypy-file-index.json`.
- Auditoria e pendências anteriores: `CRYPY-NEWS/hd-matriz/BABY-SYNC-AUDIT-001.md`.

## Regras de integridade

- Preservar arquivos-fonte; não mover, renomear ou sobrescrever conteúdo original nesta etapa.
- Não incluir chaves privadas, seed phrases, tokens, senhas ou credenciais.
- Separar conteúdo público, interno e restrito; respeitar permissões de acesso.
- Deduplicar por hash quando possível, mantendo referências a todas as origens.
- Distinguir documentação, implementação, execução, teste, aprovação e homologação.
- Não declarar treinamento neural: a indexação/RAG disponibiliza conteúdo para recuperação; não retreina o modelo.
- Não declarar sincronização Dropbox operacional até autenticação, leitura/escrita, logs e testes reais serem aprovados.

## Estado inicial verificado

- O repositório já contém o indexador local e o catálogo dos 13 ChatBoots.
- A auditoria existente registra que a indexação local ainda depende de execução e verificação no navegador.
- O Dropbox contém `/CRYPY/BABY/MANIFEST`, `BACKUP`, `SYNC-LOG` e `MEMORY-BOOST`; essas pastas estavam vazias na última inspeção.
- A pasta `/CRYPY/ESQUADRÃO I.A` ainda precisa ser criada e vinculada ao fluxo de sincronização.

## Próximo artefato

O manifesto de ingestão deverá listar cada fonte encontrada, sua classificação, fase (COLMEIA ou HD), hash, estado de leitura e eventuais erros. Nenhum contador de cobertura será preenchido por estimativa.
