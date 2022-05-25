import { Injectable } from '@angular/core';
import { CONSTANTS, MODEL_3D_WHITELIST } from '../../../../environments/environment';
import { Indexer } from '../indexer.service';
import * as cryptob from 'crypto-browserify';
import { WalletObject, Activity, OpStatus, Token } from '../../wallet/wallet';
import { TezosToolkit } from '@taquito/taquito';
import { Tzip12Module, tzip12 } from '@taquito/tzip12';
import { TezosStorageHandler } from '@taquito/tzip16';
import { Handler, IpfsHttpHandler, MetadataProvider } from '@taquito/tzip16';
import { SubjectService } from '../../subject/subject.service';

interface TokenMetadata {
  name: string;
  tokenType: 'FA2' | 'FA1.2';
  decimals: number;
  symbol?: string;
  description?: string;
  artifactUri?: string;
  displayUri?: string;
  thumbnailUri?: string;
  category?: string;
  isTransferable?: boolean;
  shouldPreferSymbol?: boolean;
  isBooleanAmount?: boolean;
  series?: string;
  ttl?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TzktService implements Indexer {
  tokenBalanceCache = {};
  readonly network = CONSTANTS.NETWORK.replace('hangzhounet', 'hangzhou2net');
  public readonly tzkt = `https://api.${this.network}.tzkt.io/v1`;
  readonly TZKT_TOKEN_QUERY_SIZE: number = 10000;
  Tezos: TezosToolkit;
  constructor(private subjectService: SubjectService) {
    this.Tezos = new TezosToolkit(CONSTANTS.NODE_URL);
    const customHandlers = new Map<string, Handler>([
      ['ipfs', new IpfsHttpHandler('cloudflare-ipfs.com')],
      ['tezos-storage', new TezosStorageHandler()]
    ]);
    const customMetadataProvider = new MetadataProvider(customHandlers);
    this.Tezos.addExtension(new Tzip12Module(customMetadataProvider));
  }
  async getContractAddresses(pkh: string): Promise<any> {
    return fetch(`${this.tzkt}/operations/originations?contractManager=${pkh}`)
      .then((response) => response.json())
      .then((data) =>
        data
          .map((op: any) => {
            return op?.status === 'applied' && op?.originatedContract?.kind === 'delegator_contract' ? op.originatedContract.address : '';
          })
          .filter((address: string) => address.length)
      );
  }
  async getHashAndBlockById(transactionId: number, ops: any): Promise<any> {
    try {
      for (const op of ops) {
        if (op.type === 'transaction' && op.id === transactionId) {
          if (op.hash && op.block) {
            return { hash: op.hash, block: op.block };
          }
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return fetch(`${this.tzkt}/operations/transactions?id=${transactionId}`)
      .then((res) => {
        return res.json();
      })
      .then((o) => {
        return o?.length && o[0].hash && o[0].block ? { hash: o[0].hash, block: o[0].block } : '';
      });
  }
  async accountInfo(address: string, knownTokenIds: string[]): Promise<any> {
    const unknownTokenIds = [];
    const data = await (await fetch(`${this.tzkt}/accounts/${address}`)).json();
    const tokenBalances = address.startsWith('tz') ? await this.getAllTokenBalances(address) : [];
    if (data) {
      if (tokenBalances?.length) {
        for (const token of tokenBalances) {
          if (!knownTokenIds.includes(token.tokenId)) {
            unknownTokenIds.push(token.tokenId);
          }
        }
      }
      tokenBalances.sort(function (a: any, b: any) {
        if (a.tokenId < b.tokenId) {
          return -1;
        } else {
          return 1;
        }
      });
      const payload: string = (data.balance ? data.balance : '') + (data.counter ? data.counter : '') + (tokenBalances ? JSON.stringify(tokenBalances) : '');
      const input = Buffer.from(payload);
      const hash = cryptob.createHash('sha512').update(input).digest('hex');
      if (payload && payload !== '[]') {
        const balance = data?.balance !== undefined ? data.balance : 0;
        return { counter: hash, unknownTokenIds, tokens: tokenBalances, balance };
      }
    }
    return { counter: '', tokens: tokenBalances };
  }
  async isUsedAccount(address: string): Promise<boolean> {
    const accountInfo = await (await fetch(`${this.tzkt}/accounts/${address}`)).json();
    if (accountInfo && (accountInfo.balance || accountInfo.tokenBalancesCount)) {
      return true;
    } else {
      const tokenCount = await (await fetch(`${this.tzkt}/accounts/count`)).json();
      if (tokenCount && Object.keys(tokenCount).length > 0) {
        return true;
      }
    }
    return false;
  }
  async getOperations(address: string, knownTokenIds: string[], wallet: WalletObject): Promise<any> {
    const ops = await fetch(`${this.tzkt}/accounts/${address}/operations?limit=20&type=delegation,origination,transaction`)
      .then((response) => response.json())
      .then((data) =>
        data
          .map((op) => {
            if (!op.hasInternals || !wallet.getAccount(op.target.address)) {
              const status: OpStatus = op.status === 'applied' ? OpStatus.CONFIRMED : OpStatus.FAILED;
              let destination = { address: '' };
              let amount = '0';
              let entrypoint = '';
              let opId = '';
              switch (op.type) {
                case 'transaction':
                  if (address !== op.target.address && address !== op.sender.address) {
                    return null;
                  }
                  destination = op.target;
                  amount = op.amount.toString();
                  entrypoint = this.extractEntrypoint(op);
                  opId = op?.id ? `t${op.id}` : '';
                  break;
                case 'delegation':
                  if (address !== op.sender.address) {
                    return null;
                  }
                  destination = op.newDelegate ? op.newDelegate : { address: '' };
                  amount = '0';
                  opId = op?.id ? `d${op.id}` : '';
                  break;
                case 'origination':
                  destination = op.originatedContract;
                  if (op.contractBalance) {
                    amount = op.contractBalance.toString();
                  }
                  opId = op?.id ? `o${op.id}` : '';
                  break;
                default:
                  console.log(`Ignoring kind ${op.type}`);
                  return null;
              }
              const activity: Activity = {
                type: op.type,
                block: op.block,
                status,
                amount,
                source: op.sender,
                destination,
                hash: op.hash,
                counter: op.counter,
                timestamp: new Date(op.timestamp).getTime(),
                entrypoint,
                opId
              };
              return activity;
            }
          })
          .filter((obj) => obj)
      );
    const unknownTokenIds: string[] = [];
    const tokenTxs = await (await fetch(`${this.tzkt}/tokens/transfers?anyof.from.to=${address}&limit=20&offset=0&sort.desc=id`)).json();
    const tokenArr = [];
    for (let i = 0; i < tokenTxs.length; ++i) {
      const tokenId = `${tokenTxs[i].token.contract.address}:${tokenTxs[i].token.tokenId}`;
      if (tokenTxs[i].token.contract && tokenId) {
        if (!knownTokenIds.includes(tokenId)) {
          unknownTokenIds.push(tokenId);
        }
        const source: any = { address: tokenTxs[i].from?.address };
        if (tokenTxs[i].from === '' && tokenTxs[i].token.contract) {
          source.address = tokenTxs[i].contract.address;
        }
        let hash = '';
        let block = '';
        if (tokenTxs[i].transactionId) {
          const o = await this.getHashAndBlockById(tokenTxs[i].transactionId, ops);
          if (o) {
            hash = o.hash;
            block = o.block;
          }
        }
        const activity: Activity = {
          type: 'transaction',
          block,
          hash,
          status: OpStatus.CONFIRMED,
          amount: tokenTxs[i].amount,
          tokenId,
          source,
          destination: { address: tokenTxs[i].to?.address ?? '' },
          timestamp: new Date(tokenTxs[i].timestamp).getTime(),
          opId: `t${tokenTxs[i].transactionId}`
        };
        tokenArr.push(activity);
      }
    }
    let operations = ops
      .concat(tokenArr)
      .filter((op) => op?.entrypoint !== 'transfer' && op?.entrypoint !== 'claim')
      .sort(function (a: any, b: any) {
        return b.timestamp - a.timestamp;
      });
    return { operations, unknownTokenIds };
  }
  private extractEntrypoint(op: any): string {
    return op?.entrypoint ?? op?.parameter?.entrypoint ?? '';
  }
  async getTokenMetadata(contractAddress: string, id: number, skipTzkt: boolean): Promise<TokenMetadata> {
    let meta;
    let tokenType = 'FA2';
    const tokenId = `${contractAddress}:${id}`;
    if (this.tokenBalanceCache[tokenId]) {
      meta = this.tokenBalanceCache[tokenId].token.metadata;
      tokenType = this.tokenBalanceCache[tokenId].token.standard && this.tokenBalanceCache[tokenId].token.standard === 'fa1.2' ? 'FA1.2' : 'FA2';
    }
    if (meta) {
      this.normalizeMetadata(meta, contractAddress, id);
      this.filterMetadata(meta);
    }
    if (!(meta && (meta.name || meta.symbol) && !isNaN(meta.decimals) && meta.decimals >= 0) || skipTzkt) {
      meta = null;
    }
    if (!meta) {
      console.log('fallback on taquito', { contractAddress, id });
      meta = await this.getTokenMetadataWithTaquito(contractAddress, id);
      if (meta) {
        this.normalizeMetadata(meta, contractAddress, id);
        this.filterMetadata(meta);
      }
    }
    if (!(meta && (meta.name || meta.symbol) && !isNaN(meta.decimals) && meta.decimals >= 0)) {
      meta = null;
    }
    if (!meta) {
      console.warn(`cannot find token_id ${id} for contract: ${contractAddress}`);
      return null;
    }
    return { ...meta, tokenType };
  }
  async getTokenMetadataWithTaquito(contractAddress, id) {
    const contract = await this.Tezos.contract.at(contractAddress, tzip12);
    let metadata: any;
    if (['KT1TnVQhjxeNvLutGvzwZvYtC7vKRpwPWhc6'].includes(contractAddress)) {
      // nl hotfix
      const contract = await this.Tezos.contract.at(contractAddress);
      const storage: any = await contract.storage();
      const parsed_uri = storage.token_metadata_uri.replace('{tokenId}', id);
      const response = await (await fetch(parsed_uri)).json();
      if (response) {
        response.tokenId = id;
        metadata = response;
      }
    } else {
      metadata = await contract.tzip12().getTokenMetadata(Number(id));
    }
    return metadata;
  }
  async getAllTokenBalances(address: string): Promise<Array<Token>> {
    const fetchToken = async (offset: number): Promise<Array<any>> => {
      let res = await (await fetch(`${this.tzkt}/tokens/balances?account=${address}&offset=${offset}&limit=${this.TZKT_TOKEN_QUERY_SIZE}&balance.ne=0`)).json();
      if (res?.length) {
        if (res.length === this.TZKT_TOKEN_QUERY_SIZE) {
          // get more if limit reached
          return [...res, ...(await fetchToken(offset + this.TZKT_TOKEN_QUERY_SIZE))];
        } else {
          return res;
        }
      } else {
        return [];
      }
    };
    let tzktTokensResponse = await fetchToken(0);
    const tokenBalances: Token[] = [];
    for (let i = 0; i < tzktTokensResponse.length; ++i) {
      if (tzktTokensResponse[i]?.balance && tzktTokensResponse[i].token?.contract?.address && tzktTokensResponse[i].token?.tokenId !== undefined) {
        const tokenId: string = `${tzktTokensResponse[i].token.contract.address}:${tzktTokensResponse[i].token.tokenId}`;
        tokenBalances.push({ tokenId, balance: tzktTokensResponse[i].balance });
        this.tokenBalanceCache[tokenId] = tzktTokensResponse[i];
      }
    }
    return tokenBalances;
  }
  private filterMetadata(meta: any) {
    const keys = [
      { key: 'name', type: 'string' },
      { key: 'balance', type: 'string' },
      { key: 'symbol', type: 'string' },
      { key: 'contractAddress', type: 'string' },
      { key: 'id', type: 'string' },
      { key: 'decimals', type: 'string' },
      { key: 'description', type: 'string' },
      { key: 'artifactUri', type: 'string', toAsset: true },
      { key: 'displayUri', type: 'string', toAsset: true },
      { key: 'thumbnailUri', type: 'string', toAsset: true },
      { key: 'isTransferable', type: 'boolean' },
      { key: 'shouldPreferSymbol', type: 'boolean' },
      { key: 'isBooleanAmount', type: 'boolean' },
      { key: 'series', type: 'string' },
      { key: 'ttl', type: 'string' }
    ];
    let metadata: any = {};
    for (const a of keys) {
      if (typeof meta[a.key] === a.type) {
        if (a.toAsset) {
          // extract mime type
          if (meta?.formats?.length) {
            const index = meta.formats.findIndex((b) => b.uri === meta[a.key]);
            if (index !== -1 && meta.formats[index].uri && meta.formats[index].mimeType) {
              meta[a.key] = { uri: meta[a.key], mimeType: meta.formats[index].mimeType };
            }
          }
          if (typeof meta[a.key] === 'string') {
            meta[a.key] = { uri: meta[a.key], mimeType: 'unknown' };
          }
        }
        metadata[a.key] = meta[a.key];
      }
    }
    return metadata;
  }
  private normalizeMetadata(meta: any, contractAddress: string, id: number) {
    mutableConvertObjectPropertiesSnakeToCamel(meta);
    for (let key of Object.keys(meta)) {
      if (typeof meta[key] === 'number') {
        meta[key] = `${meta[key]}`;
      }
    }
    this.handleMetadataExceptions(meta, contractAddress, id);
    if (meta?.isTransferable && typeof meta?.isTransferable === 'string') {
      meta.isTransferable = meta.isTransferable?.toLowerCase() === 'false' ? false : meta.isTransferable?.toLowerCase() === 'true' ? true : undefined;
    }
    if (meta?.shouldPreferSymbol && typeof meta?.shouldPreferSymbol === 'string') {
      meta.shouldPreferSymbol =
        meta.shouldPreferSymbol?.toLowerCase() === 'false' ? false : meta.shouldPreferSymbol?.toLowerCase() === 'true' ? true : undefined;
    }
    if (meta?.isBooleanAmount && typeof meta?.isBooleanAmount === 'string') {
      meta.isBooleanAmount = meta.isBooleanAmount?.toLowerCase() === 'false' ? false : meta.isBooleanAmount?.toLowerCase() === 'true' ? true : undefined;
    }
  }
  handleMetadataExceptions(meta: any, contractAddress: string, id: number) {
    // hen
    if (meta?.symbol === 'OBJKT') {
      if (!meta.displayUri && meta.formats?.length) {
        meta.displayUri = meta.formats[0].uri;
      }
      if (meta.displayUri && meta.thumbnailUri) {
        delete meta.thumbnailUri;
      }
    }
    if (contractAddress === 'KT1NVvPsNDChrLRH5K2cy6Sc9r1uuUwdiZQd' /* Dogami */ && meta?.formats) {
      if (typeof meta.formats[0] === 'string') {
        meta.formats = JSON.parse(meta.formats);
      }
    }
    // fxHash
    if (contractAddress === 'KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi' && meta?.artifactUri) {
      delete meta.artifactUri;
    }
    // Plenty + HEH
    if (!meta.displayUri && !meta.thumbnailUri && meta?.icon) {
      meta.thumbnailUri = { uri: meta.icon, mimeType: 'unknown' };
    }
    if (
      (contractAddress === 'KT1AWoUQAuUudqpc75cGukWufbfim3GRn8h6' /* Flex */ ||
        contractAddress === 'KT1Lz7Jd6Sh1zUE66nDGS7hGnjwcyTBCiYbF' /* SXSW */ ||
        contractAddress === 'KT1NVvPsNDChrLRH5K2cy6Sc9r1uuUwdiZQd') /* Dogami */ &&
      meta?.formats?.length
    ) {
      meta.displayUri = meta.artifactUri = meta.formats?.find((f) => f?.mimeType?.startsWith('model/')) ?? meta.displayUri;
    }
    if (contractAddress === 'KT1NVvPsNDChrLRH5K2cy6Sc9r1uuUwdiZQd') {
      // override wrong mimeType
      meta.thumbnailUri = { uri: meta.thumbnailUri, mimeType: 'video/mp4' };
    }
    // Rarible
    if (contractAddress === 'KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS') {
      meta.thumbnailUri = meta.displayUri = meta.formats[0].uri;
    }
  }
}
export function mutableConvertObjectPropertiesSnakeToCamel(data: Object) {
  for (const key in data) {
    if (key.charAt(0).toLowerCase() !== key.charAt(0)) {
      data[key.charAt(0).toLowerCase() + key.slice(1)] = data[key];
    }
    if (key.indexOf('_') !== -1) {
      const aryCamelKey = [];
      for (let i = 0; i < key.length; i++) {
        const char = key.charAt(i);
        if (char === '_') {
          aryCamelKey.push(key.charAt(i + 1).toUpperCase());
          i++;
        } else {
          aryCamelKey.push(char);
        }
      }
      const camelKey = aryCamelKey.join('');
      if (!data.hasOwnProperty(camelKey)) {
        data[camelKey] = data[key];
        delete data[key];
      }
    }
  }
}
