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
  public readonly bb = 'https://api.baking-bad.org/v3';
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
    if (CONSTANTS.TEZOS_X) {
      // Delegation and staking are not supported on Tezos X
      return;
    }
    if (CONSTANTS.MAINNET) {
      fetch(`${this.bb}/bakers`)
        .then((response) => response.json())
        .then((d) => this.delegates.next(d));
    } else if (CONSTANTS.NETWORK === 'shadownet') {
      this.delegates.next([
        {
          address: 'tz1LHvQWc46rtzVvpKq5QdTcLdzAH1o6YCmU',
          name: 'Baking Benjamins',
          status: 'active',
          balance: 2656351,
          features: [
            {
              title: 'Contribution',
              content: {
                project: 'BakeBuddy',
                link: 'https://www.bakebuddy.xyz/'
              }
            }
          ],
          delegation: {
            enabled: true,
            minBalance: 0.01,
            fee: 0.2,
            capacity: 22460967,
            freeSpace: 21871634,
            estimatedApy: 0.0448,
            features: [
              {
                title: 'Distributed rewards',
                content: "Baker doesn't pay denunciation and revelation rewards"
              }
            ]
          },
          staking: {
            enabled: true,
            minBalance: 0,
            fee: 0.1,
            capacity: 22460967,
            freeSpace: 21834186,
            estimatedApy: 0.1512,
            features: []
          }
        }
      ]);
    }
  }

  resolveDelegateByAddress(address: string): Promise<any> {
    return new Promise((resolve) => {
      this.delegates.pipe(take(1)).subscribe((d) => resolve(d?.find((d) => d?.address === address)));
    });
  }

  getLogoURL(address: string): string {
    return `https://services.tzkt.io/v1/logos/${address}.png`;
  }
}
