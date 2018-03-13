import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  activePkh: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) { }

  ngOnInit() { if (this.identity) { this.init(); } }
  init() {
    this.activePkh = this.identity.pkh;
  }
}
