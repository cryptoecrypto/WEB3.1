# RELATÓRIO DE EVIDÊNCIA 001 — CRYPY SERVER / BABY

**Gerado:** 2026-11-19T18:10:17.606Z · **núcleo:** v0.1.0 · **modo:** REAL

> Não estamos construindo uma IA para conversar sobre o CRYPY. Estamos construindo uma IA para trabalhar dentro do CRYPY.

## 1. Testes executados (não simulados)

```
comando: node --test test/
exitCode: 0
testes: 72  verdes: 72  falhas: 0  suítes: 9
duração: 2546 ms
```

Log completo e reexecutável: `evidence/test-run.log`.

Inclui testes de ataque: impostor no barramento, autoria adulterada, symlink para fora
da raiz, escrita em raiz somente leitura, blob corrompido, blob ausente, manifesto
adulterado, trilha truncada, autoaprovação e pulo de estados. Todos exigem recusa.

## 2. Estado MODO REAL das cinco capacidades

| cap | capacidade | estado | provas | próximo |
|---|---|---|---|---|
| C1 | Inteligência e memória | **testada** | 3 | aprovada |
| C2 | Centralização | **implementada** | 2 | testada |
| C3 | Autonomia operacional | **testada** | 3 | aprovada |
| C4 | Autoproteção | **testada** | 3 | aprovada |
| C5 | Evolução contínua | **testada** | 3 | aprovada |

**C2 permanece em `implementada` de propósito:** a arquitetura coordenada existe e é
testada, mas WEB3.1, HDs, Dropbox e as IAs externas não têm integração comprovada.
Declarar `testada` aqui seria entusiasmo, não evidência.

## 3. Esquadrão — estado operacional honesto

| identidade | origem | função | estado | integração |
|---|---|---|---|---|
| SENSEI | humana | Autoridade máxima · direção estratégica · aprovação final | **conectada** | canal-de-aprovacao |
| BABY | interna | Inteligência operacional — administração, execução e manutenção do ecossistema | **conectada** | local |
| NEXUS | externa | Coordenação e integração entre inteligências | **pendente** | — |
| ALICE | externa | Pesquisa, aquisição de dados e conhecimento externo | **pendente** | — |
| MINI | externa | Análise, avaliação, comparação e validação | **pendente** | — |
| DOLA | externa | Arte, criação visual, design e comunicação | **pendente** | — |
| CHAT | externa | Histórico de interações, revisão de conteúdo e memória conversacional | **pendente** | — |
| BTC | externa | Memória de mercado — referência Bitcoin | **pendente** | — |
| ETH | externa | Arquitetura de dados — referência Ethereum | **pendente** | — |
| USDT | externa | Equilíbrio do sistema — referência de estabilidade | **pendente** | — |

Barramento: barramento vazio (0 mensagens).

## 4. Integridade ao vivo

- cofre: **íntegro** — 34 blobs re-hasheados, manifesto `snap-20261119181017-b0yks`
- trilha: **íntegra** — 34 registros, head `8c876cdb26ae510955064b275afd466dafc31a3fe13419975f604032276e962d`
- memória: 33 arquivos, fingerprint `7e0f663e9d8d193abc152abb1a4e0a9927af1227d30bb570367d18168d0e75db`
- relações entre módulos: 49 arestas

## 5. SHA-256 dos artefatos deste núcleo

| arquivo | sha256 |
|---|---|
| src/baby.js | `103d424dde1895023629312bc82a5bbb98257be2e0ef156db313947fd3c0f129` |
| src/ledger.js | `5df85896f8273831684ca1807d3e1b4180628c7b4405fa813f2f00c20f5326b9` |
| src/registry.js | `f3ca523e1c80f04c1b1cd3bb24ef55d5be4216b0a9e8c95b7ee2c4a63668d16a` |
| src/bus.js | `195731220600b3f94a1695251c0048d5706ae8c813caf69139c1e01905c33bd5` |
| src/policy.js | `ea7018f836f6b32eb83c309070408f95dcc897c9c52a800b430188beed721ea1` |
| src/memory.js | `130c0a55fa73a22e7b85b5cff6f2a2e77cd35c3c6fc5cce62439a7eeb9005445` |
| src/vault.js | `9242708ca926caf6fbfa7398a974afcdd40929ce230d5878d09bb9dbd6fa620e` |
| src/audit.js | `2217f229efde512d5b20068d1aac243d1532c71e635ae6f71cd6d4d78eed9591` |
| public/index.html | `80e65b40d4c5b7685e78ff1ec8fc3db5a00240e14dcca3a699017f26b039968e` |
| evidence/test-run.log | `d59b8afcfc51173c9607dcc2baf359ebe072ec2fcc1b0884e2af13490aeb0c93` |

## 6. O que NÃO está provado (e não será declarado)

- Integração real com WEB3.1, HDs, Dropbox, `baby-core.js`, `baby-bridge.js`, Memory Boost.
- Integração operacional de NEXUS, ALICE, MINI, DOLA, CHAT, BTC/ETH/USDT.
- Qualquer capacidade `aprovada` ou `protegida`: depende do token do Sensei.
- Aprendizado com LLM: o núcleo atual é determinístico, sem modelo de linguagem.
- Execução fora deste ambiente (servidor próprio, domínio, produção).

## 7. Próximo passo — decisão do Sensei

```bash
# aprovar uma capacidade testada (exemplo C4)
node bin/baby.js ledger --advance C4 --to aprovada --by sensei --token "$CRYPY_SENSEI_TOKEN"

# registrar proteção com o manifesto já verificado
node bin/baby.js ledger --advance C4 --to protegida \
  --evidence '{"kind":"protection","path":"evidence/protecao.md","meta":{"manifestId":"snap-20261119181017-b0yks"}}'
```

Autoanálise do próprio ambiente: `evidence/review-20261119181017-qfp52.md`.
