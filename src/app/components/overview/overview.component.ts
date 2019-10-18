import { Component, OnInit } from '@angular/core';
// import { DOCUMENT } from '@angular/platform-browser';

import * as copy from 'copy-to-clipboard';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?
import { ConseilService } from '../../services/conseil.service';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { CoordinatorService } from '../../services/coordinator.service';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
    identity = null;
    accounts = null;
    activePkh: string;
    selectedPkh: string;
    dom: Document;

    constructor(
        private translate: TranslateService,
        public walletService: WalletService,
        private messageService: MessageService,
        private coordinatorService: CoordinatorService,
        private conseilService: ConseilService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.identity = this.walletService.wallet.accounts[0];
            this.coordinatorService.startAll();
        }
        this.conseilService.getContractAddresses('tz1S9eJU9cTDvwfVVvCo9bTeaA44yPTZecCb');
    }
    click(pkh: string) {
        if (this.selectedPkh === pkh) {
            this.selectedPkh = null;
        } else {
            this.selectedPkh = pkh;
        }
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
