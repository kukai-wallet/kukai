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
    @Input() pwd3 = '';
    mySeed = '';
    showFileButton = false;
    saveSuccessfully = false;
    pk = '';
    wait = 0;

    constructor(
        private walletService: WalletService,
        private exportService: ExportService,
        private messageService: MessageService
    ) { }

    ngOnInit() {

    }

    decryptSeed() {
        this.mySeed = 'item similar grow aim monster kick debris empty early pelican senior history creek impulse slim';
    }

    revealFileButton() {
        this.showFileButton = true;
    }

    saveFile() {
        this.messageService.addSuccess('Exporting Wallet to file...');
        this.exportService.downloadWallet();
    }
    decryptPk() {
        const pwd = this.pwd3;
        this.pwd3 = '';
        if (pwd) {
            let keys;
            this.wait = 1;
            this.messageService.addSuccess('Exporting View-only Wallet to file...');
            setTimeout(() => {
                if (this.walletService.isPasswordProtected()) {
                keys = this.walletService.getKeys(pwd, null);
                } else {
                keys = this.walletService.getKeys(null, pwd);
                }
                this.exportService.downloadViewOnlyWallet(keys.pk);
                this.wait = 0;
            }, 200);
        }
    }
    ngOnDestroy() {
        this.mySeed = '';
        this.showFileButton = false;
        this.saveSuccessfully = false;
    }

}
