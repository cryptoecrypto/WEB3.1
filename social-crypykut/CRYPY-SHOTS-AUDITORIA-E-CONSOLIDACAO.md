# CRYPY-SHOTS — auditoria integral de referências e consolidação do site

**Data:** 26/11/2026  
**Destino:** `cryptoecrypto/WEB3.1/social-crypykut/shots.html`  
**Escopo:** varredura recursiva das árvores `main` dos oito repositórios do ecossistema, identificação dos caminhos relacionados a CRYPY-SHOTS/Shorts/Reels e revisão semântica dos principais arquivos-fonte, protótipos, manifests e documentos.

## 1. Resultado da varredura dos repositórios

As árvores recursivas consultadas retornaram `truncated=false`.

| Repositório | Arquivos na árvore consultada | Referências de caminho CRYPY-SHOTS |
|---|---:|---|
| CRYPY-SHOTS | 320 | Fonte React, CSS, oito páginas HTML, protótipo vertical e imagem |
| CRYPYKUT | 360 | Cópias das oito páginas, pasta social, App.tsx, CSS e imagem |
| WEB3.1 | 1.486 | Fonte, cópias, portal social, hub, manifests, menu e assets |
| LUCY-DEFENDER | 1.380 | App.tsx ampliado, CSS, imagens, páginas, snapshots e MVPs |
| HD-MATRIZ | 611 | Nenhum caminho CRYPY-SHOTS encontrado |
| CRYPY-SECURITY | 427 | Nenhum caminho CRYPY-SHOTS encontrado |
| LOGO-OFICIAL | 4 | Nenhum caminho CRYPY-SHOTS encontrado |
| CRYPY-LAND | 318 | Nenhum caminho CRYPY-SHOTS encontrado |

**Limite da declaração de cobertura:** foi feita varredura de 100% das árvores Git disponíveis e análise semântica dos arquivos diretamente relacionados ao assunto. Isso não significa leitura linha a linha de todos os arquivos não relacionados dos oito repositórios.

## 2. Fontes encontradas e hierarquia de versões

### 2.1 Repositório `cryptoecrypto/CRYPY-SHOTS`

Árvore `main`: `c76fe1cbcdb0baccec3a0738f71d88add7ece9f4`.

Arquivos diretamente relacionados:
- `01-feed-para-voce.html` até `08-config-shots.html` — oito páginas de demonstração.
- `App.tsx` — 38.866 bytes, SHA `2c87bed4f38a912f56dd650d36a154792816cbf5`.
- `index.css` — 1.529 bytes, SHA `664e272dbe757bbd6caf67940ce9b5fce0e3fcb4`.
- `crypyshots.html` — protótipo vertical antigo.
- `assets/c79087ae85000514-Gemini_Generated_Image_v40fuav40fuav40f.jpg` — imagem de identidade usada pelo App.tsx.

O protótipo `crypyshots.html` referencia `reel-1.jpg`, `reel-2.webp`, `reel-3.webp` e `logo-shots.webp`; esses arquivos não aparecem no diretório de assets consultado. O protótipo também exibe contadores e alertas de NFT/coin demonstrativos, que não devem ser interpretados como dados reais.

### 2.2 Repositório `cryptoecrypto/CRYPYKUT`

Árvore `main`: `e65a9e942d3bba359ac71604061e721283aa708f`.

Foram encontrados:
- oito páginas antigas em `CRYPY-SHOTS/`;
- cópias das mesmas páginas em `CRYPY-SOCIAL/CRYPYSHOTS/`;
- `CRYPY-SOCIAL/CRYPYSHOTS/index.html` e README;
- `assets/crypy-shots.jpg`;
- `crypykut-crypy-shots/App.tsx` e `index.css`.

Essas cópias são referências históricas/duplicadas. Não foram sobrescritas nem removidas.

### 2.3 Repositório `cryptoecrypto/WEB3.1`

Árvore `main`: `55f7fe4e16b966b7a989854aa6fd6693849e7ca9`.

Fontes relevantes:
- `CRYPY-SHOTS/App.tsx`, `index.css`, `crypyshots.html`, oito páginas HTML e asset de imagem;
- duplicação do App.tsx, CSS e oito páginas em `social-crypykut/crypykut-crypy-shots/`;
- `social-crypykut/shots.html` — antiga página de pré-visualização local;
- `social-crypykut/index.html` — portal CRYPY SOCIAL HUB;
- `social-crypykut/portal-manifest.json` — catálogo do hub;
- `social-crypykut/ORKUT-9-PAGINAS-SHOTS.md` — arquitetura social e limites locais;
- `assets/js/crypy-global-nav.js` — já possui o grupo CRYPY-SOCIAL com os grupos `social-crypykut` e `crypy-shots`;
- `assets/data/crypy-page-index.json` — índice consumido pelo menu global;
- `assets/crypy-shots.jpg` e a imagem em `CRYPY-SHOTS/assets/`.

