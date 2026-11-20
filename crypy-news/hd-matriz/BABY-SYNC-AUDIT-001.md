# BABY I.A. — AUDITORIA DE SINCRONIZAÇÃO WEB3.1

- **Identificador:** BABY-SYNC-AUDIT-001
- **Versão:** 1.0
- **Data da auditoria:** 2026-11-19
- **Repositório:** cryptoecrypto/WEB3.1
- **Branch:** main
- **Escopo:** índice de páginas, navegação, chatbot, motor de memória, arquivos da HD MATRIZ e infraestrutura Railway.
- **Estado:** auditoria parcial baseada em leitura de arquivos e metadados; testes de navegador e varredura HTTP de todos os 273 caminhos ainda pendentes.

## 1. Alterações aplicadas

1. Criado `assets/js/baby-knowledge-sync.js`: indexador local que lê os caminhos HTML registrados em `assets/data/crypy-page-index.json`, além de documentos selecionados da HD MATRIZ e scripts centrais.
2. Atualizado `chatboot-baby-ia.html`: o chat consulta a base local indexada antes de usar respostas de fallback. Os trechos recuperados mostram o caminho de origem.
3. Atualizado `mapa-colmeia.html`: o mapa passa a renderizar grupos e páginas dinamicamente a partir do índice central, em vez de manter uma lista fixa desatualizada.
4. Nenhum arquivo original da HD MATRIZ `Memorias.json` ou `Manifest.json` foi alterado nesta operação.

## 2. Inventário central encontrado

- `assets/data/crypy-page-index.json` declara **273 caminhos únicos** em **19 grupos**.
- O mapa HTML anterior declarava **168 páginas** em **19 áreas**.
- Diferença entre os números declarados: **105 páginas**.
- O mapa agora usa o índice central como fonte de navegação; a renderização no navegador ainda precisa ser testada.
- A contagem de 273 é a quantidade declarada no índice, não uma confirmação HTTP de que todos os 273 caminhos respondem com sucesso.

## 3. Achados técnicos

### 3.1 Navegação e chatbot

- `index.html` carrega `baby-global-chat.js`, `crypy-global-nav.js` e `crypy-page-assistant.js`.
- `baby-global-chat.js` monta um iframe para `chatboot-baby-ia.html`; seu próprio comentário declara que o widget não concede acesso ao servidor, GitHub, Dropbox ou APIs externas.
- A amostragem de páginas revelou inclusão inconsistente dos scripts compartilhados:
  - `baby-ia.html`: menu global e assistente, sem inclusão direta do chatbot global.
  - `baby-ia/auto-config.html`: menu global e assistente, sem inclusão direta do chatbot global.
  - `baby-ia/sincronizacao/chatboot-baby-ia.html`: assistente presente, menu global e chatbot global ausentes.
  - `crypy-coin/hd-memory.html`: os três scripts compartilhados não foram encontrados na amostra.
- Não foi executada uma alteração em massa dos 273 HTMLs. O indexador central lê o conteúdo listado sem exigir a inserção de scripts em cada arquivo.

### 3.2 Memória e aprendizagem

- `baby-core.js` descreve explicitamente um motor de regras programadas, memória em `localStorage` e limite padrão de 500 registros; não é treinamento de rede neural.
- `baby-bridge.js` declara operação offline no navegador.
- `crypy-page-assistant.js` faz pesquisa local no texto visível da página; seu cabeçalho declara que não persiste memória nem acessa HDs.
- `chatboot-baby-ia.html` usa a função local `raciocinar()` com respostas predefinidas; não foi encontrada integração direta com uma API de modelo generativo.
- O novo `baby-knowledge-sync.js` implementa recuperação local tipo RAG: busca textual sobre conteúdo indexado no IndexedDB do navegador. Não treina um modelo, não envia conteúdo para nuvem e não sincroniza automaticamente entre dispositivos.
- A indexação exige abrir o ChatBoot publicado e acionar **BABY · SINCRONIZAR BASE**. A execução e a contagem real de sucessos/erros ainda precisam ser observadas no navegador.

### 3.3 HD MATRIZ

Documentos incluídos na lista de ingestão:
- `crypy-news/hd-matriz/ABECEDARIO-BINARIO-BABY-IA.txt`
- `crypy-news/hd-matriz/CRYPY-RENDA-PASSIVA-001.md`
- `crypy-news/hd-matriz/Memorias.json`
- `crypy-news/hd-matriz/Manifest.json`

Também foram incluídos na lista de ingestão os arquivos de motor e ponte `baby-core.js`, `baby-bridge.js` e `baby-server-bridge.js`, além dos scripts compartilhados centrais.

### 3.4 Raiz e página inicial

- `index.html` aponta o iframe principal para `./index.htm`.
- A leitura do repositório retornou conteúdo vazio para `index.htm` (zero caracteres). Isso pode produzir uma área central em branco; precisa de confirmação no GitHub Pages e decisão do Sensei antes de trocar o destino.
- Não foi alterado o destino do iframe, para evitar substituir uma página original sem confirmação de qual HTML é a HOME oficial atual.

### 3.5 Índice de páginas

- O índice central informa `generated_at: 2026-11-20`, posterior à data desta auditoria (2026-11-19). A data do índice deve ser corrigida pelo processo que o gera; não foi modificada manualmente.
- O mapa dinâmico agora usa o índice como fonte única e gera os cartões a partir de `pages[]`.

