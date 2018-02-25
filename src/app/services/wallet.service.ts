import { Injectable } from '@angular/core';
import { MessageService } from './message.service';

import * as lib from '../../assets/js/main.js';
import * as bip39 from 'bip39';
// import * as CryptoJS from 'crypto-js';
import * as rnd2 from 'randomatic';
import * as pbkdf2 from 'pbkdf2';
import * as CryptoJS from 'crypto-js';

export interface KeyPair {
  sk: string|null;
  pk: string|null;
  pkh: string;
}
export interface Account {
  keyPair: KeyPair|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
}
export interface Wallet {
  mnemonic: string|null;
  salt: string|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
  account: Account|null;
}
@Injectable()
export class WalletService {
  wallet: Wallet = this.emptyWallet();
  constructor(private messageService: MessageService) { }

  createNewWallet(): string {
    this.wallet.mnemonic = bip39.generateMnemonic();
    this.wallet.salt =  rnd2('aA0', 32);
    this.createNewAccount();
    return this.wallet.mnemonic;
  }
  createNewAccount() {
    this.wallet.account = {
      keyPair: null,
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0
    };
    this.createNewKeyPair();
  }
  createNewKeyPair() {
      const keyPair = this.keyPairFromMnemonic(this.wallet.mnemonic, 1);
      this.wallet.account.keyPair = {
        sk: null,
        pk: null,
        pkh: keyPair.pkh
      };
  }
  keyPairFromMnemonic(mnemonic: string, n: number) {
      return lib.eztz.crypto.generateKeysFromSeedMulti(mnemonic, '', n);
  }
  encrypt(plaintext: string, password: string): string {
    const key = pbkdf2.pbkdf2Sync(password, this.wallet.salt, 10000, 32).toString(); // 100 000 = ~1.75s => 1 000 = 0.018s
    const chiphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
    return chiphertext;
  }
  decrypt(chiphertext: string, password: string): string {
    try {
      const key = pbkdf2.pbkdf2Sync(password, this.wallet.salt, 10000, 32).toString();
      const plainbytes = CryptoJS.AES.decrypt(chiphertext, key);
      const plaintext = plainbytes.toString(CryptoJS.enc.Utf8);
      return plaintext;
    } catch (err) {
      this.messageService.add(err);
      return '';
    }
  }
  encryptWallet(password: string): any {
    this.wallet.mnemonic = this.encrypt(this.wallet.mnemonic, password);
    return {seed: this.wallet.mnemonic, salt: this.wallet.salt};
  }
  decryptWallet(password: string) {
    const mnemonic = this.decrypt(this.wallet.mnemonic, password);
    if (mnemonic === '') {
      this.messageService.add('Decryption failed');
    } else {
      this.wallet.mnemonic = mnemonic;
    }
  }
  emptyWallet(): Wallet {
    return {
      mnemonic: null,
      salt: null,
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0,
      account: null
    };
  }
  clearWallet() {
    this.wallet = this.emptyWallet();
  }
}
