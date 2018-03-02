import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  fromPkh: string;
  toPkh: string;
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
    this.fromPkh = this.identity.keyPair.pkh;
  }
  sendTransaction() {
    const pwd = this.password;
    this.password = '';
    if (this.validInput()) {
      // Clear form
      const toPkh = this.toPkh;
      let amount = this.amount;
      let fee = this.fee;
      this.toPkh = '';
      this.amount = '';
      this.fee = '';
      if (!amount) { amount = '0'; }
      if (!fee) { fee = '0'; }
      setTimeout(() => {
        this.walletService.sendTransaction(pwd, this.fromPkh, toPkh, Number(amount), Number(fee) * 100);
      }, 100);
      // Send
    }
  }
  validInput() {
    if (!this.toPkh || this.toPkh.length !== 36) {
      this.messageService.add('invalid reciever address');
    } else if (!Number(this.amount) && this.amount && this.amount !== '0') {
      this.messageService.add('invalid amount');
    } else if (!Number(this.fee) && this.fee && this.fee !== '0') {
      this.messageService.add('invalid fee');
    } else {
      return true;
    }
    return false;
  }
}
