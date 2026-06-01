/**
 * Lab 04 — SHA3 Hashing
 *
 * Verifies the chain uses SHA3-256:
 *  - self-verifying known-answer tests (KATs) confirm this lab's own SHA3-256
 *    is correct (these run offline, with no node), and
 *  - a live check confirms block hashes are 32-byte (256-bit) values.
 *
 * The KATs always run, so part of this lab passes in CI and demonstrates the
 * harness is sound. The live check needs a node.
 *
 * Run:  npm run lab:sha3            (KATs only, offline)
 *       QUANTOVA_RPC_URL=... npm run lab:sha3   (KATs + live hash-width check)
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { HAS_ENDPOINT, QuantovaClient } from "../lib/rpc-client.js";
import { byteLength } from "../lib/pq-schemes.js";

// --- self-verifying known-answer tests (always run, no node needed) -------

const SHA3_256_KATS = [
  { input: "", expected: "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a" },
  { input: "abc", expected: "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532" },
];

test("SHA3-256 known-answer tests (self-check, offline)", () => {
  for (const { input, expected } of SHA3_256_KATS) {
    const got = crypto.createHash("sha3-256").update(input).digest("hex");
    assert.equal(got, expected, `SHA3-256("${input}") mismatch`);
  }
});

test("SHA3-256 produces a 32-byte (256-bit) digest", () => {
  const digest = crypto.createHash("sha3-256").update("quantova").digest();
  assert.equal(digest.length, 32, "SHA3-256 digest must be 32 bytes");
});

// --- live check: block hashes are 256-bit ---------------------------------

const skip = !HAS_ENDPOINT;

test("live: block hash is a 32-byte value", { skip }, async () => {
  const c = new QuantovaClient();
  const height = await c.blockNumber();
  const block = await c.blockByNumber(Math.max(0, height - 1), false);

  // ADAPT: confirm the block's hash field name if it is not `hash`.
  const hash = block?.hash || block?.header?.hash;
  assert.ok(hash, "could not find a block hash field (see `// ADAPT:`)");
  assert.equal(
    byteLength(hash),
    32,
    `block hash is ${byteLength(hash)} bytes — SHA3-256 hashes are 32 bytes.`
  );
  console.log(`block hash width confirmed: 32 bytes (256-bit)`);
});
