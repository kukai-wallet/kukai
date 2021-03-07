import { Component, OnInit, ViewEncapsulation, Input, ViewChild, ElementRef, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TokenService } from '../../../services/token/token.service';
import { EstimateService } from '../../../services/estimate/estimate.service';
import { KeyPair, DefaultTransactionParams } from '../../../interfaces';
import { FullyPreparedTransaction, PartiallyPreparedTransaction, PrepareRequest } from '../interfaces';
import { LedgerWallet, TorusWallet } from '../../../services/wallet/wallet';
import { Account, ImplicitAccount, OriginatedAccount } from '../../../services/wallet/wallet';
import { TorusService } from '../../../services/torus/torus.service';
import Big from 'big.js';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';
import assert from 'assert';


const zeroTxParams: DefaultTransactionParams = {
  gas: 0,
  storage: 0,
  fee: 0,
  burn: 0
};
@Component({
  selector: 'app-prepare-send',
  templateUrl: './prepare-send.component.html',
  styleUrls: ['../send.component.scss']
})
export class PrepareSendComponent implements OnInit, OnChanges {
  @Input() prepareRequest: PrepareRequest = null;
  @Output() prepareResponse = new EventEmitter();
  modalOpen = false;
  activeAccount: Account = null;
  tokenTransfer: string = null;
  costPerByte: string = this.estimateService.costPerByte;


  defaultTransactionParams: DefaultTransactionParams = zeroTxParams;
  active = false;
  isMultipleDestinations = false;
  advancedForm = false;
  hideAmount = false;
  simSemaphore = 0;

  torusVerifier = '';
  torusLookupId = '';
  torusLookupAddress = '';
  torusTwitterId = '';
  torusPendingLookup = false;

  transactions = []; // Todo: remove me
  toMultipleDestinationsString = '';

  formInvalid = '';
  latestSimError = '';
  prevEquiClass = '';

  sendMax = null;

