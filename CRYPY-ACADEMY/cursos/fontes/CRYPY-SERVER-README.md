# CRYPY SERVER — Terminal Central v1.1 / Núcleo v2.0

Este diretório contém o projeto operacional do servidor CRYPY, agora centralizado no HD MATRIZ:

`crypy-news/hd-matriz/crypy-server/`

## Inicialização local

A partir desta pasta:

```bash
npm start
```

O Terminal Central inicia o núcleo HTTP. A porta padrão é **8787** (pode ser alterada por `CRYPY_PORT` ou `PORT`). O endpoint de saúde é:

```text
http://localhost:8787/health
```

## Validação

```bash
npm test
npm run audit
npm run inventory
```

## Estrutura

- `src/` — núcleo, políticas, memória, barramento, terminal e servidor HTTP.
- `bin/` — CLI do BABY.
- `public/` — painel do servidor.
- `test/` — testes automatizados Node.js.
- `scripts/` — auditoria e registro de evidências.
- `tooling/node-shims/` — cópias históricas de scripts auxiliares do Node/npm; não são necessárias para executar o projeto.
- `server-config.example.json` — exemplo sem credenciais.

## Integração com WEB3.1

Os arquivos de conexão do site permanecem na raiz do repositório. O workflow de validação permanece em `.github/workflows/validate.yml`, pois o GitHub Actions exige esse caminho; ele executa os comandos dentro deste diretório do HD MATRIZ.

O painel do servidor não significa que o serviço esteja hospedado publicamente. Para uso externo, o Node.js precisa ser executado em um host de servidor compatível e o endereço precisa ser configurado na ponte do site.

## Segurança e MODO REAL

- Não versionar tokens, senhas ou arquivos `.env`.
- A configuração de exemplo não contém credenciais.
- Auditorias e testes não equivalem a implantação em produção.
- A publicação e a aprovação final continuam dependendo do Sensei.

 
## Implantação pública segura (Render)

O manifesto `render.yaml` na raiz do repositório prepara o serviço Node.js usando este diretório como raiz. No Render, crie um Blueprint a partir do repositório `cryptoecrypto/WEB3.1` e confirme o serviço `crypy-server`.

Configure no painel do serviço, em Environment:
- `CRYPY_API_TOKEN`: token aleatório forte para autorizar a ponte do navegador.
- `CRYPY_SENSEI_TOKEN`: segredo separado para aprovações de operações destrutivas.
- `CRYPY_ALLOWED_ORIGINS`: `https://cryptoecrypto.github.io`.

Não use o mesmo segredo nos dois campos. Não publique tokens no GitHub nem em URLs. Sem `CRYPY_API_TOKEN`, todas as rotas `/api/*` ficam bloqueadas; somente `/health` permanece pública. As rotas da API exigem `Authorization: Bearer <token>`.

Depois que o Render informar a URL HTTPS, abra `baby-ia-conectado.html`, use o botão **CRYPY SERVER**, informe URL e token e execute **Testar conexão**. A conexão só será confirmada se /health e /api/status responderem.

O deploy ainda exige que o proprietário autorize a conexão do GitHub ao Render e configure os dois segredos no painel. O repositório não recebe nem armazena esses segredos.
