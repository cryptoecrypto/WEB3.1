# BABY I.A. — autenticação e aprendizagem do site CRYPY

Serviço Node.js >=20, sem dependências externas. Faz autenticação da interface e oferece indexação/busca dos conteúdos públicos do próprio WEB3.1.

## Escopo de segurança
- A chave existe somente na variável de ambiente `BABY_SITE_KEY`; nunca no HTML, JavaScript público, GitHub ou backup.
- `BABY_SITE_ORIGIN`: origem HTTPS exata autorizada (ex.: `https://cryptoecrypto.github.io`, sem caminho).
- `BABY_SITE_URL`: URL pública HTTPS do site, incluindo o caminho base do GitHub Pages e barra final (ex.: `https://cryptoecrypto.github.io/WEB3.1/`).
- Sessão de 30 minutos, cookie HttpOnly/Secure e limite de 8 tentativas por IP a cada 15 minutos.
- Todas as rotas de aprendizado e consulta exigem sessão autenticada e origem autorizada.
- O crawler só indexa HTML do mesmo site, limita o inventário a 500 páginas e ignora arquivos maiores que 2 MB.
- O índice `site-index.json` contém trechos de conteúdo público e é salvo junto ao serviço. Garanta disco persistente no host ou execute novamente o aprendizado após reinicializações.

## Rotas
- `GET /session`: verifica sessão.
- `POST /unlock`: valida a palavra-chave e cria sessão.
- `POST /lock`: encerra a sessão.
- `POST /learn`: percorre a Home, Mapa da Colmeia, páginas listadas e 18 páginas temáticas dedicadas; extrai texto, divide em blocos e atualiza o índice.
- `POST /search`: recebe `{"query":"..."}` e devolve até 5 trechos relevantes com título e URL de origem.
- `GET /learning-status`: informa se há blocos indexados.

## Implantação
1. Hospede este serviço em backend Node.js >=20 com HTTPS.
2. Configure os segredos de ambiente `BABY_SITE_KEY`, `BABY_SITE_ORIGIN` e `BABY_SITE_URL`.
3. Use armazenamento persistente para `baby-site-auth/site-index.json`.
4. Configure `window.BABY_SITE_API` em `baby-site-config.js` com a URL HTTPS do backend.
5. Teste sessão, bloqueio, indexação, busca e links de origem antes de liberar a produção.
6. Entre no chatbot e pressione **APRENDER SITE** para iniciar/atualizar o índice. As consultas do chat usam `/search` e mostram as fontes.

## Limites importantes
- Isto é RAG lexical: coleta, fragmenta, pontua por palavras e recupera trechos. Não treina nem altera os pesos de um modelo de IA e não cria compreensão autônoma.
- A resposta do chatbot ainda depende do motor de conversa configurado no cliente. Os trechos recuperados são apresentados com fontes; integração com um LLM para síntese exige um provedor/modelo e chave protegida no servidor.
- O crawler lê páginas HTML públicas, não executa aplicações JavaScript, não acessa áreas privadas, imagens binárias, documentos externos, Dropbox, HD MATRIZ ou conteúdo que exija autenticação própria.
- GitHub Pages é estático e não executa Node.js. Enquanto o backend HTTPS não estiver implantado e configurado, o gate permanece fechado (fail-closed).
- O código-fonte HTML/JS continua público. O gate protege a interface, não transforma arquivos públicos em conteúdo secreto.
