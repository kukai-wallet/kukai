import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable()
export class ExportService {

  constructor(
  ) { }
  downloadWallet(data: any) {
    const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
    let filename = 'wallet.tez';
    if (data.walletType === 1) {
      filename = 'view-only_wallet.tez';
    } else if (data.walletType === 2) {
      filename = 'observer_wallet.tez';
    } else if (data.walletType === 3) {
      filename = 'ledger_wallet.tez';
    }
    saveAs(blob, filename);
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
