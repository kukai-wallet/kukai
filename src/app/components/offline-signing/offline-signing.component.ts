import { Component, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

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

    InputImportOperationFileStep2 = ''; // 'Choose file';
    InputImportOperationFileStep3 = ''; // 'Choose file';

    unsigned = '';  // Will contain the unsigned hash
    signed1 = '';
    signed2 = '';
    signedOp = '';
    pwd = '';
    pwdPlaceholder = '';
    decodeUnsignedOutput = '';
    decodeSignedOutput = '';
    errorMessage = '';
    showInstructions = false;
    instructionBtn = ''; // 'Show help';
    isFullWallet = false;
    notAllowOnlineSigning = true;

    constructor(
        private translate: TranslateService,
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
        // Getting button and placeholder names - Issue: Needs language change detection
        let pwdPlaceholderInit = '';
        let InputImportOperationFileStep2Init = '';
        let InputImportOperationFileStep3Init = '';
        let instructionBtnInit = '';

        this.translate.get('OFFLINESIGNINGCOMPONENT.PASSWORD').subscribe(
            (res: string) => pwdPlaceholderInit = res
        );
        this.translate.get('OFFLINESIGNINGCOMPONENT.CHOOSEFILE').subscribe(
            (res: string) => InputImportOperationFileStep2Init = res
        );
        this.translate.get('OFFLINESIGNINGCOMPONENT.CHOOSEFILE').subscribe(
            (res: string) => InputImportOperationFileStep3Init = res
        );
        this.translate.get('OFFLINESIGNINGCOMPONENT.SHOWHELP').subscribe(
            (res: string) => instructionBtnInit = res
        );

        this.pwdPlaceholder = pwdPlaceholderInit;
        this.InputImportOperationFileStep2 = InputImportOperationFileStep2Init;
        this.InputImportOperationFileStep3 = InputImportOperationFileStep3Init;
        this.instructionBtn = instructionBtnInit;
    }

    toggleShowInstructions() {
        if (this.showInstructions) {
            this.showInstructions = false;

            let showHelp = '';
            this.translate.get('OFFLINESIGNINGCOMPONENT.SHOWHELP').subscribe(
                (res: string) => showHelp = res
            );

            this.instructionBtn = showHelp;

        } else {
            this.showInstructions = true;

            let hideHelp = '';
            this.translate.get('OFFLINESIGNINGCOMPONENT.HIDEHELP').subscribe(
                (res: string) => hideHelp = res
            );

            this.instructionBtn = hideHelp;
        }
    }
    decodeUnsignedOp() {
        if (!this.unsigned) {
            this.decodeUnsignedOutput = '';
            console.log('don\'t decode');
        } else {
            console.log('decode...');
            try {
                const op = this.operationService.decodeOpBytes(this.unsigned);

                let verifyData = '';
                this.translate.get('OFFLINESIGNINGCOMPONENT.SIGNVERIFYTHISDATA').subscribe(
                    (res: string) => verifyData = '\n### ' + res + ' ###\n'
                );

                this.decodeUnsignedOutput = verifyData;  // '\n### PLEASE VERIFY THIS DATA IS CORRECT BEFORE SIGNING IT ###\n';
                const output = this.operationService.fop2strings(op);

                for (let i = 0; i < output.length; i++) {
                    this.decodeUnsignedOutput = this.decodeUnsignedOutput + '\n' + output[i];
                }
                this.decodeUnsignedOutput = this.decodeUnsignedOutput + '\n' + '\n';
            } catch (e) {

                let failedDecode = '';
                this.translate.get('OFFLINESIGNINGCOMPONENT.ALERTFAILEDTODECODE').subscribe(
                    (res: string) => failedDecode = '\n### ' + res + ' ###\n'
                );

                this.decodeUnsignedOutput = failedDecode; // '\n### FAILED TO DECODE OPERATION BYTES! YOU ARE ADVISED TO NOT PROCEED ###\n';
            }
        }
    }
    decodeSignedOp() {
        if (!this.signed2) {
            this.decodeSignedOutput = '';
            console.log('don\'t decode');
        } else {
            console.log('decode...');
            try {
                const op = this.operationService.decodeOpBytes(this.signed2.slice(0, this.signed2.length - 128));

                let verifyData = '';
                this.translate.get('OFFLINESIGNINGCOMPONENT.BROADCASTVERIFYTHISDATA').subscribe(
                    (res: string) => verifyData = '\n### ' + res + ' ###\n'
                );

                this.decodeSignedOutput = verifyData;  // '\n### PLEASE VERIFY THIS DATA IS CORRECT BEFORE BROADCASTING IT ###\n';
                const output = this.operationService.fop2strings(op);

                for (let i = 0; i < output.length; i++) {
                    this.decodeSignedOutput = this.decodeSignedOutput + '\n' + output[i];
                }
                this.decodeSignedOutput = this.decodeSignedOutput + '\n' + '\n';
            } catch (e) {

                let failedDecode = '';
                this.translate.get('OFFLINESIGNINGCOMPONENT.ALERTFAILEDTODECODE').subscribe(
                    (res: string) => failedDecode = '\n### ' + res + ' ###\n'
                );

                this.decodeSignedOutput = failedDecode; // '\n### FAILED TO DECODE OPERATION BYTES! YOU ARE ADVICED TO NOT PROCEED ###\n';
            }
        }
    }
    isOnline(): boolean {
        if (!this.walletService.wallet) {
            return true;
        }
        return (this.walletService.wallet.XTZrate !== null || this.walletService.wallet.balance.balanceXTZ !== null);
    }
    allowToSignInOnlineWallet() {
        this.notAllowOnlineSigning = false;
    }
    notAllowedToSign(): boolean {
        return (!this.isFullWallet || (this.isOnline() && this.notAllowOnlineSigning));
    }
    broadcast() {
        if (this.signed2) {
            const signed = this.signed2;
            this.signed2 = '';

            this.operationService.broadcast(signed).subscribe(
                (ans: any) => {
                    console.log(JSON.stringify(ans));
                    if (ans.success) {
                        let brodcastSuccessful = '';
                        this.translate.get('OFFLINESIGNINGCOMPONENT.BROADCASTSUCCESSFUL').subscribe(
                            (res: string) => brodcastSuccessful = res
                        );
                        this.messageService.addSuccess(brodcastSuccessful + ' ' + ans.payload.opHash);
                        // this.messageService.addSuccess('Operation successfully broadcasted to the network: ' + ans.payload.opHash);
                        if (ans.payload.newPkh) {
                            console.log('New pkh found: ' + ans.payload.newPkh);
                            if (this.walletService.wallet) {
                                this.walletService.addAccount(ans.payload.newPkh);
                                this.coordinatorService.start(ans.payload.newPkh);
                            }
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
                    let nodeError = '';
                    this.translate.get('OFFLINESIGNINGCOMPONENT.NODEERROR').subscribe(
                        (res: string) => nodeError = res
                    );
                    this.messageService.addError(nodeError);
                    // this.messageService.addError('Node responded with an error!');
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
                        let notSignedOperation = '';
                    this.translate.get('OFFLINESIGNINGCOMPONENT.NOTASIGNEDOPERATION').subscribe(
                        (res: string) => notSignedOperation = res
                    );
                    this.messageService.addWarning(notSignedOperation);
                    // this.messageService.addWarning('Not a signed operation!');
                    }
                } else {
                    let failedToRead = '';
                    this.translate.get('OFFLINESIGNINGCOMPONENT.FAILEDTOREADFILE').subscribe(
                        (res: string) => failedToRead = res
                    );
                    this.messageService.addError(failedToRead);
                    // this.messageService.addError('Failed to read file!');
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
                    let notUnSignedOperation = '';
                    this.translate.get('OFFLINESIGNINGCOMPONENT.NOTANUNSIGNEDOPERATION').subscribe(
                        (res: string) => notUnSignedOperation = res
                    );
                    this.messageService.addWarning(notUnSignedOperation);
                    // this.messageService.addWarning('Not an unsigned operation!');
                }
            } else {
                let failedToRead = '';
                this.translate.get('OFFLINESIGNINGCOMPONENT.FAILEDTOREADFILE').subscribe(
                    (res: string) => failedToRead = res
                );
                this.messageService.addError(failedToRead);
                // this.messageService.addError('Failed to read file!');
            }
        };
    }
}
