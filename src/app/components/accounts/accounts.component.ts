import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../services/wallet/wallet.service';
import * as copy from 'copy-to-clipboard';
import { TranslateService } from '@ngx-translate/core'; // Multiple instances created ?
import { MessageService } from '../../services/message/message.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import {
  ImplicitAccount,
  OriginatedAccount,
  Account,
  HdWallet,
} from '../../services/wallet/wallet';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  implicitAccounts: ImplicitAccount[];
  constructor(
    public walletService: WalletService,
    private router: Router,
    private translate: TranslateService,
    private messageService: MessageService,
    private coordinatorService: CoordinatorService
  ) { }

  ngOnInit(): void {
    if (!this.walletService.wallet) {
      this.router.navigate(['']);
    } else {
      this.coordinatorService.startAll();
      this.implicitAccounts = this.walletService.wallet.implicitAccounts;
    }
  }
  copy(account: Account) {
    copy(account.address);
    const copyToClipboard = this.translate.instant(
      'OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD'
    );
    this.messageService.add(account.address + ' ' + copyToClipboard, 5);
  }
  select(account: Account) {
    console.log('Selected: ' + account.address);
    this.router.navigate(['account', account.address]);
  }
  addPkh() {
    if (this.openPkhSpot()) {
      const pkh = this.walletService.incrementAccountIndex();
      this.coordinatorService.start(pkh);
    } else {
      console.log('blocked!');
    }
  }
  openPkhSpot(): boolean {
    const counter = this.implicitAccounts[this.implicitAccounts.length - 1]
      .activitiesCounter;
    const balance: number = this.implicitAccounts[
      this.implicitAccounts.length - 1
    ].balanceXTZ;
    return (
      this.walletService.wallet instanceof HdWallet &&
      ((counter && counter > 0) || (balance !== null && balance > 0))
    );
  }
}
