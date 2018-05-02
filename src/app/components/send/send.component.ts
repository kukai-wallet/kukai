import { Component, TemplateRef, OnInit, ViewEncapsulation, Input, ViewChild, ElementRef } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { UpdateCoordinatorService } from '../../services/update-coordinator.service';
import { OperationService } from '../../services/operation.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { KeyPair } from '../../interfaces';

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

    accounts = null;
    activeAccount = null;
    toPkh: string;
    amount: string;
    fee: string;
    password: string;
    pwdValid: string;
    formInvalid = '';
    sendResponse: string;

    XTZrate = 0;

    modalRef1: BsModalRef;
    modalRef2: BsModalRef;
    modalRef3: BsModalRef;

    constructor(
        private modalService: BsModalService,
        private walletService: WalletService,
        private messageService: MessageService,
        private operationService: OperationService,
        private updateCoordinatorService: UpdateCoordinatorService
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

    showAccountBalance(accountPkh: string) {
        let accountBalance: number;
        let accountBalanceString: string;
        let index;
        // finding the index
        index = this.accounts.findIndex(account => account.pkh === accountPkh);

        accountBalance = this.accounts[index].balance.balanceXTZ / 1000000;
        accountBalanceString = this.numberWithCommas(accountBalance) + ' ꜩ';

        return accountBalanceString;
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
            this.modalRef1 = this.modalService.show(template1, { class: 'first' });
        }
        /*
        this.modalRef1 = this.modalService.show(
        template1,
        Object.assign({}, { class: 'gray modal-lg' })
        );
        */
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
        let keys;
        if (this.walletService.wallet.salt) {
          keys = this.walletService.getKeys(pwd, null);
        } else {
          keys = this.walletService.getKeys(null, pwd);
        }
        if (keys) {
            this.pwdValid = '';
            this.close2();
            this.modalRef3 = this.modalService.show(template, { class: 'third' });
            this.sendTransaction(keys);
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

    async sendTransaction(keys: KeyPair) {

        const toPkh = this.toPkh;
        let amount = this.amount;
        let fee = this.fee;
        this.toPkh = '';
        this.amount = '';
        this.fee = '';

        if (!amount) {
            amount = '0';
        }

        if (!fee) {
            fee = '0';
        }

        setTimeout(async () => {
            this.operationService.transfer(keys, this.activePkh, toPkh, Number(amount), Number(fee), 0).subscribe(
                (ans: any) => {
                  console.log(JSON.stringify(ans));
                  if (ans.opHash) {
                    this.sendResponse = 'success';
                    this.updateCoordinatorService.boost(this.activePkh);
                  } else {
                    this.sendResponse = 'failure';
                  }
                },
                err => {console.log(JSON.stringify(err));
                  this.sendResponse = 'failure';
                }
              );
        }, 100);
        /*setTimeout(async () => {
            this.operationService.transfer(keys, this.activePkh, toPkh, Number(amount), Number(fee), 2).subscribe(
                (ans: any) => {
                  console.log(JSON.stringify(ans));
                  if (ans.opHash) {
                    this.sendResponse = 'success';
                    this.updateCoordinatorService.boost();
                  } else {
                    this.sendResponse = 'failure';
                  }
                },
                err => {console.log(JSON.stringify(err));
                  this.sendResponse = 'failure';
                }
              );
        }, 3100);*/
    }
    clearForm() {
        this.toPkh = '';
        this.amount = '';
        this.fee = '';
        this.password = '';
        this.pwdValid = '';
        this.formInvalid = '';
        this.sendResponse = '';
    }
    invalidInput(): string {

        if (!this.toPkh || this.toPkh.length !== 36) {
            return 'invalid receiver address';
        } else if (!Number(this.amount) && this.amount && this.amount !== '0') {
            return 'invalid amount';
        } else if (!Number(this.fee) && this.fee && this.fee !== '0') {
            return 'invalid fee';
        } else {
            return '';
        }
    }
}
