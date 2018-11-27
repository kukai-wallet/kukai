import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Constants } from '../constants';
import { stringify } from '@angular/core/src/render3/util';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { timeout, catchError, flatMap, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';

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
  operations(pkh: string, n: number, p: number = 0): Observable<any> {
    return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?type=Transaction&number=' + n + '&p=' + p)
      .flatMap((p1: any) => {
        return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?type=Delegation&number=' + n + '&p=' + p)
          .flatMap((p2: any) => {
            return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?type=Origination&number=' + n + '&p=' + p)
              .flatMap((p3: any) => {
                return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?type=Activation&number=1&p=0')
                  .flatMap((p4: any) => {
                    const part = [p1, p2, p3, p4];
                    const parts: any = [];
                    for (let i = 0; i < 4; i++) {
                      for (let j = 0; j < part[i].length; j++) {
                        parts.push(part[i][j]);
                      }
                    }
                    return of(parts);
                  });
              });
          });
      });
  }
  getCounter(op: any): number {
    return Number(op.type.operations[0].counter);
  }
  operationsOrigination(pkh: string, n: number) {
    return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?type=Origination&number=' + n + '&p=0');
  }
  timestamp(block: string) {
    return this.http.get(this.apiUrl + 'v1/timestamp/' + block);
  }
  getOp(data: any, pkh: string): any {
    const ops: any[] = [];
    for (let index = 0; index < data.type.operations.length; index++) {
      let type = 'Unknown';
      if (data.type.operations[index].kind !== 'reveal') {
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
        ops.push(op);
      }
    }
    return ops;
  }
}
