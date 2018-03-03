import { Component, OnInit } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { TzscanService } from './services/tzscan.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private walletService: WalletService,
    private tzscanService: TzscanService) { }
  ngOnInit() {
    this.walletService.loadStoredWallet();
    this.tzscanService.loadStoredTransactions();
  }
}
