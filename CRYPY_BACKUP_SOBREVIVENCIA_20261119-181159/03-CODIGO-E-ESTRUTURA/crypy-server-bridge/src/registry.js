// CRYPY SERVER v2.0 — REGISTRO CENTRAL DE INTELIGÊNCIAS.
// Regra de Ouro: uma inteligência pode colaborar com outra, mas NENHUMA assume
// a identidade ou as permissões da outra. Aqui isso é código, não promessa.
// Presença documentada ≠ integração operacional: 'conectada' só com sondagem real.
import path from 'node:path';
import { hashFile, nowIso, readJson, writeJsonAtomic } from './util.js';

export const AGENT_STATES = ['pendente', 'conectada', 'desconectada'];
export const ORIGINS = ['interna', 'externa', 'humana'];

/** Esquadrão CRYPY — identidades documentadas. Estado operacional honesto por padrão. */
export const SEED_AGENTS = [
  {
    id: 'sensei', name: 'SENSEI', origin: 'humana', engine: 'autoridade humana',
    role: 'Autoridade máxima · direção estratégica · aprovação final',
    capabilities: ['aprovar', 'definir-direcao', 'autorizar-operacao'],
    permissions: { tasks: ['*'], roots: ['*'], approve: true },
    state: 'conectada',
    integration: { kind: 'canal-de-aprovacao', detail: 'token de aprovação validado pela política (src/policy.js)' },
  },
  {
    id: 'baby', name: 'BABY', origin: 'interna', engine: 'node 20 · determinístico · sem LLM',
    role: 'Inteligência operacional — administração, execução e manutenção do ecossistema',
    capabilities: ['memory.index', 'memory.relations', 'vault.snapshot', 'vault.verify', 'vault.restore', 'audit.verify', 'integrity.check', 'files.organize', 'self.review', 'coordenar-local'],
    permissions: { tasks: ['memory.index', 'memory.relations', 'vault.snapshot', 'vault.verify', 'vault.restore', 'audit.verify', 'integrity.check', 'files.organize', 'self.review'], roots: ['corpus:read', 'estado-do-baby:rw', 'evidencias:rw', 'sandbox:rw'], approve: false },
    state: 'conectada',
    integration: { kind: 'local', module: 'src/baby.js', detail: 'núcleo executando neste processo' },
  },
  {
    id: 'nexus', name: 'NEXUS', origin: 'externa', engine: 'a definir na integração',
    role: 'Coordenação e integração entre inteligências',
    capabilities: ['coordenar', 'rotear-tarefas'],
    permissions: { tasks: [], roots: [], approve: false },
    state: 'pendente', integration: null,
  },
  {
    id: 'alice', name: 'ALICE', origin: 'externa', engine: 'a definir na integração',
    role: 'Pesquisa, aquisição de dados e conhecimento externo',
    capabilities: ['pesquisar', 'adquirir-dados'],
    permissions: { tasks: [], roots: [], approve: false },
    state: 'pendente', integration: null,
  },
  {
    id: 'mini', name: 'MINI', origin: 'externa', engine: 'a definir na integração',
    role: 'Análise, avaliação, comparação e validação',
    capabilities: ['analisar', 'comparar', 'validar'],
    permissions: { tasks: [], roots: [], approve: false },
    state: 'pendente', integration: null,
  },
  {
    id: 'dola', name: 'DOLA', origin: 'externa', engine: 'a definir na integração',
    role: 'Arte, criação visual, design e comunicação',
    capabilities: ['criar-visual', 'design', 'comunicar'],
    permissions: { tasks: [], roots: [], approve: false },
    state: 'pendente', integration: null,
  },
  {
    id: 'chat', name: 'CHAT', origin: 'externa', engine: 'a definir na integração',
    role: 'Histórico de interações, revisão de conteúdo e memória conversacional',
    capabilities: ['registrar-historico', 'revisar-conteudo'],
    permissions: { tasks: [], roots: [], approve: false },
    state: 'pendente', integration: null,
  },
  {
    id: 'btc', name: 'BTC', origin: 'externa', engine: 'a definir na integração',
    role: 'Memória de mercado — referência Bitcoin',
    capabilities: ['memoria-mercado:btc'],
    permissions: { tasks: [], roots: [], approve: false },
    state: 'pendente', integration: null,
  },
  {
    id: 'eth', name: 'ETH', origin: 'externa', engine: 'a definir na integração',
    role: 'Arquitetura de dados — referência Ethereum',
    capabilities: ['arquitetura-dados:eth'],
    permissions: { tasks: [], roots: [], approve: false },
    state: 'pendente', integration: null,
  },
  {
    id: 'usdt', name: 'USDT', origin: 'externa', engine: 'a definir na integração',
    role: 'Equilíbrio do sistema — referência de estabilidade',
    capabilities: ['equilibrio-sistema:usdt'],
    permissions: { tasks: [], roots: [], approve: false },
    state: 'pendente', integration: null,
  },
];

