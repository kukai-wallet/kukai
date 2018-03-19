import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnChanges {
  accounts = null;
  @Input() activePkh: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private activityService: ActivityService
  ) { }

  ngOnInit() { if (this.walletService.wallet) { this.init(); } }
  init() {
    this.accounts = this.walletService.wallet.accounts;
  }
  getTransactions() {
    this.activityService.updateTransactions(this.activePkh);
  }
  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['activePkh'] && this.activePkh) {
      this.getTransactions();
    }
 }
  getStatus(hash: string): string {
    if (hash === 'prevalidation') {
      return 'Unconfirmed';
    } else {
      return 'Confirmed';
    }
  }
}
