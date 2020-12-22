import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { WalletService } from './services/wallet/wallet.service';
import { CoordinatorService } from './services/coordinator/coordinator.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // // tslint:disable-next-line
  // selector: 'body',
  // template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit {
  constructor(
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private router: Router,
    public translate: TranslateService
  ) {

      // this language will be used as a fallback when a translation isn't found in the current language
      translate.setDefaultLang('en');

      // the lang to use, if the lang isn't available, it will use the current loader to get them
      const languagePreference = window.localStorage.getItem('languagePreference');
      const browserLang = translate.getBrowserLang();
      translate.use('en');
      /*if (languagePreference) {
        translate.use(languagePreference.match(/en|fr|ru|jp|kor|por/) ? languagePreference : 'en');
      } else {
        translate.use(browserLang.match(/en|fr|ru|jp|kor|por/) ? browserLang : 'en');
      }*/
  }

  ngOnInit() {
    this.walletService.loadStoredWallet();
    if (this.walletService.wallet) {
      this.coordinatorService.startAll();
      //this.router.navigate(['/accounts']);
    }
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
    window.addEventListener("storage", (e) => { this.handleStorageEvent(e) })
  }
  private handleStorageEvent(e: StorageEvent) {
    if (e.key === 'kukai-wallet') {
      if (e.oldValue && !e.newValue) { // logout in another tab
        window.location.reload();
      } else if (!e.oldValue && e.newValue) { // login in another tab
        setTimeout(() => {
          window.location.reload();
        }, 15000);
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
  setLanguage(lang) {
    window.localStorage.setItem('languagePreference', lang);
    this.translate.use(lang);
  }

  logout() {
    this.coordinatorService.stopAll();
    this.walletService.clearWallet();
    this.router.navigate(['']);
  }
}
