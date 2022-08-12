import { EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ConfirmSwapRequest, FullyPreparedTransaction, PrepareRequest, LqdEntrypoints, PartiallyPreparedTransaction } from '../../misc/send/interfaces';
import { TokenService } from '../../../services/token/token.service';
import { WalletService } from '../../../services/wallet/wallet.service';
import { EstimateService } from '../../../services/estimate/estimate.service';
import { OperationService } from '../../../services/operation/operation.service';
import { MessageService } from '../../../services/message/message.service';
import { CoordinatorService } from '../../../services/coordinator/coordinator.service';
import { LookupService } from '../../../services/lookup/lookup.service';
import { LedgerService } from '../../../services/ledger/ledger.service';
import { TranslateService } from '@ngx-translate/core';
import { DefaultTransactionParams, KeyPair } from '../../../interfaces';
import Big from 'big.js';
import { LedgerWallet, TorusWallet } from '../../../services/wallet/wallet';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';
import { ModalComponent } from '../modal.component';
import { Subscription } from 'rxjs';
import { TezosDomainsService } from '../../../services/tezos-domains/tezos-domains.service';
import { TokenBalancesService } from '../../../services/token-balances/token-balances.service';
import { SubjectService } from '../../../services/subject/subject.service';
import { Amount } from '../../../services/swap-liquidity/classes/Amount';
import assert from 'assert';
import { SwapLiquidityService } from '../../../services/swap-liquidity/swap-liquidity.service';

const zeroTxParams: DefaultTransactionParams = {
  gas: 0,
  storage: 0,
  fee: 0,
  burn: 0
};

