import { Injectable } from '@angular/core';
import { ActivityService } from './activity.service';
import { TzrateService } from './tzrate.service';
import { BalanceService } from './balance.service';
import { WalletService } from './wallet.service';
// import { setInterval } from 'timers';

export interface ScheduleData {
  state: State;
  interval: any;
  stateCounter: number;
  changedDelegate?: boolean;
}
enum State {
  UpToDate,
  Wait,
  Updating
}

@Injectable()
export class CoordinatorService {
  scheduler: Map<string, any> = new Map<string, any>(); // pkh + delay
  defaultDelayActivity = 60000; // 60s
  shortDelayActivity = 2000; // 5s
  tzrateInterval: any;
  defaultDelayPrice = 300000; // 300s
  broadcastDone = false;
  constructor(
    private activityService: ActivityService,
    private tzrateService: TzrateService,
    private walletService: WalletService,
    private balanceService: BalanceService
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
      this.balanceService.getBalanceAll();
    }
  }
  async start(pkh: string) {
    if (pkh && !this.scheduler.get(pkh)) { // maybe add delay if !this.walletService.getIndexFromPkh(pkh) or prevent it
      console.log('Start scheduler ' + this.walletService.getIndexFromPkh(pkh));
      const scheduleData: ScheduleData = {
        state: State.UpToDate,
        interval: setInterval(() => this.update(pkh), this.defaultDelayActivity),
        stateCounter: 0
      };
      this.scheduler.set(pkh, scheduleData);
      this.update(pkh);
      if (this.walletService.wallet.accounts[0].pkh !== pkh) {
        this.activityService.getDelegate(pkh);
      }
    }
  }
  async boost(pkh: string, changedDelegate?: boolean) { // Expect action
    if (this.walletService.getIndexFromPkh(pkh) !== -1) {
      if (!this.scheduler.get(pkh)) {
        await this.start(pkh);
      } if (changedDelegate) {
        this.setChangedDelegate(pkh);
      }
      this.changeState(pkh, State.Wait);
      this.update(pkh);
      const counter = this.scheduler.get(pkh).stateCounter;
      setTimeout(() => { // Failsafe
        if (this.scheduler && this.scheduler.get(pkh).stateCounter === counter) {
          console.log('Timeout from wait state');
          this.changeState(pkh, State.UpToDate);
        }
      }, 150000);
    } else {
    }
  }
  async update(pkh) {
    console.log('account[' + this.walletService.getIndexFromPkh(pkh) + '][' + this.scheduler.get(pkh).state + ']: >>');
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
      err => console.log('Error in update()'),
      () => console.log('account[' + this.walletService.getIndexFromPkh(pkh) + '][' + this.scheduler.get(pkh).state + ']: <<')
    );
  }
  changeState(pkh: string, newState: State) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    scheduleData.state = newState;
    if (!this.walletService.isFullWallet() && newState === State.UpToDate && this.broadcastDone) {
      // Broadcasted operation included in block. Assume it could be any op (temp fix)
      this.activityService.getDelegate(pkh);
      // this.importService.findNumberOfAccounts(this.walletService.wallet.accounts[0].pkh);
      const i = this.walletService.getIndexFromPkh(pkh);
      for (let n = 0; n < this.walletService.wallet.accounts[i].activities.length; n++) {
        const op = this.walletService.wallet.accounts[i].activities[n];
        if (op.type === 'Origination') {
          console.log('New origination found');
          console.log(op.destination);
          console.log(this.walletService.getIndexFromPkh(op.destination));
          if (this.walletService.getIndexFromPkh(op.destination) === -1) {
            console.log('New pkh, adding to wallet!');
            this.walletService.addAccount(op.destination);
            this.balanceService.getAccountBalance(this.walletService.getIndexFromPkh(op.destination));
            this.start(op.destination);
          }
        }
      }
      this.broadcastDone = false;
    }
    if (newState === State.UpToDate && scheduleData.changedDelegate) { // Update delegate
      console.log('Looking for new delegate for ' + pkh);
      this.activityService.getDelegate(pkh);
      this.clearChangedDelegate(pkh);
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
  setChangedDelegate(pkh: string) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    scheduleData.changedDelegate = true;
    this.scheduler.set(pkh, scheduleData);
  }
  clearChangedDelegate(pkh: string) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    scheduleData.changedDelegate = undefined;
    this.scheduler.set(pkh, scheduleData);
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
}
