# CRYPY Daily World — BABY

Status: fundação de pré-visualização em branch. Não altera a página pública nem publica automaticamente.

## Rotina
- Agendamento: 03:00 UTC, equivalente a 00:00 em America/Sao_Paulo.
- O gerador escolhe um tema diário de forma determinística e cria um manifesto JSON.
- O workflow valida o JSON e guarda um artefato por 14 dias.
- Nenhum arquivo de produção é sobrescrito e nenhuma imagem/GIF externa é baixada.

## Limite desta primeira etapa
Isto produz uma prévia diária de cenário, mensagem, layout e animação declarativa. Ainda não chama modelos de IA, não gera imagens/GIFs reais, não altera o HTML publicado e não faz postagens em redes sociais.

## Próximas etapas
1. Definir endpoint autenticado do BABY e adaptadores dos agentes.
2. Guardar credenciais apenas em Secrets/secret manager.
3. Validar texto, licença de mídia, acessibilidade, segurança e consistência visual.
4. Gerar assets em armazenamento privado, com metadados de licença e hash.
5. Abrir PR de publicação; só promover após checks e aprovação humana.
6. Avaliar publicação automática de conteúdo aprovado após histórico estável.

A página pública deverá consumir somente edições aprovadas. Edições em prévia nunca devem ser aplicadas diretamente.
