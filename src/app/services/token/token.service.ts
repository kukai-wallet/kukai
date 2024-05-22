import { Injectable } from '@angular/core';
import { CONSTANTS, TRUSTED_TOKEN_CONTRACTS } from '../../../environments/environment';
import { IndexerService } from '../indexer/indexer.service';
import Big from 'big.js';
import { SubjectService } from '../subject/subject.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { ObjktService } from '../indexer/objkt/objkt.service';
import { DipDupService } from '../indexer/dipdup/dipdup.service';
import { indexedDB } from '../../libraries/index';
import { MetadataSource } from '../indexer/tzkt/tzkt.service';

export interface TokenResponseType {
  contractAddress: string;
  id: string;
  decimals: number;
  artifactAsset?: Asset;
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
  ttl?: number;
  mintingTool?: string;
  status: Status;
  isUnknownToken?: boolean;
}
export type Asset = string | CachedAsset;
export interface CachedAsset {
  uri: string;
  mimeType: string;
}

export type ContractsType = Record<string, ContractType>;
export type ContractType = FA12 | FA2;
export interface TokensInterface {
  category: string;
  objkt?: {
    name?: string;
    logo?: string;
    updated: number;
  };
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
  artifactAsset?: Asset;
  displayAsset: Asset;
  thumbnailAsset: Asset;
  isTransferable?: boolean;
  isBooleanAmount?: boolean;
  shouldPreferSymbol?: boolean;
  series?: string;
  ttl?: number;
  mintingTool?: string;
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
  readonly version: string = '1.0.15';
  private contracts: ContractsType = {};
  public initialized = false;
  private exploredIds: Record<string, { firstCheck: number; lastCheck: number; counter: number }> = {};
  private pendingSave = null;
  readonly storeKey = 'tokenMetadata';
  readonly unlockablesKey = 'unlockables';
  queue = [];
  workers = 0;

