import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { OperationService } from '../operation/operation.service';
import { Account } from '../wallet/wallet';
import { CONSTANTS } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable()
export class DelegateService {
  private readonly network = CONSTANTS.NETWORK.replace('edonet', 'edo2net');
  public readonly bcd = 'https://api.baking-bad.org/v2';
  public readonly tzkt = `https://staging.api.${this.network}.tzkt.io/v1`;
  public delegates = new BehaviorSubject<any>([]);

  constructor(private walletService: WalletService, private operationService: OperationService, public router: Router, private location: Location) {
    const path = this.location.path();
    const embedded = path.startsWith('/embedded');
    if (!embedded) {
      this.getDelegates();
    }
  }
  getDelegate(account: Account) {
    this.operationService.getDelegate(account.address).subscribe(
      (data: any) => {
        if (data.success) {
          this.handleDelegateResponse(account, data.payload.delegate);
        }
      },
      (err) => console.log(JSON.stringify(err))
    );
  }
  handleDelegateResponse(account: Account, data: any) {
    if (data) {
      if (account.delegate !== data) {
        account.delegate = data;
        this.walletService.storeWallet();
      } else {
        console.log('delegate for ' + account.address + ' up to date');
      }
    } else {
      if (account.delegate !== '') {
        account.delegate = '';
        this.walletService.storeWallet();
      }
    }
  }
  getDelegates(): void {
    fetch(`${this.bcd}/bakers`)
      .then((response) => response.json())
      .then((d) => this.delegates.next(d));
  }

  resolveDelegateByAddress(address: string): Promise<any> {
    return new Promise((resolve) => {
      this.delegates.pipe(take(1)).subscribe((d) => resolve(d?.find((d) => d?.address === address)));
    });
  }
}
