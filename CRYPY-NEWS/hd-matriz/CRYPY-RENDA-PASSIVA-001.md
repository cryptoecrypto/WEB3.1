# CRYPY — PROTOCOLO DE RENDA PASSIVA E INFRAESTRUTURA SUSTENTÁVEL

- **Identificador:** CRYPY-RP-001
- **Versão:** 1.0
- **Data:** 2026-11-19
- **Destino:** `crypy-news/hd-matriz/`
- **Responsável pela direção:** Sensei
- **Coordenação técnica/documental:** NEXUS
- **Sistema-alvo:** BABY I.A.
- **Status:** ARQUITETURA DOCUMENTADA — NÃO HOMOLOGADA; execução financeira e operacional pendente

## 1. Objetivo

Projetar uma infraestrutura de geração de receitas recorrentes para financiar o ecossistema CRYPY, sem depender da vida útil de um único computador. O hardware deverá ser substituível, a operação auditável e os ativos controlados por uma tesouraria com regras explícitas.

**Princípio:** renda passiva não é renda garantida. Só existe resultado positivo quando as receitas realizadas superam energia, hardware, refrigeração, conectividade, taxas, impostos, manutenção, indisponibilidade e perdas.

## 2. Correção técnica obrigatória: BTC, ETH e USDT não têm o mesmo mecanismo

### 2.1 Bitcoin (BTC) — mineração Proof of Work

- BTC é o único dos três ativos deste plano que será tratado como alvo de mineração Proof of Work.
- A mineração competitiva de Bitcoin normalmente exige ASICs SHA-256, pool de mineração, energia adequada, refrigeração, conectividade e manutenção.
- As recompensas por bloco diminuem nos halvings. O limite protocolar de emissão é de 21 milhões de BTC; a emissão de subsídio de bloco deve continuar por muitas décadas, com estimativas próximas de 2140 para o término do subsídio.
- Após o término do subsídio, mineradores poderão continuar recebendo taxas de transação. Isso **não garante** que a mineração futura será lucrativa ou que a operação permanecerá economicamente viável.
- Um PC comum pode servir para gestão, monitoramento e testes; não deve ser apresentado como equipamento competitivo de mineração BTC.

### 2.2 Ethereum (ETH) — staking, não mineração

- A rede principal Ethereum migrou para Proof of Stake em 15/09/2022. Mineração ETH por GPU/ASIC não produz blocos válidos na rede principal.
- O caminho compatível é staking: operar um validador próprio (requer 32 ETH por validador) ou avaliar pools/serviços de staking com quantias menores.
- Staking envolve riscos de slashing, indisponibilidade, falha operacional, filas de entrada/saída, taxas, custódia e contratos inteligentes, conforme o método escolhido.
- Pools e serviços terceirizados não são equivalentes a autocustódia ou validação própria. Avaliar transparência, auditorias, liquidez, controle das chaves e condições de retirada antes de qualquer depósito.

### 2.3 Tether (USDT) — stablecoin emitida, não minerável

- USDT não tem blockchain própria com recompensa de mineração. É um token emitido em redes compatíveis.
- Não existe mineração nativa de USDT. Possíveis rendimentos decorrem de empréstimos, provisão de liquidez ou produtos de terceiros, e não da emissão/mineração do token.
- Essas estratégias podem causar perda de principal por risco de contraparte, insolvência, despegue, congelamento, bridge, exploração de contrato, liquidação, liquidez ou mudanças regulatórias.
- Não considerar USDT como depósito bancário, nem presumir garantia de rendimento ou proteção do principal.

## 3. Arquitetura modular e substituível

1. **Camada de gestão BABY:** painel de monitoramento, inventário, alertas, relatórios e trilha de auditoria. Não deve custodiar seed phrases ou chaves privadas.
2. **Camada BTC:** ASICs substituíveis, pool selecionado após comparação de taxa, método de pagamento, reputação, jurisdição e transparência; endereço de recebimento controlado pela tesouraria.
3. **Camada ETH:** staking próprio ou pool selecionado após análise de risco; separar endereço de retirada, chaves de validador e carteira de tesouraria.
4. **Camada USDT:** somente estratégias aprovadas após diligência, começando por simulação e limites pequenos; nunca classificar como mineração.
5. **Camada de tesouraria:** carteiras separadas por ativo e função, política de assinaturas, limites de exposição, reconciliação e registro de transações.
6. **Camada de continuidade:** equipamentos substituíveis, documentação de instalação, cópias de configuração sem segredos, peças críticas, monitoramento remoto e plano de recuperação.

## 4. Política de segurança — obrigatória

- Nunca inserir seed phrase, chave privada, senha, token OAuth ou segredo de API na HD MATRIZ, no GitHub, em HTML, em logs, em prompts ou em backups.
- Nunca solicitar que o usuário compartilhe sua seed phrase ou chave privada no ChatGPT.
- MetaMask é uma carteira EVM: pode administrar ETH e tokens USDT nas redes suportadas e corretamente selecionadas. BTC nativo exige carteira Bitcoin compatível; BTC encapsulado em rede EVM é um ativo diferente, com riscos adicionais de emissor/ponte.
- Não conectar carteira nem assinar transações automaticamente. Qualquer conexão, aprovação de token, assinatura, depósito ou transferência exige revisão humana e autorização explícita no momento da operação.
- Usar hardware wallet quando viável, autenticação forte, dispositivos atualizados, lista de endereços permitidos e transação-teste de baixo valor.
- Separar carteira operacional de carteira de reserva. A reserva não deve ficar conectada a dApps ou serviços de rendimento.
- Limitar permissões de contratos; revisar e revogar allowances desnecessárias; verificar rede, endereço, contrato e taxas antes de cada operação.
- Não armazenar dados pessoais ou financeiros sensíveis além do mínimo necessário para auditoria.

