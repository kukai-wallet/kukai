import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { KeyPair, DefaultTransactionParams } from '../../interfaces';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { OperationService } from '../../services/operation/operation.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { LedgerService } from '../../services/ledger/ledger.service';
import { EstimateService } from '../../services/estimate/estimate.service';
import Big from 'big.js';
import { Constants } from '../../constants';
import { LedgerWallet, TorusWallet } from '../../services/wallet/wallet';
import { Account, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';
import { MessageService } from '../../services/message/message.service';
import { TorusService } from '../../services/torus/torus.service';
import { LookupService } from '../../services/lookup/lookup.service';
import { TokenService } from '../../services/token/token.service';

interface SendData {
  to: string;
  amount: number;
  gasLimit: number;
  storageLimit: number;
  meta?: {
    alias: string;
    verifier: string;
    twitterId?: string;
  };
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
  styleUrls: ['./send.component.scss']
})

export class SendComponent implements OnInit {
  costPerByte: string = this.estimateService.costPerByte;
  // torus
  torusVerifier = '';
  torusPendingLookup = false;
  torusLookupAddress = '';
  torusLookupId = '';
  torusTwitterId = '';
  /* New variables */
  modalOpen = false;
  advancedForm = false;
  sendMax = false;
  /* old variables */
  @Input() activeAccount: Account;
  @Input() tokenTransfer: string;
  @ViewChild('amountInput') amountInputView: ElementRef;
  CONSTANTS = new Constants();
  defaultTransactionParams: DefaultTransactionParams = zeroTxParams;

  // Transaction variables
  toPkh: string;
  amount = '';
  fee: string;
  sendFee: string;
  burnFee = 0;
  gas = '';
  storage = '';
  isMultipleDestinations = false;
  toMultipleDestinationsString = '';
  toMultipleDestinations: SendData[] = [];
  activeView = 0;
  showTransactions: SendData[] = [];
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
  ledgerError = '';
  showBtn = 'Show More';

