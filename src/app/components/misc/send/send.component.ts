import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Account, EmbeddedTorusWallet } from '../../../services/wallet/wallet';
import {
  PrepareRequest,
  ConfirmRequest,
  FullyPreparedTransaction,
  PartiallyPreparedTransaction,
  TemplateRequest,
  TemplateFee,
  ConfirmSwapRequest,
  LqdEntrypoints
} from './interfaces';
import { Template } from 'kukai-embed';
import { TokenService } from '../../../services/token/token.service';
import { EstimateService } from '../../../services/estimate/estimate.service';
import { MessageService } from '../../../services/message/message.service';
import { assertMichelsonData } from '@taquito/michel-codec';
import { OperationService } from '../../../services/operation/operation.service';
import Big from 'big.js';
import { WalletService } from '../../../services/wallet/wallet.service';
import { CoordinatorService } from '../../../services/coordinator/coordinator.service';
import { CONSTANTS } from '../../../../environments/environment';
import { SubjectService } from '../../../services/subject/subject.service';
import { Subscription } from 'rxjs';
import { ExternalRequest } from '../../../interfaces';
import { shouldHandleOperations } from '../../../libraries/beacon-type-check';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html'
})
export class SendComponent implements OnInit, OnChanges, OnDestroy {
  LqdEntrypoints = LqdEntrypoints;
  @Input() embedded: boolean;
  activeAccount: Account;
  @Input() tokenTransfer: string;
  @Input() externalRequest: ExternalRequest;
  @Input() template: Template;
  @Output() operationResponse = new EventEmitter();
  prepareRequest: PrepareRequest = null;
  confirmRequest: ConfirmRequest = null;
  templateRequest: TemplateRequest = null;
  confirmSwapLiquidityRequest: ConfirmSwapRequest = null;
  symbol: string;
  readonly thresholdUSD = 50;
  private subscriptions: Subscription = new Subscription();
  private swapLiquidityEntrypoints = ['addLiquidity', 'removeLiquidity', 'xtzToToken', 'tokenToXtz'];

  readonly lqdContract = 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5';
  readonly tzBTCContract = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';

