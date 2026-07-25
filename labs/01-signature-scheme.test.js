// Copyright 2026 Quantova Inc
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Lab 01 Signature Scheme
 *
 * Verifies that signatures on the chain are post quantum by size band, not
 * classical. Quantova signs with ML-DSA-65 (FIPS 204), which is 3309 bytes.
 * Classical signatures such as ECDSA and Ed25519 are about 64 bytes, so a
 * signature in the classical band is a red flag.
 *
 * What this proves is that the inspected signature uses a post quantum scheme by
 * size. What it does NOT prove is correct implementation, parameter choice, or the
 * absence of a classical path elsewhere. See docs/what-the-labs-prove.md.
 *
 * Run  QUANTOVA_GATEWAY_URL=https://testnet.quantova.io npm run lab:signature
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { HAS_ENDPOINT, QuantovaGateway } from "../lib/gateway-client.js";
import { classifySignature, PQ_MIN_BYTES, CLASSICAL_MAX_BYTES } from "../lib/pq-schemes.js";

const skip = !HAS_ENDPOINT;

/**
 * Pull a signature to inspect from a recent block.
 * ADAPT, confirm where the node exposes the signature. It may be the block
 * finality signature, the proposer signature, or a transaction signature.
 * Adjust the extraction below to the get_block response shape.
 */
async function fetchSignatureHex(g) {
  const height = await g.headHeight();
  const block = await g.getBlock(Math.max(0, height - 1));

  // ADAPT, common places a signature may appear. Pick the one the node uses.
  const candidate =
    block?.finality_signature ||
    block?.proposer_signature ||
    block?.signature ||
    block?.transactions?.[0]?.signature;

  if (!candidate) {
    throw new Error(
      "Could not locate a signature in the block response. Open docs/how-the-labs-work.md " +
        "and set the correct field, marked with an ADAPT note in this file."
    );
  }
  return candidate;
}

test("a chain signature is in the post quantum size band", { skip }, async () => {
  const g = new QuantovaGateway();
  const sigHex = await fetchSignatureHex(g);
  const { bytes, classical, postQuantum, nearest } = classifySignature(sigHex);

  console.log(`signature length ${bytes} bytes, nearest post quantum parameter set ${nearest}`);

  assert.ok(
    !classical,
    `signature is ${bytes} bytes, within the classical band at or below ${CLASSICAL_MAX_BYTES}. ` +
      "A post quantum chain must not authenticate with 64 byte ECDSA or Ed25519 signatures."
  );
  assert.ok(
    postQuantum,
    `signature is ${bytes} bytes, below the post quantum minimum of ${PQ_MIN_BYTES}. ` +
      "Quantova signs with ML-DSA-65 at 3309 bytes."
  );
});
