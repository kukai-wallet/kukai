import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { MessageService } from './message.service';
import { WalletService } from './wallet.service';
import { BalanceService } from './balance.service';
import { Activity } from '../interfaces';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ActivityService {
  // timestampCounter = 0; // Make sure last timestamp trigger backup
  timestampCounterMap: Map<string, number> = new Map<string, number>();
  maxTransactions = 5;
  constructor(
    private walletService: WalletService,
    private http: HttpClient,
    private messageService: MessageService,
    private balanceService: BalanceService
  ) { }
  updateAllTransactions() {
    console.log('updating transactions');
    for (let i = 0; i < this.walletService.wallet.accounts.length; i++) {
      this.updateTransactions(this.walletService.wallet.accounts[i].pkh);
    }
  }
  // Show transactions for current pkh, then function call to see if current data is up to date
  updateTransactions(pkh: string) {
    // const aIndex = this.transactionsData.findIndex(a => a.pkh === pkh);
    this.getTransactonsCounter(pkh);
  }
  getTransactonsCounter(pkh) {
    this.http.get('http://zeronet-api.tzscan.io/v1/number_operations/' + pkh).subscribe(
      data => this.handleTransactionsCounterResponse(pkh, data[0]),
      err => this.messageService.addError(JSON.stringify(err))
    );
  }
  // if not up to data, request transactions data
  handleTransactionsCounterResponse(pkh: string, data: number) {
    const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    if (index === -1 || this.walletService.wallet.accounts[index].numberOfActivites !== data) {
      console.log('Requesting transactions');
      this.getTransactions(pkh, data);
      this.balanceService.getXTZBalanceAll();
    } else {
      if (this.walletService.wallet.accounts[index].activities.findIndex(a => a.block === 'prevalidation') !== -1) {
        console.log('Trying to validate blocks');
        this.getUnconfirmedTransactions(pkh);
      } else {
        console.log('Transactions up to date');
      }
    }
  }
  // Try to validate unconfirmed transaction
  getUnconfirmedTransactions(pkh: string) {
    const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    let n = 0;
    for (let i = 0; i < this.walletService.wallet.accounts[index].activities.length; i++) {
      if (this.walletService.wallet.accounts[index].activities[i].block === 'prevalidation') {
        n = i + 1;
      } else {
        break;
      }
    }
    this.http.get('http://zeronet-api.tzscan.io/v1/operations/' + pkh + '?number=' + n + '&p=0').subscribe(
      data => this.handleUnconfirmedTransactionsResponse(pkh, data),
      err => this.messageService.addError(JSON.stringify(err))
    );
  }
  handleUnconfirmedTransactionsResponse(pkh: string, data: any) {
    const aIndex = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    // this.timestampCounter = data.length;
    this.timestampCounterMap.set(pkh, data.length);
    for (let i = 0; i < data.length; i++) {
      if (this.walletService.wallet.accounts[aIndex].activities[i].hash === data[i].hash) {
        this.walletService.wallet.accounts[aIndex].activities[i].block = data[i].block_hash;
        const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
        this.walletService.wallet.accounts[index].activities[i].block = data[i].block_hash;
        if (data[i].block_hash !== 'prevalidation') {
          this.getTimestamp(pkh, data[i].block_hash, data[i].hash);
        }
      }
    }
  }
  // Get latest transaction
  getTransactions(pkh: string, counter: number) {
    this.http.get('http://zeronet-api.tzscan.io/v1/operations/' + pkh + '?number=' + this.maxTransactions + '&p=0').subscribe(
      data => this.handleTransactionsResponse(pkh, data, counter),
      err => this.messageService.addError(JSON.stringify(err)),
      () => console.log('done loading transactions')
    );
  }
  handleTransactionsResponse(pkh: string, data: any, counter: number) {
    // this.timestampCounter = data.length;
    this.timestampCounterMap.set(pkh, data.length);
    const newTransactions: Activity[] = [];
    for (let i = 0; i < data.length; i++) {
      let type;
      if (pkh === data[i].type.source) {
        if (pkh === data[i].type.destination) {
          type = 'Send/Recieve';
        } else {
          type = 'Send';
        }
      } else if (pkh === data[i].type.destination) {
        type = 'Receive';
      } else if (data[i].type.credit) {
        type = 'Originate';
      } else {
        type = 'Unknown';
        console.log('Type: ' + JSON.stringify(data[i]));
      }
      if (type === 'Originate') {
        newTransactions.push( {
          hash: data[i].hash,
          block: data[i].block_hash,
          source: data[i].type.source,
          destination: data[i].type.tz1,
          amount: data[i].type.credit,
          fee: data[i].type.fee,
          timestamp: null,
          type: type
        });
      } else {
        newTransactions.push( {
          hash: data[i].hash,
          block: data[i].block_hash,
          source: data[i].type.source,
          destination: data[i].type.destination,
          amount: data[i].type.amount,
          fee: data[i].type.fee,
          timestamp: null,
          type: type
        });
      }
    }
    const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    if (index === -1) {
      this.walletService.wallet.accounts.push({
        pkh: pkh,
        delegate: '',
        balance: this.walletService.emptyBalance(),
        numberOfActivites: counter,
        activities: newTransactions
      });
      console.log('Creating new transactions entry');
    } else  {
      this.walletService.wallet.accounts[index].numberOfActivites = counter;
      this.walletService.wallet.accounts[index].activities = newTransactions;
      console.log('Update transactions entry');
    }
    for (let i = 0; i < newTransactions.length; i++) {
      if (newTransactions[i].block !== 'prevalidation') {
        this.getTimestamp(pkh, newTransactions[i].block, newTransactions[i].hash);
      } else {
        // this.timestampCounter--;
        this.timestampCounterMap.set(pkh, this.timestampCounterMap.get(pkh) - 1);
      }
    }
  }
  getTimestamp(pkh: string, block: string, hash) {
    this.http.get('http://zeronet-api.tzscan.io/v1/timestamp/' + block).subscribe(
      data => this.handleTimestampResponse(pkh, block, data, hash),
      err => this.messageService.addError(JSON.stringify(err))
    );
  }
  handleTimestampResponse(pkh: string, block: string, time: any, hash: any) {
    const pkhIndex = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    const transactionIndex = this.walletService.wallet.accounts[pkhIndex].activities.findIndex(a => a.hash === hash);
    if (time) { time = new Date(time); }
    this.walletService.wallet.accounts[pkhIndex].activities[transactionIndex].timestamp = time;
    // this.timestampCounter--;
    this.timestampCounterMap.set(pkh, this.timestampCounterMap.get(pkh) - 1);
    // if (this.timestampCounter <= 0) {
    //   this.timestampCounter = 10;
    if (this.timestampCounterMap.get(pkh) <= 0) {
      this.timestampCounterMap.set(pkh, 10);
      console.log('Store transactions data');
      this.walletService.storeWallet();
    }
  }
  getDelegate(pkh: string) {
    this.http.post('http://liquidity.tzscan.io/blocks/head/proto/context/contracts/' + pkh, '{}').subscribe(
      data => this.handleDelegateResponse(pkh, data),
      err => this.messageService.addError(JSON.stringify(err)),
      () => console.log('done loading delegate')
    );
  }
  handleDelegateResponse(pkh: string, data: any) {
    const index = this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
    if (index === -1) {
      this.walletService.wallet.accounts.push({
        pkh: pkh,
        delegate: data.ok.delegate.value,
        balance: this.walletService.emptyBalance(),
        numberOfActivites: 0,
        activities: []
      });
      console.log('Creating new transactions entry');
      this.walletService.storeWallet();
    } else  if (this.walletService.wallet.accounts[index].delegate !== data.ok.delegate.value) {
      this.walletService.wallet.accounts[index].numberOfActivites = 0;
      this.walletService.wallet.accounts[index].delegate = data.ok.delegate.value;
      console.log('Update transactions entry');
      this.walletService.storeWallet();
    }
  }
  getIndex(pkh: string): number {
    return this.walletService.wallet.accounts.findIndex(a => a.pkh === pkh);
  }
}
