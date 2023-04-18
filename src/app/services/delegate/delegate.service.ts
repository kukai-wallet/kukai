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
  public readonly bb = 'https://api.baking-bad.org/v2';
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
    if (CONSTANTS.NETWORK !== 'ghostnet') {
      fetch(`${this.bb}/bakers`)
        .then((response) => response.json())
        .then((d) => this.delegates.next(d));
    } else {
      fetch('https://api.ghostnet.tzkt.io/v1/accounts/tz1Kukaiq96AJyqaHWn69XxTBrjUEB4sXSBq')
        .then((r) => r.json())
        .then((k) => {
          const freeSpace = Math.round((k.balance * 10 - k.stakingBalance) / 10 ** 6);
          this.delegates.next([
            {
              address: 'tz1Kukaiq96AJyqaHWn69XxTBrjUEB4sXSBq',
              estimatedRoi: 0,
              fee: 0,
              freeSpace,
              logo: `${window.location.origin}/assets/img/header-logo.png`,
              minDelegation: 0,
              name: 'Kukai Baker',
              openForDelegation: true,
              payoutAccuracy: 'precise',
              serviceType: 'tezos_only'
            }
          ]);
        });
    }
  }

  resolveDelegateByAddress(address: string): Promise<any> {
    return new Promise((resolve) => {
      this.delegates.pipe(take(1)).subscribe((d) => resolve(d?.find((d) => d?.address === address)));
    });
  }
}
