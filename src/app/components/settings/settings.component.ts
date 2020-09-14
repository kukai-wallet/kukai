import { Component, OnInit, HostListener } from '@angular/core';
import { MessageService } from '../../services/message/message.service';
import { BeaconService } from '../../services/beacon/beacon.service';
import { WalletService } from '../../services/wallet/wallet.service';
import { Router } from '@angular/router';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  implicitAccounts = [];
  wideAccounts = false;
  constructor(
    public beaconService: BeaconService,
    private messageService: MessageService,
    private walletService: WalletService,
    private router: Router) { }

  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.implicitAccounts = this.walletService.wallet.getImplicitAccounts();
      this.beaconService.syncBeaconState();
      this.onResize();
    } else {
      this.router.navigate(['']);
    }

  }
  registerURIhandler() {
    navigator.registerProtocolHandler('web+tezos', `${window.location.origin}/accounts/%s`, 'Kukai Wallet');
  }
  accountAvailable(pkh: string): boolean {
    const index = this.implicitAccounts.findIndex((impAcc: any) => impAcc.pkh === pkh);
    if (index === -1) {
      return false;
    }
    return true;
  }
  @HostListener('window:resize')
  onResize() {
    this.wideAccounts = (window.innerWidth > 600);
  }
  formatAddress(address: string) {
    if (this.wideAccounts) {
      return address;
    } else {
      return address.slice(0, 6) + '...' + address.slice(-4);
    }
  }
}
