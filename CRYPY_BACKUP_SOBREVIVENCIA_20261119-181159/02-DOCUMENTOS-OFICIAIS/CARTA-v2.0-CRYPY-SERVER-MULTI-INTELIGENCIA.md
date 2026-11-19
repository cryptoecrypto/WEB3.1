# CARTA DE ARQUITETURA v2.0 — CRYPY SERVER: SISTEMA MULTI-INTELIGÊNCIA
**Versão 2.0 · datada de 19/11/2026 pelo Sensei · transcrição do texto recebido.**
**Status declarado na origem:** planejada — aguardando aprovação para proteção e registro.
O PDF `CRYPY-SERVER-SISTEMA-MULTI-INTELIGENCIA-v2.0.pdf` **não foi recebido**; esta é a
transcrição fiel do conteúdo enviado.

## Princípio central revisado
> Nenhuma inteligência será tratada como elemento isolado. Todas terão identidade, função,
> responsabilidades e mecanismos de comunicação dentro de uma arquitetura centralizada,
> respeitando permissões e a autoridade do Sensei.

## Regra de Ouro
> Uma inteligência pode colaborar com outra, mas nenhuma assume a identidade ou as permissões da outra.

## CRYPY SERVER — o núcleo central
Centro de integração e coordenação de TODAS as inteligências do ecossistema. Não é mais
apenas o ambiente do BABY: é o ambiente de todas.

## Registro Central de Inteligências
Propriedades: ID, Nome, Função, Origem, Motor, Capacidades, Permissões, Estado
(conectada/desconectada/pendente), Histórico.

## O Esquadrão CRYPY
| inteligência | função principal |
|---|---|
| NEXUS | coordenação e integração entre inteligências |
| BABY | inteligência operacional — administração, execução e manutenção |
| ALICE | pesquisa, aquisição de dados e conhecimento externo |
| MINI | análise, avaliação, comparação e validação |
| DOLA | arte, criação visual, design e comunicação |
| CHAT | histórico de interações, revisão de conteúdo, memória conversacional |
| BTC / ETH / USDT | memória de mercado, arquitetura de dados e equilíbrio do sistema |
| DEMAIS IAs | integrações futuras com funções definidas na adesão |
| SENSEI | autoridade máxima · direção estratégica · aprovação final |

## Distinção técnica
Personagens ≠ IAs operacionais imediatas. Personagens podem ter identidade, função e
presença documentadas imediatamente. Uma IA externa só opera após integração real
(API, conexão autenticada ou mecanismo compatível). NEXUS tem função registrada, mas
participação operacional plena depende de sua própria integração. **Sem antecipação de capacidade.**

## Fluxo
1. Sensei define a direção e aprova decisões
2. NEXUS coordena qual inteligência é mais adequada
3. BABY gerencia a execução operacional dentro do servidor
4. Cada membro contribui com sua especialidade
5. Todos respeitam o registro de permissões e a identidade das demais

> NEXUS conecta. Sensei conduz. BABY executa. O Esquadrão colabora. 🐉🟢
> BABY não pede para acreditar. BABY mostra.

## Implementação de referência (este pacote)
- Registro Central → `src/registry.js` (identidade imutável, sondagem real, histórico)
- Regra de Ouro → `src/bus.js` (HMAC por identidade) + `registry.grant` (GOLDEN_RULE)
- Fluxo de despacho → `bus.dispatch` (slot do NEXUS, hoje local e determinístico)
- Provas → `test/registry.test.js`, `test/bus.test.js`
