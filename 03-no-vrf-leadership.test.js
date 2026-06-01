/**
 * Lab 03 — No-VRF Leadership
 *
 * The defining consensus property: slot leadership is DETERMINISTIC round-robin
 * with no VRF. The author of each slot is a pure function of the active
 * validator order and the slot index:
 *
 *     slot_author(slot) = active_validators[ slot mod len(active_validators) ]
 *
 * If authorship across a run of consecutive blocks matches this schedule, there
 * is no per-slot random draw — i.e. no VRF in leader election. A VRF would make
 * the author unpredictable from the public validator order alone.
 *
 * What this proves: leadership is deterministic and predictable (no VRF in the
 * election path). What it does NOT prove: anything about other randomness in
 * the protocol. See docs/what-the-labs-prove.md.
 *
 * Run:  QUANTOVA_RPC_URL=https://testnet.quantova.io npm run lab:no-vrf
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { HAS_ENDPOINT, QuantovaClient } from "../lib/rpc-client.js";

const skip = !HAS_ENDPOINT;

/**
 * Fetch the ordered active validator set.
 * ADAPT: confirm the method/field the node uses to expose the active set
 * (for example a session/validators query). Return an ordered array of ids.
 */
async function fetchActiveValidators(client) {
  // ADAPT: replace with the node's actual call for the active validator set.
  const set =
    (await client.call("q_getValidators", []).catch(() => null)) ||
    (await client.call("session_validators", []).catch(() => null));
  if (!Array.isArray(set) || set.length === 0) {
    throw new Error(
      "Could not fetch the active validator set. Set the correct method in this file " +
        "(see `// ADAPT:`) per docs/how-the-labs-work.md."
    );
  }
  return set;
}

/**
 * For a block, return { slot, author }.
 * ADAPT: confirm where the block records its slot and author.
 */
function slotAndAuthor(block) {
  const slot = block?.slot ?? block?.header?.slot ?? block?.number;
  const authorRaw = block?.author ?? block?.validator ?? block?.header?.author;
  const author = typeof authorRaw === "string" ? authorRaw : authorRaw?.address || authorRaw?.id;
  return { slot: typeof slot === "string" ? parseInt(slot, 16) : slot, author };
}

test("block authorship follows the deterministic round-robin schedule", { skip }, async () => {
  const c = new QuantovaClient();
  const validators = await fetchActiveValidators(c);
  const n = validators.length;

  const head = await c.blockNumber();
  const SAMPLE = 12;
  let matched = 0;
  let checked = 0;

  for (let h = Math.max(0, head - SAMPLE); h < head; h++) {
    const block = await c.blockByNumber(h, false);
    const { slot, author } = slotAndAuthor(block);
    if (slot === undefined || author === undefined) continue;
    const expected = validators[slot % n];
    checked++;
    if (expected === author) matched++;
    else console.warn(`slot ${slot}: author ${author} != schedule ${expected}`);
  }

  assert.ok(checked > 0, "no blocks could be inspected; check the ADAPT fields");
  assert.equal(
    matched,
    checked,
    `${matched}/${checked} blocks matched the deterministic schedule. ` +
      "A mismatch suggests authorship is not pure round-robin (or the ADAPT fields are wrong)."
  );
  console.log(`deterministic leadership confirmed across ${checked} consecutive blocks`);
});
