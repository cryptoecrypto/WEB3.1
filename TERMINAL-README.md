# CRYPY TERMINAL CENTRAL — v1.1

## Finalidade
Camada operacional de inventário e auditoria do repositório WEB3.1. Esta integração preserva o núcleo CRYPY SERVER existente e acrescenta comandos do Terminal Central.

## Comandos
- `npm start`: inicia o servidor existente por meio do script original.
- `npm run terminal`: inicia o Terminal Central, usando o servidor existente.
- `npm run inventory`: inventário somente leitura da raiz do repositório.
- `npm run audit`: auditoria estrutural somente leitura.
- `npm test`: executa a suíte existente de testes Node.js.

## Limites de segurança
- Nenhuma publicação automática no GitHub Pages ou em servidor externo.
- Nenhuma credencial, token ou senha deve ser versionado.
- Auditoria e inventário não modificam arquivos.
- Alterações e publicações exigem revisão e aprovação explícita do Sensei.
- O workflow valida código; a mensagem final não representa aprovação humana nem prova de implantação.

## GitHub Actions
O workflow `.github/workflows/validate.yml` executa em push, pull request para `main` e diariamente às 12:00 UTC.

## Compatibilidade
O Terminal v1.1 é integrado ao projeto existente. Os comandos e testes originais do CRYPY SERVER são preservados; não substitui `src/server.js`, a suíte de testes ou a documentação anterior.
