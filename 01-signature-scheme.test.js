/**
 * Lab 01 — Signature Scheme
 *
 * Verifies that signatures in the chain are POST-QUANTUM by size band, not
 * classical. NIST PQ signatures (Falcon, Dilithium, SPHINCS+) are hundreds to
 * thousands of bytes; classical signatures (ECDSA/Ed25519/sr25519) are ~64
 * bytes. A signature in the classical band is a red flag.
 *
 * What this proves: the inspected signature uses a post-quantum scheme.
 * What it does NOT prove: correct implementation, parameter choice, or the
 * absence of a classical path elsewhere. See docs/what-the-labs-prove.md.
 *
 * Run:  QUANTOVA_RPC_URL=https://testnet.quantova.io npm run lab:signature
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { HAS_ENDPOINT, QuantovaClient } from "../lib/rpc-client.js";
import { classifySignature, PQ_MIN_BYTES, CLASSICAL_MAX_BYTES } from "../lib/pq-schemes.js";

const skip = !HAS_ENDPOINT;

/**
 * Pull a signature to inspect from a recent block.
 * ADAPT: confirm where the node exposes the signature — a block's seal/author
 * signature, or a transaction's signature field. Adjust the extraction below to
 * the node's actual response shape.
 */
async function fetchSignatureHex(client) {
  const height = await client.blockNumber();
  const block = await client.blockByNumber(Math.max(0, height - 1), true);

  // ADAPT: common places a signature may appear. Pick the one the node uses.
  const candidate =
    block?.seal ||
    block?.signature ||
    block?.author?.signature ||
    block?.transactions?.[0]?.signature ||
    block?.extrinsics?.[0]?.signature;

  if (!candidate) {
    throw new Error(
      "Could not locate a signature in the block response. Open docs/how-the-labs-work.md " +
        "and set the correct field (look for `// ADAPT:` in this file)."
    );
  }
  return candidate;
}

test("a chain signature is in the post-quantum size band", { skip }, async () => {
  const c = new QuantovaClient();
  const sigHex = await fetchSignatureHex(c);
  const { bytes, classical, postQuantum, nearest } = classifySignature(sigHex);

  console.log(`signature length: ${bytes} bytes; nearest PQ parameter set: ${nearest}`);

  assert.ok(
    !classical,
    `signature is ${bytes} bytes — within the classical band (<= ${CLASSICAL_MAX_BYTES}). ` +
      "A post-quantum chain must not authenticate with ~64-byte ECDSA/Ed25519 signatures."
  );
  assert.ok(
    postQuantum,
    `signature is ${bytes} bytes — below the post-quantum minimum (${PQ_MIN_BYTES}). ` +
      "Expected Falcon/Dilithium/SPHINCS+ sizes."
  );
});
