import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../../environments/environment';
import { Indexer } from '../indexer.service';
import * as cryptob from 'crypto-browserify';
import { WalletObject, Activity, OpStatus, Token } from '../../wallet/wallet';
import { TezosToolkit } from '@taquito/taquito';
import { Tzip12Module, tzip12 } from '@taquito/tzip12';
import { TezosStorageHandler } from '@taquito/tzip16';
import { Handler, IpfsHttpHandler, MetadataProvider } from '@taquito/tzip16';
import { SubjectService } from '../../subject/subject.service';
import Big from 'big.js';

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
  mintingTool: string;
}

export enum MetadataSource {
  Any = 0,
  TzktOnly = 1,
  TaquitoOnly = 2
}

@Injectable({
  providedIn: 'root'
})
export class TzktService implements Indexer {
  tokenBalanceCache = {};
  readonly TZKT_TOKEN_QUERY_SIZE: number = 10000;
  Tezos: TezosToolkit;

  constructor(private subjectService: SubjectService) {
    this.Tezos = new TezosToolkit(CONSTANTS.NODE_URL[0]);
    const customHandlers = new Map<string, Handler>([
      ['ipfs', new IpfsHttpHandler('ipfs.io')],
      ['tezos-storage', new TezosStorageHandler()]
    ]);
    const customMetadataProvider = new MetadataProvider(customHandlers);
    this.Tezos.addExtension(new Tzip12Module(customMetadataProvider));
  }
  async getContractAddresses(pkh: string): Promise<any> {
    return fetch(`${CONSTANTS.API_URL}/operations/originations?contractManager=${pkh}`)
      .then((response) => response.json())
      .then((data) =>
        data
          .map((op: any) => {
            return op?.status === 'applied' && op?.originatedContract?.kind === 'delegator_contract' ? op.originatedContract.address : '';
          })
          .filter((address: string) => address.length)
      );
  }

