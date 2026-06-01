/**
 * Minimal Quantova q_ JSON-RPC client for the consensus test labs.
 *
 * Every call is a POST to the HTTP endpoint with body
 * { jsonrpc, id, method, params }. Addresses are Q-format strings; numeric
 * results are QUANTITY hex. Block references take a block-number QUANTITY —
 * "latest" is not implemented.
 */

export class QuantovaClient {
  constructor(rpcUrl = process.env.QUANTOVA_RPC_URL) {
    if (!rpcUrl) throw new Error("No RPC URL. Set QUANTOVA_RPC_URL (e.g. https://testnet.quantova.io).");
    this.rpcUrl = rpcUrl;
    this._id = 0;
  }

  async call(method, params = []) {
    const res = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++this._id, method, params }),
    });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
    const { result, error } = await res.json();
    if (error) throw new Error(`RPC error ${error.code}: ${error.message}`);
    return result;
  }

  async blockNumber() {
    return parseInt(await this.call("q_blockNumber"), 16);
  }

  async latestHex() {
    return "0x" + (await this.blockNumber()).toString(16);
  }

  async isSynced() {
    return (await this.call("q_syncing")) === false;
  }

  async chainId() {
    return await this.call("q_chainId");
  }

  /** A block by height, with full transactions when `fullTx` is true. */
  async blockByNumber(height, fullTx = true) {
    const hex = typeof height === "number" ? "0x" + height.toString(16) : height;
    return await this.call("q_getBlockByNumber", [hex, fullTx]);
  }
}

/** True if QUANTOVA_RPC_URL is set, so labs can skip live checks cleanly when it isn't. */
export const HAS_ENDPOINT = Boolean(process.env.QUANTOVA_RPC_URL);

export default QuantovaClient;
