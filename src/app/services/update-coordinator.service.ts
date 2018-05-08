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
}
enum State {
  UpToDate,
  Wait,
  Updating
}

@Injectable()
export class UpdateCoordinatorService {
  scheduler: Map<string, any> = new Map<string, any>(); // pkh + delay
  defaultDelayActivity = 60000; // 60s
  shortDelayActivity = 2000; // 5s
  tzrateInterval: any;
  defaultDelayPrice = 300000; // 300s
  constructor(
    private activityService: ActivityService,
    private tzrateService: TzrateService,
    private walletService: WalletService
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
    if (pkh && !this.scheduler.get(pkh)) {
      console.log('Start scheduler ' + this.walletService.getIndexFromPkh(pkh));
      const scheduleData: ScheduleData = {
        state: State.UpToDate,
        interval: setInterval(() => this.update(pkh), this.defaultDelayActivity),
        stateCounter: 0
      };
      this.scheduler.set(pkh, scheduleData);
      this.update(pkh);
    }
  }
  async boost(pkh: string) { // Expect action
    if (this.walletService.getIndexFromPkh(pkh) !== -1) {
      if (!this.scheduler.get(pkh)) {
        await this.start(pkh);
      }
      this.changeState(pkh, State.Wait);
      this.update(pkh);
      const counter = this.scheduler.get(pkh).stateCounter;
      setTimeout(() => { // Failsafe
        if (this.scheduler.get(pkh).stateCounter === counter) {
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
      err => console.log('Error in start()'),
      () => console.log('account[' + this.walletService.getIndexFromPkh(pkh) + '][' + this.scheduler.get(pkh).state + ']: <<')
    );
  }
  changeState(pkh: string, newState: State) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    scheduleData.state = newState;
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
