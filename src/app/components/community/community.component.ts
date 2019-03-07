import { Component } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';


@Component({
    selector: 'app-community',
    templateUrl: './community.component.html',
    styleUrls: ['./community.component.scss']
})
export class CommunityComponent {

    constructor(
        public walletService: WalletService,
        private delegatorNamePipe: DelegatorNamePipe
    ) { }


}
