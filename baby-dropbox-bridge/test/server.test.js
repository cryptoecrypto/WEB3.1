import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createBridgeServer } from "../src/server.js";

describe("Dropbox bridge HTTP security", () => {
  let server;
  let base;
  const token = "bridge-test-token-with-at-least-thirty-two-bytes";
  const allowedOrigin = "https://cryptoecrypto.github.io";
  const audit = {
    async verify() { return { ok: true, count: 2, reason: "cadeia íntegra" }; },
    async entries() { return [{ seq: 2, action: "dropbox.backup.completed" }]; }
  };
  const adapter = {
    async status() { return { configured: false, missing: ["DROPBOX_APP_SECRET"], connected: false }; },
    startAuthorization() { return { authorizationUrl: "https://www.dropbox.com/oauth2/authorize?state=mock" }; },
    async listFolder(value) { return { path: value || "/CRYPY/BABY", entries: [], hasMore: false }; },
    async uploadBackup() { return { ok: true, overwrite: false }; },
    async completeAuthorization() { return { connected: true }; }
  };

  before(async () => {
    const created = createBridgeServer({
      env: {
        NODE_ENV: "test",
        CRYPY_DROPBOX_BRIDGE_TOKEN: token,
        CRYPY_DROPBOX_ALLOWED_ORIGINS: allowedOrigin
      },
      adapter,
      audit
    });
    server = created.server;
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = "http://127.0.0.1:" + server.address().port;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("keeps health public but non-sensitive", async () => {
    const response = await fetch(base + "/health");
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, "crypy-baby-dropbox-bridge");
    assert.equal("variables" in body, false);
  });

  it("requires a server token for every API route", async () => {
    const response = await fetch(base + "/api/dropbox/status");
    assert.equal(response.status, 401);
    assert.equal((await response.json()).code, "AUTH_REQUIRED");
  });

  it("accepts API calls only from an allowed browser origin", async () => {
    const denied = await fetch(base + "/api/dropbox/status", {
      headers: { authorization: "Bearer " + token, origin: "https://evil.example" }
    });
    assert.equal(denied.status, 403);
    const accepted = await fetch(base + "/api/dropbox/status", {
      headers: { authorization: "Bearer " + token, origin: allowedOrigin }
    });
    assert.equal(accepted.status, 200);
  });

  it("exposes only an authenticated, verified audit summary", async () => {
    const response = await fetch(base + "/api/dropbox/audit", {
      headers: { authorization: "Bearer " + token, origin: allowedOrigin }
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.verification.ok, true);
    assert.equal(body.entries[0].action, "dropbox.backup.completed");
  });

  it("supports an allowed preflight and blocks a foreign preflight", async () => {
    const accepted = await fetch(base + "/api/dropbox/status", {
      method: "OPTIONS",
      headers: { origin: allowedOrigin, "access-control-request-method": "POST" }
    });
    assert.equal(accepted.status, 204);
    const denied = await fetch(base + "/api/dropbox/status", {
      method: "OPTIONS",
      headers: { origin: "https://evil.example", "access-control-request-method": "POST" }
    });
    assert.equal(denied.status, 403);
  });

  it("redacts unexpected internal exception details", async () => {
    const failing = createBridgeServer({
      env: { NODE_ENV: "test", CRYPY_DROPBOX_BRIDGE_TOKEN: token, CRYPY_DROPBOX_ALLOWED_ORIGINS: allowedOrigin },
      adapter: { async status() { throw new Error("/data/private/token-file"); } }
    }).server;
    await new Promise((resolve) => failing.listen(0, "127.0.0.1", resolve));
    try {
      const url = "http://127.0.0.1:" + failing.address().port + "/api/dropbox/status";
      const response = await fetch(url, { headers: { authorization: "Bearer " + token } });
      const body = await response.json();
      assert.equal(response.status, 500);
      assert.equal(body.reason, "Erro interno do serviço.");
      assert.equal(JSON.stringify(body).includes("/data/private/token-file"), false);
    } finally {
      await new Promise((resolve) => failing.close(resolve));
    }
  });

  it("refuses to start a production bridge without a strong API token", () => {
    assert.throws(() => createBridgeServer({ env: { NODE_ENV: "production" } }), /pelo menos 32 bytes/);
  });
});
