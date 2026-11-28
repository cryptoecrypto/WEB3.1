# CRYPY TERMINAL CENTRAL — v1.1

## Localização
O projeto do servidor está centralizado em `crypy-news/hd-matriz/crypy-server/`.
O workflow GitHub Actions permanece em `.github/workflows/validate.yml`, na raiz do repositório, por exigência da plataforma.

## Comandos
Execute a partir da pasta `crypy-news/hd-matriz/crypy-server/`:
- `npm start`: inicia o servidor existente pelo Terminal Central.
- `npm run terminal`: entrada explícita do Terminal Central.
- `npm run inventory`: inventário somente leitura desta pasta do servidor.
- `npm run audit`: auditoria estrutural somente leitura.
- `npm test`: executa a suíte de testes Node.js.

## Limites de segurança
- Nenhuma publicação automática no GitHub Pages ou em servidor externo.
- Nenhuma credencial, token ou senha deve ser versionado.
- Auditoria e inventário não modificam arquivos.
- Alterações e publicações exigem revisão e aprovação explícita do Sensei.
- O workflow valida código; a mensagem final não representa aprovação humana nem prova de implantação.

## GitHub Actions
O workflow `.github/workflows/validate.yml` executa em push, pull request para `main` e diariamente às 12:00 UTC. Os comandos são executados no diretório do servidor dentro do HD MATRIZ.

## Compatibilidade
O Terminal v1.1 permanece integrado ao núcleo CRYPY SERVER existente. Os módulos e testes originais são preservados; esta reorganização altera caminhos no repositório, não declara integração de Dropbox, HDs externos ou IAs externas.
