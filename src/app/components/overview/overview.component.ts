import { Component, OnInit, Input, Inject, Injectable } from '@angular/core';
// import { DOCUMENT } from '@angular/platform-browser';
import { SlicePipe } from '@angular/common';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown/bs-dropdown.directive';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { BalanceService } from '../../services/balance.service';
import { CoordinatorService } from '../../services/coordinator.service';
import * as copy from 'copy-to-clipboard';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
    identity = null;
    accounts = null;
    activePkh: string;
    selectedPkh: string;
    dom: Document;

    constructor(
        private router: Router,
        public walletService: WalletService,
        private messageService: MessageService,
        private balanceService: BalanceService,
        private coordinatorService: CoordinatorService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.identity = this.walletService.wallet.accounts[0];
            this.coordinatorService.startAll();
        }
    }
    click(pkh: string) {
        if (this.selectedPkh === pkh) {
            this.selectedPkh = null;
        } else {
            this.selectedPkh = pkh;
        }
    }
    dblclick(pkh: string) {
        copy(pkh);
        this.messageService.add(pkh + ' copied to clipboard!');
    }
}
