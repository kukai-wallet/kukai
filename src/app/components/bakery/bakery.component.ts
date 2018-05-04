import { Component, OnInit } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { TransactionService } from '../../services/transaction.service';

import { Account, Balance, Activity } from '../../interfaces';

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

export class AccountDelegate implements Account {
    pkh: string|null;
    delegate: string;
    balance: Balance;
    numberOfActivites: number;
    activities: Activity[];

    alias: string|null;
    showDelegateInput: boolean;
    changeDelegate: boolean;
    constructor (account: Account, alias: string) {
      this.pkh = account.pkh;
      this.delegate = account.delegate;
      this.balance = account.balance;
      this.numberOfActivites = account.numberOfActivites;
      this.activities = account.activities;
      this.alias = alias;
      this.showDelegateInput = false;
      this.changeDelegate = false;
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
    delegateInput: string;

    password: string;
    fee: string;

    showPasswordInput = false;

    accounts: AccountDelegate[] = [];

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

    constructor(
        private walletService: WalletService,
        private messageService: MessageService,
        private transactionService: TransactionService
    ) { }

    ngOnInit() {

        // Temp - UI test purpose - to be deleted
        this.delegateList.push(new Delegate('', 'none', ''));
        this.delegateList.push(new Delegate('TZ1mvKHBkSci3Vq9mVXg8iAVBjEMz8a9aS5m', 'tezzigator', 'http://tezzigator.com/delegation.html'));
        this.delegateList.push(new Delegate('TZ1gTL92wCSgio19wKjERLmCTJm1bzHSmkDY', 'mycryptodelegate', 'http://mycryptodelegate.com'));

        // Temp - UI test purpose - to be deleted
        if (this.walletService.wallet.accounts[1]) {
            this.walletService.wallet.accounts[1].delegate = 'TZ1mvKHBkSci3Vq9mVXg8iAVBjEMz8a9aS5m';
        }

        if (this.walletService.wallet.accounts[3]) {
            this.walletService.wallet.accounts[3].delegate = 'TZ1gTL92wCSgio19wKjERLmCTJm1bzHSmkDY';
        }

        // Prepares view to show Aliases
        if (this.walletService) {
            for (const account of this.walletService.wallet.accounts) {
                if (account.delegate !== '') {
                    let alias = '';
                    for (const delegate of this.delegateList) {
                        if (delegate.pkh === account.delegate) {
                            alias = delegate.alias;
                            break;
                        }
                    }
                    if (alias === '') {  // Account is delegated but no alias was found
                        alias = account.pkh;
                    }
                    this.accounts.push(new AccountDelegate(account, alias));
                } else {  // there's no delegate
                    this.accounts.push(new AccountDelegate(account, ''));  // Alias is set to ''
                }
            }
        }

    }

    toggleSettings() {
        this.isSettingActive = !this.isSettingActive;
        this.isDelegateInputIncorrect = {
            pkh: false,
            alias: false,
            all: false
        };
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
        index++; // index is incremented because array is sliced in the template so `none` is never shown in Bakery Settings
        this.delegateList.splice(index, 1);  // Deletes the delegate
    }

    delegateAccount(account: AccountDelegate) {
        this.delegateInput = '';

        if (account.showDelegateInput) {
            for ( const  acc of this.accounts) {
                acc.showDelegateInput = false;
                // acc.showPasswordInput = false;
                this.showPasswordInput = false;
            }
        } else {

            for ( const  acc of this.accounts) {
                acc.showDelegateInput = false;
                // acc.showPasswordInput = false;
                this.showPasswordInput = false;
            }
            account.showDelegateInput = true;
        }
    }

    showPassword(account: AccountDelegate) {
        this.showPasswordInput = true;
        for ( const  acc of this.accounts) {
            acc.changeDelegate = false;
        }
        account.changeDelegate = true;
    }

    setDelegate() {
        const pwd = this.password;
        this.password = '';

        for ( const  acc of this.accounts) {
            if (acc.changeDelegate) {
                if (this.validInput(pwd)) {
                    // Clear form
                    let fee = this.fee;
                    this.fee = '';

                    if (!fee) {
                        fee = '0';
                    }

                    setTimeout(() => {
                      const keys = this.walletService.getKeys(pwd, null);
                      this.transactionService.setDelegate(keys, acc.pkh, this.delegateInput, Number(fee) * 100);
                    }, 100);
                    // Send
                  }
            }
        }
    }

    validInput(pwd: string) {
        /*
        if (!this.delegateInput || this.delegateInput.length !== 36) {
            // Does all delegate addresses are 36 char long? / How to remove a delegate when this.delegateInput = ''?
            this.messageService.add('invalid delegate address');
        } else 
        */
        if (!Number(this.fee) && this.fee && this.fee !== '0') {
            this.messageService.add('invalid fee');
        } else if (!pwd || pwd === '') {
            console.log('PASSWORD', pwd);
            this.messageService.add('Password needed');
        } else {
            return true;
        }
        return false;
      }

}
