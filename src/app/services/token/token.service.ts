import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../environments/environment';
import { IndexerService } from '../indexer/indexer.service';
import Big from 'big.js';

export interface TokenResponseType {
  contractAddress: string;
  id: number;
  decimals: number;
  imageSrc: string;
  name: string;
  symbol: string;
  description: string;
  category: string;
  kind: string;
  isNft?: boolean;
}
export type ContractsType = Record<string, ContractType>;
export type ContractType = FA12 | FA2;
export interface TokensInterface {
  category: string;
}
export interface TokenData {
  name: string;
  symbol: string;
  protected?: boolean; // Reserve name and symbol
  decimals: number;
  description: string;
  imageSrc: string;
  isNft?: boolean;
}
export interface FA12 extends TokensInterface {
  kind: 'FA1.2';
  tokens: {
    0: TokenData
  };
}
export interface FA2 extends TokensInterface {
  kind: 'FA2';
  tokens: Record<number, TokenData>;
}
@Injectable({
  providedIn: 'root'
})

export class TokenService {
  readonly AUTO_DISCOVER: boolean = true;
  private contracts: ContractsType = {};
  private exploredIds: Record<string, {firstCheck: number, lastCheck: number}> = {};
  readonly storeKey = 'tokenMetadata';
  readonly storeKey2 = 'metadataList';
  constructor(
    public indexerService: IndexerService
  ) {
    this.contracts = CONSTANTS.ASSETS;
    this.loadMetadata();
    this.loadExplored();
  }
  getAsset(tokenId: string): TokenResponseType {
    if (!tokenId || !tokenId.includes(':')) {
      console.warn(`Invalid tokenId`, tokenId);
      return null;
    }
    const tokenIdArray = tokenId.split(':');
    const contractAddress: string = tokenIdArray[0];
    const id: number = tokenIdArray[1] ? Number(tokenIdArray[1]) : -1;
    const contract: ContractType = this.contracts[contractAddress];
    if (id > -1) {
      if (contract) {
        const token = contract.tokens[id];
        if (token) {
          return {
            kind: contract.kind,
            category: contract.category,
            id,
            contractAddress,
            ...token
          };
        } else if (this.AUTO_DISCOVER) {
          this.searchMetadata(contractAddress, id); // ToDo: Move this call
        }
      } else if (this.AUTO_DISCOVER) {
        this.searchMetadata(contractAddress, id); // ToDo: Move this call
      }
    }
    return null;
  }
  addAsset(contractAddress: string, contract: ContractType) {
    if (!this.contracts[contractAddress]) {
      this.contracts[contractAddress] = contract;
    } else {
      const currentKeys = Object.keys(this.contracts[contractAddress].tokens);
      const newKeys = Object.keys(contract.tokens);
      for (const key of newKeys) {
        if (!currentKeys.includes(key)) {
          this.contracts[contractAddress].tokens[key] = contract.tokens[key];
        }
      }
    }
  }
  async searchMetadata(contractAddress: string, id: number) {
    const tokenId = `${contractAddress}:${id}`;
    if (this.explore(tokenId)) {
      console.log(`Searching for tokenId: ${tokenId}`);
      const metadata = await this.indexerService.getTokenMetadata(contractAddress, id);
      if (metadata &&
        metadata.name &&
        metadata.symbol &&
        !isNaN(metadata.decimals) &&
        metadata.decimals >= 0) {
        const contract: ContractType = {
          kind: metadata.tokenType ? metadata.tokenType : 'FA2',
          category: '',
          tokens: {}
        };
        const token: TokenData = {
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: Number(metadata.decimals),
          description: metadata.description ? metadata.description : '',
          imageSrc: metadata.imageUri ? metadata.imageUri : '../../../assets/img/tokens/default.png',
          isNft: metadata?.isNft ? metadata.isNft : false
        };
        contract.tokens[id] = token;
        this.addAsset(contractAddress, contract);
        this.saveMetadata();
      }
    }
  }
  explore(tokenId: string): boolean {
    const now = new Date().getTime();
    if (!this.exploredIds[tokenId]) {
      this.exploredIds[tokenId] = {firstCheck: now, lastCheck: now};
      this.saveExplored();
      return true;
    } else {
      const token = this.exploredIds[tokenId];
      const timeout = (token.lastCheck - token.firstCheck) > 600000;
      const reCheck = (now - token.lastCheck) > 2000;
      if (timeout || !reCheck) {
        return false;
      }
      this.exploredIds[tokenId].lastCheck = now;
      this.saveExplored();
      return true;
    }
  }
  saveMetadata() {
    localStorage.setItem(
      this.storeKey,
      JSON.stringify(this.contracts)
    );
  }
  saveExplored() {
    localStorage.setItem(
      this.storeKey2,
      JSON.stringify(this.exploredIds)
    );
  }
  loadMetadata(): any {
    console.log('### Load metadata');
    const metadataJson = localStorage.getItem(this.storeKey);
    if (metadataJson) {
      const metadata = JSON.parse(metadataJson);
      const contractAddresses = Object.keys(metadata);
      for (const address of contractAddresses) {
        this.addAsset(address, metadata[address]);
      }
    }
  }
  loadExplored() {
    const exploredJson = localStorage.getItem(this.storeKey2);
    if (exploredJson) {
      const explored = JSON.parse(exploredJson);
      if (explored) {
        this.exploredIds = explored;
      }
    }
  }
  formatAmount(tokenKey: string, amount: string, baseUnit = true) {
    if (!tokenKey) {
      return `${Big(amount).div(10 ** (baseUnit ? 6 : 0)).toFixed()} tez`;
    } else {
      const token = this.getAsset(tokenKey);
      if (token.isNft) {
        return `${token.name}`;
      } else {
        return `${Big(amount).div(10 ** (baseUnit ? token.decimals : 0)).toFixed()} ${token.symbol}`;
      }
    }
  }
}
