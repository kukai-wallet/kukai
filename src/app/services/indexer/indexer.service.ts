import { Injectable } from '@angular/core';
import { ConseilService } from './conseil/conseil.service';
import { TzktService } from './tzkt/tzkt.service';
import { Constants } from '../../constants';

export interface Indexer {
  getContractAddresses(pkh: string): Promise<any>;
  accountInfo(address: string): Promise<any>;
  getOperations(address: string): Promise<any>;
}
@Injectable({
  providedIn: 'root'
})
export class IndexerService {
  private selectedIndexerService: Indexer;
  constructor() {
    const constants = new Constants();
    this.selectedIndexerService = constants.NET.CSI ? new ConseilService : new TzktService;
  }
  async getContractAddresses(address: string): Promise<any> {
    return this.selectedIndexerService.getContractAddresses(address);
  }
  async accountInfo(address: string): Promise<any> {
    return this.selectedIndexerService.accountInfo(address);
  }
  async getOperations(address: string): Promise<any> {
    return this.selectedIndexerService.getOperations(address);
  }
}
