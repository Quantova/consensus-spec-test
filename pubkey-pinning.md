# Public-Key Pinning — closing the address second-preimage margin

**Status:** implemented (runtime + `pallet-revive` qvm wrapper). **Compatibility:** preserves 20-byte
H160 addresses, `Q1…` branding, Solidity/QVM contracts, and the EVM bridges. **No SDK/npm change
is required** for clients (existing `qweb3.js`/`.py`/`.rs` and `@quantova/api` keep working).

## The gap it closes

Quantova is post-quantum across signatures (Falcon/Dilithium/SPHINCS+), BABE block production,
GRANDPA finality, and the encrypted mempool (ML-KEM + Shamir). The one weaker spot was the
**account address**: it is `SHA3-256(public_key)` branded `0x40` and **truncated to 20 bytes
(160 bits)** for EVM/Solidity compatibility.

Hashes lose half their bits to Grover, so the address has only **~80-bit second-preimage
resistance under a quantum attacker**. Without pinning, the runtime accepted *any* public key that
(a) produced a valid signature and (b) hashed to the signer's 20-byte address — so a quantum
adversary could, in principle, grind a *different* key that collides on a victim's address
(~2⁸⁰ work) and spend the victim's funds (e.g. via `balances.transfer`).

## What pinning does

The runtime now records the **exact key an account first signs with** and binds the account to it:

- **First use:** the 32-byte `SHA3-256(public_key)` is written to `pallet-address-guard::PinnedKey`.
- **Every later transaction:** the presented key's hash must equal the pinned hash. A *different*
  key — even one that collides on the 20-byte address — is **rejected** (`InvalidTransaction::BadProof`).

We store the **32-byte hash, never the 897-byte Falcon key**, so state growth is ~32 bytes per
active account.

## Both transaction paths are covered

| Path | Where pinning runs |
|---|---|
| QVM / contract txns (`q_transact`) | `runtime/src/qvm_tx.rs` — after `verify_and_recover_signer` |
| Native pallet txns (transfers, governance, faucet, QNS …) | `pallet-revive` qvm `check()` → `QExtra::pin_check` → runtime impl in `qvm_tx.rs` |

The native path is essential: a thief would move funds with `balances.transfer`, which is a native
extrinsic. Both paths perform a **read-and-reject** (safe in transaction-pool validation) and a
**first-use write** (persists only when the extrinsic is actually included; discarded during pool
validation).

The `pallet-revive` hook (`QExtra::pin_check`) defaults to a **no-op**, so non-Quantova runtimes are
unaffected; only Quantova's runtime opts in.

## What it does NOT change

- 20-byte **H160 addresses** and the **`Q1…`** Bech32m branding — unchanged.
- **Solidity** smart contracts and the **QVM** — unchanged (the address is still 20 bytes).
- The **EVM bridges** — unchanged.
- **Contract / never-signing accounts** are never pinned (they have no key) — handled by construction.
- **Client SDKs** — no change required. Mismatch returns the standard `BadProof`, which every client
  already handles. (Optional later polish: a friendlier error string and a `pinnedKey(account)` reader.)

## Residual and cost

- **Residual:** a brand-new, funded, **never-used** address is still "first-spender-wins" until its
  first transaction — the same model as Bitcoin's pubkey-revealed-on-spend. Pinning protects every
  account from its first legitimate use onward.
- **Cost:** one extra storage read (+ a one-time write on first use) per signed transaction. The
  per-tx post-quantum signature verification already dwarfs a DB read, so the TPS/latency impact is
  negligible; the weight is accounted as `DbWeight::reads_writes` and folded into the fee model.

## Why not widen the address instead

Widening the address to >20 bytes would break Solidity (its `address` type is hard-coded to 20
bytes), the QVM, and the EVM bridges — and it cannot be done forklessly once contracts/tokens are
deployed. Pinning achieves the same security goal while keeping full EVM compatibility, and is
forkless to enable. It should be enabled **early**, before large-scale adoption.

## Tests

`pallets/pallet-address-guard/src/tests.rs`:
- `pubkey_pin_first_use_then_binds` — first use pins; same key accepted; a different (colliding) key
  rejected; `pin_key` never overwrites.
- `pubkey_pin_is_per_account` — pins are isolated per account.
