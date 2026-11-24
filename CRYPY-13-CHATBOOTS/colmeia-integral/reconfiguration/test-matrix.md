# Matriz de testes — reconfiguração geral CRYPY

| ID | Teste | Critério de aprovação | Estado |
|---|---|---|---|
| C01 | Contagem do registro | 13 oficiais + BABY + LUCY = 15 | Validável pelo contrato |
| C02 | IDs únicos | Nenhum ID repetido; BABY/LUCY fora dos oficiais | Validável pelo contrato |
| C03 | Migração de roster | 8 perfis oficiais preservados + CRYPY COIN com alias controlado + 4 perfis novos | Planejado |
| C04 | Perfis completos | 13 arquivos presentes, JSON válido, profile.id correto | Bloqueado: 4 perfis ausentes |
| C05 | BABY separado | Núcleo fora do array oficial, sem perder orquestração | Pendente de implementação |
| C06 | Legado BTC/ETH/USDT | Perfis preservados; não roteados como oficiais | Pendente de implementação |
| C07 | Alias CRYPY COIN | Compatibilidade crypycoin ↔ crypy-coin sem regressão | Pendente de inventário/teste |
| C08 | LUCY independente | Runtime, credenciais, logs e memória próprios; sem controle do BABY | Pendente; não encontrada no snapshot |
| C09 | Runtime dos modelos | 13 chamadas autenticadas bem-sucedidas, uma por identidade | Pendente; sem chamadas reais |
| C10 | Memória | Acesso escopado; HD-MATRIZ sem escrita; auditoria verificável | Pendente |
| C11 | Segurança | Negações, isolamento, segredos e aprovação humana testados | Pendente |
| C12 | Resiliência | timeout, retry, deduplicação, reinício, recuperação e rollback | Pendente |
| C13 | Regressão backend | `npm test` passa com o novo contrato | Não executado |
| C14 | Smoke de 13 | 13 respostas reais verificadas; sem contar simulações | Não executado |
| C15 | Produção | Sem deploy nesta fase | Preservado por escopo |

## Portões de avanço

1. Não iniciar runtime enquanto C01–C08 não estiverem implementados e revisados.
2. Não declarar agentes conectados antes de C09, com evidência individual.
3. Não liberar memória compartilhada antes de C10 e C11.
4. Não homologar antes de C12–C15 e aprovação formal do Sensei.
