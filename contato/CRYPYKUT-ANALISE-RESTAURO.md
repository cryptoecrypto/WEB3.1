# CRYPYKUT — restauração como experiência dentro de CONTATO
Data: 20/11/2026

## Destino confirmado
A pedido do Sensei, o protótipo Crypykut Reels + Orkut foi colocado como subpágina da área CONTATO:
- Página de entrada: `contato/contato-oficial.html`
- Experiência: `contato/crypykut.html`
- Link de retorno: `contato/contato-oficial.html`

A página SOCIAL-CRYPYKUT existente não é substituída.

## Fonte e preservação
O pacote original contém `App.tsx`, `index.css` e `.clippy/vfs-manifest.json`. O conteúdo React/TSX foi mantido como referência no pacote original do usuário; a renderização web usa uma compilação gerada separadamente com substitutos visuais para os ícones Lucide. O código-fonte enviado não é regravado.

## Funcionalidades presentes no protótipo
- Duas abas internas: Reels e Orkut.
- Sete publicações-semente e cinco temas.
- Filtros e feed Seguindo/Para Você.
- Curtir, marcar como compartilhado, comentários e favoritos em estado de interface.
- Publicar um Reel de texto/metadados.
- BABY Moderador com respostas educativas por tema.
- Perfil demonstrativo, amigos, scraps, comunidades e depoimentos.
- O modo local usa localStorage para persistir os registros criados neste navegador.

## Limitações identificadas no próprio pacote
- Não há arquivos MP4/WebM ou imagens de vídeo incluídos. A área de Reels é uma composição visual/animada, não um player de vídeos reais.
- O aplicativo original chama `fetch("actions")` para listar e criar Reels, comentários, scraps e depoimentos; nenhum backend está incluído.
- A página hospedada em GitHub Pages não tem servidor de gravação. Foi adicionado um adaptador local limitado a quatro coleções permitidas; ele só persiste no navegador atual e não sincroniza entre visitantes.
- Curtidas, seguidores e algumas contagens são estados de interface, não métricas compartilhadas.
- Não há autenticação no pacote.

## Google e Microsoft
Os botões de acesso aparecem desativados até que sejam fornecidos os IDs públicos dos aplicativos OAuth, URLs de retorno e backend que valide os tokens e crie sessões. Segredos não devem ser colocados em HTML/JavaScript. A conexão não foi simulada.

## Alcance semelhante aos Reels de grandes plataformas
Não é possível garantir distribuição, visualizações ou viralização. Isso exige vídeos reais, armazenamento/CDN, backend de usuários, feed, ranking, moderação, denúncia, analytics e políticas de direitos autorais/privacidade. Essas peças não estão no pacote nem no GitHub Pages atual.

## Verificações feitas antes da publicação
- Compilação TypeScript/JSX gerada com zero diagnósticos TypeScript.
- JavaScript gerado aprovado em `node --check`.
- Rotas da área de contato serão verificadas após a gravação.
- Teste visual e testes reais de autenticação requerem abrir a publicação no navegador e configurar as aplicações OAuth.
