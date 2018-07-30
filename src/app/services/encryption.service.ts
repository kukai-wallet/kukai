import { Injectable } from '@angular/core';

import * as pbkdf2 from 'pbkdf2';
import * as AES from 'aes-js';

@Injectable()
export class EncryptionService {
  hashRounds = 10000; // 10 000 rounds
  constructor() { }

  encrypt(plaintext: any, password: string, salt: string): string {
    const key = pbkdf2.pbkdf2Sync(password, salt, this.hashRounds, 32, 'sha512');
    const aesCtr = new AES.ModeOfOperation.ctr(key);
    let chiphertext = aesCtr.encrypt(plaintext);
    chiphertext = AES.utils.hex.fromBytes(chiphertext);
    return chiphertext;
  }
  decrypt(chiphertext: string, password: string, salt: string): any {
    try {
      const key = pbkdf2.pbkdf2Sync(password, salt, this.hashRounds, 32, 'sha512');
      chiphertext = AES.utils.hex.toBytes(chiphertext);
      const aesCtr = new AES.ModeOfOperation.ctr(key);
      const plaintext = aesCtr.decrypt(chiphertext);
      return plaintext;
    } catch (err) {
      return '';
    }
  }
}
