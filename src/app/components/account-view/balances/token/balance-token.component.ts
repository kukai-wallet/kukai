import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from '../../../../../environments/environment';

@Component({
  selector: 'app-balance-token',
  templateUrl: './balance-token.component.html',
  styleUrls: ['../../../../../scss/components/account-view/cards/balances/balance-token.component.scss'],
})
export class BalanceTokenComponent implements OnInit {
  @Input() token;
  @Input() account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor() { }
  ngOnInit(): void {}

  getBalance() {
    return this.token.symbol === 'tez' ? this.account?.balanceXTZ / 1000000 : this.token?.balance;
  }

  getBalanceFiat() {
    return this.token.symbol === 'tez' ? this.account?.balanceUSD || undefined : this.token?.price && this.token.price >= 0.005 ? this.token.price : undefined;
  }
}

