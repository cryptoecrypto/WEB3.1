# WEB3.1 — fronteira pública/privada

- Autoridade de dados, memória, configurações internas e backend: `cryptoecrypto/HD-MATRIZ` (privado).
- Papel do WEB3.1: site público, interface, assets públicos, índice de páginas públicas e integração mínima com o serviço online.
- O índice público foi filtrado para não catalogar diretórios de memória/HD, configurações internas, perfis dos agentes ou backend.
- O gerador e o validador passam a rejeitar esses caminhos no índice.

## Resultado do filtro aplicado ao índice

- Entradas antes: 304
- Entradas públicas mantidas: 75
- Entradas privadas excluídas do índice: 229

## Limite importante

Esta alteração retira caminhos privados do índice de navegação; **não apaga os arquivos privados da árvore pública nem do histórico Git**. A remoção física só deve ocorrer depois de a cópia correspondente em HD-MATRIZ ser verificada. A migração da pasta `baby-ia/` está sendo preparada no repositório privado.

Nenhum deploy, exclusão física ou alteração no backend online foi executado por esta alteração.
