import { Component, Input, OnInit } from '@angular/core';
import { Account, Activity } from '../../../../services/wallet/wallet';
import { TimeAgoPipe } from '../../../../pipes/time-ago.pipe';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../services/message/message.service';
import { ActivityService } from '../../../../services/activity/activity.service';
import { TokenService } from '../../../../services/token/token.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/activity/event.component.scss'],
})
export class EventComponent implements OnInit {
  public currTimeStamp: number;
  public fresh = undefined;
  public freshTimer = null;
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
    setInterval(() => { this.trigger = !this.trigger; this.currTimeStamp = (new Date()).getTime();
      if(this.activity.status === 1 && this.fresh === undefined && this.freshTimer === null) {
        this.fresh = true;
        this.freshTimer = setTimeout(() => {
          this.fresh = false;
        }, 20000);
      } else if(this.freshTimer === null && !this.fresh) {
        this.fresh = false;
      }
    }, 1000);
    this.currTimeStamp = (new Date()).getTime();
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
  printAmount(activity: Activity): string {
    return this.tokenService.formatAmount(activity.tokenId, activity.amount.toString());
  }
  sentKind(activity): string {
    if (activity.entrypoint) {
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
}