export class RegistryError extends Error {
  constructor(message, code = 'REGISTRY_DENIED') {
    super(message);
    this.name = 'RegistryError';
    this.code = code;
  }
}

export class Registry {
  constructor({ dir, projectRoot, policy, audit = null }) {
    this.file = path.join(dir, 'registry.json');
    this.projectRoot = projectRoot;
    this.policy = policy;
    this.audit = audit;
  }

  async init() {
    const existing = await readJson(this.file, null);
    if (existing) return this;
    const agents = {};
    for (const a of SEED_AGENTS) {
      agents[a.id] = {
        ...a,
        declaredOnly: a.state !== 'conectada',
        createdAt: nowIso(), updatedAt: nowIso(),
        history: [{ ts: nowIso(), event: 'registrada', by: 'system', detail: { state: a.state, origin: a.origin } }],
      };
    }
    await writeJsonAtomic(this.file, { version: '2.0', createdAt: nowIso(), goldenRule: 'Uma inteligência pode colaborar com outra, mas nenhuma assume a identidade ou as permissões da outra.', agents });
    return this;
  }

  async read() { return readJson(this.file, null); }
  async get(id) { const db = await this.read(); return db.agents[id] || null; }
  async list() {
    const db = await this.read();
    return Object.values(db.agents).map((a) => ({
      id: a.id, name: a.name, role: a.role, origin: a.origin, engine: a.engine,
      capabilities: a.capabilities, permissions: a.permissions, state: a.state,
      declaredOnly: a.state !== 'conectada', integration: a.integration,
      historyCount: a.history.length, updatedAt: a.updatedAt,
    }));
  }

  async #save(db) { await writeJsonAtomic(this.file, db); }