  constructor(
    public tokenService: TokenService,
    private estimateService: EstimateService,
    private messageService: MessageService,
    private operationService: OperationService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.subjectService.prepareTokenTransfer.subscribe((t) => {
        this.prepareRequest = t;
        this.tokenTransfer = t?.tokenTransfer;
        this.activeAccount = t?.account;
        this.symbol = t?.symbol;
      })
    );
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.externalRequest?.currentValue) {
      this.activeAccount = changes.externalRequest.currentValue.selectedAccount;
      this.checkOpReq(changes.externalRequest.currentValue.operationRequest);
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  private async checkOpReq(opReq: any): Promise<void | {
    kind;
    destination;
    amount;
    parameters;
    gasRecommendation;
    storageRecommendation;
  }> {
    if (opReq.operationDetails) {
      opReq = opReq.operationDetails;
    }
    if (this.walletService.wallet instanceof EmbeddedTorusWallet && !this.walletService.wallet?.sk && this.template?.silent) {
      this.operationResponse.emit('invalid_parameters');
      return;
    }
    if (shouldHandleOperations(opReq, 'send')) {
      const txs: PartiallyPreparedTransaction[] = opReq.map((tx) => {
        if (tx.kind !== 'transaction') {
          throw new Error('Invalid op kind');
        }
        // identify token transfers
        return {
          kind: 'transaction',
          destination: tx.destination,
          amount: Big(tx.amount)
            .div(10 ** 6)
            .toFixed(), // handle token decimals here
          parameters: tx.parameters ? tx.parameters : undefined,
          gasRecommendation: tx.gas_limit ? tx.gas_limit : undefined,
          storageRecommendation: tx.storage_limit ? tx.storage_limit : undefined
        };
      });
      if (this.validParameters(txs)) {
        if (txs.length === 1 && !this.template) {
          const tokenTransferObj: any = this.getTokenTransferObj(txs[0]);
          if (tokenTransferObj) {
            const asset = this.tokenService.getAsset(tokenTransferObj.tokenId);
            txs[0].amount = Big(tokenTransferObj.amount)
              .div(10 ** asset.decimals)
              .toFixed();
            txs[0].destination = tokenTransferObj.to;
            this.tokenTransfer = tokenTransferObj.tokenId;
            delete txs[0].parameters;
          } else {
            this.tokenTransfer = '';
          }
          this.simulateRequest(txs, tokenTransferObj?.tokenId);
        } else {
          this.tokenTransfer = '';
          this.simulateRequest(txs, '');
        }
      } else {
        this.operationResponse.emit('invalid_parameters');
      }
    }
  }
  getTokenTransferObj(op: any): null | { tokenId: string; to: string; amount: string } {
    if (op.parameters && this.tokenService.isKnownTokenContract(op.destination)) {
      const tokenTransfer = this.operationService.parseTokenTransfer(op);
      if (tokenTransfer && this.tokenService.isKnownTokenId(tokenTransfer?.tokenId)) {
        return tokenTransfer;
      }
    }
    return null;
  }
  validParameters(txs: PartiallyPreparedTransaction[]): boolean {
    for (const tx of txs) {
      if (tx.parameters) {
        try {
          if (!tx.parameters.value || !tx.parameters.entrypoint) {
            throw new Error('entrypoint and value expected');
          }
          assertMichelsonData(tx.parameters.value);
        } catch (e) {
          this.messageService.addError(`Invalid parameters: ${e.message}`);
          return false;
        }
      }
    }
    return true;
  }
  async simulateRequest(
    txs: PartiallyPreparedTransaction[],
    tokenTransfer: string
  ): Promise<void | {
    tx: PartiallyPreparedTransaction;
    fee;
    gasLimit;
    storageLimit;
  }> {
    if (this.template) {
      if (this.template.silent) {
        console.log('Silent signing');
      } else {
        this.templateRequest = {
          template: this.template,
          partialOps: txs
        };
      }
    } else {
      await this.messageService.startSpinner('Preparing transaction...');
    }
    try {
      await this.estimateService.preLoadData(this.activeAccount.pkh, this.activeAccount.pk);
      const callback = (res) => {
        if (res) {
          if (res.error) {
            this.messageService.addError(`Simulation error: ${res.error.message}`, 0);
            this.operationResponse.emit({
              error: 'invalid_parameters',
              errorMessage: res.error.message
            });
          } else {
            const fullyPrepared: FullyPreparedTransaction[] = txs.map((tx, i) => {
              return {
                ...tx,
                fee: i === txs.length - 1 ? res.fee : '0',
                gasLimit: res.customLimits[i].gasLimit.toString(),
                storageLimit: res.customLimits[i].storageLimit.toString()
              };
            });
            if (this.template) {
              const fee = this.getTemplateFee(fullyPrepared);
              console.log('Use template', this.template);
              if (!this.template.silent) {
                this.templateRequest = {
                  template: this.template,
                  partialOps: txs,
                  ops: fullyPrepared,
                  fee
                };
              } else {
                let amount = Big(0);
                for (const op of fullyPrepared) {
                  amount = Big(op.amount).plus(amount);
                }
                amount = Big(fee.total).plus(amount);
                amount = amount.times(Big(CONSTANTS.MAINNET && this.walletService.wallet?.XTZrate ? this.walletService.wallet.XTZrate : 1));
                if (amount.gt(Big(this.thresholdUSD))) {
                  this.operationResponse.emit('exceeded_threshold');
                } else {
                  this.silentInject(fullyPrepared);
                }
              }
            } else {
              this.confirmTransactions(fullyPrepared, true);
            }
          }
        } else {
          throw new Error('No simulation result');
        }
      };
      await this.estimateService.estimateTransactions(JSON.parse(JSON.stringify(txs)), this.activeAccount.pkh, tokenTransfer, callback);
    } catch (e) {
      console.error(e);
      this.operationResponse.emit('unknown_error');
    } finally {
      await this.messageService.stopSpinner();
    }
  }
  prepareTransaction(): void {
    this.prepareRequest = {
      account: this.activeAccount,
      tokenTransfer: this.tokenTransfer,
      symbol: this.symbol
    };
  }
  confirmTransactions(transactions: FullyPreparedTransaction[], externalReq: boolean): void {
    if (this.isLbReq(transactions)) {
      if (!externalReq) {
        this.activeAccount = this.subjectService.activeAccount.getValue();
      }
      this.confirmSwapLiquidityRequest = {
        account: this.activeAccount,
        transactions,
        externalReq
      };
    } else {
      this.confirmRequest = {
        account: this.activeAccount,
        tokenTransfer: this.tokenTransfer,
        transactions,
        externalReq
      };
    }
  }
  private isLbReq(transactions: FullyPreparedTransaction[]): boolean {
    if (
      transactions.length === 1 &&
      transactions[0].destination === this.lqdContract &&
      ['xtzToToken', 'removeLiquidity'].includes(transactions[0].parameters?.entrypoint)
    ) {
      // xtzToToken or removeLiquidity
      return true;
    } else if (transactions[0].destination === this.tzBTCContract && transactions[0].parameters?.entrypoint === 'approve') {
      // can be tokenToXtz or addLiquidity
      if (transactions.length === 3 && transactions[0].parameters?.value?.args[1]?.int !== '0') {
        console.log('prepend 0 approve');
        // normalize
        transactions.unshift({
          ...transactions[0],
          kind: 'transaction',
          amount: '0',
          destination: this.tzBTCContract,
          parameters: this.operationService.getRevokeAmountParameters(this.lqdContract)
        });
      }
      if (
        transactions.length === 4 &&
        new Set([transactions[0].destination, transactions[1].destination, transactions[3].destination, this.tzBTCContract]).size === 1 &&
        new Set([transactions[0].parameters?.entrypoint, transactions[1].parameters?.entrypoint, transactions[3].parameters?.entrypoint, 'approve']).size ===
          1 &&
        new Set([
          transactions[0].parameters?.value?.args[0]?.string,
          transactions[1].parameters?.value?.args[0]?.string,
          transactions[3].parameters?.value?.args[0]?.string,
          this.lqdContract
        ]).size === 1 &&
        transactions[2].destination === this.lqdContract &&
        ['tokenToXtz', 'addLiquidity'].includes(transactions[2].parameters?.entrypoint)
      ) {
        return true;
      }
    }
    return false;
  }
  handlePrepareResponse(preparedTransactions: FullyPreparedTransaction[]): void {
    this.prepareRequest = null;
    if (preparedTransactions) {
      console.log('PrepareResponse', JSON.stringify(preparedTransactions));
      this.confirmTransactions(preparedTransactions, false);
    }
  }
  handleConfirmResponse(opHash: string): void {
    this.confirmRequest = null;
    this.confirmSwapLiquidityRequest = null;
    this.operationResponse.emit(opHash);
  }
  handleTemplateApproval(ops: FullyPreparedTransaction[]): void {
    if (ops) {
      this.silentInject(ops);
    } else {
      this.operationResponse.emit(null);
    }
    this.template = null;
  }
  private getTemplateFee(ops: FullyPreparedTransaction[]): TemplateFee {
    let network = new Big(0);
    let storageLimit = new Big(0);
    for (const op of ops) {
      network = network.plus(op.fee);
      storageLimit = storageLimit.plus(op.storageLimit);
    }
    let storage = storageLimit.times(this.estimateService.costPerByte).div('1000000');
    const total = network.plus(storage).toFixed();
    network = network.toFixed();
    storage = storage.toFixed();
    return { network, storage, total };
  }
  async silentInject(ops: FullyPreparedTransaction[]): Promise<void> {
    if (!this.walletService.isEmbeddedTorusWallet()) {
      this.operationResponse.emit('UNSUPPORTED_WALLET_TYPE');
      return;
    }
    for (const op of ops) {
      // Limit to transactions for now
      if (op.kind !== 'transaction') {
        this.operationResponse.emit('UNSUPPORTED_KIND');
        break;
      }
    }
    if (!this.template.silent) {
      this.messageService.startSpinner('Sending transaction...');
    }
    let keys;
    try {
      keys = await this.walletService.getKeys('', this.activeAccount.pkh);
    } catch {
      this.messageService.stopSpinner();
    }
    if (!keys) {
      this.operationResponse.emit('FAILED_TO_SIGN');
      return;
    }
    this.subscriptions.add(
      this.operationService.transfer(this.activeAccount.address, ops, Number(ops[ops.length - 1].fee), keys, '').subscribe(
        async (ans: any) => {
          if (ans.success === true) {
            console.log('Transaction successful ', ans);
            await this.messageService.stopSpinner();
            this.operationResponse.emit(ans.payload.opHash);
            const metadata = {
              transactions: ops,
              opHash: ans.payload.opHash
            };
            await this.coordinatorService.boost(this.activeAccount.address, metadata);
            for (const transaction of ops) {
              if (this.walletService.addressExists(transaction.destination) && this.activeAccount.address !== transaction.destination) {
                await this.coordinatorService.boost(transaction.destination);
              }
            }
          } else {
            await this.messageService.stopSpinner();
            console.log('Transaction error id ', ans.payload.msg);
            this.messageService.addError(ans.payload.msg, 0);
            this.operationResponse.emit({
              error: 'broadcast_error',
              errorMessage: ans.payload.msg
            });
          }
        },
        (err) => {
          this.messageService.stopSpinner();
          console.log(err);
          this.operationResponse.emit('UNKNOWN_ERROR');
        }
      )
    );
  }
}
