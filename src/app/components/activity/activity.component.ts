import { Component, Input, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { Account } from '../../services/wallet/wallet';
import { Constants } from '../../constants';

@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
    CONSTANTS = new Constants();

    @Input() activeAccount: Account;
    constructor(
        private walletService: WalletService
    ) {}

    ngOnInit() { if (this.walletService.wallet) { this.init(); } }
    init() {
        console.log('activePkh: ', this.activeAccount.address);
    }

    /*
    getStatus(transaction: any): string {
        if (transaction.failed) {
            return 'Failed';
        } else {
            return 'Confirmed';
        }
    }*/

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
            if (transaction.source === this.activeAccount.address) {
                operationType = 'sent';
            } else {
                operationType = 'received';
            }
            return operationType;
        }
    }

    getCounterparty(transaction: any): string {
        if (transaction.type === 'delegation') {
            if (transaction.destination) {
             return transaction.destination;
            } else {
                return '';  // User has undelegated
            }
        } else if (transaction.type === 'transaction') {
        if (this.activeAccount.address === transaction.source) {
            return transaction.destination;  // to
        } else {
            return transaction.source;  // from
        }
        } else if (transaction.type === 'origination') {
            if (this.activeAccount.address === transaction.source) {
                return transaction.destination;
            } else {
                return transaction.source;
            }
        }
        return '';
    }
}
