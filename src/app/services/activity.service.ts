import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from './message.service';
import { WalletService } from './wallet.service';
import { Activity } from '../interfaces';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { timeout, catchError, flatMap, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ActivityService {
  apiUrl = 'https://api.tzscan.io/';
  maxTransactions = 3;
  constructor(
    private walletService: WalletService,
    private http: HttpClient,
    private messageService: MessageService
  ) { }
  updateAllTransactions() {
    // console.log('updating transactions');
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      // console.log('start update(' + i + '): ' + this.walletService.wallet.accounts[i].pkh);
      // States to return: Modified structure, Up to date {save, upToDate}
      this.updateTransactions(this.walletService.wallet.accounts[i].pkh)
        .subscribe((ans: any) => console.log(JSON.stringify(ans)),
          err => console.log('some error'),
          () => console.log('done update(' + i + '): ' + this.walletService.wallet.accounts[i].pkh));
    }
  }
  // Show transactions for current pkh, then function call to see if current data is up to date
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
    return this.http.get(this.apiUrl + 'v1/number_operations/' + pkh)
      .flatMap((number_operations: any) => {
        const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
        if (index === -1 || this.walletService.wallet.accounts[index].numberOfActivites !== number_operations[0]) {
          // console.log('Requesting transactions');
          return this.getTransactions(pkh, number_operations[0]);
        } else {
          if (this.walletService.wallet.accounts[index].activities.findIndex(a => a.block === 'prevalidation') !== -1) {
            // console.log('Trying to validate blocks');
            return this.getUnconfirmedTransactions(pkh);
          } else {
            // console.log('Transactions up to date');
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
    // console.log('getUnconfirmedTransactions()');
    const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    let n = 0;
    for (let i = 0; i < this.walletService.wallet.accounts[index].activities.length; i++) {
      if (this.walletService.wallet.accounts[index].activities[i].block === 'prevalidation') {
        n = i + 1;
      } else {
        break;
      }
    }
    return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?number=' + n + '&p=0')
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
    // console.log('getTransactions()');
    return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?number=' + this.maxTransactions + '&p=0')
        .flatMap((data: any) => {
        const newTransactions: Activity[] = [];
        for (let i = 0; i < data.length; i++) {
          let type;
          if (pkh === data[i].type.source) {
            if (pkh === data[i].type.destination) {
              type = 'Transaction*';
            } else {
              type = 'Transaction'; // Send
              data[i].type.amount = data[i].type.amount * -1;
            }
          } else if (pkh === data[i].type.destination) {
            type = 'Transaction'; // Receive
          } else if (data[i].type.secret) {
            type = 'Activation';
          } else if (data[i].type.credit) {
            type = 'Origination';
          } else if (data[i].type.delegate) {
            type = 'Delegation';
          } else {
            type = 'Unknown';
            console.log('Unknown Type: ' + JSON.stringify(data[i]));
          }
          if (type === 'Origination') {
            newTransactions.push({
              hash: data[i].hash,
              block: data[i].block_hash,
              source: data[i].type.source,
              destination: data[i].type.tz1,
              amount: data[i].type.credit * -1,
              fee: data[i].type.fee,
              timestamp: null,
              type: type
            });
          } else {
            newTransactions.push({
              hash: data[i].hash,
              block: data[i].block_hash,
              source: data[i].type.source,
              destination: data[i].type.destination,
              amount: data[i].type.amount,
              fee: data[i].type.fee,
              timestamp: null,
              type: type
            });
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
          // console.log('Creating new transactions entry');
        } else {
          this.walletService.wallet.accounts[index].numberOfActivites = counter;
          this.walletService.wallet.accounts[index].activities = newTransactions;
          // console.log('Update transactions entry');
        }
        // console.log('from size ' + newTransactions.length);
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
    return this.http.get(this.apiUrl + 'v1/timestamp/' + block)
        .flatMap((time: any) => {
        // console.log('Got time');
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
