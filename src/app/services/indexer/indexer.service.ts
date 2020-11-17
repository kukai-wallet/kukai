import { Injectable } from '@angular/core';
import { ConseilService } from './conseil/conseil.service';
import { TzktService } from './tzkt/tzkt.service';
import { CONSTANTS } from '../../../environments/environment';

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
    this.selectedIndexerService = CONSTANTS.CSI ? new ConseilService : new TzktService;
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
