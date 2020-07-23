import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import { WalletService } from '../../services/wallet/wallet.service';

@Component({
    selector: 'app-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {
    constructor(
        private walletService: WalletService,
        public translate: TranslateService,
        private router: Router
    ) {
    }
    animationActive = true;

    ngOnInit() {
        if (this.walletService.wallet) {
            this.router.navigate(['/accounts']);
        }
    }
}
