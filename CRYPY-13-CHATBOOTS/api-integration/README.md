# Integração de APIs — adaptadores independentes

A arquitetura define a interface futura para provedores de modelos, mas **nenhum provedor está conectado nesta versão**.

## Contrato futuro
- Entrada: `taskId`, `agentId`, `objective`, `context`, `sources`, `sensitivity`.
- Saída: `status`, `artifact`, `citations`, `handoffRequest`, `usage`.
- Credenciais: somente variáveis de ambiente/secret manager do backend.
- O navegador nunca recebe chaves de provedor.
- Adaptadores devem suportar timeout, rate limit, validação de saída, cancelamento e logs sem segredos.

## Estado
- Catálogo dos 13 perfis: configurado.
- Roteamento determinístico local: implementado no módulo `baby-core/orchestrator.js`.
- Adaptador de provedor: não implementado.
- API generativa: não conectada.
- Backend independente: não provisionado.
