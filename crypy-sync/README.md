# CRYPY — Contrato de integração dos três repositórios

## Topologia e autoridade

- `cryptoecrypto/WEB3.1`: cliente público e interface. Nunca recebe tokens, credenciais, dados privados, memória persistente ou evidências do HD-MATRIZ.
- `cryptoecrypto/HD-MATRIZ`: núcleo privado e autoridade do backend, armazenamento persistente, auditoria e runtime BABY.
- `cryptoecrypto/CRYPY-SECURITY`: camada de revisão de segurança e testes. Espelha apenas código de segurança explicitamente autorizado; não recebe estado privado.

## Regras de sincronização

1. Integração por branches e Pull Requests; nunca fazer push automático diretamente em `main`.
2. Comparar SHA/blob antes de atualizar. Divergência exige revisão, não sobrescrita automática.
3. Apenas código, testes, documentação de contrato e manifests explicitamente allowlisted podem cruzar repositórios.
4. Proibido sincronizar `.env*`, segredos, tokens, chaves, `/data`, `.baby/`, memória, evidências, snapshots, sessões ou backups privados.
5. Não copiar todo o repositório, não apagar origem e não seguir links simbólicos para fora das raízes permitidas.
6. Toda execução registra origem, destino, commit, arquivos e hashes; a validação deve falhar se o inventário não fechar.
7. O backend aceita sessão administrativa e Bearer API token. O Bearer só funciona quando `CRYPY_API_TOKEN` está definido (mínimo 32 bytes) e a origem está em `CRYPY_ALLOWED_ORIGINS` (lista exata, separada por vírgulas; sem wildcard).

## Credenciais de automação

A sincronização cross-repo automatizada requer o segredo GitHub Actions `CRYPY_SYNC_TOKEN`, com acesso mínimo aos três repositórios e permissões Contents: read/write e Pull requests: read/write. O token deve ser cadastrado nas configurações de Actions Secrets, nunca em arquivo, variável pública, issue ou log. Até o segredo ser provisionado, os workflows executam validação local e a promoção entre repositórios é feita por PRs separados.

## Contrato do cliente WEB3.1

O cliente utiliza HTTPS para `https://baby-site-auth-production.up.railway.app`, envia `Authorization: Bearer <token>` e mantém o token apenas em `sessionStorage`. O servidor compara o token em tempo constante e só emite CORS para origens explicitamente autorizadas. O token não pode ser embutido no HTML/JavaScript público.
