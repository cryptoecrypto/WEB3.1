# REGRA DE OURO — identidade e permissões intransferíveis

> **Uma inteligência pode colaborar com outra, mas nenhuma assume a identidade ou as permissões da outra.**

Isto não é um voto de confiança: é um conjunto de verificações executadas antes de
qualquer efeito no sistema.

## Onde a regra é imposta

| # | ataque / erro possível | barreira em código | resultado |
|---|------------------------|--------------------|-----------|
| 1 | falar em nome de outra identidade | `bus.send` compara HMAC com a chave **daquela** identidade (`timingSafeEqual`) | `IMPERSONATION` + `bus.impersonation` na trilha |
| 2 | trocar a autoria de uma mensagem já gravada | `bus.verify()` reassina o corpo canônico | `assinatura inválida na mensagem …` |
| 3 | operar sem integração real | `registry.assertCanOperate` exige `state==='conectada'` | `NOT_CONNECTED` |
| 4 | usar capacidade que não é sua | checagem em `capabilities` | `NO_CAPABILITY` |
| 5 | usar permissão que não recebeu | checagem em `permissions.tasks` | `NO_PERMISSION` |
| 6 | conceder permissão a si mesma | `registry.grant` exige `approval.by==='sensei'` | `NOT_SENSEI` |
| 7 | tomar o poder de aprovar | `approve:true` para id ≠ `sensei` | `GOLDEN_RULE` |
| 8 | clonar/sobrescrever identidade | `id` imutável no registro | `IMMUTABLE_ID` |
| 9 | autoaprovar capacidade no MODO REAL | `ledger.advance('aprovada')` valida token | `APPROVAL_DENIED` |
| 10 | escrever fora do que lhe foi dado | `policy.resolve` (jail + modo + realpath) | `OUT_OF_ROOT` / `READ_ONLY_ROOT` |

## Provas

Todos os casos acima têm teste automatizado que tenta o ataque e exige a recusa:

- `test/bus.test.js` — impostor, autoria adulterada, pendente operando, escalação.
- `test/registry.test.js` — identidade imutável, conexão sem sondagem, `GOLDEN_RULE`, `NOT_SENSEI`.
- `test/policy.test.js` — jail, symlink, `..`, somente leitura, token.
- `test/ledger.test.js` — autoaprovação e pulo de estados.

```bash
node --test test/    # 72 testes, incluindo os ataques acima
```

## Colaboração permitida

- Mensagem assinada de A para B, com capacidade e permissão de A respeitadas.
- B pendente → a mensagem fica em `aguardando-integracao` (fila), **não** é executada
  por outra identidade em seu lugar.
- O despacho (`dispatch`) escolhe quem executa; se ninguém conectado pode, o resultado
  é `executor: null` com a lista `aguardandoIntegracao`. Não há substituição silenciosa.

## Autoridade

O Sensei é a única origem de aprovação (`CRYPY_SENSEI_TOKEN`). O barramento do Sensei
usa o token, não a chave de outra inteligência. Toda concessão, conexão, registro e
aprovação fica no histórico da identidade **e** na trilha encadeada do servidor.
