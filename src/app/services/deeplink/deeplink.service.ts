import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { OperationService } from '../operation/operation.service';
import { WalletService } from '../../services/wallet/wallet.service';
import { MessageService } from '../../services/message/message.service';

@Injectable({
  providedIn: 'root'
})
export class DeeplinkService {
  private pairingJson = '';
  constructor(private operationService: OperationService, private walletService: WalletService, private messageService: MessageService) {}
  set(params: Params) {
    console.log(params);
    this.pairingJson = this.extractPairingJson(params);
    if (this.pairingJson && !this.walletService.wallet) {
      this.messageService.addWarning('Access your wallet to complete the pairing');
    }
    console.log(this.pairingJson);
  }
  extractPairingJson(params: Params): string {
    if (params.type === 'tzip10' && params.data) {
      try {
        return this.operationService.b58cdecode(params.data, '').toString();
      } catch (e) {
        return '';
      }
    } else if (params?.uri && params.uri.startsWith('wc:')) {
      return params.uri;
    }
    return '';
  }
  popPairingJson(): string {
    const pairingJson = this.pairingJson;
    this.pairingJson = '';
    return pairingJson;
  }
  QRtoPairingJson(qrPayload: string): string {
    if (qrPayload.length > 26 && qrPayload.slice(0, 26) === 'tezos://?type=tzip10&data=') {
      qrPayload = qrPayload.slice(26);
    }
    try {
      return this.operationService.b58cdecode(qrPayload, '').toString();
    } catch {}
    return '';
  }
}
