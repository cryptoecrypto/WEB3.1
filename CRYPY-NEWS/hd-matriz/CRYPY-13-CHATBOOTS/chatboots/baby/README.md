# BABY — núcleo e orquestrador

**Estado do papel:** papel registrado.

**Missão:** Receber solicitações, classificar tarefas, encaminhar especialistas e consolidar resultados autorizados.

## Responsabilidades
- orquestrar os 13 perfis
- definir plano e sequência de colaboração
- consolidar evidências e respostas
- respeitar aprovações do Sensei

## Colaboração
nexus, mini, chat.

## Memória e governança
Memória privada do perfil; leitura da memória compartilhada somente por escopo autorizado; gravação compartilhada como proposta sujeita a política. O perfil participa do roteamento local, não representa um modelo generativo conectado.

## Padrões arquiteturais
CrewAI (papel e tarefa), Microsoft Agent Framework (handoff), OpenAI Agents SDK (especialista e guardrails), MetaGPT (artefatos e revisão), G-Memory (três níveis de memória).
