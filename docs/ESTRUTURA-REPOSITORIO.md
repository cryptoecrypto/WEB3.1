# Estrutura canônica do repositório WEB3.1

**Branch de referência:** `main`  
**Raiz do projeto:** a raiz deste repositório Git.  
**Node.js exigido:** 20 ou superior.

## Regra principal: um único núcleo de servidor

O pacote executável do CRYPY SERVER está na **raiz** do repositório:
- `package.json`
- `src/`
- `bin/`
- `test/`
- `public/`
- `scripts/`

A pasta `crypy-server-bridge/` é apenas uma área de orientação/compatibilidade; ela **não** contém uma segunda instalação do servidor. Não copiar o repositório inteiro para dentro dela e não executar npm a partir dela.

## Comandos Windows (CMD)

Abra o CMD na pasta que contém o `package.json` da raiz WEB3.1:

```cmd
cd C:\caminho\para\WEB3.1
node -v
npm -v
npm test
npm run check:structure
npm run status
```

Para indexar a raiz WEB3.1, ainda é necessário que a política de acesso autorize explicitamente essa raiz. Não use `--root ..` a partir de uma subpasta e não altere `CRYPY_TARGET_ROOT` sem conferir a configuração e a allowlist.

## Pastas do site

As áreas públicas e seus espelhos existentes permanecem em seus caminhos atuais. Os diretórios `memory-boost` e `momory-boost`, bem como arquivos repetidos como `Memorias.json`, `Manifest.json` e `Fila-Sync.json`, são tratados como **conteúdo existente a auditar**, não como lixo. Não renomear, mover ou apagar sem comparar hashes, links HTML, caminhos relativos e intenção de cada espelho.

## Proteção

- Preservar `CNAME`, `index.html`, os HTMLs originais e os HDs.
- Não colocar tokens, senhas ou credenciais no repositório.
- Não expor o servidor na internet até concluir revisão de autenticação e autorização das rotas HTTP.
- Uma cópia local não é sincronização automática.
- O indexador atual faz inventário/hash e busca textual; não é um LLM nem executa instruções encontradas nos arquivos.

## Verificação automatizada

O workflow `.github/workflows/validate.yml` executa os testes existentes com Node 20 e valida a estrutura mínima do repositório em cada push/PR. Isso valida o núcleo e a estrutura; não equivale a testar visualmente todos os 271 HTMLs, suas integrações externas, Dropbox, HDs ou produção.
