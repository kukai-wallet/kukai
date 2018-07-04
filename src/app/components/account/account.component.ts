import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { BalanceService } from '../../services/balance.service';
import { CoordinatorService } from '../../services/coordinator.service';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
    accounts = null;
    balance = 0;
    balanceUSD = 0;
    activePkh: string;
    constructor(
        public walletService: WalletService,
        private messageService: MessageService,
        private coordinatorService: CoordinatorService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.init();
        }
    }
    init() {
        this.accounts = this.walletService.wallet.accounts;
        this.activePkh = this.accounts[0].pkh;
        this.balance = this.accounts[0].balance.balanceXTZ;
        this.balanceUSD = this.accounts[0].balance.balanceFiat;
    }
    updateBalance() {
        this.balance = this.accounts[this.walletService.getIndexFromPkh(this.activePkh)].balance.balanceXTZ;
        this.balanceUSD = this.accounts[this.walletService.getIndexFromPkh(this.activePkh)].balance.balanceFiat;
    }
    triggerOperationReload() {
        const index = this.walletService.getIndexFromPkh(this.activePkh);
        this.walletService.wallet.accounts[index].numberOfActivites--;
        this.coordinatorService.boost(this.activePkh);
    }
}
