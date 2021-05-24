import { Injectable } from '@angular/core';
import { CONSTANTS, TRUSTED_TOKEN_CONTRACTS } from '../../../environments/environment';
import { IndexerService } from '../indexer/indexer.service';
import Big from 'big.js';

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
}
export type ContractsType = Record<string, ContractType>;
export type ContractType = FA12 | FA2;
export type ContractsOverrideType = Record<string, ContractOverrideType>;
export interface ContractOverrideType {
  storageUsage?: number;
  gasUsage?: number;
}
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
}
export interface FA12 extends TokensInterface {
  kind: 'FA1.2';
  tokens: {
    0: TokenData
  };
}
export interface FA2 extends TokensInterface {
  kind: 'FA2';
  tokens: Record<number | string, TokenData>;
}
@Injectable({
  providedIn: 'root'
})

export class TokenService {
  readonly AUTO_DISCOVER: boolean = true;
  readonly version: string = '1.0.8';
  private contracts: ContractsType = {};
  private exploredIds: Record<string, { firstCheck: number, lastCheck: number }> = {};
  readonly storeKey = 'tokenMetadata';
  constructor(
    public indexerService: IndexerService
  ) {
    this.contracts = CONSTANTS.ASSETS;
    this.loadMetadata();
    this.saveMetadata();
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
        let token = contract.tokens[id];
        if (!token) { // check ranges
          const ids = Object.keys(contract.tokens);
          for (const idx of ids) {
            if (idx.includes('-')) {
              const span = idx.split('-');
              if (span.length === 2 && !isNaN(Number(span[0])) && !isNaN(Number(span[1]))) {
                const first = Number(span[0]);
                const last = Number(span[1]);
                if (id >= first && id <= last) {
                  token = JSON.parse(JSON.stringify(contract.tokens[idx]));
                  token.name = `${JSON.parse(JSON.stringify(contract.tokens[idx].name))} #${(id - first + 1)}`;
                  break;
                }
              }
            }
          }
        }
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
        const defaultImg = '../../../assets/img/tokens/unknown-token.png';
        let displayUrl = (metadata.displayUri && TRUSTED_TOKEN_CONTRACTS.includes(contractAddress)) ? metadata.displayUri : defaultImg;
        let thumbnailUrl = (metadata.thumbnailUri && TRUSTED_TOKEN_CONTRACTS.includes(contractAddress)) ? metadata.thumbnailUri : defaultImg;
        if (displayUrl === defaultImg && thumbnailUrl !== defaultImg) {
          displayUrl = thumbnailUrl;
        }
        if (displayUrl !== defaultImg && thumbnailUrl === defaultImg) {
          thumbnailUrl = displayUrl;
        }
        const token: TokenData = {
          name: metadata.name ? metadata.name : '',
          symbol: metadata.symbol ? metadata.symbol : '',
          decimals: Number(metadata.decimals),
          description: metadata.description ? metadata.description : '',
          displayUrl,
          thumbnailUrl,
          isTransferable: metadata?.isTransferable ? metadata.isTransferable : true,
          isBooleanAmount: metadata?.isBooleanAmount ? metadata.isBooleanAmount : false,
          series: metadata.series ? metadata.series : undefined
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
      let t1 = (token.lastCheck - token.firstCheck);
      t1 = (t1 < 300000) ? 20000 : t1;
      const t2 = (now - token.lastCheck);
      if (t1 > t2) {
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
    return {
      contractAddress,
      id,
      decimals: 0,
      displayUrl: '../../../assets/img/tokens/unknown-token.png',
      thumbnailUrl: '../../../assets/img/tokens/unknown-token.png',
      name: '[Unknown token]',
      symbol: '',
      description: '',
      category: '',
      kind: 'FA2',
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
}
