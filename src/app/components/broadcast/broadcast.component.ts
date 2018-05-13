import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-broadcast',
    templateUrl: './broadcast.component.html',
    styleUrls: ['./broadcast.component.scss']
})
export class BroadcastComponent implements OnInit {

    InputImportWalletFileStep1 = 'Choose file';
    InputImportWalletFileStep2 = 'Choose file';
    InputImportOperationFileStep2 = 'Choose file';
    InputImportOperationFileStep3 = 'Choose file';

    constructor() { }

    ngOnInit() {
    }

    handleViewOnlyWalletFileInput(files: FileList) {
        let walletFileInput = files.item(0);
        this.InputImportWalletFileStep1 = walletFileInput.name;
    }

    handleWalletFileInput(files: FileList) {
        let walletFileInput = files.item(0);
        this.InputImportWalletFileStep2 = walletFileInput.name;
    }

    handleUnsignedOperationFileInput(files: FileList) {
        let operationFileInput = files.item(0);
        this.InputImportOperationFileStep2 = operationFileInput.name;
    }

    handleSignedOperationFileInput(files: FileList) {
        let signedOperationFileInput = files.item(0);
        this.InputImportOperationFileStep3 = signedOperationFileInput.name;
    }

}
