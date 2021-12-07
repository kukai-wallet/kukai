import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../../environments/environment';
import { Indexer } from '../indexer.service';
import * as cryptob from 'crypto-browserify';
import { WalletObject, Activity } from '../../wallet/wallet';
import assert from 'assert';
import { Asset, CachedAsset } from '../../token/token.service';
import { TezosToolkit } from '@taquito/taquito';
import { Tzip12Module, tzip12 } from '@taquito/tzip12';
import { Handler, IpfsHttpHandler, MetadataProvider } from '@taquito/tzip16';
import Big from 'big.js';

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
  readonly network = CONSTANTS.NETWORK.replace('hangzhounet', 'hangzhou2net');
  public readonly bcd = 'https://api.better-call.dev/v1';
  public readonly tzkt = `https://api.${this.network}.tzkt.io/v1`;
  readonly BCD_TOKEN_QUERY_SIZE: number = 50;
  tokenKindCache: Record<string, { kind: string, timestamp: number }> = {};
  Tezos: TezosToolkit;
  constructor() {
    this.Tezos = new TezosToolkit(CONSTANTS.NODE_URL);
    const customHandler = new Map<string, Handler>([['ipfs', new IpfsHttpHandler('cloudflare-ipfs.com')]]);
    const customMetadataProvider = new MetadataProvider(customHandler);
    this.Tezos.addExtension(new Tzip12Module(customMetadataProvider));
  }
  async getContractAddresses(pkh: string): Promise<any> {
    return fetch(`https://api.${this.network}.tzkt.io/v1/operations/originations?contractManager=${pkh}`)
      .then(response => response.json())
      .then(data => data.map((op: any) => {
        return (op?.status === 'applied' && op?.originatedContract?.kind === 'delegator_contract') ? op.originatedContract.address : '';
      }).filter((address: string) => address.length));
  }
  async accountInfo(address: string, knownTokenIds: string[]): Promise<any> {
    const tokens = [];
    const unknownTokenIds = [];
    const data = await (await fetch(`${this.bcd}/account/${this.network}/${address}`)).json();
    const aryTokens: any[] = address.startsWith('tz') ? await this.getTokenBalancesUsingPromiseAll(address) : [];
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
        const balance = data?.balance !== undefined ? data.balance : 0;
        return { counter: hash, unknownTokenIds, tokens, balance };
      }
    }
    return { counter: '', unknownTokenIds, tokens };
  }
  async isUsedAccount(address: string): Promise<boolean> {
    const accountInfo = await (await fetch(`${this.bcd}/account/${this.network}/${address}`)).json();
    if (accountInfo && (accountInfo.balance || accountInfo.tx_count)) {
      return true;
    } else {
      const tokenCount = await (await fetch(`${this.bcd}/account/${this.network}/${address}/count`)).json();
      if (tokenCount && Object.keys(tokenCount).length > 0) {
        return true;
      }
    }
    return false;
  }
  async getOperations(address: string, knownTokenIds: string[] = [], wallet: WalletObject): Promise<any> {
    const ops = await fetch(`${this.tzkt}/accounts/${address}/operations?limit=20&type=delegation,origination,transaction`)
      .then(response => response.json())
      .then(data => data.map(op => {
        if (!op.hasInternals || !wallet.getAccount(op.target.address)) {
          const status = op.status === 'applied' ? 1 : -1;
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
            status,
            amount,
            source: op.sender,
            destination,
            hash: op.hash,
            counter: op.counter,
            timestamp: (new Date(op.timestamp)).getTime(),
            entrypoint
          };
          return activity;
        }
      }).filter(obj => obj));
    const unknownTokenIds: string[] = [];
    const tokenTxs = await fetch(`${this.bcd}/tokens/${this.network}/transfers/${address}?size=10&start=0`)
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
          const index = ops.findIndex((op: any) => op.hash === tx.hash && op.counter === tx.counter);
          let hiddenOp;
          if (index !== -1) {
            hiddenOp = ops[index];
            if (hiddenOp?.entrypoint && hiddenOp.entrypoint === 'transfer') {
              ops.splice(index, 1); // Hide token transfer invokation
            }
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
            counter: tx.counter,
            timestamp: (new Date(tx.timestamp)).getTime()
          };
          return activity;
        } else {
          return null;
        }
      }).filter(obj => obj));
    const operations = ops.concat(tokenTxs).sort(
      function (a: any, b: any) {
        if (b.timestamp - a.timestamp === 0 && a.counter && b.counter) {
          if (b.counter - a.counter === 0) {
            return b.entrypoint ? -1 : 1;
          }
          return b.counter - a.counter;
        }
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
  async getTokenMetadata(contractAddress, id, counter): Promise<TokenMetadata> {
    // cache token kind
    const tokenKind: Promise<any> = new Promise(async (resolve) => {
      let kind;
      const now = new Date().getTime();
      if (this.tokenKindCache[contractAddress] && (now - this.tokenKindCache[contractAddress].timestamp) < 1800000) {
        // get from cache
        kind = this.tokenKindCache[contractAddress].kind;
      } else {
        kind = await fetch(`${this.bcd}/contract/${this.network}/${contractAddress}`)
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
        if (kind) {
          this.tokenKindCache[contractAddress] = { kind, timestamp: new Date().getTime() };
        }
      }
      resolve(kind);
    });
    let bcdId: string;// skeles hotfix
    if (contractAddress === 'KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih') {
      const map = import('../../../../assets/js/KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih.json');
      bcdId = map[id];
      bcdId = bcdId ? Big(bcdId).mod(Big(2).pow(64)).toFixed() : undefined;
    }
    const tokenMetadata: Promise<any> = fetch(`${this.bcd}/contract/${this.network}/${contractAddress}/tokens?token_id=${bcdId ?? id}&offset=0`)
      .then(response => response.json())
      .then(async data => {
        if (data?.length && data[0]?.name === 'Unknown') {
          data = [];
        }
        if (data.length === 0) {
          try {
            data = await this.getTokenMetadataWithTaquito(contractAddress, id);
            console.log(`Fallback on Taquito metadata (${contractAddress}:${id})`, data);
          } catch (e) {
            console.error(e);
            console.log(`No metadata found for: ${contractAddress}:${id}`);
            throw e;
          }
        } else {
          data = data[0];
        }
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
        mutableConvertObjectPropertiesSnakeToCamel(data);
        assert(data, `cannot find token_id ${id} for contract: ${contractAddress}`);
        if (data?.token_id === Number(id) || data.tokenId === Number(id) || data.tokenId > Number.MAX_SAFE_INTEGER) {
          // possible snake_case to camelCase conversion; depending on future BCD updates
          const rawData = JSON.parse(JSON.stringify(data));
          this.flattern(data);
          let metadata: any = {};
          for (const a of keys) {
            if (typeof data[a.key] === a.type) {
              metadata[a.key] = data[a.key];
            }
          }
          metadata = { ...metadata, ...(await this.resolveAssetUris(data, counter)) };
          return metadata;
        }
        console.log(`No token metadata found for ${contractAddress}:${id}`);
        return {};
      }).catch(e => {
        console.warn(e);
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
  async getTokenMetadataWithTaquito(contractAddress, id) {
    const contract = await this.Tezos.contract.at(contractAddress, tzip12);
    let stringId: any; // skeles hotfix
    if (contractAddress === 'KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih') {
      const map = import('../../../../assets/js/KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih.json');
      stringId = map[id] as any;
    }
    let metadata: any;
    if (['KT1L4bfiyqsqLJU3p1PyPxn1pqBSND5vfjNi'].includes(contractAddress)) {// nl hotfix
      const contract = await this.Tezos.contract.at(contractAddress);
      const storage: any = await contract.storage();
      const parsed_uri = storage.token_metadata_uri.replace('{tokenId}', id);
      const response = await (await fetch(parsed_uri)).json();
      if (response) {
        response.tokenId = id;
        metadata = response;
      }
    } else {
      metadata = await contract.tzip12().getTokenMetadata(stringId ?? Number(id));
    }
    mutableConvertObjectPropertiesSnakeToCamel(metadata);
    // add extras to mimic bcd response
    const firstClassProps = ['tokenId', 'symbol', 'decimals', 'name', 'description', 'artifactUri', 'displayUri', 'thumbnailUri', 'externalUri', 'isTransferable', 'isBooleanAmount', 'shouldPreferSymbol', 'creators', 'tags', 'formats', 'extras'];
    if (metadata?.extras === undefined) {
      metadata.extras = {};
    }
    const keys = Object.keys(metadata);
    for (const key of keys) {
      if (!firstClassProps.includes(key)) {
        metadata.extras[key] = metadata[key];
        delete metadata[key];
      }
    }
    return metadata;
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
  async resolveAssetUris(data: any, counter: number): Promise<any> {
    const metadata: any = {};
    const rawData = JSON.parse(JSON.stringify(data));
    metadata.displayUri = await this.uriToAsset(data.displayUri, counter);
    if (data.displayUri && data.thumbnailUri && data.displayUri === data.thumbnailUri) {
      metadata.thumbnailUri = metadata.displayUri;
    } else {
      metadata.thumbnailUri = await this.uriToAsset(data.thumbnailUri, counter);
    }
    try {
      // Exceptions
      if (data?.isBooleanAmount === undefined && typeof data?.isBooleanAmount === "string" && data?.isBooleanAmount === "true"
      ) {
        // mandala
        metadata.isBooleanAmount = true;
      }
      if (data?.symbol === "OBJKT") {
        if (!data.displayUri) {
          // hicetnunc
          metadata.displayUri = await this.uriToAsset(rawData.formats[0].uri, counter);
        }
        if (metadata?.displayUri) {
          metadata.thumbnailUri = '';
        }
      }
      if (!metadata.displayUri && !metadata.thumbnailUri && rawData?.icon) {
        metadata.thumbnailUri = await this.uriToAsset(rawData?.icon, counter); // Plenty + HEH
      }
    } catch (e) { }
    return metadata;
  }
  async uriToAsset(uri: string, counter: number): Promise<Asset> {
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
    const suffix = counter ? `&retry=${counter}` : ''; // bypass cache
    const cacheMeta = url ? await this.fetchApi(`https://backend.kukai.network/file/info?src=${url}${suffix}`, counter) : '';
    return cacheMeta ? cacheMeta : '';
  }
  async fetchApi(url: string, counter: number = 0): Promise<Asset> {
    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data?.Status === 'ok' && data.Filename && data.Extension) {
          const asset: CachedAsset = {
            filename: data.Filename,
            extension: data.Extension
          }
          if (asset.extension !== 'unknown') {
            return asset;
          }
          console.warn(url, data);
        } else {
          if (!counter || counter < 5)
            throw new Error(data?.Error || data);
        }
        return '';
      });
  }
  async getTokenBalancesUsingPromiseAll(address: string) {
    // get total number of tokens
    const tokenCount = await (await fetch(`${this.bcd}/account/${this.network}/${address}/count?hide_empty=true`)).json();
    const tokenTotal = Object.keys(tokenCount).map(key => tokenCount[key]).reduce((a, b) => a + b, 0);

    // Use Promise.All to get all token balances
    const totalPromises = Math.floor(tokenTotal / this.BCD_TOKEN_QUERY_SIZE) + Number((tokenTotal % this.BCD_TOKEN_QUERY_SIZE) !== 0);
    const aryTokenFetchUrl: Promise<Response>[] = [];
    for (let i = 0; i < totalPromises; i++) {
      const url = `${this.bcd}/account/${this.network}/${address}/token_balances?size=${this.BCD_TOKEN_QUERY_SIZE}&offset=${this.BCD_TOKEN_QUERY_SIZE * i}&hide_empty=true`;
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
    if (key.charAt(0).toLowerCase() !== key.charAt(0)) {
      data[key.charAt(0).toLowerCase() + key.slice(1)] = data[key];
    }
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
