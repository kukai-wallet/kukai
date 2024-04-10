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
        //console.debug('delegate for ' + account.address + ' up to date');
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
      fetch('https://api.ghostnet.tzkt.io/v1/accounts/tz1YgDUQV2eXm8pUWNz3S5aWP86iFzNp4jnD')
        .then((r) => r.json())
        .then((k) => {
          const freeSpace = Math.round((k.balance * 10 - k.stakingBalance) / 10 ** 6);
          this.delegates.next([
            {
              address: 'tz1YgDUQV2eXm8pUWNz3S5aWP86iFzNp4jnD',
              estimatedRoi: 0,
              fee: 0.2,
              freeSpace,
              logo: 'https://services.tzkt.io/v1/avatars/tz1S5WxdZR5f9NzsPXhr7L9L1vrEb5spZFur',
              minDelegation: 0,
              name: 'Baking Benjamins',
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
