import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { BalanceService } from '../../services/balance.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  balance = this.identity.balance;
  activePkh: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private balanceService: BalanceService
  ) { }

  ngOnInit() { if (this.identity) { this.init(); } }
  init() {
    this.activePkh = this.identity.pkh;
    this.balanceService.getBalanceAll();
  }
  updateBalance() {
    if (this.activePkh === this.identity.pkh) {
      this.balance = this.identity.balance;
    } else {
      this.balance = this.accounts[this.walletService.getIndexFromPkh(this.activePkh)].balance;
    }
  }
}
