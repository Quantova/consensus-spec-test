# How the Labs Work

Each lab is a small, focused check written with Node's built-in test runner (`node:test`), so
there is no heavy test framework to install. A lab connects to the node over the `q_` JSON-RPC
surface, pulls a small piece of data, and asserts a property of it.

## The verification approach

| Lab | Property | How it is checked |
| --- | --- | --- |
| 00 Connectivity | Node reachable & synced | `q_blockNumber`, `q_chainId`, `q_syncing`. |
| 01 Signature Scheme | Signatures are post-quantum | Classify a signature by **byte length**; PQ schemes are hundreds–thousands of bytes, classical ~64. |
| 02 No Elliptic Curve | No EC trust model | Addresses are Q-format (not 20-byte 0x); no `ecrecover` method. |
| 03 No-VRF Leadership | Deterministic leadership | Author of each slot equals `validators[slot mod n]` across consecutive blocks. |
| 04 SHA3 Hashing | SHA3-256 in use | Self-verifying KATs + block hash is 32 bytes. |
| 05 Deterministic Finality | Finalized history is stable | A finalized block does not change hash on re-read; finality lag is bounded. |

## Why signature size is the key signal

The most reliable external signal that a chain is post-quantum is **signature size**. NIST
post-quantum signatures are large — Falcon-512 ~666 bytes, Dilithium (ML-DSA) ~2.4–4.6 KB,
SPHINCS+ (SLH-DSA) ~7.8–29 KB — while classical elliptic-curve signatures (ECDSA, Ed25519,
sr25519) are ~64 bytes. A signature in the ~64-byte band is a clear red flag; one in a known PQ
band is strong evidence of a post-quantum scheme. The reference bands are in
[`../lib/pq-schemes.js`](../lib/pq-schemes.js).

## Adapting a lab to the node

The labs target the documented RPC surface, but a node's exact response shape — where it records
a block's slot, author, signature, or hash, and which method returns the validator set or
finalized height — is confirmed against the running node. Each such point is marked in the code
with a `// ADAPT:` comment. Find those markers, set the correct field or method for the node you
test, and the live checks run.

This is normal: the labs verify *properties*, and you bind them to the node's *encoding* once.
