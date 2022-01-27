import { Component, Input, OnInit } from '@angular/core';
import { ModalComponent } from '../../../../../modals/modal.component';
import { CONSTANTS } from '../../../../../../../environments/environment';
import { Big } from 'big.js';
import { RemoveCommaPipe } from '../../../../../../pipes/remove-comma.pipe';

@Component({
  selector: 'app-balance-token',
  templateUrl: './balance-token.component.html',
  styleUrls: ['../../../../../../../scss/components/views/logged-in/account-view/cards/balances/balance-token.component.scss']
})
export class BalanceTokenComponent implements OnInit {
  @Input() token = null;
  @Input() account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor(public removeCommaPipe: RemoveCommaPipe) {}
  ngOnInit(): void {}

  getBalance(): number | string {
    return !this.token ? (this.account?.balanceXTZ !== null ? Big(this.account?.balanceXTZ).div(1000000).toFixed() : '—') : this.token?.balance;
  }

  getBalanceFiat(): number | undefined {
    return !this.token ? this.account?.balanceUSD || undefined : this.token?.price && this.token.price >= 0.005 ? this.token.price : undefined;
  }
  viewToken(): void {
    if (!!this.token) {
      ModalComponent.currentModel.next({
        name: 'token-detail',
        data: this.token
      });
    }
  }
}