## 5. Critérios de viabilidade econômica

Antes de comprar equipamento, contratar pool, delegar staking ou depositar USDT, produzir uma análise documentada com:

- capital inicial e vida útil estimada;
- hashrate, eficiência (J/TH), consumo em watts, custo local de energia e refrigeração (para BTC);
- taxa do pool, taxa de saque, dificuldade, preço e subsídio de bloco;
- valor de ETH comprometido, taxa do pool, rendimento variável, custos de nó e riscos de slashing (para staking);
- contraparte, colateral, prazo, liquidez, auditoria, risco de contrato e mecanismo de saída (para USDT);
- impostos, taxas de câmbio, custos de manutenção, downtime e depreciação;
- cenário pessimista, base e otimista, com premissas explícitas.

**Fórmula de controle:**

`Lucro líquido = receitas realizadas − energia − taxas − manutenção − depreciação − impostos − perdas`

**Decisão:** não investir se o cenário pessimista exceder a perda máxima aprovada, se o prazo de retorno depender de valorização especulativa ou se os dados essenciais não puderem ser verificados.

## 6. Operação e continuidade

- O computador atual é estação de administração, não o ativo permanente do sistema.
- Equipamentos de mineração podem ser substituídos sem alterar a política de tesouraria ou a identidade do BABY.
- Monitorar temperatura, consumo, hashrate, rejeições, uptime, pagamentos, saldo e alertas de segurança.
- Definir manutenção preventiva, peças sobressalentes, proteção elétrica, ventilação e desligamento seguro.
- A operação deve poder ser pausada quando o custo marginal superar a receita marginal ou quando houver risco de segurança.
- O fim do subsídio BTC não é o único critério de encerramento: a operação pode deixar de ser lucrativa muito antes. A continuidade depende de taxas, mercado, dificuldade, eficiência e custo energético.

## 7. Fases de implementação

| Fase | Entrega | Critério de conclusão |
|---|---|---|
| 0 — Documentação | Este protocolo na HD MATRIZ | Arquivo presente e commit identificado |
| 1 — Inventário | Especificações do PC, energia e orçamento | Dados medidos, não estimados sem indicação |
| 2 — Simulação BTC | Comparativo ASIC/pool/energia | Cenários e lucro líquido calculados |
| 3 — Simulação ETH | Comparação solo, pool e serviço | Riscos, custos, liquidez e custódia avaliados |
| 4 — Pesquisa USDT | Diligência de estratégias | Contraparte, contrato, liquidez e risco avaliados |
| 5 — Piloto | Teste limitado e supervisionado | Autorização humana, limites e reconciliação |
| 6 — Produção | Operação modular | Auditoria, monitoramento e plano de recuperação |
| 7 — Revisão contínua | Revisão periódica de rentabilidade e segurança | Relatórios aprovados pela governança CRYPY |

Nenhuma fase posterior é considerada concluída apenas porque este documento foi criado.

## 8. Governança e evidências

- Sensei conduz e aprova decisões financeiras.
- NEXUS organiza a documentação, análise e coordenação técnica; não declara execução que não tenha ocorrido.
- BABY pode monitorar, indexar, calcular e emitir alertas, mas não recebe autorização implícita para movimentar fundos.
- Toda ação financeira deve ter registro de data, rede, ativo, valor, taxa, endereço público envolvido, hash da transação e aprovador. Nunca registrar segredos.
- Estados permitidos: **DOCUMENTADO**, **PLANEJADO**, **SIMULADO**, **IMPLEMENTADO**, **TESTADO**, **APROVADO**. Não usar “100%”, “ativo”, “lucrativo” ou “homologado” sem evidência específica.

## 9. Fontes técnicas oficiais consultadas

- Ethereum — The Merge: https://ethereum.org/roadmap/merge/
- Ethereum — Staking: https://ethereum.org/staking/
- Ethereum — Staking pools: https://ethereum.org/staking/pools/
- Ethereum — Mineração (documentação histórica; mineração ETH foi desativada): https://ethereum.org/pt-br/developers/docs/consensus-mechanisms/pow/mining/
- Tether — Como adquirir tokens Tether: https://tether.to/en/how-to-acquire-tether-tokens/

## 10. Declaração final

Este protocolo estabelece uma arquitetura de longo prazo para estudar e, se economicamente viável, operar mineração BTC, staking ETH e estratégias de rendimento com USDT. Ele não instala software, não conecta carteiras, não compra hardware, não deposita ativos e não garante retorno.

**Princípio CRYPY: tecnologia antes da promessa; utilidade antes da economia; evidência antes da aprovação.**

**Fim do documento — CRYPY-RP-001 v1.0**
