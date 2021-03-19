import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../../environments/environment';
import { Indexer } from '../indexer.service';
import * as cryptob from 'crypto-browserify';
import { WalletObject, Activity } from '../../wallet/wallet';

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
    return fetch(`${this.bcd}/account/${this.network}/${address}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
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
    const tokenTxs = await fetch(`${this.bcd}/tokens/${this.network}/transfers/${address}?size=20`)
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
        } else if (data?.tags.includes('fa12')) {
          return 'FA1.2';
        }
        return null;
      }).catch(e => {
        return null;
      });
    const contractMetadata = fetch(`${this.bcd}/account/${this.network}/${contractAddress}/metadata`)
      .then(response => response.json())
      .then(data => {
        const meta: any = {};
        if (data?.tags?.includes('fa2')) {
          meta.tokenType = 'FA2';
        } else if (data?.tags?.includes('fa2')) {
          meta.tokenType = 'FA1.2';
        }
        if (data?.category) {
          meta.category = data.category;
        }
        return meta;
      }).catch(e => {
        console.log(`No contract metadata found for ${contractAddress}:${id}`);
        return {};
      });
    const tokenMetadata = fetch(`${this.bcd}/contract/${this.network}/${contractAddress}/tokens?size=1000000`)
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
        for (const data of datas) {
          if (data?.token_id === Number(id)) {
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
            if (!metadata.displayUri && data?.symbol === 'OBJKT') { // Exception for hicetnunc
              try {
                if (['image/png', 'image/jpg', 'image/jpeg'].includes(rawData.token_info.formats[0].mimeType)) {
                  metadata.displayUri = await this.uriToUrl(rawData.token_info.formats[0].uri);
                }
              } catch (e) {}
            }
            return metadata;
          }
        }
        console.log(`No token metadata found for ${contractAddress}:${id}`);
        return {};
      }).catch(e => {
        return {};
      });
    const ans = await Promise.all([contractMetadata, tokenMetadata, tokenKind])
      .then(res => {
        const merged: any = { ...res[0], ...res[1] };
        if (!merged.tokenType && res[2]) {
          merged.tokenType = res[2];
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
  async getTokenMetadataDepricated(contractAddress: string, id: number): Promise<any> {
    console.log(contractAddress + ':' + id);
    const bigMapId = await this.getBigMapIds(contractAddress);
    if (bigMapId.token !== -1) {
      const tokenMetadata = await this.extractTokenMetadata(bigMapId.token, id);
      const contractMetadata = await this.extractContractMetadata(bigMapId.contract);
      const metadata = { ...tokenMetadata, ...contractMetadata };
      return metadata;
    }
    return null;
  }
  async extractTokenMetadata(bigMapId: number, id: number) {
    const tokenBigMap = await this.fetchApi(`${this.bcd}/bigmap/${this.network}/${bigMapId}/keys?size=1000`);
    console.log(`${this.bcd}/bigmap/${this.network}/${bigMapId}/keys`);
    let url = '';
    const metadata: any = {};
    const lookFor = {
      strings: ['name', 'symbol', 'description', 'displayUri', 'displayURI'],
      numbers: ['decimals'],
      booleans: ['isTransferable', 'isBooleanAmount', 'shouldPreferSymbol']
    };
    try {
      for (const child of tokenBigMap) {
        if (child.data.key.value === id.toString()) {
          for (const child2 of child.data.value.children) {
            if (child2.name === 'token_metadata_map') {
              console.log('token_metadata_map', child2.children);
              for (const child3 of child2.children) {
                if (!child3.name || child3.name === '""') {
                  url = await this.uriToUrl(child3.value);
                } else {
                  for (const key of lookFor.strings) {
                    if (child3.name === key) {
                      metadata[key] = child3.value;
                    }
                  }
                  for (const key of lookFor.numbers) {
                    if (child3.name === key) {
                      metadata[key] = Number(child3.value);
                    }
                  }
                  for (const key of lookFor.booleans) {
                    if (child3.name === key) {
                      if (child3.value === '00') {
                        metadata[key] = false;
                      } else if (child3.value.toUpperCase() === 'FF') {
                        metadata[key] = true;
                      }
                    }
                  }
                }
              }
              break;
            }
          }
          break;
        }
      }
    } catch (e) {
      console.warn(e);
      return null;
    }
    console.log(metadata);
    console.log(url);
    if (!url) {
      console.log('No offchain metadata');
      if (!metadata['displayUri'] && metadata['displayURI']) {
        metadata['displayUri'] = metadata['displayURI'];
        delete metadata['displayURI'];
      }
      if (metadata['displayUri']) {
        metadata['displayUri'] = await this.uriToUrl(metadata['displayUri']);
      }
      return metadata;
    }
    const offChainMeta = await this.fetchApi(`${url}`);
    if (!offChainMeta) {
      console.warn('Failed to fetch offchain metadata');
      return null;
    }
    console.log(offChainMeta);
    for (const key of lookFor.strings) {
      if (offChainMeta[key] && typeof offChainMeta[key] === 'string' && typeof metadata[key] === 'undefined') {
        metadata[key] = offChainMeta[key];
      }
    }
    for (const key of lookFor.numbers) {
      if (typeof offChainMeta[key] !== 'undefined' && typeof metadata[key] === 'undefined') {
        if (typeof offChainMeta[key] === 'string') {
          metadata[key] = Number(offChainMeta[key]);
        } else if (typeof offChainMeta[key] === 'number') {
          metadata[key] = offChainMeta[key];
        }
      }
    }
    for (const key of lookFor.booleans) {
      if (typeof offChainMeta[key] !== 'undefined' && typeof offChainMeta[key] === 'boolean' && typeof metadata[key] === 'undefined') {
        metadata[key] = offChainMeta[key];
      }
    }
    if (!metadata['displayUri'] && metadata['displayURI']) {
      metadata['displayUri'] = metadata['displayURI'];
      delete metadata['displayURI'];
    }
    if (metadata['displayUri']) {
      metadata['displayUri'] = await this.uriToUrl(metadata['displayUri']);
    }
    if (metadata.decimals === undefined) {
      metadata.decimals = 0;
    }
    console.log(metadata);
    return metadata;
  }
  async extractContractMetadata(bigMapId: number) {
    const contractBigMap = await this.fetchApi(`${this.bcd}/bigmap/${this.network}/${bigMapId}/keys`);
    let url = '';
    try {
      for (const child of contractBigMap) {
        if (child.data.key.value === '') {
          url = await this.uriToUrl(child.data.value.value);
          break;
        }
      }
    } catch (e) {
      return null;
    }
    if (!url) { return null; }
    if (bigMapId !== -1) {
      try {
        const metadata: any = {};
        const contractMeta = await this.fetchApi(`${url}`);
        if (contractMeta.interfaces) {
          if (contractMeta.interfaces.includes('TZIP-12')) {
            metadata['tokenType'] = 'FA2';
          } else if (contractMeta.interfaces.includes('TZIP-7')) {
            metadata['tokenType'] = 'FA1.2';
          }
        }
        if (contractMeta['tokenCategory']) {
          metadata['tokenCategory'] = contractMeta['tokenCategory'];
        }
        console.log('contract metadata', metadata);
        return metadata;
      } catch { }
    }
    return null;
  }
  async getBigMapIds(contractAddress: string): Promise<{ contract: number, token: number }> {
    const storage: any = await this.fetchApi(`${this.bcd}/contract/${this.network}/${contractAddress}/storage`);
    let token = -1;
    let contract = -1;
    try {
      for (const child of storage.children) {
        if (child?.name === 'admin') {
          if (child.children) {
            for (const admin of child.children) {
              if (admin?.name === 'metadata') {
                contract = admin.value;
              }
            }
          }
        } else if (child?.name === 'assets') {
          if (child.children) {
            for (const asset of child.children) {
              if (asset?.name === 'token_metadata') {
                token = asset.value;
              }
            }
          }
        } else if (child?.name === 'metadata') {
          contract = child.value;
        }
      }
    } catch (e) {
      console.log(e);
    }
    return { contract, token };
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
}