O documento `ORKUT-9-PAGINAS-SHOTS.md` confirma que o feed anterior usava cartões demonstrativos, sem vídeos de amostra, que a prévia de mídia era local, que localStorage não sincroniza dispositivos e que Google/Microsoft ainda não tinham OAuth real.

### 2.4 Repositório `cryptoecrypto/LUCY-DEFENDER`

Árvore `main`: `782045e7df3c8950bbd5dfe81c8b14f982e41732`.

Esta é a fonte de referência mais extensa encontrada:
- `CRYPY-SOCIAL/02-CRYPY-SHOTS/App.tsx` — 160.886 bytes, 1.124 linhas, SHA `eca5288bdd62fc94c9683e28151ba4570f07bc5d`;
- `CRYPY-SOCIAL/02-CRYPY-SHOTS/index.css`;
- oito páginas HTML;
- quatro imagens em `CRYPY-SOCIAL/02-CRYPY-SHOTS/`;
- cópias de App.tsx/CSS e snapshots em `CRYPY-SOCIAL/04-SOCIAL-CRYPYKUT/`, `06-WEB3.1-SNAPSHOT/`, `07-CROSS-REPO/` e `08-BRANCH-VARIANTS/`.

A pasta documental adicional criada anteriormente em `CRYPY-SOCIAL/02-CRYPY-SHOTS/docs/` permanece na branch de revisão da LUCY; esta PR não altera nem remove os originais de LUCY. O inventário `reports/hash-inventory/CRYPY-SHOTS.json` no LUCY registra os 320 arquivos da árvore do repositório-fonte, `truncated=false`, SHA do relatório `69479b5cb382a21f0fdf44f3cd04a63c15ddf147`.

## 3. Funcionalidades recuperadas do App.tsx ampliado da LUCY

O código contém estas 16 áreas:
1. Assistir.
2. Shorts.
3. Para Você.
4. Seguindo.
5. Ao Vivo.
6. Descobrir.
7. Publicar.
8. Perfil.
9. Destaques.
10. Configurações.
11. Fórmula CRYPY.
12. Agente I.A. / moderação.
13. Regras.
14. Entrar / cadastro.
15. Guia completo.
16. Teste do algoritmo.

Também contém conteúdo-semente associado a SENSEI, DOLA AI, CHAT, MINI e BABY, títulos de vídeos longos, exemplos de feed, configurações e a proposta de algoritmo. Métricas, contadores, mensagens de chat e perfis pré-carregados são dados demonstrativos do protótipo, não audiência ou atividade real.

## 4. Auditoria técnica e riscos encontrados

### 4.1 Fórmula de pontuação no código-fonte

A fórmula encontrada é:

`PONTOS = assistiu×10 + reassistiu×8 + compartilhou×7 + comentou×5 + curtiu×3 + seguiu×6 − pulou×5 − denúncias×20 − bloqueios×50 + bônus`

Faixas de lote encontradas:
- abaixo de 100: Lote 50;
- abaixo de 500: Lote 500;
- abaixo de 5.000: Lote 5.000;
- acima disso: Para Você geral.

Foi preservada como referência de estudo e laboratório local. Não foi convertida em CRYPY COIN, saldo, dinheiro ou recompensa. Pesos, faixas, antifraude e tratamento de denúncias ainda exigem aprovação.

### 4.2 Agente de moderação

O protótipo implementa detecção heurística por palavras-chave para conteúdo adulto, ilegal, duvidoso, violência, discurso de ódio, spam e direitos de terceiros. Limiares de rigor Leve/Médio/Rigoroso aparecem como 50/70/85.

O próprio código reconhece que o arquivo de vídeo não é enviado durante a análise e que áudio/imagens completas não são examinados. Portanto:
- não é análise audiovisual real;
- não é prova de IA conectada;
- não deve aprovar ou rejeitar publicações em produção;
- revisão humana, recurso, trilha de auditoria e moderação real são necessários.

### 4.3 Backend e autenticação

