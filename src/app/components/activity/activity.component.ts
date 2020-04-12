import { Component, Input, OnInit, AfterViewInit, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';

import { Constants } from '../../constants';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { TranslateService } from '@ngx-translate/core';

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
        console.log('activePkh: ', this.activePkh);
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
            if (transaction.source === this.activePkh) {
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
                return '';  // User has undelegate
            }
        } else if (transaction.type === 'transaction') {
        if (this.activePkh === transaction.source) {
            return transaction.destination;  // to
        } else {
            return transaction.source;  // from
        }
        } else if (transaction.type === 'origination') {
            if (this.activePkh === transaction.source) {
                return transaction.destination;
            } else {
                return transaction.source;
            }
        }
        return '';
    }
}
