import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';

import { Constants } from '../../constants';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
    isCollapsed = false;

    CONSTANTS = new Constants();

    constructor(
        private router: Router,
        public walletService: WalletService,
        private coordinatorService: CoordinatorService
    ) { }

  ngOnInit() {
  }
  logout() {
    this.coordinatorService.stopAll();
    this.walletService.clearWallet();
    this.router.navigate(['']);
  }
}
