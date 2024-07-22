import { Injectable } from '@angular/core';
import 'babel-polyfill';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import Tezos from '@ledgerhq/hw-app-tezos';
import { OperationService } from '../operation/operation.service';
import { MessageService } from '../message/message.service';
import { TzktService } from '../indexer/tzkt/tzkt.service';
import { pkToPkh } from '../../libraries/utils';

interface UsedAccount {
  pkh: string;
  pk: string;
  path: string;
}
@Injectable()
export class LedgerService {
  private xtz: any = undefined;
  constructor(private operationService: OperationService, private messageService: MessageService, private tzktService: TzktService) {}
  async createTransport(): Promise<any> {
    let transport: any = undefined;
    if (!transport) {
      console.log('Trying to use WebHID for transport...');
      try {
        transport = await TransportWebHID.create();
        console.log('Transport is now set to use WebHID!');
      } catch (e) {
        transport = undefined;
        console.warn("Couldn't set WebHID as transport!");
        console.error(e);
      }
    }
    if (!transport) {
      console.log('Trying to use WebUSB for transport...');
      try {
        transport = await TransportWebUSB.create();
        console.warn('Transport is now set to use WebUSB!');
      } catch (e) {
        transport = undefined;
        console.error("Couldn't set WebUSB as transport!");
        console.error(e);
      }
    }
    return transport;
  }
  async transport() {
    const transport = await this.createTransport();
    if (!transport) {
      this.messageService.addError('Failed to set transport. Please make sure your browser supports WebHID or WebUSB');
      throw new Error('NO_TRANSPORT_FOUND');
    }
    return transport;
  }
  private async lockTransport(): Promise<void> {
    console.log('lock transport');
    this.xtz = new Tezos(await this.transport());
  }
  private async unlockTransport(): Promise<void> {
    if (this.xtz) {
      console.log('unlock transport');
      await this.xtz?.transport?.close();
      this.xtz = undefined;
    }
  }
  async getPublicAddress(path: string) {
    const xtz = this.xtz ?? new Tezos(await this.transport());
    const result = await xtz
      .getAddress(path)
      .then((res) => {
        return this.sanitize(res, true);
      })
      .catch((e) => {
        if (e?.message) {
          this.messageService.addError(e?.message?.includes('0x6e01') ? 'Make sure the Tezos app is open on your Ledger device' : e.message);
        } else {
          this.messageService.addError(e);
        }
        this.unlockTransport();
        throw e;
      })
      .finally(() => {
        try {
          this.xtz ?? xtz.transport.close();
        } catch (e) {
          console.error(e);
        }
      });
    const pk = this.operationService.hex2pk(result.publicKey);
    return pk;
  }
  async signOperation(op: string, path: string) {
    if (!['03', '05'].includes(op.slice(0, 2))) {
      throw new Error('Invalid prefix');
    }
    const xtz = this.xtz ?? new Tezos(await this.transport());
    const result = await xtz
      .signOperation(path, op)
      .then((res) => {
        return this.sanitize(res, false);
      })
      .catch((e) => {
        if (e?.message) {
          this.messageService.addError(e?.message?.includes('0x6e01') ? 'Make sure the Tezos app is open on your Ledger device' : e.message);
        } else {
          this.messageService.addError(e);
        }
        this.unlockTransport();
        return null;
      })
      .finally(() => {
        try {
          this.xtz ?? xtz.transport.close();
        } catch (e) {
          console.error(e);
        }
      });
    if (result?.signature) {
      return result.signature;
    } else {
      return null;
    }
  }
  public async scan(): Promise<UsedAccount[]> {
    await this.lockTransport();
    let usedAccounts: UsedAccount[] = [];

    // levels: 4
    usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/0'/0'`));
    usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/*'/0'`, 1, 5));
    usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/0'/*'`, 1, 5));

    // levels: 5 - Scan more selectively, with preconditions
    const acc_0_0_0 = await this.scanPath(`44'/1729'/0'/0'/0'`);
    if (acc_0_0_0.length) {
      usedAccounts = usedAccounts.concat(acc_0_0_0);
      usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/*'/0'/0'`, 1, 5));
      usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/0'/*'/0'`, 1, 5));
      usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/0'/0'/*'`, 1, 5));
    } else {
      const acc_1_0_0 = await this.scanPath(`44'/1729'/1'/0'/0'`);
      const acc_0_1_0 = await this.scanPath(`44'/1729'/0'/1'/0'`);
      const acc_0_0_1 = await this.scanPath(`44'/1729'/0'/0'/1'`);
      if (acc_1_0_0.length) {
        usedAccounts = usedAccounts.concat(acc_1_0_0);
        usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/*'/0'/0'`, 2, 5));
      }
      if (acc_0_1_0.length) {
        usedAccounts = usedAccounts.concat(acc_0_1_0);
        usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/0'/*'/0'`, 2, 5));
      }
      if (acc_0_0_1.length) {
        usedAccounts = usedAccounts.concat(acc_0_0_1);
        usedAccounts = usedAccounts.concat(await this.scanPath(`44'/1729'/0'/0'/*'`, 2, 5));
      }
    }

    const count = usedAccounts.length;
    if (count > 1) {
      this.messageService.addSuccess(`${count} accounts found!`);
    }
    console.log('found', usedAccounts);

    // return first unused account, if no used accounts found
    if (!count) {
      const path = `44'/1729'/0'/0'`;
      const pk = await this.getPublicAddress(path);
      const pkh = pkToPkh(pk);
      usedAccounts.push({ path, pk, pkh });
    }
    this.unlockTransport();
    return usedAccounts;
  }
  private async scanPath(_path: string, startIndex = 0, allowedGap = 10): Promise<UsedAccount[]> {
    console.log('scan paths', _path);
    let gap = 0;
    const usedAccounts: UsedAccount[] = [];
    let i = startIndex;
    while (gap <= allowedGap) {
      const path = _path.replace('*', i.toString());
      const pk = await this.getPublicAddress(path);
      const pkh = pkToPkh(pk);
      console.log('path', path);
      if (await this.tzktService.isUsedAccount(pkh).catch((e) => false)) {
        usedAccounts.push({ path, pk, pkh });
        gap = 0;
      } else {
        gap++;
      }
      i++;
      if (!_path.includes('*')) {
        break;
      }
    }
    return usedAccounts;
  }
  private sanitize(res: any, getPk: boolean) {
    res = JSON.parse(JSON.stringify(res));
    if (getPk && typeof res?.publicKey !== 'string') {
      throw Error('Invalid pk');
    }
    if (!getPk && typeof res?.signature !== 'string') {
      throw Error('Invalid signature');
    }
    return res;
  }
}
