import { EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FullyPreparedTransaction, PrepareRequest } from '../../../misc/send/interfaces';
import { TokenService } from '../../../../services/token/token.service';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { EstimateService } from '../../../../services/estimate/estimate.service';
import { OperationService } from '../../../../services/operation/operation.service';
import { MessageService } from '../../../../services/message/message.service';
import { CoordinatorService } from '../../../../services/coordinator/coordinator.service';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { LedgerService } from '../../../../services/ledger/ledger.service';
import { TranslateService } from '@ngx-translate/core';
import { KeyPair } from '../../../../interfaces';
import { emitMicheline, assertMichelsonData } from '@taquito/michel-codec';
import Big from 'big.js';
import { LedgerWallet, TorusWallet } from '../../../../services/wallet/wallet';
import { InputValidationService } from '../../../../services/input-validation/input-validation.service';
import { ModalComponent } from '../../modal.component';
import { Subscription } from 'rxjs';
import { TezosDomainsService } from '../../../../services/tezos-domains/tezos-domains.service';
import { TokenBalancesService } from '../../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { Schema } from '@taquito/michelson-encoder';
import { TzktService } from '../../../../services/indexer/tzkt/tzkt.service';
@Component({
  selector: 'app-confirm-send',
  templateUrl: './send-confirmation.component.html',
  styleUrls: ['../../../../../scss/components/modals/modal.scss']
})
export class ConfirmSendComponent extends ModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() confirmRequest: PrepareRequest = null;
  @Output() operationResponse = new EventEmitter();
  syncSub: Subscription;
  tokenTransfer = '';
  activeAccount = null;
  externalReq: boolean = false;
  transactions: FullyPreparedTransaction[] = [];
  costPerByte: string = this.estimateService.costPerByte;

  customGasLimit = '';
  customStorageLimit = '';

  schema = undefined;
  parameters: any = null;
  batchParamIndex = 0;
  micheline: any = null;
  batchParameters: { num: number; parameters: any }[] = [];
  parametersFormat = 0;
  parametersDisplay = '';
  transformedParameters = [];
  executedSchema = [];
  extractedSchema = [];
  showAll = 10;

  showFullBatch = false;
  sendResponse = null;
  ledgerError = '';
  password = '';
  pwdInvalid = '';
  advancedForm = false;
  name = 'confirm-send';
  token = null;
  domain = undefined;

  private subscriptions: Subscription = new Subscription();

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
    private inputValidationService: InputValidationService,
    public tezosDomainService: TezosDomainsService,
    public tokenBalanceService: TokenBalancesService,
    private subjectService: SubjectService,
    private tzktService: TzktService
  ) {
    super();
  }

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.confirmRequest?.currentValue) {
      this.reset(true);
      this.externalReq = changes.confirmRequest.currentValue.externalReq;
      this.tokenTransfer = changes.confirmRequest.currentValue.tokenTransfer;
      this.activeAccount = changes.confirmRequest.currentValue.account;
      this.tezosDomainService.getDomainFromAddress(this.activeAccount?.address).then((domain) => {
        this.domain = domain;
      });
      this.transactions = changes.confirmRequest.currentValue.transactions;
      this.token = this.tokenService.getAsset(this.tokenTransfer);
      console.log('transactions', this.transactions);
      if (this.externalReq) {
        ModalComponent.currentModel.next({
          name: this.name,
          data: null
        });
      }
      this.init();
      if (this.externalReq) {
        this.syncSub = this.subjectService.beaconResponse.subscribe((response) => {
          this.closeModalAction(response ? 'silent' : '');
        });
      }
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  open(data: any): void {
    this.customGasLimit = data?.customGasLimit;
    this.customStorageLimit = data?.customStorageLimit;
    super.open();
  }
  async init(): Promise<void> {
    await this.loadParameters();
    if (this.walletService.wallet instanceof LedgerWallet) {
      this.ledgerError = '?';
    }
  }
  async loadParameters(): Promise<void> {
    if (this.transactions.length > 1) {
      for (const [i, op] of this.transactions.entries()) {
        if (op.parameters) {
          this.batchParameters.push({
            num: i + 1,
            parameters: op.parameters
          });
          if (!this.parameters) {
            this.updateParameters(i, op.parameters);
          }
        }
      }
    } else if (this.transactions[0].parameters) {
      this.updateParameters(0, this.transactions[0].parameters);
    }
  }
  async updateParameters(index: number, parameters: any): Promise<void> {
    if (!parameters) {
      return;
    }
    this.batchParamIndex = index;
    this.parameters = parameters;
    this.parametersToMicheline();
    this.executedSchema = undefined;
    this.extractedSchema = undefined;
    try {
      const sc = await this.tzktService.getEntrypointMicheline(this.transactions[this.batchParamIndex]?.destination, this.parameters?.entrypoint);
      this.schema = new Schema(sc);
      this.executedSchema = this.schema.Execute(this.parameters.value);
      this.extractedSchema = this.schema.generateSchema();
      this.transformedParameters = this.parametersToTabular(this.executedSchema, this.extractedSchema);
      this.parametersFormat = 1;
    } catch (e) {
      this.transformedParameters = [{ children: [], key: 'Error', val: 'Failed to fetch annotations!' }];
    }
  }
  setParametersFormat(id: number): void {
    this.parametersFormat = id;
  }
  beaconTokenTransfer(op: any): null | { tokenId: string; to: string; amount: string } {
    if (op.parameters && this.tokenService.isKnownTokenContract(op.destination)) {
      return this.operationService.parseTokenTransfer(op);
    }
    return null;
  }
  parametersToMicheline(): void {
    if (this.parameters) {
      try {
        if (!this.parameters.value || !this.parameters.entrypoint) {
          throw new Error('entrypoint and value expected');
        }
        assertMichelsonData(this.parameters.value);
        const res = emitMicheline(this.parameters.value, {
          indent: '  ',
          newline: '\n'
        });
        this.micheline = {
          entrypoint: this.parameters.entrypoint,
          value: res
        };
      } catch (e) {
        console.warn(e);
        this.micheline = null;
      }
    }
  }

  parametersToTabular(parameters, types) {
    const hexToUTF8 = (str: string) => {
      let b = [];
      for (let i = 0; i < str.length / 2; i++) {
        const c = parseInt(str.charAt(i * 2) + str.charAt(i * 2 + 1), 16);
        b.push(c);
      }
      return Buffer.from(b).toString('utf-8');
    };
    const traverse = (key, val, level, types) => {
      const isMap = (val, level) => {
        let arr = [];
        let valueMap = Object.fromEntries(val.valueMap);
        for (const key of Object.keys(valueMap)) {
          arr.push(traverse(key, valueMap[key], level + 1, types.schema[key]));
        }
        return arr;
      };

      const isObject = (key, val, level) => {
        let arr = [];
        const entries = Object.entries(val);
        for (const [key, value] of entries) {
          if (
            (typeof value === 'object' && (value as any)?.c == undefined && (value as any)?.e === undefined && (value as any)?.s === undefined) ||
            ((value as any)?.length > 0 && typeof value !== 'string')
          ) {
            arr.push({ key, children: traverse(key, value, level + 1, types.schema[key]) });
          } else {
            arr.push(traverse(key, value, level + 1, types.schema[key]));
          }
        }
        return arr;
      };

      const isArray = (key, val, level) => {
        if (val.length === 1) {
          return traverse(key, val[0], level + 1, types.schema);
        }
        const arr = [];
        for (let i = 0; i < val.length; ++i) {
          if (
            (typeof val[i] === 'object' && val[i]?.c === undefined && val[i]?.e === undefined && val[i]?.s === undefined) ||
            ((val[i] as any)?.length > 0 && typeof val[i] !== 'string')
          ) {
            if (key) {
              arr.push({ key, children: traverse(key, val[i], level + 1, types.schema) });
            } else {
              arr.push(...traverse(key, val[i], level + 1, types.schema));
            }
          } else {
            arr.push(traverse(key, val[i], level + 1, types.schema));
          }
        }
        return arr;
      };
      if (typeof val === 'string') {
        return { key, val: types.__michelsonType === 'bytes' ? hexToUTF8(val) : val, children: [] };
      } else if (val && typeof val === 'object' && val?.c !== undefined && val?.e !== undefined && val?.s !== undefined) {
        return { key, val: Big(val).toString(), children: [] };
      } else if (val && val?.valueMap !== undefined && val?.keyMap !== undefined && val?.keySchema !== undefined) {
        return isMap(val, level);
      } else if (!!val?.length && typeof val !== 'string') {
        return isArray(key, val, level);
      } else if (val && typeof val === 'object') {
        return isObject(key, val, level);
      } else if (typeof val === 'number') {
        return { key, val, children: [] };
      } else if (typeof val === 'symbol') {
        return { key, val: val.valueOf(), children: [] };
      } else {
        return { key, val: null, children: [] };
      }
    };
    let result = traverse(null, parameters, 0, types);
    if (result?.length === undefined) {
      result = [result];
    }
    return result;
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
  getTotalFee(): string {
    let totalFee = Big(0);
    for (const tx of this.transactions) {
      totalFee = totalFee.add(tx.fee ? tx.fee : 0);
    }
    return totalFee.toFixed();
  }
  getTotalBurn(): number {
    const totalActiveStorageLimit: number =
      this.customStorageLimit !== '' && Number(this.customStorageLimit) ? Number(this.customStorageLimit) : this.getTotalDefaultStorage();
    return Number(Big(totalActiveStorageLimit).times(this.costPerByte).div(1000000).toString());
  }
  getTotalDefaultGas(): number {
    let totalGas = Big(0);
    for (const tx of this.transactions) {
      totalGas = totalGas.plus(tx.gasLimit);
    }
    return totalGas.toFixed();
  }
  getTotalDefaultStorage(): number {
    let totalStorage = Big(0);
    for (const tx of this.transactions) {
      totalStorage = totalStorage.plus(tx.storageLimit);
    }
    return totalStorage.toFixed();
  }
  getQuantity(amount): number {
    return Big(amount)
      .div(10 ** (false ? this.token.decimals : 0))
      .toFixed();
  }
  totalAmount(): string {
    let totalSent = Big(0);
    for (const tx of this.transactions) {
      totalSent = totalSent.add(tx.amount);
    }
    return totalSent.toFixed();
  }
  formatAmount(token, amount: string, baseUnit = true): string {
    if (!token) {
      return `${Big(amount)
        .div(10 ** (baseUnit ? 6 : 0))
        .toFixed()} tez`;
    } else {
      if (token) {
        if (this.tokenBalanceService.isNFT(token)) {
          return `${token.name}`;
        } else {
          return `${Big(amount)
            .div(10 ** (baseUnit ? token.decimals : 0))
            .toFixed()} ${token.symbol}`;
        }
      } else {
        return '[Unknown token]';
      }
    }
  }
  async ledgerRetry(): Promise<void> {
    if (!this.inputValidationService.fee(this.getTotalFee().toString())) {
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
  async inject(): Promise<void> {
    if (this.walletService.isLedgerWallet()) {
      await this.broadCastLedgerTransaction();
      this.sendResponse = null;
      ModalComponent.currentModel.next({ name: '', data: null });
    } else {
      if (!this.inputValidationService.fee(this.getTotalFee().toString())) {
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
        await this.sendTransaction(keys);
        ModalComponent.currentModel.next({ name: '', data: null });
      } else {
        this.messageService.stopSpinner();
        if (this.walletService.wallet instanceof TorusWallet) {
          this.pwdInvalid = `Authorization failed`;
        } else {
          this.pwdInvalid = this.translate.instant('SENDCOMPONENT.WRONGPASSWORD'); // 'Wrong password!';
        }
      }
    }
  }
  async sendTransaction(keys: KeyPair): Promise<void> {
    const txs: FullyPreparedTransaction[] = this.opsWithCustomLimits();
    this.subscriptions.add(
      this.operationService.transfer(this.activeAccount.address, txs, Number(this.getTotalFee()), keys, this.tokenTransfer).subscribe(
        async (ans: any) => {
          this.sendResponse = ans;
          if (ans.success === true) {
            console.log('Transaction successful ', ans);
            if (ans.payload.opHash) {
              await this.messageService.stopSpinner();
              this.operationResponse.emit(ans.payload.opHash);
              const metadata = {
                transactions: this.transactions,
                opHash: ans.payload.opHash,
                tokenTransfer: this.tokenTransfer
              };
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
            await this.messageService.stopSpinner();
            console.log('Transaction error id ', ans.payload.msg);
            this.messageService.addError(ans.payload.msg, 0);
            this.operationResponse.emit('broadcast_error');
          }
          this.reset();
        },
        (err) => {
          this.messageService.stopSpinner();
          console.log('Error Message ', JSON.stringify(err));
          if (this.walletService.isLedgerWallet()) {
            this.messageService.addError('Failed to create transaction', 0);
            this.operationResponse.emit('broadcast_error');
          }
          this.reset();
        }
      )
    );
  }
  opsWithCustomLimits(): FullyPreparedTransaction[] {
    let extraGas: number = 0;
    let extraStorage: number = 0;
    if (this.customGasLimit && this.customGasLimit !== this.getTotalDefaultGas().toString()) {
      extraGas = Number(this.customGasLimit) - this.getTotalDefaultGas();
    }
    if (this.customStorageLimit && this.customStorageLimit !== this.getTotalDefaultStorage().toString()) {
      extraStorage = Number(this.customStorageLimit) - this.getTotalDefaultStorage();
    }
    const extraGasPerOp: number = Math.round(extraGas / this.transactions.length);
    const extraStoragePerOp: number = Math.round(extraStorage / this.transactions.length);
    const txs: FullyPreparedTransaction[] = [];
    for (let i = 0; i < this.transactions.length; i++) {
      let gasLimit: string = extraGas ? (Number(this.transactions[i].gasLimit) + extraGasPerOp).toString() : this.transactions[i].gasLimit.toString();
      let storageLimit = extraStorage
        ? (Number(this.transactions[i].storageLimit) + extraStoragePerOp).toString()
        : this.transactions[i].storageLimit.toString();
      gasLimit = !(Number(gasLimit) < 0) ? gasLimit : '0';
      storageLimit = !(Number(storageLimit) < 0) ? storageLimit : '0';
      const fullyTx: FullyPreparedTransaction = {
        ...this.transactions[i],
        fee: i === this.transactions.length - 1 ? this.getTotalFee().toString() : '0',
        gasLimit,
        storageLimit
      };
      txs.push(fullyTx);
    }
    return txs;
  }
  async requestLedgerSignature(): Promise<void> {
    if (this.walletService.wallet instanceof LedgerWallet) {
      await this.messageService.startSpinner('Waiting for Ledger signature...');
      try {
        const op = this.sendResponse.payload.unsignedOperation;
        let signature = '';
        if (op.length <= 2290) {
          signature = await this.ledgerService.signOperation('03' + op, this.walletService.wallet.implicitAccounts[0].derivationPath);
        } else {
          signature = await this.ledgerService.signHash(
            this.operationService.ledgerPreHash('03' + op),
            this.walletService.wallet.implicitAccounts[0].derivationPath
          );
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
  async broadCastLedgerTransaction(): Promise<void> {
    this.subscriptions.add(
      this.operationService.broadcast(this.sendResponse.payload.signedOperation).subscribe(async (ans: any) => {
        this.sendResponse = ans;
        if (ans.success && this.activeAccount) {
          const metadata = {
            transactions: this.transactions,
            opHash: ans.payload.opHash,
            tokenTransfer: this.tokenTransfer
          };
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
  async torusNotification(transaction: FullyPreparedTransaction): Promise<void> {
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
  getUsername(): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.displayName();
    } else if (this.activeAccount) {
      const party = this.lookupService.resolve({
        address: this.activeAccount.address
      });
      if (party?.name) {
        return party.name;
      }
    }
    return '';
  }
  getVerifier(): string {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.verifier;
    } else {
      return 'domain';
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
  sanitizeNumberInput(e, type = ''): void {
    console.dir(this.token?.decimals, e.target);
    if (['gas', 'storage'].includes(type) || (type === 'amount' && this.token?.decimals == 0)) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    } else {
      e.target.value = e.target.value.replace(/[^0-9\.]/g, '');
      if ((e.target.value.match(/\./g) || []).length > 1) {
        const tmp = e.target.value.split('');
        tmp.splice(tmp.lastIndexOf('.'), 1);
        e.target.value = tmp.join('');
      }
      if (e.target.value.charAt(0) === '.') {
        e.target.value = '0' + e.target.value;
      }
    }
  }
  closeModalAction(emit: string = null): void {
    ModalComponent.currentModel.next({ name: '', data: null });
    this.operationResponse.emit(emit);
    this.reset();
  }
  reset(init = false): void {
    if (!init) {
      this.confirmRequest = null;
      if (this.syncSub) {
        this.syncSub.unsubscribe();
        this.syncSub = undefined;
      }
    }
    this.tokenTransfer = '';
    this.transactions = [];
    this.activeAccount = null;

    this.customGasLimit = '';
    this.customStorageLimit = '';

    this.token = null;
    this.domain = undefined;

    this.parameters = null;
    this.batchParamIndex = 0;
    this.micheline = null;
    this.batchParameters = [];
    this.parametersFormat = 0;
    this.transformedParameters = [];
    this.executedSchema = [];
    this.schema = undefined;

    this.showFullBatch = false;
    this.sendResponse = null;
    this.ledgerError = '';
    this.password = '';
    this.pwdInvalid = '';
    this.advancedForm = false;
    this.externalReq = false;
  }
  counter(i: number) {
    return new Array(i);
  }

  toggleTab(e) {
    let elem = e.target;
    while (elem.tagName.toLowerCase() !== 'li') {
      elem = elem.parentElement;
    }
    elem.classList.toggle('expanded');
  }
}
