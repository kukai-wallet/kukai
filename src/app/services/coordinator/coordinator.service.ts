import { Injectable } from '@angular/core';
import { ActivityService } from '../activity/activity.service';
import { TzrateService } from '../tzrate/tzrate.service';
import { BalanceService } from '../balance/balance.service';
import { WalletService } from '../wallet/wallet.service';
import { DelegateService } from '../delegate/delegate.service';
import { OperationService } from '../operation/operation.service';
import { Account, OpStatus, TorusWallet } from '../wallet/wallet';
import Big from 'big.js';
import { TokenService } from '../token/token.service';
import { LookupService } from '../lookup/lookup.service';
import { CONSTANTS } from '../../../environments/environment';
import { SubjectService } from '../subject/subject.service';
import { interval } from 'rxjs';
import { SignalService } from '../indexer/signal/signal.service';
import { UnlockableService } from '../unlockable/unlockable.service';
import { DipDupService } from '../indexer/dipdup/dipdup.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

export interface ScheduleData {
  pkh: string;
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
  defaultDelayActivity = CONSTANTS.MAINNET ? 30000 : 15000; // 30/15s
  shortDelayActivity = 5000; // 5s
  longDelayActivity = 120000; // 2m
  defaultDelayPrice = 300000; // 5m
  tzrateInterval: any;
  accounts: Account[];
  constructor(
    private activityService: ActivityService,
    private tzrateService: TzrateService,
    private walletService: WalletService,
    private balanceService: BalanceService,
    private delegateService: DelegateService,
    private operationService: OperationService,
    private tokenService: TokenService,
    private dipdupService: DipDupService,
    private lookupService: LookupService,
    private subjectService: SubjectService,
    private signalService: SignalService,
    private unlockableService: UnlockableService,
    public router: Router,
    private location: Location
  ) {
    this.subjectService.logout.subscribe((o) => {
      if (!!o) {
        this.stopAll();
      }
    });
    this.subjectService.activeAccount.subscribe((activeAccount) => {
      if (this.walletService.wallet) {
        this.accounts = this.walletService.wallet.getAccounts();
        this.accounts.forEach(({ address }) => {
          if (address === activeAccount?.address) {
            this.start(activeAccount.address, this.defaultDelayActivity);
          } else {
            this.start(address, this.longDelayActivity);
          }
        });
        this.startXTZ();
      }
    });
  }
  startXTZ() {
    if (!this.tzrateInterval) {
      console.debug('Start scheduler XTZ');
      this.signalService.init();
      const update = () => {
        this.tzrateService.getTzrate();
        this.dipdupService.fetchTokensMidPrice();
        this.lookupService.recheckWalletAddresses(true);
      };
      this.tzrateInterval = interval(this.defaultDelayPrice).subscribe(() => update());
      update();
    }
  }
  async start(pkh: string, delay: number) {
    this.unlockableService.restoreFeatures();
    if (pkh && !this.scheduler.get(pkh)) {
      this.accounts = this.walletService.wallet.getAccounts();
      console.debug('Start scheduler ' + this.scheduler.size + ' ' + pkh);
      const scheduleData: ScheduleData = {
        pkh: pkh,
        state: State.UpToDate,
        interval: interval(this.defaultDelayActivity).subscribe(() => this.update(pkh)),
        stateCounter: 0
      };
      this.scheduler.set(pkh, scheduleData);
      this.update(pkh);
      this.updateAccountData(pkh);
    } else if (pkh && this.scheduler.get(pkh)) {
      this.setDelay(pkh, delay);
    }
  }
  async boost(pkh: string, metadata: any = null) {
    const path = this.location.path();
    const embedded = path.startsWith('/embedded');
    if (embedded) {
      return;
    }
    // Expect action
    console.log('boost ' + pkh);
    if (this.walletService.addressExists(pkh)) {
      if (metadata) {
        this.addUnconfirmedOperations(pkh, metadata);
      }
      if (!this.scheduler.get(pkh)) {
        await this.start(pkh, this.defaultDelayActivity);
      }
      this.signalService.subscribeToAccount(pkh);
      if (this.scheduler.get(pkh).state !== State.Wait) {
        this.changeState(pkh, State.Wait);
        this.update(pkh);
        const counter = this.scheduler.get(pkh).stateCounter;
        setTimeout(() => {
          // Failsafe
          if (this.scheduler?.size && this.scheduler.get(pkh).stateCounter === counter) {
            console.log('Timeout from wait state');
            this.changeState(pkh, State.UpToDate);
          }
        }, 75000);
      }
    }
  }
  async update(pkh) {
    this.setDelay(pkh, this.defaultDelayActivity);
    this.activityService.updateTransactions(pkh).subscribe(
      (ans: any) => {
        switch (this.scheduler.get(pkh) ? this.scheduler.get(pkh).state : -1) {
          case State.UpToDate: {
            if (!ans.upToDate) {
              this.changeState(pkh, State.Updating);
            } else if (ans?.balance) {
              const balance = this.walletService.wallet?.getAccount(pkh).balanceXTZ;
              if (balance !== ans.balance) {
                console.log('recheck balance');
                this.updateAccountData(pkh);
              }
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
        const acc = this.walletService.wallet?.getAccount(pkh);
        if (acc?.activities?.length) {
          const latestActivity = acc.activities[0];
          if (latestActivity.status === OpStatus.UNCONFIRMED) {
            const age = new Date().getTime() - new Date(latestActivity.timestamp).getTime();
            if (age > 3600000) {
              // 60m
              acc.activities.shift();
              this.walletService.storeWallet();
            }
          }
        }
        if (this.walletService.wallet instanceof TorusWallet) {
          this.walletService.wallet.checkSkExpiration();
        }
      },
      (err) => {
        console.log('Error in update()');
        console.error(err);
      },
      () => {
        console.debug(
          `account[${this.accounts.findIndex((a) => a.address === pkh)}][${
            typeof this.scheduler.get(pkh)?.state !== 'undefined' ? this.scheduler.get(pkh).state : '*'
          }]: <<`
        );
      }
    );
  }
  changeState(pkh: string, newState: State) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    scheduleData.state = newState;
    if (newState === State.UpToDate || newState === State.Updating) {
      this.updateAccountData(pkh);
    }
    if (newState === State.Wait || newState === State.Updating) {
      scheduleData.interval.unsubscribe();
      scheduleData.interval = interval(this.shortDelayActivity).subscribe(() => this.update(pkh));
    }
    scheduleData.stateCounter++;
    this.scheduler.set(pkh, scheduleData);
  }
  setDelay(pkh: string, time: number) {
    const scheduleData: ScheduleData = this.scheduler.get(pkh);
    if (scheduleData.interval) {
      scheduleData.interval.unsubscribe();
    }
    scheduleData.interval = interval(time).subscribe(() => this.update(pkh));
    this.scheduler.set(pkh, scheduleData);
  }
  stopAll() {
    if (this.walletService.wallet) {
      if (this.accounts?.length) {
        console.log('Stop all schedulers');
        for (const account of this.accounts) {
          this.stop(account.address);
        }
      }
      if (this.tzrateInterval) {
        this.tzrateInterval.unsubscribe();
        this.tzrateInterval = null;
      }
    }
  }
  async stop(pkh) {
    console.log('Stop scheduler ' + this.accounts.findIndex((a) => a.address === pkh));
    if (this.scheduler.get(pkh)) {
      this.scheduler.get(pkh).interval.unsubscribe();
      this.scheduler.get(pkh).interval = null;
      this.scheduler.delete(pkh);
    }
  }
  updateAccountData(pkh: string) {
    // Maybe also check for originations to account?
    console.debug('update account data for ' + pkh);
    this.operationService.getAccount(pkh).subscribe((ans: any) => {
      if (ans.success) {
        this.balanceService.updateAccountBalance(this.walletService.wallet?.getAccount(pkh), Number(ans.payload.balance));
        const acc = this.walletService.wallet?.getAccount(pkh);
        this.delegateService.handleDelegateResponse(acc, ans.payload.delegate);
      } else {
        console.log('updateAccountData -> getAccount failed ', ans.payload.msg);
      }
    });
  }
  addUnconfirmedOperations(from: string, metadata: any) {
    const account = this.walletService.wallet?.getAccount(from);
    if (!account.activities) {
      return;
    }
    if (metadata.transactions) {
      console.log('Unconfirmed transactions:');
      console.log(metadata.transactions);
      const decimals =
        metadata.tokenTransfer && this.tokenService.getAsset(metadata.tokenTransfer) ? this.tokenService.getAsset(metadata.tokenTransfer).decimals : 6;
      for (const op of metadata.transactions) {
        const transaction = {
          type: 'transaction',
          status: OpStatus.UNCONFIRMED,
          amount: Big(op.amount)
            .times(10 ** decimals)
            .toString(),
          fee: null,
          source: { address: from },
          destination: { address: op.destination },
          hash: metadata.opHash,
          block: null,
          timestamp: new Date().getTime(),
          tokenId: metadata.tokenTransfer ? metadata.tokenTransfer : undefined,
          entrypoint: op.parameters?.entrypoint ? op.parameters.entrypoint : ''
        };
        account.activities.unshift(transaction);
        const destinationAccount = this.walletService.wallet?.getAccount(op.destination);
        if (destinationAccount) {
          destinationAccount.activities.unshift({ ...transaction });
        }
      }
    } else if (metadata.delegate !== undefined) {
      const delegation = {
        type: 'delegation',
        status: OpStatus.UNCONFIRMED,
        amount: null,
        fee: null,
        source: { address: from },
        destination: { address: metadata.delegate },
        hash: metadata.opHash,
        block: null,
        timestamp: new Date().getTime()
      };
      account?.activities.unshift(delegation);
    } else if (metadata.origination !== undefined) {
      const origination = {
        type: 'origination',
        status: OpStatus.UNCONFIRMED,
        amount: metadata.origination.balance,
        fee: null,
        source: { address: from },
        destination: { address: metadata.kt1 },
        hash: metadata.opHash,
        block: null,
        timestamp: new Date().getTime()
      };
      account?.activities.unshift(origination);
    } else {
      console.log('Unknown metadata', metadata);
    }
    this.walletService.storeWallet();
  }
}
