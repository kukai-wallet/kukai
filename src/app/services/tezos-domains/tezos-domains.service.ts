// https://gitlab.com/tezos-domains/client
import { TezosToolkit } from '@taquito/taquito';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { Tzip16Module } from '@taquito/tzip16';
import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TezosDomainsService {
  private client: TaquitoTezosDomainsClient;
  constructor() {

    const tezosToolkit = new TezosToolkit(CONSTANTS.NODE_URL);
    tezosToolkit.addExtension(new Tzip16Module());
    const options = { caching: { enabled: false } };
    this.client = new TaquitoTezosDomainsClient({
      tezos: tezosToolkit,
      network: <'mainnet' | 'edonet'>CONSTANTS.NETWORK,
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
  async getDomainFromAddress(pkh: string) {
    const domain = await this.client.resolver.resolveAddressToName(pkh);
    return domain;
  }
}
