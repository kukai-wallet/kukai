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
          const input = new Buffer(JSON.stringify(payload), 'base64');
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
    const storage = await fetch(`https://api.better-call.dev/v1/contract/carthagenet/${contractAddress}/storage`)
      .then(response => response.json())
      .then(data => data);
    let bigMapId = 0;
    try {
      for (const child of storage.children) {
        if (child?.name === 'assets') {
          for (const asset of child.children) {
            if (asset?.name === 'token_metadata') {
              bigMapId = asset.value;
            }
          }
        }
      }
    } catch (e) {
      console.log('error', e);
    }
    if (bigMapId && typeof bigMapId === 'number') {
      const bigMap = await fetch(`https://api.better-call.dev/v1/bigmap/carthagenet/${bigMapId}/keys`)
        .then(response => response.json())
        .then(data => data);
      const fields = ['token_id', 'symbol', 'name', 'decimals', 'extras'];
      const obj: any = {};
      try {
        for (const child of bigMap) {
          if (child.data.key.value === id.toString()) {
            for (const entry of child.data.value.children) {
              if (fields.includes(entry.name)) {
                if (entry.name === 'extras') {
                  for (const extra of entry.children) {
                    if (extra.name === 'uri') {
                      obj['uri'] = entry.children[0].value;
                      // https://cloudflare-ipfs.com/ipfs/QmTMHwTQhttR5e3R7Kbt2JyqRjrNxE61ENtHGzkp4h6MJD
                    }
                  }
                } else {
                  obj[entry.name] = entry.value;
                }
              }
            }
            break;
          }
        }
      } catch (e) {
        return null;
      }
      if (obj.uri) {
        obj.uriMetadata = await this.getUriMetadata(obj.uri);
      }
      return obj;
    }
    return null;
  }
  private async getUriMetadata(uri: string): Promise<any> {
    try {
      if (uri.length > 7 && 'ipfs://') {
        const uriMetadata: any = {};
        const url = `https://cloudflare-ipfs.com/ipfs/${uri.slice(7)}`;
        const uriData = await fetch(url)
          .then(response => response.json())
          .then(data => data);
        console.log('uriData', uriData);
        const fields = ['imageUri', 'isNft'];
        for (const key of fields) {
          if (uriData[key]) {
            uriMetadata[key] = uriData[key];
          }
        }
        console.log('URImetadata', uriMetadata);
        return uriMetadata;
      }
    } catch (e) { console.log('Uri fetch failed with', e)}
    return null;
  }
}