@Component({
  selector: 'app-swap-liquidity-confirm',
  templateUrl: './swap-liquidity-confirm.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class SwapLiquidityConfirmComponent extends ModalComponent implements OnInit, OnChanges, OnDestroy {
  readonly lqdTokenContract = 'KT1AafHA1C1vk959wvHWBispY9Y2f3fxBUUo';
  readonly lqdContract = 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5';
  readonly tzBTCContract = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';

  @Input() confirmRequest: PrepareRequest = null;
  @Output() operationResponse = new EventEmitter();
  syncSub: Subscription;
  activeAccount = null;
  externalReq: boolean = false;
  transactions: FullyPreparedTransaction[] = [];
  semaphore = false;

  defaultTransactionParams: DefaultTransactionParams = zeroTxParams;

  customFee = '';
  customGasLimit = '';
  customStorageLimit = '';

  sendResponse = null;
  ledgerError = '';
  password = '';
  pwdInvalid = '';
  advancedForm = false;
  name = 'swap-liquidity-confirm';

  expectedLqd: number;
  minimumLqd: number;
  expectedXtz: number;
  minimumXtz: number;
  expectedToken: number;
  minimumToken: number;
  entrypoint: string;

  confirmTitle = '';

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
    private swapLiquidityService: SwapLiquidityService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.confirmRequest?.currentValue) {
      this.reset(true);
      this.parseTransactions(changes.confirmRequest.currentValue);
      this.init();
      ModalComponent.currentModel.next({ name: this.name, data: null });
      if (this.externalReq) {
        this.syncSub = this.subjectService.beaconResponse.subscribe((response) => {
          if (response) {
            this.closeModalAction('silent');
          }
        });
      }
    }
  }
  parseTransactions(csr: ConfirmSwapRequest): void {
    let hasTrailingZeroApproval = false;
    this.externalReq = csr.externalReq;
    this.activeAccount = csr.account;
    this.transactions = csr.transactions;
    this.entrypoint = this.transactions.find((t) => Object.values(LqdEntrypoints).includes(t?.parameters?.entrypoint))?.parameters.entrypoint;
    switch (this.entrypoint) {
      case LqdEntrypoints.xtzToToken:
        this.confirmTitle = 'Confirm Swap';
        this.expectedXtz = parseFloat(this.transactions[0]?.amount);
        this.minimumToken = new Amount({ rpcAmount: this.transactions[0]?.parameters.value.args[1].args[0].int, decimalPlaces: 8 }).internalNormalised;
        this.calculateXtzToToken();
        break;
      case LqdEntrypoints.tokenToXtz:
        this.confirmTitle = 'Confirm Swap';
        const tokenToXtz = this.transactions.find((t) => t?.parameters?.entrypoint === LqdEntrypoints.tokenToXtz);
        hasTrailingZeroApproval =
          this.transactions[this.transactions.length - 1].parameters.entrypoint === 'approve' &&
          this.transactions[this.transactions.length - 1]?.parameters?.value.args[1].int === '0';
        this.expectedToken = new Amount({ rpcAmount: tokenToXtz?.parameters.value.args[1].args[0].int, decimalPlaces: 8 }).internalNormalised;
        this.minimumXtz = new Amount({ rpcAmount: tokenToXtz?.parameters.value.args[1].args[1].args[0].int, decimalPlaces: 6 }).internalNormalised;
        this.calculateTokenToXTZ();
        break;
      case LqdEntrypoints.addLiquidity:
        this.confirmTitle = 'Add Liquidity';
        const addLiquidity = this.transactions.find((t) => t?.parameters?.entrypoint === LqdEntrypoints.addLiquidity);
        hasTrailingZeroApproval =
          this.transactions[this.transactions.length - 1].parameters.entrypoint === 'approve' &&
          this.transactions[this.transactions.length - 1]?.parameters?.value.args[1].int === '0';
        this.expectedToken = new Amount({ rpcAmount: addLiquidity?.parameters.value.args[1].args[1].args[0].int, decimalPlaces: 8 }).internalNormalised;
        this.expectedXtz = parseFloat(addLiquidity?.amount);
        this.minimumLqd = new Amount({ rpcAmount: addLiquidity?.parameters.value.args[1].args[0].int, decimalPlaces: 0 }).internalNormalised;
        this.calcAddLiquidity();
        break;
      case LqdEntrypoints.removeLiquidity:
        this.confirmTitle = 'Remove Liquidity';
        this.expectedLqd = new Amount({ rpcAmount: this.transactions[0]?.parameters.value.args[1].args[0].int, decimalPlaces: 0 }).internalNormalised;
        this.minimumXtz = new Amount({ rpcAmount: this.transactions[0]?.parameters.value.args[1].args[1].args[0].int, decimalPlaces: 6 }).internalNormalised;
        this.minimumToken = new Amount({
          rpcAmount: this.transactions[0]?.parameters.value.args[1].args[1].args[1].args[0].int,
          decimalPlaces: 8
        }).internalNormalised;
        this.calcRemoveLiquidity();
        break;
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  open(): void {
    super.open();
  }
  async init(): Promise<void> {
    if (this.walletService.wallet instanceof LedgerWallet) {
      this.ledgerError = '?';
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
    const totalActiveStorageLimit: number =
      this.customStorageLimit !== '' && Number(this.customStorageLimit) ? Number(this.customStorageLimit) : this.getTotalDefaultStorage();
    return Number(Big(totalActiveStorageLimit).times(this.estimateService.costPerByte).div(1000000).toString());
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
  totalAmount(): string {
    let totalSent = Big(0);
    for (const tx of this.transactions) {
      totalSent = totalSent.add(tx.amount);
    }
    return totalSent.toFixed();
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
    if (this.semaphore) {
      return;
    }
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
      this.operationService.transfer(this.activeAccount.address, txs, Number(this.getTotalFee()), keys, '').subscribe(
        async (ans: any) => {
          this.sendResponse = ans;
          if (ans.success === true) {
            console.log('Transaction successful ', ans);
            if (ans.payload.opHash) {
              await this.messageService.stopSpinner();
              this.operationResponse.emit(ans.payload.opHash);
              const metadata = {
                transactions: this.transactions,
                opHash: ans.payload.opHash
              };
              await this.coordinatorService.boost(this.activeAccount.address, metadata);
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
  sanitizeNumberInput(e, decimalPlaces: number, type = ''): void {
    const exp = new RegExp(`^\\d{0,}(\\.\\d{0,${decimalPlaces}})?\$`, 'g');
    if (exp.test(e?.target?.value)) {
      this[type] = e?.target?.value;
    } else {
      e.target.value = this[type];
    }
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
            opHash: ans.payload.opHash
          };
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
    this.transactions = [];
    this.activeAccount = null;

    this.customFee = '';
    this.customGasLimit = '';
    this.customStorageLimit = '';

    this.sendResponse = null;
    this.ledgerError = '';
    this.password = '';
    this.pwdInvalid = '';
    this.advancedForm = false;
    this.externalReq = false;

    this.expectedLqd = undefined;
    this.minimumLqd = undefined;
    this.expectedXtz = undefined;
    this.minimumXtz = undefined;
    this.expectedToken = undefined;
    this.minimumToken = undefined;
  }
  openInfoModal(title: string): void {
    switch (title) {
      case 'fee':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'Expected fee for this transaction charged by the Tezos blockchain.',
            title: 'Fee'
          },
          forceClose: false
        });
        break;
      case 'minimumxtz':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The minimum amount of XTZ to be received from the transaction.',
            title: 'Minimum XTZ'
          },
          forceClose: false
        });
        break;
      case 'expectedxtz':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The expected amount of XTZ to be received from the transaction.',
            title: 'Expected XTZ'
          },
          forceClose: false
        });
        break;
      case 'requiredtoken':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'Required tzBTC needed for transaction.',
            title: 'Required tzBTC'
          },
          forceClose: false
        });
        break;
      case 'minimumtoken':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The minimum amount of tzBTC to be received from the transaction.',
            title: 'Minimum tzBTC'
          },
          forceClose: false
        });
        break;
      case 'expectedtoken':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The expected amount of tzBTC to be received from the transaction.',
            title: 'Expected tzBTC'
          },
          forceClose: false
        });
        break;
      case 'minimumlqt':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The minimum amount of SIRS to be received from the transaction.',
            title: 'Minimum SIRS'
          },
          forceClose: false
        });
        break;
      case 'expectedlqt':
        ModalComponent.currentModel.next({
          name: 'info',
          data: {
            message: 'The expected amount of SIRS to be received from the transaction.',
            title: 'Expected SIRS'
          },
          forceClose: false
        });
        break;
      default:
        break;
    }
  }
  async calculateXtzToToken(): Promise<void> {
    this.semaphore = true;
    const xtzToSell = new Amount({
      normalisedAmount: this.expectedXtz,
      decimalPlaces: 6
    });
    await this.swapLiquidityService.fetchStorage(this.lqdContract);
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateXtzToToken(xtzToSell, xtzPool, tokenPool, 0.005, this.swapLiquidityService.settings('liquidityBaking'));
    this.expectedToken = result.expected?.internalNormalised.toFixed(result.expected?.decimalPlaces).toString();
    this.semaphore = false;
  }
  async calculateTokenToXTZ(): Promise<void> {
    this.semaphore = true;
    const tokenToSell = new Amount({
      normalisedAmount: this.expectedToken,
      decimalPlaces: 8
    });
    await this.swapLiquidityService.fetchStorage(this.lqdContract);
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateTokenToXTZ(tokenToSell, xtzPool, tokenPool, 0.005, this.swapLiquidityService.settings('liquidityBaking'));
    this.expectedXtz = result.expected?.internalNormalised.toFixed(result.expected?.decimalPlaces).toString();
    this.semaphore = false;
  }
  async calcAddLiquidity(): Promise<void> {
    this.semaphore = true;
    const toSell = new Amount({
      normalisedAmount: this.expectedXtz,
      decimalPlaces: 6
    });
    await this.swapLiquidityService.fetchStorage(this.lqdContract);
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateAddLiquidityXTZ(
      toSell,
      xtzPool,
      tokenPool,
      parseFloat(this.swapLiquidityService.storage[this.lqdContract]?.total_pool),
      0.005,
      this.swapLiquidityService.settings('liquidityBaking')
    );
    this.expectedLqd = result.liquidityExpected?.internalNormalised.toFixed(result.liquidityExpected?.decimalPlaces).toString();
    this.semaphore = false;
  }
  async calcRemoveLiquidity(): Promise<void> {
    this.semaphore = true;
    const lqtToBurn = new Amount({
      normalisedAmount: this.expectedLqd,
      decimalPlaces: 0
    });
    await this.swapLiquidityService.fetchStorage(this.lqdContract);
    const { xtzPool, tokenPool } = this.swapLiquidityService.createPoolAmounts();
    const result = this.swapLiquidityService.calculateRemoveLiquidity(
      lqtToBurn,
      xtzPool,
      tokenPool,
      parseFloat(this.swapLiquidityService.storage[this.lqdContract]?.total_pool),
      0.005,
      this.swapLiquidityService.settings('liquidityBaking')
    );
    this.expectedXtz = result.xtzExpected?.internalNormalised.toFixed(result.xtzExpected?.decimalPlaces).toString();
    this.expectedToken = result.tokenExpected?.internalNormalised.toFixed(result.tokenExpected?.decimalPlaces).toString();
    this.semaphore = false;
  }
}
