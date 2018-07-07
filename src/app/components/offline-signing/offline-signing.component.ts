import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { OperationService } from '../../services/operation.service';
import { MessageService } from '../../services/message.service';
import { ExportService } from '../../services/export.service';
import { CoordinatorService } from '../../services/coordinator.service';

@Component({
    selector: 'app-offline-signing',
    templateUrl: './offline-signing.component.html',
    styleUrls: ['./offline-signing.component.scss']
})
export class OfflineSigningComponent implements OnInit {

    InputImportOperationFileStep2 = 'Choose file';
    InputImportOperationFileStep3 = 'Choose file';

    unsigned = '';
    signed1 = '';
    signed2 = '';
    signedOp = '';
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
                this.decodeOutput = '\n### PLEASE VERIFY THIS DATA ARE CORRECT BEFORE SIGNING ###\n';
                const output = this.operationService.fop2strings(op);
                for (let i = 0; i < output.length; i++) {
                    this.decodeOutput = this.decodeOutput + '\n' + output[i];
                }
            } catch (e) {
                this.decodeOutput = '\n### FAILED TO DECODE OPERATION BYTES! YOU ARE ADVICED TO NOT PROCEED ###\n';
            }
        }
    }
    isOnline(): boolean {
        if (!this.walletService.wallet) {
            return true;
        }
        return (this.walletService.wallet.XTZrate !== null || this.walletService.wallet.balance.balanceXTZ !== null);
    }
    notAllowedToSign(): boolean {
        return (!this.isFullWallet || this.isOnline());
    }
    broadcast() {
        if (this.signed2) {
            const signed = this.signed2;
            this.signed2 = '';

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
                        if (typeof ans.payload.msg === 'string') {
                            this.messageService.addError(this.errorMessage);
                            this.signed2 = signed;
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
                        this.signed2 = data.hex;
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
                this.signed1 = signed.sbytes;
            }
        }
    }

    download() {
        this.exportService.downloadOperationData(this.signed1, true);
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
