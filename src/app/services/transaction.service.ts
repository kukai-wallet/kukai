import { Injectable } from '@angular/core';
import { BalanceService } from './balance.service';
import { MessageService } from './message.service';
import * as lib from '../../assets/js/main.js';
import { KeyPair } from './../interfaces';

@Injectable()
export class TransactionService {

  constructor(
    private messageService: MessageService,
    private balanceService: BalanceService
  ) { }
  async sendTransaction(keys: KeyPair, from: string, to: string, amount: number, fee: number): Promise<boolean> {
    if (keys) {
      const promise = lib.eztz.rpc.transfer(keys, from, to, amount, fee);
      if (promise != null) {
        return promise.then(
          (val) => this.successfulTransaction(val),
          (err) => this.unSsuccessfulTransaction(err)
        );
      }
    }
  }
  successfulTransaction(val: any, ): boolean {
    this.balanceService.getBalanceAll();
    return true;
  }
  unSsuccessfulTransaction(err: any, ) {
    this.messageService.addError('err: ' + JSON.stringify(err));
    return false;
  }
  setDelegate(keys: KeyPair, from: string, to: string, fee: number) {
    if (keys) {
      const promise = lib.eztz.rpc.setDelegate(keys, from, to, fee);
      if (promise != null) {
        promise.then(
          (val) => this.successfulDelegation(val),
          (err) => this.messageService.addError('err: ' + JSON.stringify(err))
        );
      }
    }
  }
  successfulDelegation(val: any, ) {
    this.messageService.addSuccess('Delegate set!');
  }
}
