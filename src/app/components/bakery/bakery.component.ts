import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ActivityService } from '../../services/activity.service';
import { Account, Balance, Activity } from '../../interfaces';


@Component({
    selector: 'app-bakery',
    templateUrl: './bakery.component.html',
    styleUrls: ['./bakery.component.scss']
})
export class BakeryComponent implements OnInit {

    constructor(
        public walletService: WalletService,
        private messageService: MessageService,
        private activityService: ActivityService
    ) { }

    ngOnInit() {
    }
}