O App.tsx chama `fetch("actions")` e usa coleções como `crypy-shots-users`, `crypy-video-submissions`, `crypy-global-chat` e `crypy-rules-acceptances`. O endpoint `actions` e seu backend não foram comprovados como parte implantada e homologada do site público.

O login local do protótipo calcula `simpleHash` no cliente; isso não é um hash criptográfico de senha apropriado para produção. Os botões Google/Microsoft aceitam email digitado e criam registro com provedor, mas não demonstram fluxo OAuth/OIDC real nem validação de token. Esses formulários não foram copiados para o site final.

### 4.4 Upload, lives e NFTs

- Upload: as versões seguras de referência fazem apenas pré-visualização local; não há upload de mídia homologado.
- Lives: não foi comprovado provedor de transmissão conectado.
- NFT: a proposta de emissão depende de direitos autorais, carteira, contrato auditado, testnet e autorização explícita. Nenhuma emissão foi ativada.
- CRYPY COIN: não foi apresentado como saldo, recompensa ou ativo negociável.

### 4.5 Regras e direitos

As minutas tratam de convivência, conteúdo ilegal/abusivo, spam, golpes, direitos autorais, consentimento de imagem, privacidade, proteção de menores, denúncias e LGPD. Permanecem minutas para revisão jurídica e aprovação humana; não são Termos de Uso homologados.

## 5. Site integrado nesta branch

O arquivo `social-crypykut/shots.html` foi substituído pela página CRYPY-SHOTS integrada ao CRYPY SOCIAL HUB.

A página contém 17 vistas/abas:
- Para Você, Seguindo, Ao Vivo, Descobrir, Publicar, Meu Perfil, NFT e Configurações;
- Assistir, Shorts, Destaques, Fórmula CRYPY, Agente I.A., Regras, Entrar, Guia e Testar Algoritmo.

Funções disponíveis localmente:
- filtros e busca temática;
- curtidas e seguir temas guardados no navegador;
- destaques locais;
- pré-visualização de vídeo selecionado no dispositivo e inclusão na sessão local;
- edição de perfil demonstrativo;
- calculadora local da fórmula de pontuação.

Funções explicitamente desativadas/não conectadas:
- conta/login, OAuth, publicação pública, upload para nuvem, feed compartilhado, chat global, lives, análise audiovisual automática, emissão NFT e recompensas.

A página usa a imagem já existente e pública em WEB3.1. As quatro imagens adicionais encontradas na pasta privada da LUCY não foram copiadas para WEB3.1 nesta etapa, pois ainda precisam de inspeção visual e confirmação de publicação/licença. Os arquivos-fonte originais permanecem intactos. O script social já compartilhado injeta um botão BABY com respostas predefinidas locais; isso não é modelo de IA conectado, chat global ou serviço em tempo real.

## 6. Menu CRYPY-SOCIAL e portal

- `assets/js/crypy-global-nav.js` já reconhecia CRYPY-SOCIAL com o grupo `crypy-shots`; não precisou ser redesenhado.
- `assets/data/crypy-page-index.json` foi atualizado para registrar `social-crypykut/shots.html` como `CRYPY-SHOTS · Site Final`, grupo `crypy-shots`.
- `social-crypykut/portal-manifest.json` foi atualizado para colocar o site final como primeira entrada do módulo `shots`.
- Contagem do portal: CRYPYKUT 147 + SHOTS 10 + LAND 20 = 177 entradas.
- A aba SHOTS do portal agora aponta para `./shots.html`.

## 7. MODO REAL — estado da entrega

Concluído nesta branch:
- varredura recursiva das árvores dos oito repositórios;
- identificação das principais fontes, cópias, snapshots e documentos relacionados a CRYPY-SHOTS;
- revisão semântica dos App.tsx principal e ampliado, CSS, páginas HTML, portal, manifests, menu e documentação social;
- criação do site estático integrado com 17 vistas;
- atualização do catálogo do portal e do menu global.

Ainda não concluído:
- cópia/publicação das quatro imagens privadas da LUCY;
- backend, banco, autenticação real, OAuth, upload, feed compartilhado, chat e lives;
- análise audiovisual real e agente de moderação operacional;
- contrato NFT e qualquer sistema de recompensas;
- testes end-to-end no GitHub Pages e homologação de produção.

**Preservação:** nenhuma origem foi apagada; nenhum arquivo de outro módulo foi sobrescrito; `main` não foi alterada. A promoção deve ocorrer por Pull Request e revisão humana.
