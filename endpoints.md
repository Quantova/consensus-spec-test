# Endpoints

Live endpoints to point the labs at, and the `q_` methods they use.

## Live endpoints

| Network | HTTP JSON-RPC | WebSocket |
| --- | --- | --- |
| Testnet | `https://testnet.quantova.io` | `wss://testnet.quantova.io` |
| Local node | `http://127.0.0.1:9933` | `ws://127.0.0.1:9944` |

Set one in `.env`:

```
QUANTOVA_RPC_URL=https://testnet.quantova.io
```

For the live consensus/finality labs, the most reliable target is a node **you** run (build
instructions are in [`consensus-specs`](https://github.com/Quantova/consensus-specs)), because a
public endpoint may rate-limit or restrict methods. An archive node gives full history.

## Methods the labs use

| Method | Used by | Returns |
| --- | --- | --- |
| `q_blockNumber` | all | Latest height (`QUANTITY`). |
| `q_chainId` | 00 | Chain id. |
| `q_syncing` | 00 | Sync progress, or `false`. |
| `q_getBlockByNumber` | 01, 02, 03, 04, 05 | A block, with tx/author/seal/slot fields. |

The labs also probe for methods that should **not** exist on a post-quantum chain
(`q_ecRecover` and friends) — their absence is the expected result.

> Exact field names and any validator-set / finalized-height methods depend on the node's
> serialization. See [how-the-labs-work.md](how-the-labs-work.md) and the `// ADAPT:` markers in
> the lab files. The full JSON-RPC reference is in the
> [developer documentation](https://quantova.org).
