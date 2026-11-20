# BABY I.A. — INTELIGÊNCIA HÍBRIDA CRYPY
**Documento:** BABY-INTELIGENCIA-001  
**Versão:** 1.0 — proposta técnica inicial  
**Estado:** DOCUMENTADO / NÃO HOMOLOGADO  
**Princípio:** NEXUS conecta; Sensei conduz.

## 1. Objetivo

Ensinar o BABY a compreender três famílias de assistentes de IA — Google Gemini, Anthropic Claude e OpenAI GPT — e usar os padrões de capacidade observáveis para projetar uma arquitetura própria do ecossistema CRYPY.

“Criar sua própria tecnologia” significa construir uma arquitetura de software própria: identidade, memória, roteamento, ferramentas, avaliação, governança e interface. Não significa copiar pesos, código privado, dados de treinamento ou propriedade intelectual dos fornecedores, nem fundir diretamente os modelos.

## 2. Três referências tecnológicas

Os nomes e versões comerciais mudam. O BABY deve tratar cada provedor como um adaptador substituível, consultar a documentação oficial antes de integrar e nunca presumir que um modelo, endpoint ou recurso esteja disponível.

### 2.1 Google Gemini — referência para multimodalidade e contexto
Estudar:
- Interpretação de texto, imagens, áudio e outros formatos quando suportados pelo modelo contratado.
- Contexto amplo e síntese de documentos.
- Uso de ferramentas e respostas estruturadas, quando oferecidos pela API.
- Limites de contexto, segurança, custo, latência e tratamento de dados.

Exercício BABY: receber um conjunto de páginas autorizadas do WEB3.1, resumir cada uma, identificar entidades e apontar as fontes utilizadas.

### 2.2 Anthropic Claude — referência para tarefas longas e engenharia
Estudar:
- Planejamento em etapas e decomposição de tarefas.
- Leitura, revisão e explicação de código.
- Análise de documentos extensos e consistência entre requisitos.
- Uso seguro de ferramentas, validação e limites de execução.

Exercício BABY: propor uma alteração isolada, listar arquivos afetados, riscos, testes e plano de reversão; não executar mudanças sem autorização.

### 2.3 OpenAI GPT — referência para raciocínio e orquestração de ferramentas
Estudar:
- Resolução de problemas e geração estruturada.
- Chamada de ferramentas e fluxos de múltiplas etapas.
- Transformação de objetivos em tarefas verificáveis.
- Avaliação de respostas, incerteza e comunicação de limitações.

Exercício BABY: receber uma solicitação, classificá-la, selecionar a ferramenta autorizada, executar somente o escopo aprovado e produzir um relatório de evidências.

**Regra de honestidade:** estas são áreas de estudo e comparação, não afirmações de que uma família sempre vence ou de que uma versão específica possui determinado recurso. BABY deve verificar documentação e disponibilidade atuais antes de qualquer integração.

## 3. Arquitetura própria — BABY CRYPY

### Núcleo A — Identidade e Constituição
Mantém nome, missão, princípios, limites, versão e instruções oficiais do BABY. A identidade não deve depender do provedor de modelo.

### Núcleo B — Memória CRYPY
Recebe conteúdo autorizado do WEB3.1 e, em etapa posterior, fontes autorizadas da HD MATRIZ. Mantém:
- inventário de fontes e estado da indexação;
- texto extraído, metadados, URL/caminho e data de captura;
- índice pesquisável e referências de origem;
- versão, hash, histórico e estado de validação;
- distinção entre conteúdo confirmado, hipótese e informação desatualizada.

Não declarar “aprendeu tudo” só porque uma varredura terminou. Informar páginas encontradas, páginas lidas, páginas ignoradas, falhas e data da última indexação.

### Núcleo C — Orquestrador de modelos
Define uma interface comum para adaptadores independentes:
- GeminiAdapter
- ClaudeAdapter
- GPTAdapter
- LocalAdapter (somente se um modelo local for instalado e testado)

O orquestrador escolhe um adaptador conforme tarefa, disponibilidade, custo, privacidade e qualidade medida. Se nenhum estiver configurado, informa indisponibilidade e usa apenas a busca local da memória, sem fingir que chamou um modelo.

