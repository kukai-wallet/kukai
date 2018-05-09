import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import * as pbkdf2 from 'pbkdf2';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  hashRounds = 1000;
  constructor() { }

 encrypt(plaintext: string, password: string, salt: string): string {
  const key = pbkdf2.pbkdf2Sync(password, salt, this.hashRounds, 32).toString();
  const chiphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
  return chiphertext;
}
decrypt(chiphertext: string, password: string, salt: string): string {
  try {
    const key = pbkdf2.pbkdf2Sync(password, salt, this.hashRounds, 32).toString();
    const plainbytes = CryptoJS.AES.decrypt(chiphertext, key);
    const plaintext = plainbytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
  } catch (err) {
    return '';
  }
}
}
