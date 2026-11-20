# CRYPYKUT — nove áreas sociais + SHOTS

**Versão:** restauração visual e funcional local | **Data:** 20/11/2026

## Mapa das páginas
1. `comunidade.html` — Início / mural principal.
2. `perfil.html` — perfil, identidade e preferências.
3. `amigos.html` — busca e organização de conexões.
4. `comunidades.html` — grupos por interesse e criação de rascunhos.
5. `recados.html` — mural de scraps/recados.
6. `depoimentos.html` — depoimentos.
7. `fotos.html` — álbuns e pré-visualização local.
8. `mensagens.html` — chat BABY dentro da rede.
9. `jogos.html` — minijogos e aplicativos sociais.
10. `shots.html` — página adicional de vídeos curtos.

Todas as páginas usam navegação interna compartilhada e carregam o menu universal do CRYPY.

## Identidade visual
- Layout inspirado na organização clássica do Orkut (barra superior, perfil lateral, conteúdo central, painel lateral, scrapbook, depoimentos, comunidades e amigos).
- Identidade de produto CRYPYKUT. Não se apresenta como serviço oficial do Orkut nem como produto do Google.
- Logotipo histórico magenta de 2011 usado como referência visual por meio da imagem hospedada no Wikimedia Commons. A página de arquivo aponta a fonte original para o blog oficial do Orkut e identifica aviso de marca registrada. Fonte: https://commons.wikimedia.org/wiki/File:Orkut_novo_logo.png

## Interações locais ativas
- Chat BABY flutuante em todas as páginas e chat dedicado em Mensagens.
- Preferências locais de amizade, entrada em comunidades, curtidas e preferências.
- Criação local de recados, depoimentos e rascunhos de comunidade.
- Pesquisa de perfis de exemplo.
- Pré-visualização local de imagens e vídeos escolhidos no dispositivo.
- Minijogo de segurança e aplicativos de demonstração.

## Limites funcionais explícitos
- localStorage guarda os dados no navegador atual; não sincroniza visitantes ou dispositivos.
- Uploads de fotos e vídeos são apenas pré-visualizações locais; não são enviados a nuvem.
- O feed SHOTS tem cartões demonstrativos. Não há arquivos de vídeo de amostra fornecidos no pacote.
- Contadores e perfis de exemplo não representam pessoas, audiência ou métricas verificadas.
- Google/Microsoft estão indicados como provedores planejados. Não há OAuth ativo. Para ativar, cadastrar as aplicações e URIs de retorno e implementar validação de tokens/sessões no backend; nunca expor client secrets no navegador.
- Publicação pública, amizades reais, mensagens entre contas, notificações, moderação audiovisual, armazenamento e feed global exigem backend, política de privacidade, segurança, moderação e infraestrutura de mídia.

## Arquivos compartilhados
- `../assets/css/crypy-orkut.css`
- `../assets/js/crypy-orkut.js`

## Preservação
O arquivo editorial anterior `comunidade-editorial-preservada-2026-11-20.html` permanece preservado. O protótipo original `Crypykut+Reels+Orkut (1).tar.gz` não foi regravado.
