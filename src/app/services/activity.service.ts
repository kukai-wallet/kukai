import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { WalletService } from './wallet.service';
import { Activity } from '../interfaces';
import { ConseilService } from './conseil.service';
import { of, forkJoin, Observable } from 'rxjs';
import { timeout, catchError, flatMap, mergeMap } from 'rxjs/operators';


@Injectable()
export class ActivityService {
  maxTransactions = 10;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private conseilService: ConseilService
  ) { }
  updateTransactions(pkh): Observable<any> {
    try {
      return this.getTransactonsCounter(pkh)
        .pipe(flatMap((ans: any) => {
          return of(ans);
        }));
    } catch (e) {
      console.log(e);
    }
  }
  getTransactonsCounter(pkh): Observable<any> {
    return this.conseilService.accountInfo(pkh).pipe(flatMap((counter) => {
      const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
      if (index === -1 || this.walletService.wallet.accounts[index].numberOfActivites !== counter) {
        return this.getAllTransactions(pkh, counter);
      } else {
        return of(
          {
            upToDate: true
          });
      }
    }
    ));
  }
  getAllTransactions(pkh, counter): Observable<any> {
    return this.conseilService.getOperations(pkh).pipe(flatMap((ans) => {
      const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
      if ((this.walletService.wallet.accounts[index].activities.length === 0 && ans.length > 0) ||
        (ans.length > 0 &&
          this.walletService.wallet.accounts[index].activities[0].hash !== ans[0].hash)) {
        this.walletService.wallet.accounts[index].activities = ans;
        this.walletService.wallet.accounts[index].numberOfActivites = counter;
        this.walletService.storeWallet();
      } else {
        if (this.walletService.wallet.accounts[index].numberOfActivites === 0) {
          this.walletService.wallet.accounts[index].numberOfActivites = counter;
        }
      }
      return of(
        {
          upToDate: false
        });
    }
    ));
  }
  getIndex(pkh: string): number {
    return this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
  }
}
