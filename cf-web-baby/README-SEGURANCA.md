# CF-WEB-BABY — Camada de Segurança CRYPY

**Versão:** 1.0.0  
**Escopo:** integridade, autenticidade, detecção de adulteração e política de recuperação do BABY I.A.

## Objetivo
Esta pasta contém controles defensivos para detectar alterações não autorizadas, validar a integridade dos artefatos e documentar a recuperação segura. Ela não é uma camada de memória nem um mecanismo de sincronização de dados privados.

## Limites importantes
- Este diretório está no repositório público WEB3.1. Portanto, só pode conter código, políticas e chaves públicas.
- Nunca colocar aqui chaves privadas, tokens, senhas, arquivos `.env`, frases-semente, dados pessoais ou conteúdo de HD-MATRIZ/HD-MEMÓRIA.
- SHA-256 detecta divergências, mas não autentica sozinho quem criou o hash. O manifesto de hashes precisa ser autenticado por assinatura e por uma chave pública confiável distribuída fora do mesmo fluxo editável.
- Um script no navegador não impede um mantenedor do repositório de alterar o próprio script. A proteção real também depende de regras de branch, revisão obrigatória, CODEOWNERS, proteção de Actions e credenciais com privilégio mínimo.
- Nenhum controle desta pasta altera, bloqueia, restaura ou sincroniza automaticamente arquivos fora do seu escopo.

## Componentes
- `config/security-policy.json`: política declarativa.
- `crypto/hash-integrity.js`: cálculo e comparação SHA-256.
- `crypto/signature-verification.js`: verificação ECDSA P-256 usando chave pública confiável fornecida pelo ambiente.
- `crypto/key-management-policy.md`: separação e ciclo de vida das chaves.
- `protection/protected-files.json`: inventário explícito dos arquivos protegidos. A lista inicia vazia até que os caminhos e hashes de referência sejam auditados.
- `protection/change-guard.js`: validação de pré-condições para uma alteração.
- `protection/anti-tamper.js`: comparação de artefatos com manifesto autenticado.
- `audit/integrity-check.js`: execução da verificação de integridade.
- `audit/audit-log-schema.json`: formato de eventos de auditoria.
- `recovery/recovery-policy.md`: recuperação controlada.
- `tests/security-tests.js`: testes automatizados com Node.js.

## Estado inicial
**CONTROLES DOCUMENTADOS E CÓDIGO BASE CRIADO — NÃO HOMOLOGADO.** A pasta ainda não possui baseline de hashes, chave pública raiz provisionada, regras de branch verificadas ou integração operacional com HD-MATRIZ. Não declarar proteção ativa ou sincronização concluída até esses itens serem implementados e testados.

## Fluxo recomendado
1. Auditar os caminhos exatos a proteger sem abrir nem copiar dados privados.
2. Gerar o manifesto de hashes em ambiente confiável.
3. Assinar o manifesto fora do repositório público.
4. Distribuir a chave pública confiável por canal protegido e independente.
5. Exigir revisão humana e verificações CI antes de aceitar mudanças.
6. Em divergência, bloquear promoção e abrir incidente; nunca sobrescrever automaticamente o original.