  constructor(
    private translate: TranslateService,
    private walletService: WalletService,
    private operationService: OperationService,
    private coordinatorService: CoordinatorService,
    private inputValidationService: InputValidationService,
    private ledgerService: LedgerService,
    private estimateService: EstimateService,
    private messageService: MessageService,
    public torusService: TorusService,
    private lookupService: LookupService,
    public tokenService: TokenService
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
  }
  /* Modal 2 */
  openModal() {
    // hide body scrollbar
    const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
    document.body.style.marginRight = scrollBarWidth.toString();
    document.body.style.overflow = 'hidden';
    console.log('open modal');
    this.modalOpen = true;
    if (this.walletService.wallet) {
      if (!this.activeAccount) {
        this.activeAccount = this.implicitAccounts[0];
      }
      this.clearForm();
      if (window.innerWidth > 1300) {
        setTimeout(() => {
          const inputElem = <HTMLInputElement>this.amountInputView.nativeElement;
          inputElem.focus();
        }, 100);
      }
      this.estimateService.preLoadData(this.activeAccount.pkh, this.activeAccount.pk);
    }
  }
  async openModal2() {
    if (!this.simSemaphore && !this.torusPendingLookup) {
      this.formInvalid = this.checkInput(true);
      if (!this.formInvalid) {
        if (!this.amount) { this.amount = '0'; }
        let clearFee = false;
        if (!this.fee) {
          this.fee = this.defaultTransactionParams.fee.toString();
          clearFee = true;
        }
        this.prepTransactions();
        this.formInvalid = this.checkBalance();
        if (!this.formInvalid) {
          this.activeView++;
          if (this.walletService.isLedgerWallet()) {
            this.messageService.startSpinner('Preparing transaction...');
            const keys = await this.walletService.getKeys('');
            if (keys) {
              await this.sendTransaction(keys);
            } else {
              this.messageService.stopSpinner();
            }
          }
        } else if (clearFee) {
          this.fee = '';
        }
      }
    }
  }
  async ledgerRetry() {
    this.ledgerError = '';
    this.messageService.startSpinner('Preparing transaction...');
    const keys = await this.walletService.getKeys('');
    if (keys) {
      await this.sendTransaction(keys);
    } else {
      this.messageService.stopSpinner();
    }
  }
  async inject() {
    if (this.walletService.isLedgerWallet()) {
      this.broadCastLedgerTransaction();
      this.sendResponse = null;
      this.closeModal();
    } else {
      const pwd = this.password;
      this.password = '';
      this.messageService.startSpinner('Signing transaction...');
      let keys;
      try {
        keys = await this.walletService.getKeys(pwd, this.activeAccount.pkh);
      } catch {
        this.messageService.stopSpinner();
      }
      if (keys) {
        this.pwdValid = '';
        this.messageService.startSpinner('Sending transaction...');
        this.sendTransaction(keys);
        this.closeModal();
      } else {
        this.messageService.stopSpinner();
        if (this.walletService.wallet instanceof TorusWallet) {
          this.pwdValid = `Authorization failed`;
        } else {
          this.pwdValid = this.translate.instant('SENDCOMPONENT.WRONGPASSWORD');  // 'Wrong password!';
        }
      }
    }
  }
  closeModal() {
    // restore body scrollbar
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.activeView = 0;
    this.modalOpen = false;
    this.clearForm();
  }
  showAccountBalance() {
    const accountBalance = Big(this.activeAccount.balanceXTZ).div(1000000).toString();
    return this.numberWithCommas(accountBalance) + ' XTZ';
  }
  numberWithCommas(x: string) {
    const parts: Array<string> = x.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  sendEntireBalance(event: Event) {
    event.stopPropagation();
    this.sendMax = true;
    this.checkMaxAmount();
    this.amountChange();
  }
  checkMaxAmount() {
    if (this.sendMax) {
      const max = this.maxToSend(this.activeAccount);
      if (max.length && max.slice(0, 1) !== '-') {
        this.amount = max;
      } else {
        this.amount = '0';
      }
    }
  }
  updateMaxAmount() {
    if (this.sendMax) {
      const max = this.maxToSend(this.activeAccount);
      let maxAmount = '0';
      if (max.length && max.slice(0, 1) !== '-') {
        maxAmount = max;
      }
      if (this.amount !== maxAmount) {
        this.amount = maxAmount;
      }
    }
  }
  maxToSend(account: Account): string {
    if (account && (account instanceof ImplicitAccount) && !this.tokenTransfer) {
      let accountBalance = Big(account.balanceXTZ).div(1000000);
      accountBalance = accountBalance.minus(this.fee && Number(this.fee) ? Number(this.fee) : this.defaultTransactionParams.fee);
      if (!this.isMultipleDestinations) {
        accountBalance = accountBalance.minus(this.storage && Number(this.storage) ? Number(Big(this.storage).times(this.costPerByte).div('1000000')) : this.defaultTransactionParams.burn);
      } else {
        accountBalance = accountBalance.minus(this.defaultTransactionParams.burn);
      }
      accountBalance = accountBalance.minus(0.000001); // dust
      return accountBalance.toString();
    } else {
      if (this.tokenTransfer) {
        if (account instanceof ImplicitAccount) {
          return Big(account.getTokenBalance(this.tokenTransfer)).div(10 ** this.tokenService.getAsset(this.tokenTransfer).decimals).toString();
        }
      } else {
        return Big(account.balanceXTZ).div(1000000).toString();
      }
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
        const toAddress = !this.torusVerifier ? this.toPkh : this.torusLookupAddress;
        this.transactions = [{ to: toAddress, amount: Number(this.amount), gasLimit, storageLimit }];
        if (this.torusLookupId) {
          if (this.torusVerifier === 'twitter') {
            this.transactions[0].meta = { alias: this.torusLookupId, verifier: this.torusVerifier, twitterId: this.torusTwitterId };
          } else {
            this.transactions[0].meta = { alias: this.torusLookupId, verifier: this.torusVerifier };
          }
        }
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
    this.operationService.transfer(this.activeAccount.address, this.transactions, Number(fee), keys, this.tokenTransfer).subscribe(
      async (ans: any) => {
        this.sendResponse = ans;
        if (ans.success === true) {
          console.log('Transaction successful ', ans);
          if (ans.payload.opHash) {
            this.messageService.stopSpinner();
            const metadata = { transactions: this.transactions, opHash: ans.payload.opHash, tokenTransfer: this.tokenTransfer };
            this.coordinatorService.boost(this.activeAccount.address, metadata);
            if (this.transactions[0].meta) {
              this.torusNotification(this.transactions[0]);
            }
            for (const transaction of this.transactions) {
              if (this.walletService.addressExists(transaction.to)) {
                this.coordinatorService.boost(transaction.to);
              }
            }
          } else if (this.walletService.wallet instanceof LedgerWallet) {
            await this.requestLedgerSignature();
          }
        } else {
          this.messageService.stopSpinner();
          console.log('Transaction error id ', ans.payload.msg);
          this.messageService.addError(ans.payload.msg, 0);
        }
      },
      err => {
        this.messageService.stopSpinner();
        console.log('Error Message ', JSON.stringify(err));
        if (this.walletService.isLedgerWallet()) {
          this.messageService.addError('Failed to create transaction', 0);
        }
      },
    );
  }
  async requestLedgerSignature() {
    if (this.walletService.wallet instanceof LedgerWallet) {
      await this.messageService.startSpinner('Waiting for Ledger signature...');
      try {
        const op = this.sendResponse.payload.unsignedOperation;
        const signature = await this.ledgerService.signOperation(op, this.walletService.wallet.implicitAccounts[0].derivationPath);
        if (signature) {
          const signedOp = op + signature;
          this.sendResponse.payload.signedOperation = signedOp;
        } else {
          this.ledgerError = 'Failed to sign transaction';
        }
      } finally {
        this.messageService.stopSpinner();
      }
    }
  }

  async broadCastLedgerTransaction() {
    this.operationService.broadcast(this.sendResponse.payload.signedOperation).subscribe(
      ((ans: any) => {
        this.sendResponse = ans;
        if (ans.success && this.activeAccount) {
          const metadata = { transactions: this.transactions, opHash: ans.payload.opHash, tokenTransfer: this.tokenTransfer };
          if (this.transactions[0].meta) {
            this.torusNotification(this.transactions[0]);
          }
          this.coordinatorService.boost(this.activeAccount.address, metadata);
          if (this.walletService.addressExists(this.transactions[0].to)) {
            this.coordinatorService.boost(this.transactions[0].to);
          }
        } else {
          this.messageService.addError(this.sendResponse.payload.msg, 0);
        }
        console.log('ans: ' + JSON.stringify(ans));
      })
    );
  }
  toggleDestination() {
    this.defaultTransactionParams = zeroTxParams;
    this.sendMax = false;
    this.prevEquiClass = '';
    this.isMultipleDestinations = !this.isMultipleDestinations;
    this.transactions = [];
    this.toMultipleDestinationsString = '';
    this.formInvalid = '';
    this.toPkh = '';
    this.amount = '';
    this.fee = '';
    this.gas = '';
    this.storage = '';
    this.clearTorus();
    this.updateDefaultValues();
  }
  burnAmount(): string {
    const burn = this.storage ? Number(Big(this.storage).times(this.costPerByte).div(1000000)) : this.defaultTransactionParams.burn;
    if (burn) {
      return burn + ' tez';
    }
    return '';
  }
  clearForm() {
    this.toPkh = '';
    this.amount = '';
    this.fee = '';
    this.gas = '';
    this.storage = '';
    this.advancedForm = false;
    this.sendMax = false;
    this.toMultipleDestinationsString = '';
    this.toMultipleDestinations = [];
    this.isMultipleDestinations = false;
    this.showTransactions = [];
    this.password = '';
    this.pwdValid = '';
    this.formInvalid = '';
    this.sendResponse = null;
    this.ledgerError = '';
    this.showBtn = 'Show More';
    this.defaultTransactionParams = zeroTxParams;
    this.prevEquiClass = '';
    this.latestSimError = '';
    this.clearTorus();
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
  checkBalance(): string {
    if (this.transactions.length > 0) {
      if (this.activeAccount && (this.activeAccount instanceof ImplicitAccount)) {
        const max = Big(this.maxToSend(this.activeAccount)).plus(this.tokenTransfer ? 0 : 0.000001);
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
        if (amount.gt(maxKt)) {
          return this.translate.instant('SENDCOMPONENT.TOOHIGHAMOUNT');
        } else if ((new Big('0')).gt(maxTz)) {
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
    if (!this.torusVerifier) {
      this.estimateFees();
      if (this.isMultipleDestinations) {
        this.amount = this.totalAmount().toString();
      }
    }
  }
  amountChange() {
    if (this.tokenTransfer) {
      this.estimateFees();
    }
  }
  async estimateFees() {
    console.log('estimate..');
    const prevSimError = this.latestSimError;
    this.latestSimError = '';
    if (this.prepTransactions()) {
      const equiClass = this.equiClass(this.activeAccount.address, this.transactions);
      if (this.prevEquiClass !== equiClass && (!this.tokenTransfer || !this.checkBalance())) {
        this.latestSimError = '';
        this.prevEquiClass = equiClass;
        this.simSemaphore++; // Put lock on 'Preview and 'Send max'
        const callback = (res) => {
          if (res) {
            if (res.error) {
              this.formInvalid = res.error;
              this.latestSimError = res.error;
            } else {
              this.defaultTransactionParams = res;
              this.formInvalid = '';
              this.latestSimError = '';
              this.updateMaxAmount();
            }
          }
          this.simSemaphore--;
        };
        console.log('simulate...');
        this.estimateService.estimate(JSON.parse(JSON.stringify(this.transactions)), this.activeAccount.address, this.tokenTransfer, callback);
      } else {
        this.latestSimError = prevSimError;
        this.formInvalid = this.latestSimError;
      }
    } else {
      this.latestSimError = prevSimError;
      if (this.isMultipleDestinations ? !this.toMultipleDestinationsString : !this.toPkh) {
        this.defaultTransactionParams = zeroTxParams;
        this.updateMaxAmount();
        this.prevEquiClass = '';
      }
    }
  }
  // prevent redundant estimations
  equiClass(sender: string, transactions: SendData[]): string {
    let data = sender;
    if (this.tokenTransfer) {
      data += transactions[0].to + transactions[0].amount.toString();
    } else {
      for (const tx of transactions) {
        data += tx.to;
      }
    }
    return data;
  }
  batchSpace(txs = 0) {
    if (this.isMultipleDestinations && this.defaultTransactionParams.customLimits && this.defaultTransactionParams.customLimits.length) {
      const numberOfTxs = txs ? txs : this.defaultTransactionParams.customLimits.length;
      const txsLimit = 294 + (this.defaultTransactionParams.reveal ? 0 : 2); // Max transactions in a batch is 296 (294 with a reveal)
      return !txs ? this.numberWithCommas(numberOfTxs + ' / ' + txsLimit) : numberOfTxs <= txsLimit;

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
    if (!this.torusVerifier) {
      if (!this.inputValidationService.address(this.toPkh) && this.toPkh !== '') {
        this.formInvalid = this.translate.instant('SENDCOMPONENT.INVALIDRECEIVERADDRESS');
      } else if (!this.latestSimError) {
        this.formInvalid = ''; // clear error
      }
    } else { // Torus
      this.torusLookupAddress = '';
      if (this.torusService.verifierMapKeys.includes(this.torusVerifier)) {
        if (!this.inputValidationService.torusAccount(this.toPkh, this.torusVerifier) && this.toPkh !== '') {
          switch (this.torusVerifier) {
            case 'google':
              this.formInvalid = 'Invalid Google email address';
              break;
            case 'reddit':
              this.formInvalid = 'Invalid Reddit username';
              break;
            case 'twitter':
              this.formInvalid = 'Twitter username begins with "@"';
              break;
            default:
              this.formInvalid = 'Unhandled verifier';
          }
        } else {
          if (!this.latestSimError) {
            this.formInvalid = ''; // clear error
          }
          this.torusLookup();
        }
      } else {
        this.formInvalid = 'Unrecognized verifier';
      }
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
    if (!this.torusVerifier && (!this.inputValidationService.address(toPkh) || toPkh === this.activeAccount.address)) {
      return this.translate.instant('SENDCOMPONENT.INVALIDRECEIVERADDRESS');
    } else if (this.torusVerifier
      && (!this.inputValidationService.torusAccount(this.toPkh, this.torusVerifier) || this.torusLookupAddress === this.activeAccount.address)) {
      return 'Invalid recipient';
    } else if (!this.inputValidationService.amount(amount, this.tokenTransfer ? true : false) ||
      (finalCheck && (((amount === '0') || amount === '') && (toPkh.slice(0, 3) !== 'KT1')))) {
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
      validationError = this.translate.instant('SENDCOMPONENT.TRANSACTIONSOVERFLOW');
    }
    return validationError;
  }

  totalAmount(): string {
    let totalSent = Big(0);
    for (const tx of this.transactions) {
      totalSent = totalSent.add(tx.amount);
    }
    return totalSent.toString();
  }
  getTotalCost(display: boolean = false): string {
    const totalFee = Big(this.getTotalFee()).plus(Big(this.getTotalBurn())).toString();
    if (display && totalFee === '0') {
      return '-';
    }
    return totalFee;
  }
  getTotalFee(): number {
    if (this.fee !== '' && Number(this.fee)) {
      return Number(this.fee);
    }
    return Number(this.defaultTransactionParams.fee);
  }
  getTotalBurn(): number {
    if (this.storage !== '' && Number(this.storage)) {
      return Number(Big(this.storage).mul(this.transactions.length).times(this.costPerByte).div(1000000).toString());
    }
    return Number(this.defaultTransactionParams.burn);
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
  dynSize(): string {
    const size = this.amount ? this.amount.length : 0;
    if (size < 7) {
      return '5';
    } else if (size < 9) {
      return '4';
    } else if (size < 12) {
      return '3';
    } else if (size < 17) {
      return '2';
    }
    return '1.5';
  }
  async verifierChange() {
    this.torusLookupAddress = '';
    console.log('Verifier: ' + this.torusVerifier);
    this.validateReceiverAddress();
    // resimulate?
  }
  async torusLookup() {
    if (!this.torusService.verifierMapKeys.includes(this.torusVerifier)) {
      this.formInvalid = 'Invalid verifier';
      console.log(this.torusService.verifierMapKeys);
      console.log(this.torusVerifier);
    } else if (this.toPkh) {
      this.torusPendingLookup = true;
      this.torusLookupId = this.toPkh;
      const { pkh, twitterId } = await this.torusService.lookupPkh(this.torusVerifier, this.toPkh).catch(e => {
        console.error(e);
        this.formInvalid = e;
        return '';
      });
      this.torusPendingLookup = false;
      if (pkh) {
        this.torusLookupAddress = pkh;
        this.torusTwitterId = twitterId ? twitterId : '';
        this.estimateFees();
        console.log('Torus address', pkh);
      } else {
        this.torusLookupAddress = '';
      }
    }
  }
  torusReady(): boolean {
    return (!this.torusPendingLookup && this.torusLookupAddress !== '');
  }
  clearTorus() {
    this.torusVerifier = '';
    this.torusPendingLookup = false;
    this.torusLookupAddress = '';
    this.torusLookupId = '';
    this.torusTwitterId = '';
  }
  async torusNotification(transaction: SendData) {
    if (transaction.meta) {
      if (transaction.meta.verifier === 'google') {
        this.messageService.emailNotify(transaction.meta.alias, transaction.amount.toString());
        this.lookupService.add(transaction.to, transaction.meta.alias, 2);
      } else if (transaction.meta.verifier === 'reddit') {
        this.messageService.redditNotify(transaction.meta.alias, transaction.amount.toString());
        this.lookupService.add(transaction.to, transaction.meta.alias, 3);
      } else if (transaction.meta.verifier === 'twitter') {
        this.messageService.twitterNotify(transaction.meta.twitterId, transaction.meta.alias, transaction.amount.toString());
        this.lookupService.add(transaction.to, transaction.meta.alias, 4);
      }
    }
  }
  previewAttention(): string {
    if (this.torusLookupId) {
      if (new Big(this.totalAmount()).gt('50')) {
        let recipientKind = '';
        switch (this.torusVerifier) {
          case 'google':
            recipientKind = 'Google account email address';
            break;
          case 'reddit':
            recipientKind = 'Reddit username';
            break;
          case 'twitter':
            recipientKind = 'Twitter handle';
            break;
          default:
            recipientKind = 'information';
        }
        return `Carefully review the recipient's ${recipientKind}! Spelling mistakes can lead to permanent loss of the transferred funds.`;
      }
    }
    return '';
  }
  getAssetName(): string {
    if (this.tokenTransfer) {
      return this.tokenService.getAsset(this.tokenTransfer).symbol;
    } else {
      return 'tez';
    }
  }
}
