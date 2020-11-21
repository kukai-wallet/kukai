import { Injectable } from '@angular/core';
import { Constants } from '../../../constants';
import { Indexer } from '../indexer.service';
import * as cryptob from 'crypto-browserify';

@Injectable({
  providedIn: 'root'
})
export class TzktService implements Indexer {
  CONSTANTS: any;
  constructor() {
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
  // Todo: Replace lastActivity with data hash, this will make us detect token balance changes.
  async accountInfo(address: string): Promise<string> {
    const network = this.CONSTANTS.NET.NETWORK;
    return fetch(`https://api.better-call.dev/v1/account/${network}/${address}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          console.log('data', data)
          const payload: string =
            (data.last_action ? data.last_action : '') +
            (data.tokens ? JSON.stringify(data.tokens.sort(
              function (a: any, b: any) {
                if (a.contract < b.contract) {
                  return -1
                } else {
                  return 1;
                };
              }
            )) : '');
          const input = new Buffer(JSON.stringify(payload), 'base64');
          console.log('payload', payload);
          const hash = cryptob.createHash('md5').update(input, 'base64').digest('hex');
          console.warn(hash + '');
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
                console.warn('Ignore ', op)
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
            asset: 'tez',
            source: op.sender.address,
            destination,
            hash: op.hash,
            timestamp: (new Date(op.timestamp)).getTime()
          };
        }
      }).filter(obj => obj));
    console.warn(ops);
    const tokenTxs = await fetch(`https://api.better-call.dev/v1/tokens/${this.CONSTANTS.NET.NETWORK}/transfers/${address}?size=20`)
      .then(response => response.json())
      .then(data => data.transfers.map(tx => {
        if (tx.contract && this.CONSTANTS.NET.ASSETS[tx.contract] && tx.status === 'applied') {
          return {
            type: 'transaction',
            block: '',
            status: 1,
            amount: tx.amount,
            asset: this.CONSTANTS.NET.ASSETS[tx.contract].name,
            source: tx.from,
            destination: tx.to,
            hash: tx.hash,
            timestamp: (new Date(tx.timestamp)).getTime()
          };
        } else {
          return null;
        }
      }).filter(obj => obj));
    console.log(tokenTxs);
    return ops.concat(tokenTxs).sort(
      function (a: any, b: any) {
        return b.timestamp - a.timestamp;
      }
    );
  }
}
