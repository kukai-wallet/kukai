import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { BeaconService } from '../../services/beacon/beacon.service';
import { WalletService } from '../../services/wallet/wallet.service';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token/token.service';
import { MessageService } from '../../services/message/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../../../scss/components/settings/settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  implicitAccounts = [];
  wideAccounts = false;
  activeAccount = null;
  private subscriptions: Subscription = new Subscription();
  constructor(
    public beaconService: BeaconService,
    private messageService: MessageService,
    private walletService: WalletService,
    private router: Router,
    private tokenService: TokenService) { }

  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.implicitAccounts = this.walletService.wallet.getImplicitAccounts();
      this.beaconService.syncBeaconState();
      this.onResize();
    }

    this.subscriptions.add(this.walletService.activeAccount.subscribe(activeAccount => {
      this.activeAccount = activeAccount;
    }));
  }
  ngOnDestroy() {

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
  rescan() {
    this.tokenService.resetCounters();
    this.messageService.add('Scanning for token metadata...');
  }
}