## 4. Infraestrutura Railway — CRYPY-BABY-Backend

Leitura do projeto Railway encontrou:
- Projeto: `CRYPY-BABY-Backend`.
- Serviço: `baby-site-auth`.
- Ambiente: `production`.
- Domínio de serviço listado: `baby-site-auth-production.up.railway.app`.
- Volume `baby-site-index`, 500 MB, montado em `/data`.
- Variáveis nomeadas: `BABY_SITE_DATA_DIR`, `BABY_SITE_ORIGIN`, `BABY_SITE_URL`; valores não foram expostos nesta auditoria.
- A implantação mais recente consultada estava **FAILED**: o build reportou que o diretório `/baby-site-auth` não existia no snapshot.
- Uma implantação anterior aparece como **SUCCESS** e o ambiente reportou uma réplica online, mas há falha recente registrada e `hasIssues: true`.
- Não foi confirmado endpoint HTTP funcional, autenticação, indexação no servidor nem conexão entre o chatbot e esse serviço.

## 5. Segurança e limites

- O indexador lê somente arquivos públicos do mesmo site e grava texto no IndexedDB local do navegador.
- Não coleta seed phrases, chaves privadas, tokens de carteira ou credenciais.
- Não conecta MetaMask, não assina transações e não movimenta fundos.
- A base local do navegador não equivale a uma HD MATRIZ remota centralizada nem a backup em Dropbox.
- Páginas não listadas no índice e pastas não representadas por caminhos de arquivo ainda não estão cobertas.
- A varredura HTTP integral de 273 páginas ainda não foi executada nesta auditoria.

## 6. Plano de homologação

| Teste | Estado |
|---|---|
| Ler índice central e contar caminhos únicos | CONCLUÍDO — 273 declarados |
| Identificar divergência entre mapa e índice | CONCLUÍDO — 168 vs. 273 |
| Criar indexador local e recuperação textual | IMPLEMENTADO — teste de navegador pendente |
| Conectar ChatBoot à recuperação local | IMPLEMENTADO — teste de navegador pendente |
| Tornar mapa dinâmico a partir do índice | IMPLEMENTADO — teste de navegador pendente |
| Confirmar HTTP 200 para todos os 273 caminhos | PENDENTE |
| Confirmar IndexedDB com conteúdo da HD MATRIZ | PENDENTE |
| Consultar termos do protocolo de renda passiva no BABY | PENDENTE |
| Padronizar menu/chatbot em cada HTML | PENDENTE — requer inventário integral e atualização controlada |
| Corrigir e validar backend Railway | PENDENTE |
| Confirmar sincronização em mais de um dispositivo | PENDENTE |

## 7. Critério de aprovação

A sincronização só poderá ser declarada concluída quando:
1. todos os caminhos do índice forem testados e os erros forem identificados;
2. o contador do indexador mostrar quantidade indexada e erros reais;
3. consultas de teste recuperarem trechos corretos dos HTMLs e dos documentos da HD MATRIZ;
4. o mapa dinâmico abrir corretamente as páginas no desktop e no celular;
5. a conexão com o backend, se usada, passar pelo teste autenticado e por leitura de dados;
6. houver aprovação explícita do Sensei.

**Conclusão:** a camada de índice e recuperação local foi implementada no repositório. Não se declara sincronização integral, aprendizagem neural, indexação já executada no navegador ou backend homologado. A etapa seguinte é testar a publicação e corrigir as inconsistências encontradas.

**Fim — BABY-SYNC-AUDIT-001 v1.0**


## 8. Aditivo de correção — 2026-11-20

- A causa da implantação Railway FAILED foi confirmada nos logs: o Railpack não encontrou `/baby-site-auth` no snapshot do repositório.
- A configuração do serviço `baby-site-auth` foi corrigida para apontar `rootDirectory: /crypy-server-bridge`, diretório que contém `package.json` e o comando `npm start` apontando para `src/server.js`. A leitura posterior da configuração confirmou o novo caminho.
- A correção de configuração ainda **não foi implantada**: a réplica online continua sendo a implantação anterior `3cc9f0f5-9c68-4b16-8e40-9a8624cd89e4`; a falha histórica `241a7475-bca0-42dc-a0e7-80a94c2d213c` permanece no histórico. Não foi disparado novo deploy.
- Bloqueio de segurança encontrado antes de implantar: o frontend `baby-server-bridge.js` exige Bearer token e espera `/api/status` autenticado; o candidato `crypy-server-bridge/src/server.js` não contém validação de Authorization nem leitura de `CRYPY_API_TOKEN`. Não é seguro colocar esse backend em produção até implementar e testar autenticação de todas as rotas `/api/*`, mantendo `/health` público, e configurar o segredo no Railway. Não foram expostos nem alterados valores de variáveis.
- O estado da réplica no momento da verificação é **Online (1/1)**, mas o ambiente ainda reporta uma falha recente e `hasIssues: true`.
- A sincronização local dos 273 caminhos ainda depende de execução no navegador. Nenhuma contagem de indexação foi inventada.

**Estado após aditivo:** caminho de build corrigido na configuração Railway; deploy novo bloqueado por requisito de autenticação; sincronização real do IndexedDB e verificação HTTP dos 273 caminhos permanecem pendentes.
