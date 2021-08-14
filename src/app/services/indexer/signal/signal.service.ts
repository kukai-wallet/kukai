import { Injectable } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { CONSTANTS } from '../../../../environments/environment';
import { WalletService } from '../../wallet/wallet.service';
import { Account } from '../../wallet/wallet';
@Injectable({
  providedIn: 'root'
})
export class SignalService {
  connection: any = null;
  constructor(
    private walletService: WalletService
  ) {
    this.connection = new HubConnectionBuilder()
      .withUrl(`https://api.${CONSTANTS.NETWORK}.tzkt.io/v1/events`)
      .build();
    this.connection.on("operations", (msg) => {
      console.log('msg', msg);
      for (const op of msg.data) {
        if (op?.status === 'applied') {
          const sender: string = op?.sender?.address ?? '';
          const target: string = op?.target?.address ?? '';
          const opHash: string = op?.hash ?? '';
          this.confirmStatus(opHash, sender, op.timestamp);
          this.confirmStatus(opHash, target, op.timestamp);
        }
      }
    });
    this.start();
    this.connection.onclose(async () => {
      await this.start();
    });
  }
  confirmStatus(opHash: string, address: string, timestamp: string) {
    if (opHash && address) {
      if (this.walletService.wallet) {
        const account: Account = this.walletService.wallet.getAccount(address);
        if (account) {
          account.activities.forEach((activity) => {
            if (activity.hash === opHash && activity.status === 0) {
              activity.status = 0.5;
              activity.timestamp = (new Date(timestamp)).getTime();
            }
          })
        }
      }
    }
  }
  async start() {
    try {
      await this.connection.start();
      console.log("%cSignalR Connected!", "color:green;");
    } catch (err) {
      console.log(err);
      setTimeout(this.start, 5000);
    }
  };
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
