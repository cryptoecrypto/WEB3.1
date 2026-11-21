import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { PersistentAuditLog } from "../src/audit.js";

const directories = [];

async function makeAudit() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "crypy-audit-test-"));
  directories.push(dir);
  return { dir, audit: new PersistentAuditLog({ dir }) };
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("Persistent bridge audit log", () => {
  it("creates a verifiable append-only SHA-256 chain", async () => {
    const { audit, dir } = await makeAudit();
    assert.equal((await audit.verify()).ok, true);
    await audit.append({ action: "test.start", target: "/CRYPY/BABY" });
    await audit.append({ action: "test.finish", target: "/CRYPY/BABY", detail: { passed: 1 } });
    const result = await audit.verify();
    assert.equal(result.ok, true);
    assert.equal(result.count, 2);
    const entries = await audit.entries({ limit: 2 });
    assert.equal(entries[0].action, "test.finish");
    const head = JSON.parse(await fs.readFile(path.join(dir, "audit.head"), "utf8"));
    assert.equal(head.seq, 2);
  });

  it("detects altered records and refuses to append to a broken chain", async () => {
    const { audit, dir } = await makeAudit();
    await audit.append({ action: "first" });
    const file = path.join(dir, "audit.jsonl");
    const lines = (await fs.readFile(file, "utf8")).trim().split("\n");
    const entry = JSON.parse(lines[0]);
    entry.action = "altered";
    lines[0] = JSON.stringify(entry);
    await fs.writeFile(file, lines.join("\n") + "\n");
    const result = await audit.verify();
    assert.equal(result.ok, false);
    await assert.rejects(audit.append({ action: "second" }), { code: "AUDIT_CHAIN_BROKEN" });
  });

  it("detects truncation against the persisted head anchor", async () => {
    const { audit, dir } = await makeAudit();
    await audit.append({ action: "first" });
    await audit.append({ action: "second" });
    await fs.writeFile(path.join(dir, "audit.jsonl"), "");
    const result = await audit.verify();
    assert.equal(result.ok, false);
    assert.match(result.reason, /âncora divergente/);
  });
});
