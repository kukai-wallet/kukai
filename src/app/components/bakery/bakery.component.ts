import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';

@Component({
    selector: 'app-bakery',
    templateUrl: './bakery.component.html',
    styleUrls: ['./bakery.component.scss']
})
export class BakeryComponent implements OnInit {

    constructor(private walletService: WalletService) { }

    ngOnInit() {
        // Temp - UI test purpose - to be deleted

        if (this.walletService.wallet.accounts[1]) {
            this.walletService.wallet.accounts[1].delegate = 'TZ1mvKHBkSci3Vq9mVXg8iAVBjEMz8a9aS5m';
            this.walletService.wallet.accounts[1].delegatedXTZ = 1246.32;
            console.log('walletService.wallet.accounts[2].delegatedXTZ', this.walletService.wallet.accounts[2].delegatedXTZ);
        }

        if (this.walletService.wallet.accounts[3]) {
            this.walletService.wallet.accounts[3].delegate = 'TZ1gTL92wCSgio19wKjERLmCTJm1bzHSmkDY';
            this.walletService.wallet.accounts[3].delegatedXTZ = 546;
        }

    }

}