  amount = '';
  toPkh = '';
  customFee = '';
  customGasLimit = '';
  customStorageLimit = '';
  constructor(
    private tokenService: TokenService,
    private estimateService: EstimateService,
    public torusService: TorusService,
    private translate: TranslateService,
    private walletService: WalletService,
    private inputValidationService: InputValidationService,
  ) { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.prepareRequest?.currentValue && !changes.prepareRequest.previousValue) {
      this.tokenTransfer = changes.prepareRequest.currentValue.tokenTransfer;
      this.activeAccount = changes.prepareRequest.currentValue.account;
      this.openModal();
    }
  }
  async openModal() {
    const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
    document.body.style.marginRight = scrollBarWidth.toString();
    document.body.style.overflow = 'hidden';
    this.modalOpen = true;
    this.estimateService.preLoadData(this.activeAccount.pkh, this.activeAccount.pk);
  }
  closeModalAction() {
    this.closeModal();
    this.prepareResponse.emit(null);
  }
  closeModal() {
    // restore body scrollbar
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.reset();
  }
  reset() {
    this.modalOpen = false;
    this.prepareRequest = null;

    this.defaultTransactionParams = zeroTxParams;
    this.active = false;
    this.isMultipleDestinations = false;
    this.advancedForm = false;
    this.hideAmount = false;
    this.simSemaphore = 0;

    this.transactions = [];
    this.toMultipleDestinationsString = '';

    this.formInvalid = '';
    this.latestSimError = '';
    this.prevEquiClass = '';

    this.sendMax = null;

    this.amount = '';
    this.toPkh = '';
    this.customFee = '';
    this.customGasLimit = '';
    this.customStorageLimit = '';
    this.clearTorus();
  }
  getTitle() {
    return `Send ${this.getAssetName(false)}`;
  }
  getAssetName(short = true): string {
    if (this.tokenTransfer) {
      const token = this.tokenService.getAsset(this.tokenTransfer);
      return short ? token.symbol : token.name;
    } else {
      return 'tez';
    }
  }
  getTotalAmount(): string {
    let totalSent = Big(0);
    for (const tx of this.transactions) {
      totalSent = totalSent.add(tx.amount);
    }
    return totalSent.toFixed();
  }
  getTotalCost(display: boolean = false): string {
    const totalFee = Big(this.getTotalFee()).plus(Big(this.getTotalBurn())).toString();
    if (display && totalFee === '0') {
      return '-';
    }
    return totalFee;
  }
  getTotalFee(): number {
    if (this.customFee !== '' && Number(this.customFee)) {
      return Number(this.customFee);
    }
    return Number(this.defaultTransactionParams.fee);
  }
  getTotalBurn(): number {
    if (this.customStorageLimit !== '' && Number(this.customStorageLimit)) {
      return Number(Big(this.customStorageLimit).mul(this.transactions.length).times(this.costPerByte).div(1000000).toString());
    }
    return this.defaultTransactionParams.burn;
  }
  burnAmount(): string {
    const burn = this.customStorageLimit ? Number(Big(this.customStorageLimit).times(this.costPerByte).div(1000000)) : this.defaultTransactionParams.burn;
    if (burn) {
      return burn + ' tez';
    }
    return '';
  }
  amountChange() {
    this.estimateFees();
  }
  async estimateFees() {
    console.log('estimate..');
    const prevSimError = this.latestSimError;
    this.latestSimError = '';
    let txs: PartiallyPreparedTransaction[] = [];
    try {
      txs = this.getMinimalPreparedTxs();
      this.transactions = txs;
    } catch (e) {
      console.warn(e);
    }
    if (txs?.length) {
      const equiClass = this.equiClass(this.activeAccount.address, txs);
      if (this.prevEquiClass !== equiClass || (this.tokenTransfer && this.checkBalance())) {
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
          } else {
            console.log('no res');
          }
          this.simSemaphore--;
        };
        this.estimateService.estimate(JSON.parse(JSON.stringify(txs)), this.activeAccount.address, this.tokenTransfer, callback);
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
  equiClass(sender: string, transactions: any): string {
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
  /*
    1. input validation
      strict checks that
    2. create basic transaction array
  */
  updateDefaultValues() {
    if (!this.torusVerifier) {
      this.estimateFees();
      if (this.isMultipleDestinations) {
        this.amount = this.getTotalAmount();
      }
    }
  }
  toPkhChange() {
    if (this.torusVerifier) {
      this.torusLookup();
    }
  }
  // Will return PartiallyPreparedTransaction or throw an error
  getMinimalPreparedTxs(finalCheck = false): PartiallyPreparedTransaction[] {
    if (!this.isMultipleDestinations) {
      if (this.torusVerifier) {
        assert(!this.invalidTorusAccount(), this.invalidTorusAccount());
        assert(this.torusReady(), 'Pending lookup');
        this.checkTx(this.torusLookupAddress, this.amount, finalCheck);
        const meta: any = { verifier: this.torusVerifier, alias: this.torusLookupId };
        if (this.torusTwitterId) {
          meta.twitterId = this.torusTwitterId;
        }
        return [{ kind: 'transaction', destination: this.torusLookupAddress, amount: this.amount ? this.amount : '0', meta }];
      } else {
        this.checkTx(this.toPkh, this.amount, finalCheck);
      }
      return [{ kind: 'transaction', destination: this.toPkh, amount: this.amount ? this.amount : '0' }];
      //this.checkGasStorageFee();
    } else {
      return this.getBatch(finalCheck);
      //assert(false, 'not supported yet')
    }
  }
  checkTx(toPkh: string, amount: string, finalCheck: boolean) {
    assert(this.torusVerifier || !(!this.inputValidationService.address(toPkh) || toPkh === this.activeAccount.address),
      this.translate.instant('SENDCOMPONENT.INVALIDRECEIVERADDRESS'));
    assert(!this.torusVerifier || !(!this.inputValidationService.torusAccount(this.toPkh, this.torusVerifier) || this.torusLookupAddress === this.activeAccount.address),
      'Invalid recipient');
    assert(!(!this.inputValidationService.amount(amount, this.tokenTransfer ? this.tokenService.getAsset(this.tokenTransfer).decimals : undefined) || (finalCheck && ((amount === '0') || amount === '') && (toPkh.slice(0, 3) !== 'KT1'))),
      this.translate.instant('SENDCOMPONENT.INVALIDAMOUNT'));
  }
  getBatch(finalCheck = false): PartiallyPreparedTransaction[] {
    const txs: PartiallyPreparedTransaction[] = this.toMultipleDestinationsString.trim().split(';').map((row, i) => {
      if (row.trim()) {
        const cols = row.trim().split(' ').map(col => col.trim()).filter(col => col);
        assert(cols?.length === 2, `Transaction ${i + 1} has invalid number of arguments. Expected 2, but got ${cols?.length}.`);
        assert(this.inputValidationService.address(cols[0]), `Transaction ${i + 1} contains an invalid destination.`);
        assert(this.inputValidationService.amount(cols[1]), `Transaction ${i + 1} contains an invalid amount.`);
        this.checkTx(cols[0], cols[1], finalCheck);
        const tx: PartiallyPreparedTransaction = {
          kind: 'transaction',
          destination: cols[0],
          amount: cols[1]
        };
        return tx;
      }
    }).filter(row => row);
    return txs;
  }
  getFullyPreparedTxs(): FullyPreparedTransaction[] {
    assert(!this.simSemaphore && (!this.torusVerifier || this.torusReady()), 'Awaiting request');
    const minimalTxs = this.getMinimalPreparedTxs(true);
    this.transactions = minimalTxs;
    assert(this.inputValidationService.fee(this.customFee), 'Invalid fee');
    assert(this.inputValidationService.gas(this.customGasLimit), 'Invalid gas limit');
    assert(this.inputValidationService.gas(this.customStorageLimit), 'Invalid storage limit');
    assert(!this.checkBalance(), this.checkBalance());
    const fullyTxs: FullyPreparedTransaction[] = [];
    assert(minimalTxs.length === this.defaultTransactionParams.customLimits?.length, 'Simulation error');
    for (let i = 0; i < minimalTxs.length; i++) {
      const fullyTx: FullyPreparedTransaction = {
        ...minimalTxs[i],
        fee: (i === minimalTxs.length - 1) ? this.getTotalFee().toString() : '0',
        gasLimit: this.customGasLimit ? this.customGasLimit : this.defaultTransactionParams.customLimits[i].gasLimit.toString(),
        storageLimit: this.customStorageLimit ? this.customStorageLimit : this.defaultTransactionParams.customLimits[i].storageLimit.toString(),
      };
      fullyTxs.push(fullyTx);
    }
    return fullyTxs;
  }
  invalidTorusAccount(): string {
    const torusError = { google: 'Invalid Google email address', reddit: 'Invalid Reddit username', twitter: 'Twitter username begins with "@"' };
    if (!this.inputValidationService.torusAccount(this.toPkh, this.torusVerifier) && this.toPkh !== '') {
      return torusError[this.torusVerifier];
    }
  }
  sendEntireBalance(event: Event) {
    event.stopPropagation();
    this.sendMax = true;
    this.checkMaxAmount();
    this.amountChange();
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
    this.customFee = '';
    this.customGasLimit = '';
    this.customStorageLimit = '';
    this.clearTorus();
    this.updateDefaultValues();
  }
  clearTorus() {
    this.torusVerifier = '';
    this.torusPendingLookup = false;
    this.torusLookupAddress = '';
    this.torusLookupId = '';
    this.torusTwitterId = '';
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
      accountBalance = accountBalance.minus(this.customFee && Number(this.customFee) ? Number(this.customFee) : this.defaultTransactionParams.fee);
      if (!this.isMultipleDestinations) {
        accountBalance = accountBalance.minus(this.customStorageLimit && Number(this.customStorageLimit) ? Number(Big(this.customStorageLimit).times(this.costPerByte).div('1000000')) : this.defaultTransactionParams.burn);
      } else {
        accountBalance = accountBalance.minus(this.defaultTransactionParams.burn);
      }
      accountBalance = accountBalance.minus(0.000001); // dust
      return accountBalance.toString();
    } else {
      if (this.tokenTransfer) {
        if (account instanceof ImplicitAccount) {
          return Big(account.getTokenBalance(this.tokenTransfer)).div(10 ** this.tokenService.getAsset(this.tokenTransfer).decimals).toFixed();
        }
      } else {
        return Big(account.balanceXTZ).div(1000000).toString();
      }
    }
  }


  async verifierChange() {
    this.torusLookupAddress = '';
    if (this.torusVerifier) {
      this.torusLookup();
    } else {
      this.estimateFees();
    }
    // this.validateReceiverAddress();
    // resimulate?
  }
  async torusLookup() {
    if (!this.torusService.verifierMapKeys.includes(this.torusVerifier)) {
      this.formInvalid = 'Invalid verifier';
    } else if (this.invalidTorusAccount()) {
      this.formInvalid = this.invalidTorusAccount();
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
      } else {
        this.torusLookupAddress = '';
      }
    }
  }
  batchSpace(txs = 0) {
    if (this.isMultipleDestinations && this.defaultTransactionParams.customLimits && this.defaultTransactionParams.customLimits.length) {
      const numberOfTxs = txs ? txs : this.defaultTransactionParams.customLimits.length;
      const txsLimit = 294 + (this.defaultTransactionParams.reveal ? 0 : 2); // Max transactions in a batch is 296 (294 with a reveal)
      return !txs ? this.numberWithCommas(numberOfTxs + ' / ' + txsLimit) : numberOfTxs <= txsLimit;

    }
    return !txs ? '' : true;
  }
  numberWithCommas(x: string) {
    const parts: Array<string> = x.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  torusReady(): boolean {
    return (!this.torusPendingLookup && this.torusLookupAddress !== '');
  }
  preview() {
    let txs: FullyPreparedTransaction[];
    try {
      txs = this.getFullyPreparedTxs();
      this.prepareResponse.emit(txs);
      this.reset();
    } catch (e) {
      this.formInvalid = e.message;
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
  // Only Numbers with Decimals
  keyPressNumbersDecimal(event, input) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else if (charCode === 46) {
      const meta = this.tokenTransfer ? this.tokenService.getAsset(this.tokenTransfer) : null;
      if (this[input].includes('.') ||
        (input === 'amount' && meta?.decimals === 0)) {
        event.preventDefault();
        return false;
      } else if (this[input].length === 0) {
        this[input] = '0' + this[input];
      }
    }
    return true;
  }
}
