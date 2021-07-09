import { Component, OnInit, HostListener } from '@angular/core';
import { BeaconService } from '../../services/beacon/beacon.service';
import { WalletService } from '../../services/wallet/wallet.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../../../scss/components/settings/settings.component.scss']
})
export class SettingsComponent implements OnInit {
  implicitAccounts = [];
  wideAccounts = false;
  activeAccount = null;
  constructor(
    public beaconService: BeaconService,
    private walletService: WalletService
  ) { }

  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.implicitAccounts = this.walletService.wallet.getImplicitAccounts();
      this.beaconService.syncBeaconState();
      this.onResize();
    }

    this.walletService.activeAccount.subscribe(activeAccount => {
      this.activeAccount = activeAccount;
    });
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
