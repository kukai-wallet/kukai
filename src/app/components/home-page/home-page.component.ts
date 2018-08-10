import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';  // Init the TranslateService

import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';

import { Constants } from '../../constants';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
    isCollapsed = false;

    CONSTANTS = new Constants();

    param = {value: 'world'};  // Test translation

    constructor(
        public translate: TranslateService,
        private router: Router,
        public walletService: WalletService,
        private coordinatorService: CoordinatorService
    ) {
        translate.addLangs(['en', 'fr', 'ru', 'jp']);

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        const browserLang = translate.getBrowserLang();
        console.log('browserLang ', browserLang);
        translate.use(browserLang.match(/en|fr|ru|jp/) ? browserLang : 'en');
    }

  ngOnInit() {
  }

  testChange(lang: string) {
    console.log('lang in testChange() ', lang);
  }

  returnLanguage(lang: string) {

    // this.translate.use(lang);
    // console.log('lang ', lang);

    const map: Map<string, string> = new Map([
        ['en', 'English'],
        ['cn', '中国'],
        ['es', 'Español'],
        ['fr', 'Français'],
        ['ru', 'Pусский'],
        ['jp', '日本の'],
        ['kr', '한국어'],
        ['swe', 'Svenska']
    ]);

    const language = map.get(lang);

    return language;
  }

  logout() {
        this.coordinatorService.stopAll();
        this.walletService.clearWallet();
        this.router.navigate(['']);
  }
}
