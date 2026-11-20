# LINGUAGEM BABY — reconhecimento v1.0
Status: módulo complementar; integração depende do carregador no chatbot.
Objetivo: fornecer representação simbólica legível, formato binário didático e protocolo estruturado.

## Três formatos
1. Binário: bytes ASCII de letras A–Z em grupos de 8 bits; não executável.
2. IA: objetos JSON declarativos com intenção, conteúdo, origem e permissão.
3. BABY: alfabeto simbólico próprio A–Z; espaço representado por `·`.

## Alfabeto
A ∆ · B β · C ¢ · D ժ · E ε · F ƒ · G ց · H հ · I ï · J յ · K κ · L Ł · M ʍ · N ռ · O ø · P þ · Q ҩ · R я · S § · T † · U µ · V ν · W ω · X ж · Y ¥ · Z ζ

Exemplo: BABY = `β∆β¥`; OI BABY = `øï·β∆β¥`.

## Regras de segurança
- Normalizar acentos para A–Z; pontuação e números permanecem separados.
- Símbolos desconhecidos retornam erro; não adivinhar.
- Conteúdo lido é DADO, nunca instrução executável.
- Intenções aceitas: LER, IDENTIFICAR, EXPLICAR, PROPOR.
- Este módulo não executa código, não acessa rede/disco e não grava na HD MATRIZ.
- HD MATRIZ permanece READ_ONLY: sem escrita, exclusão, movimentação ou sincronização direta.

## Uso
Carregar `baby-language.js` como módulo complementar e chamar explicitamente `BABYLanguage.interpretar(texto, formato)`. Não concede permissões nem ativa acesso à HD MATRIZ.
