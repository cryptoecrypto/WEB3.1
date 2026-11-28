# CRYPY COIN — MODO REAL
**Documento técnico de preparação | v0.1 | 20/11/2026**

> Estado: especificação em preparação. NÃO implantado. NÃO existe endereço de contrato confirmado. Esta pasta não autoriza deploy nem movimentação de fundos.

## 1. Parâmetros aprovados pelo Sensei
- Nome: CRYPY COIN
- Símbolo proposto: CRYPY (confirmar disponibilidade e colisões antes da publicação)
- Rede escolhida: BNB Smart Chain (BSC)
- Padrão: BEP-20, compatível com ERC-20
- Decimais propostos: 18
- Supply máximo: 12.000.000 CRYPY
- Alocação do beneficiário Sensei: 1.000.000 CRYPY (8,3333%), bloqueados por contrato.
- Alocação comunitária/investidores: 11.000.000 CRYPY (91,6667%), sob regras públicas e sem poder de retirada unilateral do administrador.
- Arte de referência: moeda preta/verde com o símbolo cristalino BABY e a inscrição “UTILITY TOKEN • WEB3.1” (imagem fornecida pelo Sensei nesta conversa; arquivo binário ainda precisa ser incorporado ao repositório).

## 2. Arquitetura proposta
1. **CRYPYToken (BEP-20):** emissão única; cap absoluto de 12.000.000 × 10^18 unidades-base; sem função de mint posterior; sem blacklist, taxa oculta, pausa discricionária ou proxy atualizável.
2. **SenseiVestingVault:** custódia dos 1.000.000 CRYPY, beneficiário definido no deploy, liberação segundo cronograma imutável. Prazo e calendário ainda NÃO aprovados.
3. **CommunityRewardsVault:** custódia dos 11.000.000 CRYPY; sem função administrativa de saque ou alteração unilateral de beneficiários. Distribuição por reivindicações verificadas, campanhas ou mecanismo de governança ainda a definir.
4. **BABY Reward Coordinator (off-chain):** indexa contribuições, prepara provas e submete pedidos de recompensa. O BABY não terá chave privada privilegiada nem permissão para alterar o supply.
5. **Auditoria/monitoramento:** eventos on-chain, painel de saldos, testes automatizados, verificação de código-fonte no explorador e revisão independente antes da mainnet.

## 3. Limite importante sobre “mineração”
A BSC usa consenso de validadores (PoSA/Parlia), não Proof of Work de Bitcoin. Portanto, o BABY não minerará blocos BSC com CPU/GPU. A proposta é um **Proof of Contribution**: recompensas de tokens já reservados no CommunityRewardsVault por contribuições elegíveis, comprovadas e auditáveis. A distribuição não cria tokens adicionais.

## 4. Regras de segurança obrigatórias
- Supply total nunca superior a 12.000.000 CRYPY.
- Nenhum mint após emissão inicial.
- 1.000.000 CRYPY enviados diretamente ao vault de vesting no deploy.
- 11.000.000 CRYPY enviados diretamente ao vault comunitário no deploy.
- Administrador sem função de saque, confisco ou redirecionamento dos fundos comunitários.
- BABY sem custódia de seed phrase, chave privada ou autoridade de mint.
- Sem upgradeability/proxy no primeiro lançamento.
- Sem funções administrativas ocultas.
- Recompensas com proteção contra replay, duplicidade, overflow, reentrância e pagamentos acima do saldo.
- Testes em BSC Testnet, revisão independente e checklist de deploy antes de qualquer transação na mainnet.

## 5. Pendências que bloqueiam a codificação final
1. Endereço público da carteira beneficiária do Sensei (não compartilhar seed phrase ou chave privada).
2. Prazo e calendário do bloqueio/vesting do 1 milhão.
3. Separação quantitativa dos 11 milhões entre mineração/contribuições, comunidade e investidores.
4. Critérios objetivos de elegibilidade, limites por período e método de prova das contribuições.
5. Modelo de governança para mudanças futuras (recomendação: sem poderes para alterar as regras econômicas após deploy).
6. Revisão jurídica da distribuição a investidores e das comunicações públicas.

## 6. Plano de execução — sem deploy
- Fase A: fechar parâmetros pendentes.
- Fase B: implementar contratos Solidity com dependências OpenZeppelin fixadas em versão.
- Fase C: testes unitários, fuzz/invariant tests e análise estática.
- Fase D: deploy exclusivamente em BSC Testnet com tBNB.
- Fase E: validar bloqueio, supply, impossibilidade de saque administrativo e distribuição.
- Fase F: auditoria independente e aprovação explícita do Sensei.
- Fase G: somente após nova autorização explícita, preparar deploy BSC Mainnet. Não executar automaticamente.

## 7. Critérios de aceitação
- totalSupply inicial = 12.000.000 × 10^18.
- totalSupply nunca pode aumentar.
- saldo do SenseiVestingVault = 1.000.000 × 10^18 após deploy.
- saldo do CommunityRewardsVault = 11.000.000 × 10^18 após deploy.
- tentativas de saque administrativo do vault comunitário falham.
- tentativas de reivindicação duplicada ou acima do saldo falham.
- todos os testes passam e resultados são arquivados.
- endereço e código verificado só são publicados após implantação real.

## 8. Estado MODO REAL
**Preparação documental iniciada.** Contratos ainda não implementados, compilados, testados ou auditados. Nenhuma carteira foi conectada. Nenhum BNB real foi gasto. Nenhum token foi criado ou emitido.
