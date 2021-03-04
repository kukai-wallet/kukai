import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { TorusWallet } from '../../services/wallet/wallet';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  constructor(
    public walletService: WalletService,
  ) { }

  ngOnInit(): void {
  }

  displayName(): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.displayName()
    } else {
      return ''
    }
  }
}
