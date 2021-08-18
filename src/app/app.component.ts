import { Component, HostListener, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { WalletService } from './services/wallet/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { CONSTANTS as _CONSTANTS } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly CONSTANTS = _CONSTANTS;
  embedded = false;
  previous = 0;
  current = 0;
  diff = 0;
  container = null;
  post = false;
  constructor(
    private walletService: WalletService,
    public router: Router,
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

  @HostListener('touchstart', ['$event'])
  touchstart(e) {
    this.container = e.target.closest('.nfts .scroll .body, .scroll-wrapper .balances');
    if(!!this.container) {
      this.container.style.overflowY = '';
    }
    this.post = false;
    this.previous = 0;
    this.current = e.touches[0].pageY;
  }

  @HostListener('touchmove', ['$event'])
  touchmove(e) {
    this.previous = this.current;
    this.current = e.touches[0].pageY;
      if (this.previous > this.current && !!this.container && this.container?.scrollTop >= (this.container.scrollHeight - this.container.clientHeight) && !this.post) {
        this.container.style.overflowY = 'hidden';
        this.container.scrollTop = this.container.scrollHeight - this.container.clientHeight;
        document.body.scrollTop += (this.previous - this.current);
        this.post = true;
      } else if (this.previous < this.current && !!this.container && this.container?.scrollTop <= 0 && !this.post) {
        this.container.style.overflowY = 'hidden';
        this.container.scrollTop = -1;
        document.body.scrollTop += (this.previous - this.current);
        this.post = true;
      } else {
        if(!!this.container && this.post) {
          document.body.scrollTop += (this.previous - this.current);
        }
    }
  }

  @HostListener('touchend', ['$event'])
  touchend(e) {
    if(!!this.container) {
      this.container.style.overflowY = '';
    }
  }
}
