import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Account, Activity, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';
import { WalletService } from '../../services/wallet/wallet.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../services/message/message.service';
import * as copy from 'copy-to-clipboard';
import { filter } from 'rxjs/internal/operators/filter';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { CONSTANTS } from '../../../environments/environment';
import { LookupService } from '../../services/lookup/lookup.service';
import { ActivityService } from '../../services/activity/activity.service';
import Big from 'big.js';
import { TokenService, TokenResponseType } from '../../services/token/token.service';

@Component({
  selector: 'app-account-view',
  templateUrl: './account-view.component.html',
  styleUrls: ['./account-view.component.scss'],
})
export class AccountViewComponent implements OnInit {
  account: Account;
  constructor(
    private route: ActivatedRoute,
    private walletService: WalletService,
    public translate: TranslateService,
    public messageService: MessageService,
    public timeAgoPipe: TimeAgoPipe,
    private router: Router,
    private coordinatorService: CoordinatorService,
    private lookupService: LookupService,
    private activityService: ActivityService,
    public tokenService: TokenService
  ) { }
  trigger = true;
  @Input() activity: any;
  ngOnInit(): void {
    if (!this.walletService.wallet) {
      this.router.navigate(['']);
    } else {
      this.coordinatorService.startAll();
      let address = this.route.snapshot.paramMap.get('address');
      if (this.walletService.addressExists(address)) {
        this.account = this.walletService.wallet.getAccount(address);
      }
      this.router.events
        .pipe(filter((evt) => evt instanceof NavigationEnd))
        .subscribe(() => {
          address = this.route.snapshot.paramMap.get('address');
          if (this.walletService.wallet && this.walletService.addressExists(address)) {
            this.account = this.walletService.wallet.getAccount(address);
          }
        });
      setInterval(() => this.trigger = !this.trigger, 1000);
    }
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
  copy(account: Account) {
    copy(account.address);
    const copyToClipboard = this.translate.instant(
      'OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD'
    );
    this.messageService.add(account.address + ' ' + copyToClipboard, 5);
  }
  explorerURL(hash: string) {
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
  zeroSent(activity) {
    return (this.sentKind(activity).length > 4 && activity.amount === '0');
  }
  receivedKind(activity): string {
    return (activity.tokenId && activity.source.address && (activity.tokenId.split(':')[0] === activity.source.address)) ? 'Minted' : 'Received';
  }
  displayTokenCard(): boolean {
    return (this.account instanceof ImplicitAccount) || (this.account?.tokens?.length > 0);
  }
}

