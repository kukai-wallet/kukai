import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ActivityService } from '../../services/activity.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  constructor(public walletService: WalletService,
    private messageService: MessageService,
    private activityService: ActivityService,
    private coordinatorService: CoordinatorService,
    private router: Router) { }

  ngOnInit() {
  }
  logout() {
    this.coordinatorService.stopAll();
    this.walletService.clearWallet();
    this.router.navigate(['']);
  }
}
