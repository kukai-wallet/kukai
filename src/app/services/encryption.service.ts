import { Injectable } from '@angular/core';
import * as pbkdf2 from 'pbkdf2';
import * as AES from 'aes-js';
import * as scrypt from 'scryptsy';
import * as cryptob from 'crypto-browserify';
import * as forge from 'node-forge';
import * as CryptoJS from 'crypto-js';
declare const Buffer;
@Injectable()
export class EncryptionService {
  constructor() { }
  encrypt(plaintext: any, password: string, version: number): any {
    if (version === 1) {
      throw new Error('Encryption version no longer supported');
      // return this.encrypt_v1(plaintext, password, salt);
    } else if (version === 2) {
      return this.encrypt_v2(plaintext, password);
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
  encrypt_v2(plaintext: any, password: string): any {
    const salty = cryptob.randomBytes(16);
    // const key = scrypt(password, salty, 1048576, 8, 1, 32);
    const key = scrypt(password, salty, 65536, 8, 1, 32);
    const cipher: any = forge.cipher.createCipher('AES-GCM', key.toString('binary'));
    cipher.start({
      iv: salty,
    });
    const byteStringBuffer = forge.util.createBuffer(plaintext.toString('binary'), 'utf-8');
    cipher.update(byteStringBuffer); // From buffer to special buffer
    cipher.finish();
    const chiphertext = cipher.output.toHex() + '==' + cipher.mode.tag.toHex();
    return { chiphertext: chiphertext, iv: salty.toString('hex') };
    /*
    */
  }
  decrypt_v2(chipher: string, password: string, salt: string): any {
    try {
      const parts = chipher.split('==');
      const chiphertext = parts[0];
      const tag = parts[1];
      // const key = scrypt(password, salt, 1048576, 8, 1, 32);
      const key = scrypt(password, new Buffer(salt, 'hex'), 65536, 8, 1, 32);
      const decipher: any = forge.cipher.createDecipher('AES-GCM', key.toString('binary'));
      decipher.start({
        iv: new Buffer(salt, 'hex'),
        tag: forge.util.createBuffer((new Buffer(tag, 'hex')).toString('binary'), 'utf-8'), // authentication tag from encryption
      });
      decipher.update(forge.util.createBuffer((new Buffer(chiphertext, 'hex')).toString('binary'), 'utf-8'));
      const pass = decipher.finish();
      if (pass) {
        console.log('Correct tag!');
      } else {
        console.log('Wrong tag!');
        return '';
      }
      return new Buffer(decipher.output.toHex(), 'hex');
    } catch (err) {
      console.log(err);
      return '';
    }
  }
}
