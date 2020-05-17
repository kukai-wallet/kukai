import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { OperationService } from '../operation/operation.service';
import { Account } from '../wallet/wallet';

@Injectable()
export class DelegateService {
  constructor(
    private walletService: WalletService,
    private operationService: OperationService
  ) {}
  getDelegates() {
    if (
      this.walletService.wallet &&
      this.walletService.wallet.implicitAccounts
    ) {
      for (const account of this.walletService.wallet.getAccounts()) {
        this.getDelegate(account);
      }
    }
  }
  getDelegate(account: Account) {
    this.operationService.getDelegate(account.address).subscribe(
      (data: any) => {
        if (data.success) {
          this.handleDelegateResponse(account, data.payload.delegate);
        }
      },
      (err) => console.log(JSON.stringify(err))
    );
  }
  handleDelegateResponse(account: Account, data: any) {
    if (data) {
      if (account.delegate !== data) {
        account.activitiesCounter = 0;
        account.delegate = data;
        this.walletService.storeWallet();
      } else {
        console.log('delegate for ' + account.address + ' up to date');
      }
    } else {
      if (account.delegate !== '') {
        account.activitiesCounter = 0;
        account.delegate = '';
        this.walletService.storeWallet();
      }
    }
  }
}
