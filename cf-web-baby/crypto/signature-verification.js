/**
 * Verifies a detached ECDSA P-256 / SHA-256 signature.
 * The JWK must be supplied by a trusted out-of-band configuration.
 * Never load the trust anchor from an unverified file in this repository.
 */
function fromBase64Url(value) {
  if (typeof atob !== "function") throw new Error("Base64 decoder unavailable.");
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}

export async function verifyManifestSignature({ canonicalPayload, signatureBase64Url, trustedPublicJwk }) {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto API unavailable.");
  if (!trustedPublicJwk || trustedPublicJwk.kty !== "EC" || trustedPublicJwk.crv !== "P-256") {
    throw new TypeError("A trusted P-256 public JWK is required.");
  }
  if (!signatureBase64Url) throw new TypeError("Detached signature is required.");
  const key = await crypto.subtle.importKey(
    "jwk",
    trustedPublicJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );
  const signature = fromBase64Url(signatureBase64Url);
  const data = new TextEncoder().encode(canonicalPayload);
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, signature, data);
}
