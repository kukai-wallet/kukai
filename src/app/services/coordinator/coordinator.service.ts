import { Injectable } from "@angular/core";
import { ActivityService } from "../activity/activity.service";
import { TzrateService } from "../tzrate/tzrate.service";
import { BalanceService } from "../balance/balance.service";
import { WalletService } from "../wallet/wallet.service";
import { DelegateService } from "../delegate/delegate.service";
import { OperationService } from "../operation/operation.service";
import { ErrorHandlingPipe } from "../../pipes/error-handling.pipe";
import { Account } from '../wallet/wallet';

export interface ScheduleData {
  pkh: string;
  state: State;
  interval: any;
  stateCounter: number;
}
enum State {
  UpToDate,
  Wait,
  Updating,
}

@Injectable()
export class CoordinatorService {
  scheduler: Map<string, any> = new Map<string, any>(); // pkh + delay
  defaultDelayActivity = 30000; // 30s
  shortDelayActivity = 5000; // 5s
  tzrateInterval: any;
  boostTimeout: any;
  defaultDelayPrice = 300000; // 300s
  accounts: Account[];
  constructor(
    private activityService: ActivityService,
    private tzrateService: TzrateService,
    private walletService: WalletService,
    private balanceService: BalanceService,
    private delegateService: DelegateService,
    private operationService: OperationService,
    private errorHandlingPipe: ErrorHandlingPipe
  ) {}
  startAll() {
    if (this.walletService.wallet) {
      this.accounts = this.walletService.wallet.getAccounts();
      for (let i = 0; i < this.accounts.length; i++) {
        console.log("Start account " + i + " " + this.accounts[i].address);
        this.start(this.accounts[i].address);
      }
      this.startXTZ();
    } else {
      console.log('no wallet found');
    }
  }
  startXTZ() {
    if (!this.tzrateInterval) {
      console.log("Start scheduler XTZ");
      this.tzrateService.getTzrate();
      this.tzrateInterval = setInterval(
        () => this.tzrateService.getTzrate(),
        this.defaultDelayPrice
      );
    }
  }
  async start(pkh: string) {
    if (pkh && !this.scheduler.get(pkh)) {
      this.accounts = this.walletService.wallet.getAccounts();
      console.log("Start scheduler " + this.scheduler.size + " " + pkh);
      const scheduleData: ScheduleData = {
        pkh: pkh,
        state: State.UpToDate,
        interval: setInterval(
          () => this.update(pkh),
          this.defaultDelayActivity
        ),
        stateCounter: 0,
      };
      this.scheduler.set(pkh, scheduleData);
      this.update(pkh);
      this.updateAccountData(pkh);
    }
  }
  async boost(pkh: string, changedDelegate?: boolean) {
    // Expect action
    console.log("boost " + pkh);
    if (this.walletService.addressExists(pkh)) {
      if (!this.scheduler.get(pkh)) {
        await this.start(pkh);
      }
      if (this.scheduler.get(pkh).state !== State.Wait) {
        this.changeState(pkh, State.Wait);
        this.update(pkh);
        const counter = this.scheduler.get(pkh).stateCounter;
        this.boostTimeout = setTimeout(() => {
          // Failsafe
          if (
            this.scheduler &&
            this.scheduler.get(pkh).stateCounter === counter
          ) {
            console.log("Timeout from wait state");
            this.changeState(pkh, State.UpToDate);
          }
        }, 150000);
      }
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
            console.log("No state found!");
            break;
          }
        }
      },
      err => console.log("Error in update(): " + JSON.stringify(err)),
      () =>
        console.log(
          "account[" +
            this.accounts.findIndex((a) => a.address === pkh) +
            "][" +
            this.scheduler.get(pkh).state +
            "]: <<"
        )
    );
  }
  changeState(pkh: string, newState: State) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    scheduleData.state = newState;
    if (newState === State.UpToDate) {
      this.updateAccountData(pkh);
    }
    if (newState === State.Wait || newState === State.Updating) {
      clearInterval(scheduleData.interval);
      scheduleData.interval = setInterval(
        () => this.update(pkh),
        this.shortDelayActivity
      );
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
      console.log("Stop all schedulers");
      for (
        let i = 0;
        i < this.accounts.length;
        i++
      ) {
        this.stop(this.accounts[i].address);
      }
      clearInterval(this.tzrateInterval);
      this.tzrateInterval = null;
      clearTimeout(this.boostTimeout);
      this.boostTimeout = null;
    }
  }
  async stop(pkh) {
    console.log(
      "Stop scheduler " + this.accounts.findIndex((a) => a.address === pkh)
    );
    clearInterval(this.scheduler.get(pkh).interval);
    this.scheduler.get(pkh).interval = null;
    this.scheduler.delete(pkh);
  }
  updateAccountData(pkh: string) {
    // Maybe also check for originations to account?
    console.log('update account data for ' + pkh);
    this.operationService.getAccount(pkh).subscribe((ans: any) => {
      if (ans.success) {
        this.balanceService.updateAccountBalance(
          this.walletService.wallet.getAccount(pkh),
          Number(ans.payload.balance)
        );
        const acc = this.walletService.wallet.getAccount(pkh);
        this.delegateService.handleDelegateResponse(acc, ans.payload.delegate);
      } else {
        console.log("updateAccountData -> getAccount failed ", ans.payload.msg);
      }
    });
  }
}
