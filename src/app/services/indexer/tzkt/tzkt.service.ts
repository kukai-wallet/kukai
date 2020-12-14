import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../../environments/environment';
import { Indexer } from '../indexer.service';
import * as cryptob from 'crypto-browserify';
import Big from 'big.js';

@Injectable({
  providedIn: 'root'
})
export class TzktService implements Indexer {
  CONSTANTS: any;
  readonly bcd = 'https://api.better-call.dev/v1';
  constructor() { }
  async getContractAddresses(pkh: string): Promise<any> {
    return fetch(`https://api.${CONSTANTS.NETWORK}.tzkt.io/v1/operations/originations?contractManager=${pkh}`)
      .then(response => response.json())
      .then(data => data.map((op: any) => {
        return op.originatedContract.kind === 'delegator_contract' ? op.originatedContract.address : '';
      }).filter((address: string) => address.length));
  }
  async accountInfo(address: string, knownTokenIds: string[] = []): Promise<any> {
    const network = CONSTANTS.NETWORK;
    const tokens = [];
    const unknownTokenIds = [];
    return fetch(`${this.bcd}/account/${network}/${address}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          if (data?.tokens?.length) {
            for (const token of data.tokens) {
              if (knownTokenIds.includes(`${token.contract}:${token.token_id}`)) {
                tokens.push(token);
              } else {
                unknownTokenIds.push(`${token.contract}:${token.token_id}`);
              }
            }
          }
          tokens.sort(
            function (a: any, b: any) {
              if (a.contract < b.contract) {
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
          const input = Buffer.from(JSON.stringify(payload), 'base64');
          const hash = cryptob.createHash('md5').update(input, 'base64').digest('hex');
          if (hash !== 'edc66a88461120f2ea9132d64be0d8b9' && payload && payload !== '0001-01-01T00:00:00Z[]') {
            return { counter: hash, unknownTokenIds, tokens };
          }
        }
        return { counter: '', unknownTokenIds, tokens };
      });
  }
  // Todo: Merge with token transactions
  async getOperations(address: string, knownTokenIds: string[] = []): Promise<any> {
    const ops = await fetch(`https://api.${CONSTANTS.NETWORK}.tzkt.io/v1/accounts/${address}/operations?limit=20&type=delegation,origination,transaction`)
      .then(response => response.json())
      .then(data => data.map(op => {
        if (!op.hasInternals && op.status === 'applied') {
          let destination = '';
          let amount = '0';
          switch (op.type) {
            case 'transaction':
              if ((address !== op.target.address &&
                address !== op.sender.address) ||
                op.amount.toString() === '0') {
                return null;
              }
              destination = op.target.address;
              amount = op.amount.toString();
              break;
            case 'delegation':
              if (address !== op.sender.address) {
                return null;
              }
              destination = op.newDelegate ? op.newDelegate.address : '';
              amount = '0';
              break;
            case 'origination':
              destination = op.originatedContract.address;
              if (op.contractBalance) {
                amount = op.contractBalance.toString();
              }
              break;
            default:
              console.log(`Ignoring kind ${op.type}`);
              return null;
          }
          return {
            type: op.type,
            block: op.block,
            status: 1,
            amount,
            source: op.sender.address,
            destination,
            hash: op.hash,
            timestamp: (new Date(op.timestamp)).getTime()
          };
        }
      }).filter(obj => obj));
    const unknownTokenIds: string[] = [];
    const tokenTxs = await fetch(`${this.bcd}/tokens/${CONSTANTS.NETWORK}/transfers/${address}?size=20`)
      .then(response => response.json())
      .then(data => data.transfers.map(tx => {
        const tokenId = `${tx.contract}:${tx.token_id}`;
        if (tx.contract && tokenId && tx.status === 'applied') {
          if (knownTokenIds.includes(tokenId)) {
            return {
              type: 'transaction',
              block: '',
              status: 1,
              amount: tx.amount,
              tokenId,
              source: tx.from,
              destination: tx.to,
              hash: tx.hash,
              timestamp: (new Date(tx.timestamp)).getTime()
            };
          } else {
            unknownTokenIds.push(tokenId);
            return null;
          }
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
  async getTokenMetadata(contractAddress: string, id: number): Promise<any> {
    const bigMapId = await this.getBigMapIds(contractAddress);
    if (bigMapId.token !== -1) {
      const tokenMetadata = await this.extractTokenMetadata(bigMapId.token, id);
      const contractMetadata = await this.extractContractMetadata(bigMapId.contract);
      /*
      if (extras) { // append extra metadata
        extras = await this.getUriExtras(extras);
        metadata = { ...metadata, ...extras };
      }
      */
      const metadata = { ...tokenMetadata, ...contractMetadata };
      return metadata;
    }
    return null;
  }
  async extractTokenMetadata(bigMapId: number, id: number) {
    const tokenBigMap = await this.fetchApi(`${this.bcd}/bigmap/${CONSTANTS.NETWORK}/${bigMapId}/keys`);
    console.log(`${this.bcd}/bigmap/${CONSTANTS.NETWORK}/${bigMapId}/keys`);
    let url = '';
    const metadata: any = {};
    const lookFor = {
      strings: ['name', 'symbol', 'description', 'imageUri'],
      numbers: ['decimals'],
      booleans: ['isNft', 'nonTransferrable', 'nonTransferable', 'symbolPrecedence', 'binaryAmount']
    };
    try {
      for (const child of tokenBigMap) {
        if (child.data.key.value === id.toString()) {
          for (const child2 of child.data.value.children) {
            if (child2.name === 'token_metadata_map') {
              for (const child3 of child2.children) {
                console.log(child3.name, child3.value);
                if (!child3.name) {
                  url = this.uriToUrl(child3.value);
                } else {
                  for (const key of lookFor.strings) {
                    if (child3.name === key) {
                      metadata[key] = child3.value;
                    }
                  }
                  for (const key of lookFor.numbers) {
                    if (child3.name === key) {
                      metadata[key] = this.zarithDecodeInt(child3.value).value;
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
    if (!url) {
      if (metadata['imageUri']) {
        metadata['imageUri'] = this.uriToUrl(metadata['imageUri']);
      }
      return metadata;
    }
    const offChainMeta = await this.fetchApi(`${url}`);
    if (!offChainMeta) { return null; }
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
    if (metadata['imageUri']) {
      metadata['imageUri'] = this.uriToUrl(metadata['imageUri']);
    }
    if (typeof metadata['nonTransferrable'] !== 'undefined') { // Temp spelling fix
      metadata['nonTransferable'] = metadata['nonTransferrable'];
      delete metadata['nonTransferrable'];
    }
    console.log(metadata);
    return metadata;
  }
  async extractContractMetadata(bigMapId: number) {
    const contractBigMap = await this.fetchApi(`${this.bcd}/bigmap/${CONSTANTS.NETWORK}/${bigMapId}/keys`);
    let url = '';
    try {
      for (const child of contractBigMap) {
        if (child.data.key.value === '') {
          url = this.uriToUrl(child.data.value.value);
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
        if (contractMeta['token-category']) {
          metadata['tokenCategory'] = contractMeta['token-category'];
        }
        return metadata;
      } catch { }
    }
    return null;
  }
  async getBigMapIds(contractAddress: string): Promise<{ contract: number, token: number }> {
    const storage: any = await this.fetchApi(`${this.bcd}/contract/${CONSTANTS.NETWORK}/${contractAddress}/storage`);
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
        }
      }
    } catch (e) {
      console.log(e);
    }
    return { contract, token };
  }
  uriToUrl(uri: string): string {
    if (uri && uri.length > 7) {
      if (uri.slice(0, 7) === 'ipfs://') {
        return `https://cloudflare-ipfs.com/ipfs/${uri.slice(7)}`;
      } else if (uri.slice(0, 8) === 'https://') {
        return uri;
      }
    }
    return '';
  }
  async fetchApi(url: string): Promise<any> {
    return fetch(url)
      .then(response => response.json())
      .then(data => data);
  }
  private zarithDecodeInt(hex: string): any {
    let count = 0;
    let value = Big(0);
    while (1) {
      const byte = Number('0x' + hex.slice(0 + count * 2, 2 + count * 2));
      if (count === 0) {
        value = Big(((byte & 63) * (128 ** count))).add(value);
      } else {
        value = Big(((byte & 127) * 2) >> 1).times(64 * 128 ** (count - 1)).add(value);
      }
      count++;
      if ((byte & 128) !== 128) {
        break;
      }
    }
    return {
      value: value,
      count: count
    };
  }
}
