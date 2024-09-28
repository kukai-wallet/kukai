import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { WalletService } from './services/wallet/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { CONSTANTS as _CONSTANTS } from '../environments/environment';
import { Subscription } from 'rxjs';
import { SubjectService } from './services/subject/subject.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  readonly CONSTANTS = _CONSTANTS;
  promoteStake = false;
  embedded = false;
  isMobile = false;
  previous = 0;
  current = 0;
  diff = 0;
  container = null;
  post = false;
  static hasWebGL = false;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private walletService: WalletService,
    public router: Router,
    public translate: TranslateService,
    private location: Location,
    private subjectService: SubjectService
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
    this.checkStake();
    this.subscriptions.add(
      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          this.checkEmbedded();
          this.checkStake();
          window.scrollTo(0, 0);
        }
      })
    );
    this.subscriptions.add(
      this.subjectService.walletUpdated.subscribe(() => {
        this.checkStake();
      })
    );
    if (!this.embedded) {
      window.addEventListener('storage', (e) => {
        this.handleStorageEvent(e);
      });
    }

    const canvas = document.createElement('canvas');
    AppComponent.hasWebGL = !!canvas.getContext('webgl');

    const e = () => {
      const brk = getComputedStyle(document.documentElement).getPropertyValue('--layout-break-5');
      if (parseFloat(brk.replace(/[a-zA-Z]/g, '')) * 16 > document.documentElement.clientWidth) {
        document.documentElement.style.setProperty('--is-mobile', '1');
      } else {
        document.documentElement.style.setProperty('--is-mobile', '0');
      }
    };
    window.addEventListener('resize', e);
    window.addEventListener('load', e);
    e();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  private checkStake() {
    const onMainnet: boolean = this.CONSTANTS.MAINNET && !this.embedded;
    const noStake: boolean =
      this.walletService?.wallet?.implicitAccounts?.every((account) => {
        return account.stakedBalance === 0 && !isNaN(account?.balanceXTZ);
      }) ?? false;
    const aPairOfTez: boolean = this.walletService?.wallet?.totalBalanceXTZ >= 2000000;
    this.promoteStake = onMainnet && noStake && aPairOfTez;
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
    const bg = this.embedded ? 'none' : '#f8f9fa';
    if (!!this.embedded) {
      document.documentElement.style.setProperty('--base-background-color', bg); // recheck
      const resize = () => {
        if (document.body.clientWidth < 540) {
          document.documentElement.style.fontSize = '75%';
        } else if (document.body.clientWidth < 650) {
          document.documentElement.style.fontSize = '87.5%';
        } else {
          document.documentElement.style.fontSize = '100%';
        }
      };
      window.addEventListener('resize', resize);
      window.addEventListener('load', resize);
      resize();
    }
  }
  setLanguage(lang) {
    window.localStorage.setItem('languagePreference', lang);
    this.translate.use(lang);
  }
}
