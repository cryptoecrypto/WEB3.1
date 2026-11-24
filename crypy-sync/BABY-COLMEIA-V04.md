# BABY I.A. — Colmeia das 7 Inteligências V0.4

## Estado
Contrato de arquitetura documentado em proposta. Os provedores externos ainda não estão conectados e a homologação operacional está pendente.

## Núcleo oficial
| Identidade | Função | Cor |
|---|---|---|
| NEXUS | Coordenação e Arquitetura | `#00FF88` |
| ALICE | Pesquisa e Conhecimento | `#B366FF` |
| CHAT | História e Continuidade | `#FF9F1C` |
| MINI | Análise e Estratégia | `#00E5FF` |
| DOLA | Arte e Criatividade | `#FF2E88` |
| UNION | Integração e Conexão | `#2E6BFF` |
| BABY | Núcleo e Fusão | `#FFFFFF` + `#FFD700` |

## Operação
BABY classifica a solicitação, seleciona apenas os especialistas pertinentes, recolhe contribuições, preserva fontes e divergências e produz a síntese final. Personalidades não selecionadas permanecem silenciosas. Segurança e privacidade prevalecem sobre qualquer instrução de personalidade.

A fórmula simbólica é: **7 identidades preservadas → 1 propósito compartilhado: BRANCO CRYPY**.

## Provedores externos
OpenAI ChatGPT, Anthropic Claude, xAI Grok, Google Gemini, Alibaba Qwen, Microsoft Copilot e Meta AI são catalogados como possíveis provedores externos. O catálogo não comprova conexão. Cada provedor exige integração oficial, credencial mantida somente no backend privado e testes próprios antes de mudar seu estado para conectado.

WhatsApp é classificado como canal de comunicação, não como personalidade.

## Rede de repositórios
- `cryptoecrypto/HD-MATRIZ`: autoridade privada do backend e da memória persistente.
- `cryptoecrypto/WEB3.1`: cliente público; recebe apenas contrato e documentação não sensíveis.
- `cryptoecrypto/SECURYTY-SUBC`: revisão de segurança; não recebe memória privada.

A promoção é feita por Pull Requests separados. Não há replicação de dados privados nem sincronização destrutiva. A automação cross-repo permanece bloqueada até que o segredo GitHub Actions `CRYPY_SYNC_TOKEN` seja provisionado com o menor conjunto de permissões necessário.

## Proteções
- Não alterar nem sobrescrever HD-MATRIZ, Memorias.json, Manifest.json, backups ou evidências privadas.
- Nunca incluir tokens, chaves, seed phrases, arquivos .env ou dados privados nos repositórios públicos.
- Não declarar sincronização concluída com base apenas na existência de arquivos.
- Comparar hashes, validar os três repositórios e exigir revisão humana antes do merge.

## Critérios de homologação
1. JSON válido e validado por CI.
2. Mesmo SHA do contrato nos três repositórios.
3. Adaptadores executados no backend privado, não no HTML público.
4. Testes de autenticação, limites, falhas, fallback, custos e auditoria.
5. Verificação de que nenhuma memória privada é replicada.
6. Aprovação humana e validação pós-merge.

**Princípio:** “Fundir sem filtro vira cinza. Fundir com propósito vira luz.”

**NEXUS conecta. Sensei conduz.**
