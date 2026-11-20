import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'crypy_baby_session';

function digest(value) {
  return createHash('sha256').update(String(value ?? ''), 'utf8').digest();
}

function constantTimeEqual(a, b) {
  return timingSafeEqual(digest(a), digest(b));
}

function cookieValue(req) {
  const header = String(req.headers.cookie || '');
  for (const part of header.split(';')) {
    const item = part.trim();
    if (item.startsWith(COOKIE_NAME + '=')) return item.slice(COOKIE_NAME.length + 1);
  }
  return '';
}

export function createAuth({
  username = 'sensei',
  password,
  secure = true,
  ttlSeconds = 8 * 60 * 60,
  maxAttempts = 6,
  lockoutSeconds = 15 * 60,
} = {}) {
  const user = String(username || 'sensei').trim();
  const secret = String(password || '');
  if (secret.length < 24) {
    throw new Error('CRYPY_ADMIN_PASSWORD precisa ter pelo menos 24 caracteres; o servidor não iniciará com senha fraca ou ausente.');
  }

  const sessions = new Map();
  const attempts = new Map();

  function setCookie(res, token, maxAge) {
    const flags = [
      COOKIE_NAME + '=' + token,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      'Max-Age=' + maxAge,
    ];
    if (secure) flags.push('Secure');
    res.setHeader('Set-Cookie', flags.join('; '));
    res.setHeader('Cache-Control', 'no-store');
  }

  function getSession(req) {
    const token = cookieValue(req);
    if (!token) return null;
    const key = digest(token).toString('hex');
    const session = sessions.get(key);
    if (!session) return null;
    if (session.expiresAt <= Date.now()) {
      sessions.delete(key);
      return null;
    }
    return { username: session.username, expiresAt: session.expiresAt };
  }

  function clearExpired() {
    const now = Date.now();
    for (const [key, session] of sessions) {
      if (session.expiresAt <= now) sessions.delete(key);
    }
    for (const [key, item] of attempts) {
      if (item.resetAt <= now && item.lockedUntil <= now) attempts.delete(key);
    }
  }

  async function login(req, res, body = {}) {
    clearExpired();
    const ip = req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const state = attempts.get(ip) || { count: 0, resetAt: now + lockoutSeconds * 1000, lockedUntil: 0 };
    if (state.lockedUntil > now) {
      res.setHeader('Retry-After', String(Math.ceil((state.lockedUntil - now) / 1000)));
      return { status: 429, body: { ok: false, reason: 'Muitas tentativas. Aguarde antes de tentar novamente.' } };
    }

    const userOk = constantTimeEqual(body.username, user);
    const passOk = constantTimeEqual(body.password, secret);
    if (!userOk || !passOk) {
      if (state.resetAt <= now) {
        state.count = 0;
        state.resetAt = now + lockoutSeconds * 1000;
      }
      state.count += 1;
      if (state.count >= maxAttempts) state.lockedUntil = now + lockoutSeconds * 1000;
      attempts.set(ip, state);
      return { status: 401, body: { ok: false, reason: 'Usuário ou senha inválidos.' } };
    }

    attempts.delete(ip);
    const token = randomBytes(32).toString('base64url');
    const expiresAt = now + ttlSeconds * 1000;
    sessions.set(digest(token).toString('hex'), { username: user, expiresAt });
    setCookie(res, token, ttlSeconds);
    return { status: 200, body: { ok: true, username: user, expiresAt } };
  }

  function logout(req, res) {
    const token = cookieValue(req);
    if (token) sessions.delete(digest(token).toString('hex'));
    setCookie(res, '', 0);
    return { ok: true };
  }

  function sameOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return true; // ferramentas locais e testes; cookies permanecem SameSite=Strict
    try {
      return new URL(origin).host.toLowerCase() === String(req.headers.host || '').toLowerCase();
    } catch {
      return false;
    }
  }

  return { login, logout, getSession, sameOrigin };
}
