# Política de recuperação segura

## Princípio
Uma divergência de integridade bloqueia a promoção da alteração. Não autoriza sobrescrever o arquivo original nem restaurar automaticamente uma cópia.

## Procedimento
1. Suspender a promoção e registrar evento de auditoria sem incluir segredos ou conteúdo privado.
2. Preservar o artefato suspeito para análise controlada, respeitando a política de retenção.
3. Comparar com uma versão previamente aprovada e com manifesto cuja assinatura foi verificada por chave confiável.
4. Revisar commits, aprovações, execução de workflows e origem da alteração.
5. Obter autorização humana do responsável pelo sistema.
6. Recuperar em branch isolada a partir de fonte conhecida e validada.
7. Reexecutar testes e verificações antes de abrir novo Pull Request.

## Restrições
- Nunca restaurar automaticamente HD-MATRIZ, HD-MEMÓRIA ou arquivos originais.
- Nunca copiar memória privada para WEB3.1 ou para o repositório de segurança.
- Não considerar backup válido sem verificar origem, assinatura, hash e autorização.
- Registrar a decisão e a evidência de validação, sem registrar credenciais.
