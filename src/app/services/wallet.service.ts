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
  storeKey = `kukai-wallet`;
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
      const keyPair = this.keyPairFromMnemonic(this.wallet.mnemonic, 0);
      this.wallet.account.keyPair = {
        sk: null,
        pk: null,
        pkh: keyPair.pkh
      };
  }
  keyPairFromMnemonic(mnemonic: string, n: number) {
      return lib.eztz.crypto.generateKeysFromSeedMulti(mnemonic, '', n);
  }
  getPkh(): string {
    if (this.wallet.account == null) {
      return '';
    } else {
      return this.wallet.account.keyPair.pkh;
    }
  }
  getBalance() {
    if (this.wallet.account != null) {
      const promise = lib.eztz.rpc.getBalance(this.wallet.account.keyPair.pkh);
      if (promise != null) {
        promise.then(
          (val) => this.wallet.account.balance = val,
          (err) => this.messageService.add(err)
        );
      }
    }
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
    localStorage.removeItem(this.storeKey);
  }
  saveWallet() {
    localStorage.setItem(this.storeKey, JSON.stringify(this.wallet));
  }
  async loadStoredWallet() {
    const walletData = localStorage.getItem(this.storeKey);
    if (walletData) {
      this.wallet = JSON.parse(walletData);
    }
  }
}

/*
 async loadStoredWallet() {
    this.resetWallet();

    const walletData = localStorage.getItem(this.storeKey);
    if (!walletData) return this.wallet;

    const walletJson = JSON.parse(walletData);
    this.wallet.seed = walletJson.seed;
    this.wallet.seedBytes = this.util.hex.toUint8(walletJson.seed);
    this.wallet.locked = walletJson.locked;

    if (this.wallet.locked) {
      return this.wallet; // If the wallet is locked on load, it has to be unlocked before we can load anything?
    }

    this.wallet.password = walletJson.password;
    this.wallet.accountsIndex = walletJson.accountsIndex;
    await Promise.all(walletJson.accounts.map(async (account) => this.addWalletAccount(account.index, false)));

    await this.reloadBalances();

    if (this.wallet.accounts.length) {
      this.websocket.subscribeAccounts(this.wallet.accounts.map(a => a.id));
    }

    return this.wallet;
  }

saveWalletExport() {
    const exportData = this.generateWalletExport();

    switch (this.appSettings.settings.walletStore) {
      case 'none':
        localStorage.removeItem(this.storeKey);
        break;
      default:
      case 'localStorage':
        localStorage.setItem(this.storeKey, JSON.stringify(exportData));
        break;
    }
  }

  generateWalletExport() {
    const data = {
      seed: this.wallet.seed,
      locked: this.wallet.locked,
      password: this.wallet.locked ? '' : this.wallet.password,
      accounts: this.wallet.accounts.map(a => ({ id: a.id, index: a.index })),
      accountsIndex: this.wallet.accountsIndex,
    };

    return data;
  }



  */
