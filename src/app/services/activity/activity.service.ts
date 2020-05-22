import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { ConseilService } from '../conseil/conseil.service';
import { of, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Activity } from '../wallet/wallet';

@Injectable()
export class ActivityService {
  maxTransactions = 10;
  constructor(
    private walletService: WalletService,
    private conseilService: ConseilService
  ) {}
  updateTransactions(pkh): Observable<any> {
    try {
      const account = this.walletService.wallet.getAccount(pkh);
      return this.getTransactonsCounter(account).pipe(
        flatMap((ans: any) => {
          return of(ans);
        })
      );
    } catch (e) {
      console.log(e);
    }
  }
  getTransactonsCounter(account): Observable<any> {
    return this.conseilService.accountInfo(account.address).pipe(
      flatMap((counter) => {
        if (account.activitiesCounter !== counter) {
          return this.getAllTransactions(account, counter);
        } else {
          return of({
            upToDate: true,
          });
        }
      })
    );
  }
  getAllTransactions(account, counter): Observable<any> {
    return this.conseilService.getOperations(account.address).pipe(
      flatMap((ans) => {
        if (
          (account.activities.length === 0 && ans.length > 0) ||
          (ans.length > 0 && account.activities[0].hash !== ans[0].hash)
        ) {
          const oldActivities = account.activities;
          account.activities = ans;
          account.activitiesCounter = counter;
          this.walletService.storeWallet();
        } else if (account.activitiesCounter === 0) {
          account.activitiesCounter = counter;
          this.walletService.storeWallet();
        }
        return of({
          upToDate: false
        });
      })
    );
  }
}
