import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { WalletService } from './services/wallet/wallet.service';
import { CoordinatorService } from './services/coordinator/coordinator.service';
import { TranslateService } from '@ngx-translate/core';

import { toSvg } from "jdenticon";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
  // // tslint:disable-next-line
  // selector: 'body',
  // template: '<router-outlet></router-outlet>'
})

export class AppComponent implements OnInit {
    Buffer = Buffer || [];
    constructor(
        private walletService: WalletService,
        private coordinatorService: CoordinatorService,
        private router: Router
    ) { }

    ngOnInit() {
      this.walletService.loadStoredWallet();
      if (this.walletService.wallet) {
        this.coordinatorService.startAll();
      }

      this.router.events.subscribe((evt) => {
        if (!(evt instanceof NavigationEnd)) {
          return;
        }
        window.scrollTo(0, 0);
      });
    }
}
