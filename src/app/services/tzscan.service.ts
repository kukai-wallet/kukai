import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import { MessageService } from './message.service';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
export interface Transaction {
  hash: string;
  source: string;
  destination: string;
  amount: number;
  fee: number;
}
/*
"hash":"onqURuuiggb3jvmb6W7ofEfUd95JPSqm3pQ68G3kvUR2UGezuhG",
"block_hash":"BLHDca1W3Jx7nhSP6UBkv3tmLxmHfF81zHewJDSREuvkq9Etv4g",
"network_hash":"NetXj4yEEKnjaK8",
"type":{
	"source":"TZ1jvfUedZLovX2AFZvTHv5BN3jLZudyUqTf",
	"destination":"tz1Qydd9Gw4SBCLxMyRtznyxCWHMG6qqqrky",
	"fee":0,
	"counter":2,
	"amount":100000,
	"parameters":""
}*/

@Injectable()
export class TzscanService {
  transactions: Transaction[] = [];
  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  requestTransactions(n: number, pkh: string): any {
    return this.http.get('http://api.tzscan.io/v1/operations/' + pkh + '?type=Transaction&number=' + n + '&p=0');
  }
  getTransactions(pkh: string): any {
    this.requestTransactions(10, pkh).subscribe(
      data => this.handleResponse(data),
      err => this.messageService.add(JSON.stringify(err)),
      () => console.log('done loading transactions')
    );
  }
  handleResponse(data: any) {
    this.transactions = [];
    for (let i = 0; i < data.length; i++) {
      this.transactions.push( {
        hash: data[i].hash,
        source: data[i].type.source,
        destination: data[i].type.destination,
        amount: data[i].type.amount,
        fee: data[i].type.fee
      });
    }
  }
}