  constructor(
    public indexerService: IndexerService,
    private subjectService: SubjectService,
    private dipdupService: DipDupService,
    private router: Router,
    private objktService: ObjktService
  ) {
    this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)).subscribe(async (r: NavigationEnd) => {
      if (r.url.indexOf('/account') === -1) {
        document.documentElement.className = '';
      }
    });
    this.contracts = JSON.parse(JSON.stringify(CONSTANTS.ASSETS));
    this.loadMetadata().then(() => {
      this.initialized = true;
      this.subjectService.metadataUpdated.next(null);
      this.saveMetadata();
    });
  }
  getAsset(tokenId: string): TokenResponseType {
    if (!tokenId || !tokenId.includes(':')) {
      return null;
    }
    const tokenIdArray = tokenId.split(':');
    let contractAddress: string = tokenIdArray[0];
    const id: string = tokenIdArray[1] ? String(tokenIdArray[1]) : null;
    const contract: ContractType = this.contracts[contractAddress];
    if (id != null) {
      if (contract) {
        let token: TokenResponseType = contract.tokens[id];
        if (!token) {
          // check ranges
          const ids = Object.keys(contract.tokens);
          for (const idx of ids) {
            if (idx.includes('-')) {
              const span = idx.split('-');
              if (span.length === 2 && !isNaN(Number(span[0])) && !isNaN(Number(span[1]))) {
                const first = Big(span[0]);
                const last = Big(span[1]);
                if (first.gte(id) && last.lte(id)) {
                  token = JSON.parse(JSON.stringify(contract.tokens[idx]));
                  token.name = `${JSON.parse(JSON.stringify(contract.tokens[idx].name))} #${Big(id).minus(first).plus(1)}`;
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
  getContractName(contractAddress: string) {
    return this.contracts[contractAddress]?.objkt?.name ?? null;
  }
  getContractLogo(contractAddress: string) {
    return this.contracts[contractAddress]?.objkt?.logo ?? null;
  }
  getContractAddressFromAsset(uri: string) {
    const contractAddresses = Object.keys(this.contracts);
    for (const contractAddress of contractAddresses) {
      const tokens = this.contracts[contractAddress].tokens;
      for (const id in tokens) {
        if (tokens[id]?.thumbnailAsset?.uri === uri || tokens[id]?.displayAsset?.uri === uri || tokens[id]?.artifactAsset?.uri === uri) {
          return contractAddress;
        }
      }
    }
    return '';
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
      this.checkContractData(contractAddress, contract);
    } else {
      const currentKeys = Object.keys(this.contracts[contractAddress].tokens);
      const newKeys = Object.keys(contract.tokens);
      for (const key of newKeys) {
        if (!currentKeys.includes(key)) {
          this.contracts[contractAddress].tokens[key] = contract.tokens[key];
        } else if (JSON.stringify(contract.tokens[key]) !== JSON.stringify(this.contracts[contractAddress].tokens[key])) {
          this.contracts[contractAddress].tokens[key] = contract.tokens[key];
        }
      }
    }
  }

  async checkContractData(contractAddress: string, contract: ContractType) {
    let check = false;
    if (!contract.objkt) {
      check = true;
    } else if (contract?.objkt?.updated) {
      const diff = Date.now() - contract.objkt.updated;
      if (!contract?.objkt?.name) {
        if (diff > 1000 * 60 * 60 * 24) {
          check = true;
        }
      }
    }
    if (check) {
      const _objkt = await this.objktService.resolveCollection(contractAddress);
      const objkt: any = { updated: Date.now() };
      if (_objkt?.name) {
        objkt.name = _objkt.name;
        if (_objkt.logo) {
          objkt.logo = _objkt.logo;
        }
      }
      if (this.contracts[contractAddress]) {
        this.contracts[contractAddress].objkt = objkt;
      }
      this.saveMetadata();
      this.subjectService.metadataUpdated.next(null);
    }
  }
  async searchAllMetadata(unknownTokenIds: any) {
    if (unknownTokenIds.length) {
      for (const tokenId of unknownTokenIds) {
        this.searchMetadata(tokenId);
      }
    }
  }
  async recheckMetadata(tokens) {
    if (tokens?.length) {
      for (let token of tokens) {
        try {
          const tokenObject = this.getAsset(token.tokenId);
          if (tokenObject?.ttl) {
            const exp = this.exploredIds[token.tokenId];
            const now = new Date().getTime();
            if (now - exp.lastCheck > tokenObject.ttl * 1000) {
              console.debug('recheck metadata for', token.tokenId);
              this.exploredIds[token.tokenId].lastCheck = now;
              this.exploredIds[token.tokenId].counter = ++exp.counter || 0;
              this.saveMetadata();
              if (!this.queue.includes(token.tokenId)) {
                this.searchMetadata(token.tokenId, true);
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
  private async searchMetadata(tokenId: string, force = false) {
    if ((!this.isKnownTokenId(tokenId) && !this.queue.includes(tokenId) && this.explore(tokenId)) || force) {
      this.queue.push(tokenId);
      if (this.workers < 2) {
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
        const id = String(a[1]);
        const recentDay = this.exploredIds[tokenId]?.lastCheck - this.exploredIds[tokenId]?.firstCheck < 1000 * 3600 * 24;
        const skipTzkt = this.isKnownTokenId(tokenId) && this.exploredIds[tokenId]?.counter % 5 === 3 && recentDay;
        let metadataSource = skipTzkt ? MetadataSource.TaquitoOnly : MetadataSource.Any;
        if (this.exploredIds[tokenId]?.counter === 0) {
          metadataSource = MetadataSource.TzktOnly;
        }
        const metadata = await this.indexerService.getTokenMetadata(contractAddress, id, metadataSource);
        this.handleMetadata(metadata, contractAddress, id);
      } catch (e) {}
    }
    this.workers--;
  }
  handleMetadata(metadata: any, contractAddress: string, id: string) {
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
        artifactAsset: metadata.artifactUri ?? '',
        displayAsset: metadata.displayUri ?? '',
        thumbnailAsset: metadata.thumbnailUri ?? '',
        isTransferable: metadata?.isTransferable === false ? metadata.isTransferable : true,
        isBooleanAmount: metadata?.isBooleanAmount ? metadata.isBooleanAmount : false,
        status:
          TRUSTED_TOKEN_CONTRACTS.includes(contractAddress) || CONSTANTS.NFT_CONTRACT_OVERRIDES.includes(tokenId) || this.dipdupService.tokens.get(tokenId)
            ? 1
            : 0
      };
      if (metadata?.ttl) {
        token.ttl = Math.max(Number(metadata.ttl), 30);
      }
      if (metadata?.mintingTool) {
        token.mintingTool = metadata.mintingTool;
      }
      if (metadata?.series) {
        token.series = metadata.series;
      }
      if (CONSTANTS.ASSETS[contractAddress]?.tokens[id]) {
        contract.tokens[id] = { ...token, ...CONSTANTS.ASSETS[contractAddress].tokens[id] };
      } else {
        contract.tokens[id] = token;
      }
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
  async resetAllMetadata() {
    this.exploredIds = {};
    this.contracts = JSON.parse(JSON.stringify(CONSTANTS.ASSETS));
    await this.saveMetadata(true);
    this.queue = [];
    await this.loadMetadata();
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
    const id: string = tokenIdArray[1] ? String(tokenIdArray[1]) : '';
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
  async saveMetadata(force = false) {
    if (force) {
      await this._saveMetadata();
      return;
    }
    if (!this.pendingSave) {
      this.pendingSave = setTimeout(() => {
        this.pendingSave = null;
        this._saveMetadata();
      }, 1000);
    }
  }
  private async _saveMetadata() {
    const data = {
      contracts: this.contracts,
      exploredIds: this.exploredIds,
      version: this.version
    };
    await indexedDB.saveToKvDb('tokenMetadata', data);
    localStorage.setItem(this.storeKey, 'KV_DB');
  }
  async loadMetadata() {
    let metadataJson = localStorage.getItem(this.storeKey);
    if (metadataJson) {
      let metadata: any;
      if (metadataJson === 'KV_DB') {
        metadata = await indexedDB.getFromKvDb('tokenMetadata');
      } else {
        metadata = JSON.parse(metadataJson);
      }
      if (metadata?.version === this.version) {
        if (metadata?.contracts) {
          const contractAddresses = Object.keys(metadata.contracts);
          for (const address of contractAddresses) {
            for (const id of Object.keys(metadata.contracts[address].tokens)) {
              if (metadata.contracts[address].tokens[id]?.status === 0) {
                if (
                  TRUSTED_TOKEN_CONTRACTS.includes(address) ||
                  CONSTANTS.NFT_CONTRACT_OVERRIDES.includes(`${address}:${id}`) ||
                  this.dipdupService.tokens.get(`${address}:${id}`)
                ) {
                  metadata.contracts[address].tokens[id].status = 1; // flip status if it have been marked as trusted
                }
                if (this.subjectService.blocklist.value.includes(address)) {
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
      } else if (metadata?.version === '1.0.14') {
        // Clear hen metadata for new teia alias
        try {
          delete metadata.contracts['KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton'];
          metadata.version = '1.0.15';
          await this.saveMetadata(true);
          await this.loadMetadata();
        } catch (e) {
          console.error(e);
        }
      } else {
        // clear all metadata
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
