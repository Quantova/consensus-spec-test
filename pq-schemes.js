/**
 * Post-quantum signature scheme reference for the consensus test labs.
 *
 * The single most reliable external signal that a chain is post-quantum is
 * signature SIZE. NIST post-quantum signatures are hundreds to thousands of
 * bytes; classical elliptic-curve signatures (ECDSA secp256k1, Ed25519,
 * sr25519) are ~64 bytes. A lab can therefore classify a signature by its
 * length and flag anything in the classical band.
 *
 * Sizes below are the standardized parameter-set sizes. Quantova selects
 * specific parameter sets; treat these as bands, and confirm the exact deployed
 * sizes against the node and the consensus-specs repository.
 *
 * Quantova address scheme (from the developer documentation): Q-format
 * addresses carry a variant byte — 0 = SPHINCS+, 1 = Falcon, 2 = Dilithium.
 */

// Approximate signature sizes in BYTES, by scheme/parameter set.
export const PQ_SIGNATURE_SIZES = {
  // Falcon (FN-DSA) — smallest PQ signatures; used for validator/finality keys.
  "Falcon-512": 666,
  "Falcon-1024": 1280,
  // CRYSTALS-Dilithium (ML-DSA) — general purpose.
  "ML-DSA-44": 2420,
  "ML-DSA-65": 3309,
  "ML-DSA-87": 4627,
  // SPHINCS+ (SLH-DSA) — hash-based, largest, most conservative.
  "SLH-DSA-128s": 7856,
  "SLH-DSA-128f": 17088,
  "SLH-DSA-192s": 16224,
  "SLH-DSA-256s": 29792,
};

// Classical signatures that must NOT appear in a post-quantum signing path.
export const CLASSICAL_SIGNATURE_SIZES = {
  "ECDSA-secp256k1": 65, // 64-65 bytes (compact); ~70-72 DER
  Ed25519: 64,
  sr25519: 64,
};

// Anything at or below this many bytes is in the classical band — a red flag.
export const CLASSICAL_MAX_BYTES = 80;

// The smallest post-quantum signature we expect (Falcon-512). A real PQ
// signature should be at least this large.
export const PQ_MIN_BYTES = 600;

export const ADDRESS_VARIANTS = { 0: "SPHINCS+", 1: "Falcon", 2: "Dilithium" };

/** Number of bytes in a hex string (with or without 0x prefix). */
export function byteLength(hex) {
  if (typeof hex !== "string") return 0;
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Math.floor(h.length / 2);
}

/**
 * Classify a signature by byte length.
 * Returns { postQuantum: boolean, classical: boolean, bytes, nearest }.
 */
export function classifySignature(sigHex) {
  const bytes = byteLength(sigHex);
  const classical = bytes > 0 && bytes <= CLASSICAL_MAX_BYTES;
  const postQuantum = bytes >= PQ_MIN_BYTES;
  // nearest known PQ parameter set, for reporting
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
  ADDRESS_VARIANTS,
  byteLength,
  classifySignature,
};
