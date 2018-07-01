import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { WalletService } from './wallet.service';
import { Activity } from '../interfaces';
import { TzscanService } from './tzscan.service';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { timeout, catchError, flatMap, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class ActivityService {
  maxTransactions = 10;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private tzscanService: TzscanService
  ) { }
  updateAllTransactions() {
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.updateTransactions(this.walletService.wallet.accounts[i].pkh)
        .subscribe((ans: any) => console.log(JSON.stringify(ans)),
          err => console.log('updateAllTransactions Error'),
          () => console.log('done update(' + i + '): ' + this.walletService.wallet.accounts[i].pkh));
    }
  }
  updateTransactions(pkh: string): Observable<any> {
    return this.getTransactonsCounter(pkh)
      .flatMap((ans: any) => {
        if (ans[0] && ans[0].save) {
          this.walletService.storeWallet();
        }
        return of(ans);
      });
  }
  getTransactonsCounter(pkh): Observable<any> {
    return this.tzscanService.numberOperations(pkh)
      .flatMap((number_operations: any) => {
        const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
        if (index === -1 || this.walletService.wallet.accounts[index].numberOfActivites !== number_operations[0]) {
          return this.getTransactions(pkh, number_operations[0]);
        } else {
          if (this.walletService.wallet.accounts[index].activities.findIndex(a => a.block === 'prevalidation') !== -1) {
            return this.getUnconfirmedTransactions(pkh);
          } else {
            return of(
              {
                upToDate: true
              });
          }
        }
      }
    );
  }
  // Try to validate unconfirmed transaction
  getUnconfirmedTransactions(pkh: string): Observable<any> {
    const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    let n = 0;
    for (let i = 0; i < this.walletService.wallet.accounts[index].activities.length; i++) {
      if (this.walletService.wallet.accounts[index].activities[i].block === 'prevalidation') {
        n = i + 1;
      } else {
        break;
      }
    }
    return this.tzscanService.operations(pkh, n)
        .flatMap((data: any) => {
        const aIndex = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
        const payload = [];
        for (let i = 0; i < data.length; i++) {
          if (this.walletService.wallet.accounts[aIndex].activities[i].hash === data[i].hash) {
            this.walletService.wallet.accounts[aIndex].activities[i].block = data[i].block_hash;
            const bIndex = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
            this.walletService.wallet.accounts[bIndex].activities[i].block = data[i].block_hash;
            if (data[i].block_hash !== 'prevalidation') {
              payload.push({
                block: data[i].block_hash,
                hash: data[i].hash
              });
            }
          }
        }
        return this.getTimestamps(pkh, payload);
      })
      ;
  }
  // Get latest transaction
  getTransactions(pkh: string, counter: number): Observable<any> {
    return this.tzscanService.operations(pkh, this.maxTransactions)
        .flatMap((data: any) => {
        const newTransactions: Activity[] = [];
        for (let i = 0; i < data.length; i++) {
          const op: any = this.tzscanService.getOp(data[i], pkh);
          console.log(JSON.stringify(op));
          newTransactions.push(op);
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
        return this.getTimestamps(pkh, payload);
      }
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
            timeout(5000)
            , catchError(error => {
              return of('Timeout');
            })
          )
        )
      ));
  }

  getTimestamp(pkh: string, block: string, hash): Observable<any> {
    return this.tzscanService.timestamp(block)
        .flatMap((time: any) => {
        const pkhIndex = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
        const transactionIndex = this.walletService.wallet.accounts[pkhIndex].activities.findIndex(a => a.hash === hash);
        if (time) { time = new Date(time); }
        this.walletService.wallet.accounts[pkhIndex].activities[transactionIndex].timestamp = time;
        return of(
          {
            save: true
          });
      });
  }
  getIndex(pkh: string): number {
    return this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
  }
}
