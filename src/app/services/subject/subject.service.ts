import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TokenData } from '../token/token.service';
import { Account } from '../wallet/wallet';

interface PrepareTokenTransfer {
  account: Account;
  tokenTransfer: string;
  symbol: string;
}
interface MetadataUpdated {
  contractAddress: string;
  id: number;
  token: TokenData;
}
@Injectable({
  providedIn: 'root'
})

export class SubjectService {
  public metadataUpdated: BehaviorSubject<MetadataUpdated>;
  public markets: BehaviorSubject<any>;
  public confirmedOp: Subject<string>;
  public prepareTokenTransfer: Subject<PrepareTokenTransfer>;
  public nftsUpdated: BehaviorSubject<any>;
  public origin: Subject<string>;
  public beaconResponse: Subject<boolean>;
  public logout: Subject<boolean>;
  constructor() {
    this.init();
    this.logout.subscribe(o => {
      if (o) {
        this.reset();
      }
    })
  }
  init() {
    this.metadataUpdated = new BehaviorSubject<MetadataUpdated>(null);
    this.markets = new BehaviorSubject<any>([]);
    this.confirmedOp = new Subject<string>();
    this.prepareTokenTransfer = new Subject<PrepareTokenTransfer>();
    this.nftsUpdated = new BehaviorSubject<any>(undefined);
    this.origin = new Subject<string>();
    this.beaconResponse = new Subject<boolean>();
    this.logout = new Subject<boolean>();
  }
  reset() {
    this.metadataUpdated.next(null);
    this.markets.next([]);
    this.nftsUpdated.next(undefined);
  }
}
