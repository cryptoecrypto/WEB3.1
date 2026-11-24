# CRYPY Academy API

Backend isolado da CRYPY Academy. Não reutiliza nem acessa o backend BABY/HD MATRIZ.

## Rotas
- `GET /health` — healthcheck.
- `GET /api/status` — informa estado sem revelar credenciais.
- `GET /auth/dropbox/start` — inicia OAuth 2.0 com PKCE e acesso offline.
- `GET /auth/dropbox/callback` — valida state, troca code e guarda refresh token no volume.
- `POST /api/dropbox/upload` — upload protegido por Bearer `ACADEMY_SYNC_KEY`; aceita apenas destinos em `/MEMORY-BOOST/`.

## Variáveis Railway
- `APP_ORIGIN=https://cryptoecrypto.github.io/WEB3.1` (URL base da aplicação; CORS usa somente a origem HTTPS, sem caminho)
- `DROPBOX_APP_KEY` — App Key do app Dropbox da Academy.
- No Dropbox Developers, habilitar o escopo `files.content.write` e cadastrar o Redirect URI exatamente como acima. O fluxo PKCE usa acesso offline e não precisa de App Secret.
- `DROPBOX_REDIRECT_URI=https://crypy-academy-api-production.up.railway.app/auth/dropbox/callback` — registrar exatamente no Dropbox Developers.
- `DROPBOX_TOKEN_FILE=/data/dropbox-token.json`
- `ACADEMY_SYNC_KEY` — segredo aleatório forte com pelo menos 32 caracteres, diferente da App Key; necessário para autorizar chamadas de upload. Sem ele, o endpoint retorna `503` e não aceita upload.

Nunca inserir App Secret, refresh token ou ACADEMY_SYNC_KEY em HTML, GitHub ou mensagens. O fluxo usa PKCE e não requer App Secret. Montar volume persistente em `/data` antes de autorizar a conta.

## Observações de segurança
- OAuth state aleatório e de uso único, PKCE S256 e token exchange no servidor.
- Refresh token é gravado somente no volume persistente.
- CORS restrito à origem configurada.
- Upload limitado a `/MEMORY-BOOST/`, sem permitir caminhos ascendentes.
- Não há endpoint público para ler token nem para explorar o volume.
- Antes do primeiro upload real, validar o conteúdo e o destino. A rota usa modo `add` para não sobrescrever arquivos existentes e consulta `files/get_metadata` para confirmar ID e tamanho após o upload.

## Verificação
`npm run check` e `GET /health`.
