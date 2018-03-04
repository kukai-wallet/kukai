import { Component, OnInit } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { ActivityService } from './services/activity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private walletService: WalletService,
    private tzscanService: ActivityService) { }
  ngOnInit() {
    this.walletService.loadStoredWallet();
    this.tzscanService.loadStoredTransactions();
  }
}
