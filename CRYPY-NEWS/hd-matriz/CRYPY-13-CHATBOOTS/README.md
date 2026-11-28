# CRYPY — 13 ChatBoots

Arquitetura unificada dos 13 perfis da Colmeia CRYPY.

## Governança
- Sensei mantém a autoridade humana.
- BABY é o núcleo/orquestrador.
- NEXUS coordena arquitetura técnica, integração e auditoria.
- Cada ChatBoot tem perfil e escopo próprios.
- Memória compartilhada é curada e controlada por permissões.
- HD-MATRIZ e páginas originais permanecem fora do escopo.

## Cinco referências incorporadas como padrões
- CrewAI: papéis, tarefas e memória individual/compartilhada.
- Microsoft AutoGen / Agent Framework: mensagens, equipes e handoffs.
- OpenAI Agents SDK: orquestração, especialistas, guardrails e tracing.
- MetaGPT: fluxo de artefatos e revisão por etapas.
- G-Memory: memória em três níveis.

## Estado real desta entrega
**Implementado:** 13 perfis JSON; catálogo único; roteador determinístico; adaptador de catálogo no BABY; inclusão do catálogo e da arquitetura no indexador local; testes automatizados preparados.

**Ainda pendente:** 13 modelos generativos independentes; backend de inferência; mensageria de produção; armazenamento compartilhado remoto; sincronização com Dropbox; homologação de segurança e testes de navegador.

O catálogo no BABY é roteamento de contexto, não prova de que 13 modelos estão ativos. Nenhuma chave/API secret deve ser colocada no repositório ou no HTML público.


## Barramento de colaboração e relógio mundial
- `collaboration-bus.js` distribui envelopes locais aos 13 perfis cadastrados e registra destinatários, especialista sugerido e revisor.
- O barramento confirma distribuição lógica aos perfis; não executa inferência generativa nem representa 13 modelos externos conectados.
- `world-clock.js` fornece relógios de Paraná/Brasília, UTC, Nova York, Londres, Tóquio e Sydney via `Intl.DateTimeFormat`, usando o relógio do dispositivo.
- Modelos independentes exigem backend seguro, endpoints/provedores, credenciais protegidas e testes reais por agente.
