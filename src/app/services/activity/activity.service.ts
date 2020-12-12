import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { of, Observable, from as fromPromise } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Activity, Account, ImplicitAccount } from '../wallet/wallet';
import { MessageService } from '../message/message.service';
import { LookupService } from '../lookup/lookup.service';
import { IndexerService } from '../indexer/indexer.service';
import Big from 'big.js';
import { CONSTANTS } from '../../../environments/environment';
import { TokenService } from '../token/token.service';

@Injectable()
export class ActivityService {
  maxTransactions = 10;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private lookupService: LookupService,
    private indexerService: IndexerService,
    private tokenService: TokenService
  ) { }
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
  getTransactonsCounter(account: Account): Observable<any> {
    this.tokenService
    const knownTokenIds: string[] = this.tokenService.knownTokenIds();
    return fromPromise(this.indexerService.accountInfo(account.address, knownTokenIds)).pipe(
      flatMap((data) => {
        const counter = data.counter;
        const unknownTokenIds = data.unknownTokenIds ? data.unknownTokenIds : [];
        if (account.state !== counter) {
          console.log(account.state + ' ' + counter);
          console.log('data', unknownTokenIds);
          this.handleUnknownTokenIds(unknownTokenIds);
          if (data.tokens) {
            this.updateTokenBalances(account, data.tokens);
          }
          return this.getAllTransactions(account, counter);
        } else {
          return of({
            upToDate: true,
          });
        }
      })
    );
  }
  private handleUnknownTokenIds(unknownTokenIds) {
    if (unknownTokenIds.length) {
      for (let tokenId of unknownTokenIds) {
        const tok = tokenId.split(':');
        this.tokenService.searchMetadata(tok[0], tok[1]);
      }
    }
  }
  async updateTokenBalances(account, tokens) {
    if (tokens && tokens.length) {
      for (const token of tokens) {
        const tokenId = `${token.contract}:${token.token_id}`;
        if (tokenId) {
          account.updateTokenBalance(tokenId, token.balance.toString());
        }
      }
    }
    this.walletService.storeWallet();
  }
  getAllTransactions(account: Account, counter: string): Observable<any> {
    const knownTokenIds: string[] = this.tokenService.knownTokenIds();
    return fromPromise(this.indexerService.getOperations(account.address, knownTokenIds)).pipe(
      flatMap((resp) => {
        const operations = resp.operations;
        this.handleUnknownTokenIds(resp.unknownTokenIds);
        if (Array.isArray(operations)) {
          const oldActivities = account.activities;
          account.activities = operations;
          const oldState = account.state;
          account.state = counter;
          this.walletService.storeWallet();
          if (oldState !== '') { // Exclude inital loading
            this.promptNewActivities(account, oldActivities, operations);
          } else {
            console.log('# Excluded ' + counter);
          }
          for (const activity of operations) {
            const counterParty = this.getCounterparty(activity, account, false);
            this.lookupService.check(counterParty);
          }
        } else {
          console.log('#');
          console.log(operations);
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
            this.messageService.addSuccess(account.shortAddress() + ': Sent ' + this.tokenService.formatAmount(activity.tokenId, activity.amount.toString()));
          }
          if (account.address === activity.destination) {
            this.messageService.addSuccess(account.shortAddress() + ': Received ' + this.tokenService.formatAmount(activity.tokenId, activity.amount.toString()));
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
        counterParty = ''; // User has undelegated
      }
    } else if (transaction.type === 'transaction') {
      if (account.address === transaction.source) {
        counterParty = transaction.destination; // to
      } else {
        counterParty = transaction.source; // from
      }
    } else if (transaction.type === 'origination') {
      if (account.address === transaction.source) {
        counterParty = transaction.destination;
      } else {
        counterParty = transaction.source;
      }
    } else {
      counterParty = '';
    }
    if (withLookup) {
      counterParty = this.lookupService.resolve(counterParty);
    }
    return counterParty;
  }
}
