import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { OperationService } from '../operation/operation.service';

@Injectable()
export class DelegateService {

  constructor(
    private walletService: WalletService,
    private operationService: OperationService
  ) { }
  getDelegates() {
    for (let i = 1; i < this.walletService.wallet.accounts.length; i++) {
      this.getDelegate(this.walletService.wallet.accounts[i].pkh);
    }
  }
  getDelegate(pkh: string) {
    this.operationService.getDelegate(pkh).subscribe(
      (data: any) => {
        if (data.success) {
          this.handleDelegateResponse(pkh, data.payload.delegate);
        } else {
        }
      },
      err => console.log(JSON.stringify(err))
    );
  }
  handleDelegateResponse(pkh: string, data: any) {
    const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    if (data) {
      if (index === -1) {
        this.walletService.wallet.accounts.push({
          pkh: pkh,
          delegate: data,
          balance: this.walletService.emptyBalance(),
          numberOfActivites: 0,
          activities: []
        });
        this.walletService.storeWallet();
      } else if (this.walletService.wallet.accounts[index].delegate !== data) {
        this.walletService.wallet.accounts[index].numberOfActivites = 0;
        this.walletService.wallet.accounts[index].delegate = data;
        this.walletService.storeWallet();
      }
    } else {
      if (this.walletService.wallet.accounts[index].delegate !== '') {
        this.walletService.wallet.accounts[index].numberOfActivites = 0;
        this.walletService.wallet.accounts[index].delegate = '';
        this.walletService.storeWallet();
      }
    }
  }
}
