import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { MessageService } from './message.service';
import { Transaction, AccountData } from './../interfaces';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ActivityService {
  storeKey = `kukai-transactions`;
  timestampCounter = 0; // Make sure last timestamp trigger backup
  visibleTransactions: Transaction[] = [];
  transactionsData: AccountData[] = [];
  maxTransactions = 5;
  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  // Show transactions for current pkh, then function call to see if current data is up to date
  updateTransactions(pkh: string) {
    const index = this.transactionsData.findIndex(a => a.pkh === pkh);
    if (index !== -1) {
      this.visibleTransactions = this.transactionsData[index].transactions;
    }
    this.getTransactonsCounter(pkh);
  }
  getTransactonsCounter(pkh) {
    this.http.get('https://api.tzscan.io/v1/number_operations/' + pkh + '?type=Transaction').subscribe(
      data => this.handleTransactionsCounterResponse(pkh, data[0]),
      err => this.messageService.addError(JSON.stringify(err))
    );
  }
  // if not up to data, request transactions data
  handleTransactionsCounterResponse(pkh: string, data: number) {
    const index = this.transactionsData.findIndex(a => a.pkh === pkh);
    if (index === -1 || this.transactionsData[index].numberOfTransactions !== data) {
      console.log('Requesting transactions');
      this.getTransactions(pkh, data);
    } else {
      if (this.visibleTransactions.findIndex(a => a.block === 'prevalidation') !== -1) {
        console.log('Trying to validate blocks');
        this.getUnconfirmedTransactions(pkh);
      } else {
        console.log('Transactions up to date');
      }
    }
  }
  // Try to validate unconfirmed transaction
  getUnconfirmedTransactions(pkh: string) {
    let n = 0;
    for (let i = 0; i < this.visibleTransactions.length; i++) {
      if (this.visibleTransactions[i].block === 'prevalidation') {
        n = i + 1;
      } else {
        break;
      }
    }
    this.http.get('https://api.tzscan.io/v1/operations/' + pkh + '?type=Transaction&number=' + n + '&p=0').subscribe(
      data => this.handleUnconfirmedTransactionsResponse(pkh, data),
      err => this.messageService.addError(JSON.stringify(err))
    );
  }
  handleUnconfirmedTransactionsResponse(pkh: string, data: any) {
    this.timestampCounter = data.length;
    for (let i = 0; i < data.length; i++) {
      if (this.visibleTransactions[i].hash === data[i].hash) {
        this.visibleTransactions[i].block = data[i].block_hash;
        const index = this.transactionsData.findIndex(a => a.pkh === pkh);
        this.transactionsData[index].transactions[i].block = data[i].block_hash;
        if (data[i].block_hash !== 'prevalidation') {
          this.getTimestamp(pkh, data[i].block_hash, data[i].hash);
        }
      }
    }
  }
  // Get latest transaction
  getTransactions(pkh: string, counter: number) {
    this.http.get('https://api.tzscan.io/v1/operations/' + pkh + '?type=Transaction&number=' + this.maxTransactions + '&p=0').subscribe(
      data => this.handleTransactionsResponse(pkh, data, counter),
      err => this.messageService.addError(JSON.stringify(err)),
      () => console.log('done loading transactions')
    );
  }
  handleTransactionsResponse(pkh: string, data: any, counter: number) {
    this.timestampCounter = data.length;
    const newVisibleTransactions: Transaction[] = [];
    for (let i = 0; i < data.length; i++) {
      let type;
      if (pkh === data[i].type.source) {
        if (pkh === data[i].type.destination) {
          type = 'Selfie';
        } else {
          type = 'Send';
        }
      } else if (pkh === data[i].type.destination) {
        type = 'Receive';
      } else {
        type = 'Unknown';
      }
      newVisibleTransactions.push( {
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
    this.visibleTransactions = newVisibleTransactions;
    const index = this.transactionsData.findIndex(a => a.pkh === pkh);
    if (index === -1) {
      this.transactionsData.push({
        pkh: pkh,
        delegate: '',
        numberOfTransactions: counter,
        transactions: this.visibleTransactions
      });
      console.log('Creating new transactions entry');
    } else  {
      this.transactionsData[index].numberOfTransactions = counter;
      this.transactionsData[index].transactions = this.visibleTransactions;
      console.log('Update transactions entry');
    }
    for (let i = 0; i < this.visibleTransactions.length; i++) {
      if (this.visibleTransactions[i].block !== 'prevalidation') {
        this.getTimestamp(pkh, this.visibleTransactions[i].block, this.visibleTransactions[i].hash);
      } else {
        this.timestampCounter--;
      }
    }
  }
  getTimestamp(pkh: string, block: string, hash) {
    this.http.get('https://api.tzscan.io/v1/timestamp/' + block).subscribe(
      data => this.handleTimestampResponse(pkh, block, data, hash),
      err => this.messageService.addError(JSON.stringify(err))
    );
  }
  handleTimestampResponse(pkh: string, block: string, time: any, hash: any) {
    const pkhIndex = this.transactionsData.findIndex(a => a.pkh === pkh);
    const transactionIndex = this.transactionsData[pkhIndex].transactions.findIndex(a => a.hash === hash);
    if (time) { time = new Date(time); }
    this.visibleTransactions[transactionIndex].timestamp = time;
    this.transactionsData[pkhIndex].transactions[transactionIndex].timestamp = time;
    this.timestampCounter--;
    if (this.timestampCounter <= 0) {
      this.timestampCounter = 10;
      console.log('Store transactions data');
      this.storeTransactions();
    }
  }
  storeTransactions() {
    localStorage.setItem(this.storeKey, JSON.stringify(this.transactionsData));
  }
  loadStoredTransactions() {
    const transactionsData = localStorage.getItem(this.storeKey);
    if (transactionsData) {
      this.transactionsData = JSON.parse(transactionsData);
      console.log('Transactions loaded from local storage');
    }
  }
  clearTransactions() {
    this.visibleTransactions = [];
    this.transactionsData = [];
    localStorage.removeItem(this.storeKey);
  }
  getDelegate(pkh: string) {
    this.http.post('http://liquidity.tzscan.io/blocks/head/proto/context/contracts/' + pkh, '{}').subscribe(
      data => this.handleDelegateResponse(pkh, data),
      err => this.messageService.addError(JSON.stringify(err)),
      () => console.log('done loading delegate')
    );
  }
  handleDelegateResponse(pkh: string, data: any) {
    const index = this.transactionsData.findIndex(a => a.pkh === pkh);
    if (index === -1) {
      this.transactionsData.push({
        pkh: pkh,
        delegate: data.ok.delegate.value,
        numberOfTransactions: 0,
        transactions: this.visibleTransactions
      });
      console.log('Creating new transactions entry');
      this.storeTransactions();
    } else  if (this.transactionsData[index].delegate !== data.ok.delegate.value) {
      this.transactionsData[index].numberOfTransactions = 0;
      this.transactionsData[index].delegate = data.ok.delegate.value;
      console.log('Update transactions entry');
      this.storeTransactions();
    }
  }
  getIndex(pkh: string): number {
    return this.transactionsData.findIndex(a => a.pkh === pkh);
  }
}