### Núcleo D — Ferramentas e capacidades
Cada ferramenta declara nome, finalidade, permissões, entradas, saídas, riscos e testes. Ferramentas começam em modo somente leitura. Escrita, publicação, envio, exclusão, movimentação de arquivos e ações externas exigem autorização explícita do Sensei.

### Núcleo E — Aprendizado supervisionado e avaliação
BABY pode incorporar conhecimento à memória por indexação e curadoria; isso não altera automaticamente os pesos do modelo. Cada nova entrada deve ter fonte, data, deduplicação e possibilidade de revisão. Feedback não deve ser tratado como verdade sem validação.

### Núcleo F — Segurança e auditoria
- Segredos somente no servidor, em variáveis de ambiente ou cofre apropriado.
- Nunca inserir chaves de API no HTML, JavaScript público ou Git.
- Autenticar todas as rotas privadas, não apenas a tela de desbloqueio.
- Aplicar HTTPS, limites de uso, validação de origem, sessões seguras e registros sem segredos.
- Falha fechada: backend ou autenticação indisponível significa acesso negado.
- Registrar ação solicitada, autorização, ferramenta, resultado e evidência.

## 4. Fluxo de uma solicitação

1. Receber a pergunta.
2. Identificar intenção, risco e permissões necessárias.
3. Consultar a memória CRYPY e recuperar trechos com fontes.
4. Decidir se a busca local basta ou se um modelo externo autorizado é necessário.
5. Selecionar adaptador por política; não escolher por propaganda ou nome.
6. Enviar somente os dados necessários, respeitando privacidade e consentimento.
7. Validar a resposta contra fontes, requisitos e testes.
8. Apresentar resposta, fontes, incertezas e ações realizadas.
9. Solicitar autorização antes de qualquer ação de escrita ou publicação.
10. Registrar resultado e feedback para revisão.

## 5. Como comparar os três modelos

Executar o mesmo conjunto de testes com as mesmas entradas e critérios. Registrar modelo/versão, data, parâmetros relevantes, custo, latência e resultado. Critérios:
- precisão factual e qualidade das fontes;
- raciocínio e cumprimento de instruções;
- qualidade de código e testes;
- compreensão de documentos e multimodalidade;
- segurança e resistência a instruções maliciosas;
- custo, latência e disponibilidade;
- privacidade e condições de uso.

Não criar um ranking universal. O melhor adaptador depende da tarefa e das medições reproduzíveis.

## 6. Fases de implementação

**Fase 0 — Documentação:** este documento define a arquitetura e o currículo.  
**Fase 1 — Memória:** auditar e testar a indexação do site; medir cobertura real.  
**Fase 2 — Adaptadores:** implementar um provedor por vez, com chaves apenas no servidor.  
**Fase 3 — Orquestração:** roteamento, fallback, limites, logs e avaliação.  
**Fase 4 — Ferramentas:** habilitar capacidades gradualmente, começando por leitura.  
**Fase 5 — Homologação:** testes funcionais, segurança, recuperação, auditoria e aprovação do Sensei.

## 7. Critérios mínimos para declarar funcionamento

- Cada adaptador passa testes próprios e informa claramente quando está indisponível.
- A memória retorna trechos relevantes com origem verificável.
- O sistema não inventa que consultou um modelo ou fonte.
- Ações de escrita exigem autorização e deixam trilha de auditoria.
- Segredos não aparecem no repositório nem no cliente.
- Há testes de falha, indisponibilidade, autenticação e recuperação.
- Relatório de cobertura distingue páginas descobertas, indexadas, ignoradas e com erro.

## 8. Estado real neste commit

Este arquivo é uma especificação e material de estudo. Ele não instala modelos, não cria contas ou chaves de API, não treina um modelo neural, não executa indexação, não conecta provedores e não comprova que o chatbot já utiliza os três. A integração operacional depende de backend seguro, credenciais válidas, implementação dos adaptadores e testes.

**Estado oficial: DOCUMENTADO — IMPLEMENTAÇÃO PENDENTE — NÃO HOMOLOGADO.**
