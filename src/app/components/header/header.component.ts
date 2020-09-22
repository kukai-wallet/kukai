import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { Account, TorusWallet } from '../../services/wallet/wallet';
import { LookupService } from '../../services/lookup/lookup.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() activeAccount: Account;
  impAccs: Account[];
  constructor(
    private router: Router,
    public walletService: WalletService,
    public lookupService: LookupService,
    private coordinatorService: CoordinatorService,
  ) { }

  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.impAccs = this.walletService.wallet.implicitAccounts;
    }
  }
  logout() {
    this.coordinatorService.stopAll();
    this.walletService.clearWallet();
    this.lookupService.clear();
    this.router.navigate(['']);
  }
  click() {
  }
  getUsername() {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.name;
    }
    return '';
  }
}
