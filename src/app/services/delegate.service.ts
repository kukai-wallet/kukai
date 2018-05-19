import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { OperationService } from './operation.service';

@Injectable()
export class DelegateService {

  constructor(
    private walletService: WalletService,
    private operationService: OperationService
  ) { }
  getDelegates() {
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.getDelegate(this.walletService.wallet.accounts[i].pkh);
    }
  }
  getDelegate(pkh: string) {
    if (pkh.slice(0, 3) === 'TZ1') {
      this.operationService.getDelegate(pkh).subscribe(
        (data: any) => {
          if (data.success) {
          this.handleDelegateResponse(pkh, data.payload.delegate);
          }
        },
        err => console.log(JSON.stringify(err))
      );
    }
  }
  handleDelegateResponse(pkh: string, data: any) {
    // console.log(JSON.stringify(data));
    if (data) {
      const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
      if (index === -1) {
        this.walletService.wallet.accounts.push({
          pkh: pkh,
          delegate: data,
          balance: this.walletService.emptyBalance(),
          numberOfActivites: 0,
          activities: []
        });
        // console.log('Creating new transactions entry');
        this.walletService.storeWallet();
      } else if (this.walletService.wallet.accounts[index].delegate !== data) {
        this.walletService.wallet.accounts[index].numberOfActivites = 0;
        this.walletService.wallet.accounts[index].delegate = data;
        // console.log('Update transactions entry');
        this.walletService.storeWallet();
      }
    }
  }

}
