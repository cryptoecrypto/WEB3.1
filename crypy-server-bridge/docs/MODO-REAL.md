# MODO REAL — o contrato de trabalho do BABY

> **Não estamos construindo uma IA para conversar sobre o CRYPY. Estamos construindo uma IA para trabalhar dentro do CRYPY.**

Ambição é livre. Estado declarado é controlado. Este contrato é imposto pelo próprio
código (`src/ledger.js`, `src/policy.js`, `src/registry.js`), não por boa intenção.

## 1. Os seis estados

| # | estado | significado | prova exigida pelo núcleo |
|---|--------|-------------|---------------------------|
| 1 | `planejada` | intenção e escopo existem | nenhuma (estado inicial) |
| 2 | `documentada` | arquitetura e contrato escritos | evidência `kind:"doc"` → arquivo **existente** |
| 3 | `implementada` | código no disco | evidência `kind:"code"` → arquivo(s) **existente(s)** |
| 4 | `testada` | testes executados e verdes | evidência `kind:"test"` + log existente + `meta.exitCode=0`, `meta.failed=0`, `meta.passed>0`, `meta.command` reexecutável |
| 5 | `aprovada` | o Sensei autorizou | `approval {by, token}` validado — **o BABY não pode se autoaprovar** |
| 6 | `protegida` | backup e trilha íntegros | evidência `kind:"protection"` + `vault.verify(manifestId)` **ok ao vivo** + `audit.verify()` **ok ao vivo** |

Cada avanço grava estado anterior, estado novo, timestamp, autor e o **SHA-256 de cada
arquivo de prova**, e emite `ledger.advance` na trilha encadeada.

## 2. Regras que o código impõe

1. **Sem pular estados** → `STATE_SKIP`.
2. **Sem prova no disco, não há avanço** → evidência inexistente é recusada.
3. **Teste vermelho não conta** → `TEST_NOT_GREEN`.
4. **Aprovação é humana** → `APPROVAL_DENIED`.
5. **Proteção é verificada no instante do registro** → `VAULT_BAD` / `AUDIT_BAD`.
6. **Tentativa negada não muda o estado**, mas fica registrada.
7. **Presença documentada ≠ integração operacional** (v2.0): nenhuma inteligência é
   marcada `conectada` sem sondagem real bem-sucedida (`registry.probe`).

## 3. Autoridade e permissões

- **Sensei** é a autoridade máxima. Token: `CRYPY_SENSEI_TOKEN`
  (padrão de desenvolvimento `sensei-dev-token` — **trocar em produção**).
- Raízes declaradas em `src/config.js` / `src/policy.js`:
  - `corpus` (projeto/site): **somente leitura**;
  - `estado-do-baby`, `evidencias`, `sandbox`, `backups`: leitura e escrita.
- Operação destrutiva: **dry-run por padrão**; execução exige aprovação, gera
  **snapshot automático antes** e **verifica hash depois**.
- Symlinks que escapam da raiz e caminhos com `..` são bloqueados antes de qualquer I/O.
- **Regra de Ouro (v2.0):** identidade e permissões são intransferíveis. Autoridade de
  aprovar é exclusiva do Sensei (`GOLDEN_RULE`).

## 4. Fluxo honesto para avançar uma capacidade

```bash
node --test test/ > evidence/test-run.log 2>&1

node bin/baby.js ledger --advance C1 --to documentada \
  --evidence '{"kind":"doc","path":"docs/ARQUITETURA.md"}'

node bin/baby.js ledger --advance C1 --to implementada \
  --evidence '{"kind":"code","paths":["src/memory.js"]}'

node bin/baby.js ledger --advance C1 --to testada \
  --evidence '{"kind":"test","path":"evidence/test-run.log","meta":{"command":"node --test test/","exitCode":0,"passed":72,"failed":0}}'

# decisão do Sensei — o BABY não faz isto sozinho
node bin/baby.js ledger --advance C1 --to aprovada --by sensei --token "$CRYPY_SENSEI_TOKEN"

# proteção comprovada
node bin/baby.js snapshot --label protecao-C1
node bin/baby.js ledger --advance C1 --to protegida \
  --evidence '{"kind":"protection","path":"evidence/protecao.md","meta":{"manifestId":"<ID>"}}'
```

`node scripts/registrar-evidencia.mjs` automatiza as etapas 1–2 e **para na fronteira da
aprovação**: prepara o terreno, não toma a decisão.

## 5. Proibido neste projeto

- Declarar capacidade pronta sem prova no disco.
- Chamar de "backup" algo que nunca foi restaurado e verificado.
- Marcar IA externa como conectada sem sondagem real.
- Escrever "✅ Arquivado" para arquivo que não existe no armazenamento.
- Autoaprovar, autoconceder permissão ou falar em nome de outra identidade.

## 6. Verificação independente (qualquer pessoa pode repetir)

```bash
node --test test/            # testes reais, incluindo ataques simulados
node bin/baby.js verify      # re-hash de todos os blobs do cofre
node bin/baby.js audit       # sequência + encadeamento + âncora
node bin/baby.js integrity   # deriva do corpus vs último backup
sha256sum -c ASSINATURA-DE-INTEGRIDADE.sha256   # dentro do pacote de backup
```
