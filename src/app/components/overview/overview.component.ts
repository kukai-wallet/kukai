import { Component, OnInit, Input } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown/bs-dropdown.directive';

import { Router } from '@angular/router';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { BalanceService } from '../../services/balance.service';
import { UpdateCoordinatorService } from '../../services/update-coordinator.service';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
    identity = null;
    accounts = null;
    activePkh: string;


    constructor(
        private router: Router,
        private walletService: WalletService,
        private messageService: MessageService,
        private balanceService: BalanceService,
        private updateCoordinatorService: UpdateCoordinatorService
    ) { }

    ngOnInit() {

        if (this.walletService.wallet) {
            this.identity = this.walletService.wallet.accounts[0];
            this.updateCoordinatorService.startAll();
        }
    }
    addAccount() {
        // this.walletService.createAccount();
    }

    // Not working
    openSend(pkh: string) {
        console.log(pkh);
        this.router.navigate(['/send', { activePkh: pkh }]);
    }

    openReceive(pkh: string) {
        console.log(pkh);
    }
}
