import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import { Account } from '../../../services/wallet/wallet';
import { CONSTANTS } from '../../../../environments/environment';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['../../../../scss/components/account-view/cards/balances/balances.component.scss'],
})
export class BalancesComponent implements OnInit, AfterViewChecked {
  Object = Object;
  @Input() account: Account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor(
    public tokenBalancesService: TokenBalancesService
  ) {
  }
  e(wrap) {
    if(!!wrap) {
      if (wrap.scrollTop > 0 || parseInt(window.getComputedStyle(wrap).maxHeight.replace('px', '')) > parseInt(wrap.scrollHeight)) {
        document.querySelector('.scroll-wrapper .tez').classList.add('no-box');
      } else {
        document.querySelector('.scroll-wrapper .tez').classList.remove('no-box');
      }
      parseFloat(window.getComputedStyle(wrap).maxHeight.replace('px', '')) > wrap.scrollHeight ? wrap.style.overflowY = '' : wrap.style.overflowY = 'auto';
    }
  }
  ngOnInit(): void {
  }
  ngAfterViewChecked() {
    const wrap = document.querySelector('.scroll-wrapper .balances') as HTMLElement;
    this.e(wrap);
  }
  trackToken(index: number, token: any) {
    return token?.contractAddress ? token.contractAddress + ':' + token?.id + ':' + token?.balance : null;
  }
}

