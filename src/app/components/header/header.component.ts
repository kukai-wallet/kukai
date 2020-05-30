import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { Account } from '../../services/wallet/wallet';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() activeAccount: Account;
  impAccs: Account[] = this.walletService.wallet.implicitAccounts;
  constructor(
    private router: Router,
    public walletService: WalletService,
    private coordinatorService: CoordinatorService,
  ) { }

  ngOnInit(): void {
  }
  logout() {
    this.coordinatorService.stopAll();
    this.walletService.clearWallet();
    this.router.navigate(['']);
  }
  click() {
  }
}
