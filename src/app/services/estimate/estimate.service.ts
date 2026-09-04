import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OperationService, REVEAL_GAS_LIMIT } from '../operation/operation.service';
import { flatMap, catchError, timeout } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { DefaultTransactionParams, OpLimits, FeeParams } from '../../interfaces';
import Big from 'big.js';
import { CONSTANTS } from '../../../environments/environment';
import { InputValidationService } from '../input-validation/input-validation.service';
import { UtilsService } from '../utils/utils.service';

const httpOptions = { headers: { 'Content-Type': 'application/json' } };

/*
  Fallback fee parameters, used until `chains/main/mempool/filter` has been fetched successfully.
  Taken from the environment when set (Tezos X), otherwise the L1 defaults (octez): 100 mutez + 0.1 mutez per gas unit + 1 mutez per byte.
*/
export const DEFAULT_FEE_PARAMS: FeeParams = CONSTANTS.FEE_PARAMS ?? { minimalFees: 100, nanotezPerGas: 100, nanotezPerByte: 1000 };

/*
  Parse a mempool filter response. The node serves the two rates as [numerator, denominator] ratios in nanotez; they are rounded up to whole nanotez.
  Any missing or invalid field keeps its value from `current`, so a partial response never regresses a rate that was fetched successfully.
*/
export function parseFeeParams(raw: any, current: FeeParams = DEFAULT_FEE_PARAMS): FeeParams {
  const parseUnsignedInteger = (value: any): number | null => {
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
      return value;
    }
    if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
      return Number(value);
    }
    return null;
  };
  const parseRatio = (value: any): number | null => {
    if (Array.isArray(value) && value.length === 2) {
      const num = parseUnsignedInteger(value[0]);
      const den = parseUnsignedInteger(value[1]);
      if (num !== null && den !== null && den > 0) {
        return Math.ceil(num / den);
      }
    }
    return null;
  };
  return {
    minimalFees: parseUnsignedInteger(raw?.minimal_fees) ?? current.minimalFees,
    nanotezPerGas: parseRatio(raw?.minimal_nanotez_per_gas_unit) ?? current.nanotezPerGas,
    nanotezPerByte: parseRatio(raw?.minimal_nanotez_per_byte) ?? current.nanotezPerByte
  };
}

