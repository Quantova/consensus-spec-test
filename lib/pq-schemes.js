// Copyright 2026 Quantova Inc
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Post quantum signature reference for the QORUS verification labs.
 *
 * The most reliable external signal that a chain is post quantum is signature
 * size. NIST post quantum signatures are hundreds to thousands of bytes, while
 * classical elliptic curve signatures such as ECDSA secp256k1 and Ed25519 are
 * about 64 bytes. A lab can classify a signature by its byte length and flag
 * anything in the classical band.
 *
 * Quantova signs with ML-DSA-65 (FIPS 204) across transactions and QORUS
 * finality, and Q-Crypto also carries SLH-DSA (FIPS 205) for hash based
 * signatures. There is no elliptic curve and no classical public key
 * cryptography anywhere in the chain. Treat the sizes below as bands and
 * confirm the exact deployed sizes against the node and the consensus-specs
 * repository.
 */

// Approximate signature sizes in bytes, by scheme and parameter set.
export const PQ_SIGNATURE_SIZES = {
  // ML-DSA, FIPS 204. ML-DSA-65 is the primary Quantova signature.
  "ML-DSA-44": 2420,
  "ML-DSA-65": 3309,
  "ML-DSA-87": 4627,
  // SLH-DSA, FIPS 205. Hash based and conservative.
  "SLH-DSA-128s": 7856,
  "SLH-DSA-128f": 17088,
  "SLH-DSA-192s": 16224,
  "SLH-DSA-256s": 29792,
};

// Classical signatures that must not appear in a post quantum signing path.
export const CLASSICAL_SIGNATURE_SIZES = {
  "ECDSA-secp256k1": 65,
  Ed25519: 64,
};

// Anything at or below this many bytes is in the classical band, a red flag.
export const CLASSICAL_MAX_BYTES = 80;

// The smallest post quantum signature we expect, ML-DSA-44 at 2420 bytes, with
// headroom. A real post quantum signature is at least this large.
export const PQ_MIN_BYTES = 2000;

/** Number of bytes in a hex string, with or without a leading 0x. */
export function byteLength(hex) {
  if (typeof hex !== "string") return 0;
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Math.floor(h.length / 2);
}

/**
 * Classify a signature by byte length.
 * Returns { bytes, classical, postQuantum, nearest }.
 */
export function classifySignature(sigHex) {
  const bytes = byteLength(sigHex);
  const classical = bytes > 0 && bytes <= CLASSICAL_MAX_BYTES;
  const postQuantum = bytes >= PQ_MIN_BYTES;
  let nearest = null;
  let best = Infinity;
  for (const [name, size] of Object.entries(PQ_SIGNATURE_SIZES)) {
    const d = Math.abs(size - bytes);
    if (d < best) {
      best = d;
      nearest = name;
    }
  }
  return { bytes, classical, postQuantum, nearest };
}

export default {
  PQ_SIGNATURE_SIZES,
  CLASSICAL_SIGNATURE_SIZES,
  CLASSICAL_MAX_BYTES,
  PQ_MIN_BYTES,
  byteLength,
  classifySignature,
};
