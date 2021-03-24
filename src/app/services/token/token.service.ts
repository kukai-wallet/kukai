import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../environments/environment';
import { IndexerService } from '../indexer/indexer.service';
import Big from 'big.js';

export enum TokenStatus {
  APPROVED,
  REJECTED,
}

export interface TokenResponseType {
  contractAddress: string;
  id: number;
  decimals: number;
  displayUrl: string;
  thumbnailUrl: string;
  name: string;
  symbol: string;
  description: string;
  category: string;
  kind: string;
  isTransferable?: boolean;
  isBooleanAmount?: boolean;
  shouldPreferSymbol?: boolean;
  series?: string;
  tokenStatus?: TokenStatus;
  metaDisplayUrl: string;
  metaThumbnailUrl: string;
}
export type ContractsType = Record<string, ContractType>;
export type ContractType = FA12 | FA2;
export interface TokensInterface {
  category: string;
}
export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  displayUrl: string;
  thumbnailUrl: string;
  isTransferable?: boolean;
  isBooleanAmount?: boolean;
  shouldPreferSymbol?: boolean;
  series?: string;
  metaDisplayUrl: string;
  metaThumbnailUrl: string;
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
  readonly version: string = '1.0.5';
  private contracts: ContractsType = {};
  private exploredIds: Record<string, { firstCheck: number, lastCheck: number }> = {};
  readonly storeKey = 'tokenMetadata';
  constructor(
    public indexerService: IndexerService
  ) {
    this.contracts = CONSTANTS.ASSETS;
    this.loadMetadata();
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
      }
    }
    return null;
  }
  isKnownTokenId(tokenId: string): boolean {
    return (this.getAsset(tokenId) !== null);
  }
  knownTokenIds(): string[] {
    const tokenIds: string[] = [];
    const contractKeys = Object.keys(this.contracts);
    if (contractKeys) {
      for (const contractKey of contractKeys) {
        const tokenKeys = Object.keys(this.contracts[contractKey].tokens);
        if (tokenKeys) {
          for (const tokenKey of tokenKeys) {
            tokenIds.push(`${contractKey}:${tokenKey}`);
          }
        }
      }
    }
    return tokenIds;
  }
  isKnownTokenContract(address: string): boolean {
    return (this.contracts[address] !== undefined);
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
        (metadata.name || metadata.symbol) &&
        (!isNaN(metadata.decimals) && metadata.decimals >= 0)
      ) {
        const contract: ContractType = {
          kind: metadata.tokenType ? metadata.tokenType : 'FA2',
          category: metadata.tokenCategory ? metadata.tokenCategory : '',
          tokens: {}
        };
        const defaultImg = CONSTANTS.DEFAULT_TOKEN_IMG;

        const token: TokenData = {
          name: metadata.name ? metadata.name : '',
          symbol: metadata.symbol ? metadata.symbol : '',
          decimals: Number(metadata.decimals),
          description: metadata.description ? metadata.description : '',
          displayUrl: defaultImg,
          thumbnailUrl: defaultImg,
          isTransferable: metadata?.isTransferable ? metadata.isTransferable : true,
          isBooleanAmount: metadata?.isBooleanAmount ? metadata.isBooleanAmount : false,
          series: metadata.series ? metadata.series : undefined,
          // take the thumbnailUrl and vice vera if there is no url property
          metaDisplayUrl: metadata.displayUri || metadata.thumbnailUri || defaultImg,
          metaThumbnailUrl: metadata.thumbnailUri || metadata.displayUrl || defaultImg,
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
      this.exploredIds[tokenId] = { firstCheck: now, lastCheck: now };
      this.saveMetadata();
      return true;
    } else {
      const token = this.exploredIds[tokenId];
      const timeout = (token.lastCheck - token.firstCheck) > 600000;
      const reCheck = (now - token.lastCheck) > 15000;
      if (timeout || !reCheck) {
        return false;
      }
      this.exploredIds[tokenId].lastCheck = now;
      this.saveMetadata();
      return true;
    }
  }
  searchTimeMs(tokenId: string) {
    if (this.exploredIds[tokenId]) {
      const token = this.exploredIds[tokenId];
      return (token.lastCheck - token.firstCheck);
    }
    return 0;
  }
  getPlaceholderToken(tokenId: string): TokenResponseType {
    const tokenIdArray = tokenId.split(':');
    const contractAddress: string = tokenIdArray[0];
    const id: number = tokenIdArray[1] ? Number(tokenIdArray[1]) : -1;
    const defaultImg = CONSTANTS.DEFAULT_TOKEN_IMG;
    return {
      contractAddress,
      id,
      decimals: 0,
      displayUrl: defaultImg,
      thumbnailUrl: defaultImg,
      name: '[Unknown token]',
      symbol: '',
      description: '',
      category: '',
      kind: 'FA2',
      metaDisplayUrl: defaultImg,
      metaThumbnailUrl: defaultImg
    };
  }
  saveMetadata() {
    localStorage.setItem(
      this.storeKey,
      JSON.stringify({ contracts: this.contracts, exploredIds: this.exploredIds, version: this.version })
    );
  }
  loadMetadata(): any {
    const metadataJson = localStorage.getItem(this.storeKey);
    if (metadataJson) {
      const metadata = JSON.parse(metadataJson);
      if (metadata?.version === this.version) {
        if (metadata?.contracts) {
          const contractAddresses = Object.keys(metadata.contracts);
          for (const address of contractAddresses) {
            this.addAsset(address, metadata.contracts[address]);
          }
        }
        if (metadata?.exploredIds) {
          this.exploredIds = metadata.exploredIds;
        }
      }
    }
  }
  formatAmount(tokenKey: string, amount: string, baseUnit = true): string {
    if (!tokenKey) {
      return `${Big(amount).div(10 ** (baseUnit ? 6 : 0)).toFixed()} tez`;
    } else {
      const token = this.getAsset(tokenKey);
      if (token) {
        if(token.tokenStatus == TokenStatus.REJECTED){
          return `[Unknown token]`;
        }
        if ((!token.shouldPreferSymbol && token.name) || !token.symbol) {
          if (token.isBooleanAmount) {
            return `${token.name}`;
          } else {
            return `${Big(amount).div(10 ** (baseUnit ? token.decimals : 0)).toFixed()} ${token.name}`;
          }
        } else {
          return `${Big(amount).div(10 ** (baseUnit ? token.decimals : 0)).toFixed()} ${token.symbol}`;
        }
      } else {
        return '[Unknown token]';
      }
    }
  }
  setTrusted(contractAddress: string, tokenId: number) {
    const token: TokenResponseType = this.contracts[contractAddress].tokens[tokenId]
    if (token) {
      token.tokenStatus = TokenStatus.APPROVED
      token.displayUrl = token.metaDisplayUrl
      token.thumbnailUrl = token.metaThumbnailUrl
      this.saveMetadata()
    }
  }
  setRejected(contractAddress: string, tokenId: number) {
    const token: TokenResponseType = this.contracts[contractAddress].tokens[tokenId]
    if (token) {
      token.tokenStatus = TokenStatus.REJECTED
      this.saveMetadata()
    }
  }
}
