# CRYPY · BABY — Núcleo operacional na HD MATRIZ

**Identificador:** CRYPY-BABY-SERVER-001  
**Versão:** 0.1.0  
**Estado:** backend implementado; homologação/deploy em andamento.  
**Pasta:** `crypy-news/hd-matriz/crypy-server-bridge/`

## Componentes
- `src/server.js`: servidor HTTP Node.js e rotas API.
- `src/auth.js`: autenticação administrativa, sessão HttpOnly e controle de tentativas.
- `src/baby.js`: orquestração de tarefas.
- `src/memory.js`: inventário, hashes SHA-256, índice e busca.
- `src/vault.js`: snapshots aditivos, deduplicação e verificação.
- `src/audit.js`: trilha de auditoria encadeada por hashes.
- `src/policy.js`: raízes e permissões read/readwrite; tarefas destrutivas exigem aprovação do Sensei.
- `src/ledger.js`: máquina de estados documental com evidência obrigatória.
- `public/index.html`: painel administrativo servido pelo backend.
- `test/`: testes Node.js.

## Execução local
Requer Node.js 20 ou superior.

```bash
npm test
CRYPY_ADMIN_PASSWORD='uma-senha-forte-com-ao-menos-24-caracteres' \
CRYPY_SENSEI_TOKEN='um-token-aleatorio-com-ao-menos-32-bytes' \
NODE_ENV=production npm start
```

O painel é servido na raiz `/`; a verificação pública mínima é `/health`. As rotas operacionais `/api/*` exigem sessão administrativa.

## Variáveis de produção
Definir no gerenciador de segredos do Railway, nunca no HTML ou no repositório:
- `NODE_ENV=production`
- `CRYPY_ADMIN_USER=sensei`
- `CRYPY_ADMIN_PASSWORD`: segredo aleatório com pelo menos 24 caracteres.
- `CRYPY_SENSEI_TOKEN`: token aleatório com pelo menos 32 bytes, separado da senha.
- `CRYPY_DATA_DIR=/data/crypy-baby`
- `CRYPY_EVIDENCE_DIR=/data/crypy-baby/evidence`
- `CRYPY_SANDBOX_DIR=/data/crypy-baby/sandbox`
- `CRYPY_SESSION_TTL_SECONDS=28800`

O token de aprovação é diferente da senha de login. Ele autoriza operações destrutivas; não deve ser reutilizado como senha.

## Persistência e limites
O serviço usa o volume montado em `/data` para memória, estado do ledger, evidências, sandbox, snapshots e trilha de auditoria. A raiz de código é tratada como somente leitura; operações de escrita devem ocorrer nas raízes persistentes autorizadas.

A indexação padrão cobre a pasta do serviço no container, não a totalidade do repositório WEB3.1 nem todos os arquivos da HD MATRIZ. Fontes adicionais precisam ser montadas/declaradas explicitamente na política; não se presume acesso a pastas fora das raízes configuradas.

As sessões são mantidas em memória do processo e expiram após oito horas; um redeploy/restart encerra sessões existentes e exige novo login. O armazenamento local `/data` continua preservado.

## Segurança
- Nenhuma senha ou token padrão é aceito em produção.
- API sem autenticação responde 401.
- Operações POST da API exigem mesma origem.
- Cookies de sessão: HttpOnly, SameSite=Strict e Secure em produção.
- Limite do corpo HTTP: 1 MB.
- Operações destrutivas permanecem em dry-run por padrão e exigem aprovação do Sensei para executar.
- O painel não coleta seed phrase, chave privada ou credenciais de carteira.

## Serviços ainda planejados
Dropbox, sincronização de outros HDs, Google/Microsoft OAuth, integração com BABY core externo e importação automática do restante do WEB3.1 continuam como adaptadores planejados, não como recursos ativos. Este servidor não é uma IA neural treinada: é um backend operacional com regras, índice e trilha auditável.

## Homologação
`npm test` é executado como comando pré-deploy no Railway. A implantação só deve ser declarada ativa após estado Railway `SUCCESS` e verificação HTTP de `/health` e do painel de login.
