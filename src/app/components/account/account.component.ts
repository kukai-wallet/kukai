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
  accounts = null;
  balance = 0;
  activePkh: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private balanceService: BalanceService
  ) { }

  ngOnInit() { if (this.walletService.wallet) { this.init(); } }
  init() {
    this.accounts = this.walletService.wallet.accounts;
    this.activePkh = this.accounts[0].pkh;
    this.balance = this.accounts[0].balance.balanceXTZ;
    this.balanceService.getBalanceAll();
  }
  updateBalance() {
    this.balance = this.accounts[this.walletService.getIndexFromPkh(this.activePkh)].balance.balanceXTZ;
  }
}
