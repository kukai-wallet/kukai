import { EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FullyPreparedTransaction, PartiallyPreparedTransaction, PrepareRequest } from '../interfaces';
import { TokenService } from '../../../services/token/token.service';
import { WalletService } from '../../../services/wallet/wallet.service';
import { EstimateService } from '../../../services/estimate/estimate.service';
import { OperationService } from '../../../services/operation/operation.service';
import { MessageService } from '../../../services/message/message.service';
import { CoordinatorService } from '../../../services/coordinator/coordinator.service';
import { LookupService } from '../../../services/lookup/lookup.service';
import { LedgerService } from '../../../services/ledger/ledger.service';
import { TranslateService } from '@ngx-translate/core';
import { KeyPair } from '../../../interfaces';
import { emitMicheline, assertMichelsonData } from '@taquito/michel-codec';
import Big from 'big.js';
import { LedgerWallet, TorusWallet, Account, ImplicitAccount, OriginatedAccount } from '../../../services/wallet/wallet';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';

@Component({
  selector: 'app-confirm-send',
  templateUrl: './confirm-send.component.html',
  styleUrls: ['../send.component.scss']
})
export class ConfirmSendComponent implements OnInit, OnChanges {
  @Input() confirmRequest: PrepareRequest = null;
  @Input() headlessMode: boolean;
  @Output() operationResponse = new EventEmitter();
  tokenTransfer = '';
  activeAccount = null;
  transactions: FullyPreparedTransaction[] = [];
  costPerByte: string = this.estimateService.costPerByte;

  customFee = '';

  parameters: any = null;
  batchParamIndex = 0;
  micheline: any = null;
  batchParameters: { num: number, parameters: any }[] = [];
  parametersFormat = 0;

