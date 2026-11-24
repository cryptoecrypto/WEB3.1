import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const COOKIE_NAME = 'crypy_baby_session';

function digest(value) {
  return createHash('sha256').update(String(value ?? ''), 'utf8').digest();
}

function constantTimeEqual(a, b) {
  return timingSafeEqual(digest(a), digest(b));
}

function decodeBase32(value) {
  const text = String(value || '').replace(/[\s=-]/g, '').toUpperCase();
  if (!text || !/^[A-Z2-7]+$/.test(text)) throw new Error('CRYPY_TOTP_SECRET deve estar em Base32.');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let buffer = 0;
  const bytes = [];
  for (const char of text) {
    buffer = (buffer << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function hotp(key, counter) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac('sha1', key).update(msg).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const binary = ((mac[offset] & 0x7f) << 24)
    | ((mac[offset + 1] & 0xff) << 16)
    | ((mac[offset + 2] & 0xff) << 8)
    | (mac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, '0');
}

// Exported for deterministic RFC 6238 tests; the secret is never returned by the server.
export function generateTotp(secret, now = Date.now()) {
  const key = decodeBase32(secret);
  return hotp(key, Math.floor(now / 30_000));
}

function matchingTotpCounter(key, token, now, lastAcceptedCounter) {
  const supplied = String(token || '');
  if (!/^\d{6}$/.test(supplied)) return null;
  const current = Math.floor(now / 30_000);
  const candidate = Buffer.from(supplied, 'ascii');
  // One time-step of tolerance accommodates small device/server clock drift.
  for (const counter of [current, current - 1, current + 1]) {
    if (counter <= lastAcceptedCounter || counter < 0) continue;
    const expected = Buffer.from(hotp(key, counter), 'ascii');
    if (timingSafeEqual(candidate, expected)) return counter;
  }
  return null;
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
  totpSecret = process.env.CRYPY_TOTP_SECRET,
  secure = true,
  ttlSeconds = 5 * 60,
  maxAttempts = 6,
  lockoutSeconds = 15 * 60,
  counterFile = process.env.CRYPY_TOTP_COUNTER_FILE || path.join(process.env.CRYPY_DATA_DIR || '/data/crypy-baby', 'totp-last-counter.json'),
  now = () => Date.now(),
} = {}) {
  const user = String(username || 'sensei').trim();
  const secret = String(password || '');
  if (secret.length < 24) {
    throw new Error('CRYPY_ADMIN_PASSWORD precisa ter pelo menos 24 caracteres; o servidor não iniciará com senha fraca ou ausente.');
  }
  const totpKey = decodeBase32(totpSecret);
  if (totpKey.length < 20) {
    throw new Error('CRYPY_TOTP_SECRET deve conter pelo menos 160 bits de entropia (Base32).');
  }

  let lastAcceptedCounter = -1;
  try {
    const parsed = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
    if (Number.isSafeInteger(parsed.lastAcceptedCounter)) lastAcceptedCounter = parsed.lastAcceptedCounter;
  } catch (err) {
    if (err.code !== 'ENOENT') throw new Error('Não foi possível ler o estado anti-replay do TOTP.');
  }

  const sessions = new Map();
  const attempts = new Map();

  function persistCounter(counter) {
    const dir = path.dirname(counterFile);
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const temp = counterFile + '.tmp';
    fs.writeFileSync(temp, JSON.stringify({ lastAcceptedCounter: counter }) + '\n', { mode: 0o600 });
    fs.renameSync(temp, counterFile);
  }

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
    if (session.expiresAt <= now()) {
      sessions.delete(key);
      return null;
    }
    return { username: session.username, expiresAt: session.expiresAt };
  }

  function clearExpired() {
    const currentTime = now();
    for (const [key, session] of sessions) {
      if (session.expiresAt <= currentTime) sessions.delete(key);
    }
    for (const [key, item] of attempts) {
      if (item.resetAt <= currentTime && item.lockedUntil <= currentTime) attempts.delete(key);
    }
  }

  async function login(req, res, body = {}) {
    clearExpired();
    const ip = req.socket?.remoteAddress || 'unknown';
    const currentTime = now();
    const state = attempts.get(ip) || { count: 0, resetAt: currentTime + lockoutSeconds * 1000, lockedUntil: 0 };
    if (state.lockedUntil > currentTime) {
      res.setHeader('Retry-After', String(Math.ceil((state.lockedUntil - currentTime) / 1000)));
      return { status: 429, body: { ok: false, reason: 'Muitas tentativas. Aguarde antes de tentar novamente.' } };
    }

    const userOk = constantTimeEqual(body.username, user);
    const passOk = constantTimeEqual(body.password, secret);
    const acceptedCounter = matchingTotpCounter(totpKey, body.otp, currentTime, lastAcceptedCounter);
    if (!userOk || !passOk || acceptedCounter === null) {
      if (state.resetAt <= currentTime) {
        state.count = 0;
        state.resetAt = currentTime + lockoutSeconds * 1000;
      }
      state.count += 1;
      if (state.count >= maxAttempts) state.lockedUntil = currentTime + lockoutSeconds * 1000;
      attempts.set(ip, state);
      return { status: 401, body: { ok: false, reason: 'Usuário, senha ou código autenticador inválido.' } };
    }

    // Persist the accepted time-step before issuing a session, preventing replay after restart.
    persistCounter(acceptedCounter);
    lastAcceptedCounter = acceptedCounter;
    attempts.delete(ip);
    const token = randomBytes(32).toString('base64url');
    const expiresAt = currentTime + ttlSeconds * 1000;
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
    if (!origin) return false;
    try {
      return new URL(origin).host.toLowerCase() === String(req.headers.host || '').toLowerCase();
    } catch {
      return false;
    }
  }

  return { login, logout, getSession, sameOrigin };
}
