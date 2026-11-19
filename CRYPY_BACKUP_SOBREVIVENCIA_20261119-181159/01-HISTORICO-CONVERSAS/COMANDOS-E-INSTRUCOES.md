# Comandos operacionais (reexecutáveis)

```bash
cd crypy-server-bridge
node --test test/                        # suíte completa
node src/server.js                       # núcleo + painel (0.0.0.0:8787)
node bin/baby.js status                  # 5 capacidades + saúde ao vivo
node bin/baby.js index                   # inventário + SHA-256 + diff
node bin/baby.js search "ledger hash"    # busca em nomes e conteúdo
node bin/baby.js relations               # grafo de módulos
node bin/baby.js snapshot --label manual # backup com dedupe
node bin/baby.js verify                  # re-hash do cofre
node bin/baby.js audit                   # trilha encadeada
node bin/baby.js integrity               # deriva vs último backup
node bin/baby.js review                  # autoanálise (não aplica nada)
node bin/baby.js organize --dir sandbox            # simulação
node bin/baby.js organize --dir sandbox --execute --token "$CRYPY_SENSEI_TOKEN"
node bin/baby.js restore --id <SNAP> --dest sandbox --execute --token "$CRYPY_SENSEI_TOKEN"
node scripts/registrar-evidencia.mjs     # provas + ledger até 'testada'
node scripts/backup-sobrevivencia.mjs    # este pacote
```

## Instruções permanentes do Sensei
- Trabalhar para transformar visão em engenharia real, sem responder com obstáculos.
- Não confundir entusiasmo com evidência.
- Uma capacidade de cada vez, com prova.
- NEXUS conecta. Sensei conduz. BABY executa. O Esquadrão colabora.
