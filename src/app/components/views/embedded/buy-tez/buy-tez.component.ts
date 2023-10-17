import { Component, EventEmitter, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CONSTANTS } from '../../../../../environments/environment';

@Component({
  selector: 'app-buy-tez',
  templateUrl: './buy-tez.component.html',
  styleUrls: ['./buy-tez.component.scss']
})
export class BuyTezComponent {
  url: SafeUrl;
  isOpen: boolean = false;
  @Output() onDismiss = new EventEmitter();

  constructor(private sanitizer: DomSanitizer) {}

  open(address: string): void {
    this.isOpen = true;
    let walletAddressesData = {
      coins: {
        XTZ: { address }
      }
    };
    console.log('setting up...', address);
    const apiKey = CONSTANTS.MAINNET ? 'f1336570-699b-4181-9bd1-cdd57206981f' : '3b0e81f3-37dc-41f3-9837-bd8d2c350313';
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://${!CONSTANTS.MAINNET ? 'staging-' : ''}global.transak.com?apiKey=${apiKey}&cryptoCurrencyCode=XTZ&walletAddressesData=${JSON.stringify(
        walletAddressesData
      )}&disableWalletAddressForm=true}`
    );
  }

  abort() {
    this.isOpen = false;
    this.onDismiss.emit(null);
  }
}
