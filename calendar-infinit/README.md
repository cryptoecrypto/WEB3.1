# CRYPY Calendar Infinity

Módulo independente que reúne o calendário, as memórias locais, os controles visuais dos dois HTMLs de referência, o carrossel 3D e a galeria infinita.

## Ponto de entrada

Abra `index.html`. O módulo não substitui `App.tsx`, `index.css`, `map-calendar` nem os dois HTMLs originais.

## Galeria de imagens

- Inventaria arquivos de imagem públicos do repositório `cryptoecrypto/WEB3.1`, branch `main`.
- Formatos: AVIF, BMP, GIF, JPEG, PNG, SVG e WebP.
- Embaralha a coleção a cada carregamento e a cada alteração de filtro.
- As duas faixas exibem a coleção elegível completa e repetem continuamente, em sentidos opostos.
- O carrossel 3D usa uma amostra aleatória de até 24 imagens; as duas faixas são a galeria completa.
- Filtros por módulo são inferidos pelo nome do caminho/arquivo; a classificação é aproximada, não metadado oficial.
- Exclui diretórios privados/protegidos, HDs ocultos, backups, segredos, `.git`, dependências e `.github`.
- Se a árvore Git vier truncada, tenta inventário recursivo pela API Contents. Limites da API, diretórios com mais de 1.000 itens ou indisponibilidade da API podem impedir garantia absoluta de cobertura.

O contador representa arquivos de imagem inventariados, não garante que cada arquivo seja uma fotografia nem que todos os links raw estejam disponíveis. Arquivos que falham ao carregar permanecem identificáveis como indisponíveis; originais não são alterados.

## Calendário e segurança

- Calendário mensal, navegação de meses, seleção de dia e registro de memórias.
- Eventos armazenados apenas em `localStorage` do navegador atual; não há sincronização Dropbox/backend.
- Texto do evento é renderizado como texto, não como HTML, para evitar injeção de código.

## Preservação

Os dois arquivos enviados pelo usuário permanecem intactos:
- `Crypy-Calendar-Infinity-3D-PURO.html`
- `Crypy-Calendar-Infinity-PURO.html`

Os arquivos React existentes e `map-calendar` também são preservados.