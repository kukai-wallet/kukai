import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  // accounts = this.walletService.wallet.accounts;
  fromPkh: string;
  amount: string;
  fee: string;
  password: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    if (this.identity) {
      this.init();
    }
  }
  init() {
    this.fromPkh = this.identity.pkh;
  }
  sendTransaction() {
    const pwd = this.password;
    this.password = '';
    if (this.validInput(pwd)) {
      // Clear form
      let amount = this.amount;
      let fee = this.fee;
      this.amount = '';
      this.fee = '';
      if (!amount) { amount = '0'; }
      if (!fee) { fee = '0'; }
      setTimeout(() => {
        this.walletService.createAccount(pwd, this.fromPkh, Number(amount), Number(fee) * 100);
      }, 100);
      // Send
    }
  }
  validInput(pwd: string) {
    if (!Number(this.amount) && this.amount && this.amount !== '0') {
      this.messageService.add('invalid amount');
    } else if (!Number(this.fee) && this.fee && this.fee !== '0') {
      this.messageService.add('invalid fee');
    } else if (!pwd || pwd === '') {
      this.messageService.add('Password needed');
    } else {
      return true;
    }
    return false;
  }
}
