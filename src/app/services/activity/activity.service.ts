import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { of, Observable, from as fromPromise } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Activity, Account } from '../wallet/wallet';
import { MessageService } from '../message/message.service';
import { LookupService } from '../lookup/lookup.service';
import { IndexerService } from '../indexer/indexer.service';

@Injectable()
export class ActivityService {
  maxTransactions = 10;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private lookupService: LookupService,
    private indexerService: IndexerService
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
    return fromPromise(this.indexerService.accountInfo(account.address)).pipe(
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
    return fromPromise(this.indexerService.getOperations(account.address)).pipe(
      flatMap((ans) => {
        if (Array.isArray(ans)) {
          const oldActivities = account.activities;
          account.activities = ans;
          const oldActivitiesCounter = account.activitiesCounter;
          account.activitiesCounter = counter;
          console.log(oldActivitiesCounter + ' # ' + counter);
          this.walletService.storeWallet();
          if (oldActivitiesCounter !== -1) { // Exclude inital loading
            this.promptNewActivities(account, oldActivities, ans);
          } else {
            console.log('# Excluded ' + counter);
          }
          for (const activity of ans) {
            const counterParty = this.getCounterparty(activity, account, false);
            this.lookupService.check(counterParty);
          }
        } else {
          console.log('#');
          console.log(ans);
        }
        return of({
          upToDate: false
        });
      })
    );
  }
  promptNewActivities(account: Account, oldActivities: Activity[], newActivities: Activity[]) {
    for (const activity of newActivities) {
      const index = oldActivities.findIndex((a) => a.hash === activity.hash);
      if (index === -1 || (index !== -1 && oldActivities[index].status === 0)) {
        if (activity.type === 'transaction') {
          if (account.address === activity.source) {
            this.messageService.addSuccess(account.shortAddress() + ': Sent ' + activity.amount / 1000000 + ' tez');
          }
          if (account.address === activity.destination) {
            this.messageService.addSuccess(account.shortAddress() + ': Received ' + activity.amount / 1000000 + ' tez');
          }
        } else if (activity.type === 'delegation') {
          this.messageService.addSuccess(account.shortAddress() + ': Delegate updated');
        } else if (activity.type === 'origination') {
          this.messageService.addSuccess(account.shortAddress() + ': Account originated');
        } else if (activity.type === 'activation') {
          this.messageService.addSuccess(account.shortAddress() + ': Account activated');
        }
      }
    }
  }
  getCounterparty(transaction: any, account: Account, withLookup = true): string {
    let counterParty = '';
    if (transaction.type === 'delegation') {
      if (transaction.destination) {
        counterParty = transaction.destination;
      } else {
        counterParty =  ''; // User has undelegated
      }
    } else if (transaction.type === 'transaction') {
      if (account.address === transaction.source) {
        counterParty =  transaction.destination; // to
      } else {
        counterParty =  transaction.source; // from
      }
    } else if (transaction.type === 'origination') {
      if (account.address === transaction.source) {
        counterParty =  transaction.destination;
      } else {
        counterParty =  transaction.source;
      }
    } else {
      counterParty =  '';
    }
    if (withLookup) {
      counterParty = this.lookupService.resolve(counterParty);
    }
    return counterParty;
  }
}
