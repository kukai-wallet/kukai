import { Injectable } from '@angular/core';
import { KeyPair } from '../../interfaces';
import { WalletService } from '../wallet/wallet.service';
import { CONSTANTS } from '../../../environments/environment';
import { Parser } from '@taquito/michel-codec';
import { valueEncoder } from '@taquito/local-forging/dist/lib/michelson/codec';
import { OperationService } from '../operation/operation.service';

@Injectable({
  providedIn: 'root'
})
export class EmbeddedAuthService {

  constructor(
    private walletService: WalletService,
    private operationService: OperationService
  ) { }
  async authenticate(authReq: any, origin: string, keyPair: KeyPair = null): Promise<{ message: string, signature: string }> {
    if (!origin) {
      throw new Error('NO_DOMAIN_FOUND');
    } else if ((!this.walletService?.wallet || !this.walletService.isEmbeddedTorusWallet()) && !keyPair) {
      throw new Error('NO_WALLET_FOUND');
    }
    if (!keyPair) {
      keyPair = await this.walletService.getKeys('', this.walletService.wallet.implicitAccounts[0].pkh).catch(e => {
        throw new Error('NO_KEYS_FOUND');
      });
    }
    const authMessage: string = this.createAuthMessage(authReq?.id, authReq?.nonce, origin, keyPair.pk, keyPair.pkh);
    const signature = this.signMessage(authMessage, keyPair.sk);
    return { message: authMessage, signature };
  }
  private createAuthMessage(requestId: string = '', nonce: string = '', domain: string, publicKey: string, address: string): string {
    if (typeof requestId !== 'string') {
      throw new Error('INVALID_REQUEST_ID');
    } else if (typeof nonce !== 'string') {
      throw new Error('INVALID_NONCE');
    }
    const authPayload: any = {
      requestId,
      purpose: 'authentication',
      currentTime: Math.floor(Date.now() / 1000).toString(), // UNIX timestamp
      nonce,
      network: this._network(),
      publicKey,
      address,
      domain
    };
    if (!requestId) {
      delete authPayload.requestId;
    }
    if (!nonce) {
      delete authPayload.nonce;
    }
    return `Tezos Signed Message: ${JSON.stringify(authPayload)}`;
  }
  _network(): string {
    return CONSTANTS.NETWORK;
  }
  private signMessage(message: string, sk: string): string {
    const parser = new Parser();
    const expr = parser.parseMichelineExpression(`"${message.replace(/"/g, '\\"')}"`);
    const hexMessage = `05${valueEncoder(expr)}`;
    const signature: string = this.operationService.sign(hexMessage, sk).edsig;
    return signature;
  }
}

