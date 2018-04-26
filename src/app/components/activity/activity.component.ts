import { Component, Input, OnInit, AfterViewInit, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  accounts = null;
  @Input() activePkh: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) { }

  ngOnInit() { if (this.walletService.wallet) { this.init(); } }
  init() {
    this.accounts = this.walletService.wallet.accounts;

    console.log('this.accounts.activities', this.accounts[0].activities);
  }
  getStatus(hash: string): string {
    if (hash === 'prevalidation') {
      return 'Unconfirmed';
    } else {
      return 'Confirmed';
    }
  }
}
