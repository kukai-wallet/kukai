import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../services/message/message.service';
import { TokenService } from '../../../../services/token/token.service';
import { CONSTANTS } from '../../../../../environments/environment';
import { ModalComponent } from '../../../modal/modal.component';
import { TokenBalancesService } from '../../../../services/token-balances/token-balances.service';
import { DisplayLinkOption } from '../../../../interfaces';
import Big from 'big.js';
import { Subscription } from 'rxjs';
import { NftsTokenComponent } from '../token/token.component';

@Component({
  selector: 'app-nfts-body',
  templateUrl: './body.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/nfts/body.component.scss'],
})
export class NftsBodyComponent implements OnInit, AfterViewInit {
  DisplayLinkOption = DisplayLinkOption;
  Object = Object;
  Number = Number;
  @ViewChild('body') body;
  @Input() isDisplaying;
  @Input() tokens;
  @Input() account;
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
  }
  ngAfterViewInit() {
    const cb = (e) => {
      if(this.body?.nativeElement?.scrollTop >= (this.body?.nativeElement?.scrollHeight - this.body?.nativeElement?.clientHeight - 5)) {
        this.sliceEnd += 30;
      }
    };
    this.body?.nativeElement.addEventListener('scroll', cb);
    this.body?.nativeElement.addEventListener('touchmove', cb);
  }
  trackToken(index: number, token: any) {
    return token?.id ? token.contractAddress + ':' + token?.id : null;
  }
}