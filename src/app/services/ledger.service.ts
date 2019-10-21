import { Injectable } from '@angular/core';
import 'babel-polyfill';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import TransportWebAuthn from '@ledgerhq/hw-transport-webauthn';
import App from 'basil-tezos-ledger';
import { OperationService } from './operation.service';
import { MessageService } from './message.service';

@Injectable()
export class LedgerService {
  transport: any;
  errorMessage = 'U2F browser support is needed for Ledger. Please use Chrome, Opera ' +
  'or Firefox with a U2F extension. Also make sure you\'re on an HTTPS connection';
  constructor(
    private operationService: OperationService,
    private messageService: MessageService
  ) {
    this.setTransport();
   }
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
    if (!this.transport) {
      console.log('Trying to use WebAuthn for transport...');
      try {
      this.transport = await TransportWebAuthn.create();
      console.log('Transport is now set to use WebAuthn!');
      } catch (e) {
        console.log('Couldn\'t use WebAuthn for transport!');
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
  async getPublicAddress (path: string) {
    await this.transportCheck();
    const xtz = new App(this.transport);
    const result = await xtz.getAddress(path, true)
      .catch(e => {
        this.messageService.addError(e);
      });
    const pk = this.operationService.hex2pk(result.publicKey);
    return pk;
  }
  async signOperation (op: string, path: string) {
    await this.transportCheck();
    const xtz = new App(this.transport);
    console.log(path);
    const toSign = '03' + op;
    if (toSign.length > 512) {
      this.messageService.addError('Operation is too big for Ledger to sign (' + toSign.length / 2 + ' > 256 bytes)');
      throw new Error('LedgerSignError');
    }
    const result = await xtz.signOperation(path, toSign)
      .catch(e => {
        this.messageService.addError(e);
      });
    console.log(JSON.stringify(result));
    return result.signature;
  }
}
