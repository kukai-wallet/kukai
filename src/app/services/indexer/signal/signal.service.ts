import { Injectable } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { CONSTANTS } from '../../../../environments/environment';
import { WalletService } from '../../wallet/wallet.service';
import { Account } from '../../wallet/wallet';
import { ActivityService } from '../../activity/activity.service';
import { OperationService } from '../../operation/operation.service';
import { BalanceService } from '../../balance/balance.service';
import { DelegateService } from '../../delegate/delegate.service';
import { timeout } from 'rxjs/operators';
import { of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SignalService {
  connection: any = null;
  constructor(
    private walletService: WalletService,
    private activityService: ActivityService,
    private operationService: OperationService,
    private balanceService: BalanceService,
    private delegateService: DelegateService
  ) {
    this.init();
  }
  async init() {
    this.connection = new HubConnectionBuilder()
      .withUrl(`https://api.${CONSTANTS.NETWORK}.tzkt.io/v1/events`)
      .build();
    this.connection.on("operations", (msg) => {
      for (const op of msg.data) {
        if (op?.status === 'applied') {
          console.log("%csignalR msg", "color: green;", op);
          const sender: string = op?.sender?.address ?? '';
          const target: string = op?.target?.address ?? '';
          const opHash: string = op?.hash ?? '';
          const invoke: boolean = !!op?.parameter;
          this.confirmStatus(opHash, sender, op.timestamp, invoke);
          this.confirmStatus(opHash, target, op.timestamp, invoke);
        }
      }
    });
    this.connection.onclose(async () => {
      await this.start();
    });
    this.start();
  }
  confirmStatus(opHash: string, address: string, timestamp: string, invoke: boolean) {
    if (opHash && address && this.walletService.wallet) {
      if (this.walletService.wallet) {
        const account: Account = this.walletService.wallet.getAccount(address);
        if (account) {
          for (let i in account.activities) {
            if (account.activities[i].hash === opHash && account.activities[i].status === 0) {
              account.activities[i].timestamp = (new Date(timestamp)).getTime();
              if (invoke) {
                account.activities[i].status = 0.5;
              } else {
                account.activities[i].status = 1;
                this.activityService.promptNewActivities(account, [], [account.activities[i]]);
                this.updateAccountData(address);
              }
            }
          }
        }
      }
    }
  }
  updateAccountData(pkh: string) {
    this.operationService.getAccount(pkh).subscribe((ans: any) => {
      if (ans.success) {
        this.balanceService.updateAccountBalance(
          this.walletService.wallet?.getAccount(pkh),
          Number(ans.payload.balance)
        );
        const acc = this.walletService.wallet?.getAccount(pkh);
        this.delegateService.handleDelegateResponse(acc, ans.payload.delegate);
      } else {
      }
    });
  }

  async start() {
    try {
        if(!!this.connection?.start) {
          await this.connection?.start();
          console.log("%cSignalR Connected!", "color:green;");
        } else {
          setTimeout(() => {
            this.start();
          }, 5000);
        }
    } catch (err) {
        console.log(err);
        setTimeout(() => {
          this.start();
        }, 5000);
    }
}

  // async start() {
  //   console.log("here");
  //   await this.connection?.stop()
  //   try {
  //     if (!(await this.connection?.start())) {
  //       setTimeout(async () => {
  //         await this.start();
  //       }, 5000);
  //     } else {
  //       console.log("%cSignalR Connected!", "color:green;");
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     setTimeout(async () => {
  //       await this.start();
  //     }, 5000);
  //   }
  // };
  async subscribeToAccount(address: string) {
    console.log('Listen to: ' + address);
    await this.connection.invoke("SubscribeToOperations", { address, types: 'transaction,delegation,origination' });
  }
  ngOnDestroy() {
    try {
      this.connection.stop();
      console.log("%cSignalR Disconnected!", "color:red;");
    } catch (e) { }
  }
}
