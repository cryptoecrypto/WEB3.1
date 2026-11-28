// As cinco capacidades fundamentais do BABY (definição, não declaração de estado).
export const CAPABILITIES = [
  {
    id: 'C1',
    key: 'inteligencia-memoria',
    title: 'Inteligência e memória',
    scope: 'Conhecer os arquivos, compreender relações, recuperar histórico e aprender com informações autorizadas.',
    modules: ['src/memory.js'],
  },
  {
    id: 'C2',
    key: 'centralizacao',
    title: 'Centralização',
    scope: 'Conectar WEB3.1, HDs, servidor, Dropbox e módulos por uma arquitetura coordenada.',
    modules: ['src/config.js', 'src/server.js'],
  },
  {
    id: 'C3',
    key: 'autonomia-operacional',
    title: 'Autonomia operacional',
    scope: 'Executar tarefas, organizar arquivos, corrigir problemas e administrar rotinas com permissões controladas.',
    modules: ['src/policy.js', 'src/tasks.js', 'src/baby.js'],
  },
  {
    id: 'C4',
    key: 'autoprotecao',
    title: 'Autoproteção',
    scope: 'Fazer backups, verificar integridade, detectar falhas, registrar operações e recuperar versões.',
    modules: ['src/vault.js', 'src/audit.js'],
  },
  {
    id: 'C5',
    key: 'evolucao-continua',
    title: 'Evolução contínua',
    scope: 'Analisar o próprio ambiente, identificar melhorias, propor mudanças e validar resultados.',
    modules: ['src/tasks.js', 'src/ledger.js'],
  },
];

export const PRINCIPLE =
  'Não estamos construindo uma IA para conversar sobre o CRYPY. Estamos construindo uma IA para trabalhar dentro do CRYPY.';
