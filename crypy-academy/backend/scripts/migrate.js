import pg from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ausente");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined });
try {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  const sql = await readFile(path.resolve(__dirname, "../migrations/001_init.sql"), "utf8");
  await pool.query(sql);
  console.log("Migração CRYPY Academy aplicada.");
} finally { await pool.end(); }
