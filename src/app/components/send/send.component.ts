import { Component, TemplateRef, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { KeyPair } from '../../interfaces';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { OperationService } from '../../services/operation.service';
import { ExportService } from '../../services/export.service';
import { InputValidationService } from '../../services/input-validation.service';
import { LedgerService } from '../../services/ledger.service';
import Big from 'big.js';

interface SendData {
    to: string;
    amount: number;
    burn: boolean;
}
const pkh2pkh = {
    gas: 10600,
    storage: 277,
    fee: 0.00135
};
const pkh2kt = {
    gas: 15400,
    storage: 0,
    fee: 0.0016
};
const kt2pkh = {
    gas: 26300,
    storage: 0,
    fee: 0.003
};
const kt2kt = {
    gas: 44800,
    storage: 0,
    fee: 0.0052
};

const revealFee = 0.0013;

@Component({
    selector: 'app-send',
    templateUrl: './send.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {
    @ViewChild('modal1', {static: false}) modal1: TemplateRef<any>;
    @Input() activePkh: string;
    @Input() actionButtonString: string;  // Possible values: btnOutline / dropdownItem / btnSidebar

    extraFee = 0;
    defaultFee = pkh2pkh.fee;
    recommendedFee = this.defaultFee + this.extraFee;
    defaultGasLimit = pkh2pkh.gas;
    defaultStorageLimit = pkh2pkh.storage;

    showSendFormat = {
        btnOutline: false,
        dropdownItem: false,
        btnSidebar: false
    };

    // Transaction variables
    toPkh: string;
    amount: string;
    fee: string;
    storedFee: string;
    gas = '';
    storage = '';

    isMultipleDestinations = false;
    toMultipleDestinationsString = '';
    toMultipleDestinations: SendData[] = [];

    showTransactions: SendData[] = [];

    dom: Document;
    accounts = null;
    activeAccount = null;
    password: string;
    pwdValid: string;
    formInvalid = '';
    sendResponse: any;
    errorMessage = '';
    transactions: SendData[] = [];
    XTZrate = 0;
    ledgerInstruction = '';

    showBtn = 'Show More';

    modalRef1: BsModalRef;
    modalRef2: BsModalRef;
    modalRef3: BsModalRef;

    constructor(
        private translate: TranslateService,
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
        const index = this.accounts.findIndex(account => account.pkh === accountPkh);
        let accountBalance = Big(this.accounts[index].balance.balanceXTZ).div(1000000);
        if (!this.fee) {
            accountBalance = accountBalance.minus(this.recommendedFee);
        } else {
            accountBalance = accountBalance.minus(Number(this.fee));
        }
        this.amount = accountBalance.toString();
    }

    open1(template1: TemplateRef<any>) {
        if (this.walletService.wallet) {
            this.clearForm();
            this.checkReveal();
            this.modalRef1 = this.modalService.show(template1, { class: 'first' });  // modal-sm / modal-lg
        }
    }

    open2(template: TemplateRef<any>) {
        this.formInvalid = this.checkInput();
        if (!this.formInvalid) {
            if (!this.amount) { this.amount = '0'; }
            if (!this.fee) { this.fee = this.recommendedFee.toString(); }
            this.storedFee = this.fee;
            if (!this.gas) { this.gas = this.defaultGasLimit.toString(); }
            if (!this.storage) { this.storage = this.defaultStorageLimit.toString(); }
            if (!this.toMultipleDestinationsString) { this.toMultipleDestinationsString = ''; }
            if (this.isMultipleDestinations) {
                // this.transactions = this.parseMultipleTransactions(this.toMultipleDestinationsString);
                this.transactions = this.toMultipleDestinations;
                if (this.transactions.length > 1) {
                    this.showTransactions.push(this.transactions[0], this.transactions[1]);
                } else {
                    // In case user picks isMultipleDestinations but inserts only one transaction
                    this.showTransactions.push(this.transactions[0]);
                }
                console.log('this.showTransactions, open second modal ', this.showTransactions);
            } else {
                this.transactions = [{ to: this.toPkh, amount: Number(this.amount), burn: false }];
            }
            this.detectBurns();
            this.close1();
            if (this.walletService.isLedgerWallet()) {
                this.ledgerInstruction = 'Preparing transaction data. Please wait...';
                const keys = this.walletService.getKeys('');
                this.sendTransaction(keys);
            }
            this.modalRef2 = this.modalService.show(template, { class: 'second' });
        }
    }
    detectBurns() {
        for (let i = 0; i < this.transactions.length; i++) {
            if (this.transactions[i].to.slice(0, 2) === 'tz') {
                this.operationService.getBalance(this.transactions[i].to).subscribe(
                    (ans: any) => {
                        if (ans.success && ans.payload.balance === '0') {
                            console.log('Burn!');
                            this.transactions[i].burn = true;
                        } else {
                            this.transactions[i].burn = false;
                            console.log('No burn!');
                        }
                    }
                );
            } else {
                console.log('Not tz...');
                this.transactions[i].burn = false;
            }
        }
    }
    async open3(template: TemplateRef<any>) {
        if (this.walletService.isLedgerWallet()) {
            this.broadCastLedgerTransaction();
            this.sendResponse = null;
            this.close2();
            this.modalRef3 = this.modalService.show(template, { class: 'third' });
        } else {
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
        let amount = this.amount;
        let fee = this.fee;
        let gas = this.gas;
        let storage = this.storage;

        if (!this.walletService.isLedgerWallet()) {
            this.toPkh = '';
            this.amount = '';
            this.fee = '';
            this.storedFee = '';
            this.gas = '';
            this.storage = '';
            this.toMultipleDestinationsString = '';
            this.toMultipleDestinations = [];
            this.showTransactions = [];
        }

        if (!amount) { amount = '0'; }
        if (!fee) { fee = '0'; }
        if (!gas) { gas = '0'; }
        if (!storage) { storage = '0'; }
        // if (!toMultipleDestinationsString) { toMultipleDestinationsString = '0'; }

        setTimeout(async () => {
            this.operationService.transfer(this.activePkh, this.transactions, Number(fee), keys, Number(gas), Number(storage)).subscribe(
                (ans: any) => {
                    this.sendResponse = ans;
                    if (ans.success === true) {
                        console.log('Transaction successful ', ans);
                        if (ans.payload.opHash) {
                            this.coordinatorService.boost(this.activePkh);
                            for (let i = 0; i < this.transactions.length; i++) {
                                this.coordinatorService.boost(this.transactions[i].to);
                            }
                        } else if (this.walletService.isLedgerWallet()) {
                            this.ledgerInstruction = 'Please sign the transaction with your Ledger to proceed!';
                            this.requestLedgerSignature();
                        }
                    } else {
                        console.log('Transaction error id ', ans.payload.msg);
                        if (this.walletService.isLedgerWallet()) {
                            this.ledgerInstruction = 'Failed with: ' + ans.payload.msg;
                        }
                    }
                },
                err => {
                    console.log('Error Message ', JSON.stringify(err));
                    if (this.walletService.isLedgerWallet()) {
                        this.ledgerInstruction = 'Failed to create transaction';
                    }
                },
            );
        }, 100);
    }

    async requestLedgerSignature() {
        const op = this.sendResponse.payload.unsignedOperation;
        const signature = await this.ledgerService.signOperation(op, this.walletService.wallet.derivationPath);
        const signedOp = op + signature;
        this.sendResponse.payload.signedOperation = signedOp;
        this.ledgerInstruction = 'Your transaction have been signed! Press confirm to broadcast it to the network.';
    }

    async broadCastLedgerTransaction() {
        this.operationService.broadcast(this.sendResponse.payload.signedOperation).subscribe(
            ((ans: any) => {
                this.sendResponse = ans;
                if (ans.success && this.activePkh) {
                    this.coordinatorService.boost(this.activePkh);
                }
                console.log('ans: ' + JSON.stringify(ans));
            })
        );
    }

    // Function not used - transaction array is built in invalidInputMultiple()
    parseMultipleTransactions(multipleTransactionsString: string): any {
        const multipleTransactionsObject: any = [];
        const splitted = multipleTransactionsString.split(';');
        for (let i = 0; i < splitted.length; i++) {
            if (splitted[i]) {
                const splitted2 = splitted[i].trim().split(' ');
                multipleTransactionsObject.push({ to: splitted2[0], amount: Number(splitted2[1]) });
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
        this.storedFee = '';
        this.gas = '';
        this.storage = '';
        this.toMultipleDestinationsString = '';
        this.toMultipleDestinations = [];
        this.showTransactions = [];
        this.password = '';
        this.pwdValid = '';
        this.formInvalid = '';
        this.sendResponse = null;
        this.ledgerInstruction = '';

        this.showBtn = 'Show More';
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

    checkReveal() {
        console.log('check reveal');
        this.operationService.isRevealed(this.walletService.wallet.accounts[0].pkh)
            .subscribe((revealed: boolean) => {
                if (!revealed) {
                    this.extraFee = revealFee;
                } else {
                    this.extraFee = 0;
                }
                this.recommendedFee = this.defaultFee + this.extraFee;
            });
    }

    updateDefaultValues() {
        if (this.activePkh.slice(0, 2) === 'tz') {
            if (this.toPkh.length < 2 || this.toPkh.slice(0, 2) !== 'KT') {
                this.setDefaultValues(pkh2pkh);
            } else {
                this.setDefaultValues(pkh2kt);
            }
        } else {
            if (this.toPkh.length < 2 || this.toPkh.slice(0, 2) !== 'KT') {
                this.setDefaultValues(kt2pkh);
            } else {
                this.setDefaultValues(kt2kt);
            }
        }
    }
    setDefaultValues(values: any) {
        this.defaultGasLimit = values.gas;
        this.defaultStorageLimit = values.storage;
        this.defaultFee = values.fee;
        this.recommendedFee = this.defaultFee + this.extraFee;
    }
    invalidInputSingle(): string {
        if (!this.inputValidationService.address(this.activePkh)) {
            let invalidSender = '';
            this.translate.get('SENDCOMPONENT.INVALIDSENDERADDRESS').subscribe(
                (res: string) => invalidSender = res
            );
            return invalidSender;  // 'Invalid sender address';

        } else if (!this.inputValidationService.fee(this.fee)) {
            let invalidFee = '';
            this.translate.get('SENDCOMPONENT.INVALIDFEE').subscribe(
                (res: string) => invalidFee = res
            );
            return invalidFee;  // 'Invalid fee';
        } else {
            return this.checkReceiverAndAmount(this.toPkh, this.amount);
        }
    }
    checkReceiverAndAmount(toPkh: string, amount: string): string {
        let result = '';
        console.log('In checkReceiverAndAmount toPkh: ', toPkh);
        if (!this.inputValidationService.address(toPkh)) {
            let invalidReceiver = '';
            this.translate.get('SENDCOMPONENT.INVALIDRECEIVERADDRESS').subscribe(
                (res: string) => invalidReceiver = res
            );
            result = invalidReceiver;  // 'Invalid receiver address';
        } else if (!this.inputValidationService.amount(amount)) {
            let invalidAmount = '';
            this.translate.get('SENDCOMPONENT.INVALIDAMOUNT').subscribe(
                (res: string) => invalidAmount = res
            );
            result = invalidAmount;  // 'Invalid amount';
        } else if (!this.inputValidationService.gas(this.gas)) {
            result = this.translate.instant('SENDCOMPONENT.INVALIDGASLIMIT');
        } else if (!this.inputValidationService.gas(this.storage)) {
            result = this.translate.instant('SENDCOMPONENT.INVALIDSTORAGELIMIT');
        }
        return result;
    }

    // Checking toMultipleDestinationsString and building up toMultipleDestinations[to: string, amount: number]
    invalidInputMultiple(): string {
        if (!this.inputValidationService.address(this.activePkh)) {
            let invalidSender = '';
            this.translate.get('SENDCOMPONENT.INVALIDSENDERADDRESS').subscribe(
                (res: string) => invalidSender = res
            );
            return invalidSender;  // 'Invalid sender address';

        } else if (!this.inputValidationService.fee(this.fee)) {
            let invalidFee = '';
            this.translate.get('SENDCOMPONENT.INVALIDFEE').subscribe(
                (res: string) => invalidFee = res
            );
            return invalidFee;  // 'Invalid fee';
        }
        let result = '';
        let toMultipleDestinationsArray;
        let singleSendDataArray;

        toMultipleDestinationsArray = this.toMultipleDestinationsString.split(';');
        toMultipleDestinationsArray.forEach((item, index) => {
            // Eliminate white spaces from both sides of a string
            toMultipleDestinationsArray[index] = item.trim();

            if (toMultipleDestinationsArray[index] !== '') {
                singleSendDataArray = toMultipleDestinationsArray[index].split(' ');
                console.log('singleSendDataArray: ', singleSendDataArray);
                if (singleSendDataArray.length === 2) {
                    const singleSendDataCheckresult = this.checkReceiverAndAmount(singleSendDataArray[0], singleSendDataArray[1]);
                    console.log('singleSendDataArray.length: ', singleSendDataArray.length);
                    console.log('singleSendDataCheckresult', singleSendDataCheckresult);
                    if (singleSendDataCheckresult === '') {
                        this.toMultipleDestinations.push({ to: singleSendDataArray[0], amount: Number(singleSendDataArray[1]), burn: false });
                    } else {
                        this.toMultipleDestinations = [];
                        const itemIndex = index + 1;
                        result = singleSendDataCheckresult + '. ' + 'Error in item ' + itemIndex;
                        return result;
                    }
                }
            } else if (toMultipleDestinationsArray.length === 1) {
                result = this.translate.instant('SENDCOMPONENT.NOADDRESSORAMOUNT'); // 'No address or amount provided!'
            }
        });
        console.log('toMultipleDestinations: ', JSON.stringify(this.toMultipleDestinations));
        return result;  // If this loops ends then everything has been verified and result will remain ''
    }

    totalAmount(): number {
        let totalSent = 0;
        console.log('toMultipleDestinations ', this.toMultipleDestinations);
        for (const item of this.toMultipleDestinations) {
            totalSent = totalSent + item.amount;
        }
        return totalSent;
    }
    getFee() {
        if (this.fee) {
            return this.fee;
        }
        return this.storedFee;
    }
    totalFee(): number {
        let fee = 0;
        if (this.fee) {
            fee = Number(this.fee);
        }
        const totalFee = fee * this.toMultipleDestinations.length;
        return totalFee;
    }

    toggleTransactions() {
        if (this.showTransactions.length === 2) {
            this.showTransactions = this.transactions;
            this.showBtn = 'Show Less';
        } else {
            this.showTransactions = [];
            this.showTransactions.push(this.transactions[0], this.transactions[1]);
            this.showBtn = 'Show More';
        }
    }

    download() {
        this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
    }
}
