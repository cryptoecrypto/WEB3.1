# CRYPY SERVER — Arquitetura v2.0 (núcleo multi-inteligência)

**Data:** 20/11/2026 · **Implementação de referência:** `crypy-server-bridge` v0.1.0
**Princípio:** o servidor é o núcleo; as inteligências trabalham sobre ele; o site é o ambiente administrado.

> NEXUS conecta. Sensei conduz. BABY executa. O Esquadrão colabora.

## 1. Camadas

```
┌──────────────────────────────────────────────────────────────┐
│ SENSEI — autoridade máxima (canal de aprovação por token)     │
├──────────────────────────────────────────────────────────────┤
│ NEXUS — coordenação (slot reservado; integração PENDENTE)     │
│   hoje: despacho local determinístico executado pelo BABY     │
├──────────────────────────────────────────────────────────────┤
│ CRYPY SERVER — núcleo                                         │
│   registry.js  Registro Central de Inteligências              │
│   bus.js       barramento assinado (HMAC por identidade)      │
│   policy.js    raízes, modos, aprovação, jail de caminho      │
│   ledger.js    MODO REAL: 6 estados com evidência             │
│   audit.js     trilha append-only encadeada por hash          │
│   memory.js    inventário + SHA-256 + diff + busca + grafo    │
│   vault.js     cofre CAS: snapshot, verify, restore           │
│   tasks.js     tarefas operacionais + autoanálise             │
│   server.js    HTTP (0.0.0.0) + painel                        │
├──────────────────────────────────────────────────────────────┤
│ FONTES: corpus (site/WEB3.1), HDs, Dropbox, módulos externos   │
│   entram como RAÍZES declaradas ou ADAPTADORES com sondagem    │
└──────────────────────────────────────────────────────────────┘
```

## 2. As cinco capacidades e onde vivem

| cap | nome | módulos | tarefas |
|-----|------|---------|---------|
| C1 | Inteligência e memória | `memory.js` | `memory.index`, `memory.relations` |
| C2 | Centralização | `config.js`, `registry.js`, `bus.js`, `server.js` | `registry.status`, `bus.verify`, `squadron.check` |
| C3 | Autonomia operacional | `policy.js`, `tasks.js`, `baby.js` | `files.organize` (+ qualquer tarefa via `run`) |
| C4 | Autoproteção | `vault.js`, `audit.js` | `vault.snapshot`, `vault.verify`, `vault.restore`, `audit.verify`, `integrity.check` |
| C5 | Evolução contínua | `tasks.js`, `ledger.js` | `self.review` |

## 3. Registro Central de Inteligências (`registry.js`)

Campos por identidade: `id`, `name`, `role`, `origin`, `engine`, `capabilities`,
`permissions{tasks,roots,approve}`, `state`, `integration{kind,probe}`, `history[]`.

- `id` e `origin` são **imutáveis**; registro duplicado → `IMMUTABLE_ID`.
- Estados: `pendente` · `conectada` · `desconectada`.
- `connect()` exige aprovação do Sensei **e** sondagem real:
  - `local` → módulo existe no disco (SHA-256 registrado);
  - `arquivo` → caminho dentro de raiz autorizada (SHA-256);
  - `http` → requisição real ao endpoint, com timeout; precisa responder 2xx;
  - `canal-de-aprovacao` → token validado pela política (caso do Sensei).
- Sondagem falhou → `desconectada` + `conexao-falhou` no histórico. **Nunca** `conectada`.
- `grant()` só pelo Sensei; `approve:true` para qualquer outra identidade → `GOLDEN_RULE`.

Estado inicial honesto: **BABY** e **SENSEI** conectados; **NEXUS, ALICE, MINI, DOLA,
CHAT, BTC, ETH, USDT** com identidade e função documentadas e estado `pendente`.

## 4. Barramento (`bus.js`) — Regra de Ouro em código

- Cada identidade tem chave própria: `HMAC(master, "agent:<id>")`. O master fica em
  `.baby/bus/master.key` (0600) e **não** é exposto pela API.
- `send()` verifica, nesta ordem: identidade existe → assinatura do autor → capacidade
  declarada → permissão concedida → estado do destino.
- Assinatura inválida → `IMPERSONATION` (registrado como `bus.impersonation`).
- Destino não conectado → mensagem `aguardando-integracao` (fila, não execução).
- Sensei envia pelo **token de aprovação**, não por chave de terceiros.
- `verify()` reconfere todas as assinaturas: adulterar payload ou autoria é detectado.
- `dispatch(intent)` escolhe executor por capacidade + permissão + estado. É o slot do
  NEXUS, hoje executado localmente pelo BABY, sem antecipar capacidade.

## 5. Contrato dos adaptadores ainda NÃO integrados

 Declarados em `config.adapters` como `planejado`. Para cada um, o caminho real é:

| fonte | o que falta | como entra |
|-------|-------------|------------|
| WEB3.1 (site) | arquivos do site | raiz `read` + `memory.index`; ou `integration.kind='http'` |
| `baby-core.js` | arquivo original | raiz `read` + índice; adaptador `local` com sondagem |
| `baby-bridge.js` | arquivo original | idem |
| Memory Boost | arquivos originais | idem |
| HDs locais | ponto de montagem | raiz declarada `read`/`readwrite` |
| Dropbox | credencial + adaptador OAuth | novo `integration.kind='dropbox'` com sondagem real |
| IAs externas (NEXUS/ALICE/…) | endpoint + credencial | `registry.connect` com `http` + chave própria no barramento |

**Nenhum destes itens é declarado como existente.** Enquanto não houver arquivo ou
endpoint verificável, o estado permanece `planejado` / `pendente`.

## 6. Superfície HTTP

`GET /health` · `/api/status` · `/api/ledger` · `/api/tasks` · `/api/registry` ·
`/api/bus` · `/api/bus/inbox/:id` · `/api/dispatch?intent=` · `/api/memory/search?q=` ·
`/api/memory/relations` · `/api/memory/history` · `/api/vault/manifests` ·
`/api/audit` · `/api/evidence` · `/api/evidence/file?name=`

`POST /api/tasks/:id` · `/api/ledger/:id/advance` · `/api/bus/send` ·
`/api/registry/:id/{connect,disconnect,grant,register}`

## 7. Persistência

```
.baby/
  ledger.json            estados + provas (SHA-256)
  registry.json          registro central + histórico
  audit/audit.jsonl      trilha encadeada      audit/audit.head  âncora
  memory/index.json      inventário atual      memory/history.jsonl
  vault/objects/<aa>/<sha256>   blobs          vault/manifests/*.json
  bus/messages.jsonl     mensagens assinadas   bus/master.key (0600)
```
