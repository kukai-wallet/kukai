import { Injectable } from '@angular/core';
import 'babel-polyfill';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import Tezos from '@obsidiansystems/hw-app-xtz';
import { OperationService } from '../operation/operation.service';
import { MessageService } from '../message/message.service';

@Injectable()
export class LedgerService {
  transport: any;
  errorMessage = 'U2F or WebHID browser support is needed for Ledger';
  constructor(
    private operationService: OperationService,
    private messageService: MessageService
  ) { }
  async setTransport() {
    if (!this.transport) {
      if (this.useWebHID()) {
        console.log('Trying to use WebHID for transport...');
        try {
          this.transport = await TransportWebHID.create();
          console.log('Transport is now set to use WebHID!');
        } catch (e) {
          console.error(e);
          console.warn('Couldn\'t use WebHID for transport!');
        }
      } else {
        try {
          this.transport = await TransportU2F.create();
          console.log('Transport is now set to use U2F!');
        } catch (e) {
          console.error(e);
          console.log('Couldn\'t use U2F for transport!');
        }
      }
    }
  }
  private useWebHID(): boolean {
    try {
      const isMac = navigator.platform.indexOf('Mac') > -1;
      const isChrome = (navigator as any).userAgentData?.brands?.some(b => b.brand === 'Google Chrome');
      return (isMac && isChrome);
    } catch (e) {
      return false;
    }
  }
  async transportCheck() {
    if (!this.transport) {
      await this.setTransport();
    }
    if (!this.transport) {
      this.messageService.addError(this.errorMessage);
    }
  }
  async getPublicAddress(path: string) {
    await this.transportCheck();
    const xtz = new Tezos(this.transport);
    const result = await xtz.getAddress(path, true)
      .catch(e => {
        if (e.message) {
          this.messageService.addError(e.message);
        } else {
          this.messageService.addError(e);
        }
        throw e;
      });
    const pk = this.operationService.hex2pk(result.publicKey);
    return pk;
  }
  async signOperation(op: string, path: string) {
    if (!['03', '05'].includes(op.slice(0, 2))) {
      throw new Error('Invalid prefix');
    }
    await this.transportCheck();
    const xtz = new Tezos(this.transport);
    let result;
    console.log('op', op);
    result = await xtz.signOperation(path, op)
      .catch(e => {
        console.warn(e);
        this.messageService.addError(e, 0);
      });
    console.log(JSON.stringify(result));
    if (result && result.signature) {
      return result.signature;
    }
    return null;
  }
  async signHash(hash: string, path: string) {
    if (hash.length !== 64) {
      throw new Error('Invalid hash!');
    }
    await this.transportCheck();
    const xtz = new Tezos(this.transport);
    let result;
    result = await xtz.signHash(path, hash)
      .catch(e => {
        this.messageService.addError(e, 0);
      });
    console.log(JSON.stringify(result));
    if (result && result.signature) {
      return result.signature;
    }
    return null;
  }
}
