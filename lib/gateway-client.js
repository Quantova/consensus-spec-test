// Copyright 2026 Quantova Inc
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Minimal Quantova gateway client for the QORUS verification labs.
 *
 * The Quantova gateway is a plain HTTP surface. Every call is an HTTP POST to
 * <base>/v1/<method> with a flat JSON body. Addresses are Q1 bech32m strings
 * written with a capital Q. Heights and amounts are plain JSON numbers or
 * decimal strings, not hex quantities.
 *
 * The gateway methods used by the labs are node_info, head, validators,
 * chain_params, get_account, get_transaction, submit_transaction, get_block,
 * supply, get_container, get_storage, and get_events.
 */

export class QuantovaGateway {
  constructor(baseUrl = process.env.QUANTOVA_GATEWAY_URL) {
    if (!baseUrl) {
      throw new Error(
        "No gateway URL. Set QUANTOVA_GATEWAY_URL, for example https://testnet.quantova.io."
      );
    }
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async call(method, body = {}) {
    const res = await fetch(`${this.baseUrl}/v1/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`gateway HTTP ${res.status} on /v1/${method}`);
    const payload = await res.json();
    if (payload && payload.error) {
      throw new Error(`gateway error on /v1/${method} ${payload.error}`);
    }
    return payload;
  }

  nodeInfo() {
    return this.call("node_info");
  }

  chainParams() {
    return this.call("chain_params");
  }

  head() {
    return this.call("head");
  }

  validators() {
    return this.call("validators");
  }

  supply() {
    return this.call("supply");
  }

  getBlock(height) {
    return this.call("get_block", { height });
  }

  getTransaction(hash) {
    return this.call("get_transaction", { hash });
  }

  getAccount(address) {
    return this.call("get_account", { address });
  }

  getContainer(address) {
    return this.call("get_container", { address });
  }

  getEvents(height) {
    return this.call("get_events", { height });
  }

  /** Read the current head height as a number, tolerating a few field shapes. */
  async headHeight() {
    const h = await this.head();
    const raw = h?.height ?? h?.head?.height ?? h?.number;
    if (raw === undefined || raw === null) {
      throw new Error("head response did not carry a height (see the ADAPT note in the lab)");
    }
    return typeof raw === "string" ? parseInt(raw, 10) : raw;
  }
}

/** True when QUANTOVA_GATEWAY_URL is set, so labs skip live checks cleanly when it is not. */
export const HAS_ENDPOINT = Boolean(process.env.QUANTOVA_GATEWAY_URL);

export default QuantovaGateway;
