import { Component, OnInit, OnDestroy } from '@angular/core';
import { WalletService } from '../../services/wallet.service';

@Component({
    selector: 'app-backup',
    templateUrl: './backup.component.html',
    styleUrls: ['./backup.component.scss']
})

export class BackupComponent implements OnInit, OnDestroy {
    mySeed = '';
    showFileButton = false;
    saveSuccessfully = false;

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

    ngOnDestroy() {
        this.mySeed = '';
        this.showFileButton = false;
        this.saveSuccessfully = false;
    }

}
