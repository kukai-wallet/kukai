import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { TzscanService } from '../../services/tzscan.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  activePkh: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private tzscanService: TzscanService
  ) { }

  ngOnInit() { if (this.identity) { this.init(); } }
  init() {
    this.activePkh = this.identity.keyPair.pkh;
    this.getTransactions();
  }
  getTransactions() {
    this.tzscanService.getTransactions(this.activePkh);
  }
}
