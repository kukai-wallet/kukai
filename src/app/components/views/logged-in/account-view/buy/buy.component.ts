import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SubjectService, BuyProvider } from '../../../../../services/subject/subject.service';
import { generateOnRampURL } from '@coinbase/cbpay-js';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Account } from '../../../../../services/wallet/wallet';
import { Subscription } from 'rxjs';
import { CONSTANTS, environment } from '../../../../../../environments/environment';
@Component({
  selector: 'app-buy',
  templateUrl: `./buy.component.html`,
  styleUrls: ['../../../../../../scss/components/views/logged-in/account-view/buy/buy.component.scss']
})
export class BuyComponent implements OnInit, OnDestroy {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.mobile = window.innerWidth < 575;
  }
  public readonly BuyProviderType = BuyProvider;
  readonly dev: boolean = !(CONSTANTS.MAINNET && environment.production);
  readonly baseUrl: string = `https://buy${this.dev ? '-staging' : ''}.moonpay.com`;
  mobile = false;
  url: SafeUrl;
  account: Account;
  provider: BuyProvider;
  isLoading: boolean = false;
  private subscriptions: Subscription = new Subscription();
  constructor(private sanitizer: DomSanitizer, private subjectService: SubjectService) {}

  ngOnInit(): void {
    this.onResize();
    this.subscriptions.add(
      this.subjectService.activeAccount.subscribe((a) => {
        this.account = a;
      })
    );
    this.subscriptions.add(
      this.subjectService.buy.subscribe((o) => {
        this.provider = o;
        if (Number.isInteger(o)) {
          this.open();
        } else {
          this.close();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private async open(): Promise<void> {
    this.isLoading = true;
    const address: string = this.account ? this.account.address : null;
    if (!address?.startsWith('tz')) {
      return;
    }
    switch (this.provider) {
      case BuyProvider.Coinbase:
        this.isLoading = false;
        const newWindow = window.open(
          generateOnRampURL({
            appId: 'aa41d510-15f9-4426-87bd-3a506b6e22c0',
            destinationWallets: [{ address, blockchains: ['tezos'] }]
          }),
          'Coinbase Pay',
          'height=600,width=400'
        );
        newWindow.opener = null;
        break;
      case BuyProvider.Transak:
        this.isLoading = false;
        let walletAddressesData = {
          coins: {
            XTZ: { address }
          }
        };
        const apiKey = CONSTANTS.MAINNET ? 'f1336570-699b-4181-9bd1-cdd57206981f' : '3b0e81f3-37dc-41f3-9837-bd8d2c350313';
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://${!CONSTANTS.MAINNET ? 'staging-' : ''}global.transak.com?apiKey=${apiKey}&cryptoCurrencyCode=XTZ&walletAddressesData=${JSON.stringify(
            walletAddressesData
          )}&disableWalletAddressForm=true}`
        );
        break;
      case BuyProvider.MoonPay:
        this.url = await this.signUrl(address);
        break;
    }
  }
  private close(): void {
    this.url = null;
    this.provider = undefined;
    this.isLoading = false;
  }
  private async signUrl(address: string): Promise<SafeUrl> {
    if (address?.startsWith('tz')) {
      const query: string = `?apiKey=${
        this.dev ? 'pk_test_M23P0Zc5SvBORSFV63sfWKi7n5QbGZR' : 'pk_live_rP9HlBRO54nY4QKLxc6ONl4Prrm6vymK'
      }&colorCode=%237178E3&currencyCode=xtz&walletAddress=${encodeURIComponent(address)}`;
      const sig = await this.post({ dev: this.dev, url: query });
      if (sig) {
        const url = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.baseUrl}${query}&signature=${encodeURIComponent(sig)}`);
        return url;
      }
    }
    return null;
  }
  private async post(data: any = {}): Promise<string> {
    return fetch('https://utils.kukai.network/moonpay/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(async (d) => {
        return d.text();
      })
      .catch((e) => {
        return '';
      });
  }
  iframeLoaded() {
    this.isLoading = false;
  }
  iframeError() {
    this.isLoading = false;
  }
}
