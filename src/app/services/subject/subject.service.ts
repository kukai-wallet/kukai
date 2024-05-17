import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TokenData } from '../token/token.service';
import { ContractAlias, DiscoverItem } from '../kukai/kukai.service';
import { Account } from '../wallet/wallet';
import { CONSTANTS } from '../../../environments/environment';

interface PrepareTokenTransfer {
  account: Account;
  tokenTransfer: string;
  symbol: string;
}
export enum BuyProvider {
  Coinbase = 0,
  Transak,
  MoonPay
}
interface MetadataUpdated {
  contractAddress: string;
  id: string;
  token: TokenData;
}
export const KUKAI_SERVICE_EXPLORE_KEY = 'kukai-service-explore';
export const KUKAI_SERVICE_DISCOVER_KEY = 'kukai-service-discover';
@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  public activeAccount = new BehaviorSubject(null);
  public walletUpdated = new BehaviorSubject(null);
  public metadataUpdated: BehaviorSubject<MetadataUpdated>;
  public refreshTokens: BehaviorSubject<null>;
  public confirmedOp: Subject<string>;
  public prepareTokenTransfer: Subject<PrepareTokenTransfer>;
  public nftsUpdated: BehaviorSubject<any>;
  public origin: BehaviorSubject<string>;
  public beaconResponse: Subject<boolean>;
  public login: Subject<boolean>;
  public logout: Subject<boolean>;
  public buy: Subject<BuyProvider>;
  public wc2: Subject<any>;
  public blocklist: BehaviorSubject<string[]>;
  public contractAliases: BehaviorSubject<ContractAlias[]>;
  public discoverItems: BehaviorSubject<DiscoverItem[]>;
  constructor() {
    this.init();
    this.logout.subscribe((o) => {
      if (o) {
        this.reset();
      }
    });
  }
  init() {
    this.metadataUpdated = new BehaviorSubject<MetadataUpdated>(null);
    this.refreshTokens = new BehaviorSubject<any>([]);
    this.confirmedOp = new Subject<string>();
    this.prepareTokenTransfer = new Subject<PrepareTokenTransfer>();
    this.refreshTokens = new BehaviorSubject<null>(null);
    this.nftsUpdated = new BehaviorSubject<any>(undefined);
    this.origin = new BehaviorSubject<string>(null);
    this.beaconResponse = new Subject<boolean>();
    this.login = new Subject<boolean>();
    this.logout = new Subject<boolean>();
    this.buy = new Subject<BuyProvider>();
    this.wc2 = new Subject<any>();
    this.initKukaiService();
  }
  private initKukaiService() {
    try {
      const explore = JSON.parse(localStorage.getItem(KUKAI_SERVICE_EXPLORE_KEY));
      const env = CONSTANTS.MAINNET ? explore.data.environment.mainnet : explore.data.environment.ghostnet;
      env.blockList && env.contractAliases;
      this.blocklist = new BehaviorSubject<string[]>(env.blockList);
      this.contractAliases = new BehaviorSubject<ContractAlias[]>(env.contractAliases);
    } catch (e) {
      this.blocklist = new BehaviorSubject<string[]>([]);
      this.contractAliases = new BehaviorSubject<ContractAlias[]>([]);
    }
    try {
      const discover = JSON.parse(localStorage.getItem(KUKAI_SERVICE_DISCOVER_KEY));
      discover.data.length;
      const all = discover.data.find((e) => e?.title === 'All').items;
      all.length;
      this.discoverItems = new BehaviorSubject<DiscoverItem[]>(all);
    } catch (e) {
      this.discoverItems = new BehaviorSubject<DiscoverItem[]>([]);
    }
  }
  reset() {
    this.metadataUpdated.next(null);
    this.refreshTokens.next(null);
    this.nftsUpdated.next(undefined);
  }
}
