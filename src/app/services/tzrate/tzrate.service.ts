import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WalletService } from '../wallet/wallet.service';
import { Constants } from '../../constants';

@Injectable()
export class TzrateService {
    private apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd';
    private CONSTANTS = new Constants();
    constructor(private http: HttpClient,
        private walletService: WalletService) {
    }

    getTzrate() {
        this.http.get(this.apiUrl).subscribe(
            (price: any) => {
                this.walletService.wallet.XTZrate = price.tezos.usd;
                this.updateFiatBalances();
            },
            err => console.log('Failed to get xtz price: ' + JSON.stringify(err))
        );
    }
    updateFiatBalances() {
        let tot = 0;
        let change = false;
        for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
            if (this.walletService.wallet.accounts[i].balance.balanceXTZ !== null) {
                this.walletService.wallet.accounts[i].balance.balanceFiat =
                    Number(this.walletService.wallet.accounts[i].balance.balanceXTZ / 1000000 * this.walletService.wallet.XTZrate);
                tot += this.walletService.wallet.accounts[i].balance.balanceFiat;
                change = true;
            }
        }
        if (change) {
            this.walletService.wallet.balance.balanceFiat = Number(tot);
            this.walletService.storeWallet();
        }
    }
}
