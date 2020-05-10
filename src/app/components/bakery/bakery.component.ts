import { Component, OnInit } from '@angular/core';

import { WalletService } from '../../services/wallet/wallet.service';
import { MessageService } from '../../services/message/message.service';
import { ActivityService } from '../../services/activity/activity.service';
import { ImplicitAccount } from '../../services/wallet/wallet';
import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';


@Component({
    selector: 'app-bakery',
    templateUrl: './bakery.component.html',
    styleUrls: ['./bakery.component.scss']
})
export class BakeryComponent implements OnInit {
    implicitAccounts: ImplicitAccount[];
    constructor(
        public walletService: WalletService,
        private messageService: MessageService,
        private activityService: ActivityService,
        private delegatorNamePipe: DelegatorNamePipe
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.implicitAccounts = this.walletService.wallet.implicitAccounts;
        }
    }
}
