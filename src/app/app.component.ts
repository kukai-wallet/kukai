import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';  // Init the TranslateService

import { WalletService } from './services/wallet.service';
import { CoordinatorService } from './services/coordinator.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    param = {value: 'world'};  // Test translation

    constructor(
        public translate: TranslateService,
        private walletService: WalletService,
        private coordinatorService: CoordinatorService
    ) {
        translate.addLangs(['en', 'fr']);

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        const browserLang = translate.getBrowserLang();
        translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    }

    ngOnInit() {
            this.walletService.loadStoredWallet();

            if (this.walletService.wallet) {
                this.coordinatorService.startAll();
            }
    }
}
