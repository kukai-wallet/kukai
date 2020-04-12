import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { WalletService } from '../../services/wallet/wallet.service';
import { ExportService } from '../../services/export/export.service';
import { MessageService } from '../../services/message/message.service';

@Component({
    selector: 'app-backup',
    templateUrl: './backup.component.html',
    styleUrls: ['./backup.component.scss']
})

export class BackupComponent implements OnInit, OnDestroy {
    @Input() pwd2 = '';
    @Input() pwd3 = '';
    pk = '';
    constructor(
        public walletService: WalletService,
        private exportService: ExportService,
        private messageService: MessageService
    ) { }
    ngOnInit() {
    }
    saveFile() {
        this.messageService.addSuccess('Exporting Wallet to file...');
        this.exportService.downloadWallet();
    }
    async decryptPk() {
        const pwd = this.pwd2;
        this.pwd2 = '';
        setTimeout(() => {
            if (pwd) {
                let keys;
                if (keys = this.walletService.getKeys(pwd)) {
                    this.messageService.addSuccess('Exporting View-only Wallet to file...');
                    this.exportService.downloadViewOnlyWallet(keys.pk);
                } else {
                    this.messageService.addError('Wrong password!');
                }
            }
        }, 100);
    }
    ngOnDestroy() {
    }
}
