import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { WalletService } from './wallet.service';
import { MessageService } from './message.service';
import { TzrateService } from './tzrate.service';
import { OperationService } from './operation.service';
import { Observable } from 'rxjs/Observable';

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
    this.getXTZBalanceAll();
  }
  getXTZBalanceAll() {
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.getAccountBalance(i);
    }
  }
  getAccountBalance(index: number) {
    const pkh = this.walletService.wallet.accounts[index].pkh;
    console.log('for ' + pkh);
    this.operationService.getBalance(pkh)
      .subscribe((ans: any) => {
        if (ans.success) {
          this.updateAccountBalance(index, ans.payload.balance);
        } else {
          console.log('Balance Error: ' + JSON.stringify(ans.payload.msg));
        }
      });
  }
  updateAccountBalance(index: number, newBalance: number) {
    if (newBalance !== this.walletService.wallet.accounts[index].balance.balanceXTZ) {
      if (this.walletService.wallet.accounts[index].balance.balanceXTZ) {
        let balanceUpdated = '';
        this.translate.get('BALANCESERVICE.BALANCEUPDATE').subscribe(
            (res: string) => balanceUpdated = res
        );
        this.messageService.add(balanceUpdated + ' ' + this.walletService.wallet.accounts[index].pkh);
        // this.messageService.add('Balance updated for: ' + this.walletService.wallet.accounts[index].pkh);
      }
      this.walletService.wallet.accounts[index].balance.balanceXTZ = newBalance;
      this.updateTotalBalance();
      this.tzrateService.updateFiatBalances();
      this.walletService.storeWallet();
    }
  }
  updateTotalBalance() {
    let balance = 0;
    let change = false;
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      if (this.walletService.wallet.accounts[i].balance.balanceXTZ) {
        balance = balance + Number(this.walletService.wallet.accounts[i].balance.balanceXTZ);
        change = true;
      }
    }
    if (change) {
      this.walletService.wallet.balance.balanceXTZ = balance;
    }
  }
}
