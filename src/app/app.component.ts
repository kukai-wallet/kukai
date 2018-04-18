import { Component, OnInit } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { UpdateCoordinatorService } from './services/update-coordinator.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private walletService: WalletService,
    private updateCoordinatorService: UpdateCoordinatorService) { }
  ngOnInit() {
    this.walletService.loadStoredWallet();
    if (this.walletService.wallet) {
      this.updateCoordinatorService.start();
    }
  }
}
