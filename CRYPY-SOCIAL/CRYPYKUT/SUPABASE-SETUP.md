# CRYPYKUT — ativação do backend

## O que esta entrega prepara
- Home pública com login por Google, Microsoft (provedor Azure no Supabase) e conta local por e-mail/senha.
- Área protegida após autenticação.
- Catálogo preservado dos 176 módulos existentes: 147 CRYPYKUT, 9 CRYPY-SHOTS e 20 CRYPY-LAND.
- Esquema SQL inicial para perfis, amizades, publicações, comunidades, membros, depoimentos, mensagens e bloqueios.

## O que ainda precisa ser configurado
1. Criar um projeto Supabase.
2. Copiar Project URL e anon/public key para `supabase-config.js`.
3. Ativar Email no Authentication.
4. Configurar os provedores Google e Azure/Microsoft no Supabase e cadastrar os respectivos Client ID/Secret no painel do Supabase.
5. Em Authentication → URL Configuration, cadastrar a URL pública da CRYPYKUT como Site URL e permitir o callback do projeto.
6. Executar `database/schema.sql` no SQL Editor do projeto.
7. Testar criação de conta, confirmação de e-mail, login, OAuth, logout e políticas RLS.

## Segurança
- A chave anon/public pode ficar no navegador; a chave `service_role` nunca pode.
- O SQL ativa Row Level Security nas tabelas iniciais.
- Nunca confiar em permissões decididas apenas pelo HTML.
- As telas antigas incorporadas ainda contêm dados demonstrativos e ações locais. A autenticação protege a entrada, mas não transforma automaticamente cada módulo legado em CRUD persistente. A integração funcional das tabelas e a migração dos dados são etapas seguintes.
- Não cadastrar usuários reais até concluir configuração e testes.

## URLs
- Home pública: `/WEB3.1/CRYPY-SOCIAL/CRYPYKUT/`
- Área após login: `/WEB3.1/CRYPY-SOCIAL/CRYPYKUT/rede.html`
- Callback OAuth: usar a URL da Home/área indicada na configuração do Supabase e manter a rota `rede.html` na lista permitida.


## Limite importante do GitHub Pages
O GitHub Pages publica arquivos estáticos e não consegue proteger arquivos HTML individuais no servidor. Nesta primeira etapa, o login protege a entrada no portal, mas os endereços diretos dos módulos legados continuam publicamente acessíveis até que o conteúdo privado seja servido por backend/API com autorização. Não use esta versão para guardar dados pessoais ou conversas privadas reais. A interface antiga também contém módulos demonstrativos; eles ainda precisam ser ligados às tabelas e testados.
