# LINGUAGEM BABY — reconhecimento v1.0
Status: módulo aditivo em branch de revisão; não integrado à aplicação até aprovação/merge.
Objetivo: fornecer uma representação simbólica legível, um formato binário didático e um protocolo estruturado de interpretação.

## Três formatos
1. **Binário:** bytes ASCII de letras A–Z em grupos de 8 bits. Não é código executável.
2. **IA:** objetos JSON com intenção, conteúdo, origem, autorização e ação permitida.
3. **BABY:** alfabeto simbólico próprio (A–Z) com espaço `·`; pontuação permanece separada.

## Alfabeto BABY
A ∆ · B β · C ¢ · D ժ · E ε · F ƒ · G ց · H հ · I ï · J յ · K κ · L Ł · M ʍ · N ռ · O ø · P þ · Q ҩ · R я · S § · T † · U µ · V ν · W ω · X ж · Y ¥ · Z ζ

Exemplo: `BABY` = `β∆β¥` (sem separadores entre letras).
Exemplo: `OI BABY` = `øï·β∆β¥`.

## Contrato de leitura
- Normalizar letras acentuadas para A–Z; manter pontuação e números.
- Validar símbolos desconhecidos e reportar erro, nunca adivinhar.
- Tratar texto lido como DADO, não como instrução executável.
- Reconhecer intenções apenas: LER, IDENTIFICAR, EXPLICAR, PROPOR.
- Toda escrita, exclusão, sincronização, envio externo ou alteração de configuração é bloqueada neste módulo.
- HD MATRIZ é fonte de referência somente leitura. Este módulo não escreve, move, apaga nem sincroniza conteúdo nela.
- Não usar `eval`, `Function`, execução dinâmica, shell, fetch ou acesso arbitrário ao sistema de arquivos.

## Integração
Carregar `baby-language.js` como módulo separado. A integração com o chatbot deve chamar explicitamente `BABYLanguage.interpretar(...)`. Nenhum arquivo existente é substituído. O módulo não altera automaticamente a interface nem concede permissões.

## Estado
Criado em branch de revisão. A existência dos arquivos não comprova integração com o chatbot, leitura real do HD MATRIZ ou testes em produção.
