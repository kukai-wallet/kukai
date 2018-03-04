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
  canGetFree = true;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService) { }

  ngOnInit() {
    if (this.walletService.wallet.identity) {
      this.walletService.getBalanceAll();
    }
  }
  addAccount() {
    // this.walletService.createAccount();
  }
  freeTezzies(pkh: string) {
    if (this.canGetFree) {
      this.messageService.add('Requesting free tezzies...');
      this.setTimer(1);
      this.walletService.freeTezzies(pkh);
    } else {
      this.messageService.add('Slow down a bit...');
    }
  }
  setTimer(s: number) {
    this.canGetFree = false;
    setTimeout(() => {
      this.canGetFree = true;
    }, s * 1000);
  }
}
