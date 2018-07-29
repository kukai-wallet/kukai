import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ActivityService } from '../../services/activity.service';
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
        private walletService: WalletService,
        private messageService: MessageService,
        private activityService: ActivityService,
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
