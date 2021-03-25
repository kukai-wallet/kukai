import { Injectable } from '@angular/core';
import { CONSTANTS, TRUSTED_TOKEN_CONTRACTS } from '../../../environments/environment';
import { IndexerService } from '../indexer/indexer.service';
import Big from 'big.js';

export enum TokenStatus {
  PENDING,
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
  tokenStatus: TokenStatus;
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
  tokenStatus: TokenStatus;
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
  readonly version: string = CONSTANTS.METADATA_VERSIONS[CONSTANTS.METADATA_VERSIONS.length - 1];
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
    const defaultImg = CONSTANTS.DEFAULT_TOKEN_IMG;
    if (id > -1) {
      if (contract) {
        const token = contract.tokens[id];
        if (token) {
          const objAsset = {
            kind: contract.kind,
            category: contract.category,
            id,
            contractAddress,
            ...token,
            metaDisplayUrl: token.displayUrl,
            // metaThumbnailUrl: token.thumbnailUrl,
          }
          if (token.tokenStatus !== TokenStatus.APPROVED) {
            objAsset.displayUrl = defaultImg
            objAsset.thumbnailUrl = defaultImg
          }
          return objAsset;
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
        // take the thumbnailUrl and vice vera if there is no url property
        const displayUrl = metadata.displayUri || metadata.thumbnailUri || defaultImg;
        const thumbnailUrl = metadata.thumbnailUri || metadata.displayUrl || defaultImg;

        const token: TokenData = {
          name: metadata.name ? metadata.name : '',
          symbol: metadata.symbol ? metadata.symbol : '',
          decimals: Number(metadata.decimals),
          description: metadata.description ? metadata.description : '',
          displayUrl: displayUrl,
          thumbnailUrl: thumbnailUrl,
          isTransferable: metadata?.isTransferable ? metadata.isTransferable : true,
          isBooleanAmount: metadata?.isBooleanAmount ? metadata.isBooleanAmount : false,
          series: metadata.series ? metadata.series : undefined,
          tokenStatus: TRUSTED_TOKEN_CONTRACTS.includes(contractAddress) ? TokenStatus.APPROVED : TokenStatus.PENDING,
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
      tokenStatus: TokenStatus.PENDING,
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
      // backwards compatibility for tokenStatus
      const metadata = this.migrateMetadataVersions(JSON.parse(metadataJson))

      // load assets into token-service class
      if (metadata?.contracts) {
        const contractAddresses = Object.keys(metadata.contracts);
        for (const address of contractAddresses) {
          this.addAsset(address, metadata.contracts[address]);
        }
      }
      // load exploredIds into token-service class
      if (metadata?.exploredIds) {
        this.exploredIds = metadata.exploredIds;
      }
    }
  }
  formatAmount(tokenKey: string, amount: string, baseUnit = true): string {
    if (!tokenKey) {
      return `${Big(amount).div(10 ** (baseUnit ? 6 : 0)).toFixed()} tez`;
    } else {
      const token = this.getAsset(tokenKey);
      if (token) {
        if (token.tokenStatus == TokenStatus.REJECTED) {
          return `[Rejected Token]`;
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

  migrateMetadataVersions(metadata: any) {
    console.log('metadata.version', metadata.version)
    switch (metadata.version) {
      case '1.0.5':
        // update from '1.0.5' to '1.0.6' requires the tokenStatus property
        for (const contractAddress of Object.keys(metadata.contracts || [])) {
          metadata.tokenStatus = TRUSTED_TOKEN_CONTRACTS.includes(contractAddress) ? TokenStatus.APPROVED : TokenStatus.PENDING;
        }
        metadata.version = CONSTANTS.METADATA_VERSIONS[CONSTANTS.METADATA_VERSIONS.findIndex(v => v == metadata.version) + 1]
        localStorage.setItem(this.storeKey, JSON.stringify(metadata))
        break;
      case '1.0.6':
        // current version, nothing to do
        return metadata
      default:
        console.warn('metadata version migration not configured')
        return metadata
    }

    // continue migrating
    return this.migrateMetadataVersions(metadata)
  }
}
