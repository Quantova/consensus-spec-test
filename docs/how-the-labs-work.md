# How the labs work

Each lab is a small focused check written with the Node built in test runner, so there is no heavy framework to install. A lab connects to the node over the gateway, pulls a small piece of data, and asserts a property of it.

## The verification approach

Lab 00 connectivity checks the node is reachable and reports a node identity, chain params, and a head height, using node_info, head, and chain_params.

Lab 01 signature scheme classifies a signature by byte length. Post quantum signatures are hundreds to thousands of bytes and classical signatures are about 64 bytes.

Lab 02 no elliptic curve checks addresses are Q1 bech32m rather than 20 byte hex, and that no ecrecover method is exposed.

Lab 03 committee sortition checks the validators endpoint returns a committee within the budget from chain_params, and that recent block authors come from the validator registry.

Lab 04 SHA3 hashing runs self verifying known answer tests and checks that a block hash is 32 bytes.

Lab 05 finality stability checks a finalized block does not change hash on re read and that finality lag stays bounded.

## Why signature size is the key signal

The most reliable external signal that a chain is post quantum is signature size. NIST post quantum signatures are large. ML-DSA-65 is about 3309 bytes and SLH-DSA runs from roughly 7.8 to 29 kilobytes, while classical elliptic curve signatures such as ECDSA and Ed25519 are about 64 bytes. A signature in the 64 byte band is a clear red flag, and one in a known post quantum band is strong evidence of a post quantum scheme. The reference bands are in [../lib/pq-schemes.js](../lib/pq-schemes.js).

## Adapting a lab to the node

The labs target the documented gateway, but a node's exact response shape, where it records a block's author, signature, or hash, and which field carries the committee or the finalized height, is confirmed against the running node. Each such point is marked in the code with an ADAPT note. Find those markers, set the correct field for the node you test, and the live checks run.

This is normal. The labs verify properties, and you bind them to the node's encoding once.
