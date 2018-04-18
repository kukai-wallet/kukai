import { Injectable } from '@angular/core';
import { ActivityService } from './activity.service';
import { TzrateService } from './tzrate.service';
import { BalanceService } from './balance.service';

@Injectable()
export class UpdateCoordinatorService {
  activityInterval: any;
  tzrateInterval: any;
  boostInterval: any;
  boostCount = 0;
  activityIntervalTime = 60000;
  tzrateIntervalTime = 300000;
  constructor(
    private activityService: ActivityService,
    private tzrateService: TzrateService
  ) { }
  start() {
    if (!this.activityInterval) {
      console.log('Update coordinator started');
      this.activityService.updateAllTransactions();
      this.tzrateService.getTzrate();
      this.activityInterval = setInterval(() => this.activityService.updateAllTransactions(), this.activityIntervalTime);
      this.tzrateInterval = setInterval(() => this.tzrateService.getTzrate(), this.tzrateIntervalTime);
    }
  }
  stop() {
    clearInterval(this.activityInterval);
    clearInterval(this.tzrateInterval);
    clearInterval(this.boostInterval);
    this.activityInterval = null;
  }
  boost() {
    clearInterval(this.activityInterval);
    this.boostCount = 0;
    clearInterval(this.boostInterval);
    this.activityService.updateAllTransactions();
    this.boostInterval = setInterval(() => this.boostAction(), 10000);
  }
  boostAction() {
    if (this.boostCount <= 8) { // 0-30s
      this.activityService.updateAllTransactions();
      this.boostCount++;
    } else { // set normal interval
      clearInterval(this.boostInterval);
      this.activityInterval = setInterval(() => this.activityService.updateAllTransactions(), this.activityIntervalTime);
    }
  }
}
