import { Injectable } from '@angular/core';
import { MessageService } from './message.service';

import * as lib from '../../assets/js/main.js';
import * as bip39 from 'bip39';
import * as CryptoJS from 'crypto-js';
import * as rnd from 'randombytes';
// import * as sodium from 'libsodium-wrappers';
// import * as Rijndael from 'rijndael-js';
// import * as bs58check from 'bs58check';
// import * as pbkdf2 from 'pbkdf2';
// import * as crs from 'crypto-random-string';

@Injectable()
export class WalletService {
  private mnemonic: string;
  private password: string; // Shouldn't be used
  private salt: string;
  private sk: string;
  private pk: string;
  private pkh: string;
  constructor(private messageService: MessageService) { }
  createNewWallet(): string {
    this.mnemonic = bip39.generateMnemonic();
    this.messageService.add('seed: ' + this.mnemonic);
    this.setKeyPair();
    this.salt = rnd(32);
    this.messageService.add('salt: ' + this.salt);
    return this.mnemonic;
  }
  setKeyPair() {
      const keyPair = this.keyPairFromMnemonic(this.mnemonic);
      this.sk = keyPair.sk;
      this.pk = keyPair.pk;
      this.pkh = keyPair.pkh;
      this.messageService.add('sk: ' + this.sk);
      this.messageService.add('pk: ' + this.pk);
      this.messageService.add('pkh: ' + this.pkh);
  }
  keyPairFromMnemonic(mnemonic: string) {
      return lib.eztz.crypto.generateKeysFromSeedMulti(mnemonic, '', 1);
  }
  encrypt(plaintext: string, password: string): string {
    const chiphertext = CryptoJS.AES.encrypt(plaintext, password + this.salt).toString();
    this.messageService.add('Encrypted: ' + chiphertext);
    return chiphertext;
  }
  decrypt(chiphertext: string, password: string): string {
    try {
      const plainbytes = CryptoJS.AES.decrypt(chiphertext, password + this.salt);
      const plaintext = plainbytes.toString(CryptoJS.enc.Utf8);
      this.messageService.add('Decrypted: ' + plaintext);
      return plaintext;
    } catch (err) {
      return '';
    }
  }
  encryptWallet(password: string): string {
    this.mnemonic = this.encrypt(this.mnemonic, password);
    return this.mnemonic;
  }
  decryptWallet(password: string) {
    const mnemonic = this.mnemonic = this.decrypt(this.mnemonic, password);
    if (mnemonic === '') {
      this.messageService.add('Decryption failed');
    } else {
      this.mnemonic = mnemonic;
    }
  }
}
