import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { OperationService } from '../../services/operation.service';
import { MessageService } from '../../services/message.service';
import { ExportService } from '../../services/export.service';
import { CoordinatorService } from '../../services/coordinator.service';

@Component({
    selector: 'app-broadcast',
    templateUrl: './broadcast.component.html',
    styleUrls: ['./broadcast.component.scss']
})
export class BroadcastComponent implements OnInit {

    InputImportOperationFileStep2 = 'Choose file';
    InputImportOperationFileStep3 = 'Choose file';

    unsigned = '';
    signed = '';
    pwd = '';
    pwdPlaceholder = '';
    decodeOutput = '';
    errorMessage = '';
    showInstructions = false;
    instructionBtn = 'Show help';
    isFullWallet = false;

    constructor(
        public walletService: WalletService,
        private operationService: OperationService,
        private messageService: MessageService,
        private exportService: ExportService,
        private coordinatorService: CoordinatorService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet && this.walletService.isFullWallet()) {
            this.init();
        }

        this.isFullWallet = this.walletService.isFullWallet();
    }

    init() {
        this.pwdPlaceholder = 'Password';
    }
    toggleShowInstructions() {
        if (this.showInstructions) {
            this.showInstructions = false;
            this.instructionBtn = 'Show help';
        } else {
            this.showInstructions = true;
            this.instructionBtn = 'Hide help';
        }
    }
    decodeUnsignedOp() {
        if (!this.unsigned) {
            this.decodeOutput = '';
            console.log('don\'t decode');
        } else {
            console.log('decode...');
            try {
                const op = this.operationService.decodeOpBytes(this.unsigned);
                this.decodeOutput = '### PLEASE VERIFY THAT THIS DATA ARE CORRECT BEFORE SIGNING ###\n' + JSON.stringify(op, null, 4);
            } catch {
                this.decodeOutput = '### FAILED TO DECODE OPERATION BYTES! YOU ARE ADVICED TO NOT PROCEED ###';
            }
        }
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
                        if (ans.payload.newPkh) {
                            console.log('New pkh found: ' + ans.payload.newPkh);
                            this.walletService.addAccount(ans.payload.newPkh);
                            this.coordinatorService.start(ans.payload.newPkh);
                        }
                    } else {
                        this.errorMessage = ans.payload.msg;
                        this.messageService.addWarning('Couldn\'t retrive operation hash!');
                        if (typeof ans.payload.msg === 'string') {
                            this.messageService.addError(this.errorMessage);
                        }
                    }
                },
                err => {
                    this.messageService.addError('Node responded with an error!');
                    console.log(JSON.stringify(err));
                }
            );
        }
    }

    handleSignedOperationFileInput(files: FileList) {
        console.log('Files length: ' + files.length);
        const fileToUpload = files.item(0);
        if (fileToUpload) {
            this.InputImportOperationFileStep3 = fileToUpload.name;

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

    sign() {
        if (this.pwd) {
            console.log('sign');
            const pwd = this.pwd;
            this.pwd = '';
            const keys = this.walletService.getKeys(pwd);
            if (keys) {
                const signed = this.operationService.sign(this.unsigned, keys.sk);
                this.signed = signed.sbytes;
            }
        }
    }

    download() {
        this.exportService.downloadOperationData(this.signed, true);
    }

    handleUnsignedOperationFileInput(files: FileList) {
        const fileToUpload = files.item(0);
        this.InputImportOperationFileStep2 = fileToUpload.name;

        const reader = new FileReader();
        reader.readAsText(fileToUpload);

        reader.onload = () => {
            if (reader.result) {
                const data = JSON.parse(reader.result);

                if (data.signed === false && data.hex) {
                    this.unsigned = data.hex;
                    this.decodeUnsignedOp();
                } else {
                    this.messageService.addWarning('Not an unsigned operation!');
                }
            } else {
                this.messageService.addError('Failed to read file!');
            }
        };
    }
}
