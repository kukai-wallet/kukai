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
  /*activityInterval: any;
  tzrateInterval: any;
  boostInterval: any;
  boostCount = 0;*/
  scheduler: Map<string, any> = new Map<string, any>(); // pkh + delay
  defaultDelayActivity = 60000; // 30s
  shortDelayActivity = 3000; // 3s
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
    this.tzrateService.getTzrate();
    this.tzrateInterval = setInterval(() => this.tzrateService.getTzrate(), this.defaultDelayPrice);
  }
  start(pkh: string) {
    if (!this.scheduler.get(pkh)) {
      console.log('Starting sceduler for: ' + pkh);
      const scheduleData: ScheduleData = {
        state: State.UpToDate,
        interval: setInterval(() => this.update(pkh), this.defaultDelayActivity),
        stateCounter: 0
      };
      this.scheduler.set(pkh, scheduleData);
      this.update(pkh);
    }
  }
  boost(pkh: string) { // Expect action
    if (this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh) !== -1) {
      this.changeState(pkh, State.Wait);
      this.update(pkh);
      const counter = this.scheduler.get(pkh).stateCounter;
      setTimeout(() => { // Failsafe
        if (this.scheduler.get(pkh).stateCounter === counter) {
          console.log('Timeout from wait state');
          this.changeState(pkh, State.UpToDate);
        }
      }, 150000);
    }
  }
  update(pkh) {
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
            }
            break;
          }
          case State.Updating: {
            if (ans.upToDate) {
              this.changeState(pkh, State.UpToDate);
            }
            break;
          }
          default: {
            break;
          }
        }
        // console.log('response from transaction(): ' + JSON.stringify(ans));
    },
      err => console.log('Error in start()'),
      () => null // console.log('Done for: ' + pkh)
    );
  }
  changeState(pkh: string, state: State) {
    console.log(pkh + ': => State: ' + state.toString());
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    scheduleData.state = state;
    if (state === State.Wait || state === State.Updating) {
      clearInterval(scheduleData.interval);
      scheduleData.interval = setInterval(() => this.update(pkh), this.shortDelayActivity);
    } else {
      clearInterval(scheduleData.interval);
      scheduleData.interval = setInterval(() => this.update(pkh), this.defaultDelayActivity);
    }
    scheduleData.stateCounter++;
    this.scheduler.set(pkh, scheduleData);
  }
  stopAll() {
    console.log('Update coordinator: Stoping all schedulers');
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.stop(this.walletService.wallet.accounts[i].pkh);
    }
    clearInterval(this.tzrateInterval);
  }
  stop(pkh) {
    console.log('Stoping sceduler for: ' + pkh);
    this.scheduler.delete(pkh);
  }
}
