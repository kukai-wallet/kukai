import { Component, Input, OnInit, AfterViewInit, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
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
        private walletService: WalletService
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

    getType(transaction: any): string {
        if (transaction.type !== 'transaction') {
            return transaction.type;
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
        console.log('transaction - getCounterparty', transaction);
        let counterparty = '';

        // Checks for delegation as destination is stored in transaction.destination.tz
        if (transaction.type === 'delegation') {
            return transaction.destination.tz;
        }

        if (this.activePkh === transaction.source) {
            counterparty = transaction.destination;  // to
        } else {
            counterparty = transaction.source;  // from
        }

        return counterparty;
    }
}
