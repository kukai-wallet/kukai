import { Component, OnInit, AfterViewInit } from '@angular/core';
// import { DOCUMENT } from '@angular/platform-browser';

import * as copy from 'copy-to-clipboard';
import * as jdenticon from 'jdenticon';

import { TranslateService } from '@ngx-translate/core'; // Multiple instances created ?
import { WalletService } from '../../services/wallet/wallet.service';
import { MessageService } from '../../services/message/message.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import {
  ImplicitAccount,
  OriginatedAccount,
  Account,
  HdWallet,
} from '../../services/wallet/wallet';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, AfterViewInit {
  activeAccount: Account;
  dom: Document;
  implicitAccounts: ImplicitAccount[];
  originatedAccounts: OriginatedAccount[];

  constructor(
    private translate: TranslateService,
    public walletService: WalletService,
    private messageService: MessageService,
    private coordinatorService: CoordinatorService
  ) {}

  ngOnInit() {
    if (this.walletService.wallet) {
      this.coordinatorService.startAll();
      this.implicitAccounts = this.walletService.wallet.implicitAccounts;
      this.activeAccount = this.implicitAccounts[0];
    }
  }
  ngAfterViewInit() {
    if (this.activeAccount) {
      jdenticon.update('#selected-pkh-jdenticon', this.activeAccount.address);
    }
  }
  click(account: Account) {
    if (this.activeAccount.address !== account.address) {
      this.activeAccount = account;
      jdenticon.update('#selected-pkh-jdenticon', this.activeAccount.address);
    }
    console.log(this.activeAccount ? this.activeAccount.address : 'none');
  }
  dblclick(account: Account) {
    copy(account.address);
    const copyToClipboard = this.translate.instant(
      'OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD'
    );
    this.messageService.add(account.address + ' ' + copyToClipboard, 5);
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
