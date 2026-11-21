# Política de gerenciamento de chaves

## Separação
- Chave privada de assinatura: somente em cofre/secret manager externo, acessível a um processo de release autorizado.
- Chave pública de verificação: pode ser distribuída ao verificador, mas sua origem confiável deve ser independente do conteúdo que ela valida.
- Tokens de GitHub e credenciais de provedores: somente em GitHub Actions Secrets ou cofre equivalente, com menor privilégio e rotação.
- Nunca armazenar segredos em HTML, JavaScript público, commits, issues, logs ou backups públicos.

## Ciclo de vida
1. Gerar a chave privada em ambiente controlado.
2. Registrar impressão digital da chave pública por canal independente.
3. Restringir assinatura a responsáveis autorizados e registrar cada uso.
4. Rotacionar ou revogar chaves em caso de suspeita de comprometimento.
5. Reassinar o manifesto após revisão e aprovação da alteração.

## Proibições
- Não gerar, imprimir ou commitar a chave privada neste repositório.
- Não aceitar uma chave pública obtida do mesmo manifesto ainda não verificado como raiz de confiança.
- Não usar SHA-256 isolado como prova de autoria.
