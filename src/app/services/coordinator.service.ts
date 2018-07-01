import { Injectable } from '@angular/core';
import { ActivityService } from './activity.service';
import { TzrateService } from './tzrate.service';
import { BalanceService } from './balance.service';
import { WalletService } from './wallet.service';
import { DelegateService } from './delegate.service';
import { OperationService } from './operation.service';
import { ErrorHandlingPipe } from '../pipes/error-handling.pipe';

export interface ScheduleData {
  state: State;
  interval: any;
  stateCounter: number;
}
enum State {
  UpToDate,
  Wait,
  Updating
}

@Injectable()
export class CoordinatorService {
  scheduler: Map<string, any> = new Map<string, any>(); // pkh + delay
  defaultDelayActivity = 30000; // 30s
  shortDelayActivity = 2000; // 5s
  tzrateInterval: any;
  defaultDelayPrice = 300000; // 300s
  broadcastDone = false;
  constructor(
    private activityService: ActivityService,
    private tzrateService: TzrateService,
    private walletService: WalletService,
    private balanceService: BalanceService,
    private delegateService: DelegateService,
    private operationService: OperationService,
    private errorHandlingPipe: ErrorHandlingPipe
  ) { }
  startAll() {
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.start(this.walletService.wallet.accounts[i].pkh);
    }
    this.startXTZ();
  }
  startXTZ() {
    if (!this.tzrateInterval) {
      console.log('Start scheduler XTZ');
      this.tzrateService.getTzrate();
      this.tzrateInterval = setInterval(() => this.tzrateService.getTzrate(), this.defaultDelayPrice);
    }
  }
  async start(pkh: string) {
    if (pkh && !this.scheduler.get(pkh)) { // maybe add delay if !this.walletService.getIndexFromPkh(pkh) or prevent it
      console.log('Start scheduler ' + this.walletService.getIndexFromPkh(pkh) + ' ' + pkh);
      const scheduleData: ScheduleData = {
        state: State.UpToDate,
        interval: setInterval(() => this.update(pkh), this.defaultDelayActivity),
        stateCounter: 0
      };
      this.scheduler.set(pkh, scheduleData);
      this.update(pkh);
      this.updateAccountData(pkh);
    }
  }
  async boost(pkh: string, changedDelegate?: boolean) { // Expect action
    if (this.walletService.getIndexFromPkh(pkh) !== -1) {
      if (!this.scheduler.get(pkh)) {
        await this.start(pkh);
      }
      this.changeState(pkh, State.Wait);
      this.update(pkh);
      const counter = this.scheduler.get(pkh).stateCounter;
      setTimeout(() => { // Failsafe
        if (this.scheduler && this.scheduler.get(pkh).stateCounter === counter) {
          console.log('Timeout from wait state');
          this.changeState(pkh, State.UpToDate);
        }
      }, 75000);
    } else {
    }
  }
  async update(pkh) {
    this.setDelay(pkh, this.defaultDelayActivity);
    this.activityService.updateTransactions(pkh).subscribe(
      (ans: any) => {
        switch (this.scheduler.get(pkh).state) {
          case State.UpToDate: {
            if (!ans.upToDate) {
              this.changeState(pkh, State.Updating);
            }
            break;
          }
          case State.Wait: {
            if (!ans.upToDate) {
              this.changeState(pkh, State.Updating);
            } else {
              this.setDelay(pkh, this.shortDelayActivity);
            }
            break;
          }
          case State.Updating: {
            if (ans.upToDate) {
              this.changeState(pkh, State.UpToDate);
            } else {
              this.setDelay(pkh, this.shortDelayActivity);
            }
            break;
          }
          default: {
            console.log('No state found!');
            break;
          }
        }
      },
      err => console.log('Error in update(): ' + JSON.stringify(err)),
      () => console.log('account[' + this.walletService.getIndexFromPkh(pkh) + '][' + this.scheduler.get(pkh).state + ']: <<')
    );
  }
  changeState(pkh: string, newState: State) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    scheduleData.state = newState;
    if (!this.walletService.isFullWallet() && newState === State.UpToDate && this.broadcastDone) {
      // Broadcasted operation included in block. Check for new accounts.
      const i = this.walletService.getIndexFromPkh(pkh);
      for (let n = 0; n < this.walletService.wallet.accounts[i].activities.length; n++) {
        const op = this.walletService.wallet.accounts[i].activities[n];
        if (op.type === 'Origination') {
          if (this.walletService.getIndexFromPkh(op.destination) === -1) {
            console.log('New account found, adding to wallet!');
            this.walletService.addAccount(op.destination);
            this.balanceService.getAccountBalance(this.walletService.getIndexFromPkh(op.destination));
            this.start(op.destination);
          }
        }
      }
      this.broadcastDone = false;
    }
    if (newState === State.UpToDate) {
      this.balanceService.getBalanceAll();
      this.delegateService.getDelegate(pkh);
    }
    if (newState === State.Wait || newState === State.Updating) {
      clearInterval(scheduleData.interval);
      scheduleData.interval = setInterval(() => this.update(pkh), this.shortDelayActivity);
    }
    scheduleData.stateCounter++;
    this.scheduler.set(pkh, scheduleData);
  }
  setDelay(pkh: string, time: number) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    if (scheduleData.interval) {
      clearInterval(scheduleData.interval);
    }
    scheduleData.interval = setInterval(() => this.update(pkh), time);
    this.scheduler.set(pkh, scheduleData);
  }
  setBroadcast() {
    this.broadcastDone = true;
  }
  stopAll() {
    if (this.walletService.wallet) {
      console.log('Stop all schedulers');
      for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
        this.stop(this.walletService.wallet.accounts[i].pkh);
      }
      clearInterval(this.tzrateInterval);
      this.tzrateInterval = null;
    }
  }
  async stop(pkh) {
    console.log('Stop scheduler ' + this.walletService.getIndexFromPkh(pkh));
    clearInterval(this.scheduler.get(pkh).interval);
    this.scheduler.get(pkh).interval = null;
    this.scheduler.delete(pkh);
  }
  updateAccountData(pkh: string) { // Maybe also check for originations to account?
    this.operationService.getAccount(pkh).subscribe(
      (ans: any) => {
        if (ans.success) {
          const index = this.walletService.getIndexFromPkh(pkh);
          this.balanceService.updateAccountBalance(index, ans.payload.balance);
          this.delegateService.handleDelegateResponse(pkh, ans.payload.delegate);
        } else {
          console.log('updateAccountData -> getAccount failed ', ans.payload.msg);
        }
      }
    );
  }
}
