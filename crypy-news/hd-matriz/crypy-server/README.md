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