  async #event(db, id, event, by, detail) {
    const a = db.agents[id];
    a.updatedAt = nowIso();
    a.history.push({ ts: a.updatedAt, event, by, detail });
    if (this.audit) await this.audit.append({ action: `registry.${event}`, target: id, actor: by, detail });
  }

  /** Identidade é imutável: id e origem não se transferem nem se sobrescrevem. */
  async register(def, { approval = null } = {}) {
    const auth = this.policy.authorize({ task: 'registry.register', destructive: true, dryRun: false, approval });
    if (!auth.allowed) throw new RegistryError(`registro exige aprovação do Sensei: ${auth.reason}`, 'APPROVAL_DENIED');
    if (!def?.id || !/^[a-z0-9-]{2,24}$/.test(def.id)) throw new RegistryError('id inválido (use a-z0-9-, 2..24)');
    if (!ORIGINS.includes(def.origin)) throw new RegistryError(`origem inválida: ${def.origin}`);
    const db = await this.read();
    if (db.agents[def.id]) throw new RegistryError(`identidade já existe e é imutável: ${def.id}`, 'IMMUTABLE_ID');
    db.agents[def.id] = {
      id: def.id, name: def.name || def.id.toUpperCase(), role: def.role || 'a definir',
      origin: def.origin, engine: def.engine || 'a definir na integração',
      capabilities: def.capabilities || [], permissions: { tasks: [], roots: [], approve: false, ...(def.permissions || {}), approve: false },
      state: 'pendente', integration: null, declaredOnly: true,
      createdAt: nowIso(), updatedAt: nowIso(), history: [],
    };
    if (db.agents[def.id].permissions.approve) throw new RegistryError('autoridade de aprovação é exclusiva do Sensei');
    await this.#event(db, def.id, 'registrada', approval.by, { origin: def.origin, role: def.role || null });
    await this.#save(db);
    return db.agents[def.id];
  }

  /** Sondagem real da integração. Sem prova de conexão, não existe 'conectada'. */
  async probe(integration) {
    if (!integration?.kind) return { ok: false, reason: 'integração sem kind' };
    if (integration.kind === 'local') {
      const abs = path.resolve(this.projectRoot, integration.module || '');
      try {
        const hash = await hashFile(abs);
        return { ok: true, kind: 'local', module: integration.module, sha256: hash, ts: nowIso() };
      } catch {
        return { ok: false, reason: `módulo local inexistente: ${integration.module}` };
      }
    }
    if (integration.kind === 'arquivo') {
      try {
        const { abs } = await this.policy.resolve(integration.path, 'read');
        return { ok: true, kind: 'arquivo', path: abs, sha256: await hashFile(abs), ts: nowIso() };
      } catch (err) {
        return { ok: false, reason: err.message };
      }
    }
    if (integration.kind === 'http') {
      const url = integration.endpoint;
      if (!/^https?:\/\//.test(url || '')) return { ok: false, reason: 'endpoint http inválido' };
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), integration.timeoutMs || 4000);
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        const txt = await res.text();
        let body = null;
        try { body = JSON.parse(txt); } catch { /* texto puro também serve */ }
        const ok = res.ok && !(body && body.ok === false);
        return { ok, kind: 'http', endpoint: url, status: res.status, ts: nowIso(), reason: ok ? 'respondeu' : `status ${res.status}` };
      } catch (err) {
        return { ok: false, kind: 'http', endpoint: url, reason: `sem resposta: ${err.message}`, ts: nowIso() };
      } finally {
        clearTimeout(timer);
      }
    }
    if (integration.kind === 'canal-de-aprovacao') {
      return { ok: true, kind: 'canal-de-aprovacao', detail: 'token validado pela política', ts: nowIso() };
    }
    return { ok: false, reason: `kind de integração não suportado: ${integration.kind}` };
  }

  async connect(id, { integration, approval = null } = {}) {
    const auth = this.policy.authorize({ task: 'registry.connect', destructive: true, dryRun: false, approval });
    if (!auth.allowed) throw new RegistryError(`conexão exige aprovação do Sensei: ${auth.reason}`, 'APPROVAL_DENIED');
    const db = await this.read();
    const a = db.agents[id];
    if (!a) throw new RegistryError(`identidade desconhecida: ${id}`, 'UNKNOWN_ID');
    const result = await this.probe(integration);
    if (!result.ok) {
      a.state = 'desconectada';
      a.declaredOnly = true;
      a.integration = { ...(integration || {}), probe: result };
      await this.#event(db, id, 'conexao-falhou', approval.by, { reason: result.reason, kind: integration?.kind });
      await this.#save(db);
      return { ok: false, id, state: a.state, reason: result.reason, probe: result };
    }
    a.state = 'conectada';
    a.declaredOnly = false;
    a.integration = { ...integration, probe: result };
    await this.#event(db, id, 'conectada', approval.by, { kind: integration.kind, probe: result });
    await this.#save(db);
    return { ok: true, id, state: a.state, probe: result };
  }

  async disconnect(id, { approval = null, reason = 'desconexão manual' } = {}) {
    const auth = this.policy.authorize({ task: 'registry.disconnect', destructive: true, dryRun: false, approval });
    if (!auth.allowed) throw new RegistryError(auth.reason, 'APPROVAL_DENIED');
    const db = await this.read();
    if (!db.agents[id]) throw new RegistryError(`identidade desconhecida: ${id}`, 'UNKNOWN_ID');
    db.agents[id].state = 'desconectada';
    db.agents[id].declaredOnly = true;
    await this.#event(db, id, 'desconectada', approval.by, { reason });
    await this.#save(db);
    return { ok: true, id, state: 'desconectada' };
  }

  /** Permissões são intransferíveis: só o Sensei concede, e nunca a autoridade de aprovar. */
  async grant(id, { permissions, approval = null } = {}) {
    const auth = this.policy.authorize({ task: 'registry.grant', destructive: true, dryRun: false, approval });
    if (!auth.allowed) throw new RegistryError(`concessão exige o Sensei: ${auth.reason}`, 'APPROVAL_DENIED');
    if (approval.by !== 'sensei') throw new RegistryError('somente o Sensei concede permissões', 'NOT_SENSEI');
    if (permissions?.approve === true && id !== 'sensei') {
      throw new RegistryError('Regra de Ouro: autoridade de aprovação é exclusiva do Sensei', 'GOLDEN_RULE');
    }
    const db = await this.read();
    const a = db.agents[id];
    if (!a) throw new RegistryError(`identidade desconhecida: ${id}`, 'UNKNOWN_ID');
    const before = { ...a.permissions };
    a.permissions = {
      tasks: [...new Set([...(a.permissions.tasks || []), ...(permissions?.tasks || [])])],
      roots: [...new Set([...(a.permissions.roots || []), ...(permissions?.roots || [])])],
      approve: id === 'sensei',
    };
    await this.#event(db, id, 'permissoes-concedidas', approval.by, { before, after: a.permissions });
    await this.#save(db);
    return { ok: true, id, permissions: a.permissions };
  }

  /** Portão de operação usado pelo barramento: identidade + estado + permissão. */
  async assertCanOperate(id, intent) {
    const a = await this.get(id);
    if (!a) return { allowed: false, reason: `identidade desconhecida: ${id}`, code: 'UNKNOWN_ID' };
    if (a.state !== 'conectada') return { allowed: false, reason: `${a.name} está '${a.state}': presença documentada não é integração operacional`, code: 'NOT_CONNECTED' };
    if (intent && !a.capabilities.includes(intent) && !a.capabilities.includes('*')) {
      return { allowed: false, reason: `${a.name} não declara a capacidade '${intent}'`, code: 'NO_CAPABILITY' };
    }
    if (intent && !a.permissions.approve && !(a.permissions.tasks || []).includes(intent) && !(a.permissions.tasks || []).includes('*')) {
      return { allowed: false, reason: `${a.name} não tem permissão para '${intent}' (Regra de Ouro)`, code: 'NO_PERMISSION' };
    }
    return { allowed: true, agent: a };
  }
}