  async getHashAndBlockByIds(transactionIds: number[]): Promise<any> {
    if (!transactionIds?.length) {
      return {};
    }
    return fetch(`${CONSTANTS.API_URL}/operations/transactions?id.in=${transactionIds.join(',')}`)
      .then((res) => {
        return res.json();
      })
      .then((o) => {
        let res = {};
        for (let i = 0; i < o.length; i++) {
          if (o[i]?.id && o[i].hash && o[i].block) {
            res[`t${o[i].id}`] = { hash: o[i].hash, block: o[i].block };
          }
        }
        return res;
      });
  }
  async accountInfo(address: string, knownTokenIds: string[]): Promise<any> {
    const unknownTokenIds = [];
    const data = await (await fetch(`${CONSTANTS.API_URL}/accounts/${address}`)).json();
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
      const payload: string =
        (data.balance ?? '') +
        (data.counter ?? '') +
        (tokenBalances ? JSON.stringify(tokenBalances) : '') +
        (data.stakedBalance ?? '') +
        (data.unstakedBalance ?? '') +
        (data.delegate?.address ?? '');
      const input = Buffer.from(payload);
      const hash = cryptob.createHash('sha512').update(input).digest('hex');
      if (payload && payload !== '[]') {
        let availableBalance: number = 0;
        if (data?.balance) {
          try {
            availableBalance = Number(Big(data.balance).minus(data.stakedBalance).minus(data.unstakedBalance).toFixed(0));
          } catch (e) {
            console.error(e);
          }
        }
        return {
          counter: hash,
          unknownTokenIds,
          tokens: tokenBalances,
          balance: data.balance ?? 0,
          stakedBalance: data.stakedBalance ?? 0,
          unstakedBalance: data.unstakedBalance ?? 0,
          availableBalance,
          delegate: data.delegate?.address
        };
      }
    }
    return { counter: '', tokens: tokenBalances };
  }
  async isUsedAccount(address: string): Promise<boolean> {
    const accountInfo = await (await fetch(`${CONSTANTS.API_URL}/accounts/${address}`)).json();
    return Boolean(accountInfo && (accountInfo?.type === 'user' || accountInfo?.balance || accountInfo?.tokenBalancesCount));
  }
  async getOperations(address: string, knownTokenIds: string[], wallet: WalletObject): Promise<any> {
    const ops = await fetch(`${CONSTANTS.API_URL}/accounts/${address}/operations?limit=20&type=delegation,origination,transaction,staking`)
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
                case 'staking':
                  destination = op.baker;
                  entrypoint = op.action;
                  amount = op.amount.toString();
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
    const tokenTxs = await (await fetch(`${CONSTANTS.API_URL}/tokens/transfers?anyof.from.to=${address}&limit=20&offset=0&sort.desc=id`)).json();
    const tokenArr = [];
    const opIds = [];
    for (let i = 0; i < tokenTxs.length; ++i) {
      if (this.subjectService.blocklist.value.includes(tokenTxs[i].token.contract.address)) {
        continue;
      }
      const tokenId = `${tokenTxs[i].token.contract.address}:${tokenTxs[i].token.tokenId}`;
      if (tokenTxs[i].token.contract && tokenId) {
        if (!knownTokenIds.includes(tokenId)) {
          unknownTokenIds.push(tokenId);
        }
        const source: any = { address: tokenTxs[i].from?.address };
        if (tokenTxs[i].from === '' && tokenTxs[i].token.contract) {
          source.address = tokenTxs[i].contract.address;
        }
        if (tokenTxs[i].transactionId) {
          opIds.push(tokenTxs[i].transactionId);
        }
        const activity: Activity = {
          type: 'transaction',
          block: '',
          hash: '',
          status: OpStatus.CONFIRMED,
          amount: tokenTxs[i].amount,
          tokenId,
          source,
          destination: { address: tokenTxs[i].to?.address ?? '' },
          timestamp: new Date(tokenTxs[i].timestamp).getTime(),
          opId: tokenTxs[i].transactionId ? `t${tokenTxs[i].transactionId}` : undefined
        };
        tokenArr.push(activity);
      }
    }
    const extra = await this.getHashAndBlockByIds(opIds);
    for (const token of tokenArr) {
      if (extra[token?.opId]) {
        token.block = extra[token?.opId].block;
        token.hash = extra[token?.opId].hash;
      }
    }
    let operations = tokenArr
      .concat(ops)
      .filter((op) => op?.entrypoint !== 'transfer' && op?.entrypoint !== 'claim')
      .sort(function (a: any, b: any) {
        if (b.timestamp === a.timestamp && a.opId && b.opId) {
          return parseInt(new Big(b.opId.substring(1)).minus(a.opId.substring(1)).toString());
        }
        return b.timestamp - a.timestamp;
      });
    return { operations, unknownTokenIds };
  }
  private extractEntrypoint(op: any): string {
    return op?.entrypoint ?? op?.parameter?.entrypoint ?? '';
  }
  async getTokenMetadata(contractAddress: string, id: string, metadataSource: MetadataSource): Promise<TokenMetadata> {
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
    // default to 0
    if (meta && meta?.decimals === undefined) {
      meta.decimals = 0;
    }
    if (!(meta && (meta.name || meta.symbol) && !isNaN(meta.decimals) && meta.decimals >= 0) || metadataSource === MetadataSource.TaquitoOnly) {
      meta = null;
    }
    if (!meta && metadataSource !== MetadataSource.TzktOnly) {
      console.debug('fallback on taquito', { contractAddress, id });
      meta = await this.getTokenMetadataWithTaquito(contractAddress, id);
      if (meta) {
        this.normalizeMetadata(meta, contractAddress, id);
        this.filterMetadata(meta);
      }
    }
    if (meta?.decimals === undefined) {
      meta.decimals = 0;
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
    try {
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
    } catch (e) {
      return null;
    }
  }
  async getAllTokenBalances(address: string): Promise<Array<Token>> {
    const fetchToken = async (offset: number): Promise<Array<any>> => {
      let res = await (
        await fetch(`${CONSTANTS.API_URL}/tokens/balances?account=${address}&offset=${offset}&limit=${this.TZKT_TOKEN_QUERY_SIZE}&balance.ne=0`)
      ).json();
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
      { key: 'ttl', type: 'string' },
      { key: 'mintingTool', type: 'string' }
    ];
    let metadata: any = {};
    for (const a of keys) {
      if (typeof meta[a.key] === a.type) {
        if (a.toAsset) {
          // extract mime type
          if (meta?.formats?.length && Array.isArray(meta?.formats)) {
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
  private normalizeMetadata(meta: any, contractAddress: string, id: string) {
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
  handleMetadataExceptions(meta: any, contractAddress: string, id: string) {
    // hen
    if (meta?.symbol === 'OBJKT') {
      if (!meta.displayUri && meta.formats?.length) {
        meta.displayUri = meta.formats[0].uri;
      }
      if (meta.displayUri && meta.thumbnailUri) {
        delete meta.thumbnailUri;
      }
    }
    if (['KT1NVvPsNDChrLRH5K2cy6Sc9r1uuUwdiZQd', 'KT1CAbPGHUWvkSA9bxMPkqSgabgsjtmRYEda'].includes(contractAddress) /* Dogami */ && meta?.formats) {
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
        contractAddress === 'KT1Lz7Jd6Sh1zUE66nDGS7hGnjwcyTBCiYbF' /* BV */ ||
        contractAddress === 'KT1D1XtWFoQDPtuYzbkeRJhcDgH6CDem2FkZ' /* BV */ ||
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
  async getEntrypointMicheline(contract: string, entrypoint: string) {
    return (await (await fetch(`${CONSTANTS.API_URL}/contracts/${contract}/entrypoints/${entrypoint}?micheline=true&json=false`)).json())?.michelineParameters;
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
