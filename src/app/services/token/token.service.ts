import { Injectable } from '@angular/core';
import { Constants } from '../../constants';
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
export interface Token {
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
    0: Token
  };
}
export interface FA2 extends TokensInterface {
  kind: 'FA2';
  tokens: Record<number, Token>;
}

@Injectable({
  providedIn: 'root'
})

export class TokenService {
  readonly AUTO_DISCOVER: boolean = true;
  private contracts: ContractsType;
  exploredTokenIds: string[] = [];
  constructor(
    public indexerService: IndexerService
  ) {
    this.contracts = new Constants().NET._ASSETS;
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
        }
      } else if (this.AUTO_DISCOVER) {
        this.searchMetadata(contractAddress, id);
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
    if (!this.exploredTokenIds.includes(tokenId)) {
      console.log(`Searching for tokenId: ${tokenId}`);
      this.exploredTokenIds.push(tokenId);
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
        const token: Token = {
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: Number(metadata.decimals),
          description: metadata.description ? metadata.description : '',
          imageSrc: metadata.imageUri ? metadata.imageUri : '../../../assets/img/tokens/default.png',
          isNft: metadata?.isNft ? metadata.isNft : false
        };
        contract.tokens[id] = token;
        this.addAsset(contractAddress, contract);
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
