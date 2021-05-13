import { Component, OnInit, ViewEncapsulation, Input, ViewChild, ElementRef, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { KeyPair, DefaultTransactionParams } from '../../interfaces';
import { Account, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';
import { PrepareRequest, ConfirmRequest, FullyPreparedTransaction, PartiallyPreparedTransaction, TemplateRequest, TemplateFee } from './interfaces';
import { Template } from 'kukai-embed';
import { TokenService } from '../../services/token/token.service';
import { EstimateService } from '../../services/estimate/estimate.service';
import { MessageService } from '../../services/message/message.service';
import { assertMichelsonData } from '@taquito/michel-codec';
import { OperationService } from '../../services/operation/operation.service';
import Big from 'big.js';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})

export class SendComponent implements OnInit, OnChanges {
  @Input() activeAccount: Account;
  @Input() headless: boolean;
  @Input() tokenTransfer: string;
  @Input() operationRequest: string;
  @Input() template: Template;
  @Output() operationResponse = new EventEmitter();
  prepareRequest: PrepareRequest = null;
  confirmRequest: ConfirmRequest = null;
  templateRequest: TemplateRequest = null;
  constructor(
    public tokenService: TokenService,
    private estimateService: EstimateService,
    private messageService: MessageService,
    private operationService: OperationService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService
  ) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.headless && changes?.operationRequest?.currentValue) {
      this.checkOpReq(changes.operationRequest.currentValue);
    }
  }
  private async checkOpReq(opReq: any) {
    if (opReq.operationDetails) {
      opReq = opReq.operationDetails;
    }
    if (opReq[0].kind === 'transaction') {
      const txs: PartiallyPreparedTransaction[] = opReq.map(tx => {
        if (tx.kind !== 'transaction') {
          throw new Error('Invalid op kind');
        }
        // identify token transfers
        return {
          kind: 'transaction',
          destination: tx.destination,
          amount: Big(tx.amount).div(10 ** 6).toFixed(), // handle token decimals here
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
            txs[0].amount = Big(tokenTransferObj.amount).div(10 ** asset.decimals).toFixed();
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
  getTokenTransferObj(op: any) {
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
          if (!tx.parameters.value ||
            !tx.parameters.entrypoint) {
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
  async simulateRequest(txs: PartiallyPreparedTransaction[], tokenTransfer: string) {
    if (this.template) {
      this.templateRequest = { template: this.template };
    } else {
      await this.messageService.startSpinner('Preparing transaction...');
    }
    try {
      await this.estimateService.preLoadData(this.activeAccount.pkh, this.activeAccount.pk);
      const callback = (res) => {
        if (res) {
          if (res.error) {
            this.messageService.addError(`Simulation error: ${res.error.message}`, 0);
            this.operationResponse.emit({ error: 'invalid_parameters', errorMessage: res.error.message });
          } else {
            const fullyPrepared: FullyPreparedTransaction[] = txs.map((tx, i) => {
              return {
                ...tx,
                fee: (i === txs.length - 1) ? res.fee : '0',
                gasLimit: res.customLimits[i].gasLimit.toString(),
                storageLimit: res.customLimits[i].storageLimit.toString(),
              };
            });
            if (this.template) {
              const fee = this.getTemplateFee(fullyPrepared);
              console.log('Use template', this.template);
              this.templateRequest = { template: this.template, ops: fullyPrepared, fee };
            } else {
              this.confirmTransactions(fullyPrepared);
            }
          }
        } else {
          console.log('no res');
        }
      };
      await this.estimateService.estimateTransactions(JSON.parse(JSON.stringify(txs)), this.activeAccount.pkh, tokenTransfer, callback);
    } finally {
      await this.messageService.stopSpinner();
    }
  }
  prepareTransaction() {
    this.prepareRequest = { account: this.activeAccount, tokenTransfer: this.tokenTransfer };
  }
  confirmTransactions(transactions: FullyPreparedTransaction[]) {
    this.confirmRequest = { account: this.activeAccount, tokenTransfer: this.tokenTransfer, transactions };
  }
  handlePrepareResponse(preparedTransactions: FullyPreparedTransaction[]) {
    this.prepareRequest = null;
    if (!preparedTransactions) {
      //modalOpen
    } else {
      console.warn('PrepareResponse', preparedTransactions);
      this.confirmTransactions(preparedTransactions);
    }
  }
  handleConfirmResponse(opHash: string) {
    this.confirmRequest = null;
    this.operationResponse.emit(opHash);
  }
  handleTemplateApproval(ops: FullyPreparedTransaction[]) {
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
  async silentInject(ops: FullyPreparedTransaction[]) {
    if (!this.walletService.isEmbeddedTorusWallet()) {
      this.operationResponse.emit('UNSUPPORTED_WALLET_TYPE');
      return;
    }
    for (const op of ops) { // Limit to transactions for now
      if (op.kind !== 'transaction') {
        this.operationResponse.emit('UNSUPPORTED_KIND');
        break;
      }
    }
    this.messageService.startSpinner('Sending transaction...');
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
    this.operationService.transfer(this.activeAccount.address, ops, Number(ops[ops.length - 1].fee), keys, '').subscribe(
      async (ans: any) => {
        if (ans.success === true) {
          console.log('Transaction successful ', ans);
          await this.messageService.stopSpinner();
          this.operationResponse.emit(ans.payload.opHash);
          const metadata = { transactions: ops, opHash: ans.payload.opHash };
          await this.coordinatorService.boost(this.activeAccount.address, metadata);
          for (const transaction of ops) {
            if (this.walletService.addressExists(transaction.destination)) {
              await this.coordinatorService.boost(transaction.destination);
            }
          }
        } else {
          await this.messageService.stopSpinner();
          console.log('Transaction error id ', ans.payload.msg);
          this.messageService.addError(ans.payload.msg, 0);
          this.operationResponse.emit({ error: 'broadcast_error', errorMessage: ans.payload.msg });
        }
      },
      err => {
        this.messageService.stopSpinner();
        console.log(err);
        this.operationResponse.emit('UNKNOWN_ERROR');
      },
    );
  }
}
