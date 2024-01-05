import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalComponent } from '../../../../../modals/modal.component';
import { CONSTANTS } from '../../../../../../../environments/environment';
import { Big } from 'big.js';
import { RemoveCommaPipe } from '../../../../../../pipes/remove-comma.pipe';
import { SubjectService } from '../../../../../../services/subject/subject.service';
import { WalletService } from '../../../../../../services/wallet/wallet.service';

@Component({
  selector: 'app-balance-token',
  templateUrl: './balance-token.component.html',
  styleUrls: ['../../../../../../../scss/components/views/logged-in/account-view/cards/balances/balance-token.component.scss']
})
export class BalanceTokenComponent implements OnInit {
  @Input() token = null;
  @Input() account;
  contractAliases = CONSTANTS.CONTRACT_ALIASES;

  constructor(public removeCommaPipe: RemoveCommaPipe, private subjectService: SubjectService, private walletService: WalletService) {}
  ngOnInit(): void {}

  getBalance(): number | string {
    return this.token?.name === 'tezos'
      ? this.account?.balanceXTZ !== null
        ? Big(this.account?.balanceXTZ).div(1000000).toFixed()
        : undefined
      : this.token?.balance;
  }

  getBalanceFiat(): number | undefined {
    return this.token.name === 'tezos' ? this.account?.balanceUSD || undefined : this.token?.price && this.token.price >= 0.005 ? this.token.price : undefined;
  }
  viewToken(): void {
    if (this.token?.name !== 'tezos') {
      ModalComponent.currentModel.next({
        name: 'token-detail',
        data: this.token
      });
    }
  }

  buy() {
    ModalComponent.currentModel.next({
      name: 'buy',
      data: undefined
    });
  }
}
