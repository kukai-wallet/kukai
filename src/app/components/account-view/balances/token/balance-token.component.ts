import { Component, Input, OnInit } from '@angular/core';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { CONSTANTS } from '../../../../../environments/environment';
import { Big } from 'big.js';

@Component({
  selector: 'app-balance-token',
  templateUrl: './balance-token.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/balances/balance-token.component.scss'],
})
export class BalanceTokenComponent implements OnInit {
  String = String;
  @Input() token = null;
  @Input() account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor() { }
  ngOnInit(): void {
    console.log(this.token)
  }

  getBalance() {
    return !this.token ?
      this.account?.balanceXTZ !== null ?
        Big(this.account?.balanceXTZ).div(1000000).toFixed() :
        '—' :
      this.token?.balance;
  }

  getBalanceFiat() {
    return !this.token ? this.account?.balanceUSD || undefined : this.token?.price && this.token.price >= 0.005 ? this.token.price : undefined;
  }
  viewToken() {
    ModalComponent.currentModel.next({ name: 'token-detail', data: this.token });
  }
}

