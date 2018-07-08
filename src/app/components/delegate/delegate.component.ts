import { Component, TemplateRef, OnInit, ViewEncapsulation, Input, ViewChild, ElementRef } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { OperationService } from '../../services/operation.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { KeyPair } from '../../interfaces';
import { ExportService } from '../../services/export.service';

@Component({
    selector: 'app-delegate',
    templateUrl: './delegate.component.html',
    styleUrls: ['./delegate.component.scss']
})
export class DelegateComponent implements OnInit {
    @ViewChild('modal1') modal1: TemplateRef<any>;

    @Input() activePkh: string;

    accounts = null;
    activeAccount = null;
    toPkh: string;
    fee: string;
    password: string;
    pwdValid: string;
    formInvalid = '';
    sendResponse: any;

    modalRef1: BsModalRef;
    modalRef2: BsModalRef;
    modalRef3: BsModalRef;

    constructor(
        private modalService: BsModalService,
        private walletService: WalletService,
        private messageService: MessageService,
        private operationService: OperationService,
        private coordinatorService: CoordinatorService,
        private exportService: ExportService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.init();
        }
    }

    init() {
        this.accounts = this.walletService.wallet.accounts;
    }

    open1(template1: TemplateRef<any>) {
        if (this.walletService.wallet) {
            this.clearForm();
            this.modalRef1 = this.modalService.show(template1, { class: 'first' });
        }
    }
    open2(template: TemplateRef<any>) {
        this.formInvalid = this.invalidInput();
        if (!this.formInvalid) {
            if (!this.fee) { this.fee = '0'; }
            this.close1();
            this.modalRef2 = this.modalService.show(template, { class: 'second' });
        }
    }
    async open3(template: TemplateRef<any>) {
        const pwd = this.password;
        this.password = '';
        const keys = this.walletService.getKeys(pwd);
        if (keys) {
            this.pwdValid = '';
            this.close2();
            this.modalRef3 = this.modalService.show(template, { class: 'third' });
            this.sendDelegation(keys);
        } else {
            this.pwdValid = 'Wrong password!';
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
            this.operationService.delegate(this.activePkh, toPkh, Number(fee), keys).subscribe(
                (ans: any) => {
                    this.sendResponse = ans;
                    console.log(JSON.stringify(ans));
                    if (ans.success === true) {
                        if (ans.payload.opHash) {
                            this.coordinatorService.boost(this.activePkh);
                        }
                    } else {
                        console.log('Delegation error id ', ans.payload.msg);
                    }
                },
                err => {
                    console.log('Error Message ', JSON.stringify(err));
                }
            );
        }, 100);
    }
    clearForm() {
        this.toPkh = '';
        this.fee = '';
        this.password = '';
        this.pwdValid = '';
        this.formInvalid = '';
        this.sendResponse = '';
    }
    invalidInput(): string {
        if ((this.toPkh.length !== 0) && (this.toPkh.length !== 36)) {
            return 'invalid receiver address';
        } else if (!Number(this.fee) && this.fee && this.fee !== '0') {
            return 'invalid fee';
        } else {
            return '';
        }
    }
    download() {
        this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
      }
}
