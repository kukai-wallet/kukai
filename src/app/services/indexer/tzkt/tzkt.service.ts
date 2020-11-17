import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../../environments/environment';
import { Indexer } from '../indexer.service';
@Injectable({
  providedIn: 'root'
})
export class TzktService implements Indexer {
  network = '';
  constructor() {
    this.network = !CONSTANTS.MAINNET ? '.' + CONSTANTS.NETWORK.slice(0, -3) : '';
  }
  async getContractAddresses(pkh: string): Promise<any> {
    return fetch(`https://api${this.network}.tzkt.io/v1/operations/originations?contractManager=${pkh}`)
      .then(response => response.json())
      .then(data => data.map((op: any) => {
        return op.originatedContract.kind === 'delegator_contract' ? op.originatedContract.address : '';
      }).filter((address: string) => address.length));
  }
  async accountInfo(address: string): Promise<string> {
    return fetch(`https://api${this.network}.tzkt.io/v1/accounts/${address}`)
      .then(response => response.json())
      .then(data => {
        if (data.lastActivity) {
          return data.lastActivity;
        } else {
          return 0;
        }
      });
  }

  async getOperations(address: string): Promise<any> {
    const ops = await fetch(`https://api${this.network}.tzkt.io/v1/accounts/${address}/operations?limit=10&type=delegation,origination,transaction`)
      .then(response => response.json())
      .then(data => data.map(op => {
        if (!op.hasInternals) {
          let destination = '';
          let amount = '0';
          switch (op.type) {
            case 'transaction':
              destination = op.target.address;
              amount = op.amount.toString();
              break;
            case 'delegation':
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
    return ops;
  }
}
