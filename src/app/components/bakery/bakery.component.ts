import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';

export class Delegate {  // use of class for type-checking and the underlying implementation
    public pkh: string;
    public alias: string|null;
    public link: string|null;

    constructor(pkh: string, alias: string, link: string) {
        this.pkh = pkh;
        this.alias = alias;
        this.link = link;
    }
}

@Component({
    selector: 'app-bakery',
    templateUrl: './bakery.component.html',
    styleUrls: ['./bakery.component.scss']
})
export class BakeryComponent implements OnInit {

    delegateList: Delegate[] = [];
    isSettingActive = false;
    isAddDelegateInputIncorrect = false;

    isDelegateInputIncorrect: any = {
        pkh: false,
        alias: false,
        all: false
    };

    delegate: Delegate = {
        pkh: '',
        alias: '',
        link: ''
    };

    constructor(private walletService: WalletService) { }

    ngOnInit() {

        // Temp - UI test purpose - to be deleted
        this.delegateList.push(new Delegate('TZ1mvKHBkSci3Vq9mVXg8iAVBjEMz8a9aS5m', 'tezzigator', 'http://tezzigator.com/delegation.html'));
        this.delegateList.push(new Delegate('TZ1gTL92wCSgio19wKjERLmCTJm1bzHSmkDY', 'mycryptodelegate', 'http://mycryptodelegate.com'));

        // Temp - UI test purpose - to be deleted
        if (this.walletService.wallet.accounts[1]) {
            this.walletService.wallet.accounts[1].delegate = 'TZ1mvKHBkSci3Vq9mVXg8iAVBjEMz8a9aS5m';
        }

        if (this.walletService.wallet.accounts[3]) {
            this.walletService.wallet.accounts[3].delegate = 'TZ1gTL92wCSgio19wKjERLmCTJm1bzHSmkDY';
        }

    }

    toggleSettings() {
        this.isSettingActive = !this.isSettingActive;
    }

    addDelegate() {
        if (this.delegate.alias !== '') {
            this.isDelegateInputIncorrect.alias = false;
            console.log('Name is Correct');
        } else {
            this.isDelegateInputIncorrect.alias = true;
            this.isDelegateInputIncorrect.all = true;
            console.log('Name is incorrect');
        }
        if (this.delegate.pkh.slice(0, 3) === 'TZ1' ) {
            this.isDelegateInputIncorrect.pkh = false;
            console.log('Address is correct');
        } else {
            this.isDelegateInputIncorrect.pkh = true;
            this.isDelegateInputIncorrect.all = true;
            console.log('Address is incorrect', this.delegate.pkh.slice(0, 3));
        }
        if (!this.isDelegateInputIncorrect.alias && !this.isDelegateInputIncorrect.pkh) {
            this.isDelegateInputIncorrect.all = false;

            this.delegateList.push(new Delegate(this.delegate.pkh, this.delegate.alias, this.delegate.link));

            // Form cleared once new delegate was created
            this.delegate.pkh = '';
            this.delegate.alias = '';
            this.delegate.link = '';
        }
    }

    deleteDelegate(index: number) {
        this.delegateList.splice(index, 1);  // Deletes the delegate
    }

}
