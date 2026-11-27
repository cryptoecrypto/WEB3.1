# Validação — CRYPY Calendar Infinity

## Verificações estáticas
- [ ] Abrir `index.html` por servidor HTTP estático.
- [ ] Confirmar carregamento dos três scripts e da folha CSS.
- [ ] Confirmar resposta da API `git/trees/main?recursive=1`.
- [ ] Confirmar que caminhos `hd-oculto`, `hd-matriz`, backups e segredos não aparecem no inventário.
- [ ] Confirmar contador de imagens e aviso quando `truncated=true`.
- [ ] Confirmar duas faixas, miniaturas com recorte uniforme e sentidos opostos.
- [ ] Confirmar pausa, retomada e seleção de velocidade.
- [ ] Confirmar navegação de mês, seleção de dia e salvamento local de memória.

## Testes visuais
- [ ] Desktop: 1280 px ou mais.
- [ ] Tablet: 768 px.
- [ ] Celular: 360–390 px.
- [ ] Preferência de movimento reduzido.
- [ ] Falha da API ou imagem indisponível.

## Limites conhecidos
- Não há sincronização cloud das memórias.
- A API do GitHub pode truncar árvores muito grandes ou limitar requisições.
- Arquivos listados podem ser imagens de interface/ícones, não necessariamente fotografias.
- A publicação no GitHub Pages depende de merge e deploy; este commit isolado não publica em produção.
