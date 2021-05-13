import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OperationService } from '../operation/operation.service';
import { flatMap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { DefaultTransactionParams } from '../../interfaces';
import Big from 'big.js';
import { CONSTANTS } from '../../../environments/environment';
import { ContractOverrideType, ContractsOverrideType } from '../token/token.service';

const httpOptions = { headers: { 'Content-Type': 'application/json' } };
const hardGasLimit = 1040000;
const hardStorageLimit = 60000;
const extraGas = 80;
@Injectable()
export class EstimateService {
  readonly costPerByte = '250';
  readonly revealGasLimit = 1000;
  readonly contractsOverride: Record<string, ContractOverrideType>;
  queue = [];
  nodeURL = CONSTANTS.NODE_URL;
  pkh: string;
  pk: string;
  hash: string;
  chainId: string;
  manager: string;
  counter: number;
  constructor(
    private http: HttpClient,
    private operationService: OperationService,
  ) {
    this.contractsOverride = CONSTANTS.CONTRACT_OVERRIDES;
  }
  init(hash: string, chainId: string, counter: number, manager: string, pk: string, pkh: string) {
    this.hash = hash;
    this.chainId = chainId;
    this.counter = counter;
    this.manager = manager;
    this.pk = pk;
    this.pkh = pkh;
  }
  async preLoadData(pkh: string, pk: string) {
    this.pkh = pkh;
    this.pk = pk;
    await Promise.all([this.operationService.getHeader().toPromise(), this.getCounter(pkh), this.getManager(pkh)]).then(req => {
      if (req[0] && req[1] && (req[2]) || req[2] === null) {
        this.init(req[0].hash, req[0].chain_id, req[1], req[2], pk, pkh);
      }
    });
  }
  public async estimateTransactions(transactions: any, from: string, tokenTransfer: string = '', callback) {
    this.estimate(transactions, from, tokenTransfer, callback, false);
  }
  public async estimateOrigination(origination: any, from: string, callback) {
    this.estimate([origination], from, '', callback, true);
  }
  private async estimate(transactions: any, from: string, tokenTransfer: string = '', callback, isOrigination: boolean) {
    this.queue.push({ transactions, from, callback });
    if (this.queue.length === 1) {
      while (this.queue.length > 0) {
        while (this.queue.length > 1) {
          this.queue[0].callback(null);
          this.queue.shift();
        }
        let retry = false;
        for (let i = 0; i < 1 || retry && i < 2; i++) {
          await this._estimate(this.queue[0].transactions, this.queue[0].from, tokenTransfer, isOrigination).then((res) => {
            this.queue[0].callback(res);
          }).catch(async (error) => {
            if (error.message && error.message === 'An operation assumed a contract counter in the past' && !retry) {
              console.log('Update counter');
              await this.preLoadData(this.pkh, this.pk);
              retry = true;
            } else {
              this.queue[0].callback({ error });
            }
          });
        }
        this.queue.shift();
      }
    }
  }
  private async _estimate(operations: any, from: string, tokenTransfer: string, isOrigination: boolean = false): Promise<any> {
    if (!this.hash) { return null; }
    const simulation = {
      fee: 0,
      gasLimit: hardGasLimit,
      storageLimit: hardStorageLimit
    };
    for (const tx of operations) {
      console.log(tx);
      if (!isOrigination) {
        if (!tx.amount) {
          tx.amount = 0;
        }
        if (tx.destination.slice(0, 3) !== 'KT1' && !tokenTransfer) {
          tx.amount = 0.000001;
        }
      }
      tx.gasLimit = simulation.gasLimit;
      tx.storageLimit = simulation.storageLimit;
    }
    if (this.hash && this.counter && (this.manager || this.manager === null)) {
      const op = isOrigination ? this.operationService.createOriginationObject(this.hash, this.counter, this.manager, operations[0], simulation.fee, this.pk, this.pkh) :
        this.operationService.createTransactionObject(this.hash, this.counter, this.manager, operations, this.pkh, this.pk, from, simulation.fee, tokenTransfer);
      const result = await this.simulate(op).toPromise().catch(
        e => {
          console.warn(e);
          return null;
        }
      );
      if (result && result.contents) {
        let reveal = false;
        const limits = [];
        for (const i in result.contents) {
          if (result.contents[i].kind === 'reveal') {
            reveal = true;
          } else if (['transaction', 'origination'].includes(result.contents[i].kind) && result.contents[i].metadata.operation_result.status === 'applied') {
            const index: number = Number(i) + ((result.contents[0]?.kind === 'reveal') ? -1 : 0);
            const opObj = index > -1 ? operations[index] : null;
            const { gasUsage, storageUsage } = this.getOpUsage(result.contents[i], opObj);
            limits.push({ gasLimit: gasUsage + extraGas, storageLimit: storageUsage });
          } else {
            return null;
          }
        }
        return await this.operationService.localForge(op).pipe(flatMap(fop => {
          const bytes = (fop.length / 2) + 64;
          const gas = this.averageGasLimit(limits);
          const storage = this.averageStorageLimit(limits);
          const dtp: DefaultTransactionParams = { customLimits: limits, fee: this.recommendFee(limits, reveal, bytes), burn: this.burnFee(limits), gas, storage, reveal };
          console.log(JSON.stringify(dtp));
          return of(dtp);
        })).toPromise();
      } else if (typeof result.success === 'boolean' && result.success === false) {
        console.log(result);
        throw new Error(result.payload.msg);
      }
    }
    return null;
  }
  getOpUsage(content: any, op: any): { gasUsage: number, storageUsage: number } {
    let gasUsage = 0;
    let burn = Big(0);
    if (content.source && content.source === this.pkh) {
      burn = burn.minus(content.amount ? content.amount : '0');
      burn = burn.minus(content.fee ? content.fee : '0');
      burn = burn.minus(content.balance ? content.balance : '0');
    }
    if (content.destination && content.destination === this.pkh) {
      burn = burn.plus(content.amount ? content.amount : '0');
    }
    if (content.metadata.operation_result.balance_updates) {
      for (const balanceUpdate of content.metadata.operation_result.balance_updates) {
        if (balanceUpdate.contract === this.pkh) {
          burn = burn.minus(balanceUpdate.change);
        }
      }
    }
    if (content.metadata.balance_updates) {
      for (const balanceUpdate of content.metadata.balance_updates) {
        if (balanceUpdate.contract === this.pkh) {
          burn = burn.minus(balanceUpdate.change);
        }
      }
    }
    gasUsage += content.metadata.operation_result.consumed_gas ? Number(content.metadata.operation_result.consumed_gas) : 0;
    if (content.metadata.internal_operation_results) {
      for (const internalResult of content.metadata.internal_operation_results) {
        if (internalResult.result) {
          if (internalResult.result.consumed_gas) {
            gasUsage += internalResult.result && internalResult.result.consumed_gas ? Number(internalResult.result.consumed_gas) : 0;
          }
          if (internalResult.result.balance_updates) {
            for (const balanceUpdate of internalResult.result.balance_updates) {
              if (balanceUpdate.contract === this.pkh && balanceUpdate.change.slice(0, 1) === '-') {
                burn = burn.minus(balanceUpdate.change);
              }
            }
          }
        }
      }
    }
    const storageUsage = Math.round(burn / Number(this.costPerByte));
    if (gasUsage < 0 || gasUsage > hardGasLimit || storageUsage < 0 || storageUsage > hardStorageLimit) {
      throw new Error('InvalidUsageCalculation');
    }
    const customUsage = this.getUsageException(content, op);
    if (customUsage) {
      // if there is a usageException then override values
      return { gasUsage, storageUsage, ...customUsage };
    }
    return { gasUsage, storageUsage };
  }
  /*
    Need to be updated when fee market appear or default behavior for bakers changes
  */
  recommendFee(limits: any, reveal: boolean, bytes: number): number {
    const minimalFee = 100;
    const feePerByte = 1;
    const feePerGasUnit = 0.1;
    let gasUnits = 0;
    let numberOfOperations = 0;
    if (reveal) {
      gasUnits += this.revealGasLimit;
      numberOfOperations++;
    }
    for (const data of limits) {
      gasUnits += data.gasLimit;
      numberOfOperations++;
    }
    bytes += 10 * numberOfOperations; // add 10 extra bytes for variation in amount & fee
    return Number(Big(Math.ceil(minimalFee + (feePerByte * bytes) + (feePerGasUnit * gasUnits))).div(1000000).toString());
  }
  averageGasLimit(limits: any): number {
    let totalGasLimit = 0;
    for (const data of limits) {
      totalGasLimit += data.gasLimit;
    }
    return Math.ceil(totalGasLimit / limits.length);
  }
  averageStorageLimit(limits: any): number {
    let totalStorageLimit = 0;
    for (const data of limits) {
      totalStorageLimit += data.storageLimit;
    }
    return Math.ceil(totalStorageLimit / limits.length);
  }
  burnFee(limits: any): number {
    let totalStorageLimit = Big(0);
    for (const data of limits) {
      totalStorageLimit = totalStorageLimit.plus(data.storageLimit);
    }
    return Number(Big(totalStorageLimit).times(this.costPerByte).div('1000000').toString());
  }
  simulate(op: any): Observable<any> {
    op.signature = 'edsigtXomBKi5CTRf5cjATJWSyaRvhfYNHqSUGrn4SdbYRcGwQrUGjzEfQDTuqHhuA8b2d8NarZjz8TRf65WkpQmo423BtomS8Q';
    return this.http.post(this.nodeURL + '/chains/main/blocks/head/helpers/scripts/run_operation',
      { operation: op, chain_id: this.chainId }, httpOptions).pipe(flatMap(res => {
        this.operationService.checkApplied([res]);
        return of(res);
      })).pipe(catchError(err => this.operationService.errHandler(err)));
  }
  private getUsageException(content: any, op: any): ContractOverrideType {
    const entrypoint = content?.parameters?.entrypoint;
    const destination = content?.destination;
    if (entrypoint && destination) {
      const contractOverride = this.contractsOverride[`${destination}:${entrypoint}`];
      if (contractOverride) {
        return contractOverride;
      }
    }
    if (op?.gasRecommendation || op?.storageRecommendation) {
      let override: ContractOverrideType = {};
      if (op.gasRecommendation) {
        override.gasUsage = Number(op.gasRecommendation) - extraGas;
      }
      if (op.storageRecommendation) {
        override.storageUsage = Number(op.storageRecommendation);
      }
      console.log('Dapp recommendation', {gas: op.gasRecommendation, storage: op.storageRecommendation});
      return override;
    }
    return null;
  }
  private async getCounter(pkh: string): Promise<number> {
    return fetch(this.nodeURL + '/chains/main/blocks/head/context/contracts/' + pkh + '/counter', {}).then(response => {
      return response.json();
    });
  }
  private async getManager(pkh: string): Promise<string> {
    return fetch(this.nodeURL + '/chains/main/blocks/head/context/contracts/' + pkh + '/manager_key', {}).then(response => {
      return response.json();
    });
  }
}
