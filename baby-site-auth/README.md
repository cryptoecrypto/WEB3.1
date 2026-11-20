# BABY I.A. — autenticação e sincronização do índice do site CRYPY

Serviço Node.js >=20, sem dependências externas. Protege a interface e descobre recursivamente páginas HTML públicas do próprio WEB3.1 para criar/atualizar o índice local.

## Segurança
- A chave fica somente na variável de ambiente `BABY_SITE_KEY`; nunca no HTML, JavaScript público, GitHub ou backup.
- `BABY_SITE_ORIGIN`: origem HTTPS exata autorizada (ex.: `https://cryptoecrypto.github.io`, sem caminho).
- `BABY_SITE_URL`: URL HTTPS do site incluindo o caminho base e barra final (ex.: `https://cryptoecrypto.github.io/WEB3.1/`).
- Sessão de 30 minutos, cookie HttpOnly/Secure e limite de 8 tentativas por IP a cada 15 minutos.
- Rotas de aprendizado e busca exigem sessão autenticada e origem autorizada.
- O índice contém texto público e metadados extraídos do site. Use disco persistente no host.

## Descoberta e sincronização
- Começa pela Home, `index.htm`, Mapa da Colmeia e páginas temáticas conhecidas.
- Percorre recursivamente os links HTML internos encontrados em cada página, respeitando a origem e o caminho base do WEB3.1.
- Limites atuais: até 2.000 páginas descobertas/processadas; até 25 MiB por documento HTML; 8 downloads concorrentes.
- Não interrompe o processo por um documento grande isolado: documentos até 25 MiB são aceitos. Documentos maiores aparecem no relatório como `oversize`.
- Extrai texto HTML, título da página e descrições `alt`/`title` de imagens. Não baixa nem interpreta o conteúdo visual binário.
- Gera blocos de texto com sobreposição e grava `site-index.json` de forma atômica, substituindo o índice anterior somente após concluir a nova varredura.
- Relatório em `GET /learning-status`: estado complete/partial, páginas descobertas, buscadas e indexadas, blocos, URLs com falha e documentos acima do limite.

## Rotas
- `GET /session`: verifica sessão.
- `POST /unlock`: valida a palavra-chave e cria sessão.
- `POST /lock`: encerra a sessão.
- `POST /learn`: redescobre e sincroniza o índice do site.
- `POST /search`: recebe `{"query":"..."}` e devolve até 5 trechos com título e URL de origem.
- `GET /learning-status`: mostra cobertura registrada e falhas da última varredura.

## Implantação
1. Hospede este serviço em backend Node.js >=20 com HTTPS.
2. Configure `BABY_SITE_KEY`, `BABY_SITE_ORIGIN` e `BABY_SITE_URL` como variáveis de ambiente no host.
3. Garanta armazenamento persistente para `baby-site-auth/site-index.json`.
4. Configure `window.BABY_SITE_API` em `baby-site-config.js` com a URL HTTPS do backend.
5. Entre no chatbot e execute **APRENDER SITE**; depois consulte `/learning-status` e faça perguntas de teste.
6. Antes da produção, valide login, bloqueio, indexação, recuperação e links de origem.

## Limites que permanecem explícitos
- É RAG lexical: localiza e recupera trechos. Não treina pesos de modelo, não é aprendizado neural e não prova compreensão autônoma.
- Não executa JavaScript do site; conteúdo criado somente em tempo de execução pode não ser capturado.
- Não lê imagens binárias, áudio, vídeo, PDFs, documentos anexados, conteúdo externo, páginas privadas, Dropbox ou HD MATRIZ. Descrições textuais `alt`/`title` de imagens são indexadas quando existem.
- A indexação recursiva cobre apenas links HTML internos descobertos, dentro dos limites configurados. Páginas órfãs sem link e acima do limite podem ficar fora.
- GitHub Pages é estático e não executa Node.js. Sem backend HTTPS implantado e configurado, a aprendizagem não é executada.
- O código-fonte HTML/JS do site continua público; o gate protege a interface, não torna arquivos estáticos secretos.
- Nenhuma sincronização real foi executada por esta alteração. O novo código só inicia a varredura quando o backend estiver implantado e o endpoint autenticado `POST /learn` for chamado.
