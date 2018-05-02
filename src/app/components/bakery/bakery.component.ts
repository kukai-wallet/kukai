import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { Delegate } from '../../interfaces';

@Component({
    selector: 'app-bakery',
    templateUrl: './bakery.component.html',
    styleUrls: ['./bakery.component.scss']
})
export class BakeryComponent implements OnInit {

    delegateList: Delegate[] = [];
    isSettingActive = false;

    constructor(private walletService: WalletService) { }

    ngOnInit() {

        // Temp - UI test purpose - to be deleted
        this.delegateList.push(new Delegate('TZ1mvKHBkSci3Vq9mVXg8iAVBjEMz8a9aS5m', 'tezzigator', 'tezzigator.com/delegation.html'));
        this.delegateList.push(new Delegate('TZ1gTL92wCSgio19wKjERLmCTJm1bzHSmkDY', 'mycryptodelegate', 'mycryptodelegate.com'));

        // Temp - UI test purpose - to be deleted
        if (this.walletService.wallet.accounts[1]) {
            this.walletService.wallet.accounts[1].delegate = 'TZ1mvKHBkSci3Vq9mVXg8iAVBjEMz8a9aS5m';
            // console.log('walletService.wallet.accounts[2].delegatedXTZ', this.walletService.wallet.accounts[2].delegatedXTZ);
        }

        if (this.walletService.wallet.accounts[3]) {
            this.walletService.wallet.accounts[3].delegate = 'TZ1gTL92wCSgio19wKjERLmCTJm1bzHSmkDY';
        }

    }

    toggleSettings() {
        // this.isSettingActive = !this.isSettingActive;
        console.log('CLICK CLICK!!');
    }

}
