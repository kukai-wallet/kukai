import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';

@Component({
    selector: 'app-backup',
    templateUrl: './backup.component.html',
    styleUrls: ['./backup.component.scss']
})

export class BackupComponent implements OnInit {

    constructor(private walletService: WalletService) { }

    ngOnInit() {

    }

}
