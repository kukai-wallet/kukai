import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { SubjectService, BuyProvider, CoinbaseOnrampAuth, isCoinbaseOnrampAuthValid } from '../../../../../services/subject/subject.service';
import { ModalComponent } from '../../../../modals/modal.component';
import { MessageService } from '../../../../../services/message/message.service';
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
  readonly servicesBase: string = CONSTANTS.MAINNET ? 'https://services.kukai.app' : 'https://staging.services.kukai.app';
  mobile = false;
  url: SafeUrl;
  account: Account;
  provider: BuyProvider;
  isLoading: boolean = false;
  signRequest: { payload: string } | null = null;
  // Snapshot of the account at flow start so an account switch mid-signing
  // cannot produce a signature that mismatches the message address
  signAccount: Account | null = null;
  private coinbasePending: { address: string; publicKey: string; timestamp: number } | null = null;
  private subscriptions: Subscription = new Subscription();
  constructor(private sanitizer: DomSanitizer, private subjectService: SubjectService, private messageService: MessageService) {}

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
        // Coinbase requires secure initialization: the widget URL must carry a
        // server-minted session token, and the token request must be
        // authenticated with a wallet signature proving ownership of the
        // address. The first click starts the signing flow and returns to the
        // provider picker; with a fresh signature in place the click opens the
        // widget popup directly within the user gesture.
        const auth = this.subjectService.coinbaseOnrampAuth.value;
        if (isCoinbaseOnrampAuthValid(auth, address)) {
          await this.openCoinbasePay(auth);
        } else {
          const timestamp = Math.floor(Date.now() / 1000);
          this.signAccount = this.account;
          this.coinbasePending = { address, publicKey: this.account.pk, timestamp };
          this.signRequest = { payload: this.packMichelsonString(this.coinbaseAuthMessage(address, timestamp)) };
        }
        this.isLoading = false;
        break;
      case BuyProvider.Transak:
        try {
          const response = await fetch(`${this.servicesBase}/v1/onramp/transak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cryptoCurrencyCode: 'XTZ', walletAddress: address, disableWalletAddressForm: true })
          });
          const data = await response.json();
          if (data?.widgetUrl) {
            this.url = this.sanitizer.bypassSecurityTrustResourceUrl(data.widgetUrl);
          }
        } catch (error) {
          console.error(error);
        }
        this.isLoading = false;
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
    this.signRequest = null;
    this.signAccount = null;
    this.coinbasePending = null;
  }
  coinbaseSignResponse(signature: string): void {
    const pending = this.coinbasePending;
    this.signRequest = null;
    this.signAccount = null;
    this.coinbasePending = null;
    if (!pending) {
      return;
    }
    // Cross-tab sentinel: the modal is about to close itself, don't reopen
    // the picker just to have it force-closed again
    if (signature === 'silent' || signature === '') {
      return;
    }
    if (signature) {
      this.subjectService.coinbaseOnrampAuth.next({ ...pending, signature });
    }
    // Return to the provider picker; with a signature stored the Coinbase
    // option now shows as verified and the next click opens the widget
    ModalComponent.currentModel.next({ name: 'buy', data: null });
  }
  private async openCoinbasePay(auth: CoinbaseOnrampAuth): Promise<void> {
    // The popup opens empty within the click's user gesture (awaiting first
    // would trip popup blockers) and navigates once the token arrives
    const newWindow = window.open('', 'Coinbase Pay', 'height=600,width=400');
    if (!newWindow) {
      return;
    }
    newWindow.opener = null;
    try {
      newWindow.document.write('<p style="font-family: sans-serif; margin: 2rem;">Loading Coinbase Pay...</p>');
    } catch {}
    try {
      const response = await fetch(`${this.servicesBase}/v1/onramp/coinbase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: auth.address,
          blockchains: ['tezos'],
          timestamp: auth.timestamp,
          publicKey: auth.publicKey,
          signature: auth.signature
        })
      });
      const data = await response.json();
      if (data?.token) {
        newWindow.location.href = `https://pay.coinbase.com/buy/select-asset?sessionToken=${encodeURIComponent(data.token)}`;
      } else {
        // Any failure invalidates the stored proof: a new message must be signed
        this.subjectService.coinbaseOnrampAuth.next(null);
        newWindow.close();
        this.messageService.addError('Failed to create a Coinbase session. Please try again.');
      }
    } catch (error) {
      console.error(error);
      this.subjectService.coinbaseOnrampAuth.next(null);
      newWindow.close();
      this.messageService.addError('Failed to create a Coinbase session. Please try again.');
    }
  }
  private coinbaseAuthMessage(address: string, timestamp: number): string {
    return `I verify ownership of this wallet and authorize creation of a Coinbase Onramp session\n\nAddress: ${address}\nTimestamp: ${timestamp}`;
  }
  // 05 (PACK watermark) + 01 (Michelson string tag) + 4-byte big-endian length + utf-8 bytes
  private packMichelsonString(message: string): string {
    const bytes = new TextEncoder().encode(message);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `0501${bytes.length.toString(16).padStart(8, '0')}${hex}`;
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
