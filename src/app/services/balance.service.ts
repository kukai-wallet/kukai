import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { MessageService } from './message.service';
import * as lib from '../../assets/js/main.js';

@Injectable()
export class BalanceService {
  constructor(
    private walletService: WalletService,
    private messageService: MessageService) { }

  getBalanceAll() {
  this.getIdentityBalance();
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.getAccountBalance(i);
    }
  }
  getIdentityBalance() {
    const promise = lib.eztz.rpc.getBalance(this.walletService.wallet.identity.pkh);
    if (promise != null) {
      promise.then(
        (val) => this.updateIdentityBalance(val),
        (err) => this.handleBalanceErrors(err, this.walletService.wallet.identity.pkh)
      );
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
  updateIdentityBalance(newBalance: number) {
    if (newBalance !== this.walletService.wallet.identity.balance) {
      this.walletService.wallet.identity.balance = newBalance;
      this.walletService.storeWallet();
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
    if (newBalance !== this.walletService.wallet.accounts[index].balance) {
      this.walletService.wallet.accounts[index].balance = newBalance;
      this.walletService.storeWallet();
    }
  }
}
