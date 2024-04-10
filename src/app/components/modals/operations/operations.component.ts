import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { KeyPair, CustomFee, DefaultTransactionParams, ExternalRequest } from '../../../interfaces';
import { WalletService } from '../../../services/wallet/wallet.service';
import { CoordinatorService } from '../../../services/coordinator/coordinator.service';
import { OperationService } from '../../../services/operation/operation.service';
import { InputValidationService } from '../../../services/input-validation/input-validation.service';
import { LookupService } from '../../../services/lookup/lookup.service';
import { LedgerService } from '../../../services/ledger/ledger.service';
import { MessageService } from '../../../services/message/message.service';
import { EstimateService } from '../../../services/estimate/estimate.service';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../modal.component';
import { SubjectService } from '../../../services/subject/subject.service';
import { LedgerWallet, Account, TorusWallet } from '../../../services/wallet/wallet';
import { localForger } from '@taquito/local-forging';
import { shouldHandleOperations } from '../../../libraries/beacon-type-check';
import Big from 'big.js';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class OperationsComponent extends ModalComponent implements OnInit, OnChanges, OnDestroy {
  readonly beaconMode = true;
  @Input() externalRequest: ExternalRequest;
  @Output() operationResponse = new EventEmitter();
  syncSub: Subscription;
  customFee: CustomFee = null;
  defaultFee: DefaultTransactionParams;

  name = 'operation';

  operations: any[] = [];
  opbytes: string = '';
  account: Account;
  balanceChange: string = '';
  hash: string;
  counter: number;
  interval: any;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private walletService: WalletService,
    private operationService: OperationService,
    private coordinatorService: CoordinatorService,
    private inputValidationService: InputValidationService,
    private ledgerService: LedgerService,
    private lookupService: LookupService,
    private messageService: MessageService,
    private estimateService: EstimateService,
    private subjectService: SubjectService
  ) {
    super();
  }
  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (shouldHandleOperations(this.externalRequest?.operationRequest?.operationDetails, this.name)) {
      this.reset();
      this.operations = structuredClone(this.externalRequest.operationRequest.operationDetails);
      this.account = this.externalRequest.selectedAccount;
      this.estimateFees()
        .then((success) => {
          if (success) {
            this.openModal();
            this.syncSub = this.subjectService.beaconResponse.subscribe((response) => {
              if (response) {
                this.closeModalAction('silent');
              }
            });
          } else {
            throw new Error('Failed to estimate fee');
          }
        })
        .catch((e) => {
          console.error(e);
          this.closeModalAction();
        });
    }
  }
  ngOnDestroy(): void {
    this.reset();
    // console.log('destroy operations component');
  }
  openModal(): void {
    if (this.walletService.wallet) {
      // hide body scrollbar
      const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
      document.body.style.marginRight = scrollBarWidth.toString();
      document.body.style.overflow = 'hidden';
      ModalComponent.currentModel.next({ name: this.name, data: null });
      if (this.estimateService.pkh === this.account.pkh) {
        this.hash = this.estimateService.hash;
        this.counter = this.estimateService.counter;
      }
      this.subscriptions.add(
        this.subjectService.confirmedOp.subscribe((opHash) => {
          if (this.account?.activities?.length) {
            if (
              this.account?.activities.some((a) => {
                return a.hash === opHash;
              })
            ) {
              this.refreshCounter();
            }
          }
        })
      );

      this.interval = setInterval(() => {
        this.refreshCounter();
      }, 30000);
      this.prepareOperations();
    }
  }
  private async refreshCounter() {
    if (this.estimateService.counter === undefined && this.estimateService.pk) {
      return; // pending preload already - debounce
    }
    await this.estimateService.preLoadData(this.account.pkh, this.account.pk);
    if (!this.interval) {
      return;
    }
    if (this.estimateService.pkh === this.account.pkh) {
      this.hash = this.estimateService.hash;
      this.counter = this.estimateService.counter;
    }
    this.prepareOperations();
  }
  async estimateFees(): Promise<boolean> {
    await this.messageService.startSpinner();
    await this.estimateService.preLoadData(this.account.pkh, this.account.pk);
    const res = await this.estimateService
      .estimateOperations(structuredClone(this.externalRequest.operationRequest.operationDetails), this.account.pkh)
      .catch((e) => {
        console.error(e);
        this.messageService.addError(e?.message);
        return null;
      });
    await this.messageService.stopSpinner();
    if (res) {
      this.defaultFee = res;
      console.log('Default fee values', this.defaultFee);
      return true;
    }
    return false;
  }
  async prepareOperations() {
    try {
      // apply limits and fee
      const preparedOps = [];
      const gasLimits = this.getEffectiveGasLimits(this.customFee?.gas);
      const storageLimits = this.getEffectiveStorageLimits(this.customFee?.storage);
      const fee: number = this.getEffectiveFee(this.customFee?.fee);
      for (let n = 0; n < this.operations.length; n++) {
        preparedOps.push({ ...this.operations[n], gas_limit: gasLimits[n], storage_limit: storageLimits[n] });
      }
      const obj = this.operationService.createOperationObject(
        this.hash,
        this.counter,
        this.estimateService.manager,
        preparedOps,
        this.account.pkh,
        this.account.pk,
        fee
      );
      this.updateBalanceChange(obj);
      this.opbytes = await localForger.forge(obj).then((bytes) => {
        return `03${bytes}`;
      });
    } catch (e) {
      console.error(e);
      this.opbytes = '';
    }
  }
  private updateBalanceChange(ops: any) {
    try {
      let storage = 0;
      let mutez = Big(0);
      for (const op of ops.contents) {
        if (op?.amount) {
          mutez = mutez.minus(op.amount);
        } else if (op?.balance) {
          mutez = mutez.minus(op.balance);
        }
        mutez = mutez.minus(op.fee);
        mutez = mutez.minus(Big(op.storage_limit).times(this.estimateService.costPerByte));
      }
      this.balanceChange = `${mutez.div(10 ** 6).toFixed()} tez`;
    } catch (e) {
      this.balanceChange = '?';
      console.error(e);
    }
  }
  private getEffectiveFee(customFee: string): number {
    const _customFee = customFee?.slice(-1) === '.' ? customFee.slice(0, -1) : customFee;
    if (_customFee?.length && _customFee !== this.defaultFee.fee.toString()) {
      if (!this.inputValidationService.fee(_customFee)) {
        return null;
      }
      return Number(_customFee);
    }
    return this.defaultFee.fee;
  }
  private getEffectiveGasLimits(customGas: string) {
    let gas_limits = this.defaultFee.customLimits.map((x) => {
      return x.gasLimit;
    });
    if (!(this.inputValidationService.gas(customGas) && customGas.length && customGas !== this.defaultFee.storage.toString())) {
      // return default array
      return gas_limits;
    }
    const _customGas: number = Number(customGas);
    let diff: number = _customGas - this.defaultFee.gas;
    const _diff = diff;
    for (let i = 0; i < gas_limits.length; i++) {
      if (i < gas_limits.length - 1) {
        const extraGas = Math.round((this.defaultFee.customLimits[i].gasLimit / this.defaultFee.gas) * _diff);
        diff -= extraGas;
        gas_limits[i] += extraGas;
      } else {
        gas_limits[i] += diff;
      }
    }
    return gas_limits;
  }
  private getEffectiveStorageLimits(customStorage: string) {
    let storage_limits = this.defaultFee.customLimits.map((x) => {
      return x.storageLimit;
    });
    if (!(this.inputValidationService.storage(customStorage) && customStorage.length && customStorage !== this.defaultFee.storage.toString())) {
      // return default array
      return storage_limits;
    }
    const _customStorage: number = Number(customStorage);
    let diff = Math.abs(this.defaultFee.storage - _customStorage);
    if (this.defaultFee.storage < _customStorage) {
      // add to limits evenly
      const addPerOp = Math.floor(diff / storage_limits.length);
      diff -= addPerOp * storage_limits.length;
      storage_limits = storage_limits.map((s) => {
        return s + addPerOp;
      });
      // distribute rest
      storage_limits = storage_limits.map((s) => {
        if (diff > 0) {
          diff--;
          return s + 1;
        } else {
          return s;
        }
      });
    } else {
      for (let i = 0; i < 10; i++) {
        const nonZeroLimits = storage_limits.reduce((n, s) => {
          return n + (!s ? 0 : 1);
        }, 0);
        const removePerOp = Math.max(Math.floor(diff / nonZeroLimits), 1);
        storage_limits = storage_limits.map((s) => {
          const toRemove = Math.min(removePerOp, diff, s);
          diff -= toRemove;
          return s - toRemove;
        });
        if (diff < 1) {
          break;
        }
      }
    }
    return storage_limits;
  }

  closeModalAction(emit: string = null): void {
    ModalComponent.currentModel.next({ name: '', data: null });
    this.operationResponse.emit(emit);
    this.reset();
  }
  closeModal(): void {
    ModalComponent.currentModel.next({ name: '', data: null });
    this.reset();
    this.messageService?.stopSpinner();
  }
  reset(): void {
    this.defaultFee = undefined;
    this.customFee = null;
    this.operations = [];
    this.hash = undefined;
    this.counter = undefined;
    this.opbytes = '';
    this.balanceChange = '';
    this.subscriptions.unsubscribe();
    this.interval ? clearInterval(this.interval) : null;
    this.interval = undefined;
    if (this.syncSub) {
      this.syncSub.unsubscribe();
      this.syncSub = undefined;
    }
  }
  onCustomFeeChange(event) {
    this.customFee = event;
    this.prepareOperations();
  }
  onCloseEvent(_event) {
    this.closeModal();
  }
  onResetEvent(_event) {
    this.reset();
  }
  onClearModalEvent(_event) {
    this.closeModalAction('silent');
    // ModalComponent.currentModel.next({ name: '', data: null });
  }
  onSignedBytes(signedOperationBytes: string) {
    console.log('signedOperationBytes', signedOperationBytes);
    const _senderAddress = this.account.pkh;
    const _operations = structuredClone(this.operations);
    this.closeModal();
    this.operationService.broadcast(signedOperationBytes, this.estimateService.protocol, this.account.pkh.startsWith('tz1')).subscribe((res) => {
      if (res?.success) {
        this.operationResponse.emit(res.payload.opHash);
        const metadata = {
          operations: _operations,
          opHash: res.payload.opHash,
          kt1: res?.payload?.newKT1s || undefined
        };
        this.coordinatorService.boost(_senderAddress, metadata);
      } else {
        console.error(res.payload.msg);
        this.messageService.addError(res.payload.msg, 0);
        this.operationResponse.emit('broadcast_error');
      }
      console.log('broadcast result', res);
    });
  }
}
