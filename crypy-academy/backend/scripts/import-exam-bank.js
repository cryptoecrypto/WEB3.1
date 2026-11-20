import pg from "pg";
import { readFile } from "node:fs/promises";
const file = process.argv[2];
if (!file) throw new Error("Uso: npm run import:exams -- ./exam-bank.json");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ausente");
const items = JSON.parse(await readFile(file, "utf8"));
if (!Array.isArray(items) || !items.length) throw new Error("O arquivo deve conter uma lista de questões.");
for (const q of items) {
  if (!q.id || !q.track || !q.level || !q.prompt || !Array.isArray(q.options) || q.options.length < 2 ||
      !q.options.some(o => o.id === q.correctOption) || q.options.some(o => !o.id || !o.text)) {
    throw new Error("Questão inválida: " + (q.id || "sem id"));
  }
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined });
try {
  await pool.query("BEGIN");
  for (const q of items) {
    await pool.query(
      "INSERT INTO academy_exam_questions(id,track_id,level_id,prompt,options,correct_option,explanation,active) VALUES($1,$2,$3,$4,$5::jsonb,$6,$7,TRUE) ON CONFLICT(id) DO UPDATE SET track_id=EXCLUDED.track_id,level_id=EXCLUDED.level_id,prompt=EXCLUDED.prompt,options=EXCLUDED.options,correct_option=EXCLUDED.correct_option,explanation=EXCLUDED.explanation,active=TRUE",
      [q.id,q.track,q.level,q.prompt,JSON.stringify(q.options),q.correctOption,q.explanation || null]
    );
  }
  await pool.query("COMMIT");
  console.log(items.length + " questões importadas.");
} catch (error) {
  await pool.query("ROLLBACK");
  throw error;
} finally { await pool.end(); }
