import { Injectable } from '@angular/core';
import * as pbkdf2 from 'pbkdf2';
import * as AES from 'aes-js';
import * as scrypt from 'scryptsy';
import * as cryptob from 'crypto-browserify';
import * as forge from 'node-forge';
import { rejects } from 'assert';
declare const Buffer;
@Injectable()
export class EncryptionService {
  constructor() { }
  async encrypt(plaintext: any, password: string, version: number, salt: string = null): Promise<any> {
    if (version === 1) {
      throw new Error('Encryption version no longer supported');
    } else if (version === 2) {
      return this.encrypt_v2(plaintext, password);
    } else if (version === 3) {
      return this.encrypt_v2(plaintext, password, salt);
    } else {
      throw new Error('Unrecognized encryption format');
    }
  }
  async decrypt(chiphertext: string, password: string, salt: string, version: number): Promise<any> {
    if (version === 1) {
      return this.decrypt_v1(chiphertext, password, salt);
    } else if (version === 2 || version === 3) {
      return this.decrypt_v2(chiphertext, password, salt);
    } else {
      throw new Error('Unrecognized encryption format');
    }
  }
  // Version 1
  async encrypt_v1(plaintext: any, password: string, salt: string): Promise<string> {
    return new Promise(resolve => {
      try {
        if (!password || !salt) {
          throw new Error('Missing password or salt');
        }
        pbkdf2.pbkdf2(password, salt, 10000, 32, 'sha512', (err, key) => {
          if (err) {
            throw (err);
          }
          const aesCtr = new AES.ModeOfOperation.ctr(key);
          let chiphertext = aesCtr.encrypt(plaintext);
          chiphertext = AES.utils.hex.fromBytes(chiphertext);
          resolve(chiphertext);
        });
      } catch (e) {
        console.warn(e);
        resolve('');
      }
    });
  }
  async decrypt_v1(chiphertext: string, password: string, salt: string): Promise<any> {
    return new Promise(resolve => {
      try {
        if (!password || !salt) {
          throw new Error('Missing password or salt');
        }
        pbkdf2.pbkdf2(password, salt, 10000, 32, 'sha512', (err, key) => {
          if (err) {
            throw (err);
          }
          chiphertext = AES.utils.hex.toBytes(chiphertext);
          const aesCtr = new AES.ModeOfOperation.ctr(key);
          const plaintext = aesCtr.decrypt(chiphertext);
          resolve(plaintext);
        });
      } catch (e) {
        console.warn(e);
        resolve('');
      }
    })
  }
  // Version 2
  async encrypt_v2(plaintext: Buffer, password: string, salt?: string): Promise<any> {
    if (!password) {
      throw new Error('Missing password');
    }
    let salty;
    if (salt) {
      salty = new Buffer(salt, 'hex');
    } else {
      salty = cryptob.randomBytes(16);
    }
    const key = await scrypt.async(password, salty, 65536, 8, 1, 32);
    const cipher: any = forge.cipher.createCipher('AES-GCM', key.toString('binary'));
    cipher.start({
      iv: salty,
    });
    const byteStringBuffer = forge.util.createBuffer(plaintext.toString('binary'), 'utf-8');
    cipher.update(byteStringBuffer);
    cipher.finish();
    const chiphertext = cipher.output.toHex() + '==' + cipher.mode.tag.toHex();
    return { chiphertext: chiphertext, iv: salty.toString('hex') };
  }
  async decrypt_v2(chipher: string, password: string, salt: string): Promise<string> {
    try {
      if (!password || !salt) {
        throw new Error('Missing password or salt');
      }
      const parts = chipher.split('==');
      const chiphertext = parts[0];
      const tag = parts[1];
      const key = await scrypt.async(password, new Buffer(salt, 'hex'), 65536, 8, 1, 32);
      const decipher: any = forge.cipher.createDecipher('AES-GCM', key.toString('binary'));
      decipher.start({
        iv: new Buffer(salt, 'hex'),
        tag: forge.util.createBuffer((new Buffer(tag, 'hex')).toString('binary'), 'utf-8'), // authentication tag from encryption
      });
      decipher.update(forge.util.createBuffer((new Buffer(chiphertext, 'hex')).toString('binary'), 'utf-8'));
      const pass = decipher.finish();
      if (pass) {
        return new Buffer(decipher.output.toHex(), 'hex');
      } else {
        return null;
      }
    } catch (err) {
      console.warn(err);
      return null;
    }
  }
  bumpIV(salt: string, bumps: number) {
    if (bumps > 255) {
      throw new Error('Invalid incremention');
    }
    const buf = new Buffer(salt, 'hex');
    buf[13] = (buf[13] + 1) % 256;
    return buf.toString('hex');
  }
}
