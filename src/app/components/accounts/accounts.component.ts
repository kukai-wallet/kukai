import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  account = this.walletService.wallet.account;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService) { }

  ngOnInit() {
    if (!this.walletService.wallet.mnemonic) {

    } else {
      this.walletService.getBalance();
    }
  }
}
