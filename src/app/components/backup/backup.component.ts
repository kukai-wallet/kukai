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
    mySeed = '';
    showFileButton = false;
    saveSuccessfully = false;
    pwdType = '';
    pk = '';
    wait = 0;

    constructor(
        private walletService: WalletService,
        private exportService: ExportService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet && this.walletService.isFullWallet()) {
            if (this.walletService.isPasswordProtected()) {
                this.pwdType = 'Password';
            } else if (this.walletService.isPassphraseProtected()) {
                this.pwdType = 'Passphrase';
            }
        }
    }

    decryptSeed() {
        if (this.pwd3) {
            const pwd = this.pwd3;
            this.pwd3 = '';
            this.mySeed = this.walletService.getMnemonicHelper(pwd);
            if (!this.mySeed) {
                this.messageService.addError('Failed to reveal seed. Wrong password?');
            }
        }
    }
    clearSeed() {
        this.mySeed = '';
    }

    revealFileButton() {
        this.showFileButton = true;
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
            if (this.walletService.isFullWallet()) {
                this.wait = 1;
                keys = this.walletService.getKeysHelper(pwd);
                this.exportService.downloadViewOnlyWallet(keys.pk);
            }
            // document.body.style.cursor = 'default';
        }
    }
    ngOnDestroy() {
        this.mySeed = '';
        this.showFileButton = false;
        this.saveSuccessfully = false;
    }

}
