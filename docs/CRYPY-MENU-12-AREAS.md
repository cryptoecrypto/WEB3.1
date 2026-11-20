# CRYPY — Padrão oficial de navegação

A navegação principal do WEB3.1 usa somente estes 12 rótulos, nesta ordem:

1. NFT
2. ACADEMY
3. BIOGRAFIA
4. MUSEU
5. MARKETPLACE
6. GAMES
7. SOCIAL
8. BABY I.A.
9. WHITE PAPER
10. CONTATO
11. ESQUADRÃO
12. INFINYT

## Regras

- Não acrescentar atalhos, nomes alternativos, pastas ou títulos de páginas ao menu principal.
- Os 12 rótulos e sua ordem são iguais em todas as páginas elegíveis.
- Cada rótulo aponta para uma página de entrada real da respectiva área.
- Os links abrem na mesma janela; não dependem de iframe ou de um target chamado `crypy-content`.
- A navegação antiga de site é ocultada pelo menu global.
- Conteúdos e títulos internos permanecem intactos; somente a navegação do site é padronizada.
- HD, HD MATRIZ, Memory Boost e servidores protegidos ficam fora da sincronização e da auditoria de páginas públicas.

## Destinos

| Rótulo | Destino |
|---|---|
| NFT | `nft-collection/galeria.html` |
| ACADEMY | `crypy-academy/academia.html` |
| BIOGRAFIA | `biografia/historia.html` |
| MUSEU | `crypy-news/museu.html` |
| MARKETPLACE | `art-figure-marketplace/marketplace.html` |
| GAMES | `crypy-games-desafios/crypy-games-desafios.html` |
| SOCIAL | `social-crypykut/comunidade.html` |
| BABY I.A. | `baby-ia.html` |
| WHITE PAPER | `crypy-coin/white-paper.html` |
| CONTATO | `contato/contato-oficial.html` |
| ESQUADRÃO | `esquadrao-das-cores/esquadrao.html` |
| INFINYT | `crypy-infinyt/portal.html` |

A auditoria automática é executada por `node scripts/auditar-menu-crypy.mjs`.
