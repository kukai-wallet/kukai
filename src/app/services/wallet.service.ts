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
  id: number;
  visible: boolean;
  keyPair: KeyPair|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
}
export interface Wallet {
  index: number;
  mnemonic: string|null;
  salt: string|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
  accounts: Account[]|null;
}
@Injectable()
export class WalletService {
  storeKey = `kukai-wallet`;
  wallet: Wallet = this.emptyWallet();
  constructor(private messageService: MessageService) { }

  createNewWallet(): string {
    this.wallet.mnemonic = bip39.generateMnemonic();
    this.wallet.salt =  rnd2('aA0', 32);
    this.wallet.accounts = [];
    for (let i = 0; i < 10; i++) {
      this.createNewAccount(i, '', true);
    }
    this.wallet.accounts[0].visible = true;
    return this.wallet.mnemonic;
  }
  createNewAccount(id: number, pkh: string, init: boolean) {
    this.wallet.accounts.push({
      id: id,
      visible: false,
      keyPair: this.createNewKeyPair(id, pkh, init),
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0
    });
  }
  addAccount() {
    while (this.wallet.index < 10 && this.wallet.accounts[this.wallet.index].visible === true) { this.wallet.index++; }
    if (this.wallet.index < 10) {
      this.wallet.accounts[this.wallet.index].visible = true;
      this.saveWallet();
    } else {
      this.messageService.add('Maximum of 10 accounts allowed');
    }
  }
  hideAccount(id: number) {
    this.wallet.accounts[id].visible = false;
    this.wallet.index = 0;
    this.saveWallet();
  }
  createNewKeyPair(id: number, pkh: string, init: boolean) {
    if (init) {
      return this.createNewKeyPairfromMnemonic(id);
    } else {
      return this.createNewKeyPairFromPkh(pkh);
    }
  }
  createNewKeyPairFromPkh(pkh: string): any {
    return {
      sk: null,
      pk: null,
      pkh: pkh
    };
  }
  createNewKeyPairfromMnemonic(id: number): any {
      const keyPair = this.keyPairFromMnemonic(this.wallet.mnemonic, id);
      return {
        sk: null,
        pk: null,
        pkh: keyPair.pkh
      };
  }
  keyPairFromMnemonic(mnemonic: string, id: number) {
      return lib.eztz.crypto.generateKeysFromSeedMulti(mnemonic, '', id);
  }
  getPkh(id: number): string {
    if (this.wallet.accounts == null) {
      return '';
    } else {
      return this.wallet.accounts[0].keyPair.pkh;
    }
  }
  getBalance() {
    if (this.wallet.accounts != null) {
      for (let i = 0; i < 10; i++) {
        if (this.wallet.accounts[i].visible === true) {
          const promise = lib.eztz.rpc.getBalance(this.wallet.accounts[i].keyPair.pkh);
          if (promise != null) {
            promise.then(
              (val) => this.wallet.accounts[i].balance = val,
              (err) => this.messageService.add(err)
            );
          }
        }
      }
    }
  }
  encrypt(plaintext: string, password: string): string {
    const key = pbkdf2.pbkdf2Sync(password, this.wallet.salt, 10000, 32).toString(); // 100 000 = ~1.75s => 1 000 = 0.018s
    const chiphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
    return chiphertext;
  }
  exportAccountsPkh(): any {
    const pkhs = [];
    for (let i = 0; i < 10; i++) { pkhs.push(this.wallet.accounts[i].keyPair.pkh); }
    return pkhs;
  }
  importWalletData(json: string): boolean {
    try {
      this.wallet = this.emptyWallet();
      const walletData = JSON.parse(json);
      this.wallet.mnemonic = walletData.seed;
      this.wallet.salt = walletData.salt;
      this.wallet.accounts = [];
      for (let i = 0; i < 10; i++) {
        this.createNewAccount(i, walletData.pkhs[i], false);
      }
      this.wallet.accounts[0].visible = true;
      this.saveWallet();
      return true;
    } catch (err) {
      this.messageService.add(err);
      return false;
    }
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
    return {type: 'encryptedWallet', seed: this.wallet.mnemonic, salt: this.wallet.salt, pkhs: this.exportAccountsPkh()};
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
      index: 0,
      mnemonic: null,
      salt: null,
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0,
      accounts: null
    };
  }
  clearWallet() {
    this.wallet = this.emptyWallet();
    localStorage.removeItem(this.storeKey);
  }
  saveWallet() {
    localStorage.setItem(this.storeKey, JSON.stringify(this.wallet));
  }
  loadStoredWallet(): boolean {
    const walletData = localStorage.getItem(this.storeKey);
    if (walletData) {
      this.wallet = JSON.parse(walletData);
      return true;
    }
    return false;
  }
}
