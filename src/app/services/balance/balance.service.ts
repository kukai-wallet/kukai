import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { TzrateService } from '../tzrate/tzrate.service';
import { OperationService } from '../operation/operation.service';
import { Account } from '../wallet/wallet';

@Injectable()
export class BalanceService {
  constructor(private walletService: WalletService, private tzrateService: TzrateService, private operationService: OperationService) {}

  updateAccountBalance(account: Account, balances: any) {
    if (
      account &&
      (account.balanceXTZ === null ||
        account.balanceXTZ === undefined ||
        balances.balance !== account.balanceXTZ ||
        balances.stakedBalance !== account.stakedBalance ||
        balances.unstakedBalance !== account.unstakedBalance ||
        balances.availableBalance !== account.availableBalance)
    ) {
      account.balanceXTZ = balances.balance;
      account.stakedBalance = balances.stakedBalance;
      account.unstakedBalance = balances.unstakedBalance;
      account.availableBalance = balances.availableBalance;
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
