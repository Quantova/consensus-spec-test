# Quantova Consensus Spec Test

Public **test labs** and **live endpoints** for inspecting Quantova's consensus and confirming it
exhibits a post-quantum structure. Point the labs at a Quantova node (the public testnet, or your
own) and they check — over the `q_` JSON-RPC surface — that signatures are post-quantum, that
there is no elliptic-curve recovery path, that slot leadership is deterministic with no VRF, and
that hashing is SHA3-256.

This is a hands-on companion to the [`consensus-specs`](https://github.com/Quantova/consensus-specs)
repository. The specs say how consensus works; these labs let anyone **verify a running node
behaves that way.**

## What the labs check (and what they don't)

These labs are an **inspection harness**, not a security proof. Read
[what-the-labs-prove.md](docs/what-the-labs-prove.md) before drawing conclusions.

- **They confirm** a node *exhibits* the expected post-quantum structure: post-quantum signature
  schemes and sizes, no `ecrecover`/secp256k1 path, deterministic no-VRF leadership, SHA3-256
  hashing, and deterministic finality.
- **They do not** prove the cryptography is unbreakable, that the implementation is free of
  side-channels, or that there is no fallback elsewhere. Those are established by the NIST
  standardization of the underlying schemes and by independent audit — not by a connectivity
  test. The labs are evidence, not a substitute for audit.

---

## Live endpoints

| Network | HTTP JSON-RPC | WebSocket |
| --- | --- | --- |
| Testnet | `https://testnet.quantova.io` | `wss://testnet.quantova.io` |
| Local node | `http://127.0.0.1:9933` | `ws://127.0.0.1:9944` |

Free **TQTOV** for testnet is available from the faucet (see https://quantova.org). The full
endpoint and method reference is in [docs/endpoints.md](docs/endpoints.md).

--- # Consensus

## Quickstart

```bash
git clone https://github.com/Quantova/consensus-spec-test.git
cd consensus-spec-test
npm install            # only Node's built-in test runner is required to run the offline labs

# point the labs at a node
cp .env.example .env
# set QUANTOVA_RPC_URL=https://testnet.quantova.io  (or your node)

# run every lab
npm test

# or run one lab
npm run lab:signature
```

Labs that need a node **skip cleanly** when `QUANTOVA_RPC_URL` is unset, so `npm test` passes
offline and runs the self-verifying checks (for example, the SHA3-256 known-answer tests). Set
the endpoint to run the live checks.

---

## The labs

| # | Lab | What it verifies |
| --- | --- | --- |
| 00 | [Connectivity](labs/00-connectivity.test.js) | The node is reachable, synced, and reports a chain id and height. |
| 01 | [Signature Scheme](labs/01-signature-scheme.test.js) | Signatures match a post-quantum scheme (Dilithium / Falcon / SPHINCS+) by size band — not a 64-byte classical signature. |
| 02 | [No Elliptic Curve](labs/02-no-elliptic-curve.test.js) | Addresses are Q-format, scheme variant is post-quantum, and there is no `ecrecover`/secp256k1 path. |
| 03 | [No-VRF Leadership](labs/03-no-vrf-leadership.test.js) | Block authorship follows the deterministic round-robin schedule — no per-slot random draw. |
| 04 | [SHA3 Hashing](labs/04-sha3-hashing.test.js) | Hashes are 32-byte SHA3-256; includes self-verifying known-answer tests. |
| 05 | [Deterministic Finality](labs/05-deterministic-finality.test.js) | Finalized blocks do not reorg and finality lag stays bounded. |

Shared helpers live in [`lib/`](lib/rpc-client.js): a `q_` JSON-RPC client and the post-quantum
scheme reference.

## Documentation

| Doc | Contents |
| --- | --- |
| [How the labs work](docs/how-the-labs-work.md) | The verification approach and how to adapt a lab to the node's exact responses. |
| [What the labs prove](docs/what-the-labs-prove.md) | The honest scope: inspection vs. proof. Read this. |
| [Endpoints](docs/endpoints.md) | Live endpoints and the `q_` methods the labs use. |

---

## A note on adapting the labs

The labs are written against the documented Quantova RPC surface, but the **exact field names and
byte layout in a node's responses are confirmed against the running node.** Where a lab depends on
a specific response shape (for example, where a block records its slot, author, or signature),
that point is marked in the code with a `// ADAPT:` comment. Confirm those against the node you
test, then the live checks run.

## Related repositories

| Repository | Purpose |
| --- | --- |
| [consensus-specs](https://github.com/Quantova/consensus-specs) | The normative consensus specification these labs test against. |
| [developer-content](https://github.com/Quantova/developer-content) | Developer documentation, including the full JSON-RPC reference. |
| [security-documentation-repository](https://github.com/Quantova/security-documentation-repository) | Security policy and bug bounty. |

## License
## > USA Quantova Inc Owners of IP 
© 2026 Quantova Inc. See [LICENSE.md](LICENSE.md). These labs are provided for inspection and
educational use and are not a security audit, a guarantee, or financial advice.
