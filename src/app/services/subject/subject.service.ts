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
  token: TokenData;
}
@Injectable({
  providedIn: 'root'
})

export class SubjectService {
  public metadataUpdated = new BehaviorSubject<MetadataUpdated>(null);
  public prepareTokenTransfer = new Subject<PrepareTokenTransfer>();
  public nftsUpdated = new BehaviorSubject<any>({});
  public origin = new Subject<string>();
  public beaconResponse = new Subject<boolean>();
  public logout = new Subject<boolean>();
  constructor() { }
}
