# BABY I.A. — Dropbox Bridge (isolado)

Serviço lateral de integração do BABY. Não altera o núcleo operacional alojado na HD MATRIZ e não lê/escreve nela. O cliente chama este serviço apenas depois de autenticação explícita.

## Capacidades implementadas

- OAuth 2.0 Authorization Code para aplicação de servidor, com PKCE S256, state de uso único e expiração de 10 minutos.
- Solicita token_access_type=offline para obter refresh token e renova access token expirado.
- Guarda refresh/access tokens cifrados com AES-256-GCM num volume privado persistente; nunca os devolve pela API.
- Escopo mínimo por padrão: files.metadata.read e files.content.write.
- Escopo de arquivos limitado a /CRYPY/BABY; rejeita caminhos fora dessa raiz e segmentos de travessia.
- Upload de snapshot JSON limitado a 4 MB, com SHA-256, nomes únicos e modo Dropbox add (não sobrescreve).
- Guarda o backup em BACKUP, manifesto em MANIFEST e registro em SYNC-LOG.
- API protegida por token Bearer de serviço, CORS por allowlist, respostas sem cache, HSTS em produção, erros 500 sem detalhes internos e auditoria local append-only encadeada por SHA-256 com âncora persistente.

## Rotas

- GET /health: healthcheck mínimo e público.
- GET /api/dropbox/status: estado de configuração/conexão; requer Bearer token.
- POST /api/dropbox/oauth/start: cria URL de autorização; requer Bearer token.
- GET /oauth/dropbox/callback: callback público protegido por state de uso único.
- POST /api/dropbox/list: lista uma pasta dentro de /CRYPY/BABY; requer Bearer token.
- POST /api/dropbox/backup: envia um snapshot JSON para as três pastas previstas; requer Bearer token.

### Exemplo de backup

    POST /api/dropbox/backup
    Authorization: Bearer <CRYPY_DROPBOX_BRIDGE_TOKEN>
    Content-Type: application/json

    {"label":"memory-boost","content":"{\"version\":1,\"records\":[]}"}

O navegador não tem acesso direto ao IndexedDB de outra origem ou ao disco do servidor. Para enviar a memória local do BABY, a interface deverá exportar um snapshot JSON e enviá-lo explicitamente a esta rota. Esta ponte não faz sincronização silenciosa do IndexedDB nem dá acesso ao HD MATRIZ.

## Configuração Railway

Criar um serviço separado, apontando para o repositório cryptoecrypto/WEB3.1, branch aprovada e rootDirectory=/baby-dropbox-bridge. Manter o serviço atual baby-site-auth independente.

Montar um volume persistente em /data. Definir as variáveis somente no gerenciador seguro do Railway:

| Variável | Regra |
|---|---|
| NODE_ENV | production |
| PORT | Railway injeta; padrão local 8080 |
| CRYPY_DROPBOX_BRIDGE_TOKEN | segredo aleatório com pelo menos 32 bytes |
| CRYPY_DROPBOX_ALLOWED_ORIGINS | origens HTTPS exatas, sem * |
| DROPBOX_APP_KEY | App Key criada no Dropbox App Console |
| DROPBOX_APP_SECRET | segredo do App Console; nunca publicar |
| DROPBOX_REDIRECT_URI | URI HTTPS exata registrada no App Console |
| DROPBOX_TOKEN_ENCRYPTION_KEY | 32 bytes aleatórios em Base64 ou 64 caracteres hex |
| DROPBOX_DATA_DIR | /data/crypy-dropbox |
| DROPBOX_SCOPES | files.metadata.read files.content.write |

Gerar uma chave de 32 bytes fora do chat e guardá-la como segredo do Railway (por exemplo, openssl rand -base64 32). Nunca enviar App Secret, bridge token ou chave de criptografia pelo chat, HTML público ou Git.

No Dropbox App Console, habilitar somente os escopos listados e registrar exatamente o valor de DROPBOX_REDIRECT_URI. Como as pastas CRYPY/BABY já ficam na raiz da conta, o app precisa do tipo Full Dropbox; o código restringe os caminhos atendidos à raiz BABY e os escopos continuam mínimos. Se optar por App Folder, será necessário adaptar o destino para a pasta privada do app.\n\nO state OAuth é mantido em memória por 10 minutos; executar este bridge com uma réplica única até migrar o state para armazenamento compartilhado.

## Execução local e testes

Node.js 20+:

    npm test
    npm start

Os testes usam respostas simuladas do Dropbox: comprovam o contrato interno, criptografia, restrição de caminhos, no-overwrite, estado OAuth e proteção HTTP. Não substituem autorização real no Dropbox nem teste de integração de produção.

## Estado MODO REAL em 21/11/2026

- Código e testes do bridge: preparados nesta branch/PR.\n- Auditoria local do bridge: cadeia append-only com SHA-256 e âncora, verificada pela rota autenticada /api/dropbox/audit.
- OAuth real: depende de App Key, App Secret, Redirect URI e consentimento humano no Dropbox.
- Persistência: depende de volume Railway separado e chave criptográfica configurada.
- Conexão com o backend BABY atual: ainda precisa de configuração do novo serviço e inserção da URL/token na integração cliente aprovada.
- Backup automático do IndexedDB: não implementado; a transferência precisa ser acionada pela interface e enviar export JSON.
- Serviço atual baby-site-auth não foi reconfigurado, reiniciado nem alterado por este trabalho.
