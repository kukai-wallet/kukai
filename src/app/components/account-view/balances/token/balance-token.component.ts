import { Component, Input, OnInit } from '@angular/core';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { CONSTANTS } from '../../../../../environments/environment';

@Component({
  selector: 'app-balance-token',
  templateUrl: './balance-token.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/balances/balance-token.component.scss'],
})
export class BalanceTokenComponent implements OnInit {
  @Input() token = null;
  @Input() account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor() { }
  ngOnInit(): void {}

  getBalance() {
    return !this.token ? this.account?.balanceXTZ / 1000000 : this.token?.balance;
  }

  getBalanceFiat() {
    return !this.token  ? this.account?.balanceUSD || undefined : this.token?.price && this.token.price >= 0.005 ? this.token.price : undefined;
  }
  viewToken() {
    if(!!this.token) {
      ModalComponent.currentModel.next({ name: 'token-detail', data: this.token });
    }
  }
}

