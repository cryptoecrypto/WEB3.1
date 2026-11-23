# Arquitetura unificada — CRYPY 13 ChatBoots

**Versão:** 1.0.0  
**Estado:** configuração e roteamento local implementados; modelos generativos e backend independente ainda não conectados.

## Hierarquia
- **Sensei:** autoridade humana e aprovação.
- **BABY:** núcleo que recebe, classifica, distribui e consolida.
- **NEXUS:** coordenação técnica, arquitetura e auditoria.
- **13 ChatBoots:** especialistas com perfis, gatilhos, limites e memória isolada.

## Como as cinco referências entram na Colmeia
1. **CrewAI:** cada perfil define papel, missão, responsabilidades, colaboradores e escopo de memória.
2. **Microsoft AutoGen / Agent Framework:** comunicação por mensagens estruturadas e handoffs explícitos, sem broadcast irrestrito.
3. **OpenAI Agents SDK:** BABY atua como orquestrador; especialistas recebem tarefas delimitadas; guardrails e trilha de execução são requisitos.
4. **MetaGPT:** trabalho organizado em artefatos e etapas: classificar → especificar → planejar → produzir → revisar → consolidar.
5. **G-Memory:** memória organizada em insights, consultas/contexto e trajetórias de colaboração.

## Ciclo de uma solicitação
1. BABY recebe a solicitação e cria um identificador de tarefa.
2. O roteador sugere um especialista principal e até três colaboradores.
3. Cada handoff futuro deve carregar objetivo, contexto mínimo, fontes, sensibilidade e resultado esperado.
4. NEXUS revisa arquitetura, segurança e evidências quando aplicável.
5. BABY consolida e devolve a resposta ao Sensei.
6. Ações externas, destrutivas, financeiras ou gravações permanentes exigem política e aprovação humana.

## Os 13 perfis
Os perfis individuais estão em `chatboots/*/profile.json` e no catálogo `config/agents.json`. BNB, SHIBA INU, CRYPYCOIN e ICP permanecem marcados como propostas pendentes de confirmação final de personalidade.

## Limites atuais
- O roteador é determinístico e baseado em palavras-chave.
- Não há 13 LLMs, conversas autônomas entre modelos ou execução paralela ativa.
- Não há API de provedor, credenciais, backend independente ou sincronização de nuvem configurados nesta entrega.
- A sincronização com BABY consiste em carregar o catálogo, sugerir especialistas e incluir os arquivos de arquitetura no indexador local.
- O indexador local continua sendo recuperação textual no navegador; não é treinamento de modelo.
- HD-MATRIZ e páginas originais não são alteradas por esta arquitetura.

## Próximas etapas técnicas
1. Confirmar os quatro papéis ainda propostos.
2. Provisionar backend independente e armazenamento persistente.
3. Conectar um provedor de modelo por adaptador seguro no backend.
4. Implementar mensageria, sessões, autorização, memória por escopo e auditoria.
5. Executar testes de segurança, integração, recuperação e qualidade antes de homologar.
