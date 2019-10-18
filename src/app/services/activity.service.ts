import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { WalletService } from './wallet.service';
import { Activity } from '../interfaces';
import { TzscanService } from './tzscan.service';
import { ConseilService } from './conseil.service';
import { of, forkJoin, Observable } from 'rxjs';
import { timeout, catchError, flatMap, mergeMap } from 'rxjs/operators';


@Injectable()
export class ActivityService {
  maxTransactions = 10;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private tzscanService: TzscanService,
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
  // Get latest transaction
  getTransactions(pkh: string, counter: number): Observable<any> {
    return this.tzscanService.operations(pkh, this.maxTransactions)
      .pipe(flatMap((data: any) => {
        const newTransactions: Activity[] = [];
        for (let i = 0; i < data.length; i++) {
          const ops: any = this.tzscanService.getOp(data[i], pkh);
          for (let j = 0; j < ops.length; j++) {
            newTransactions.push(ops[j]);
          }
        }
        const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
        if (index === -1) {
          this.walletService.wallet.accounts.push({
            pkh: pkh,
            delegate: '',
            balance: this.walletService.emptyBalance(),
            numberOfActivites: counter,
            activities: newTransactions
          });
        } else {
          this.walletService.wallet.accounts[index].numberOfActivites = counter;
          this.walletService.wallet.accounts[index].activities = newTransactions;
        }
        const payload = [];
        for (let i = 0; i < newTransactions.length; i++) {
          if (newTransactions[i].block !== 'prevalidation') {
            payload.push({
              block: newTransactions[i].block,
              hash: newTransactions[i].hash
            });
          }
        }
        return this.getTimestamps(pkh, payload)
          .pipe(flatMap(
            (res: any) => { // Sort
              const pkhIndex = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
              let cpy: any = this.walletService.wallet.accounts[pkhIndex].activities;
              cpy = cpy.sort((a, b) => b.timestamp - a.timestamp);
              this.walletService.wallet.accounts[pkhIndex].activities = cpy;
              return of(res);
            }
          ));
      })
      );
  }
  getTimestamps(pkh: string, payloads: any[]): Observable<any> {
    if (payloads.length === 0) {
      return of('EmptyPayload');
    }
    return forkJoin(of.apply(this, payloads)
      .pipe(
        flatMap((payload: any) =>
          this.getTimestamp(pkh, payload.block, payload.hash).pipe(
            timeout(20000)
            , catchError(error => {
              return of('Timeout');
            })
          )
        )
      ));
  }

  getTimestamp(pkh: string, block: string, hash: string): Observable<any> {
    return this.tzscanService.timestamp(block)
      .pipe(flatMap((time: any) => {
        if (time) { time = new Date(time); }
        const pkhIndex = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
        for (let ti = 0; ti < this.walletService.wallet.accounts[pkhIndex].activities.length; ti++) {
          if (this.walletService.wallet.accounts[pkhIndex].activities[ti].hash === hash) {
            this.walletService.wallet.accounts[pkhIndex].activities[ti].block = block;
            this.walletService.wallet.accounts[pkhIndex].activities[ti].timestamp = time;
          }
        }
        return of(
          {
            save: true
          });
      }));
  }
  getIndex(pkh: string): number {
    return this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
  }
}
