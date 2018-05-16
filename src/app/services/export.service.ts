import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';
import {WalletService } from './wallet.service';
import { WalletType } from './../interfaces';

@Injectable()
export class ExportService {

  constructor(
    private walletService: WalletService
  ) { }
  downloadWallet(data = this.walletService.exportKeyStore()) {
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    let filename = 'wallet.tez';
    if (data.walletType === 1) {
      filename = 'view-only_wallet.tez';
    } else if (data.walletType === 2) {
      filename = 'observer_wallet.tez';
    }
    saveAs(blob, filename);
  }
  downloadViewOnlyWallet(pk: string) {
    const keyStore = this.walletService.exportKeyStore();
    keyStore.pk = pk;
    keyStore.encryptedSeed = undefined;
    keyStore.walletType = WalletType.ViewOnlyWallet;
    this.downloadWallet(keyStore);
  }
  downloadOperationData(hex: string, signed: boolean) {
    const data = {
      hex: hex,
      signed: signed
    };
    let filename;
    if (signed) {
      filename = 'signed.tzop';
    } else {
      filename = 'unsigned.tzop';
    }
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    saveAs(blob, filename);
  }
}
