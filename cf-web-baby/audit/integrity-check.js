import { inspectArtifact } from "../protection/anti-tamper.js";

/**
 * Receives already-fetched artifact bytes and entries from an authenticated
 * manifest. This module intentionally performs no network calls or repairs.
 */
export async function runIntegrityCheck(artifacts, authenticatedManifest) {
  if (!authenticatedManifest?.signatureVerified || !Array.isArray(artifacts)) {
    throw new Error("Authenticated manifest and artifact list are required.");
  }
  const results = [];
  for (const artifact of artifacts) {
    results.push(await inspectArtifact({
      bytes: artifact.bytes,
      manifestEntry: authenticatedManifest.entries?.find(entry => entry.path === artifact.path)
    }));
  }
  return {
    checkedAt: new Date().toISOString(),
    status: results.every(item => item.status === "INTEGRITY_OK") ? "PASS" : "FAIL",
    promotionAllowed: results.length > 0 && results.every(item => item.promotionAllowed),
    results
  };
}
