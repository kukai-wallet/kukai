import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Account } from '../../../../../services/wallet/wallet';
import { WalletService } from '../../../../../services/wallet/wallet.service';
import { CONSTANTS, environment } from '../../../../../../environments/environment';
import { SubjectService } from '../../../../../services/subject/subject.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-moonpay',
  templateUrl: './moonpay.component.html',
  styleUrls: ['../../../../../../scss/components/views/logged-in/account-view/cards/moonpay/moonpay.component.scss']
})
export class MoonpayComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.mobile = window.innerWidth < 575;
  }
  readonly dev: boolean = !(CONSTANTS.MAINNET && environment.production);
  readonly baseUrl: string = `https://buy${this.dev ? '-staging' : ''}.moonpay.com`;
  mobile = false;
  url: SafeUrl;
  active = false;
  account: Account;
  constructor(private walletService: WalletService, private sanitizer: DomSanitizer, private subjectService: SubjectService) {}

  ngOnInit(): void {
    this.onResize();
    this.subjectService.activeAccount.subscribe((a) => {
      this.account = a;
    });
    this.subjectService.moonpay.subscribe((o) => {
      if (o) {
        this.open();
      } else {
        this.close();
      }
    });
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
  private async open() {
    this.active = true;
    const address: string = this.account ? this.account.address : null;
    if (!address?.startsWith('tz')) {
      return;
    }
    this.url = await this.signUrl(address);
  }
  private close() {
    this.url = null;
    this.active = false;
  }
  private async post(data: any = {}) {
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
}
