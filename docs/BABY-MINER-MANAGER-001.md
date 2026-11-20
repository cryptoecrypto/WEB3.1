# BABY MINER MANAGER — Arquitetura gratuita e segura (rascunho)

## Estado
- Interface de preparação: criada em `baby-miner-manager.html`.
- MetaMask: conexão EIP-1193 somente leitura no chat BABY, condicionada à aprovação do usuário no navegador.
- Mineração: NÃO instalada, NÃO iniciada e NÃO conectada a pool.
- PC: hardware ainda não identificado.
- Pagamentos: nenhuma carteira BTC configurada.
- Backend/agente local: ainda não implementado.

## Separação de carteiras
MetaMask expõe endereço EVM (0x...) e rede EVM. Esse endereço não é um endereço Bitcoin nativo. Para pagamentos de mineração BTC, configurar um endereço BTC compatível diretamente no minerador/pool. Nunca pedir ou armazenar seed phrase, chave privada ou senha.

## Componentes gratuitos previstos
1. Software de mineração de código aberto, obtido exclusivamente do repositório/site oficial do projeto e verificado por hash/assinatura quando publicado.
2. Pool com modalidade, taxas, pagamento mínimo e protocolo avaliados antes da escolha.
3. Agente local no PC, sem execução arbitrária de shell, com allowlist de operações e autenticação local.
4. API de telemetria inicialmente somente leitura.
5. Painel web estático sem dependência de serviço pago.
6. Registros locais e exportação de diagnóstico sem segredos.

## Contrato futuro do agente local (proposta, não implementado)
- `GET /health`: estado do agente e versão.
- `GET /api/v1/miner/status`: processo, minerador, algoritmo, uptime.
- `GET /api/v1/miner/metrics`: hashrate, shares aceitas/rejeitadas, temperaturas, consumo quando disponível.
- `GET /api/v1/pool/status`: conexão e estatísticas fornecidas pelo pool.
- `POST /api/v1/miner/start` e `POST /api/v1/miner/stop`: somente após autenticação, confirmação local, limites de temperatura/energia e auditoria.

## Requisitos obrigatórios do agente
- Bind exclusivo em loopback (127.0.0.1), não expor porta à internet.
- Autenticação de pareamento com segredo aleatório guardado localmente; nunca hardcode no site.
- CORS restrito à origem exata do site CRYPY.
- Proteção contra CSRF/replay e rate limit.
- Não aceitar caminho de executável, argumentos livres, scripts, comandos ou URLs arbitrárias enviados pelo navegador.
- Executar usuário sem privilégios administrativos.
- Allowlist fixa de binários e argumentos; validação estrita de valores.
- Logs locais sem seed, chaves, tokens ou credenciais.
- Parada de emergência e limites de temperatura/consumo.
- Não iniciar automaticamente sem consentimento explícito.
- Não usar chave privada da carteira; o pool recebe apenas endereço público de pagamento.

## Viabilidade
Mineração de Bitcoin em CPU/GPU de PC doméstico não é competitiva com ASICs. Antes de operar, levantar modelo CPU/GPU, consumo medido em watts, tarifa R$/kWh, taxas do pool e hashrate real. Não prometer lucro.

## Critérios de aceitação
- Sem carteira autorizada, nenhum endereço é lido.
- Sem agente, métricas aparecem como indisponíveis, nunca zero fictício.
- Sem autorização local, start/stop permanecem indisponíveis.
- Nenhuma seed phrase/chave privada solicitada ou transmitida.
- Nenhuma mineração declarada ativa sem processo e pool confirmados.
- Nenhum pagamento declarado recebido sem registro verificável do pool/carteira.

## Custos
O código do painel e do agente pode ser desenvolvido com ferramentas gratuitas e software open-source. Isso não significa custo total zero: energia elétrica, hardware, rede e eventuais taxas de pool continuam existindo.
