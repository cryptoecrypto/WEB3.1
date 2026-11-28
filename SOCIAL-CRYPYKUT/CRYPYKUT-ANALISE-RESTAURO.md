# CRYPYKUT — análise do pacote enviado e plano de restauração
Data da análise: 20/11/2026
Pacote original: `Crypykut+Reels+Orkut (1).tar.gz`

## Arquivos contidos no pacote
- `App.tsx` — 548 linhas; componente React principal (63.793 bytes).
- `index.css` — 32 linhas; tema escuro verde neon e animações (1.427 bytes).
- `.clippy/vfs-manifest.json` — manifesto do ambiente de origem (1.130 bytes).
O pacote não contém `package.json`, lockfile, mídia de vídeo, imagens de Reels, backend ou configuração de autenticação OAuth.

## Conteúdo original identificado
1. CRYPYKUT REELS (Página 1): feed com sete Reels-semente, temas WEB3, CIBERSEGURANÇA, I.A., TECNOLOGIA e ENGENHARIA DIGITAL; filtros; cards e palco vertical de vídeo representado por gradientes/animação (sem arquivos reais de vídeo); curtir, compartilhar, comentar, salvar, seguir; formulário de novo Reel.
2. BABY MODERADOR: respostas educativas predefinidas para os cinco temas e orientações de segurança.
3. CRYPYKUT ORKUT (Página 2): perfil Sensei, amigos, fãs, recados/scraps, quatro comunidades e depoimentos.
4. Dados semente do Orkut e métricas exibidas são conteúdo demonstrativo do protótipo, não contagens verificadas de membros ou interações reais.

## Dependências e limites técnicos encontrados
- O React importa `lucide-react` e usa classes Tailwind; não há `package.json` nem processo de build no pacote.
- Leitura e escrita de Reels, comentários, scraps e depoimentos usam `fetch("actions")` com ações `records.list` e `records.create`. O pacote não inclui essa API. Uma publicação estática no GitHub Pages não cria esse endpoint.
- Não existe integração Google, Microsoft, OAuth, Firebase, Supabase ou outro provedor no código original.
- Curtidas, compartilhamento, favoritos, seguir, amizade e ingresso em comunidades são estados locais React; sem backend não sincronizam entre aparelhos.

## Restauração preparada
A restauração na página `social-crypykut/comunidade.html` deve preservar o texto, as sete publicações-semente, os cinco temas, o perfil e a experiência Reels + Orkut. O modo estático pode guardar ações de demonstração somente no navegador, identificando-as como locais. A publicação pública, sincronização entre usuários e autenticação exigem backend e configuração externa.

## Autenticação Google e Microsoft
- Google Identity Services precisa de OAuth Client ID e domínio/origem autorizados; credenciais recebidas no navegador precisam ser validadas pelo backend antes de estabelecer uma sessão de conta.
- Microsoft Entra SPA usa MSAL Browser e Authorization Code Flow com PKCE; é necessário registrar uma aplicação e a URI de redirecionamento exata.
- Não inserir client secrets no HTML ou JavaScript. A interface não deve simular uma conexão quando os identificadores e a infraestrutura ainda não foram fornecidos.

## Preservação
O código original foi recebido como pacote e permanece disponível no arquivo original enviado pelo Sensei. A página editorial anterior do repositório foi copiada para `comunidade-editorial-preservada-2026-11-20.html` antes da substituição.
