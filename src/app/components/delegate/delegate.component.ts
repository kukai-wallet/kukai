import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.scss']
})
export class DelegateComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  fromPkh: string;
  toPkh: string;
  fee: string;
  password: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    if (this.identity) {
      this.init();
    }
  }
  init() {
    if (this.accounts[0]) {
      this.fromPkh = this.accounts[0].pkh;
    }
  }
  setDelegate() {
    const pwd = this.password;
    this.password = '';
    if (this.validInput(pwd)) {
      // Clear form
      const toPkh = this.toPkh;
      let fee = this.fee;
      this.toPkh = '';
      this.fee = '';
      if (!fee) { fee = '0'; }
      setTimeout(() => {
        const keys = this.walletService.getKeys(pwd);
        this.transactionService.setDelegate(keys, this.fromPkh, toPkh, Number(fee) * 100);
      }, 100);
      // Send
    }
  }
  validInput(pwd: string) {
    if (!this.toPkh || this.toPkh.length !== 36) {
      this.messageService.add('invalid reciever address');
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

