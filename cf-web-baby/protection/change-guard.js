/**
 * Pure change gate. This does not secure GitHub by itself; enforce equivalent
 * rules with branch protection / required CI checks / CODEOWNERS.
 */
export function evaluateChange({
  path,
  protectedPaths = [],
  manifestVerified = false,
  signatureVerified = false,
  approvals = 0,
  requiredApprovals = 1
}) {
  const normalized = String(path || "").replace(/\\/g, "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || normalized.split("/").includes("..")) {
    return { allowed: false, reason: "INVALID_PATH" };
  }
  const isProtected = protectedPaths.some(item => normalized === item || normalized.startsWith(item.endsWith("/") ? item : item + "/"));
  if (!isProtected) return { allowed: false, reason: "PATH_NOT_IN_PROTECTED_SCOPE" };
  if (!manifestVerified || !signatureVerified) return { allowed: false, reason: "TRUST_CHAIN_NOT_VERIFIED" };
  if (!Number.isInteger(approvals) || approvals < requiredApprovals) {
    return { allowed: false, reason: "APPROVAL_REQUIRED" };
  }
  return { allowed: true, reason: "ALL_GATES_PASSED" };
}
