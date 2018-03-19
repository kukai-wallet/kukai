import { Component, OnInit } from '@angular/core';
import { WalletService } from './services/wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private walletService: WalletService) { }
  ngOnInit() {
    this.walletService.loadStoredWallet();
  }
}
