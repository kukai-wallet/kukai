import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import {
  TorusWallet,
  ImplicitAccount
} from '../../../services/wallet/wallet';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['../../../../scss/components/embedded//card/card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() activeAccount: ImplicitAccount;

  constructor(
    private walletService: WalletService,
  ) { }

  ngOnInit(): void {
  }

  displayName(): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.displayName();
    } else {
      return '';
    }
  }

  verifier(): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.verifier;
    } else {
      return '';
    }
  }
}
