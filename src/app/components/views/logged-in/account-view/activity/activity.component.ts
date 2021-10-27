import { Component, Input, OnInit } from '@angular/core';
import { Account } from '../../../../../services/wallet/wallet';
import { TimeAgoPipe } from '../../../../../pipes/time-ago.pipe';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../../services/message/message.service';
import { CONSTANTS } from '../../../../../../environments/environment';
import { TokenService } from '../../../../../services/token/token.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['../../../../../../scss/components/views/logged-in/account-view/cards/activity/activity.component.scss'],
})
export class ActivityComponent implements OnInit {
  public currTimeStamp: number;
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public timeAgoPipe: TimeAgoPipe,
    public tokenService: TokenService
  ) { }
  trigger = true;
  @Input() activity: any;
  @Input() account: Account;
  ngOnInit(): void {}
  explorerURL(hash: string): string {
    const baseURL = CONSTANTS.BLOCK_EXPLORER_URL;
    return `${baseURL}/${hash}`;
  }

  trackEvent(index: number, activity: any) {
    return activity.block + activity.hash;
  }
}
