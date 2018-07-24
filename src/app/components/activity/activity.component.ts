import { Component, Input, OnInit, AfterViewInit, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { Constants } from '../../constants';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  accounts = null;
  CONSTANTS = new Constants();
  @Input() activePkh: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) {}

  ngOnInit() { if (this.walletService.wallet) { this.init(); } }
  init() {
    this.accounts = this.walletService.wallet.accounts;
    console.log('transaction', this.accounts[0].activities);
  }
  getStatus(transaction: any): string {
    if (transaction.failed) {
      return 'Failed';
    } else if (transaction.block === 'prevalidation') {
      return 'Unconfirmed';
    } else {
      return 'Confirmed';
    }
  }
}
