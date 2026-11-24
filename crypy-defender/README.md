# CRYPY-DEFENDER

Primeira versão do mecanismo defensivo de inspeção do ecossistema CRYPY.

## Capacidades desta versão
- Percorre arquivos regulares sem seguir links simbólicos.
- Ignora diretórios de estado privado, dependências, repositório Git, evidências e backups.
- Calcula SHA-256 de cada arquivo para inventário e integridade.
- Detecta algumas assinaturas/padrões heurísticos; não afirma detectar todo malware.
- Pode executar ClamAV (\`clamscan\`) com assinaturas instaladas no host.
- Gera relatório JSON sem copiar o conteúdo dos arquivos.
- Modo estrito retorna código diferente de zero quando encontra indicadores.

## Uso
\`\`\`bash
node crypy-defender/scanner.mjs --root . --report /tmp/crypy-defender-report.json
node crypy-defender/scanner.mjs --root . --clamav --strict --report /tmp/crypy-defender-report.json
node --test crypy-defender/test/
\`\`\`

## Limites e implantação
Esta é uma ferramenta de varredura de arquivos em repositório/host, não um antivírus de endpoint completo. A análise heurística pode gerar falsos positivos e falsos negativos. ClamAV depende de instalação e atualização das assinaturas no ambiente.

Esta versão é somente leitura: não apaga, move, bloqueia ou coloca arquivos em quarentena. Não monitora processos, memória, rede ou tráfego em tempo real. Não protege automaticamente GitHub Pages nem hosts de terceiros.

Para proteção de produção, instalar um agente no servidor real com permissões mínimas, habilitar varredura de uploads antes de publicação/execução, quarentena controlada, alertas, logs externos e resposta a incidentes. A integração com uploads e serviços de hospedagem depende da identificação do host e dos caminhos reais. Nunca colocar tokens ou dados de produção no GitHub.
