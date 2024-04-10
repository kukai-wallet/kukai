import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Account, Activity, OpStatus } from '../../../../../../services/wallet/wallet';
import { TimeAgoPipe } from '../../../../../../pipes/time-ago.pipe';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../../../services/message/message.service';
import { ActivityService } from '../../../../../../services/activity/activity.service';
import { TokenService } from '../../../../../../services/token/token.service';
import { CONSTANTS } from '../../../../../../../environments/environment';
import { LookupType } from '../../../../../../services/lookup/lookup.service';
import copy from 'copy-to-clipboard';
import { SubjectService } from '../../../../../../services/subject/subject.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['../../../../../../../scss/components/views/logged-in/account-view/cards/activity/event.component.scss']
})
export class EventComponent implements OnInit, OnChanges, OnDestroy {
  public OpStatus = OpStatus;
  public LookupType = LookupType;
  public fresh = undefined;
  private subscriptions: Subscription = new Subscription();
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public timeAgoPipe: TimeAgoPipe,
    private activityService: ActivityService,
    public tokenService: TokenService,
    private subjectService: SubjectService
  ) {}
  trigger = true;
  @Input() activity: Activity;
  @Input() account: Account;
  ngOnInit(): void {
    setInterval(() => {
      this.trigger = !this.trigger;
    }, 1000);
    this.subscriptions.add(
      this.subjectService.confirmedOp.subscribe((opHash) => {
        if (opHash === this.activity.hash && this.fresh === undefined) {
          this.fresh = true;
          setTimeout(() => {
            this.fresh = false;
          }, 20000);
        }
      })
    );
  }
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  getType(): string {
    if (this.activity.type !== 'transaction') {
      if (this.activity.type === 'delegation') {
        if (this.activity.destination.address) {
          return 'delegated';
        } else {
          return 'undelegated';
        }
      } else {
        return this.activity.type;
      }
    } else {
      let operationType = '';
      if (this.activity.source.address === this.account.address) {
        operationType = 'sent';
      } else {
        operationType = 'received';
      }
      return operationType;
    }
  }

  explorerURL(hash: string): string {
    const baseURL = CONSTANTS.BLOCK_EXPLORER_URL;
    return `${baseURL}/${hash}`;
  }
  getCounterparty(transaction): any {
    const c = this.activityService.getCounterparty(transaction, this.account);
    if (!c.name) {
      c.name = c.address ? `${c.address.slice(0, 7)}...${c.address.slice(-4)}` : '—';
    }
    c.name.trim();
    return c;
  }
  getEventIcon(): string {
    return `../../../../assets/img/${LookupType[this.getCounterparty(this.activity)?.lookupType].toLowerCase().replace('tezosdomains', 'domain')}-logo.svg`;
  }
  getEventStatusIcon(): string {
    return this.fresh && this.activity.status === OpStatus.CONFIRMED
      ? '../../../../assets/img/event-new.png'
      : this.activity.status === OpStatus.CONFIRMED
      ? '../../../../assets/img/event-confirmed.png'
      : this.activity.status === OpStatus.UNCONFIRMED
      ? '../../../../assets/img/event-unconfirmed.png'
      : this.activity.status === OpStatus.FAILED
      ? '../../../../assets/img/event-error.png'
      : this.activity.status === OpStatus.HALF_CONFIRMED
      ? '../../../../../assets/img/event-half-confirmed.png'
      : '../../../../assets/img/event-unconfirmed.png';
  }
  printAmount(): string {
    switch (this.getType()) {
      case 'sent':
        return this.tokenService.formatAmount(this.activity.tokenId, this.activity.amount.toString());
      case 'received':
        return this.tokenService.formatAmount(this.activity.tokenId, this.activity.amount.toString());
      case 'delegated':
        return 'Staked';
      case 'undelegated':
        return 'Unstaked';
      case 'origination':
        return 'Originated';
      default:
        return '';
    }
  }
  sentKind(activity): string {
    if (activity.entrypoint) {
      if (activity.amount !== '0') {
        return `${this.printAmount()}, Call ${activity.entrypoint}`;
      }
      return `Call ${activity.entrypoint}`;
    }
    return '0';
  }
  zeroSent(activity): boolean {
    return this.sentKind(activity).length > 4 && activity.amount === '0';
  }
  receivedKind(activity): string {
    return activity.tokenId && activity.source.address && activity.tokenId.split(':')[0] === activity.source.address ? 'Minted' : 'Received';
  }
  getAddressPrefix(type: string) {
    switch (type.toLowerCase()) {
      case 'sent':
        return 'Sent to:';
      case 'received':
        return this.receivedKind(this.activity) + ' from:';
      case 'delegated':
        return 'To:';
      case 'undelegated':
        return 'To:';
      case 'origination':
        return 'Originated contract:';
    }
  }
  copy(address: string): void {
    copy(address);
    const copyToClipboard = this.translate.instant('OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD');
    this.messageService.add(address + ' ' + copyToClipboard, 5);
  }
}
