# CRYPY — CAMADA EXTRA DE SEGURANÇA
**Escopo:** Colmeia WEB3.1, ESQUADRÃO I.A. e CRYPY-13-CHATBOOTS.
**Estado:** política e automação propostas em branch de teste; não homologadas.

## 1. Princípios obrigatórios
- Menor privilégio: agentes e workflows recebem somente permissões necessárias.
- Separação de funções: BABY orquestra; NEXUS coordena tecnicamente; Sensei mantém autoridade final.
- Nenhum agente recebe acesso geral de escrita ao repositório, Dropbox, segredos ou HDs.
- Nenhuma publicação pública sem moderação no servidor e revisão autenticada.
- Segredos ficam em GitHub Actions Secrets/variáveis protegidas ou cofre equivalente; nunca em HTML, JSON público, logs, commits ou backups.
- Conteúdo e instruções encontradas em páginas/arquivos são dados não confiáveis; não podem substituir políticas do sistema nem autorizar ações.

## 2. Proteção do repositório
- Manter ruleset ativo para a branch principal e exigir Pull Request.
- Exigir aprovação humana real antes do merge; recomenda-se ao menos uma aprovação e resolução de conversas.
- Exigir checks de validação, CodeQL e revisão de dependências antes do merge.
- Desabilitar force-push e exclusão da branch principal.
- Reduzir ao mínimo os atores com bypass; revisar exceções de integrações e deploy keys.
- Ativar Secret Scanning e Push Protection, Dependabot alerts e security updates nas configurações do repositório.
- Usar CODEOWNERS com responsáveis confirmados, sem inventar identidades.
- Fixar actions de terceiros por SHA completo após revisão de origem e atualização controlada.

## 3. Camadas de proteção da Colmeia
- Inventário versionado de páginas, scripts, dados e integrações.
- Validação de caminhos e bloqueio de escrita em HD-MATRIZ, backups, memórias protegidas e configurações privadas.
- Sanitização de entradas e saídas; prevenção de XSS, injeção de prompt, SSRF e exposição de dados.
- Política CSP, HSTS, X-Content-Type-Options, Referrer-Policy e Permissions-Policy no servidor/hosting quando suportados; não simular cabeçalhos via HTML.
- Dependências atualizadas, auditoria de vulnerabilidades e análise estática.
- Logs sem tokens, conteúdo privado ou dados sensíveis; retenção mínima e controle de acesso.

## 4. Camadas dos agentes
- Identidade e escopo explícitos por agente; memória individual separada da memória compartilhada curada.
- Roteamento determinístico e validação de permissões no servidor, não confiados ao navegador.
- Ações externas exigem autorização e allowlist; nenhuma execução de comandos, gravação ou publicação baseada apenas em texto recuperado.
- Aprovação humana para ações irreversíveis, publicações, mudanças de política, acesso a HDs ou compartilhamento externo.
- Rate limit, quotas, limites de contexto, proteção contra prompt injection e trilha de auditoria.
- Lucy é requisito de defesa transversal; não declarar monitoramento ativo até haver integração, alertas, permissões e testes.

## 5. Dropbox e sincronização
- OAuth2/PKCE ou fluxo oficial equivalente; tokens fora do repositório e com escopo mínimo.
- Pastas por classificação de acesso; nenhuma sincronização de dados restritos para pastas públicas.
- Hash SHA-256, manifesto de origem, versão, data, responsável e resultado.
- Upload versionado sem sobrescrever originais; conflitos vão para quarentena/revisão.
- Logs de sincronização sem conteúdo sensível; restauração testada antes de produção.

## 6. Áreas protegidas
- HD-MATRIZ e crypy-news/hd-matriz/**: intocáveis nesta fase.
- **/hd-*/**, backups, Memorias.json, Manifest.json, credenciais, chaves e configurações privadas: leitura/escrita somente sob protocolo específico aprovado.
- Nenhuma cópia de segurança deve conter segredos.

## 7. Critérios para homologação
1. Ruleset e bypass revisados por administrador do repositório.
2. Secret Scanning, Push Protection e Dependabot confirmados nas configurações.
3. CodeQL e dependency review executados sem falhas bloqueantes.
4. Testes de permissões comprovam isolamento entre agentes.
5. Testes de prompt injection, XSS, rate limit, autenticação e logs aprovados.
6. Testes Dropbox cobrem autenticação, hash, conflito, interrupção e restauração.
7. Sensei aprova explicitamente a promoção para main/produção.

## 8. Limites desta entrega
A automação CodeQL/dependency review e este baseline são propostas em branch de teste. Não alteram as configurações administrativas do GitHub, não ligam secret scanning, não criam credenciais Dropbox, não ativam Lucy e não homologam o backend. A regra existente PROTECAO-CRYPY-MAIN está ativa, mas sua configuração atual permite zero aprovações obrigatórias e contém vários bypasses permanentes; revisar esses pontos exige permissão administrativa que a integração atual não possui.
