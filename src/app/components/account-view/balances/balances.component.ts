import { Component, Input, OnInit } from '@angular/core';
import { Account } from '../../../services/wallet/wallet';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message/message.service';
import { TokenService } from '../../../services/token/token.service';
import { CONSTANTS } from '../../../../environments/environment';
import { WalletService } from '../../../services/wallet/wallet.service';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';
import { ModalComponent } from '../../modal/modal.component';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['../../../../scss/components/account-view/cards/balances.component.scss'],
})
export class BalancesComponent implements OnInit {
  Object = Object;
  @Input() account: Account;
  @Input() activity: any;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public timeAgoPipe: TimeAgoPipe,
    public tokenService: TokenService,
    public walletService: WalletService,
    public tokenBalancesService: TokenBalancesService
  ) {
  }
  ngOnInit(): void {
  }
  viewToken(token) {
    ModalComponent.currentModel.next({ name: 'token-detail', data: token });
  }
  trackToken(index: number, token: any) {
    return token?.contractAddress ? token.contractAddress + ':' + token?.id + ':' + token?.balance : null;
  }
}

