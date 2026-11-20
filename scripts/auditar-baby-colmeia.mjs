#!/usr/bin/env node
/**
 * BABY COLMEIA audit — static inventory only.
 * Never edits HTML, protected storage, manifests, or runtime data.
 * Protected paths are classified by path and are NOT opened/read.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const outArg = process.argv.find((v) => v.startsWith("--out="));
const OUT = outArg ? outArg.slice(6) : null;
const INDEX_FILE = "assets/data/crypy-page-index.json";
const COVERAGE_FILE = "assets/data/crypy-squad-coverage.json";
const PROTECTED = [
  /(^|\/)hd-oculto(\/|$)/i,
  /(^|\/)hd-matriz(\/|$)/i,
  /(^|\/)memory-boost(\/|$)/i,
  /(^|\/)momory-boost(\/|$)/i,
  /(^|\/)hd-memory\.html$/i,
  /(^|\/)hd-baby-ia\.html$/i,
  /(^|\/)hd-babyia\.html$/i,
  /(^|\/)crypy-server-bridge(\/|$)/i,
];
const isProtected = (p) => PROTECTED.some((re) => re.test(p));
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const norm = (p) => p.replaceAll("\\", "/").replace(/^\.\//, "");
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" })
  .split("\0").filter(Boolean).map(norm);
const htmlFiles = tracked.filter((p) => /\.html?$/i.test(p)).sort();
const index = readJson(INDEX_FILE);
const coverage = readJson(COVERAGE_FILE);
const indexed = new Set((index.pages || []).map((x) => norm(x.path)));
const covered = new Set((coverage.covered || []).map((x) => norm(x.file)));
const excluded = new Set((coverage.excluded || []).map((x) => norm(x.file)));
const trackedSet = new Set(tracked);

const rows = [];
const brokenLocalScripts = [];
const duplicateScripts = [];
const unreadable = [];
for (const file of htmlFiles) {
  const protectedPath = isProtected(file);
  const row = {
    path: file,
    protected: protectedPath,
    indexed: indexed.has(file),
    coverage: covered.has(file) ? "covered" : excluded.has(file) ? "excluded" : "unclassified",
    scanned: false,
    scripts: [],
    chatbotGlobal: "not_checked",
    knowledgeIndexer: "not_checked",
    contextualAssistant: "not_checked",
    iframeChatbot: false,
    brokenLocalScripts: [],
    duplicateScriptSources: [],
  };
  if (!protectedPath) {
    try {
      const html = fs.readFileSync(path.join(ROOT, file), "utf8");
      row.scanned = true;
      const srcs = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)]
        .map((m) => m[1].trim());
      row.scripts = [...new Set(srcs)];
      const counts = new Map();
      for (const src of srcs) counts.set(src, (counts.get(src) || 0) + 1);
      row.duplicateScriptSources = [...counts].filter(([, n]) => n > 1).map(([src]) => src);
      duplicateScripts.push(...row.duplicateScriptSources.map((src) => ({ path: file, src })));
      const lower = srcs.join("\n").toLowerCase();
      row.chatbotGlobal = /baby-global-chat\.js/.test(lower) ? "script_present" : "not_found";
      row.knowledgeIndexer = /baby-knowledge-sync\.js/.test(lower) ? "script_present" : "not_found";
      row.contextualAssistant = /crypy-page-assistant\.js/.test(lower) ? "script_present" : "not_found";
      row.iframeChatbot = /<iframe\b[^>]*src\s*=\s*["'][^"']*chatboot-baby-ia\.html/i.test(html);
      for (const src of srcs) {
        if (/^(https?:)?\/\//i.test(src) || /^(data:|blob:|javascript:)/i.test(src)) continue;
        const clean = decodeURIComponent(src.split(/[?#]/, 1)[0]).replace(/^\/+/, "");
        const pageRelative = norm(path.posix.join(path.posix.dirname(file), clean));
        const candidates = src.startsWith("/")
          ? [clean]
          : [...new Set([pageRelative, clean])];
        if (!candidates.some((candidate) => trackedSet.has(candidate))) {
          const issue = { path: file, src, checkedCandidates: candidates };
          row.brokenLocalScripts.push(issue);
          brokenLocalScripts.push(issue);
        }
      }
    } catch (error) {
      row.scanError = String(error);
      unreadable.push({ path: file, error: String(error) });
    }
  }
  rows.push(row);
}

const count = (fn) => rows.filter(fn).length;
const summary = {
  htmlCount: rows.length,
  indexedCount: count((r) => r.indexed),
  outsideIndex: count((r) => !r.indexed),
  coveredCount: count((r) => r.coverage === "covered"),
  excludedCount: count((r) => r.coverage === "excluded"),
  unclassifiedCount: count((r) => r.coverage === "unclassified"),
  protectedCount: count((r) => r.protected),
  scannedCount: count((r) => r.scanned),
  chatbotGlobalScriptPresent: count((r) => r.chatbotGlobal === "script_present"),
  knowledgeIndexerScriptPresent: count((r) => r.knowledgeIndexer === "script_present"),
  contextualAssistantScriptPresent: count((r) => r.contextualAssistant === "script_present"),
  iframeChatbotPresent: count((r) => r.iframeChatbot),
  brokenLocalScriptReferences: brokenLocalScripts.length,
  duplicateScriptSources: duplicateScripts.length,
  unreadableCount: unreadable.length,
};
const report = {
  schema: "BABY-COLMEIA-AUDIT-STATIC-1.0",
  generatedAt: new Date().toISOString(),
  commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  branch: execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim(),
  sourceFiles: { index: INDEX_FILE, coverage: COVERAGE_FILE },
  sourceHashes: {
    indexSha256: sha256(fs.readFileSync(path.join(ROOT, INDEX_FILE))),
    coverageSha256: sha256(fs.readFileSync(path.join(ROOT, COVERAGE_FILE))),
  },
  method: "git-tracked HTML inventory; static script-src and iframe inspection; protected paths classified without opening their contents",
  limitations: [
    "Static presence is not runtime proof, chatbot functionality, or successful network connection.",
    "Protected files/directories are counted by path only and are not read.",
    "External scripts and dynamically created scripts are not verified.",
    "Dropbox, Railway, authorization, memory persistence, and browser behavior require separate live tests.",
  ],
  summary,
  brokenLocalScripts,
  duplicateScripts,
  unreadable,
  pages: rows,
};
const json = JSON.stringify(report, null, 2) + "\n";
if (OUT) {
  const target = path.resolve(ROOT, OUT);
  if (!target.startsWith(ROOT + path.sep)) throw new Error("--out must remain inside the repository");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, json);
}
process.stdout.write(json);
if (args.has("--strict") && (summary.unclassifiedCount || summary.outsideIndex || summary.brokenLocalScriptReferences || summary.unreadableCount)) {
  process.exitCode = 1;
}
