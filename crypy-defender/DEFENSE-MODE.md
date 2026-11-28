# DEFESA-CRYPY-DEFENDER — Política Global v1.0

**Estado:** política e perfis configurados em branch de integração; aplicação em runtime, servidor e CDN ainda pendente de implementação e homologação.

## Objetivo e alcance

Aplicar o mesmo padrão defensivo aos seis repositórios CRYPY, a todas as páginas HTML/HTM encontradas recursivamente (inclusive páginas fora do menu), recursos estáticos, APIs, uploads, mídia, terminais, jogos e serviços privados. A navegação/menu não é fonte de verdade para o inventário: páginas órfãs, ocultas ou não ligadas também precisam entrar no inventário de segurança.

O CRYPY-DEFENDER deve ser centralizado funcionalmente em SECURYTY-SUBC. WEB3.1 é a superfície pública; HD-MATRIZ é o núcleo privado; CRYPY-LAND e CRYPYKUT são produtos; crypy-logo é identidade visual. Nenhum dado privado deve ser replicado para repositórios públicos.

## Controles obrigatórios

### 1. Servidor e HD-MATRIZ
- Executar serviços com conta dedicada sem privilégios de root; separar processos e diretórios por função.
- Manter segredos apenas no gerenciador de segredos do host; nunca em HTML, JavaScript público, commits, relatórios ou backups.
- Manter HD-MATRIZ privado; aplicar o protocolo TOTP aprovado e sessão administrativa curta quando estiver efetivamente configurado.
- Validar integridade e proveniência antes de restaurar backup; restauração, sobrescrita e alteração de credenciais exigem aprovação humana.
- Registrar alterações de arquivos, permissões, configuração, contas, processos e acessos administrativos.
- Usar firewall de entrada/saída, atualização de sistema, isolamento de serviço e backup independente testado.

### 2. Terminais e ferramentas de edição
- Não expor shell de produção a agentes, páginas ou usuários comuns.
- Terminal de agente deve usar somente sandbox isolado, identidade autorizada, limite de tempo, allowlist de saída e auditoria.
- Dialetos PowerShell/CMD do BABY devem continuar limitados à allowlist; não permitir sudo, shell arbitrário, SSH, leitura de segredos, instalação ou deploy sem fluxo aprovado.
- Operações administrativas no terminal exigem permissão específica, confirmação humana e trilha de auditoria.
- Não tentar bloquear o terminal local do proprietário nem ferramentas legítimas de edição; proteger o servidor e os recursos, não fingir controlar o dispositivo do usuário.

### 3. Anti-cheat e jogos
- Estado, pontuação, inventário, economia, cooldowns, recompensas e permissões devem ser calculados/validados no servidor.
- Não confiar em valores enviados pelo navegador ou cliente do jogo.
- Usar rate limit, idempotência, detecção de replay, validação de sequência e logs de anomalia.
- Tratar anti-cheat no cliente apenas como sinal auxiliar, nunca como fronteira de segurança.

### 4. Binários, programas e cadeia de fornecimento
- Não executar binários não confiáveis nem aceitar patch/injeção em produção.
- Verificar assinatura, origem, versão e hash SHA-256/SHA-512 dos artefatos antes de implantação.
- Fixar dependências, revisar mudanças de lockfile e monitorar alterações inesperadas em executáveis e bibliotecas.
- Produzir artefatos imutáveis e promover somente por Pull Request revisado.

### 5. Anti-cópia e páginas
- Não prometer impedir completamente cópia de HTML, imagens ou JavaScript entregues ao navegador: o visitante controla seu próprio dispositivo.
- Não colocar segredos, chaves, regras críticas ou dados privados no frontend.
- Proteger conteúdo sensível por autenticação/autorização no servidor, minimização de dados, controles de exportação/download e auditoria.
- Aplicar CSP, HSTS em HTTPS, X-Content-Type-Options, Referrer-Policy, frame-ancestors e Permissions-Policy no servidor/CDN.
- Inventariar e verificar todas as páginas HTML/HTM recursivamente, mesmo se não estiverem no menu.

### 6. Uploads, imagens e SHOTS
- Validar extensão, MIME e assinatura real do arquivo; impor limites de tamanho e decodificação segura.
- Fazer varredura antimalware antes de publicar ou servir o arquivo.
- Armazenar uploads fora de diretórios executáveis; gerar identificadores aleatórios; não renderizar HTML/SVG não confiável inline.
- Quarentena somente com procedimento reversível, evidência e aprovação humana; sem exclusão automática.

### 7. Agentes e BABY — modo DEFESA
- BABY deve verificar o modo de defesa antes de distribuir tarefas e bloquear ações não autorizadas.
- NEXUS revisa arquitetura, alterações e evidências; ETH revisa implementação; ALICE pesquisa avisos confiáveis; MINI classifica riscos; BTC verifica integridade; CHAT preserva cronologia; DOLA revisa mídia; USDT avalia impacto operacional.
- BNB, SHIBA INU, CRYPYCOIN e ICP permanecem perfis propostos, sem autoridade operacional até confirmação do Sensei.
- Nenhum agente pode desativar controles, contornar autenticação, copiar dados privados, executar comandos no host de produção, apagar arquivos ou restaurar backups por iniciativa própria.
- Alertas heurísticos são sinais para revisão; não são prova de infecção. Nenhum arquivo deve ser apagado ou alterado automaticamente.

## Observações sobre o código auditado
- O servidor HD-MATRIZ já aplica alguns cabeçalhos HTTP e exige sessão ou token para rotas /api.
- O terminal de agente contém allowlist de comandos PowerShell/CMD didáticos, workspace isolado, sem sobrescrita e trilha de auditoria.
- O sandbox Daytona separa execução de shell do host, usa allowlist de domínios e declara não montar segredos.
- As rotas de terminal atualmente compartilham a autenticação geral de /api; falta autorização específica de terminal/RBAC e aprovação por operação. Isso deve ser corrigido antes de expor o serviço em produção.
- O servidor ainda precisa de revisão de CSP/HSTS, varredura obrigatória no pipeline de upload, RBAC específico, auditoria de processos/arquivos em runtime e integração de monitoramento do host.
- O scanner de repositório não equivale a EDR/antivírus de host e não protege memória, processos ou tráfego em tempo real.

## Portões de implantação

1. Inventário de todas as páginas/rotas/serviços e arquivos, inclusive os não ligados ao menu.
2. Testes de autorização negativa para cada rota administrativa e terminal.
3. Testes de upload com arquivos válidos, inválidos e amostras de teste seguras.
4. Teste de integridade e restauração de backup em ambiente isolado.
5. Revisão de permissões do host, containers, volumes e secrets.
6. Testes de anti-cheat no servidor com cliente adulterado/simulador.
7. Aprovação humana e PR revisado antes de promover para main.
8. Homologação em staging antes de qualquer implantação de produção.

## Limites

Este documento e o campo DEFESA-CRYPY-DEFENDER nos perfis são configuração/política. Não representam fine-tuning de modelos nem provam que 13 modelos independentes estejam conectados. A aplicação efetiva depende de implementação no servidor, configuração do host/CDN, testes e homologação.