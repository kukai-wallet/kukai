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
  getManagerKey(pkh: any): Observable<any> {
    return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?type=Reveal&number=1&p=0')
      .flatMap((res: any) => {
        return of(res[0].type.operations[0].public_key);
      });
  }
  operationsOrigination(pkh: string, n: number) {
    return this.http.get(this.apiUrl + 'v1/operations/' + pkh + '?type=Origination&number=' + n + '&p=0');
  }
  timestamp(block: string) {
    return this.http.get(this.apiUrl + 'v1/timestamp/' + block);
  }
  getPriceUSD(): Observable<any> {
    return this.http.get(this.apiUrl + 'v1/marketcap')
      .flatMap((res: any) => {
        return of(res[0].price_usd);
      });
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

  getProposals(latesProposalPeriod: string) {
    const apiUrlMainnet = 'https://api6.tzscan.io/';  //https://api6.tzscan.io/v3/proposals
    return this.http.get(apiUrlMainnet + 'v3/proposals')
      .flatMap(
        ((res: any) => {
          const ans = [];
          for (let i = 0; i < res.length; i++) {
            if (res[i].voting_period === latesProposalPeriod) {
                ans.push(res[i]);
            }
          }
          return of(ans);
        })
      );
  }

  getProposalsCurrentPeriod(period: number) {
    const apiUrlMainnet = 'https://api6.tzscan.io/';  //https://api6.tzscan.io/v3/proposals/?period=10
    return this.http.get(apiUrlMainnet + 'v3/proposals/' + '?period=' + period);
  }

  //Needs improvement - Need to work with an array of hash strings
  getProposalVotes(proposalHash, p: number = 0, data?: any): Observable<any> {
    return this.http.get('https://api6.tzscan.io/v3/proposal_votes/' + proposalHash + '?p=' + p + '&number=50')
      .flatMap(
        ((res: any) => {
          if (res.length < 50) {
            if (data) {
              res = res.concat(data);
            }
            return of(res);
          } else {
            if (data) {
              res = res.concat(data);
            }
            return this.getProposalVotes(proposalHash, ++p, res);
          }
        })
      );
  }

  getPeriodInfo() {
    const apiUrlMainnet = 'https://api6.tzscan.io/';  //https://api6.tzscan.io/v3/voting_period_info
    return this.http.get(apiUrlMainnet + 'v3/voting_period_info');
    // {"period":10,"kind":"proposal","cycle":84,"level":345815,"max_period":true}
  }

  getNbProposalVotes(proposalHash) {
    const apiUrlMainnet = 'https://api6.tzscan.io/';  //https://api6.tzscan.io/v3/nb_proposal_votes/{proposal_hash}
    return this.http.get(apiUrlMainnet + 'v3/nb_proposal_votes/' + proposalHash);
    // {"count":57,"votes":11408}
  }

  getTotalVotes(period: number) {
    const apiUrlMainnet = 'https://api6.tzscan.io/';  //https://api6.tzscan.io/v3/total_proposal_votes/10
    return this.http.get(apiUrlMainnet + 'v3/total_proposal_votes/' + period);
    // https://api6.tzscan.io/v3/total_voters/10
    // {"count":458,"votes":51604}
    // https://api6.tzscan.io/v3/total_proposal_votes/10
    // {"proposal_count":2,"total_count":458,"total_votes":51604,"used_count":107,"used_votes":15773,"unused_count":360,"unused_votes":36492}
  }
  getTotalVotes2(period: number) {
    return this.http.get(this.apiUrl + 'v3/total_voters/' + period);
  }
  getBallots(period: number, kind: string) {
    const apiUrlMainnet = 'https://api6.tzscan.io/';    //https://api6.tzscan.io/v3/ballots/11
    return this.http.get(apiUrlMainnet + 'v3/ballots/' + period + '?period_kind=' + kind);
    // {"proposal": "string","nb_yay": 0,"nb_nay": 0,"nb_pass": 0,"vote_yay": 0,"vote_nay": 0,"vote_pass": 0}
  }
  getBallotVotes(maxPeriod: number, p: number = 0, data?: any): Observable<any> {
    return this.http.get(this.apiUrl + 'v3/operations?type=Ballot&p=' + p + '&number=50')
      .flatMap(
        ((res: any) => {
          let inScope = [];
          for (let i = 0; i < res.length; i++) {
            if (res[i].type.period >= maxPeriod) {
              inScope = inScope.concat(res[i]);
            } else {
              break;
            }
          }
          if (inScope.length < 50) {
            if (data) {
              inScope = inScope.concat(data);
            }
            return of(inScope); // We are done
          } else {
            if (data) {
              inScope = inScope.concat(data);
            }
            return this.getBallotVotes(maxPeriod, ++p, inScope); // Do more calls
          }
        })
      );
  }
  /*  // Not needed
  getCurrentHead() {
    const apiUrlMainnet = 'https://api6.tzscan.io/';
    return this.http.get(apiUrlMainnet + 'v3/head');
  } */

}
