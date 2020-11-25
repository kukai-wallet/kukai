import { Injectable } from '@angular/core';
import { Constants, Contract, Contracts } from '../../constants';

export interface TokenResponseType {
  contractAddress: string;
  decimals: number;
  imageFileName: string;
  name: string;
  symbol: string;
  kind: string;
}

@Injectable({
  providedIn: 'root'
})

export class TokenService {
  readonly AUTO_DISCOVER: boolean = false;
  contracts: Contracts;
  constructor() {
    this.contracts = new Constants().NET._ASSETS;
  }
  getAsset(tokenId: string): TokenResponseType {
    const tokenIdArray = tokenId.split(':');
    const contractAddress: string = tokenIdArray[0];
    const id: number = tokenIdArray[1] ? Number(tokenIdArray[1]) : -1;
    const contract: Contract = this.contracts[contractAddress];
    if (contract && id > -1) {
      return {
        contractAddress,
        decimals: contract.assets[id].decimals,
        imageFileName: contract.assets[id].imageFileName,
        name: contract.assets[id].name,
        symbol: contract.assets[id].symbol,
        kind: contract.kind,
      }
    }
  }
  getTokenId(contractAddress: string, id: number): string {
    const contract: Contract = this.contracts[contractAddress];
    if (!contract || (contract.kind === 'FA1.2' && id !== 0)) {
      return '';
    } else {
      return `${contractAddress}:${id}`;
    }
  }
}
