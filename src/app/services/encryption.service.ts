import { Injectable } from '@angular/core';

import * as pbkdf2 from 'pbkdf2';
import * as AES from 'aes-js';
import * as scrypt from 'scryptsy';

@Injectable()
export class EncryptionService {
  constructor() { }

  encrypt(plaintext: any, password: string, salt: string, version: number): string {
    if (version === 1) {
      return this.encrypt_v1(plaintext, password, salt);
    } else if (version === 2) {
      return this.encrypt_v2(plaintext, password, salt);
    } else {
      throw new Error('Unrecognised encryption format');
    }
  }
  decrypt(chiphertext: string, password: string, salt: string, version: number): any {
    if (version === 1) {
      return this.decrypt_v1(chiphertext, password, salt);
    } else if (version === 2) {
      return this.decrypt_v2(chiphertext, password, salt);
    } else {
      throw new Error('Unrecognised encryption format');
    }
  }
  // Version 1
  encrypt_v1(plaintext: any, password: string, salt: string): string {
    const key = pbkdf2.pbkdf2Sync(password, salt, 10000, 32, 'sha512');
    const aesCtr = new AES.ModeOfOperation.ctr(key);
    let chiphertext = aesCtr.encrypt(plaintext);
    chiphertext = AES.utils.hex.fromBytes(chiphertext);
    return chiphertext;
  }
  decrypt_v1(chiphertext: string, password: string, salt: string): any {
    try {
      const key = pbkdf2.pbkdf2Sync(password, salt, 10000, 32, 'sha512');
      chiphertext = AES.utils.hex.toBytes(chiphertext);
      const aesCtr = new AES.ModeOfOperation.ctr(key);
      const plaintext = aesCtr.decrypt(chiphertext);
      return plaintext;
    } catch (err) {
      return '';
    }
  }
  // Version 2
  encrypt_v2(plaintext: any, password: string, salt: string): string {
    const key = scrypt(password, salt, 1048576, 8, 1, 32);
    const aesCtr = new AES.ModeOfOperation.ctr(key);
    let chiphertext = aesCtr.encrypt(plaintext);
    chiphertext = AES.utils.hex.fromBytes(chiphertext);
    return chiphertext;
  }
  decrypt_v2(chiphertext: string, password: string, salt: string): any {
    try {
      const key = scrypt(password, salt, 1048576, 8, 1, 32);
      chiphertext = AES.utils.hex.toBytes(chiphertext);
      const aesCtr = new AES.ModeOfOperation.ctr(key);
      const plaintext = aesCtr.decrypt(chiphertext);
      return plaintext;
    } catch (err) {
      return '';
    }
  }
}
