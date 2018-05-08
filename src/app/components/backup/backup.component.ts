import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';

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

    constructor(private walletService: WalletService) { }

    ngOnInit() {

    }

    decryptSeed() {
        this.mySeed = 'item similar grow aim monster kick debris empty early pelican senior history creek impulse slim';
    }

    revealFileButton() {
        this.showFileButton = true;
    }

    saveFile() {
        this.saveSuccessfully = true;
    }
    decryptPk() {
        const pwd = this.pwd3;
        this.pwd3 = '';
        if (pwd) {
            let keys;
            this.wait = 1;
            setTimeout(() => {
                if (this.walletService.isPasswordProtected()) {
                keys = this.walletService.getKeys(pwd, null);
                } else {
                keys = this.walletService.getKeys(null, pwd);
                }
                this.pk = keys.pk;
                console.log(keys.pk);
                this.wait = 0;
            }, 100);
        }
    }
    ngOnDestroy() {
        this.mySeed = '';
        this.showFileButton = false;
        this.saveSuccessfully = false;
    }

}
