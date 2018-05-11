import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { ExportService } from '../../services/export.service';
import { MessageService } from '../../services/message.service';

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
        private walletService: WalletService,
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
        if (pwd) {
            let keys;
            this.messageService.addSuccess('Exporting View-only Wallet to file...');
            keys = this.walletService.getKeys(pwd);
            this.exportService.downloadViewOnlyWallet(keys.pk);
        }
    }
    ngOnDestroy() {
    }

}
