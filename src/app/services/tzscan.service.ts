import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Constants } from '../constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class TzscanService {
  CONSTANTS = new Constants();
  apiUrl = this.CONSTANTS.NET.API_URL;
  constructor(private http: HttpClient) { }

  numberOperations(pkh: string) {
    return this.http.get(this.apiUrl + 'v1/number_operations/' + pkh);
  }
  numberOperationsOrigination(pkh: string) {
    return this.http.get(this.apiUrl + 'v1/number_operations/' + pkh + '?type=Origination');
  }
  operations(pkh: string, n: number, p: number = 0) {
    return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?number=' + n + '&p=' + p);
  }
  operationsOrigination(pkh: string, n: number) {
    return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?type=Origination&number=' + n + '&p=0');
  }
  timestamp(block: string) {
    return this.http.get(this.apiUrl + 'v1/timestamp/' + block);
  }
  getOp(data: any, pkh: string): any {
    console.log('data: ' + JSON.stringify(data));
    let type = 'Unknown';
    let index = 0;
    if (data.type.operations[0].kind === 'reveal') {
      index = 1;
    }
    type = data.type.operations[index].kind;
    const failed = data.type.operations[index].failed;
    let destination = '';
    let source = '';
    let amount = 0;
    let fee = 0;
    if (type === 'activation') {
      source = data.type.operations[index].pkh.tz;
    } else {
      source = data.type.source.tz;
      if (type === 'transaction') {
        destination = data.type.operations[index].destination.tz;
        amount = data.type.operations[index].amount;
        if (destination !== pkh) {
          amount = amount * -1;
        }
        fee = data.type.fee;
      } else if (type === 'origination') {
        destination = data.type.operations[index].tz1.tz;
        amount = data.type.operations[index].balance;
        if (destination !== pkh) {
          amount = amount * -1;
        }
        fee = data.type.fee;
      } else if (type === 'delegation') {
        destination = data.type.operations[index].delegate;
        fee = data.type.fee;
      }
    }
    const op: any = {
      hash: data.hash,
      block: data.block_hash,
      source: source,
      destination: destination,
      amount: amount,
      fee: fee,
      timestamp: null,
      type: type,
      failed: failed
    };
    console.log('op: ' + JSON.stringify(op));
    return op;
  }
}
