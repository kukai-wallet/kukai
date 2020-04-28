import { Component, OnInit, AfterViewInit } from '@angular/core';
// import { DOCUMENT } from '@angular/platform-browser';

import * as copy from 'copy-to-clipboard';

import * as jdenticon from 'jdenticon';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?
import { WalletService } from '../../services/wallet/wallet.service';
import { MessageService } from '../../services/message/message.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
    identity = null;
    accounts = null;
    activePkh: string;
    // selectedPkh: string;
    selectedAccount: any;
    dom: Document;
    jdenticon: string = '';

    constructor(
        private translate: TranslateService,
        public walletService: WalletService,
        private messageService: MessageService,
        private coordinatorService: CoordinatorService
    ) {}

    ngOnInit() {
        if (this.walletService.wallet) {
            this.identity = this.walletService.wallet.accounts[0];
            this.coordinatorService.startAll();
            // this.selectedPkh = this.walletService.wallet.accounts[0].pkh;
            this.selectedAccount = this.walletService.wallet.accounts[0];
            this.jdenticon = this.selectedAccount.pkh
        }
    }

    ngAfterViewInit() {
      jdenticon.update("#selected-pkh-jdenticon", this.jdenticon);
    }

    click(account: Object) {
        // if !(this.selectedPkh === pkh) {
        //     this.selectedPkh = null;
        // } else {
        //     this.selectedPkh = pkh;
        // }
      this.selectedAccount = account;
      this.jdenticon = this.selectedAccount.pkh;
      jdenticon.update("#selected-pkh-jdenticon", this.selectedAccount.pkh);
    }
    dblclick(pkh: string) {
        copy(pkh);
        let copyToClipboard = '';
        this.translate.get('OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD').subscribe(
            (res: string) => copyToClipboard = res
          );

        this.messageService.add(pkh + ' ' + copyToClipboard);
    }
}
