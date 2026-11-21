/**
 * SHA-256 integrity helpers. Browser-compatible Web Crypto API.
 * Hashes are useful only when expected values come from an authenticated manifest.
 */
export async function sha256Hex(input) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API unavailable; refusing insecure fallback.");
  }
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function matchesSha256(input, expectedHex) {
  if (!/^[a-f0-9]{64}$/i.test(expectedHex || "")) {
    throw new TypeError("Expected SHA-256 must be 64 hexadecimal characters.");
  }
  const actual = await sha256Hex(input);
  return actual.toLowerCase() === expectedHex.toLowerCase();
}
