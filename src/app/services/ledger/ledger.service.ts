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
  constructor(
    private operationService: OperationService,
    private messageService: MessageService
  ) { }
  async setTransport() {
    if (!this.transport) {
      console.log('Trying to use WebHID for transport...');
      try {
        this.transport = await TransportWebHID.create();
        console.log('Transport is now set to use WebHID!');
      } catch (e) {
        this.transport = null;
        console.warn('Couldn\'t set WebHID as transport!');
        console.error(e);
      }
    }
    if (!this.transport) {
      try {
        this.transport = await TransportU2F.create();
        console.warn('Transport is now set to use U2F!');
      } catch (e) {
        this.transport = null;
        console.log('Couldn\'t set U2F as transport!');
        console.error(e);
      }
    }
  }
  async transportCheck() {
    if (!this.transport) {
      await this.setTransport();
    }
    if (!this.transport) {
      this.messageService.addError('Failed to set transport. Please make sure your browser supports WebHID or U2F');
      throw new Error('NO_TRANSPORT_FOUND');
    }
  }
  async getPublicAddress(path: string) {
    await this.transportCheck();
    const xtz = new Tezos(this.transport);
    const result = await xtz.getAddress(path, true)
      .then(res => {
        return this.sanitize(res, true);
      })
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
    console.log('op', op);
    const result = await xtz.signOperation(path, op)
      .then(res => {
        return this.sanitize(res, false);
      })
      .catch(e => {
        console.warn(e);
        this.messageService.addError(e, 0);
        return null;
      });
    console.log(JSON.stringify(result));
    if (result?.signature) {
      return result.signature;
    } else {
      return null;
    }
  }
  async signHash(hash: string, path: string) {
    if (hash.length !== 64) {
      throw new Error('Invalid hash!');
    }
    await this.transportCheck();
    const xtz = new Tezos(this.transport);
    const result = await xtz.signHash(path, hash)
      .then(res => {
        return this.sanitize(res, false);
      })
      .catch(e => {
        console.warn(e);
        this.messageService.addError(e, 0);
        return null;
      });
    console.log(JSON.stringify(result));
    if (result?.signature) {
      return result.signature;
    } else {
      return null;
    }
  }
  private sanitize(res: any, getPk: boolean) {
    res = JSON.parse(JSON.stringify(res));
    if (getPk && typeof res?.publicKey !== 'string') {
      throw Error("Invalid pk")
    }
    if (!getPk && typeof res?.signature !== 'string') {
      throw Error("Invalid signature")
    }
    return res;
  }
}
