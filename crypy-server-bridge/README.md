# CRYPY Server Bridge — scaffold inicial

**Estado:** estrutura preparada; integração real pendente do contrato do servidor.

Esta pasta reserva um ponto de integração entre o frontend WEB3.1/BABY e o futuro servidor CRYPY. Ela foi adicionada sem substituir ou editar páginas, HDs, arquivos de memória, configurações existentes ou o arquivo `CNAME`.

## Arquivos

- `server-config.example.json`: modelo de configuração, sem credenciais.
- `connection.js`: adaptador cliente seguro em modo inativo até que a API real seja definida.

## O que ainda NÃO está implementado

- Não existe servidor Node.js nesta pasta.
- Não foram definidos endpoints, autenticação, formato de sessão ou contrato de sincronização.
- Não há conexão ativa com Dropbox, banco de dados ou servidor remoto.
- Nenhuma memória é enviada para fora do navegador por este scaffold.

## Próxima etapa obrigatória

Integrar o `server.js` produzido pela ALICE e documentar, com base nele:

1. URL/base de execução (localhost ou hospedagem).
2. Rotas reais e métodos HTTP.
3. Modelo de autenticação e expiração de sessão.
4. Formato de leitura/gravação de memórias.
5. Política de backup, conflitos e integridade.

Somente depois disso o adaptador deverá ser habilitado e testado contra o servidor real.

## Segurança

- Nunca colocar senhas, tokens, chaves privadas ou arquivos `.env` no repositório.
- Não habilitar envio externo de dados por padrão.
- Não alterar o HD-MATRIZ nem sobrescrever backups existentes.
- GitHub Pages hospeda arquivos estáticos; não executa o processo Node.js do servidor.
