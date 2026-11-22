# AUDITORIA-GRAFICOS-CRYPY-001
Versão: 0.1 — auditoria preliminar de código
Data: 21/11/2026
Repositório: cryptoecrypto/WEB3.1
Branch de trabalho: modo-real-baby-2026-11-21
Status: PARCIAL — inventário legado pendente; não homologado.

## Escopo
Identificar componentes de mercado/gráficos no código acessível, avaliar interatividade e sincronização de dados, sem apagar nem substituir os gráficos existentes.

## Inventário comprovado no código consultado

| Item | Arquivo / localização | Tipo | Interatividade | Sincronização |
|---|---|---|---|---|
| CryptoBubbles CRYPY | assets/js/crypy-market-bubbles.js | Visualização de bolhas de mercado | Sim: cada bolha é botão e abre detalhes do ativo | Escuta o evento `crypy:market-updated` e lê o cache `crypy.live-market.v1`; também mantém consulta própria à CoinGecko |
| Quadro de preços | assets/js/crypy-live-market.js | Tabela de cotações, não é gráfico | Atualização manual e automática; linhas não são controles de gráfico | Consulta CoinGecko a cada 60s, grava cache e dispara `crypy:market-updated` |
| Motor BABY 3D | assets/js/baby-graphics-engine.js | Cena 3D em canvas | Sim: arrastar/girar e zoom | Não é gráfico financeiro; não entra na contagem de gráficos de mercado |
| Canvas Matrix | index-home-anterior-a-home-aprovada-2026-11-20.html | Efeito visual de fundo | Não é gráfico financeiro | Não entra na contagem de gráficos de mercado |

## Quantidade: o que é possível afirmar
- 1 visualização de mercado identificada no código: CryptoBubbles.
- 1 painel de cotações identificado, mas é tabela e não gráfico: Quadro de Preços.
- Há referência anterior a três gráficos legados (BTC, ETH e USDT) na HOME, mas seus elementos/arquivos não foram localizados nem confirmados no código atualmente acessível nesta auditoria. Portanto, não entram ainda na contagem confirmada.
- Total confirmado nesta varredura: 1 gráfico/visualização de mercado; 1 tabela de preços separada.
- Total legado: pendente de localização. Não declarar sincronização geral concluída.

## Verificações técnicas
1. `crypy-live-market.js` consulta seis ativos: BTC, ETH, USDT, BNB, SHIB e ICP; atualiza automaticamente e emite `crypy:market-updated`.
2. `crypy-market-bubbles.js` contém bolhas clicáveis com detalhes e escuta o evento compartilhado. A versão da branch de trabalho restringe a consulta/renderização às seis moedas oficiais, na ordem BTC, ETH, USDT, BNB, ICP e SHIBA INU; também filtra o cache antigo.
3. `crypy-global-nav.js` carrega os scripts de mercado somente quando o caminho atual corresponde à raiz da HOME ou ao index.html.
4. O arquivo raiz `index.html` retornou conteúdo vazio (0 bytes) na leitura do repositório. A HOME pública observada pelo usuário ainda precisa ser ligada ao arquivo-fonte correto antes de se afirmar qual HTML contém os gráficos legados.
5. A busca por implementações comuns (Chart.js, TradingView, Lightweight Charts, ApexCharts, Plotly e identificadores de chart) não encontrou outra biblioteca/implementação de gráfico financeiro. A busca de código não é prova de ausência absoluta; embeds, imagens ou código dinâmico podem não ser indexados.

## Falhas e riscos identificados
- A tabela e o CryptoBubbles compartilham preços por evento/cache, mas a bolha ainda obtém dados de capitalização e outros campos via endpoint próprio CoinGecko. Isso é sincronização parcial de dados, não um barramento único completo.
- Os gráficos legados BTC/ETH/USDT ainda não foram encontrados; não há evidência de que escutem `crypy:market-updated`.
- O endpoint de histórico OHLC/velas não foi identificado nesta varredura. Não se deve desenhar histórico sintético nem preencher pontos ausentes com valores inventados.
- Testes no navegador real, mobile, carregamento da HOME pública, limites/rate limit da CoinGecko e consistência visual ainda não foram executados.

## Plano seguro para concluir
1. Localizar o HTML exato atualmente publicado para a HOME e os três gráficos antigos.
2. Inventariar cada gráfico pelo arquivo, ID/selector, ativo, fonte, intervalo, cache, atualização e interações.
3. Implementar um único fluxo de cotação e eventos para todos os gráficos, preservando os adaptadores e a aparência dos legados.
4. Para gráficos históricos, usar endpoint de série temporal real com intervalos e timestamps explícitos; não confundir preço spot com histórico.
5. Testar cada gráfico isoladamente e em conjunto; validar que uma atualização é refletida em todos, que cache offline é marcado como antigo e que falhas de API não apagam dados válidos.
6. Só depois de evidência de teste declarar sincronização completa.

## Limites desta auditoria
Nenhum arquivo de HD-MATRIZ foi alterado. Nenhum deploy foi executado. A branch main não foi alterada. Este relatório é preliminar e não representa homologação.
