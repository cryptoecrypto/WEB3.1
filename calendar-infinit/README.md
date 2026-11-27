# CRYPY Calendar Infinity

Módulo independente do calendário visual da Colmeia CRYPY.

## Abrir

O ponto de entrada é `index.html`. Não exige compilação React nem altera os arquivos originais do calendário 3D.

## Componentes

- `assets/css/calendar-infinit.css`: visual responsivo e recorte padronizado das miniaturas.
- `assets/js/image-collector.js`: consulta a árvore pública do repositório `cryptoecrypto/WEB3.1` e inventaria arquivos de imagem.
- `assets/js/infinite-gallery.js`: duas faixas em sentidos opostos, com pausa e velocidade.
- `assets/js/calendar-infinit.js`: calendário mensal e memórias locais no navegador.
- `assets/data/image-index.json`: contrato/documentação do inventário dinâmico.

## Inventário e segurança

A coleta usa a árvore Git pública da branch `main`, não a varredura de páginas HTML. Considera AVIF, BMP, GIF, JPEG, PNG, SVG e WebP. Exclui diretórios privados/protegidos, HDs ocultos, backups, segredos, `.git` e dependências. O código verifica o indicador `truncated` da API e avisa quando a resposta não representa a árvore completa.

O contador indica arquivos de imagem encontrados pela API, não garante que todos sejam fotografias nem que todos possam ser carregados no navegador. O acesso depende da disponibilidade da API pública do GitHub, limites de requisição e entrega de imagens raw.

## Memórias

Os eventos criados nesta versão são armazenados em `localStorage` no navegador utilizado. Não existe sincronização com Dropbox, backend ou outros dispositivos nesta implementação.

## Preservação

Os arquivos React existentes `App.tsx` e `index.css` e o arquivo `map-calendar` foram preservados. Este módulo usa um `index.html` próprio e seus próprios arquivos em `assets/`.
