import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pg from "pg";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as oidc from "openid-client";
import { gradeAssessment, diplomaEligible } from "./assessment.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const academyRoot = path.resolve(__dirname, "../..");
const catalog = JSON.parse(await readFile(path.join(academyRoot, "cursos/catalogo-cursos.json"), "utf8"));
const app = express();
const PORT = Number(process.env.PORT || 8080);
const API_BASE_URL = required("API_BASE_URL");
const APP_ORIGIN = required("APP_ORIGIN");
const FRONTEND_URL = required("FRONTEND_URL");
const SESSION_SECRET = required("SESSION_SECRET");
const pool = new pg.Pool({
  connectionString: required("DATABASE_URL"),
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  max: 10,
  idleTimeoutMillis: 30000
});

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error("Variável obrigatória ausente: " + name);
  return value;
}
function hash(value) { return createHash("sha256").update(value).digest("hex"); }
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
function cookieValue(req, name) {
  const raw = req.headers.cookie || "";
  const item = raw.split(";").map(x => x.trim()).find(x => x.startsWith(name + "="));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}
function setCookie(res, name, value, maxAge, httpOnly = true) {
  res.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; Secure; SameSite=None${httpOnly ? "; HttpOnly" : ""}`);
}
function clearCookie(res, name) {
  res.append("Set-Cookie", `${name}=; Path=/; Max-Age=0; Secure; SameSite=None; HttpOnly`);
}
function courseLevel(trackId, levelId) {
  const track = catalog.tracks.find(x => x.id === trackId);
  const level = track?.levels.find(x => x.id === levelId);
  if (!track || !level) return null;
  return { track, level };
}
function providerSettings(provider) {
  if (provider === "google") return {
    issuer: "https://accounts.google.com",
    clientId: required("GOOGLE_CLIENT_ID"),
    clientSecret: required("GOOGLE_CLIENT_SECRET")
  };
  if (provider === "microsoft") return {
    issuer: "https://login.microsoftonline.com/common/v2.0",
    clientId: required("MICROSOFT_CLIENT_ID"),
    clientSecret: required("MICROSOFT_CLIENT_SECRET")
  };
  return null;
}
const oidcConfigs = new Map();
async function oidcConfig(provider) {
  if (oidcConfigs.has(provider)) return oidcConfigs.get(provider);
  const p = providerSettings(provider);
  if (!p) throw new Error("PROVEDOR_INVALIDO");
  const config = await oidc.discovery(new URL(p.issuer), p.clientId, p.clientSecret);
  oidcConfigs.set(provider, config);
  return config;
}
const mailer = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
}) : null;

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin !== APP_ORIGIN) return res.status(403).json({ error: "ORIGIN_NAO_AUTORIZADA" });
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Academy-CSRF");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: "32kb", type: "application/json" }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const examLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false });

async function requireUser(req, res, next) {
  try {
    const raw = cookieValue(req, "__Host-crypy_academy_session");
    if (!raw) return res.status(401).json({ error: "LOGIN_NECESSARIO" });
    const result = await pool.query(
      "SELECT u.id,u.email,u.display_name,u.email_verified,s.csrf_hash FROM academy_sessions s JOIN academy_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>NOW()",
      [hash(raw)]
    );
    if (!result.rowCount) return res.status(401).json({ error: "SESSAO_EXPIRADA" });
    req.user = result.rows[0];
    if (["POST", "PUT"].includes(req.method)) {
      const csrf = cookieValue(req, "crypy_academy_csrf");
      const header = req.get("X-Academy-CSRF");
      if (!csrf || !header || !safeEqual(csrf, header) || !safeEqual(hash(csrf), req.user.csrf_hash)) {
        return res.status(403).json({ error: "CSRF_INVALIDO" });
      }
    }
    next();
  } catch (error) { next(error); }
}

app.get("/health", (_req, res) => res.json({ status: "ok", service: "crypy-academy-api" }));

app.get("/api/auth/:provider/start", authLimiter, async (req, res, next) => {
  try {
    const provider = req.params.provider;
    const config = await oidcConfig(provider);
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const verifier = oidc.randomPKCECodeVerifier();
    const challenge = await oidc.calculatePKCECodeChallenge(verifier);
    await pool.query(
      "INSERT INTO academy_oauth_transactions(state,provider,nonce,code_verifier,expires_at) VALUES($1,$2,$3,$4,NOW()+INTERVAL '10 minutes')",
      [state, provider, nonce, verifier]
    );
    const redirectUri = API_BASE_URL + "/api/auth/" + provider + "/callback";
    const url = oidc.buildAuthorizationUrl(config, {
      redirect_uri: redirectUri, scope: "openid email profile", state, nonce,
      code_challenge: challenge, code_challenge_method: "S256"
    });
    res.redirect(url.href);
  } catch (error) { next(error); }
});

app.get("/api/auth/:provider/callback", authLimiter, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const provider = req.params.provider;
    const state = String(req.query.state || "");
    const tx = await client.query(
      "DELETE FROM academy_oauth_transactions WHERE state=$1 AND provider=$2 AND expires_at>NOW() RETURNING *",
      [state, provider]
    );
    if (!tx.rowCount) return res.status(400).send("Autenticação expirada ou inválida. Volte à CRYPY Academy.");
    const config = await oidcConfig(provider);
    const redirectUri = API_BASE_URL + "/api/auth/" + provider + "/callback";
    const tokens = await oidc.authorizationCodeGrant(config, new URL(req.originalUrl, API_BASE_URL), {
      pkceCodeVerifier: tx.rows[0].code_verifier,
      expectedState: tx.rows[0].state,
      expectedNonce: tx.rows[0].nonce
    });
    const claims = oidc.getValidatedIdTokenClaims(tokens);
    const email = String(claims.email || claims.preferred_username || "").trim().toLowerCase();
    const verified = provider === "google" ? claims.email_verified === true : claims.email_verified !== false;
    if (!claims.sub || !email || !verified) return res.status(403).send("O provedor não confirmou um e-mail utilizável.");
    await client.query("BEGIN");
    let identity = await client.query(
      "SELECT user_id FROM academy_identities WHERE provider=$1 AND subject=$2",
      [provider, claims.sub]
    );
    let userId;
    if (identity.rowCount) {
      userId = identity.rows[0].user_id;
      await client.query("UPDATE academy_users SET email=$2,display_name=$3,email_verified=TRUE WHERE id=$1",
        [userId, email, String(claims.name || email).slice(0, 160)]);
    } else {
      const user = await client.query(
        "INSERT INTO academy_users(email,display_name,email_verified) VALUES($1,$2,TRUE) ON CONFLICT(email) DO UPDATE SET email_verified=TRUE RETURNING id",
        [email, String(claims.name || email).slice(0, 160)]
      );
      userId = user.rows[0].id;
      await client.query("INSERT INTO academy_identities(provider,subject,user_id) VALUES($1,$2,$3)",
        [provider, claims.sub, userId]);
    }
    const session = randomBytes(32).toString("base64url");
    const csrf = randomBytes(24).toString("base64url");
    await client.query("INSERT INTO academy_sessions(token_hash,user_id,csrf_hash,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '7 days')",
      [hash(session), userId, hash(csrf)]);
    await client.query("COMMIT");
    setCookie(res, "__Host-crypy_academy_session", session, 7 * 24 * 60 * 60, true);
    setCookie(res, "crypy_academy_csrf", csrf, 7 * 24 * 60 * 60, false);
    res.redirect(FRONTEND_URL + "?login=success");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally { client.release(); }
});

app.get("/api/me", requireUser, (req, res) => res.json({
  user: { email: req.user.email, name: req.user.display_name, emailVerified: req.user.email_verified },
  csrf: cookieValue(req, "crypy_academy_csrf")
}));

app.post("/api/logout", requireUser, async (req, res, next) => {
  try {
    const raw = cookieValue(req, "__Host-crypy_academy_session");
    await pool.query("DELETE FROM academy_sessions WHERE token_hash=$1", [hash(raw)]);
    clearCookie(res, "__Host-crypy_academy_session");
    res.append("Set-Cookie", "crypy_academy_csrf=; Path=/; Max-Age=0; Secure; SameSite=None");
    res.json({ ok: true });
  } catch (error) { next(error); }
});

app.get("/api/progress", requireUser, async (req, res, next) => {
  try {
    const { track, level } = req.query;
    if (!courseLevel(String(track || ""), String(level || ""))) return res.status(400).json({ error: "CURSO_INVALIDO" });
    const rows = await pool.query(
      "SELECT lesson_index,completed,updated_at FROM academy_progress WHERE user_id=$1 AND track_id=$2 AND level_id=$3 ORDER BY lesson_index",
      [req.user.id, track, level]
    );
    res.json({ progress: rows.rows });
  } catch (error) { next(error); }
});

app.put("/api/progress", requireUser, async (req, res, next) => {
  try {
    const { track, level, lessonIndex, completed } = req.body || {};
    const course = courseLevel(track, level);
    if (!course || !Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.level.lessons.length || typeof completed !== "boolean") {
      return res.status(400).json({ error: "UNIDADE_INVALIDA" });
    }
    await pool.query(
      "INSERT INTO academy_progress(user_id,track_id,level_id,lesson_index,completed) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,track_id,level_id,lesson_index) DO UPDATE SET completed=EXCLUDED.completed,updated_at=NOW()",
      [req.user.id, track, level, lessonIndex, completed]
    );
    res.json({ ok: true });
  } catch (error) { next(error); }
});

app.get("/api/exams/:track/:level", requireUser, async (req, res, next) => {
  try {
    if (!courseLevel(req.params.track, req.params.level)) return res.status(404).json({ error: "CURSO_INVALIDO" });
    const rows = await pool.query(
      "SELECT id,prompt,options FROM academy_exam_questions WHERE track_id=$1 AND level_id=$2 AND active=TRUE ORDER BY id",
      [req.params.track, req.params.level]
    );
    if (!rows.rowCount) return res.status(404).json({ error: "PROVA_AINDA_NAO_PUBLICADA" });
    res.json({ questions: rows.rows });
  } catch (error) { next(error); }
});

async function makeCertificatePdf(user, course, level, code, issuedAt) {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 54 });
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));
  const done = new Promise((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  doc.fontSize(13).fillColor("#087a43").text("CRYPY ACADEMY · WEB3.1 / CRYPTOËCRYPTO", { align: "center" });
  doc.moveDown(1.5).fontSize(30).fillColor("#111111").text("CERTIFICADO DE PARTICIPAÇÃO E APRENDIZADO", { align: "center" });
  doc.moveDown(1.3).fontSize(16).fillColor("#222222").text("Certificamos que", { align: "center" });
  doc.moveDown(0.5).fontSize(27).fillColor("#087a43").text(user.display_name, { align: "center" });
  doc.moveDown(0.8).fontSize(16).fillColor("#222222").text("concluiu a trilha", { align: "center" });
  doc.moveDown(0.4).fontSize(20).text(course.title + " · " + level.id.toUpperCase(), { align: "center" });
  doc.moveDown(0.6).fontSize(13).text("Avaliação final: 10/10 · CRYPY Academy", { align: "center" });
  doc.moveDown(1.4).fontSize(10).fillColor("#555555").text("Registro: " + code + " · Emissão: " + issuedAt.toISOString(), { align: "center" });
  doc.moveDown(1).fontSize(9).text("Certificado privado de participação e aprendizado. Não reconhecido pelo MEC ou por órgão externo; não equivale a diploma ou habilitação profissional.", { align: "center" });
  doc.end();
  return done;
}

app.post("/api/exams/:track/:level/submit", requireUser, examLimiter, async (req, res, next) => {
  try {
    const { track, level } = req.params;
    const course = courseLevel(track, level);
    if (!course) return res.status(404).json({ error: "CURSO_INVALIDO" });
    const questions = await pool.query(
      "SELECT id,correct_option FROM academy_exam_questions WHERE track_id=$1 AND level_id=$2 AND active=TRUE ORDER BY id",
      [track, level]
    );
    if (!questions.rowCount) return res.status(404).json({ error: "PROVA_AINDA_NAO_PUBLICADA" });
    const grade = gradeAssessment(questions.rows, req.body?.answers || {});
    const progress = await pool.query(
      "SELECT COUNT(*)::int AS completed FROM academy_progress WHERE user_id=$1 AND track_id=$2 AND level_id=$3 AND completed=TRUE",
      [req.user.id, track, level]
    );
    const eligible = diplomaEligible({
      completedLessons: progress.rows[0].completed,
      totalLessons: course.level.lessons.length,
      score: grade.score
    });
    await pool.query(
      "INSERT INTO academy_exam_attempts(user_id,track_id,level_id,total_questions,correct_answers,score,passed) VALUES($1,$2,$3,$4,$5,$6,$7)",
      [req.user.id, track, level, grade.total, grade.correct, grade.score, grade.passed]
    );
    let diploma = null;
    if (eligible) {
      const code = "CRYPY-" + randomBytes(9).toString("hex").toUpperCase();
      const inserted = await pool.query(
        "INSERT INTO academy_diplomas(verification_code,user_id,track_id,level_id,score) VALUES($1,$2,$3,$4,10.00) ON CONFLICT(user_id,track_id,level_id) DO NOTHING RETURNING *",
        [code, req.user.id, track, level]
      );
      if (inserted.rowCount) {
        diploma = inserted.rows[0];
        if (mailer) {
          try {
            const pdf = await makeCertificatePdf(req.user, course.track, course.level, diploma.verification_code, diploma.issued_at);
            await mailer.sendMail({
              from: required("SMTP_FROM"), to: req.user.email,
              subject: "Seu certificado CRYPY Academy está liberado",
              text: "Parabéns! Seu certificado de participação e aprendizado está anexado. Verificação: " + (process.env.CERTIFICATE_PUBLIC_URL || API_BASE_URL + "/api/verify") + "/" + diploma.verification_code,
              attachments: [{ filename: "certificado-crypy-academy.pdf", content: pdf, contentType: "application/pdf" }]
            });
            await pool.query("UPDATE academy_diplomas SET email_status='sent',email_sent_at=NOW() WHERE id=$1", [diploma.id]);
            diploma.email_status = "sent";
          } catch (mailError) {
            console.error("Falha no envio de diploma:", mailError.message);
            await pool.query("UPDATE academy_diplomas SET email_status='failed' WHERE id=$1", [diploma.id]);
            diploma.email_status = "failed";
          }
        }
      } else {
        const existing = await pool.query(
          "SELECT verification_code,email_status,issued_at FROM academy_diplomas WHERE user_id=$1 AND track_id=$2 AND level_id=$3",
          [req.user.id, track, level]
        );
        diploma = existing.rows[0] || null;
      }
    }
    res.json({
      result: grade,
      completedLessons: progress.rows[0].completed,
      totalLessons: course.level.lessons.length,
      diplomaUnlocked: eligible,
      diploma: diploma ? { verificationCode: diploma.verification_code, emailStatus: diploma.email_status } : null,
      message: eligible ? "REQUISITOS_CUMPRIDOS" : grade.score === 10 ? "CONCLUA_TODAS_AS_UNIDADES" : "NOTA_10_NECESSARIA"
    });
  } catch (error) { next(error); }
});

app.get("/api/diplomas", requireUser, async (req, res, next) => {
  try {
    const rows = await pool.query(
      "SELECT verification_code,track_id,level_id,score,issued_at,email_status FROM academy_diplomas WHERE user_id=$1 ORDER BY issued_at DESC",
      [req.user.id]
    );
    res.json({ diplomas: rows.rows });
  } catch (error) { next(error); }
});

app.get("/api/verify/:code", async (req, res, next) => {
  try {
    const row = await pool.query(
      "SELECT d.verification_code,d.track_id,d.level_id,d.score,d.issued_at,u.display_name FROM academy_diplomas d JOIN academy_users u ON u.id=d.user_id WHERE d.verification_code=$1",
      [req.params.code]
    );
    if (!row.rowCount) return res.status(404).json({ valid: false });
    const record = row.rows[0];
    const course = courseLevel(record.track_id, record.level_id);
    res.json({
      valid: true,
      issuer: process.env.CERTIFICATE_ISSUER || "CRYPY ACADEMY · WEB3.1 / CryptoëCrypto",
      student: record.display_name,
      course: course?.track.title || record.track_id,
      level: record.level_id,
      score: "10/10",
      issuedAt: record.issued_at,
      nature: "Certificado privado de participação e aprendizado; não reconhecido pelo MEC ou órgão externo."
    });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error("CRYPY Academy API:", error);
  res.status(500).json({ error: "ERRO_INTERNO" });
});

const server = app.listen(PORT, "0.0.0.0", () => console.log("CRYPY Academy API ouvindo na porta " + PORT));
async function shutdown() {
  server.close();
  await pool.end();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
