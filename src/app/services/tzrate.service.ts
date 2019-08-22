import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';



import { WalletService } from './wallet.service';
import { TzscanService } from './tzscan.service';


@Injectable()
export class TzrateService {

    private apiUrl = 'https://api.coinmarketcap.com/v1/ticker/tezos/'; // returns a json object, key: price_usd
    constructor(private http: HttpClient,
        private walletService: WalletService,
        private tzscanService: TzscanService) {
    }

    getTzrate() {
        // this.http.get(this.apiUrl).subscribe(
        this.tzscanService.getPriceUSD().subscribe(
            price => {
                this.walletService.wallet.XTZrate = price;
                this.updateFiatBalances();
                console.log('XTZ = $' + price);
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
