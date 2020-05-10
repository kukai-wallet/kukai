import { Component, TemplateRef, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { KeyPair } from '../../interfaces';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { OperationService } from '../../services/operation/operation.service';
import { ExportService } from '../../services/export/export.service';
import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { LedgerService } from '../../services/ledger/ledger.service';
import { Constants } from '../../constants';
import { LedgerWallet, Account, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';

@Component({
    selector: 'app-delegate',
    templateUrl: './delegate.component.html',
    styleUrls: ['./delegate.component.scss']
})
export class DelegateComponent implements OnInit {
    recommendedFee = 0.0013;
    revealFee = 0;
    pkhFee = 0.0013;
    ktFee = 0.003;
    @ViewChild('modal1') modal1: TemplateRef<any>;
    CONSTANTS = new Constants();
    @Input() activeAccount: Account;
    implicitAccounts;
    toPkh: string;
    storedDelegate: string;
    fee: string;
    storedFee: string;
    password: string;
    pwdValid: string;
    formInvalid = '';
    sendResponse: any;
    ledgerInstruction = '';
    modalRef1: BsModalRef;
    modalRef2: BsModalRef;
    modalRef3: BsModalRef;

    constructor(
        private modalService: BsModalService,
        private walletService: WalletService,
        private operationService: OperationService,
        private coordinatorService: CoordinatorService,
        private exportService: ExportService,
        private inputValidationService: InputValidationService,
        private ledgerService: LedgerService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.init();
        }
    }

    init() {
        this.implicitAccounts = this.walletService.wallet.implicitAccounts;
    }

    open1(template1: TemplateRef<any>) {
        if (this.walletService.wallet) {
            this.clearForm();
            this.checkReveal();
            this.modalRef1 = this.modalService.show(template1, { class: 'first' });
        }
    }
    open2(template: TemplateRef<any>) {
        this.formInvalid = this.invalidInput();
        if (!this.formInvalid) {
            if (!this.fee) { this.fee = this.recommendedFee.toString(); }
            this.storedFee = this.fee;
            this.storedDelegate = this.toPkh;
            this.close1();
            this.modalRef2 = this.modalService.show(template, { class: 'second' });
            if (this.walletService.isLedgerWallet()) {
                this.ledgerInstruction = 'Preparing transaction data. Please wait...';
                const keys = this.walletService.getKeys('');
                this.sendDelegation(keys);
              }
        }
    }
    async open3(template: TemplateRef<any>) {
        const pwd = this.password;
        this.password = '';
        const keys = this.walletService.getKeys(pwd, this.activeAccount.pkh);
        if (this.walletService.isLedgerWallet()) {
            this.broadCastLedgerTransaction();
            this.sendResponse = null;
            this.close2();
            this.modalRef3 = this.modalService.show(template, { class: 'third' });
          } else {
            if (keys) {
                this.pwdValid = '';
                this.close2();
                this.modalRef3 = this.modalService.show(template, { class: 'third' });
                this.sendDelegation(keys);
            } else {
                this.pwdValid = 'Wrong password!';
            }
        }
    }

    close1() {
        this.modalRef1.hide();
        this.modalRef1 = null;
    }

    close2() {
        this.modalRef2.hide();
        this.modalRef2 = null;
    }

    close3() {
        this.modalRef3.hide();
        this.modalRef3 = null;
    }

    async sendDelegation(keys: KeyPair) {
        const toPkh = this.toPkh;
        let fee = this.fee;
        this.toPkh = '';
        this.fee = '';
        if (!fee) {
            fee = '0';
        }

        setTimeout(async () => {
            this.operationService.delegate(this.activeAccount.address, toPkh, Number(fee), keys).subscribe(
                (ans: any) => {
                    this.sendResponse = ans;
                    console.log(JSON.stringify(ans));
                    if (ans.success === true) {
                        if (ans.payload.opHash) {
                            this.coordinatorService.boost(this.activeAccount.address);
                        } else if (this.walletService.isLedgerWallet()) {
                            this.ledgerInstruction = 'Please sign the delegation with your Ledger to proceed!';
                            this.requestLedgerSignature();
                          }
                    } else {
                        console.log('Delegation error id ', ans.payload.msg);
                        if (this.walletService.isLedgerWallet()) {
                            this.ledgerInstruction = 'Failed with: ' + ans.payload.msg;
                          }
                    }
                },
                err => {
                    console.log('Error Message ', JSON.stringify(err));
                    this.ledgerInstruction = 'Failed to create transaction';
                }
            );
        }, 100);
    }
    async requestLedgerSignature() {
        if (this.walletService.wallet instanceof LedgerWallet) {
            const op = this.sendResponse.payload.unsignedOperation;
            const signature = await this.ledgerService.signOperation(op, this.walletService.wallet.implicitAccounts[0].derivationPath);
            if (signature) {
                const signedOp = op + signature;
                this.sendResponse.payload.signedOperation = signedOp;
                this.ledgerInstruction = 'Your transaction have been signed! Press confirm to broadcast it to the network.';
            }
        }
      }
      async broadCastLedgerTransaction() {
        this.operationService.broadcast(this.sendResponse.payload.signedOperation).subscribe(
          ((ans: any) => {
            this.sendResponse = ans;
            if (ans.success && this.activeAccount.address) {
                this.coordinatorService.boost(this.activeAccount.address);
            }
            console.log('ans: ' + JSON.stringify(ans));
          })
        );
      }
    checkReveal() {
        console.log('check reveal ' + this.activeAccount.pkh);
        this.operationService.isRevealed(this.activeAccount.pkh)
                .subscribe((revealed: boolean) => {
                    if (!revealed) {
                        this.revealFee = 0.0013;
                    } else {
                        this.revealFee = 0;
                    }
                    this.checkSource();
                });
    }
    checkSource() {
        if (this.activeAccount instanceof ImplicitAccount) {
            this.recommendedFee = this.revealFee + this.pkhFee;
        } else if (this.activeAccount instanceof OriginatedAccount) {
            this.recommendedFee = this.revealFee + this.ktFee;
        }
    }
    getFee() {
        if (this.fee) {
          return this.fee;
        }
        return this.storedFee;
      }
      getDelegate() {
        if (this.toPkh) {
          return this.toPkh;
        }
        return this.storedDelegate;
      }
    clearForm() {
        this.toPkh = '';
        this.fee = '';
        this.password = '';
        this.pwdValid = '';
        this.formInvalid = '';
        this.sendResponse = '';
        this.ledgerInstruction = '';
    }
    invalidInput(): string {
        if ((!this.inputValidationService.address(this.toPkh) &&
                this.toPkh !== '') || (
                this.activeAccount.address.slice(0, 2) !== 'tz' && this.toPkh === '') || (
                this.toPkh.length > 1 && this.toPkh.slice(0, 2) !== 'tz') || (
                this.walletService.wallet.getImplicitAccount(this.toPkh))) {
            return 'invalid delegate address';
        } else if (!this.inputValidationService.fee(this.fee)) {
            return 'invalid fee';
        } else {
            return '';
        }
    }
    download() {
        this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
      }
}
