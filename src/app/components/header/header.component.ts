import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  activeMenu = false;
  constructor(
    private router: Router,
    public walletService: WalletService,
    private coordinatorService: CoordinatorService
  ) { }

  ngOnInit(): void {
  }
  logout() {
    this.activeMenu = false;
    this.coordinatorService.stopAll();
    this.walletService.clearWallet();
    this.router.navigate(['']);
  }
  click() {
    if (this.walletService.wallet) {
      this.activeMenu =! this.activeMenu;
    }
  }
}
