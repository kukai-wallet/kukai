import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  showAdd = true;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService) { }

  ngOnInit() {
    if (!this.walletService.wallet.identity) {

    } else {
      this.walletService.getBalanceAll();
    }
  }
  addAccount() {
    this.hideAdd();
    this.walletService.createAccount();
  }
  hideAdd() {
    this.showAdd = false;
    setTimeout(() => {
      this.showAdd = true;
    }, 5000);
  }
}
