import { Injectable } from '@angular/core';
import 'babel-polyfill';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import Tezos from '@obsidiansystems/hw-app-xtz';
import { OperationService } from '../operation/operation.service';
import { MessageService } from '../message/message.service';

@Injectable()
export class LedgerService {
  transport: any;
  errorMessage = 'U2F browser support is needed for Ledger. Please use Chrome, Opera ' +
    'or Firefox with a U2F extension. Also make sure you\'re on an HTTPS connection';
  constructor(
    private operationService: OperationService,
    private messageService: MessageService
  ) {}
  async setTransport() {
    if (!this.transport) {
      console.log('Trying to use U2F for transport...');
      try {
        this.transport = await TransportU2F.create();
        console.log('Transport is now set to use U2F!');
      } catch (e) {
        console.log('Couldn\'t use U2F for transport!');
      }
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
    console.log(path);
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
    await this.transportCheck();
    const xtz = new Tezos(this.transport);
    console.log('size', op.length);
    let result;
    console.log(op);
    if (op.length !== 64) {
      op = '03' + op;
      result = await xtz.signOperation(path, op)
        .catch(e => {
          this.messageService.addError(e, 0);
        });
    } else {
      result = await xtz.signHash(path, op)
        .catch(e => {
          this.messageService.addError(e, 0);
        });
    }
    console.log(JSON.stringify(result));
    if (result && result.signature) {
      return result.signature;
    }
    return null;
  }
}
