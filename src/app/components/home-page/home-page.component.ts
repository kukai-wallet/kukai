import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';  // Init the TranslateService
import { INavData } from '@coreui/angular';

import * as jdenticon from 'jdenticon';

import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { Constants } from '../../constants';
import { sidebarNavItems } from '../../_nav';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})

export class HomePageComponent implements OnInit {
  public sidebarMinimized = false;

  sidebarNavItems = sidebarNavItems;
  navItems = this.translatedNavItems();
  isCollapsed = false;
  jdenticon = '';

  CONSTANTS = new Constants();

  param = {value: 'world'};  // Test translation

  constructor(
      public translate: TranslateService,
      private router: Router,
      public walletService: WalletService,
      private coordinatorService: CoordinatorService
  ) {
      translate.addLangs(['en', 'fr', 'ru', 'jp', 'kor', 'por']);

      // this language will be used as a fallback when a translation isn't found in the current language
      translate.setDefaultLang('en');

      // the lang to use, if the lang isn't available, it will use the current loader to get them
      const languagePreference = window.localStorage.getItem('languagePreference');
      const browserLang = translate.getBrowserLang();
      if (languagePreference) {
        translate.use(languagePreference.match(/en|fr|ru|jp|kor|por/) ? languagePreference : 'en');
      } else {
        translate.use(browserLang.match(/en|fr|ru|jp|kor|por/) ? browserLang : 'en');
      }

      translate.onLangChange.subscribe((event) => {
        this.translateNavItems();
      });

      this.walletService.jdenticon.subscribe((value) => {
        this.jdenticon = value;
        jdenticon.update('#jdenticon', value);
      });
  }

  ngOnInit() {
  }

  testChange(lang: string) {
    console.log('lang in testChange() ', lang);
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
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
        ['jp', '日本語'],
        ['kor', '한국어'],
        ['por', 'Português'],
        ['swe', 'Svenska']
    ]);

    const language = map.get(lang);

    return language;
  }
  setLanguage(lang) {
    window.localStorage.setItem('languagePreference', lang);
    this.translate.use(lang);
    this.translateNavItems();
  }

  translateNavItems() {
    this.navItems = JSON.parse(JSON.stringify(
      this.translatedNavItems()
    ));
  }

  translatedNavItems() {
    return this.sidebarNavItems.map((item) => {
      const itemCopy = {};
      for (const [key, value] of Object.entries(item)) {
        itemCopy[key] = value;
      }
      itemCopy['name'] = this.translate.instant(item.name);
      return itemCopy;
    });
  }

  logout() {
    this.coordinatorService.stopAll();
    this.walletService.clearWallet();
    this.router.navigate(['']);
  }
}
