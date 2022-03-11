// https://gitlab.com/tezos-domains/client
import { TezosToolkit } from '@taquito/taquito';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { Tzip16Module } from '@taquito/tzip16';
import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../environments/environment';
import { SupportedNetworkType } from '@tezos-domains/core';

@Injectable({
  providedIn: 'root'
})
export class TezosDomainsService {
  private client: TaquitoTezosDomainsClient;
  private queue = [];
  pending = false;
  constructor() {
    const tezosToolkit = new TezosToolkit(CONSTANTS.NODE_URL);
    tezosToolkit.addExtension(new Tzip16Module());
    const options = { caching: { enabled: false } };
    this.client = new TaquitoTezosDomainsClient({
      tezos: tezosToolkit,
      network: <SupportedNetworkType>CONSTANTS.NETWORK,
      ...options
    });
  }
  async getAddressFromDomain(domain: string) {
    const address = await this.client.resolver.resolveNameToAddress(domain);
    if (!address) {
      return { pkh: '' };
    }
    return { pkh: address };
  }
  async getDomainFromAddress(address: string): Promise<string> {
    if (!this.pending) {
      this.pending = true;
      this.collect();
    }
    return new Promise((resolve, reject) => {
      this.queue.push({ address, resolve, reject });
    });
  }
  async collect() {
    setTimeout(async () => {
      this.pending = false;
      const queue = this.queue;
      this.queue = [];
      const addresses = queue.map((q) => {
        return q.address;
      });
      const items = await this.getDomainFromAddresses(addresses).catch((e) => {
        for (const q of queue) {
          q.reject(e);
          throw e;
        }
      });
      while (queue.length) {
        const promise = queue.shift();
        if (items[promise.address]) {
          promise.resolve(items[promise.address]);
        } else {
          promise.resolve('');
        }
      }
    }, 100);
  }
  async getDomainFromAddresses(addresses: any) {
    const baseUrl = CONSTANTS.MAINNET ? 'https://api.tezos.domains/graphql' : `https://${CONSTANTS.NETWORK}-api.tezos.domains/graphql`;
    const req = {
      query: `{reverseRecords(where: {address: {in: ${JSON.stringify(addresses)}}}) {items {address domain: domain {id, name}}}}`
    };
    const response = await (
      await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
      })
    ).json();
    const r = {};
    for (const item of response.data.reverseRecords.items) {
      if (item?.address && item?.domain?.name) {
        r[item.address] = item.domain.name;
      }
    }
    return r;
  }
}
