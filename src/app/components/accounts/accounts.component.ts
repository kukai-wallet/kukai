import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  accounts = this.walletService.wallet.accounts;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService) { }

  ngOnInit() {
    if (!this.walletService.wallet.mnemonic) {

    } else {
      this.walletService.getBalanceAll();
    }
  }
  addAccount() {
    this.walletService.addAccount();
  }
  hideAccount(id: number) {
    this.walletService.hideAccount(id);
  }
}
