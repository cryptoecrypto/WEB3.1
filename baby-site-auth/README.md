# BABY I.A. — autenticação exclusiva do site CRYPY

Este serviço é o validador server-side do bloqueio compartilhado dos chatbots.

## Segurança e escopo
- A chave existe somente na variável de ambiente `BABY_SITE_KEY`; nunca no HTML, JavaScript público, GitHub ou backup.
- Configure `BABY_SITE_ORIGIN` com a origem HTTPS exata do site.
- Sessão de 30 minutos, cookie HttpOnly/Secure e limite de 8 tentativas por IP a cada 15 minutos.
- O serviço só valida a origem autorizada e declara o escopo `crypy-site`. Não concede acesso ao computador, arquivos pessoais ou outros projetos.
- Não há endpoint de leitura/escrita de arquivos, Dropbox, memória ou execução de comandos.

## Implantação
1. Hospede este serviço Node.js >=20 em um backend HTTPS.
2. Cadastre `BABY_SITE_KEY` como segredo de ambiente com pelo menos 16 caracteres, aleatório e exclusivo.
3. Cadastre `BABY_SITE_ORIGIN` como a origem HTTPS exata do site (sem caminho).
4. Configure o domínio/roteamento HTTPS para encaminhar `/session`, `/unlock` e `/lock` ao serviço.
5. No arquivo público `baby-site-config.js`, configure `window.BABY_SITE_API` para a URL HTTPS do serviço.
6. Faça testes de sessão válida, chave inválida, bloqueio por tentativas e sessão expirada antes de liberar o uso.

## Limitação importante
GitHub Pages é hospedagem estática e não executa este servidor Node.js. Enquanto o backend HTTPS não estiver implantado e configurado, o gate permanece fechado por projeto (fail-closed). O código-fonte dos HTMLs continua público; este bloqueio controla a abertura da interface, não torna secretos os arquivos estáticos. Para proteger dados ou operações, os endpoints que os fornecem também devem exigir sessão no servidor.
