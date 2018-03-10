import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  encapsulation: ViewEncapsulation.None,
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

  closeResult: string;

  constructor(
    private modalService: NgbModal,
    private walletService: WalletService,
    private messageService: MessageService,
    private transactionService: TransactionService
  ) { }

  open(content) {
    this.modalService.open(content, { windowClass: 'dark-modal' });
  }

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
      const toPkh = this.toPkh;
      let amount = this.amount;
      let fee = this.fee;
      this.toPkh = '';
      this.amount = '';
      this.fee = '';
      if (!amount) { amount = '0'; }
      if (!fee) { fee = '0'; }
      setTimeout(() => {
        const keys = this.walletService.getKeys(pwd);
        this.transactionService.sendTransaction(keys, this.fromPkh, toPkh, Number(amount), Number(fee) * 100);
      }, 100);
      // Send
    }
  }
  validInput(pwd: string) {
    if (!this.toPkh || this.toPkh.length !== 36) {
      this.messageService.add('invalid reciever address');
    } else if (!Number(this.amount) && this.amount && this.amount !== '0') {
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
