import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WalletService } from '../wallet/wallet.service';
import { CONSTANTS } from '../../../environments/environment';

@Injectable()
export class TzrateService {
  public apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd';
  constructor(private http: HttpClient, private walletService: WalletService) {}

  getTzrate() {
    if (CONSTANTS.MAINNET) {
      this.http.get(this.apiUrl).subscribe(
        (price: any) => {
          this.walletService.wallet.XTZrate = price.tezos.usd;
          this.updateFiatBalances();
        },
        (err) => console.log('Failed to get xtz price: ' + JSON.stringify(err))
      );
    } else {
      this.walletService.wallet.XTZrate = 0;
      this.updateFiatBalances();
    }
  }
  updateFiatBalances() {
    const accounts = this.walletService.wallet.getAccounts();
    let tot = 0;
    let change = false;
    for (const account of accounts) {
      if (account.balanceXTZ !== null) {
        account.balanceUSD = Number((account.balanceXTZ / 1000000) * this.walletService.wallet.XTZrate);
        tot += account.balanceUSD;
        change = true;
      }
    }
    if (change) {
      this.walletService.wallet.totalBalanceUSD = Number(tot);
      this.walletService.storeWallet();
    }
  }
}
