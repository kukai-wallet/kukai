import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import { MessageService } from './message.service';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
export interface Transaction {
  hash: string;
  block: string;
  source: string;
  destination: string;
  amount: number;
  fee: number;
  timestamp: string;
  type: string;
}
export interface TransactionsData {
  pkh: string;
  counter: number;
  transactions: Transaction[];
}

@Injectable()
export class TzscanService {
  storeKey = `kukai-transactions`;
  visibleTransactions: Transaction[] = [];
  transactionsData: TransactionsData[] = [];
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
      err => this.messageService.add(JSON.stringify(err))
    );
  }
  // if not up to data, request transactions data
  handleTransactionsCounterResponse(pkh: string, data: number) {
    const index = this.transactionsData.findIndex(a => a.pkh === pkh);
    if (index === -1 || this.transactionsData[index].counter !== data) {
      console.log('Requesting transactions');
      this.getTransactions(pkh, data);
    } else {
      console.log('Transactions up to date');
    }
  }
  getTransactions(pkh: string, counter: number) {
    this.http.get('https://api.tzscan.io/v1/operations/' + pkh + '?type=Transaction&number=10&p=0').subscribe(
      data => this.handleTransactionsResponse(pkh, data, counter),
      err => this.messageService.add(JSON.stringify(err)),
      () => console.log('done loading transactions')
    );
  }
  handleTransactionsResponse(pkh: string, data: any, counter: number) {
    this.visibleTransactions = [];
    for (let i = 0; i < data.length; i++) {
      let type;
      if (pkh === data[i].type.source) {
        if (pkh === data[i].type.destination) {
          type = 'Selfie';
        } else {
          type = 'Send';
        }
      } else if (pkh === data[i].type.destination) {
        type = 'Recieve';
      } else {
        type = 'Unknown';
      }
      this.visibleTransactions.push( {
        hash: data[i].hash,
        block: data[i].block_hash,
        source: data[i].type.source,
        destination: data[i].type.destination,
        amount: data[i].type.amount,
        fee: data[i].type.fee,
        timestamp: '',
        type: type
      });
    }
    // Add new entry if needed or update current entry
    const index = this.transactionsData.findIndex(a => a.pkh === pkh);
    if (index === -1) {
      this.transactionsData.push({
        pkh: pkh,
        counter: counter,
        transactions: this.visibleTransactions
      });
      console.log('Creating new transactions entry');
    } else if (counter !== this.transactionsData[index].counter) {
      this.transactionsData[index].counter = counter;
      this.transactionsData[index].transactions = this.visibleTransactions;
      console.log('Update transactions entry');
    } else {
      console.log('Should be unreachable in: handleTransactionsResponse())');
    }
    for (let i = 0; i < this.visibleTransactions.length; i++) {
      let last = false;
      if (i === this.visibleTransactions.length - 1) { last = true; }
      this.getTimestamp(pkh, this.visibleTransactions[i].block, this.visibleTransactions[i].hash, last);
    }
  }
  getTimestamp(pkh: string, block: string, hash, last: boolean) {
    this.http.get('https://api.tzscan.io/v1/timestamp/' + block).subscribe(
      data => this.handleTimestampResponse(pkh, block, data, hash, last),
      err => this.messageService.add(JSON.stringify(err))
    );
  }
  handleTimestampResponse(pkh: string, block: string, time: any, hash, last: boolean) {
    const pkhIndex = this.transactionsData.findIndex(a => a.pkh === pkh);
    const transactionIndex = this.transactionsData[pkhIndex].transactions.findIndex(a => a.hash === hash);
    this.visibleTransactions[transactionIndex].timestamp = time;
    this.transactionsData[pkhIndex].transactions[transactionIndex].timestamp = time;
    if (last) {
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
}
