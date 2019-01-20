import { Component, OnInit, AfterContentInit } from '@angular/core';

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
export class OfflineSigningComponent implements OnInit, AfterContentInit {

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
        this.isFullWallet = this.walletService.isFullWallet();
    }

    // Called once after the first ngDoCheck()
    ngAfterContentInit() {
        this.init();
    }

    init() {
        this.translate.get('OFFLINESIGNINGCOMPONENT.SHOWHELP').subscribe(
            (res: string) => this.instructionBtn = res
        );
        this.translate.get('OFFLINESIGNINGCOMPONENT.PASSWORD').subscribe(
            (res: string) => this.pwdPlaceholder = res
        );
        this.translate.get('OFFLINESIGNINGCOMPONENT.CHOOSEFILE').subscribe(
            (res: string) => this.InputImportOperationFileStep2 = res
        );
        this.translate.get('OFFLINESIGNINGCOMPONENT.CHOOSEFILE').subscribe(
            (res: string) => this.InputImportOperationFileStep3 = res
        );
    }

    toggleShowInstructions() {
        if (this.showInstructions) {
            this.showInstructions = false;
            this.translate.get('OFFLINESIGNINGCOMPONENT.SHOWHELP').subscribe(
                (res: string) => this.instructionBtn = res
            );
        } else {
            this.showInstructions = true;
            this.translate.get('OFFLINESIGNINGCOMPONENT.HIDEHELP').subscribe(
                (res: string) => this.instructionBtn = res
            );
        }
    }
    decodeUnsignedOp() {
        this.decodeUnsignedOutput = '';
        if (!this.unsigned) {
            console.log('don\'t decode');
        } else {
            console.log('decode...');
            try {
                const op = this.operationService.decodeOpBytes(this.unsigned);
                this.decodeUnsignedOutput = '\n### ' + this.translate.instant('OFFLINESIGNINGCOMPONENT.SIGNVERIFYTHISDATA') + ' ###\n';
                // '\n### PLEASE VERIFY THIS DATA IS CORRECT BEFORE SIGNING IT ###\n';
                const output = this.operationService.fop2strings(op);

                for (let i = 0; i < output.length; i++) {
                    this.decodeUnsignedOutput = this.decodeUnsignedOutput + '\n' + output[i];
                }
                this.decodeUnsignedOutput = this.decodeUnsignedOutput + '\n' + '\n';
            } catch (e) {
                this.decodeUnsignedOutput = '\n### ' + this.translate.instant('OFFLINESIGNINGCOMPONENT.ALERTFAILEDTODECODE') + ' ###\n';
                // '\n### FAILED TO DECODE OPERATION BYTES! YOU ARE ADVISED TO NOT PROCEED ###\n';
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
                this.decodeSignedOutput = '\n### ' + this.translate.instant('OFFLINESIGNINGCOMPONENT.BROADCASTVERIFYTHISDATA') + ' ###\n';
                // '\n### PLEASE VERIFY THIS DATA IS CORRECT BEFORE BROADCASTING IT ###\n';
                const output = this.operationService.fop2strings(op);

                for (let i = 0; i < output.length; i++) {
                    this.decodeSignedOutput = this.decodeSignedOutput + '\n' + output[i];
                }
                this.decodeSignedOutput = this.decodeSignedOutput + '\n' + '\n';
            } catch (e) {
                this.decodeSignedOutput = '\n### ' + this.translate.instant('OFFLINESIGNINGCOMPONENT.ALERTFAILEDTODECODE') + ' ###\n';
                // '\n### FAILED TO DECODE OPERATION BYTES! YOU ARE ADVICED TO NOT PROCEED ###\n';
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
                        this.translate.get('OFFLINESIGNINGCOMPONENT.BROADCASTSUCCESSFUL').subscribe(
                            (res: string) => this.messageService.addSuccess(res + ' ' + ans.payload.opHash)
                        );
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
                    this.translate.get('OFFLINESIGNINGCOMPONENT.NODEERROR').subscribe(
                        (res: string) => this.messageService.addError(res)
                    );
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
                    if (data.signed === true && typeof data.hex === 'string') {
                        this.signed2 = data.hex;
                    } else {
                    this.translate.get('OFFLINESIGNINGCOMPONENT.NOTASIGNEDOPERATION').subscribe(
                        (res: string) => this.messageService.addWarning(res)
                    );
                    // this.messageService.addWarning('Not a signed operation!');
                    }
                } else {
                    this.translate.get('OFFLINESIGNINGCOMPONENT.FAILEDTOREADFILE').subscribe(
                        (res: string) => this.messageService.addError(res)
                    );
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
                if (data.signed === false && typeof data.hex === 'string') {
                    this.unsigned = data.hex;
                    this.decodeUnsignedOp();
                } else {
                    this.translate.get('OFFLINESIGNINGCOMPONENT.NOTANUNSIGNEDOPERATION').subscribe(
                        (res: string) => this.messageService.addWarning(res)
                    );
                    // this.messageService.addWarning('Not an unsigned operation!');
                }
            } else {
                this.translate.get('OFFLINESIGNINGCOMPONENT.FAILEDTOREADFILE').subscribe(
                    (res: string) => this.messageService.addError(res)
                );
                // this.messageService.addError('Failed to read file!');
            }
        };
    }
}
