import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { DropboxAdapter, normalizeBabyPath } from "../src/dropbox.js";

const temporaryDirectories = [];

async function makeAdapter({ now = () => 1795300000000 } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "crypy-dropbox-test-"));
  temporaryDirectories.push(dir);
  const calls = [];
  const env = {
    DROPBOX_APP_KEY: "test-app-key",
    DROPBOX_APP_SECRET: "test-app-secret",
    DROPBOX_REDIRECT_URI: "https://bridge.example/oauth/dropbox/callback",
    DROPBOX_TOKEN_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
    DROPBOX_DATA_DIR: dir,
    DROPBOX_SCOPES: "files.metadata.read files.content.write"
  };
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("/oauth2/token")) {
      const form = new URLSearchParams(options.body);
      if (form.get("grant_type") === "authorization_code") {
        return new Response(JSON.stringify({
          access_token: "access-token-secret",
          refresh_token: "refresh-token-secret",
          expires_in: 14400,
          account_id: "dbid:test",
          scope: env.DROPBOX_SCOPES
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({
        access_token: "refreshed-access-token",
        expires_in: 14400
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (String(url).endsWith("/files/list_folder")) {
      return new Response(JSON.stringify({
        entries: [{ name: "BACKUP", ".tag": "folder", path_display: "/CRYPY/BABY/BACKUP" }],
        cursor: "cursor-test",
        has_more: false
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (String(url).endsWith("/files/upload")) {
      const args = JSON.parse(options.headers["Dropbox-API-Arg"]);
      return new Response(JSON.stringify({
        name: path.posix.basename(args.path),
        path_display: args.path,
        id: "id:test"
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ error_summary: "not_found/test" }), { status: 404 });
  };
  const adapter = new DropboxAdapter({ env, dataDir: dir, fetchImpl, now });
  return { adapter, env, dir, calls, fetchImpl, now };
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((dir) =>
    fs.rm(dir, { recursive: true, force: true })
  ));
});

describe("Dropbox bridge: paths, OAuth PKCE, encrypted token vault and backup", () => {
  it("restricts every Dropbox path to the CRYPY/BABY tree", () => {
    assert.equal(normalizeBabyPath("/CRYPY/BABY"), "/CRYPY/BABY");
    assert.equal(normalizeBabyPath("CRYPY/BABY/BACKUP"), "/CRYPY/BABY/BACKUP");
    assert.throws(() => normalizeBabyPath("/CRYPY/BABY/../private"), { code: "INVALID_PATH" });
    assert.throws(() => normalizeBabyPath("/another-folder"), { code: "PATH_OUTSIDE_BABY" });
    assert.throws(() => normalizeBabyPath("/CRYPY/BABY\\private"), { code: "INVALID_PATH" });
  });

  it("creates an OAuth authorization-code URL with PKCE and offline refresh scope", async () => {
    const { adapter } = await makeAdapter();
    const result = adapter.startAuthorization();
    const url = new URL(result.authorizationUrl);
    assert.equal(url.origin, "https://www.dropbox.com");
    assert.equal(url.searchParams.get("response_type"), "code");
    assert.equal(url.searchParams.get("token_access_type"), "offline");
    assert.equal(url.searchParams.get("code_challenge_method"), "S256");
    assert.ok(url.searchParams.get("code_challenge"));
    assert.ok(url.searchParams.get("state"));
    assert.match(url.searchParams.get("scope"), /files\.metadata\.read/);
  });

  it("exchanges code once, encrypts tokens and uploads backup, manifest and sync log additively", async () => {
    const { adapter, dir, calls } = await makeAdapter();
    const start = adapter.startAuthorization();
    const state = new URL(start.authorizationUrl).searchParams.get("state");
    const completed = await adapter.completeAuthorization({ code: "test-code", state });
    assert.equal(completed.connected, true);

    const tokenFile = await fs.readFile(path.join(dir, "dropbox-token.v1.enc.json"), "utf8");
    assert.equal(tokenFile.includes("refresh-token-secret"), false);
    assert.equal(tokenFile.includes("access-token-secret"), false);
    assert.equal(JSON.parse(tokenFile).algorithm, "aes-256-gcm");

    const listing = await adapter.listFolder("/CRYPY/BABY/MANIFEST");
    assert.equal(listing.entries[0].name, "BACKUP");
    assert.equal(listing.hasMore, false);

    const content = JSON.stringify({ schema: "baby-test", records: [1, 2, 3] });
    const uploaded = await adapter.uploadBackup({ content, label: "teste" });
    assert.equal(uploaded.ok, true);
    assert.equal(uploaded.overwrite, false);
    assert.equal(uploaded.bytes, Buffer.byteLength(content));
    const uploadCalls = calls.filter((call) => call.url.endsWith("/files/upload"));
    assert.equal(uploadCalls.length, 3);
    for (const call of uploadCalls) {
      const args = JSON.parse(call.options.headers["Dropbox-API-Arg"]);
      assert.equal(args.mode, "add");
      assert.equal(args.autorename, false);
      assert.match(args.path, /^\/CRYPY\/BABY\/(BACKUP|MANIFEST|SYNC-LOG)\//);
    }
  });

  it("rejects a replayed OAuth state", async () => {
    const { adapter } = await makeAdapter();
    const start = adapter.startAuthorization();
    const state = new URL(start.authorizationUrl).searchParams.get("state");
    await adapter.completeAuthorization({ code: "test-code", state });
    await assert.rejects(adapter.completeAuthorization({ code: "test-code", state }), { code: "OAUTH_STATE_INVALID" });
  });

  it("rejects expired OAuth state", async () => {
    let currentTime = 1795300000000;
    const { adapter } = await makeAdapter({ now: () => currentTime });
    const start = adapter.startAuthorization();
    const state = new URL(start.authorizationUrl).searchParams.get("state");
    currentTime += 11 * 60 * 1000;
    await assert.rejects(adapter.completeAuthorization({ code: "test-code", state }), { code: "OAUTH_STATE_INVALID" });
  });

  it("refuses invalid or oversized backup payloads", async () => {
    const { adapter } = await makeAdapter();
    await assert.rejects(adapter.uploadBackup({ content: "not-json" }), { code: "BACKUP_NOT_JSON" });
    await assert.rejects(
      adapter.uploadBackup({ content: JSON.stringify({ data: "x".repeat(4 * 1024 * 1024) }) }),
      { code: "BACKUP_SIZE_INVALID" }
    );
  });

  it("does not report connected before OAuth consent", async () => {
    const { adapter } = await makeAdapter();
    assert.equal((await adapter.status()).connected, false);
  });

  it("detects tampering with the encrypted token envelope", async () => {
    const { adapter, dir } = await makeAdapter();
    const start = adapter.startAuthorization();
    const state = new URL(start.authorizationUrl).searchParams.get("state");
    await adapter.completeAuthorization({ code: "test-code", state });
    const tokenPath = path.join(dir, "dropbox-token.v1.enc.json");
    const envelope = JSON.parse(await fs.readFile(tokenPath, "utf8"));
    envelope.ciphertext = Buffer.from("tampered").toString("base64");
    await fs.writeFile(tokenPath, JSON.stringify(envelope));
    await assert.rejects(adapter.listFolder(), { code: "STORE_INTEGRITY_FAILED" });
  });
});
