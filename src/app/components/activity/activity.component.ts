import { Component, Input, OnInit, AfterViewInit, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { TzscanService } from '../../services/tzscan.service';

import { Constants } from '../../constants';

@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
    accounts = null;
    CONSTANTS = new Constants();
    showBtn = 'Show More';
    showActivities = [];
    extraCalls = 0;

    @Input() activePkh: string;
    constructor(
        private walletService: WalletService,
        private tzscanService: TzscanService,
    ) {}

    ngOnInit() { if (this.walletService.wallet) { this.init(); } }

    init() {
        this.accounts = this.walletService.wallet.accounts;
        this.showActivities = this.accounts[0].activities;
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

    getType(transaction: any): string {
        if (transaction.type !== 'transaction') {
            if (transaction.type === 'delegation') {
                if (transaction.destination) {
                    return 'delegate';
                } else {
                    return 'undelegate';
                }
            } else {
                return transaction.type;
            }
        } else {
            let operationType = '';
            if (transaction.amount > 0) {
                operationType = 'received';
            } else {
                operationType = 'sent';
            }
            return operationType;
        }
    }

    getCounterparty(transaction: any): string {
        // console.log('transaction - getCounterparty', transaction);
        let counterparty = '';

        // Checks for delegation as destination is stored in transaction.destination.tz
        if (transaction.type === 'delegation') {
            if (transaction.destination) {
             return transaction.destination.tz;
            } else {
                return '';  // User has undelegate
            }
        }

        if (this.activePkh === transaction.source) {
            counterparty = transaction.destination;  // to
        } else {
            counterparty = transaction.source;  // from
        }

        return counterparty;
    }

    toggleTransactions() {
        let newOperations: any;
        this.extraCalls = this.extraCalls + 1;
        this.showBtn = 'Show Less';
        // newOperations = this.tzscanService.operations(this.activePkh, 10, this.extraCalls);
        this.tzscanService.operations(this.activePkh, 10, this.extraCalls).subscribe(
            (res: any) => {
                newOperations = res;
                console.log('showActivities before: ', this.showActivities);
                this.showActivities = this.showActivities.concat(res);
                console.log('res: ', res);  // working - getting next 10 operations
                console.log('showActivities after: ', this.showActivities);
            }
        );
        console.log('newOperations: ', newOperations);  // not working - undefined
    }
}
