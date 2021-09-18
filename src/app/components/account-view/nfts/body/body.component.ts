import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../services/message/message.service';
import { TokenService } from '../../../../services/token/token.service';
import { CONSTANTS } from '../../../../../environments/environment';
import { TokenBalancesService } from '../../../../services/token-balances/token-balances.service';
import { DisplayLinkOption } from '../../../../interfaces';

@Component({
  selector: 'app-nfts-body',
  templateUrl: './body.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/nfts/body.component.scss'],
})
export class NftsBodyComponent implements OnInit, OnChanges, AfterViewInit {
  DisplayLinkOption = DisplayLinkOption;
  Object = Object;
  Number = Number;
  @ViewChild('body') body;
  @Input() isDisplaying;
  @Input() tokens;
  tokensToDisplay = [];
  contractAliases = CONSTANTS.CONTRACT_ALIASES;
  sliceEnd = 30;
  obs: IntersectionObserver;
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService,
    public tokenBalancesService: TokenBalancesService
  ) {}
  ngOnInit(): void {
    this.tokensToDisplay = this.tokens.slice(0, this.sliceEnd);
  }
  ngOnChanges() {
    if(this.isDisplaying) {
      this.tokensToDisplay = this.tokens.slice(0, this.sliceEnd);
    }
  }
  ngAfterViewInit() {
    const cb = (e) => {
      if(this.body?.nativeElement?.scrollTop >= (this.body?.nativeElement?.scrollHeight - this.body?.nativeElement?.clientHeight - 5)) {
        this.sliceEnd += 30;
        this.tokensToDisplay = this.tokens.slice(0, this.sliceEnd);
      }
    };
    this.body?.nativeElement.addEventListener('scroll', cb);
    this.body?.nativeElement.addEventListener('touchmove', cb);
  }
  trackToken(index: number, token: any) {
    return token?.contractAddress ? token?.contractAddress + ':' + token?.id : index;
  }
}