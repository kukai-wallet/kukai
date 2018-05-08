import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { MessageService } from './message.service';
import { TzrateService } from './tzrate.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class BalanceService {
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private tzrateService: TzrateService,
    private http: HttpClient
  ) { }

  async getBalanceAll() {
    await this.getXTZBalanceAll();
  }
  getXTZBalanceAll() {
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.getAccountBalance(i);
    }
  }
  handleBalanceErrors(err: any, pkh: string) {
    if (!err) {
      this.messageService.addError('BalanceError: No response');
    } else if (err === 'Empty response returned') { // Account probably empty and should be removed
      this.messageService.addError('BalanceError: Empty response');
      // this.walletService.wallet.accounts[this.walletService.getIndexFromPkh(pkh)].balance = 0;
      // this.walletService.storeWallet();
    } else {
      console.log('BalanceError: ' + JSON.stringify(err));
      this.messageService.addError('BalanceError: ' + JSON.stringify(err));
    }
  }
  getAccountBalance(index: number) {
    const pkh = this.walletService.wallet.accounts[index].pkh;
    this.http.post('http://zeronet-node.tzscan.io/blocks/head/proto/context/contracts/' + pkh, {}).subscribe(
      (val: any) => this.updateAccountBalance(index, Number(val.balance)),
      err => this.handleBalanceErrors(err, pkh)
    );
  }
  updateAccountBalance(index: number, newBalance: number) {
    if (newBalance !== this.walletService.wallet.accounts[index].balance.balanceXTZ) {
      this.walletService.wallet.accounts[index].balance.balanceXTZ = newBalance;
      this.updateTotalBalance();
      this.tzrateService.updateFiatBalances();
      this.walletService.storeWallet();
    }
  }
  updateTotalBalance() {
    let balance = 0;
    let change = false;
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      if (this.walletService.wallet.accounts[i].balance.balanceXTZ) {
      balance =  balance + Number(this.walletService.wallet.accounts[i].balance.balanceXTZ);
      change = true;
      }
    }
    if (change) {
      this.walletService.wallet.balance.balanceXTZ = balance;
    }
  }
}
