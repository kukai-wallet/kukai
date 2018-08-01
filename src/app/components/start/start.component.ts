import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { WalletService } from '../../services/wallet.service';

@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

    constructor(
        private walletService: WalletService,
        private router: Router
    ) {
    }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.router.navigate(['/overview']);
        }
    }
}
