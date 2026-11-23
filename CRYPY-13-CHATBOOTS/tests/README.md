# Testes e homologação — 13 ChatBoots

Executar na raiz do repositório com Node.js 20+:

```bash
node --test CRYPY-13-CHATBOOTS/tests/colmeia.test.mjs
```

Os testes cobrem: 13 IDs únicos; correspondência entre catálogo e perfis; roteamento por especialidade; presença de BABY/NEXUS na governança; marcação das quatro funções ainda propostas; bloqueio de execução automática e exigência de aprovação em ações sensíveis.

Esses testes validam configuração e roteamento local. Não validam qualidade de modelos generativos, API externa, backend, Dropbox, autenticação de produção nem navegação manual.
