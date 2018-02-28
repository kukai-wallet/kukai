import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  fromPkh: string;
  toPkh: string;
  amount: number;
  fee: number;
  password: string;
  constructor(
    private walletService: WalletService
  ) { }

  ngOnInit() {
    if (this.identity) {
      this.fromPkh = this.identity.keyPair.pkh;
    }
  }
  sendTransaction() {
    if (this.validInput) {
      this.password = '';
      // Send
    }
  }
  validInput() {
    return true;
  }
}
