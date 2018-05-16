import { Component, OnInit, Input } from '@angular/core';
import { OperationService } from '../../services/operation.service';
import { MessageService } from '../../services/message.service';
import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';

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

    @Input() signed = '';

    constructor(
        private operationService: OperationService,
        private messageService: MessageService,
        private walletService: WalletService,
        private coordinatorService: CoordinatorService
    ) { }

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

    broadcast() {
        if (this.signed) {
            const signed = this.signed;
            this.signed = '';

            this.operationService.broadcast(signed).subscribe(
                (ans: any) => {
                    console.log(JSON.stringify(ans));
                    if (ans.success) {
                        this.messageService.addSuccess('Operation successfully broadcasted to the network: ' + ans.payload.opHash);
                        this.coordinatorService.setBroadcast();
                    } else {
                        this.messageService.addWarning('Couldn\'t retrive operation hash!');
                    }
                },
                err => {
                    this.messageService.addError('Node responed with an error!');
                    console.log(JSON.stringify(err));
                }
            );
        }
    }

    import(files: FileList) {
        console.log('Files length: ' + files.length);
        const fileToUpload = files.item(0);
        const reader = new FileReader();
        reader.readAsText(fileToUpload);

        reader.onload = () => {
            if (reader.result) {
                const data = JSON.parse(reader.result);

                if (data.signed === true && data.hex) {
                    this.signed = data.hex;
                } else {
                    this.messageService.addWarning('Not an unsigned operation!');
                }
            } else {
                this.messageService.addError('Failed to read file!');
            }
        };
    }
}
