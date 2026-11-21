import { matchesSha256 } from "../crypto/hash-integrity.js";

/**
 * Compare supplied artifact bytes with an entry from an already-authenticated
 * manifest. Fetching files and authenticating the manifest are caller duties.
 */
export async function inspectArtifact({ bytes, manifestEntry }) {
  if (!manifestEntry || typeof manifestEntry.path !== "string" || typeof manifestEntry.sha256 !== "string") {
    throw new TypeError("A valid authenticated manifest entry is required.");
  }
  const intact = await matchesSha256(bytes, manifestEntry.sha256);
  return {
    path: manifestEntry.path,
    status: intact ? "INTEGRITY_OK" : "INTEGRITY_MISMATCH",
    promotionAllowed: intact,
    action: intact ? "CONTINUE_TO_REVIEW" : "BLOCK_PROMOTION_AND_AUDIT"
  };
}
