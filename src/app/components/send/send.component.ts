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
      if (!this.amount) { this.amount = '0'; }
      if (!this.fee) { this.fee = '0'; }
      setTimeout(() => {
        this.walletService.sendTransaction(pwd, this.fromPkh, this.toPkh, Number(this.amount), Number(this.fee) * 100);
      }, 10);
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
