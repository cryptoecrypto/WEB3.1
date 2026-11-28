# BABY — núcleo e orquestrador da Colmeia

BABY recebe solicitações, consulta o catálogo de 13 perfis, propõe especialista principal e colaboradores e consolida resultados autorizados.

## Implementação nesta versão
- `orchestrator.js`: roteador determinístico e gerador de plano sem execução.
- `../config/agents.json`: catálogo oficial de 13 perfis.
- `browser-adapter.js`: carrega o catálogo para a interface BABY.
- Handoff e revisão são descritos como protocolo; não há agentes LLM conectados.

BABY não executa chamadas de provedor, ações externas ou operações destrutivas nesta versão. O Sensei continua como autoridade de aprovação.
