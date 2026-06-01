# What the Labs Prove (and What They Don't)

Read this before citing these labs as evidence of anything. Being precise here is the difference
between a credible verification tool and an over-claim.

## What the labs DO establish

When run against a node, the labs provide **evidence that the node exhibits a post-quantum
structure**:

- Signatures in the inspected path are post-quantum by size, not classical 64-byte signatures.
- The account/address layer is Q-format, with a post-quantum scheme variant, and there is no
  `ecrecover`/secp256k1 recovery path.
- Block authorship is deterministic round-robin — no per-slot VRF in leader election.
- Hashing is SHA3-256 (32-byte digests), and the lab's own SHA3-256 is correct by known-answer
  test.
- Finalized blocks are stable on the node observed, and finality lag is bounded.

This is meaningful: it is direct, reproducible evidence that the running system behaves the way
the [consensus specification](https://github.com/Quantova/consensus-specs) says.

## What the labs DO NOT establish

These labs are an **inspection harness**, not a proof of security. They do not show:

- **That the cryptography is unbreakable.** The security of Dilithium, Falcon, and SPHINCS+ rests
  on their NIST standardization and the underlying hard problems — not on a connectivity test.
- **That the implementation is correct.** Correct parameter sets, constant-time behavior, absence
  of side-channels, and correct serialization are established by **independent audit**, not here.
- **That no classical path exists anywhere.** The labs inspect specific paths; they cannot prove
  a negative across the whole system.
- **That finality is safe under adversarial conditions.** Lab 05 observes stability over a
  sampling window on one node; it is not a formal safety analysis.

## The honest summary

> These labs let anyone independently confirm that a Quantova node **presents** the expected
> post-quantum behavior. They complement — and do not replace — the NIST standardization of the
> schemes and independent security audits (see the
> [security documentation](https://github.com/Quantova/security-documentation-repository)).

Treating the labs as evidence is correct. Treating them as a security proof is not.
