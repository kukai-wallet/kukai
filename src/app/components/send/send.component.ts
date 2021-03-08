import { Component, OnInit, ViewEncapsulation, Input, ViewChild, ElementRef, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { KeyPair, DefaultTransactionParams } from '../../interfaces';
import { Account, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';
import { PrepareRequest, ConfirmRequest, FullyPreparedTransaction, PartiallyPreparedTransaction } from './interfaces';
import { TokenService } from '../../services/token/token.service';
import { EstimateService } from '../../services/estimate/estimate.service';
import { MessageService } from '../../services/message/message.service';
import { assertMichelsonData } from '@taquito/michel-codec';
import { OperationService } from '../../services/operation/operation.service';
import Big from 'big.js';
import { ParametersInvalidBeaconError } from '@airgap/beacon-sdk';

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
  @Output() operationResponse = new EventEmitter();
  prepareRequest: PrepareRequest = null;
  confirmRequest: ConfirmRequest = null;
  constructor(
    public tokenService: TokenService,
    private estimateService: EstimateService,
    private messageService: MessageService,
    private operationService: OperationService
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
          parameters: tx.parameters ? tx.parameters : undefined
        };
      });
      if (this.validParameters(txs)) {
        if (txs.length === 1) {
          const tokenTransferObj: any = this.getTokenTransferObj(txs[0]);
          if (tokenTransferObj) {
            const asset = this.tokenService.getAsset(tokenTransferObj.tokenId);
            txs[0].amount = Big(tokenTransferObj.amount).div(10 ** asset.decimals).toFixed();
            txs[0].destination = tokenTransferObj.to;
            this.tokenTransfer = tokenTransferObj.tokenId;
            delete txs[0].parameters;
          }
          this.simulateRequest(txs, tokenTransferObj?.tokenId);
        }
      } else {
        this.operationResponse.emit(null);
      }
    }
  }
  getTokenTransferObj(op: any) {
    if (op.parameters && this.tokenService.isKnownTokenContract(op.destination)) {
      return this.operationService.parseTokenTransfer(op);
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
    await this.messageService.startSpinner('Preparing transaction...');
    try {
      await this.estimateService.preLoadData(this.activeAccount.pkh, this.activeAccount.pk);
      const callback = (res) => {
        if (res) {
          if (res.error) {
            this.messageService.addError(`Simulation error: ${res.error.message}`, 0);
          } else {
            const fullyPrepared: FullyPreparedTransaction[] = txs.map((tx, i) => {
              return {
                ...tx,
                fee: (i === txs.length - 1) ? res.fee : '0',
                gasLimit: res.customLimits[i].gasLimit.toString(),
                storageLimit: res.customLimits[i].storageLimit.toString(),
              };
            });
            this.confirmTransactions(fullyPrepared);
          }
        } else {
          console.log('no res');
        }
      };
      await this.estimateService.estimate(JSON.parse(JSON.stringify(txs)), this.activeAccount.pkh, tokenTransfer, callback);
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
}
