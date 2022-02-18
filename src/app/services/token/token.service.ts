import { Injectable } from '@angular/core';
import { CONSTANTS, TRUSTED_TOKEN_CONTRACTS, BLACKLISTED_TOKEN_CONTRACTS } from '../../../environments/environment';
import { IndexerService } from '../indexer/indexer.service';
import Big from 'big.js';
import { SubjectService } from '../subject/subject.service';
import { TeztoolsService } from '../indexer/teztools/teztools.service';

export interface TokenResponseType {
  contractAddress: string;
  id: number;
  decimals: number;
  displayAsset: Asset;
  thumbnailAsset: Asset;
  name: string;
  symbol: string;
  description: string;
  category: string;
  kind: string;
  isTransferable?: boolean;
  isBooleanAmount?: boolean;
  shouldPreferSymbol?: boolean;
  series?: string;
  status: Status;
  isUnknownToken?: boolean;
}
export type Asset = string | CachedAsset;

export interface CachedAsset {
  filename: string;
  extension: string;
}

export type ContractsType = Record<string, ContractType>;
export type ContractType = FA12 | FA2;
export interface TokensInterface {
  category: string;
}
enum Status {
  Rejected = -1,
  Pending = 0,
  Approved = 1
}
export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  description: string;
  displayAsset: Asset;
  thumbnailAsset: Asset;
  isTransferable?: boolean;
  isBooleanAmount?: boolean;
  shouldPreferSymbol?: boolean;
  series?: string;
  status: Status;
}
export interface FA12 extends TokensInterface {
  kind: 'FA1.2';
  tokens: {
    0: TokenData;
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
  readonly version: string = '1.0.12';
  private contracts: ContractsType = {};
  private exploredIds: Record<string, { firstCheck: number; lastCheck: number; counter: number }> = {};
  private pendingSave = null;
  readonly storeKey = 'tokenMetadata';
  queue = [];
  workers = 0;
  constructor(public indexerService: IndexerService, private subjectService: SubjectService, private teztoolsService: TeztoolsService) {
    this.contracts = JSON.parse(JSON.stringify(CONSTANTS.ASSETS));
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
        let token: TokenResponseType = contract.tokens[id];
        if (!token) {
          // check ranges
          const ids = Object.keys(contract.tokens);
          for (const idx of ids) {
            if (idx.includes('-')) {
              const span = idx.split('-');
              if (span.length === 2 && !isNaN(Number(span[0])) && !isNaN(Number(span[1]))) {
                const first = Number(span[0]);
                const last = Number(span[1]);
                if (id >= first && id <= last) {
                  token = JSON.parse(JSON.stringify(contract.tokens[idx]));
                  token.name = `${JSON.parse(JSON.stringify(contract.tokens[idx].name))} #${id - first + 1}`;
                  break;
                }
              }
            }
          }
        }
        if (token) {
          if (token.status < 0) {
            return {
              kind: contract.kind,
              category: contract.category,
              id,
              contractAddress,
              ...token,
              thumbnailAsset: '',
              displayAsset: ''
            };
          }
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
    return this.getAsset(tokenId) !== null;
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
  isCategoryType(address, regex: RegExp): boolean {
    return regex.test(this.contracts[address]?.category);
  }
  isKnownTokenContract(address: string): boolean {
    return this.contracts[address] !== undefined;
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
    if (!this.isKnownTokenId(tokenId) && !this.queue.includes(tokenId) && this.explore(tokenId)) {
      this.queue.push(tokenId);
      if (this.workers < 64) {
        this.startWorker();
      }
    }
  }
  async startWorker() {
    this.workers++;
    while (this.queue.length) {
      const tokenId = this.queue.shift();
      try {
        const a = tokenId.split(':');
        const contractAddress = a[0];
        const id = Number(a[1]);
        if (!this.isKnownTokenId(tokenId)) {
          const metadata = await this.indexerService.getTokenMetadata(contractAddress, id, this.getCounter(tokenId));
          this.handleMetadata(metadata, contractAddress, id);
        }
      } catch (e) {}
    }
    this.workers--;
  }
  handleMetadata(metadata: any, contractAddress: string, id: number) {
    const tokenId = `${contractAddress}:${id}`;
    if (metadata && (metadata.name || metadata.symbol) && !isNaN(metadata.decimals) && metadata.decimals >= 0) {
      const contract: ContractType = {
        kind: metadata.tokenType ? metadata.tokenType : 'FA2',
        category: metadata.tokenCategory ? metadata.tokenCategory : '',
        tokens: {}
      };
      const token: TokenData = {
        name: metadata.name ? metadata.name : '',
        symbol: metadata.symbol ? metadata.symbol : '',
        decimals: Number(metadata.decimals),
        description: metadata.description ? metadata.description : '',
        displayAsset: metadata.displayUri,
        thumbnailAsset: metadata.thumbnailUri,
        isTransferable: metadata?.isTransferable ? metadata.isTransferable : true,
        isBooleanAmount: metadata?.isBooleanAmount ? metadata.isBooleanAmount : false,
        series: metadata.series ? metadata.series : undefined,
        status:
          TRUSTED_TOKEN_CONTRACTS.includes(contractAddress) ||
          CONSTANTS.NFT_CONTRACT_OVERRIDES.includes(tokenId) ||
          this.teztoolsService.defiTokens.includes(tokenId)
            ? 1
            : 0
      };
      contract.tokens[id] = token;
      this.addAsset(contractAddress, contract);
      this.saveMetadata();
      this.subjectService.metadataUpdated.next({
        contractAddress,
        id,
        token
      });
    }
  }
  explore(tokenId: string): boolean {
    const now = new Date().getTime();
    if (!this.exploredIds[tokenId]) {
      this.exploredIds[tokenId] = {
        firstCheck: now,
        lastCheck: now,
        counter: 0
      };
      this.saveMetadata();
      return true;
    } else {
      const token = this.exploredIds[tokenId];
      let t1 = 2 ** token.counter * 250;
      t1 = t1 < 20000 ? 20000 : t1;
      const t2 = now - token.lastCheck;
      if (t1 > t2) {
        return false;
      }
      this.exploredIds[tokenId].lastCheck = now;
      this.exploredIds[tokenId].counter = ++token.counter;
      this.saveMetadata();
      return true;
    }
  }
  private getCounter(tokenId: string) {
    return this.exploredIds[tokenId].counter;
  }
  resetCounters() {
    const ids = Object.keys(this.exploredIds);
    if (ids) {
      for (const id of ids) {
        this.exploredIds[id].counter = 0;
      }
      this.saveMetadata(true);
    }
  }
  resetAllMetadata() {
    this.exploredIds = {};
    this.contracts = JSON.parse(JSON.stringify(CONSTANTS.ASSETS));
    this.saveMetadata(true);
    this.loadMetadata();
    this.subjectService.metadataUpdated.next(null);
  }
  searchTimeMs(tokenId: string) {
    if (this.exploredIds[tokenId]) {
      const token = this.exploredIds[tokenId];
      return token.lastCheck - token.firstCheck;
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
      displayAsset: '',
      thumbnailAsset: '',
      name: '[Unknown token]',
      symbol: '',
      description: '',
      category: '',
      kind: 'FA2',
      status: 0,
      isUnknownToken: true
    };
  }
  saveMetadata(force = false) {
    if (force) {
      this._saveMetadata();
      return;
    }
    if (!this.pendingSave) {
      this.pendingSave = setTimeout(() => {
        this.pendingSave = null;
        this._saveMetadata();
      }, 1000);
    }
  }
  private _saveMetadata() {
    localStorage.setItem(
      this.storeKey,
      JSON.stringify({
        contracts: this.contracts,
        exploredIds: this.exploredIds,
        version: this.version
      })
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
            for (const id of Object.keys(metadata.contracts[address].tokens)) {
              if (metadata.contracts[address].tokens[id]?.status === 0) {
                if (
                  TRUSTED_TOKEN_CONTRACTS.includes(address) ||
                  CONSTANTS.NFT_CONTRACT_OVERRIDES.includes(`${address}:${id}`) ||
                  this.teztoolsService.defiTokens.includes(`${address}:${id}`)
                ) {
                  metadata.contracts[address].tokens[id].status = 1; // flip status if it have been marked as trusted
                }
                if (BLACKLISTED_TOKEN_CONTRACTS.includes(address)) {
                  metadata.contracts[address].tokens[id].status = -1;
                }
              }
            }
            this.addAsset(address, metadata.contracts[address]);
          }
        }
        if (metadata?.exploredIds) {
          this.exploredIds = metadata.exploredIds;
        }
      } else if (metadata?.version === '1.0.8') {
        // add metadata counter
        if (metadata?.exploredIds) {
          const ids = Object.keys(metadata.exploredIds);
          for (const id of ids) {
            metadata.exploredIds[id].counter = 0;
          }
          metadata.version = '1.0.9';
          localStorage.setItem(this.storeKey, JSON.stringify(metadata));
          this.loadMetadata();
        }
      } else if (metadata?.version === '1.0.10' || metadata?.version === '1.0.11') {
        metadata.version = '1.0.12';
        try {
          if (metadata?.contracts) {
            const targetContract = 'KT1Qm7MHmbdiBzoRs7xqBiqoRxw7T2cxTTJN'; // clear mooncakes metadata
            if (metadata.contracts[targetContract]) {
              delete metadata.contracts[targetContract];
            }
            if (metadata.exploredIds) {
              for (let id of Object.keys(metadata.exploredIds)) {
                if (id.startsWith(targetContract)) {
                  delete metadata.exploredIds[id];
                }
              }
            }
          }
          localStorage.setItem(this.storeKey, JSON.stringify(metadata));
          this.loadMetadata();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  formatAmount(tokenKey: string, amount: string, baseUnit = true): string {
    if (!tokenKey) {
      return `${Big(amount)
        .div(10 ** (baseUnit ? 6 : 0))
        .toFixed()} tez`;
    } else {
      const token = this.getAsset(tokenKey);
      if (token) {
        if ((!token.shouldPreferSymbol && token.name) || !token.symbol) {
          if (token.isBooleanAmount) {
            if (parseInt(amount) > 1) {
              return `${amount} ${token.name}`;
            }
            return `${token.name}`;
          } else {
            return `${Big(amount)
              .div(10 ** (baseUnit ? token.decimals : 0))
              .toFixed()} ${token.name}`;
          }
        } else {
          return `${Big(amount)
            .div(10 ** (baseUnit ? token.decimals : 0))
            .toFixed()} ${token.symbol}`;
        }
      } else {
        return '[Unknown token]';
      }
    }
  }
}
