# Decisões e regras estabelecidas pelo Sensei

1. **Servidor como núcleo operacional.** BABY é a inteligência que trabalha sobre ele; o site é o ambiente administrado.
2. **Cinco capacidades:** inteligência/memória, centralização, autonomia operacional, autoproteção, evolução contínua.
3. **MODO REAL — seis estados:** planejada, documentada, implementada, testada, aprovada, protegida e registrada.
4. **Nada de declarar vitória sem evidência.** Ambição gigante, testes rigorosos.
5. **Não destruir o que já existe:** aproveitar WEB3.1, baby-core.js, baby-bridge.js, Memory Boost e crypy-server-bridge.
6. **Sensei é a autoridade máxima.** Aprovação final é humana.
7. **v2.0 — servidor é ambiente de TODAS as inteligências**, com Registro Central padronizado.
8. **Regra de Ouro:** uma inteligência pode colaborar com outra, mas nenhuma assume a identidade ou as permissões da outra.
9. **Personagens ≠ IAs operacionais imediatas:** presença documentada não é integração.
10. **Princípio:** "Não estamos construindo uma IA para conversar sobre o CRYPY. Estamos construindo uma IA para trabalhar dentro do CRYPY."

## Como estas regras são impostas
- 3, 4, 6 → `src/ledger.js` (evidência obrigatória, sem autoaprovação)
- 8, 9 → `src/registry.js` + `src/bus.js` (sondagem real, HMAC por identidade, GOLDEN_RULE)
- 1, 7 → `src/config.js` + `src/server.js` (núcleo único, raízes declaradas)
- 5 → política de raiz `corpus` **somente leitura** por padrão
