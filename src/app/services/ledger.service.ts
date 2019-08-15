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
      console.log('');
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
  async getPublicAddress (path: string) {
    const xtz = new App(this.transport);
    const result = await xtz.getAddress(path, true)
      .catch(e => {
        this.messageService.addError(e);
      });
    const pk = this.operationService.hex2pk(result.publicKey);
    return pk;
  }
  async signOperation (op: string, path: string) {
    console.log('ledger op ' + op);
    const xtz = new App(this.transport);
    console.log(path);
    console.log(op);
    const result = await xtz.signOperation(path, '03' + op)
      .catch(e => {
        this.messageService.addError(e);
      });
    console.log(JSON.stringify(result));
    return result.signature;
  }
}
