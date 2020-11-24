import { Injectable } from '@angular/core';
import { Constants, AssetData, Tokens } from '../../constants';

export interface TokenResponseType {
  contractAddress: string;
  decimals: number;
  image: string;
  name: string;
  symbol: string;
  kind: string;
}

@Injectable({
  providedIn: 'root'
})

export class TokenService {
  readonly AUTO_DISCOVER: boolean = false;
  assets: Tokens;
  constructor() {
    this.assets = new Constants().NET._ASSETS;
  }
  getAsset(tokenId: string): any {
    // FA1.2: tokenId = KT1TjdF4H8H2qzxichtEbiCwHxCRM1SVx6B7
    // FA2: tokenId = KT1C1UcCzh5B7iTWpG2o4pPM3dTZDAc6WrNB:1
    const tokenIdArray = tokenId.split(':');
    const contractAddress: string = tokenIdArray[0];
    const id: number = tokenIdArray[1] ? Number(tokenIdArray[1]) : -1
  }
  findTokenId
}
