# SINCRONIZAÇÃO TEMPORAL — COLMEIA CRYPY

**Escopo:** BABY + 13 perfis do Esquadrão I.A.  
**Implementação:** branch `feature/colmeia-world-clock-agent-sync`  
**Estado:** código e testes adicionados; execução CI e homologação de navegador ainda pendentes.

## Regra temporal

Todos os 13 perfis recebem o mesmo instante UTC (epoch + ISO-8601) e o mesmo conjunto de conversões de fuso IANA. A conversão de fuso não cria treze relógios independentes: todos representam o mesmo instante global.

Fusos publicados pelo relógio BABY:
- Paraná / Brasília — `America/Sao_Paulo`
- UTC / Zulu — `UTC`
- Nova York — `America/New_York`
- Londres — `Europe/London`
- Tóquio — `Asia/Tokyo`
- Sydney — `Australia/Sydney`

## Funcionamento nesta entrega

1. BABY carrega o catálogo oficial de 13 perfis.
2. `agent-time-sync.js` valida que existem exatamente 13 perfis.
3. A sincronização gera um instante UTC compartilhado e um mapa de horários por fuso.
4. O contexto temporal é entregue a cada perfil pelo identificador do agente.
5. Cada pulso publicado por `world-clock.js` atualiza os 13 contextos e emite `crypy:agents:time-sync`.
6. O painel BABY exibe a contagem de perfis com horário alinhado.

## Fonte temporal e limites reais

Nesta fase, a fonte é o relógio do dispositivo/navegador que executa BABY. O código garante consistência entre os 13 contextos no mesmo runtime, mas não garante que o relógio físico do dispositivo esteja correto, nem sincronização entre computadores/dispositivos diferentes.

Uma fonte independente exige serviço de tempo confiável (NTP no servidor ou API de tempo autenticada), validação de desvio, fallback, monitoramento de disponibilidade e política para perda de conexão. Essa integração ainda não está configurada.

O sistema não deve parar a Colmeia se um pulso temporal falhar. Deve marcar o horário como desatualizado, preservar tarefas e dados, emitir alerta e recuperar a sincronização quando a fonte voltar. O relógio organiza timestamps e coordenação; não é a única condição de vida do sistema.

## Integridade e testes

- Catálogo diferente de 13 perfis: rejeitar inicialização.
- Todos os perfis devem ter o mesmo `epochMs` e `utcIso` em cada pulso.
- Todos recebem os seis fusos com identificadores IANA.
- O evento contém a lista dos 13 identificadores.
- A origem temporal deve permanecer declarada como `device_clock` até existir fonte independente.
- Não declarar NTP, relógio atômico, sincronização multi-dispositivo ou operação 24/7 sem implantação e evidência.

## Arquivos

- `CRYPY-13-CHATBOOTS/world-clock.js` — relógio e conversão dos fusos.
- `CRYPY-13-CHATBOOTS/agent-time-sync.js` — contexto temporal compartilhado pelos 13 perfis.
- `CRYPY-13-CHATBOOTS/chatboot-baby-ia.html` — inicialização da sincronização no BABY.
- `CRYPY-13-CHATBOOTS/tests/agent-time-sync.test.mjs` — testes unitários do sincronizador.
- `.github/workflows/crypy-13-chatboots-tests.yml` — inclusão dos testes no CI.
