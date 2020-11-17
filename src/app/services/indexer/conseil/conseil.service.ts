import { Injectable } from '@angular/core';
import { CONSTANTS } from '../../../../environments/environment';
import { of, Observable, from as fromPromise } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { ConseilDataClient, ConseilQueryBuilder, ConseilSortDirection, ConseilOperator } from 'conseiljs';
import { Indexer } from '../indexer.service';

@Injectable({
  providedIn: 'root'
})
export class ConseilService implements Indexer {
  conseilServer: any;
  platform: string;
  network: string;
  constructor(
  ) {
    this.conseilServer = CONSTANTS.CSI;
    this.network = CONSTANTS.NETWORK;
    this.platform = 'tezos';
  }
  async getContractAddresses(pkh: string, currentAddress: string = pkh): Promise<any> {
    const entity = 'operations';
    let query = ConseilQueryBuilder.blankQuery();
    query = ConseilQueryBuilder.addFields(query, 'originated_contracts');
    query = ConseilQueryBuilder.addPredicate(query, 'kind', ConseilOperator.EQ, ['origination'], false);
    query = ConseilQueryBuilder.addPredicate(query, 'source', ConseilOperator.EQ, [currentAddress], false);
    query = ConseilQueryBuilder.addPredicate(query, 'status', ConseilOperator.EQ, ['applied'], false);
    query = ConseilQueryBuilder.addOrdering(query, 'block_level', ConseilSortDirection.DESC);
    query = ConseilQueryBuilder.setLimit(query, 100);
    const results = await ConseilDataClient.executeEntityQuery(this.conseilServer, this.platform, this.network, entity, query);
    let addresses = [];
    for (const result of results) {
      addresses.push(result.originated_contracts);
    }
    for (const address of addresses) { // Needed to find accounts originated from other originated accounts
      const childAddresses = await this.getContractAddresses(pkh, address);
      addresses = addresses.concat(childAddresses);
    }
    return addresses;
  }
  accountInfo(address: string): Promise<any> {
    const entity = 'accounts';
    let query = ConseilQueryBuilder.blankQuery();
    query = ConseilQueryBuilder.addFields(query, 'block_level');
    query = ConseilQueryBuilder.addPredicate(query, 'account_id', ConseilOperator.EQ, [address], false);
    query = ConseilQueryBuilder.setLimit(query, 1);
    return fromPromise(ConseilDataClient.executeEntityQuery(this.conseilServer, this.platform, this.network, entity, query)).pipe(flatMap((result) => {
      if (result[0]) {
        return of(result[0].block_level);
      } else {
        return of(0);
      }
    })).toPromise();
  }
  getOperations(pkh: string): Promise<any> {
    const entity = 'operations';
    let sendQuery = ConseilQueryBuilder.blankQuery();
    sendQuery = ConseilQueryBuilder.addFields(sendQuery, 'kind', 'block_hash', 'operation_group_hash', 'timestamp', 'originated_contracts', 'source', 'destination', 'amount', 'delegate');
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'kind', ConseilOperator.IN, ['transaction', 'origination', 'delegation'], false);
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
        console.log('ADDRESS GET ' + pkh);
        console.log(transactions);
        return of(transactions);
      }));
    })).toPromise();
  }
  private formatTx(input: any): any {
    const output = [];
    for (const tx of input) {
      if (tx.kind !== 'transaction' || tx.amount > 0) {
        let destination = tx.destination;
        if (tx.kind === 'origination') {
          destination = tx.originated_contracts;
        } else if (tx.kind === 'delegation') {
          destination = tx.delegate;
        }
        output.push(
          {
            type: tx.kind,
            block: tx.block_hash,
            status: 1,
            amount: tx.amount,
            source: tx.source,
            destination: destination,
            hash: tx.operation_group_hash,
            timestamp: tx.timestamp
          }
        );
      }
    }
    return output;
  }
}
