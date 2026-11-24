import test from "node:test";
import assert from "node:assert/strict";
import { evaluateChange } from "../protection/change-guard.js";

test("rejects invalid and traversal paths", () => {
  assert.equal(evaluateChange({ path: "../secret", protectedPaths:["cf-web-baby/"] }).reason, "INVALID_PATH");
  assert.equal(evaluateChange({ path: "/etc/passwd", protectedPaths:["/etc/"] }).reason, "INVALID_PATH");
});

test("rejects paths outside protected scope", () => {
  assert.equal(evaluateChange({ path:"index.html", protectedPaths:["cf-web-baby/"] }).reason, "PATH_NOT_IN_PROTECTED_SCOPE");
});

test("fails closed when trust chain is missing", () => {
  const result = evaluateChange({
    path:"cf-web-baby/config/security-policy.json",
    protectedPaths:["cf-web-baby/"],
    manifestVerified:false,
    signatureVerified:false,
    approvals:3
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "TRUST_CHAIN_NOT_VERIFIED");
});

test("requires human approval", () => {
  const result = evaluateChange({
    path:"cf-web-baby/config/security-policy.json",
    protectedPaths:["cf-web-baby/"],
    manifestVerified:true,
    signatureVerified:true,
    approvals:0,
    requiredApprovals:1
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "APPROVAL_REQUIRED");
});

test("allows only when every gate passes", () => {
  const result = evaluateChange({
    path:"cf-web-baby/config/security-policy.json",
    protectedPaths:["cf-web-baby/"],
    manifestVerified:true,
    signatureVerified:true,
    approvals:1,
    requiredApprovals:1
  });
  assert.deepEqual(result, { allowed:true, reason:"ALL_GATES_PASSED" });
});
