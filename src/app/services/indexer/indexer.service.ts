import { Injectable } from '@angular/core';
import { ConseilService } from './conseil/conseil.service';
import { TzktService } from './tzkt/tzkt.service';

export interface Indexer {
  getContractAddresses(pkh: string): Promise<any>;
  accountInfo(address: string): Promise<any>;
  getOperations(address: string): Promise<any>;
}
@Injectable({
  providedIn: 'root'
})
export class IndexerService {
  constructor(
    public tzktService: TzktService
  ) {}
  async getContractAddresses(address: string): Promise<any> {
    return this.tzktService.getContractAddresses(address);
  }
  async accountInfo(address: string, knownTokenIds: string[] = []): Promise<any> {
    return this.tzktService.accountInfo(address, knownTokenIds);
  }
  async getOperations(address: string, knownTokenIds: string[]): Promise<any> {
    return this.tzktService.getOperations(address, knownTokenIds);
  }
  async getTokenMetadata(contractAddress: string, id: number): Promise<any> {
    return this.tzktService.getTokenMetadata(contractAddress, id);
  }
}
