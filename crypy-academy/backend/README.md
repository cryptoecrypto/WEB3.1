# CRYPY Academy — backend de matrícula, provas e diplomas

Backend isolado da área `crypy-academy`. Não altera o servidor BABY, a raiz do site, NFT, HD MATRIZ ou outras áreas.

## O que este serviço implementa

- Login Google e Microsoft via OpenID Connect Authorization Code + PKCE.
- Sessão opaca em cookie Secure/HttpOnly/SameSite=None, com validade de 7 dias; transação OAuth vinculada ao navegador por cookie de curta duração.
- CSRF por token duplo e CORS restrito à origem do GitHub Pages.
- Persistência PostgreSQL de alunos, identidade, sessão, progresso, provas, tentativas e diplomas.
- Questões e gabaritos mantidos somente no banco; o endpoint público da prova nunca envia a resposta correta.
- Nota calculada no servidor; diploma só é criado quando todas as unidades da trilha estão concluídas e a nota é exatamente 10/10.
- PDF de certificado e envio SMTP; verificação pública por código, sem expor e-mail.
- Banco separado de direitos premium para futura integração autenticada da Hotmart.

## Estado real / limites

Este é o backend preparado no repositório, não uma autenticação já operante. Para operar, ainda são necessários PostgreSQL, deploy, variáveis secretas, cadastros OAuth nos provedores, SMTP e banco de questões aprovado. Sem banco de questões publicado, a prova responde `PROVA_AINDA_NAO_PUBLICADA` e nenhum diploma pode ser liberado. Sem SMTP, o diploma pode ser registrado, mas o envio fica pendente/falha — não declarar e-mail enviado.

As marcações de aula representam progresso declarado pelo aluno e registrado no servidor; não comprovam presença física, tempo efetivo de estudo nem avaliação humana de projetos. A CRYPY deve descrever com precisão o critério usado no certificado.

O PHD é conceitualmente premium, mas o conteúdo atualmente publicado em GitHub Pages é público. A tabela de direitos premium é apenas a base para futura integração Hotmart; não torna arquivos estáticos privados. Não publicar material premium exclusivo até movê-lo para armazenamento privado com autorização por matrícula.

## Implantação

Defina a raiz do serviço como `crypy-academy/backend` no provedor de hospedagem Node 22. Configure PostgreSQL e as variáveis listadas em `.env.example`. Execute `npm install`, `npm run migrate`, depois `npm start`.

Cadastre exatamente estes redirect URIs nos provedores:

- Google: `https://SEU-SERVICO.up.railway.app/api/auth/google/callback`
- Microsoft: `https://SEU-SERVICO.up.railway.app/api/auth/microsoft/callback`

Configure `APP_ORIGIN=https://cryptoecrypto.github.io` e `FRONTEND_URL=https://cryptoecrypto.github.io/WEB3.1/crypy-academy/cursos.html`.

## Banco de questões

Importe um JSON aprovado pelo responsável do curso:

```json
[
  {
    "id": "web3-iniciante-001",
    "track": "web3",
    "level": "iniciante",
    "prompt": "Enunciado da questão",
    "options": [
      { "id": "a", "text": "Alternativa A" },
      { "id": "b", "text": "Alternativa B" }
    ],
    "correctOption": "a",
    "explanation": "Justificativa para o gabarito"
  }
]
```

Execute `npm run import:exams -- ./questoes-aprovadas.json`. O arquivo de questões deve conter quantidade, cobertura curricular, gabarito e explicações revisadas antes da publicação. Não foi inventado um banco de provas para as 28 trilhas.

## Rotas

- `GET /health`
- `GET /api/auth/google/start` e `GET /api/auth/microsoft/start`
- `GET /api/me`, `POST /api/logout`
- `GET /api/progress?track=...&level=...`, `PUT /api/progress`
- `GET /api/exams/:track/:level`, `POST /api/exams/:track/:level/submit`
- `GET /api/diplomas`, `GET /api/verify/:code`

A emissão é idempotente por aluno/curso/nível. Reenvio de e-mail e gestão administrativa de alunos/provas precisam de painel administrativo próprio, ainda não incluído.
