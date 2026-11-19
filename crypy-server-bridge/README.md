# CRYPY SERVER — localização do núcleo

Este diretório existe para evitar ambiguidade de caminho.

**Atenção:** o pacote executável do CRYPY SERVER está na raiz do repositório WEB3.1, junto de `package.json`, `src/`, `bin/` e `test/`. Este diretório não contém uma segunda cópia do servidor.

No Windows, abra o CMD na raiz WEB3.1 (a pasta que contém `package.json`) e execute:

```cmd
node -v
npm -v
npm test
npm run check:structure
npm run status
```

Não copie a raiz do site para dentro deste diretório. Não execute `npm` aqui. Consulte `docs/ESTRUTURA-REPOSITORIO.md` para o mapa canônico.
