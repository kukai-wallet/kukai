import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../../environments/environment';
import { Indexer } from '../indexer.service';
import * as cryptob from 'crypto-browserify';
import { WalletObject, Activity } from '../../wallet/wallet';
import assert from 'assert';

interface TokenMetadata {
  name: string;
  tokenType: 'FA2' | 'FA1.2';
  decimals: number;
  symbol?: string;
  description?: string;
  displayUri?: string;
  thumbnailUri?: string;
  category?: string;
  isTransferable?: boolean;
  shouldPreferSymbol?: boolean;
  isBooleanAmount?: boolean;
  series?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TzktService implements Indexer {
  readonly network = CONSTANTS.NETWORK.replace('edonet', 'edo2net');
  public readonly bcd = 'https://api.better-call.dev/v1';
  readonly BCD_TOKEN_QUERY_SIZE = 10;
  constructor() { }
  async getContractAddresses(pkh: string): Promise<any> {
    return fetch(`https://api.${this.network}.tzkt.io/v1/operations/originations?contractManager=${pkh}`)
      .then(response => response.json())
      .then(data => data.map((op: any) => {
        return (op?.status === 'applied' && op?.originatedContract?.kind === 'delegator_contract') ? op.originatedContract.address : '';
      }).filter((address: string) => address.length));
  }
  async accountInfo(address: string, knownTokenIds: string[] = []): Promise<any> {
    const tokens = [];
    const unknownTokenIds = [];

    const aryTokens = await this.getTokenBalancesUsingPromiseAll(address);

    return fetch(`${this.bcd}/account/${this.network}/${address}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          // inject aryTokens result back into where tokens property used to be
          data.tokens = aryTokens;
          if (data?.tokens?.length) {
            for (const token of data.tokens) {
              tokens.push(token);
              if (!knownTokenIds.includes(`${token.contract}:${token.token_id}`)) {
                unknownTokenIds.push(`${token.contract}:${token.token_id}`);
              }
            }
          }
          tokens.sort(
            function (a: any, b: any) {
              if (`${a.contract}:${a.token_id}` < `${b.contract}:${b.token_id}`) {
                return -1;
              } else {
                return 1;
              }
            }
          );
          const payload: string =
            (data.balance ? data.balance : '') +
            (data.last_action ? data.last_action : '') +
            (tokens ? JSON.stringify(tokens) : '');
          const input = Buffer.from(payload);
          const hash = cryptob.createHash('md5').update(input, 'base64').digest('hex');
          if (payload && (payload !== '0001-01-01T00:00:00Z[]') && payload !== '[]') {
            return { counter: hash, unknownTokenIds, tokens };
          }
        }
        return { counter: '', unknownTokenIds, tokens };
      });
  }
  async getOperations(address: string, knownTokenIds: string[] = [], wallet: WalletObject): Promise<any> {
    const ops = await fetch(`https://api.${this.network}.tzkt.io/v1/accounts/${address}/operations?limit=20&type=delegation,origination,transaction`)
      .then(response => response.json())
      .then(data => data.map(op => {
        if (!(op.hasInternals && wallet.getAccount(op.target.address)) && op.status === 'applied') {
          let destination = { address: '' };
          let amount = '0';
          let entrypoint = '';
          switch (op.type) {
            case 'transaction':
              if ((address !== op.target.address &&
                address !== op.sender.address)) {
                return null;
              }
              destination = op.target;
              amount = op.amount.toString();
              entrypoint = this.extractEntrypoint(op);
              break;
            case 'delegation':
              if (address !== op.sender.address) {
                return null;
              }
              destination = op.newDelegate ? op.newDelegate : { address: '' };
              amount = '0';
              break;
            case 'origination':
              destination = op.originatedContract;
              if (op.contractBalance) {
                amount = op.contractBalance.toString();
              }
              break;
            default:
              console.log(`Ignoring kind ${op.type}`);
              return null;
          }
          const activity: Activity = {
            type: op.type,
            block: op.block,
            status: 1,
            amount,
            source: op.sender,
            destination,
            hash: op.hash,
            timestamp: (new Date(op.timestamp)).getTime(),
            entrypoint
          };
          return activity;
        }
      }).filter(obj => obj));
    const unknownTokenIds: string[] = [];
    const tokenTxs = await fetch(`${this.bcd}/tokens/${this.network}/transfers/${address}?max=20&start=0`)
      .then(response => response.json())
      .then(data => data.transfers.map(tx => {
        const tokenId = `${tx.contract}:${tx.token_id}`;
        if (tx.contract && tokenId && tx.status === 'applied') {
          if (!knownTokenIds.includes(tokenId)) {
            unknownTokenIds.push(tokenId);
          }
          const source: any = { address: tx.from };
          if (tx.from === '' && tx.contract) {
            source.address = tx.contract;
            if (tx.alias) {
              source.alias = tx.alias;
            }
          }
          const index = ops.findIndex((op: any) => op.hash === tx.hash);
          if (index !== -1) {
            ops.splice(index, 1); // Hide token transfer invokation
          }
          const activity: Activity = {
            type: 'transaction',
            block: '',
            status: 1,
            amount: tx.amount,
            tokenId,
            source,
            destination: { address: tx.to },
            hash: tx.hash,
            timestamp: (new Date(tx.timestamp)).getTime()
          };
          return activity;
        } else {
          return null;
        }
      }).filter(obj => obj));
    const operations = ops.concat(tokenTxs).sort(
      function (a: any, b: any) {
        return b.timestamp - a.timestamp;
      }
    );
    return { operations, unknownTokenIds };
  }
  private extractEntrypoint(op: any): string {
    try {
      if (op.parameters) {
        const entrypoint = op.parameters.match(/\{\"entrypoint\":\"[^\"]*/g)?.map(i => {
          return i.slice(15);
        });
        if (entrypoint !== null && entrypoint.length) {
          return entrypoint[0];
        }
      }
    } catch (e) {
      console.log(e);
    }
    return '';
  }
  async getTokenMetadata(contractAddress, id): Promise<TokenMetadata> {
    const tokenKind = fetch(`${this.bcd}/contract/${this.network}/${contractAddress}`)
      .then(response => response.json())
      .then(data => {
        if (data?.tags?.includes('fa2')) {
          return 'FA2';
        } else if (data?.tags.includes('fa1-2')) {
          return 'FA1.2';
        }
        return null;
      }).catch(e => {
        return null;
      });
    const tokenMetadata = fetch(`${this.bcd}/contract/${this.network}/${contractAddress}/tokens?token_id=${id}&offset=0`)
      .then(response => response.json())
      .then(async datas => {
        const keys = [
          { key: 'name', type: 'string' },
          { key: 'decimals', type: 'number' },
          { key: 'symbol', type: 'string' },
          { key: 'description', type: 'string' },
          { key: 'displayUri', type: 'string' },
          { key: 'thumbnailUri', type: 'string' },
          { key: 'isTransferable', type: 'boolean' },
          { key: 'shouldPreferSymbol', type: 'boolean' },
          { key: 'isBooleanAmount', type: 'boolean' },
          { key: 'series', type: 'string' }
        ];
        // should always be 1
        assert(datas.length === 1, `cannot find token_id ${id} for contract: ${contractAddress}`);
        for (const data of datas) {
          if (data?.token_id === Number(id)) {
            // possible snake_case to camelCase conversion; depending on future BCD updates
            mutableConvertObjectPropertiesSnakeToCamel(data);
            const rawData = JSON.parse(JSON.stringify(data));
            this.flattern(data);
            const metadata: any = {};
            for (const a of keys) {
              if (typeof data[a.key] === a.type) {
                metadata[a.key] = data[a.key];
              }
            }
            if (metadata.displayUri) {
              metadata.displayUri = await this.uriToUrl(metadata.displayUri);
            }
            if (metadata.thumbnailUri) {
              metadata.thumbnailUri = await this.uriToUrl(metadata.thumbnailUri);
            }
            try { // Exceptions
              if (metadata?.isBooleanAmount === undefined && typeof data?.isBooleanAmount === 'string' && data?.isBooleanAmount === 'true') { // mandala
                metadata.isBooleanAmount = true;
              }
              if (!metadata.displayUri && data?.symbol === 'OBJKT') { // hicetnunc
                if (['image/png', 'image/jpg', 'image/jpeg'].includes(rawData.formats[0].mimeType)) {
                  metadata.displayUri = await this.uriToUrl(rawData.formats[0].uri);
                }
              }
            } catch (e) { }
            return metadata;
          }
        }
        console.log(`No token metadata found for ${contractAddress}:${id}`);
        return {};
      }).catch(e => {
        return {};
      });
    const ans = await Promise.all([tokenMetadata, tokenKind])
      .then(res => {
        const merged: any = { ...res[0] };
        if (!merged.tokenType && res[1]) {
          merged.tokenType = res[1];
        }
        return merged;
      });
    return ans ? ans : null;
  }
  private flattern(obj: any): any {
    const keys = Object.keys(obj);
    for (const key of keys) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const childKeys = Object.keys(obj[key]);
        for (const childKey of childKeys) {
          if (typeof obj[childKey] === 'undefined' && typeof obj[key][childKey] !== 'object') {
            obj[childKey] = obj[key][childKey];
          }
        }
        delete obj[key];
      }
    }
  }
  async uriToUrl(uri: string): Promise<string> {
    if (!uri || uri.length < 8) {
      return '';
    }
    let url = '';
    if (uri.startsWith('ipfs://')) {
      url = `https://cloudflare-ipfs.com/ipfs/${uri.slice(7)}`;
    } else if (uri.startsWith('https://')) {
      url = uri;
    } else if (!CONSTANTS.MAINNET && (uri.startsWith('http://localhost') || uri.startsWith('http://127.0.0.1'))) {
      url = uri;
    }
    const cacheUrl = await this.fetchApi(`https://www.tezos.help/api/img-proxy/?url=${url}`);
    return cacheUrl ? cacheUrl : '';
  }
  async fetchApi(url: string): Promise<any> {
    return fetch(url)
      .then(response => response.json())
      .then(data => data);
  }
  async getTokenBalancesUsingPromiseAll(address: string) {
    // get total number of tokens
    const tokenCount = await (await fetch(`${this.bcd}/account/${this.network}/${address}/count`)).json();
    const tokenTotal = Object.keys(tokenCount).map(key => tokenCount[key]).reduce((a, b) => a + b, 0);

    // Use Promise.All to get all token balances
    const querySizeMax = this.BCD_TOKEN_QUERY_SIZE ?? 10;
    const totalPromises = Math.floor(tokenTotal / querySizeMax) + Number((tokenTotal % querySizeMax) !== 0);
    const aryTokenFetchUrl: Promise<Response>[] = [];
    for (let i = 0; i < totalPromises; i++) {
      const url = `${this.bcd}/account/${this.network}/${address}/token_balances?max=${querySizeMax}&offset=${querySizeMax * i}`;
      aryTokenFetchUrl.push(fetch(url));
    }
    const aryTokenResults = await Promise.all(aryTokenFetchUrl);
    const aryTokenBalances = await Promise.all(aryTokenResults.map(r => r.json()));
    const aryTokens = [].concat(...aryTokenBalances.map(t => t.balances));
    return aryTokens;
  }
}

export function mutableConvertObjectPropertiesSnakeToCamel(data: Object) {
  for (const key in data) {
    if (key.indexOf('_') !== -1) {
      const aryCamelKey = [];
      for (let i = 0; i < key.length; i++) {
        const char = key.charAt(i);
        if (char === '_') {
          aryCamelKey.push(key.charAt(i + 1).toUpperCase());
          i++;
        } else {
          aryCamelKey.push(char);
        }
      }
      const camelKey = aryCamelKey.join('');
      if (!data.hasOwnProperty(camelKey)) {
        data[camelKey] = data[key];
      }
    }
  }
}
