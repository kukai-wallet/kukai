import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Account, Activity, ImplicitAccount } from '../../../../services/wallet/wallet';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { TimeAgoPipe } from '../../../../pipes/time-ago.pipe';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../services/message/message.service';
import * as copy from 'copy-to-clipboard';
import { CONSTANTS } from '../../../../../environments/environment';
import { ActivityService } from '../../../../services/activity/activity.service';
import { TokenService } from '../../../../services/token/token.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['../../../../../scss/components/views/logged-in/account-view/account-view.component.scss']
})
export class AccountViewComponent implements OnInit, OnDestroy {
  account: Account;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private walletService: WalletService,
    public translate: TranslateService,
    public messageService: MessageService,
    public timeAgoPipe: TimeAgoPipe,
    private activityService: ActivityService,
    public tokenService: TokenService
  ) {}
  trigger = true;
  @Input() activity: any;
  ngOnInit(): void {
    this.subscriptions.add(
      this.walletService.activeAccount.subscribe((activeAccount) => {
        this.account = activeAccount;
      })
    );
    setInterval(() => (this.trigger = !this.trigger), 1000);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  getType(transaction: Activity): string {
    if (transaction.type !== 'transaction') {
      if (transaction.type === 'delegation') {
        if (transaction.destination.address) {
          return 'delegated';
        } else {
          return 'undelegated';
        }
      } else {
        return transaction.type;
      }
    } else {
      let operationType = '';
      if (transaction.source.address === this.account.address) {
        operationType = 'sent';
      } else {
        operationType = 'received';
      }
      return operationType;
    }
  }

  getCounterparty(transaction: any): string {
    return this.activityService.getCounterparty(transaction, this.account);
  }
  copy(account: Account): void {
    copy(account.address);
    const copyToClipboard = this.translate.instant('OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD');
    this.messageService.add(account.address + ' ' + copyToClipboard, 5);
  }
  explorerURL(hash: string): string {
    const baseURL = CONSTANTS.BLOCK_EXPLORER_URL;
    return `${baseURL}/${hash}`;
  }
  printAmount(activity: Activity): string {
    return this.tokenService.formatAmount(activity.tokenId, activity.amount.toString());
  }
  sentKind(activity): string {
    if (activity.entrypoint) {
      return `Called ${activity.entrypoint}`;
    }
    return 'Sent';
  }
  zeroSent(activity): boolean {
    return this.sentKind(activity).length > 4 && activity.amount === '0';
  }
  receivedKind(activity): string {
    return activity.tokenId && activity.source.address && activity.tokenId.split(':')[0] === activity.source.address ? 'Minted' : 'Received';
  }
  displayTokenCard(): boolean {
    return this.account instanceof ImplicitAccount || this.account?.tokens?.length > 0;
  }
}
