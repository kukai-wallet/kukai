import { Component, TemplateRef, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { KeyPair } from '../../interfaces';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { OperationService } from '../../services/operation.service';
import { ExportService } from '../../services/export.service';

interface SendData {
    address: string;
    amount: string;
}

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

    isMultipleDestinations = false;

    toMultipleDestinationsString = '';
    toMultipleDestinations: SendData[] = [];

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
    transactions = [];
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
        this.formInvalid = this.checkInput();
        if (!this.formInvalid) {
            if (!this.amount) { this.amount = '0'; }
            if (!this.fee) { this.fee = '0'; }
            if (!this.toMultipleDestinationsString) { this.toMultipleDestinationsString = ''; }
            if (this.isMultipleDestinations) {
                this.transactions = this.parseMultipleTransactions(this.toMultipleDestinationsString);
            } else {
                this.transactions = [{to: this.toPkh, amount: Number(this.amount)}];
            }
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
        // let toMultipleDestinationsString = this.toMultipleDestinationsString;
        this.toPkh = '';
        this.amount = '';
        this.fee = '';
        const toMultipleDestinationsString = this.toMultipleDestinationsString;
        this.toMultipleDestinationsString = '';

        if (!amount) { amount = '0'; }
        if (!fee) { fee = '0'; }
        // if (!toMultipleDestinationsString) { toMultipleDestinationsString = '0'; }

        setTimeout(async () => {
            this.operationService.transfer(this.activePkh, this.transactions, Number(fee), keys).subscribe(
                (ans: any) => {
                    this.sendResponse = ans;
                    if (ans.success === true) {
                        console.log('Transaction successful ', ans);
                        if (ans.payload.opHash) {
                            this.coordinatorService.boost(this.activePkh);
                            for (let i = 0; i < this.transactions.length; i++) {
                                this.coordinatorService.boost(this.transactions[i].to);
                            }
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
    parseMultipleTransactions(multipleTransactionsString: string): any {
        const multipleTransactionsObject: any = [];
        const splitted = multipleTransactionsString.split(';');
        for (let i = 0; i < splitted.length; i++) {
            if (splitted[i]) {
                const splitted2 = splitted[i].trim().split(' ');
                multipleTransactionsObject.push({to: splitted2[0], amount: Number(splitted2[1])});
            }
        }
        console.log(JSON.stringify(multipleTransactionsObject));
        return multipleTransactionsObject;
    }
    toggleDestination() {
        this.isMultipleDestinations = !this.isMultipleDestinations;
    }

    clearForm() {
        this.toPkh = '';
        this.amount = '';
        this.fee = '';
        this.toMultipleDestinationsString = '';
        this.toMultipleDestinations = [];
        this.password = '';
        this.pwdValid = '';
        this.formInvalid = '';
        this.sendResponse = null;
    }

    checkInput(): string {
        let result;

        if (this.isMultipleDestinations) {
            result = this.invalidInputMultiple();
            console.log('result in checkInput()', result);
        } else {
            result = this.invalidInputSingle();
        }

        return result;
    }

    invalidInputSingle(): string {
        if (!this.activePkh || this.activePkh.length !== 36) {

            let invalidSender = '';
            this.translate.get('SENDCOMPONENT.INVALIDSENDERADDRESS').subscribe(
                (res: string) => invalidSender = res
            );
            return invalidSender;  // 'Invalid sender address';

        } else if (!Number(this.fee) && this.fee && this.fee !== '0') {
            let invalidFee = '';
            this.translate.get('SENDCOMPONENT.INVALIDFEE').subscribe(
                (res: string) => invalidFee = res
            );
            return invalidFee;  // 'Invalid fee';

        } else {
            const result = this.checkReceiverAndAmmout(this.toPkh, this.amount);
            return result;
        }
    }

    checkReceiverAndAmmout(toPkh: string, amount: string): string {
        let result = '';
        console.log('In checkReceiverAndAmmout toPkh: ', toPkh);
        if (!toPkh || toPkh.length !== 36) {
            let invalidReceiver = '';
            this.translate.get('SENDCOMPONENT.INVALIDRECEIVERADDRESS').subscribe(
                (res: string) => invalidReceiver = res
            );
            result = invalidReceiver;  // 'Invalid receiver address';

        } else if (!Number(amount) && amount && amount !== '0') {
            let invalidAmount = '';
            this.translate.get('SENDCOMPONENT.INVALIDAMOUNT').subscribe(
                (res: string) => invalidAmount = res
            );
            result = invalidAmount;  // 'Invalid amount';
        }

        return result;
    }

    invalidInputMultiple(): string {
        let result = '';
        let toMultipleDestinationsArray;
        let singleSendDataArray;

        toMultipleDestinationsArray = this.toMultipleDestinationsString.split(';');

        toMultipleDestinationsArray.forEach((item, index) => {
            // Eliminate white spaces from both sides of a string
            toMultipleDestinationsArray[index] = item.trim();

            if (toMultipleDestinationsArray[index] !== '') {
                singleSendDataArray = toMultipleDestinationsArray[index].split(' ');
                console.log('singleSendDataArray: ', singleSendDataArray );
                if (singleSendDataArray.length === 2) {
                    const singleSendDataCheckresult = this.checkReceiverAndAmmout(singleSendDataArray[0], singleSendDataArray[1]);
                    console.log('singleSendDataArray.length: ', singleSendDataArray.length );
                    console.log('singleSendDataCheckresult', singleSendDataCheckresult);
                    if (singleSendDataCheckresult === '') {
                        this.toMultipleDestinations.push({address: singleSendDataArray[0], amount: singleSendDataArray[1]});

                    } else {
                        this.toMultipleDestinations = [];
                        const itemIndex =  index + 1;
                        result = singleSendDataCheckresult + '. ' + 'Error in item ' + itemIndex;
                        return result;
                    }
                }
            }
        });

        console.log('toMultipleDestinations: ', JSON.stringify(this.toMultipleDestinations));

        // If this loops ends then everything has been veified
        return result;
        /*
        for (const sendInfo of this.toMultipleDestinations) {
            result = this.checkReceiverAndAmmout(sendInfo.address, sendInfo.amount);
            if (result !== '') {
                // address or amount in sendInfo is invalid
                // reinitialise variables
                this.toMultipleDestinations = [];

                return result;
            }
        }

        console.log('toMultipleDestinationsArray: ', toMultipleDestinationsArray);
        console.log('toMultipleDestinations: ', JSON.stringify(this.toMultipleDestinations));
        */
        // return 'All Good';  // result;
    }

    download() {
        this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
    }
}
