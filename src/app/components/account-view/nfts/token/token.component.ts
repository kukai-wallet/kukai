import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../services/message/message.service';
import { TokenService } from '../../../../services/token/token.service';
import { CONSTANTS } from '../../../../../environments/environment';
import { ModalComponent } from '../../../modal/modal.component';
import { TokenBalancesService } from '../../../../services/token-balances/token-balances.service';
import { DisplayLinkOption } from '../../../../interfaces';
import Big from 'big.js';

@Component({
  selector: 'app-nfts-token',
  templateUrl: './token.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/nfts/token.component.scss'],
})
export class NftsTokenComponent implements OnInit, OnChanges {
  DisplayLinkOption = DisplayLinkOption;
  Object = Object;
  Number = Number;
  @Input() token;
  isNew = false;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService,
    public tokenBalancesService: TokenBalancesService
  ) {}
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    if(changes.token.previousValue?.balance > -1 && changes.token.currentValue?.balance > -1 && (changes.token.currentValue?.balance != changes.token.previousValue?.balance)) {
      this.isNew = true;
    }
  }
  viewToken(token) {
    ModalComponent.currentModel.next({ name: 'token-detail', data: token });
  }
  balanceChangeTimer() {
    setTimeout(() => {
      this.isNew = false;
    }, 5000)
  }
  formatBalance(token) {
    return Big(token.balance).div(10 ** parseInt(token.decimals)).toFixed();
  }
}