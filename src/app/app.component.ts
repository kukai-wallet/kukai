import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { WalletService } from './services/wallet/wallet.service';
import { CoordinatorService } from './services/coordinator/coordinator.service';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  embedded = false;
  constructor(
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private router: Router,
    public translate: TranslateService,
    private location: Location

  ) {

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    const languagePreference = window.localStorage.getItem('languagePreference');
    const browserLang = translate.getBrowserLang();
    translate.use('en');
  }

  ngOnInit() {
    this.checkEmbedded();
    if (!this.embedded) {
      this.walletService.loadStoredWallet();
      if (this.walletService.wallet) {
        this.coordinatorService.startAll();
      }
    }
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.checkEmbedded();
        window.scrollTo(0, 0);
      }
    });
    if (!this.embedded) {
      window.addEventListener('storage', (e) => { this.handleStorageEvent(e); });
    }
  }
  private handleStorageEvent(e: StorageEvent) {
    if (e.key === 'kukai-wallet' && !this.embedded) {
      if (e.oldValue && !e.newValue) {
        window.location.reload();
      } else if (!e.oldValue && e.newValue) {
        setTimeout(async () => {
          await this.router.navigate(['']);
          window.location.reload();
        }, 10000);
      }
    }
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
  checkEmbedded() {
    const path = this.location.path();
    this.embedded = path.startsWith('/embedded');
  }
  setLanguage(lang) {
    window.localStorage.setItem('languagePreference', lang);
    this.translate.use(lang);
  }
}