  showFullBatch = false;
  modalOpen = false;
  sendResponse = null;
  ledgerError = '';
  password = '';
  pwdInvalid = '';
  advancedForm = false;
  constructor(
    private translate: TranslateService,
    public tokenService: TokenService,
    public walletService: WalletService,
    private estimateService: EstimateService,
    private operationService: OperationService,
    private messageService: MessageService,
    private coordinatorService: CoordinatorService,
    private lookupService: LookupService,
    private ledgerService: LedgerService,
    private inputValidationService: InputValidationService
  ) { }

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.confirmRequest?.currentValue && !changes.confirmRequest.previousValue) {
      this.tokenTransfer = changes.confirmRequest.currentValue.tokenTransfer;
      this.activeAccount = changes.confirmRequest.currentValue.account;
      this.transactions = changes.confirmRequest.currentValue.transactions;
      console.log('transactions', this.transactions);
      this.init();
    }
  }
  async init() {
    await this.openModal();
    await this.loadParameters();
    if (this.walletService.wallet instanceof LedgerWallet) {
      this.ledgerError = '?';
    }
  }
  async loadParameters() {
    if (this.transactions.length > 1) {
      for (const [i, op] of this.transactions.entries()) {
        if (op.parameters) {
          this.batchParameters.push({ num: i + 1, parameters: op.parameters });
          if (!this.parameters) {
            this.updateParameters(0, op.parameters);
          }
        }
      }
    } else if (this.transactions[0].parameters) {
      this.updateParameters(0, this.transactions[0].parameters);
    }
  }
  updateParameters(index: number, parameters: any) {
    this.batchParamIndex = index;
    this.parameters = parameters;
    this.parametersToMicheline();
  }
  parametersTextboxDisplay(): string {
    return !this.parametersFormat ?
      this.micheline.value :
      JSON.stringify(this.parameters.value, null, 2);
  }
  setParametersFormat(id: number) {
    this.parametersFormat = id;
  }
  beaconTokenTransfer(op: any) {
    if (op.parameters && this.tokenService.isKnownTokenContract(op.destination)) {
      return this.operationService.parseTokenTransfer(op);
    }
    return null;
  }
  parametersToMicheline() {
    if (this.parameters) {
      try {
        if (!this.parameters.value ||
          !this.parameters.entrypoint) {
          throw new Error('entrypoint and value expected');
        }
        assertMichelsonData(this.parameters.value);
        const res = emitMicheline(this.parameters.value, { indent: '  ', newline: '\n' });
        this.micheline = { entrypoint: this.parameters.entrypoint, value: res };
      } catch (e) {
        console.warn(e);
        this.micheline = null;
      }
    }
  }
  async openModal() {
    const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
    document.body.style.marginRight = scrollBarWidth.toString();
    document.body.style.overflow = 'hidden';
    this.modalOpen = true;
  }
  totalAmount(): string {
    let totalSent = Big(0);
    for (const tx of this.transactions) {
      totalSent = totalSent.add(tx.amount);
    }
    return totalSent.toFixed();
  }
  getTotalFee(): string {
    if (this.customFee) {
      return this.customFee;
    }
    let totalFee = Big(0);
    for (const tx of this.transactions) {
      totalFee = totalFee.add(tx.fee ? tx.fee : 0);
    }
    return totalFee.toFixed();
  }
  getTotalBurn(): number {
    let totalBurn = Big(0);
    for (const tx of this.transactions) {
      totalBurn = totalBurn.add(tx.storageLimit ? tx.storageLimit : 0);
    }
    totalBurn = totalBurn.mul(this.transactions.length).times(this.costPerByte).div(1000000).toFixed();
    return totalBurn;
  }
  async ledgerRetry() {
    if (!this.inputValidationService.fee(this.getTotalFee())) {
      this.messageService.addError('Invalid fee');
      return;
    }
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
      if (!this.inputValidationService.fee(this.getTotalFee())) {
        this.messageService.addError('Invalid fee');
        return;
      }
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
        this.pwdInvalid = '';
        this.messageService.startSpinner('Sending transaction...');
        this.sendTransaction(keys);
        this.closeModal();
      } else {
        this.messageService.stopSpinner();
        if (this.walletService.wallet instanceof TorusWallet) {
          this.pwdInvalid = `Authorization failed`;
        } else {
          this.pwdInvalid = this.translate.instant('SENDCOMPONENT.WRONGPASSWORD');  // 'Wrong password!';
        }
      }
    }
  }
  async sendTransaction(keys: KeyPair) {
    this.operationService.transfer(this.activeAccount.address, this.transactions, Number(this.getTotalFee()), keys, this.tokenTransfer).subscribe(
      async (ans: any) => {
        this.sendResponse = ans;
        if (ans.success === true) {
          console.log('Transaction successful ', ans);
          if (ans.payload.opHash) {
            this.operationResponse.emit(ans.payload.opHash);
            this.messageService.stopSpinner();
            const metadata = { transactions: this.transactions, opHash: ans.payload.opHash, tokenTransfer: this.tokenTransfer };
            await this.coordinatorService.boost(this.activeAccount.address, metadata);
            if (this.transactions[0].meta) {
              this.torusNotification(this.transactions[0]);
            }
            for (const transaction of this.transactions) {
              if (this.walletService.addressExists(transaction.destination)) {
                await this.coordinatorService.boost(transaction.destination);
              }
            }
          } else if (this.walletService.wallet instanceof LedgerWallet) {
            await this.requestLedgerSignature();
            return;
          }
        } else {
          this.messageService.stopSpinner();
          console.log('Transaction error id ', ans.payload.msg);
          this.messageService.addError(ans.payload.msg, 0);
          this.operationResponse.emit('broadcast_error');
        }
        this.reset();
      },
      err => {
        this.messageService.stopSpinner();
        console.log('Error Message ', JSON.stringify(err));
        if (this.walletService.isLedgerWallet()) {
          this.messageService.addError('Failed to create transaction', 0);
          this.operationResponse.emit('broadcast_error');
        }
        this.reset();
      },
    );
  }
  async requestLedgerSignature() {
    if (this.walletService.wallet instanceof LedgerWallet) {
      await this.messageService.startSpinner('Waiting for Ledger signature...');
      try {
        const op = this.sendResponse.payload.unsignedOperation;
        let signature = '';
        if (op.length <= 2290) {
          signature = await this.ledgerService.signOperation('03' + op, this.walletService.wallet.implicitAccounts[0].derivationPath);
        } else {
          signature = await this.ledgerService.signHash(this.operationService.ledgerPreHash('03' + op), this.walletService.wallet.implicitAccounts[0].derivationPath);
        }
        if (signature) {
          const signedOp = op + signature;
          this.sendResponse.payload.signedOperation = signedOp;
          this.ledgerError = '';
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
      (async (ans: any) => {
        this.sendResponse = ans;
        if (ans.success && this.activeAccount) {
          const metadata = { transactions: this.transactions, opHash: ans.payload.opHash, tokenTransfer: this.tokenTransfer };
          if (this.transactions[0].meta) {
            this.torusNotification(this.transactions[0]);
          }
          await this.coordinatorService.boost(this.activeAccount.address, metadata);
          if (this.walletService.addressExists(this.transactions[0].destination)) {
            await this.coordinatorService.boost(this.transactions[0].destination);
          }
          this.operationResponse.emit(ans.payload.opHash);
        } else {
          console.log('sendResponse', JSON.stringify(this.sendResponse));
          this.operationResponse.emit('broadcast_error');
        }
        console.log('ans: ' + JSON.stringify(ans));
        this.reset();
      })
    );
  }
  async torusNotification(transaction: FullyPreparedTransaction) {
    if (transaction.meta) {
      const amount = this.tokenService.formatAmount(this.tokenTransfer, transaction.amount.toString(), false);
      if (transaction.meta.verifier === 'google') {
        this.messageService.emailNotify(transaction.meta.alias, amount);
        this.lookupService.add(transaction.destination, transaction.meta.alias, 2);
      } else if (transaction.meta.verifier === 'reddit') {
        this.messageService.redditNotify(transaction.meta.alias, amount);
        this.lookupService.add(transaction.destination, transaction.meta.alias, 3);
      } else if (transaction.meta.verifier === 'twitter') {
        this.messageService.twitterNotify(transaction.meta.twitterId, transaction.meta.alias, amount);
        this.lookupService.add(transaction.destination, transaction.meta.alias, 4);
      }
    }
  }
  previewAttention(): string {
    if (this.transactions[0]?.meta?.verifier) {
      if (!this.tokenTransfer && new Big(this.totalAmount()).gt('50')) {
        let recipientKind = '';
        switch (this.transactions[0].meta.verifier) {
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
  closeModalAction() {
    this.closeModal();
    this.operationResponse.emit(null);
  }
  closeModal() {
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    console.log('close');
    this.modalOpen = false;
  }
  reset() {
    console.log('reset');
    this.confirmRequest = null;
    this.tokenTransfer = '';
    this.transactions = [];
    this.activeAccount = null;

    this.parameters = null;
    this.batchParamIndex = 0;
    this.micheline = null;
    this.batchParameters = [];
    this.parametersFormat = 0;

    this.showFullBatch = false;
    this.modalOpen = false;
    this.sendResponse = null;
    this.ledgerError = '';
    this.password = '';
    this.pwdInvalid = '';
    this.advancedForm = false;
    this.customFee = '';
  }
}
