import { Component, OnInit } from '@angular/core';

import { WalletService } from './services/wallet/wallet.service';
import { CoordinatorService } from './services/coordinator/coordinator.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    Buffer = Buffer || [];
    constructor(
        private walletService: WalletService,
        private coordinatorService: CoordinatorService
    ) { }

    ngOnInit() {
            this.walletService.loadStoredWallet();
            if (this.walletService.wallet) {
                this.coordinatorService.startAll();
            }
    }
}
