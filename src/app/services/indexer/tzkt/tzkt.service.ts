import { Injectable } from '@angular/core';
import { Constants } from '../../../constants';
import { Indexer } from '../indexer.service';
import * as cryptob from 'crypto-browserify';

@Injectable({
  providedIn: 'root'
})
export class TzktService implements Indexer {
  CONSTANTS: any;
  constructor(
  ) {
    this.CONSTANTS = new Constants();
  }
  async getContractAddresses(pkh: string): Promise<any> {
    const network = this.CONSTANTS.NET.network !== 'mainnet' ? '.' + this.CONSTANTS.NET.NETWORK.slice(0, -3) : '';
    return fetch(`https://api${network}.tzkt.io/v1/operations/originations?contractManager=${pkh}`)
      .then(response => response.json())
      .then(data => data.map((op: any) => {
        return op.originatedContract.kind === 'delegator_contract' ? op.originatedContract.address : '';
      }).filter((address: string) => address.length));
  }
  async accountInfo(address: string): Promise<string> {
    const network = this.CONSTANTS.NET.NETWORK;
    return fetch(`https://api.better-call.dev/v1/account/${network}/${address}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          const payload: string =
            (data.balance ? data.balance : '') +
            (data.last_action ? data.last_action : '') +
            (data.tokens ? JSON.stringify(data.tokens.sort(
              function (a: any, b: any) {
                if (a.contract < b.contract) {
                  return -1;
                } else {
                  return 1;
                }
              }
            )) : '');
          const input = Buffer.from(JSON.stringify(payload), 'base64');
          const hash = cryptob.createHash('md5').update(input, 'base64').digest('hex');
          if (hash === 'edc66a88461120f2ea9132d64be0d8b9') { // empty account
            return '';
          }
          return payload;
        } else {
          return '';
        }
      });
  }
  // Todo: Merge with token transactions
  async getOperations(address: string): Promise<any> {
    const network = this.CONSTANTS.NET.NETWORK !== 'mainnet' ? '.' + this.CONSTANTS.NET.NETWORK.slice(0, -3) : '';
    const ops = await fetch(`https://api${network}.tzkt.io/v1/accounts/${address}/operations?limit=20&type=delegation,origination,transaction`)
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
    const tokenTxs = await fetch(`https://api.better-call.dev/v1/tokens/${this.CONSTANTS.NET.NETWORK}/transfers/${address}?size=20`)
      .then(response => response.json())
      .then(data => data.transfers.map(tx => {
        const tokenId = `${tx.contract}:${tx.token_id}`;
        if (tx.contract && tokenId && tx.status === 'applied') {
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
          return null;
        }
      }).filter(obj => obj));
    return ops.concat(tokenTxs).sort(
      function (a: any, b: any) {
        return b.timestamp - a.timestamp;
      }
    );
  }
  async getTokenMetadata(contractAddress: string, id: number): Promise<any> {
    const bigMapId = await this.getBigMapIds(contractAddress);
    if (bigMapId.token) {
      const tokenBigMap = await this.fetchApi(`https://api.better-call.dev/v1/bigmap/carthagenet/${bigMapId.token}/keys`);
      const contractBigMap = await this.fetchApi(`https://api.better-call.dev/v1/bigmap/carthagenet/${bigMapId.contract}/keys`);
      let metadata: any = {};
      let extras: any = null;
      try {
        for (const child of tokenBigMap) {
          if (child.data.key.value === id.toString()) {
            for (const entry of child.data.value.children) {
              switch (entry.name) {
                case 'extras':
                  extras = entry.children;
                  break;
                case 'name':
                case 'symbol':
                  if (typeof entry.value === 'string') {
                    metadata[entry.name] = entry.value;
                  }
                  break;
                case 'decimals':
                  if (!isNaN(Number(entry.value)) && Number(entry.value >= 0)) {
                    metadata[entry.name] = Number(entry.value);
                  }
                  break;
              }
            }
            break;
          }
        }
      } catch (e) {
        console.log(e);
        return null;
      }
      try {
        const url = this.uriToUrl(contractBigMap[0].data.value.value);
        if (url) {
          const { interfaces } = await this.fetchApi(url);
          if (interfaces.includes('TZIP-12')) {
            metadata['tokenType'] = 'FA2';
          } else if (interfaces.includes('TZIP-7')) {
            metadata['tokenType'] = 'FA1.2';
          }
        }
      } catch {}
      if (extras) { // append extra metadata
        extras = await this.getUriExtras(extras);
        metadata = { ...metadata, ...extras };
      }
      return metadata;
    }
    return null;
  }
  async getBigMapIds(contractAddress: string): Promise<{ contract: number, token: number }> {
    const storage: any = await this.fetchApi(`https://api.better-call.dev/v1/contract/carthagenet/${contractAddress}/storage`);
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
  private async getUriExtras(extras: any): Promise<any> {
    const extraMetadata: any = {};
    let url: string;
    try {
      if (extras && extras.length) {
        for (const extra of extras) {
          switch (extra.name) {
            case 'uri':
              if (typeof extra.value === 'string') {
              url = this.uriToUrl(extra.value);
              }
              break;
            case 'description':
              if (typeof extra.value === 'string') {
                extraMetadata[extra.name] = extra.value;
              }
              break;
            case 'imageUri':
              if (typeof extra.value === 'string') {
                extraMetadata[extra.name] = this.uriToUrl(extra.value);
              }
              break;
            case 'isNft':
              if (typeof extra.value === 'boolean') {
                extraMetadata[extra.name] = extra.value;
              }
              break;
          }
        }
      }
    } catch (e) {
      console.log(e);
      return {};
    }
    if (url) {
      const extraOff = await this.fetchApi(url);
      if (extraOff.description && typeof extraOff.description === 'string') {
        extraMetadata['description'] = extraOff.description;
      }
      if (extraOff.imageUri && typeof extraOff.imageUri === 'string') {
        extraMetadata['imageUri'] = this.uriToUrl(extraOff.imageUri);
      }
      if (extraOff.isNft && typeof extraOff.isNft === 'boolean') {
        extraMetadata['isNft'] = extraOff.isNft;
      }
    }
    return extraMetadata;
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
}
