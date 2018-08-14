import { Component, TemplateRef, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { KeyPair } from '../../interfaces';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { OperationService } from '../../services/operation.service';
import { ExportService } from '../../services/export.service';

@Component({
    selector: 'app-send',
    templateUrl: './send.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {
    @ViewChild('modal1') modal1: TemplateRef<any>;
    @Input() activePkh: string;
    @Input() actionButtonString: string;  // Possible values: btnOutline / dropdownItem / btnSidebar

    showSendFormat = {
        btnOutline: false,
        dropdownItem: false,
        btnSidebar: false
    };

    dom: Document;
    accounts = null;
    activeAccount = null;
    toPkh: string;
    amount: string;
    fee: string;
    password: string;
    pwdValid: string;
    formInvalid = '';
    sendResponse: any;
    errorMessage = '';

    XTZrate = 0;

    modalRef1: BsModalRef;
    modalRef2: BsModalRef;
    modalRef3: BsModalRef;

    constructor(
        private translate: TranslateService,
        private modalService: BsModalService,
        private walletService: WalletService,
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
        if (this.actionButtonString) {
            this.setSendFormat();
        }
        this.accounts = this.walletService.wallet.accounts;
        this.XTZrate = this.walletService.wallet.XTZrate;
    }

    setSendFormat() {
        switch (this.actionButtonString) {
            case 'btnOutline': {
                this.showSendFormat.btnOutline = true;
                this.showSendFormat.dropdownItem = false;
                this.showSendFormat.btnSidebar = false;
                break;
            }
            case 'dropdownItem': {
                this.showSendFormat.btnOutline = false;
                this.showSendFormat.dropdownItem = true;
                this.showSendFormat.btnSidebar = false;
                break;
            }
            case 'btnSidebar': {
                this.showSendFormat.btnOutline = false;
                this.showSendFormat.dropdownItem = false;
                this.showSendFormat.btnSidebar = true;

                this.activePkh = this.walletService.wallet.accounts[0].pkh;
                break;
            }
            default: {
                console.log('actionButtonString wrongly set ', this.actionButtonString);
                break;
            }
        }
    }

    showAccountBalance(accountPkh: string = this.activePkh) {
        let accountBalance: number;
        let accountBalanceString: string;
        let index;
        // finding the index
        index = this.accounts.findIndex(account => account.pkh === accountPkh);
        if (index !== -1) {
            accountBalance = this.accounts[index].balance.balanceXTZ / 1000000;
            accountBalanceString = this.numberWithCommas(accountBalance) + ' XTZ';
            return accountBalanceString;
        } else {
            return null;
        }
    }

    numberWithCommas(x: number) {
        let parts: Array<string> = [];
        parts = x.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    sendEntireBalance(accountPkh: string, event: Event) {
        event.stopPropagation();

        let accountBalance: number;
        let index;

        // finding the index
        index = this.accounts.findIndex(account => account.pkh === accountPkh);

        accountBalance = this.accounts[index].balance.balanceXTZ / 1000000;

        this.amount = accountBalance.toString();
    }

    open1(template1: TemplateRef<any>) {
        if (this.walletService.wallet) {
            this.clearForm();
            this.modalRef1 = this.modalService.show(template1, { class: 'first' });  // modal-sm / modal-lg
        }
    }

    open2(template: TemplateRef<any>) {
        this.formInvalid = this.invalidInput();
        if (!this.formInvalid) {
            if (!this.amount) { this.amount = '0'; }
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
            this.sendTransaction(keys);
        } else {
            let wrongPassword = '';
            this.translate.get('SENDCOMPONENT.WRONGPASSWORD').subscribe(
                (res: string) => wrongPassword = res
            );

            this.pwdValid = wrongPassword;  // 'Wrong password!';
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

    async sendTransaction(keys: KeyPair) {
        const toPkh = this.toPkh;
        let amount = this.amount;
        let fee = this.fee;
        this.toPkh = '';
        this.amount = '';
        this.fee = '';

        if (!amount) { amount = '0'; }
        if (!fee) { fee = '0'; }

        setTimeout(async () => {
            this.operationService.transfer(this.activePkh, toPkh, Number(amount), Number(fee), keys).subscribe(
                (ans: any) => {
                    this.sendResponse = ans;
                    if (ans.success === true) {
                        console.log('Transaction successful ', ans);
                        if (ans.payload.opHash) {
                            this.coordinatorService.boost(this.activePkh);
                            this.coordinatorService.boost(toPkh);
                        }
                    } else {
                        console.log('Transaction error id ', ans.payload.msg);
                    }
                },
                err => {
                    console.log('Error Message ', JSON.stringify(err));
                },
            );
        }, 100);
    }

    clearForm() {
        this.toPkh = '';
        this.amount = '';
        this.fee = '';
        this.password = '';
        this.pwdValid = '';
        this.formInvalid = '';
        this.sendResponse = null;
    }

    invalidInput(): string {
        if (!this.activePkh || this.activePkh.length !== 36) {

            let invalidSender = '';
            this.translate.get('SENDCOMPONENT.INVALIDSENDERADDRESS').subscribe(
                (res: string) => invalidSender = res
            );
            return invalidSender;  // 'Invalid sender address';

        } else if (!this.toPkh || this.toPkh.length !== 36) {
            let invalidReceiver = '';
            this.translate.get('SENDCOMPONENT.INVALIDRECEIVERADDRESS').subscribe(
                (res: string) => invalidReceiver = res
            );
            return invalidReceiver;  // 'Invalid receiver address';

        } else if (!Number(this.amount) && this.amount && this.amount !== '0') {
            let invalidAmount = '';
            this.translate.get('SENDCOMPONENT.INVALIDAMOUNT').subscribe(
                (res: string) => invalidAmount = res
            );
            return invalidAmount;  // 'Invalid amount';

        } else if (!Number(this.fee) && this.fee && this.fee !== '0') {
            let invalidFee = '';
            this.translate.get('SENDCOMPONENT.INVALIDFEE').subscribe(
                (res: string) => invalidFee = res
            );
            return invalidFee;  // 'Invalid fee';

        } else {
            return '';
        }
    }

    download() {
        this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
    }
}
