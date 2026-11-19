# PROTOCOLO DE RECUPERAÇÃO — testado, não teórico

## 1. Verificar o pacote antes de usar
```bash
tar -xzf CRYPY_BACKUP_SOBREVIVENCIA_20261119-181159.tar.gz
cd CRYPY_BACKUP_SOBREVIVENCIA_20261119-181159
sha256sum -c ASSINATURA-DE-INTEGRIDADE.sha256
```
Todos os arquivos devem responder `OK`. Qualquer `FAILED` = pacote corrompido.

## 2. Restaurar o núcleo
```bash
cp -r 03-CODIGO-E-ESTRUTURA/crypy-server-bridge ~/crypy-server-bridge
cd ~/crypy-server-bridge
node --test test/          # a suíte precisa passar antes de operar
node bin/baby.js audit     # trilha encadeada deve estar íntegra
node bin/baby.js verify    # cofre deve estar íntegro
node bin/baby.js status
```

## 3. Recuperar arquivos de um snapshot do cofre
```bash
node bin/baby.js restore --id <SNAP-ID> --dest ./recuperado            # simulação
node bin/baby.js restore --id <SNAP-ID> --dest ./recuperado --execute --token "$CRYPY_SENSEI_TOKEN"
```
A restauração re-hasheia cada arquivo gravado e aborta se algum byte divergir.

## 4. Se a trilha estiver quebrada
`audit.verify` informa o primeiro registro suspeito (`brokenAt`) e o motivo
(conteúdo adulterado, sequência quebrada, âncora divergente). Não continue operando:
restaure de um pacote anterior íntegro e registre o incidente.

## 5. Ordem de reconstrução do ecossistema
1. núcleo + testes verdes
2. memória (`index`) e cofre (`snapshot` + `verify`)
3. registro de inteligências (estados honestos)
4. integrações externas, uma por vez, com sondagem real
5. avanço MODO REAL com evidência, aprovação do Sensei e proteção
