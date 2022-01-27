import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { of, Observable, from as fromPromise } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { delay, takeUntil } from 'rxjs/operators';
import { Activity, Account, OpStatus } from '../wallet/wallet';
import { MessageService } from '../message/message.service';
import { LookupService } from '../lookup/lookup.service';
import { IndexerService } from '../indexer/indexer.service';
import { TokenService } from '../token/token.service';
import { BehaviorSubject } from 'rxjs';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class ActivityService {
  readonly maxTransactions = 10;
  public tokenBalanceUpdated = new BehaviorSubject(null);
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private lookupService: LookupService,
    private indexerService: IndexerService,
    private tokenService: TokenService,
    private subjectService: SubjectService
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
  getTransactonsCounter(account: Account): Observable<any> {
    const knownTokenIds: string[] = this.tokenService.knownTokenIds();
    return fromPromise(this.indexerService.accountInfo(account.address, knownTokenIds)).pipe(
      flatMap((data) => {
        const counter = data.counter;
        const unknownTokenIds = data.unknownTokenIds ? data.unknownTokenIds : [];
        this.handleUnknownTokenIds(unknownTokenIds);
        if (account.state !== counter) {
          if (data.tokens) {
            this.updateTokenBalances(account, data.tokens);
          } else {
            this.updateTokenBalances(account, []);
          }
          return this.getAllTransactions(account, counter);
        } else {
          if (!account.state) {
            if (!account.activities || !account.tokens) {
              if (!account.activities) {
                account.activities = [];
              }
              if (!account.tokens) {
                account.tokens = [];
              }
              this.updateTokenBalances(account, []);
              this.walletService.storeWallet();
            }
          }
          return of({
            upToDate: true,
            balance: data?.balance ? data.balance : 0
          });
        }
      })
    );
  }
  private handleUnknownTokenIds(unknownTokenIds) {
    if (unknownTokenIds.length) {
      for (const tokenId of unknownTokenIds) {
        const tok = tokenId.split(':');
        this.tokenService.searchMetadata(tok[0], tok[1]);
      }
    }
  }
  async updateTokenBalances(account, tokens) {
    if (Array.isArray(tokens)) {
      const idsWithBalance: string[] = [];
      if (!tokens.length) {
        account.updateTokenBalance('', '');
      } else {
        for (const token of tokens) {
          const tokenId = `${token.contract}:${token.token_id}`;
          idsWithBalance.push(tokenId);
          if (tokenId) {
            account.updateTokenBalance(tokenId, token.balance.toString());
          }
        }
        const currentTokenIds = account.getTokenBalances().map((token) => {
          return token.tokenId;
        });
        for (const tokenId of currentTokenIds) {
          if (!idsWithBalance.includes(tokenId)) {
            account.updateTokenBalance(tokenId, '0');
          }
        }
      }
      this.tokenBalanceUpdated.next(true);
      this.walletService.storeWallet();
    }
  }
  getAllTransactions(account: Account, counter: string): Observable<any> {
    const knownTokenIds: string[] = this.tokenService.knownTokenIds();
    return fromPromise(this.indexerService.getOperations(account.address, knownTokenIds, this.walletService.wallet)).pipe(
      flatMap((resp) => {
        const operations = resp.operations;
        this.handleUnknownTokenIds(resp.unknownTokenIds);
        if (Array.isArray(operations)) {
          const oldActivities = account.activities;
          const unconfirmedOps = [];
          if (oldActivities && oldActivities.length) {
            for (let op of oldActivities) {
              if (op.status === OpStatus.UNCONFIRMED || op.status === OpStatus.HALF_CONFIRMED) {
                let save = true;
                for (const opNew of operations) {
                  if (opNew.hash === op.hash) {
                    save = false;
                    break;
                  }
                }
                if (save) {
                  unconfirmedOps.push(op);
                }
              }
            }
          }
          account.activities = unconfirmedOps.concat(operations);
          const oldState = account.state;
          account.state = counter;
          this.walletService.storeWallet();
          if (oldState !== '') {
            // Exclude inital loading
            this.promptNewActivities(account, oldActivities, operations);
          }
          for (const activity of operations) {
            const counterParty = this.getCounterparty(activity, account, false);
            this.lookupService.check(counterParty);
          }
        }
        return of({
          upToDate: false
        });
      })
    );
  }
  promptNewActivities(account: Account, oldActivities: Activity[], newActivities: Activity[]) {
    for (const activity of newActivities) {
      const index = oldActivities.findIndex((a) => a.hash === activity.hash && a.status === OpStatus.CONFIRMED);
      if (index === -1) {
        const now = new Date().getTime();
        const timeDiff = now - (activity?.timestamp ? activity.timestamp : now);
        if (timeDiff < 1800000) {
          // 1/2 hour
          if (activity.hash) {
            setTimeout(() => {
              this.subjectService.confirmedOp.next(activity.hash);
            }, 0);
          }
          if (activity.type === 'transaction') {
            if (account.address === activity.source.address) {
              this.messageService.addSuccess(account.shortAddress() + ': Sent ' + this.tokenService.formatAmount(activity.tokenId, activity.amount.toString()));
            }
            if (account.address === activity.destination.address) {
              const ref = activity.tokenId ? Date.now().toString() + activity.tokenId : '';
              this.messageService.addSuccess(
                (account.shortAddress() + ': Received ' + this.tokenService.formatAmount(activity.tokenId, activity.amount.toString())).replace(
                  '[Unknown token]',
                  'Token'
                ),
                undefined,
                ref
              );
              if (activity.tokenId && this.tokenService.getAsset(activity.tokenId) === null) {
                // unknown token
                this.subjectService.metadataUpdated.pipe(takeUntil(of(true).pipe(delay(8000)))).subscribe((token: any) => {
                  // unsub after 8s
                  if (token?.contractAddress && token.id !== undefined) {
                    const tokenId = token.contractAddress + ':' + token.id.toString();
                    if (activity.tokenId === tokenId) {
                      this.messageService.modify(
                        account.shortAddress() + ': Received ' + this.tokenService.formatAmount(activity.tokenId, activity.amount.toString()),
                        ref
                      );
                    }
                  }
                });
              }
            }
          } else if (activity.type === 'delegation') {
            this.messageService.addSuccess(account.shortAddress() + ': Delegate updated');
          } else if (activity.type === 'origination') {
            this.messageService.addSuccess(account.shortAddress() + ': Contract originated');
          } else if (activity.type === 'activation') {
            this.messageService.addSuccess(account.shortAddress() + ': Account activated');
          }
          const counter = this.getCounterparty(activity, account, false);
          if (counter?.address) {
            this.lookupService.check(counter.address, true);
          }
        }
      }
    }
  }
  getCounterparty(transaction: Activity, account: Account, withLookup = true): any {
    let counterParty = { address: '' };
    if (transaction.type === 'delegation') {
      if (transaction.destination) {
        counterParty = transaction.destination;
      } else {
        counterParty = { address: '' }; // User has undelegated
      }
    } else if (transaction.type === 'transaction') {
      if (account.address === transaction.source.address) {
        counterParty = transaction.destination; // to
      } else {
        counterParty = transaction.source; // from
      }
    } else if (transaction.type === 'origination') {
      if (account.address === transaction.source.address) {
        counterParty = transaction.destination ? transaction.destination : { address: '' };
      } else {
        counterParty = transaction.source;
      }
    } else {
      counterParty = { address: '' };
    }
    if (withLookup) {
      return this.lookupService.resolve(counterParty);
    } else {
      return counterParty;
    }
  }
}
