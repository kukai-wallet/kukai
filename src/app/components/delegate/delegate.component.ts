import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { TransactionService } from '../../services/transaction.service';
import { ActivityService } from '../../services/activity.service';
import { OperationService } from '../../services/operation.service';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.scss']
})
export class DelegateComponent implements OnInit {
  accounts = null;
  fromPkh: string;
  toPkh: string;
  delegate = '';
  fee: string;
  password: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private transactionService: TransactionService,
    private activityService: ActivityService,
    private operationService: OperationService
  ) { }

  ngOnInit() {
    if (this.walletService.wallet) {
      this.init();
    }
  }
  init() {
    this.accounts = this.walletService.wallet.accounts;
    if (this.accounts[0]) {
      this.fromPkh = this.accounts[0].pkh;
      this.getDelegate();
    }
  }
  getDelegate() {
    this.activityService.getDelegate(this.fromPkh);
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
        let keys;
        if (this.walletService.wallet.salt) {
          keys = this.walletService.getKeys(pwd, null);
        } else {
          keys = this.walletService.getKeys(null, pwd);
        }
        this.operationService.delegate(keys, this.fromPkh, toPkh, Number(fee) * 100).subscribe(
          (ans: any) => {
            console.log(JSON.stringify(ans));
            if (ans.opHash) {
              // this.sendResponse = 'success';
              // this.updateCoordinatorService.boost(this.activePkh);
              // this.updateCoordinatorService.boost(toPkh);
            } else {
              // this.sendResponse = 'failure';
            }
          },
          err => {console.log(JSON.stringify(err));
            // this.sendResponse = 'failure';
          }
        );
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

