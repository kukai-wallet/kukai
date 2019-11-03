import { Injectable } from '@angular/core';
import { Constants } from '../constants';
import { of, Observable, from as fromPromise, ArgumentOutOfRangeError } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { ConseilDataClient, ConseilQueryBuilder, ConseilSortDirection, ConseilOperator } from 'conseiljs';
import * as util from 'util';
import { Source } from 'webpack-sources';


@Injectable({
  providedIn: 'root'
})
export class ConseilService {
  CONSTANTS: any;
  conseilServer: any;
  platform: string;
  network: string;
  constructor(
  ) {
    this.CONSTANTS = new Constants();
    this.conseilServer = this.CONSTANTS.NET.CSI;
    this.platform = 'tezos';
    if (this.CONSTANTS.NET.NAME === 'Mainnet') {
      this.network = 'mainnet';
    } else {
      this.network = 'babylonnet';
    }
  }
  async getContractAddresses(pkh: string): Promise<any> {
    const entity = 'operations';
    let query = ConseilQueryBuilder.blankQuery();
    query = ConseilQueryBuilder.addFields(query, 'originated_contracts');
    query = ConseilQueryBuilder.addPredicate(query, 'kind', ConseilOperator.EQ, ['origination'], false);
    query = ConseilQueryBuilder.addPredicate(query, 'source', ConseilOperator.EQ, [pkh], false);
    query = ConseilQueryBuilder.addPredicate(query, 'status', ConseilOperator.EQ, ['applied'], false);
    query = ConseilQueryBuilder.addOrdering(query, 'block_level', ConseilSortDirection.DESC);
    query = ConseilQueryBuilder.setLimit(query, 100);
    const results = await ConseilDataClient.executeEntityQuery(this.conseilServer, this.platform, this.network, entity, query);
    const addresses = [];
    for (const result of results) {
      addresses.push(result.originated_contracts);
    }
    return addresses;
  }
  accountInfo(address: string): Observable<any> {
    const entity = 'accounts';
    let query = ConseilQueryBuilder.blankQuery();
    query = ConseilQueryBuilder.addFields(query, 'block_level');
    query = ConseilQueryBuilder.addPredicate(query, 'account_id', ConseilOperator.EQ, [address], false);
    query = ConseilQueryBuilder.setLimit(query, 1);
    return fromPromise(ConseilDataClient.executeEntityQuery(this.conseilServer, this.platform, this.network, entity, query)).pipe(flatMap((result) => {
      return of(result[0].block_level);
    }));
  }
  getOperations(pkh): Observable<any> {
    const entity = 'operations';
    let sendQuery = ConseilQueryBuilder.blankQuery();
    sendQuery = ConseilQueryBuilder.addFields(sendQuery, 'kind', 'block_hash', 'operation_group_hash', 'timestamp', 'originated_contracts', 'source', 'destination', 'amount');
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'kind', ConseilOperator.IN, ['transaction', 'origination'], false);
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'source', ConseilOperator.EQ, [pkh], false);
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'status', ConseilOperator.EQ, ['applied'], false);
    sendQuery = ConseilQueryBuilder.addOrdering(sendQuery, 'block_level', ConseilSortDirection.DESC);
    sendQuery = ConseilQueryBuilder.setLimit(sendQuery, 10);

    let receiveQuery = ConseilQueryBuilder.blankQuery();
    receiveQuery = ConseilQueryBuilder.addFields(receiveQuery, 'kind', 'block_hash', 'operation_group_hash', 'timestamp', 'source', 'destination', 'amount');
    receiveQuery = ConseilQueryBuilder.addPredicate(receiveQuery, 'kind', ConseilOperator.IN, ['transaction', 'origination'], false);
    receiveQuery = ConseilQueryBuilder.addPredicate(receiveQuery, 'destination', ConseilOperator.EQ, [pkh], false);
    receiveQuery = ConseilQueryBuilder.addPredicate(receiveQuery, 'status', ConseilOperator.EQ, ['applied'], false);
    receiveQuery = ConseilQueryBuilder.addOrdering(receiveQuery, 'block_level', ConseilSortDirection.DESC);
    receiveQuery = ConseilQueryBuilder.setLimit(receiveQuery, 10);

    return fromPromise(ConseilDataClient.executeEntityQuery(this.conseilServer, this.platform, this.network, entity, sendQuery)).pipe(flatMap((sendResult) => {
      sendResult = this.formatTx(sendResult);
      return fromPromise(ConseilDataClient.executeEntityQuery(this.conseilServer, this.platform, this.network, entity, receiveQuery)).pipe(flatMap((receiveResult) => {
        receiveResult = this.formatTx(receiveResult);
        const transactions = sendResult.concat(receiveResult).sort((a, b) => b['timestamp'] - a['timestamp']);
        return of(transactions);
      }));
    }));
  }
  formatTx(input: any): any {
    const output = [];
    for (const tx of input) {
      if (tx.kind !== 'transaction' || tx.amount > 0) {
      output.push(
        {
          type: tx.kind,
          block: tx.block_hash,
          failed: false,
          amount: tx.amount,
          source: tx.source,
          destination: (tx.kind === 'origination') ? tx.originated_contracts : tx.destination,
          hash: tx.operation_group_hash,
          timestamp: tx.timestamp
        }
      );
      }
    }
    return output;
  }
}
