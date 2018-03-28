import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { MessageService } from './message.service';
import * as lib from '../../assets/js/main2.js';

@Injectable()
export class BalanceService {
  constructor(
    private walletService: WalletService,
    private messageService: MessageService) { }

  getBalanceAll() {
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.getAccountBalance(i);
    }
  }
  handleBalanceErrors(err: any, pkh: string) {
    if (!err) {
      this.messageService.addError('BalanceError: No response');
    } else if (err === 'Empty response returned') { // Account probably empty and should be removed
      this.messageService.addError('BalanceError: Empty response');
      // this.walletService.wallet.accounts[this.walletService.getIndexFromPkh(pkh)].balance = 0;
      // this.walletService.storeWallet();
    } else {
      this.messageService.addError('BalanceError: ' + JSON.stringify(err));
    }
  }
  getAccountBalance(index: number) {
    const promise = lib.eztz.rpc.getBalance(this.walletService.wallet.accounts[index].pkh);
    if (promise != null) {
      promise.then(
        (val) => this.updateAccountBalance(index, val),
        (err) => this.handleBalanceErrors(err, this.walletService.wallet.accounts[index].pkh)
      );
    }
  }
  updateAccountBalance(index: number, newBalance: number) {
    if (newBalance !== this.walletService.wallet.accounts[index].balance.balanceXTZ) {
      this.walletService.wallet.accounts[index].balance.balanceXTZ = newBalance;
      this.updateTotalBalance();
      this.walletService.storeWallet();
    }
  }
  updateTotalBalance() {
    let balance = 0;
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      balance += this.walletService.wallet.accounts[i].balance.balanceXTZ;
    }
    this.walletService.wallet.balance.balanceXTZ = balance;
  }
}
