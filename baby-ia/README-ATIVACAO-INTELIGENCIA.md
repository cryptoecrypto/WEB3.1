# BABY CRYPY — configuração e ativação controlada

## O que esta entrega prepara
- Constituição de cinco núcleos e política de autonomia controlada.
- Linguagem BABY: símbolos, ASCII binário e envelope JSON.
- Configuração declarativa de provedores Gemini, Claude e GPT.
- Integração planejada com as rotas de memória do backend já propostas em BABY Site Learning.

## Ativação segura
1. Hospedar o backend Node.js >=20 em serviço HTTPS com disco persistente.
2. Definir no servidor: `BABY_SITE_KEY`, `BABY_SITE_ORIGIN=https://cryptoecrypto.github.io` e `BABY_SITE_URL=https://cryptoecrypto.github.io/WEB3.1/`.
3. Configurar `window.BABY_SITE_API` no arquivo público com a URL HTTPS real do backend. Nunca colocar chave secreta no navegador.
4. Para cada provedor que for autorizado, guardar a chave em variável de ambiente do servidor. Os nomes de variáveis e adaptadores precisam ser implementados e testados antes de habilitar qualquer provedor.
5. Executar a indexação do site por `POST /learn`, consultar `GET /learning-status` e validar uma pergunta por `POST /search`.
6. Conferir cobertura, origens, falhas e hashes. Não declarar “aprendeu tudo” sem relatório.
7. Integrar o parser BABY ao chatbot com chamada explícita e testar codificação/decodificação.
8. Manter HD MATRIZ somente leitura; sua indexação exige caminho montado, allowlist, autenticação e auditoria específicos.

## Estado real
Esta branch contém configuração e parser. Não cria chaves, não instala modelos, não conecta APIs externas, não faz deploy, não executa crawl e não ativa o chatbot em produção. O backend atual só possui recuperação lexical do site; os adaptadores Gemini/Claude/GPT ainda não estão implementados. A configuração marca esses requisitos para impedir uma falsa indicação de ativação.
