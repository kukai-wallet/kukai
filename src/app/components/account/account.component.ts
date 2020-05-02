import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { Account } from '../../services/wallet/wallet';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
    activeAccount: Account;
    implicitAccounts: Account[];
    constructor(
        public walletService: WalletService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.init();
        }
    }
    init() {
        this.implicitAccounts = this.walletService.wallet.implicitAccounts;
        this.activeAccount = this.implicitAccounts[0];
        console.log(this.activeAccount.address);
    }
    updateActiveAccount() {
        console.log(JSON.stringify(this.activeAccount));
    }
}
