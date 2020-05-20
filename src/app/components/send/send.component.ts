import { Component, TemplateRef, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { KeyPair, DefaultTransactionParams } from '../../interfaces';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { OperationService } from '../../services/operation/operation.service';
import { ExportService } from '../../services/export/export.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { LedgerService } from '../../services/ledger/ledger.service';
import { EstimateService } from '../../services/estimate/estimate.service';
import Big from 'big.js';
import { Constants } from '../../constants';
import { LedgerWallet } from '../../services/wallet/wallet';
import { Account, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';

interface SendData {
    to: string;
    amount: number;
    gasLimit: number;
    storageLimit: number;
}
const zeroTxParams: DefaultTransactionParams = {
    gas: 0,
    storage: 0,
    fee: 0,
    burn: 0
};
@Component({
    selector: 'app-send',
    templateUrl: './send.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {
    @ViewChild('modal1') modal1: TemplateRef<any>;
    @Input() activeAccount: Account;
    CONSTANTS = new Constants();
    defaultTransactionParams: DefaultTransactionParams = zeroTxParams;

    // Transaction variables
    toPkh: string;
    amount: string;
    fee: string;
    sendFee: string;
    burnFee = 0;
    gas = '';
    storage = '';
    isMultipleDestinations = false;
    toMultipleDestinationsString = '';
    toMultipleDestinations: SendData[] = [];

    showTransactions: SendData[] = [];
    showLimits = false;
    simSemaphore = 0;
    dom: Document;
    implicitAccounts = null;
    password: string;
    pwdValid: string;
    formInvalid = '';
    sendResponse: any;
    errorMessage = '';
    latestSimError = '';
    transactions: SendData[] = [];
    prevEquiClass = '';
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
        private ledgerService: LedgerService,
        private estimateService: EstimateService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.init();
        }
    }

    init() {
        if (!this.activeAccount) {
            this.activeAccount = this.walletService.wallet.implicitAccounts[0];
        }
        console.log(this.activeAccount.address);
        this.implicitAccounts = this.walletService.wallet.implicitAccounts;
        this.XTZrate = this.walletService.wallet.XTZrate;
    }
    open1(template1: TemplateRef<any>) {
        if (this.walletService.wallet) {
            if (!this.activeAccount) {
                this.activeAccount = this.implicitAccounts[0];
            }
            this.clearForm();
            this.modalRef1 = this.modalService.show(template1, { class: 'first' });  // modal-sm / modal-lg
            this.estimateService.preLoadData(this.activeAccount.pkh, this.activeAccount.pk);
        }
    }
    open2(template: TemplateRef<any>) {
        this.formInvalid = this.checkInput(true);
        if (!this.formInvalid && !this.simSemaphore) {
            if (!this.amount) { this.amount = '0'; }
            let clearFee = false;
            if (!this.fee) {
                this.fee = this.defaultTransactionParams.fee.toString();
                clearFee = true;
            }
            this.prepTransactions();
            this.formInvalid = this.checkBalance();
            if (!this.formInvalid) {
                this.close1();
                if (this.walletService.isLedgerWallet()) {
                    this.ledgerInstruction = 'Preparing transaction data. Please wait...';
                    const keys = this.walletService.getKeys('');
                    console.log(keys);
                    this.sendTransaction(keys);
                }
                this.modalRef2 = this.modalService.show(template, { class: 'second' });
            } else if (clearFee) {
                this.fee = '';
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
            const keys = this.walletService.getKeys(pwd, this.activeAccount.address);
            if (keys) {
                this.pwdValid = '';
                this.close2();
                this.modalRef3 = this.modalService.show(template, { class: 'third' });
                this.sendTransaction(keys);
            } else {
                this.pwdValid = this.translate.instant('SENDCOMPONENT.WRONGPASSWORD');  // 'Wrong password!';
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
    showAccountBalance(accountPkh: Account = this.activeAccount) {
        const accountBalance = Big(this.activeAccount.balanceXTZ).div(1000000).toString();
        return this.numberWithCommas(accountBalance) + ' XTZ';
    }
    numberWithCommas(x: string) {
        const parts: Array<string> = x.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }
    sendEntireBalance(account: Account, event: Event) {
        if (this.simSemaphore) { return; }
        event.stopPropagation();
        this.amount = this.maxToSend(account);
    }
    maxToSend(account: Account): string {
        if (account && (account instanceof ImplicitAccount)) {
            let accountBalance = Big(account.balanceXTZ).div(1000000);
            accountBalance = accountBalance.minus(this.fee ? Number(this.fee) : this.defaultTransactionParams.fee);
            if (!this.isMultipleDestinations) {
                accountBalance = accountBalance.minus(this.storage ? Number(this.storage) / 1000 : this.defaultTransactionParams.burn);
            } else {
                accountBalance = accountBalance.minus(this.defaultTransactionParams.burn);
            }
            accountBalance = accountBalance.minus(0.000001); // dust
            return accountBalance.toString();
        } else {
            return Big(account.balanceXTZ).div(1000000).toString();
        }
    }
    prepTransactions(finalCheck = false): boolean {
        if (!this.checkInput(finalCheck)) {
            if (!this.toMultipleDestinationsString) { this.toMultipleDestinationsString = ''; }
            if (this.isMultipleDestinations) {
                this.transactions = this.toMultipleDestinations;
                this.showTransactions = [];
                if (this.transactions.length > 1) {
                    this.showTransactions.push(this.transactions[0], this.transactions[1]);
                } else {
                    this.showTransactions.push(this.transactions[0]);
                }
            } else {
                const gasLimit = this.gas ? Number(this.gas) : this.defaultTransactionParams.gas;
                const storageLimit = this.storage ? Number(this.storage) : this.defaultTransactionParams.storage;
                this.transactions = [{ to: this.toPkh, amount: Number(this.amount), gasLimit, storageLimit }];
            }
            return true;
        }
        return false;
    }
    async sendTransaction(keys: KeyPair) {
        let amount = this.amount;
        let fee = this.fee;
        if (!this.walletService.isLedgerWallet()) {
            this.toPkh = '';
            this.amount = '';
            this.fee = '';
            this.gas = '';
            this.storage = '';
            this.toMultipleDestinationsString = '';
            this.toMultipleDestinations = [];
            this.showTransactions = [];
        }
        if (!amount) { amount = '0'; }
        if (!fee) { fee = '0'; }

        setTimeout(async () => {
            this.operationService.transfer(this.activeAccount.address, this.transactions, Number(fee), keys).subscribe(
                (ans: any) => {
                    this.sendResponse = ans;
                    if (ans.success === true) {
                        console.log('Transaction successful ', ans);
                        if (ans.payload.opHash) {
                            this.coordinatorService.boost(this.activeAccount.address);
                        } else if (this.walletService.wallet instanceof LedgerWallet) {
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
                if (ans.success && this.activeAccount) {
                    this.coordinatorService.boost(this.activeAccount.address);
                }
                console.log('ans: ' + JSON.stringify(ans));
            })
        );
    }
    toggleDestination() {
        this.defaultTransactionParams = zeroTxParams;
        this.prevEquiClass = '';
        this.isMultipleDestinations = !this.isMultipleDestinations;
        this.toMultipleDestinationsString = '';
        this.formInvalid = '';
        this.toPkh = '';
        this.amount = '';
        this.fee = '';
        this.gas = '';
        this.storage = '';
        this.updateDefaultValues();
    }
    burnAmount(): string {
        const burn = this.storage ? Number(this.storage) / 1000 : this.defaultTransactionParams.storage / 1000;
        if (burn) {
            return 'Burn: ' + burn;
        }
        return '';
    }
    clearForm() {
        this.toPkh = '';
        this.amount = '';
        this.fee = '';
        this.gas = '';
        this.storage = '';
        this.toMultipleDestinationsString = '';
        this.toMultipleDestinations = [];
        this.isMultipleDestinations = false;
        this.showTransactions = [];
        this.password = '';
        this.pwdValid = '';
        this.formInvalid = '';
        this.sendResponse = null;
        this.ledgerInstruction = '';
        this.showBtn = 'Show More';
        this.defaultTransactionParams = zeroTxParams;
        this.prevEquiClass = '';
        this.latestSimError = '';
    }

    checkInput(finalCheck = false): string {
        let result: any;
        if (this.isMultipleDestinations) {
            result = this.invalidInputMultiple(finalCheck);
        } else {
            result = this.invalidInputSingle(finalCheck);
        }
        if (!result && this.latestSimError) {
            result = this.latestSimError;
        }
        return result;
    }
    checkBalance() {
        if (this.transactions.length > 0) {
            if (this.activeAccount && (this.activeAccount instanceof ImplicitAccount)) {
                const max = Big(this.maxToSend(this.activeAccount)).plus(0.000001);
                let amount = Big(0);
                for (const tx of this.transactions) {
                    amount = amount.plus(Big(tx.amount));
                }
                if (amount.gt(max)) {
                    return this.translate.instant('SENDCOMPONENT.TOOHIGHFEEORAMOUNT');
                }
            } else if (this.activeAccount && (this.activeAccount instanceof OriginatedAccount)) {
                const maxKt = Big(this.maxToSend(this.activeAccount));
                const maxTz = Big(this.maxToSend(this.walletService.wallet.getImplicitAccount(this.activeAccount.pkh))).plus(0.000001);
                let amount = Big(0);
                for (const tx of this.transactions) {
                    amount = amount.plus(Big(tx.amount));
                }
                const burnAndFee = Big(this.getTotalBurn()).plus(Big(this.getTotalFee()));
                if (amount.gt(maxKt)) {
                    return this.translate.instant('SENDCOMPONENT.TOOHIGHAMOUNT');
                } else if (burnAndFee.gt(maxTz)) {
                    return this.translate.instant('SENDCOMPONENT.TOOHIGHFEE');
                }
            }
        }
        return '';
    }
    async activeAccountChange() {
        await this.estimateService.preLoadData(this.activeAccount.pkh, this.activeAccount.pk);
        this.updateDefaultValues();
    }
    updateDefaultValues() {
        this.estimateFees();
    }
    async estimateFees() {
        const prevSimError = this.latestSimError;
        this.latestSimError = '';
        if (this.prepTransactions()) {
            const equiClass = this.equiClass(this.activeAccount.address, this.transactions);
            if (this.prevEquiClass !== equiClass) {
                this.latestSimError = '';
                this.prevEquiClass = equiClass;
                this.simSemaphore++; // Put lock on 'Preview and 'Send max'
                try {
                    const res: DefaultTransactionParams | null = await this.estimateService.estimate(JSON.parse(JSON.stringify(this.transactions)), this.activeAccount.address);
                    if (res) {
                        this.defaultTransactionParams = res;
                    }
                    this.latestSimError = '';
                    this.formInvalid = '';
                } catch (e) {
                    this.formInvalid = e;
                    this.latestSimError = e;
                } finally {
                    this.simSemaphore--;
                }
            } else {
                this.latestSimError = prevSimError;
                this.formInvalid = this.latestSimError;
            }
        } else {
            this.latestSimError = prevSimError;
            if (this.isMultipleDestinations ? !this.toMultipleDestinationsString : !this.toPkh) {
                this.defaultTransactionParams = zeroTxParams;
                this.prevEquiClass = '';
            }
        }
    }
    // prevent redundant estimations
    equiClass(sender: string, transactions: SendData[]): string {
        let data = sender;
        for (const tx of transactions) {
            data += tx.to;
        }
        return data;
    }
    batchSpace(txs = 0) {
        if (this.isMultipleDestinations && this.defaultTransactionParams.customLimits && this.defaultTransactionParams.customLimits.length) {
            const numberOfTxs = txs ? txs : this.defaultTransactionParams.customLimits.length;
            const gasUsage = (this.gas && this.inputValidationService.gas(this.gas) ? Number(this.gas) * numberOfTxs : this.defaultTransactionParams.gas * numberOfTxs)
                + (this.defaultTransactionParams.reveal ? this.estimateService.revealGasLimit : 0);
            const gasCap = 1040000;
            return !txs ? this.numberWithCommas(gasUsage.toString()) + ' / ' + this.numberWithCommas(gasCap.toString()) : gasUsage < gasCap;

        }
        return !txs ? '' : true;
    }
    recieverIsKT() {
        return (this.inputValidationService.address(this.toPkh) && this.toPkh.slice(0, 2) === 'KT');
    }
    senderIsKT() {
        return (this.activeAccount && (this.activeAccount instanceof OriginatedAccount));
    }
    validateReceiverAddress() {
        if (!this.inputValidationService.address(this.toPkh) && this.toPkh !== '') {
            this.formInvalid = this.translate.instant('SENDCOMPONENT.INVALIDRECEIVERADDRESS');
        } else if (!this.latestSimError) {
            this.formInvalid = '';
        }
    }
    validateBatch() {
        this.formInvalid = this.checkInput();
    }
    invalidInputSingle(finalCheck: boolean): string {
        if (!this.inputValidationService.address(this.activeAccount.address)) {
            return this.translate.instant('SENDCOMPONENT.INVALIDSENDERADDRESS');
        } else if (!this.inputValidationService.fee(this.fee)) {
            return this.translate.instant('SENDCOMPONENT.INVALIDFEE');
        } else {
            return this.checkReceiverAndAmount(this.toPkh, this.amount, finalCheck);
        }
    }
    checkReceiverAndAmount(toPkh: string, amount: string, finalCheck: boolean): string {
        console.log(toPkh + ' ' + amount);
        if (!this.inputValidationService.address(toPkh)) {
            return this.translate.instant('SENDCOMPONENT.INVALIDRECEIVERADDRESS');
        } else if (!this.inputValidationService.amount(amount) ||
            (finalCheck && (amount === '0' || amount === ''))) {
            return this.translate.instant('SENDCOMPONENT.INVALIDAMOUNT');
        } else if (!this.inputValidationService.gas(this.gas)) {
            return this.translate.instant('SENDCOMPONENT.INVALIDGASLIMIT');
        } else if (!this.inputValidationService.storage(this.storage)) {
            return this.translate.instant('SENDCOMPONENT.INVALIDSTORAGELIMIT');
        }
        return '';
    }

    // Checking toMultipleDestinationsString and building up toMultipleDestinations[to: string, amount: number]
    invalidInputMultiple(finalCheck = false): string {
        if (!this.inputValidationService.address(this.activeAccount.address)) {
            return this.translate.instant('SENDCOMPONENT.INVALIDSENDERADDRESS');
        } else if (!this.inputValidationService.fee(this.fee)) {
            return this.translate.instant('SENDCOMPONENT.INVALIDFEE');
        }
        this.toMultipleDestinations = [];
        const toMultipleDestinationsArray = this.toMultipleDestinationsString.split(';');
        if (toMultipleDestinationsArray.length === 1 && toMultipleDestinationsArray[0].trim() === '') {
            return this.translate.instant('SENDCOMPONENT.INVALIDRECEIVERADDRESS');
        }
        let validationError = '';
        toMultipleDestinationsArray.forEach((item, index) => {
            toMultipleDestinationsArray[index] = item.trim();
            if (toMultipleDestinationsArray[index] !== '') {
                const singleSendDataArray = toMultipleDestinationsArray[index].split(' ');
                if (singleSendDataArray.length === 2) {
                    const singleSendDataCheckresult = this.checkReceiverAndAmount(singleSendDataArray[0], singleSendDataArray[1], finalCheck);
                    if (singleSendDataCheckresult === '') {
                        const gasLimit = this.gas ? Number(this.gas) : this.defaultTransactionParams.customLimits &&
                            this.defaultTransactionParams.customLimits.length > index ?
                            this.defaultTransactionParams.customLimits[index].gasLimit : this.defaultTransactionParams.gas;
                        const storageLimit = this.storage ? Number(this.storage) : this.defaultTransactionParams.customLimits &&
                            this.defaultTransactionParams.customLimits.length > index ?
                            this.defaultTransactionParams.customLimits[index].storageLimit : this.defaultTransactionParams.storage;
                        this.toMultipleDestinations.push({ to: singleSendDataArray[0], amount: Number(singleSendDataArray[1]), gasLimit, storageLimit });
                    } else {
                        this.toMultipleDestinations = [];
                        validationError = singleSendDataCheckresult + '. Transaction ' + (index + 1);
                    }
                } else if (singleSendDataArray.length === 1) {
                    validationError = this.translate.instant('SENDCOMPONENT.NOADDRESSORAMOUNT') + ' Transaction ' + (index + 1);
                } else {
                    validationError = 'Expected semicolon after transaction ' + (index + 1);
                }
            }
        });
        if (!validationError && finalCheck && !this.batchSpace(this.toMultipleDestinations.length)) {
            validationError = this.translate.instant('SENDCOMPONENT.GASOVERFLOW');
        }
        return validationError;
    }

    totalAmount(): number {
        let totalSent = 0;
        for (const tx of this.transactions) {
            totalSent = totalSent + tx.amount;
        }
        return totalSent;
    }
    getTotalFee(): number {
        if (this.fee) {
            return Number(this.fee);
        }
        return Number(this.defaultTransactionParams.fee);
    }
    getTotalBurn() {
        if (this.storage) {
            return (Number(this.storage) * this.transactions.length) / 1000;
        }
        return this.defaultTransactionParams.burn;
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