@Injectable()
export class EstimateService {
  readonly storageCostPerByte: string = String(CONSTANTS.COST_PER_BYTE ?? 250);
  feeParams: FeeParams = DEFAULT_FEE_PARAMS;
  readonly revealGasLimit = 200;
  readonly extraGas = 25;
  readonly contractsOverride: Record<string, OpLimits>;
  readonly tooSlowPreloadError: string = 'Simulation error: Node timed out on preload';
  queue = [];
  pkh: string;
  pk: string;
  hash: string;
  chainId: string;
  protocol: string;
  manager: string;
  counter: number;
  constructor(
    private utilsService: UtilsService,
    private http: HttpClient,
    private operationService: OperationService,
    private imputValidationService: InputValidationService
  ) {
    this.contractsOverride = CONSTANTS.CONTRACT_OVERRIDES;
  }
  init(hash: string, chainId: string, protocol: string, counter: number, manager: string, pk: string, pkh: string) {
    this.hash = hash;
    this.chainId = chainId;
    this.protocol = protocol;
    this.counter = counter;
    this.manager = manager;
    this.pk = pk;
    this.pkh = pkh;
  }
  async preLoadData(pkh: string, pk: string): Promise<void> {
    this.pkh = pkh;
    this.pk = pk;
    this.hash = this.chainId = this.counter = this.manager = undefined;
    const [head, counter, manager] = await Promise.all([this.operationService.getHeader().toPromise(), this.getCounter(pkh), this.getManager(pkh)]);
    if (head && counter && (manager || manager === null)) {
      this.init(head.hash, head.chain_id, head.protocol, counter, manager, pk, pkh);
      console.log(head);
    }
  }
  /*
    Refresh the dynamic fee parameters from the node's mempool filter. On Tezos X the gas price moves with load, so this is called for every estimate (see simulateAndRefreshDynamicFeeParams).
    Never throws: on failure the previous values (initially DEFAULT_FEE_PARAMS) are kept.
  */
  async refreshDynamicFeeParams(): Promise<void> {
    try {
      const raw = await this.operationService.getMempoolFilter().pipe(timeout(10000)).toPromise();
      this.feeParams = parseFeeParams(raw, this.feeParams);
    } catch (e) {
      console.warn('Failed to fetch fee parameters from mempool filter, using previous values', e);
    }
  }
  /*
    Run the simulation and, on Tezos X where the gas price is dynamic, refresh the fee parameters concurrently.
    On L1 the mempool filter values are static, so the fallback parameters are used without an extra round trip.
    Resolves to null when the simulation fails.
  */
  private async simulateAndRefreshDynamicFeeParams(op: any): Promise<any> {
    const [result] = await Promise.all([
      this.simulate(op)
        .toPromise()
        .catch((e) => {
          console.warn(e);
          return null;
        }),
      CONSTANTS.TEZOS_X ? this.refreshDynamicFeeParams() : Promise.resolve()
    ]);
    return result;
  }
  public async estimateTransactions(transactions: any, from: string, tokenTransfer: string = '', callback) {
    this.estimate(transactions, from, tokenTransfer, callback);
  }
  private async estimate(transactions: any, from: string, tokenTransfer: string = '', callback) {
    this.queue.push({ transactions, from, callback });
    if (this.queue.length === 1) {
      while (this.queue.length > 0) {
        while (this.queue.length > 1) {
          this.queue[0].callback(null);
          this.queue.shift();
        }
        let retry = false;
        for (let i = 0; i < 1 || (retry && i < 2); i++) {
          let c = 0;
          while (!this.hash) {
            if (c < 10) {
              await this.utilsService.sleep(500);
            } else {
              this.queue[0].callback({ error: this.tooSlowPreloadError });
              this.queue.shift();
              return;
            }
            c++;
          }
          await this._estimate(this.queue[0].transactions, this.queue[0].from, tokenTransfer)
            .then((res) => {
              this.queue[0].callback(res);
            })
            .catch(async (error) => {
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
  private async _estimate(operations: any, from: string, tokenTransfer: string): Promise<any> {
    if (!this.hash) {
      return null;
    }
    const simulation = {
      fee: 0,
      gasLimit: Math.min(
        CONSTANTS.HARD_LIMITS.hard_gas_limit_per_operation,
        Math.floor(CONSTANTS.HARD_LIMITS.hard_gas_limit_per_block / operations.length) - REVEAL_GAS_LIMIT
      ),
      storageLimit: CONSTANTS.HARD_LIMITS.hard_storage_limit_per_operation
    };
    for (const tx of operations) {
      if (!tx.amount) {
        tx.amount = 0;
      }
      if (tx.destination.slice(0, 3) !== 'KT1' && !tokenTransfer && !(tx.destination === from && tx.parameters)) {
        tx.amount = 0.000001;
      }
      tx.gasLimit = simulation.gasLimit;
      tx.storageLimit = simulation.storageLimit;
    }
    if (this.hash && this.counter && (this.manager || this.manager === null)) {
      const op = this.operationService.createTransactionObject(
        this.hash,
        this.counter,
        this.manager,
        operations,
        this.pkh,
        this.pk,
        from,
        simulation.fee,
        tokenTransfer
      );
      const result = await this.simulateAndRefreshDynamicFeeParams(op);
      if (result && result.contents) {
        let reveal = false;
        const limits = [];
        for (const i in result.contents) {
          if (result.contents[i].kind === 'reveal') {
            reveal = true;
          } else if (['transaction'].includes(result.contents[i].kind) && result.contents[i].metadata.operation_result.status === 'applied') {
            const index: number = Number(i) + (result.contents[0]?.kind === 'reveal' ? -1 : 0);
            const opObj = index > -1 ? operations[index] : null;
            const { gas, storage } = this.getOpUsage(result.contents[i], opObj);
            limits.push({ gasLimit: gas, storageLimit: storage });
          } else {
            return null;
          }
        }
        return await this.operationService
          .localForge(op)
          .pipe(
            flatMap((fop) => {
              const bytes = fop.length / 2 + 64;
              const gas = this.totalGasLimit(limits);
              const storage = this.totalStorageLimit(limits);
              const dtp: DefaultTransactionParams = {
                customLimits: limits,
                fee: this.recommendFee(limits, reveal, bytes),
                burn: this.burnFee(limits),
                gas,
                storage,
                reveal
              };
              console.log(JSON.stringify(dtp));
              return of(dtp);
            })
          )
          .toPromise();
      } else if (typeof result?.success === 'boolean' && result.success === false) {
        console.log(result);
        const { msg, errorId } = result.payload;
        throw { message: msg, errorId };
      }
    }
    return null;
  }
  getOpUsage(content: any, op: any): OpLimits {
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
        if (balanceUpdate.contract === this.pkh || balanceUpdate?.staker?.contract === this.pkh) {
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
    gasUsage += content.metadata.operation_result.consumed_milligas ? Math.ceil(Number(content.metadata.operation_result.consumed_milligas) / 1000) : 0;
    if (content.metadata.internal_operation_results) {
      for (const internalResult of content.metadata.internal_operation_results) {
        if (internalResult.result) {
          if (internalResult.result.consumed_milligas) {
            gasUsage +=
              internalResult.result && internalResult.result.consumed_milligas ? Math.ceil(Number(internalResult.result.consumed_milligas) / 1000) : 0;
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
    const storageUsage = Math.round(burn / Number(this.storageCostPerByte));
    if (
      gasUsage < 0 ||
      gasUsage > CONSTANTS.HARD_LIMITS.hard_gas_limit_per_operation ||
      storageUsage < 0 ||
      storageUsage > CONSTANTS.HARD_LIMITS.hard_storage_limit_per_operation
    ) {
      console.log(gasUsage, '>', CONSTANTS.HARD_LIMITS.hard_gas_limit_per_operation);
      console.log(storageUsage, '>', CONSTANTS.HARD_LIMITS.hard_storage_limit_per_operation);
      throw new Error('InvalidUsageCalculation');
    }
    return this.getOpLimits(content, op, gasUsage, storageUsage);
  }
  /*
    fee (mutez) = minimal_fees + nanotez_per_byte * bytes / 1000 + nanotez_per_gas * gas / 1000
    Parameters come from the node's mempool filter (see refreshDynamicFeeParams), with DEFAULT_FEE_PARAMS as fallback.
    Tezos X reports minimal_fees but does not enforce it, so the term is skipped there.
    Returns tez.
  */
  recommendFee(limits: any, reveal: boolean, bytes: number, params: FeeParams = this.feeParams): number {
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
    const byteFee = Big(params.nanotezPerByte).times(bytes).div(1000);
    const gasFee = Big(params.nanotezPerGas).times(gasUnits).div(1000);
    const minimalFees = CONSTANTS.TEZOS_X ? 0 : params.minimalFees;
    const mutez = Big(minimalFees).plus(byteFee).plus(gasFee).round(0, 3); // 3 = ROUND_UP (big.js 5)
    return Number(mutez.div(1000000).toString());
  }
  totalGasLimit(limits: any): number {
    let totalGasLimit = 0;
    for (const data of limits) {
      totalGasLimit += data.gasLimit;
    }
    return totalGasLimit;
  }
  totalStorageLimit(limits: any): number {
    let totalStorageLimit = 0;
    for (const data of limits) {
      totalStorageLimit += data.storageLimit;
    }
    return totalStorageLimit;
  }
  burnFee(limits: any): number {
    let totalStorageLimit = Big(0);
    for (const data of limits) {
      totalStorageLimit = totalStorageLimit.plus(data.storageLimit);
    }
    return Number(Big(totalStorageLimit).times(this.storageCostPerByte).div('1000000').toString());
  }
  simulate(op: any): Observable<any> {
    op.signature = 'edsigtXomBKi5CTRf5cjATJWSyaRvhfYNHqSUGrn4SdbYRcGwQrUGjzEfQDTuqHhuA8b2d8NarZjz8TRf65WkpQmo423BtomS8Q';
    return this.operationService
      .postRpc('chains/main/blocks/head/helpers/scripts/simulate_operation?version=1', {
        operation: op,
        chain_id: this.chainId
      })
      .pipe(
        flatMap((res) => {
          this.operationService.checkApplied([res], true);
          return of(res);
        })
      )
      .pipe(
        catchError((err) => {
          return this.operationService.errHandler(err);
        })
      );
  }
  private getOpLimits(content: any, op: any, gasUsage: number, storageUsage: number): OpLimits {
    // check for hardcoded override
    let limit: OpLimits = {};
    const entrypoint = content?.parameters?.entrypoint;
    const destination = content?.destination;
    if (entrypoint && destination) {
      const contractOverride: OpLimits = this.contractsOverride[`${destination}:${entrypoint}`];
      if (contractOverride) {
        limit = contractOverride;
      }
    }
    // gas
    if (!limit.gas) {
      let gasRecommendation: number = 0;
      if (op?.gasRecommendation) {
        if (this.imputValidationService.gas(op.gasRecommendation)) {
          gasRecommendation = Number(op.gasRecommendation);
        } else if (this.imputValidationService.relativeLimit(op.gasRecommendation)) {
          let percentage: number = Number(op.gasRecommendation.slice(1, -1));
          percentage = Math.min(Math.max(percentage, 2), 900);
          gasRecommendation = Math.round(gasUsage * (1 + percentage / 100));
        }
      }
      const gasEstimation = Math.max(Math.ceil(gasUsage * 1.02), Math.round(gasUsage + this.extraGas));
      limit.gas = Math.max(gasRecommendation, gasEstimation); // make sure dapps don't underestimate (ithaca side effect)
    }
    // storage
    if (!limit.storage) {
      let storageRecommendation: number = 0;
      if (op?.storageRecommendation) {
        if (this.imputValidationService.storage(op.storageRecommendation)) {
          storageRecommendation = Number(op.storageRecommendation);
        } else if (this.imputValidationService.relativeLimit(op.storageRecommendation)) {
          const percentage: number = Number(op.storageRecommendation.slice(1, -1));
          storageRecommendation = Math.round(storageUsage * (1 + percentage / 100));
        }
      }
      const storageEstimation = Math.round(storageUsage);
      limit.storage = Math.max(storageRecommendation, storageEstimation);
    }
    return limit;
  }
  private async getCounter(pkh: string): Promise<number> {
    return this.operationService.getRpc(`chains/main/blocks/head/context/contracts/${pkh}/counter`).toPromise();
  }
  private async getManager(pkh: string): Promise<string> {
    return this.operationService.getRpc(`chains/main/blocks/head/context/contracts/${pkh}/manager_key`).toPromise();
  }
  private async _estimateOperations(operations: any, from: string): Promise<any> {
    console.log('_estimateOperations', structuredClone(operations));
    if (!this.hash || !this.counter) {
      return null;
    }
    const simulation = {
      fee: 0,
      gasLimit: Math.min(
        CONSTANTS.HARD_LIMITS.hard_gas_limit_per_operation,
        Math.floor(CONSTANTS.HARD_LIMITS.hard_gas_limit_per_block / (operations.length + 1))
      ),
      storageLimit: CONSTANTS.HARD_LIMITS.hard_storage_limit_per_operation
    };
    for (const tx of operations) {
      tx.gasRecommendation = tx.gas_limit;
      tx.storageRecommendation = tx.storage_limit;
      tx.gas_limit = simulation.gasLimit;
      tx.storage_limit = simulation.storageLimit;
    }
    if (this.hash && this.counter && (this.manager || this.manager === null)) {
      const operationObject = this.operationService.createOperationObject(
        this.hash,
        this.counter,
        this.manager,
        structuredClone(operations),
        this.pkh,
        this.pk,
        simulation.fee
      );
      const result = await this.simulateAndRefreshDynamicFeeParams(operationObject);
      if (result && result.contents) {
        let reveal = false;
        const limits = [];
        for (const i in result.contents) {
          if (result.contents[i].kind === 'reveal') {
            reveal = true;
          } else {
            const index: number = Number(i) + (result.contents[0]?.kind === 'reveal' ? -1 : 0);
            const opObj = index > -1 ? operations[index] : null;
            const { gas, storage } = this.getOpUsage(result.contents[i], opObj);
            limits.push({ gasLimit: gas, storageLimit: storage });
          }
        }
        return await this.operationService
          .localForge(operationObject)
          .pipe(
            flatMap((fop) => {
              const bytes = fop.length / 2 + 64;
              const gas = this.totalGasLimit(limits);
              const storage = this.totalStorageLimit(limits);
              const dtp: DefaultTransactionParams = {
                customLimits: limits,
                fee: this.recommendFee(limits, reveal, bytes),
                burn: this.burnFee(limits),
                gas,
                storage,
                reveal
              };
              console.log(JSON.stringify(dtp));
              return of(dtp);
            })
          )
          .toPromise();
      } else if (typeof result?.success === 'boolean' && result.success === false) {
        console.log(result);
        const { msg, errorId } = result.payload;
        throw { message: msg, errorId };
      }
    }
    return null;
  }
  async estimateOperations(operations: any, from: string): Promise<any> {
    let retry = false;
    for (let i = 0; i < 1 || (retry && i < 2); i++) {
      return await this._estimateOperations(operations, from).catch(async (error) => {
        if (error.message && error.message === 'An operation assumed a contract counter in the past' && !retry) {
          console.log('Update counter');
          await this.preLoadData(this.pkh, this.pk);
          retry = true;
        } else {
          throw error;
        }
      });
    }
  }
}
