import { Component, Input, OnInit } from '@angular/core';
import { Account, Activity } from '../../../../services/wallet/wallet';
import { TimeAgoPipe } from '../../../../pipes/time-ago.pipe';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../services/message/message.service';
import { ActivityService } from '../../../../services/activity/activity.service';
import { TokenService } from '../../../../services/token/token.service';
import { CONSTANTS } from '../../../../../environments/environment';
import { LookupType } from '../../../../services/lookup/lookup.service';
import copy from 'copy-to-clipboard';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/activity/event.component.scss'],
})
export class EventComponent implements OnInit {
  public LookupType = LookupType
  public fresh = undefined;
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public timeAgoPipe: TimeAgoPipe,
    private activityService: ActivityService,
    public tokenService: TokenService
  ) { }
  trigger = true;
  @Input() activity: any;
  @Input() account: Account;
  ngOnInit(): void {
    setInterval(() => { this.trigger = !this.trigger }, 1000);
    if (this.activity.status === 1 && (new Date()).getTime() - 60000 < this.activity.timestamp) {
      this.fresh = true;
      setTimeout(() => {
        this.fresh = false;
      }, 20000);
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

  explorerURL(hash: string) {
    const baseURL = CONSTANTS.BLOCK_EXPLORER_URL;
    return `${baseURL}/${hash}`;
  }
  getCounterparty(transaction) {
    return this.activityService.getCounterparty(transaction, this.account);
  }
  getEventIcon() {
    return `../../../../assets/img/${LookupType[this.getCounterparty(this.activity)?.lookupType].toLowerCase().replace('tezosdomains', 'domain')}-logo.svg`;
  }
  printAmount(activity: Activity): string {
    switch (this.getType(activity).toLowerCase()) {
      case 'sent':
        return '- ' + this.tokenService.formatAmount(activity.tokenId, activity.amount.toString());
      case 'received':
        return '+ ' + this.tokenService.formatAmount(activity.tokenId, activity.amount.toString());
      case 'delegated':
        return 'Staked';
      case 'undelegated':
        return 'Unstaked';
      case 'origination':
        return '- ' + this.tokenService.formatAmount(activity.tokenId, activity.amount.toString());
      default:
        return '';
    }
  }
  sentKind(activity): string {
    if (activity.entrypoint) {
      if (activity.amount !== '0') {
        return `- ${this.printAmount(activity)}, Call ${activity.entrypoint}`;
      }
      return `Call ${activity.entrypoint}`;
    }
    return '0';
  }
  zeroSent(activity) {
    return (this.sentKind(activity).length > 4 && activity.amount === '0');
  }
  receivedKind(activity): string {
    return (activity.tokenId && activity.source.address && (activity.tokenId.split(':')[0] === activity.source.address)) ? 'Minted' : 'Received';
  }
  getAddressPrefix(type: string) {
    switch (type.toLowerCase()) {
      case 'sent':
        return 'Sent to:';
      case 'received':
        return this.receivedKind(this.activity) + ' from:';
      case 'delegated':
        return 'to:';
      case 'undelegated':
        return 'to:';
      case 'origination':
        return 'Originated contract:';
    }
  }
  copy(address: string) {
    copy(address);
    const copyToClipboard = this.translate.instant(
      'OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD'
    );
    this.messageService.add(address + ' ' + copyToClipboard, 5);
  }
}

