import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { WalletService } from '../wallet/wallet.service';
import { MessageService } from '../message/message.service';
import { TzrateService } from '../tzrate/tzrate.service';
import { OperationService } from '../operation/operation.service';
import { Account } from '../wallet/wallet';
import { isNullOrUndefined } from 'util';

@Injectable()
export class BalanceService {
  constructor(
    private translate: TranslateService,
    private walletService: WalletService,
    private messageService: MessageService,
    private tzrateService: TzrateService,
    private operationService: OperationService
  ) { }

  getBalanceAll() {
    for (const account of this.walletService.wallet.getAccounts()) {
      this.getAccountBalance(account);
    }
  }
  getAccountBalance(account: Account) {
    console.log('for ' + account.address);
    this.operationService.getBalance(account.address)
      .subscribe((ans: any) => {
        if (ans.success) {
          this.updateAccountBalance(account, Number(ans.payload.balance));
        } else {
          console.log('Balance Error: ' + JSON.stringify(ans.payload.msg));
        }
      });
  }
  updateAccountBalance(account: Account, newBalance: number) {
    if (account.balanceXTZ === null || account.balanceXTZ === undefined || newBalance !== account.balanceXTZ) {
      account.balanceXTZ = newBalance;
      this.updateTotalBalance();
      this.tzrateService.updateFiatBalances();
      this.walletService.storeWallet();
    }
  }
  updateTotalBalance() {
    let balance = 0;
    let change = false;
    for (const account of this.walletService.wallet.getAccounts()) {
      if (!(account.balanceXTZ === null || account.balanceXTZ === undefined)) {
        balance = balance + Number(account.balanceXTZ);
        change = true;
      }
    }
    if (change) {
      this.walletService.wallet.totalBalanceXTZ = balance;
    }
  }
}
