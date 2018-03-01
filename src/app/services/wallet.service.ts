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
  pkh: string|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
}
export interface Identity {
  keyPair: KeyPair|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
}
export interface Wallet {
  encryptedMnemonic: null|string;
  salt: string|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
  accounts: Account[];
  identity: Identity|null;
}
@Injectable()
export class WalletService {
  storeKey = `kukai-wallet`;
  hashRounds = 10000;
  wallet: Wallet = this.emptyWallet();
  constructor(private messageService: MessageService) { }
  /*
    Wallet creation
  */
  createNewWallet(): string {
    return bip39.generateMnemonic();
  }
  createEncryptedWallet(mnemonic: string, password: string): any {
    this.wallet.salt =  rnd2('aA0', 32);
    this.wallet.accounts = [];
    this.wallet.identity = this.createIdentity(mnemonic);
    this.wallet.encryptedMnemonic = this.encrypt(mnemonic, password);
    return {type: 'KukaiEncryptedWallet', seed: this.wallet.encryptedMnemonic,
            pkh: this.wallet.identity.keyPair.pkh, salt: this.wallet.salt};
  }
  createIdentity(mnemonic: string): Identity {
    return {
      keyPair: this.createKeyPair(mnemonic),
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0
    };
  }
  createKeyPair(mnemonic: string): KeyPair {
    const keyPair = lib.eztz.crypto.generateKeys(mnemonic, '');
    return {
      sk: null,
      pk: null,
      pkh: keyPair.pkh
    };
  }
  /*
    Handle accounts
  */
  createAccount() {
    const promise = lib.eztz.rpc.freeAccount(this.wallet.identity.keyPair);
    if (promise != null) {
      promise.then(
        (val) => this.addAccount(val),
        (err) => this.messageService.add(err)
      );
    }
  }
  addAccount(pkh) {
    this.wallet.accounts.push({
      pkh: pkh,
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0
    });
    this.storeWallet();
    setTimeout(() => {
      this.getAccountBalance(this.wallet.accounts.length - 1);
    }, 1000);
  }
  /*
    Balance checks
  */
  getBalanceAll() {
    this.getIdentityBalance();
    for (let i = 0; i < this.wallet.accounts.length; i++) {
      this.getAccountBalance(i);
    }
  }
  getIdentityBalance() {
    const promise = lib.eztz.rpc.getBalance(this.wallet.identity.keyPair.pkh);
    if (promise != null) {
      promise.then(
        (val) => this.updateIdentityBalance(val),
        (err) => this.messageService.add(err)
      );
    }
  }
  updateIdentityBalance(newBalance: number) {
    if (newBalance !== this.wallet.identity.balance) {
      this.wallet.identity.balance = newBalance;
      this.storeWallet();
    }
  }
  getAccountBalance(index: number) {
    const promise = lib.eztz.rpc.getBalance(this.wallet.accounts[index].pkh);
    if (promise != null) {
      promise.then(
        (val) => this.updateAccountBalance(index, val),
        (err) => this.messageService.add(err)
      );
    }
  }
  updateAccountBalance(index: number, newBalance: number) {
    if (newBalance !== this.wallet.accounts[index].balance) {
      this.wallet.accounts[index].balance = newBalance;
      this.storeWallet();
    }
  }
  /*
    Send transactions (transfer : function(keys, from, to, amount, fee))
  */
  sendTransaction(password: string, from: string, to: string, amount: number, fee: number) {
    const keys = this.getKeys(password);
    const promise = lib.eztz.rpc.transfer(keys, from, to, amount, fee);
    if (promise != null) {
      promise.then(
        (val) => this.messageService.add('Transation sent, with operation hash: ' + val.injectedOperation),
        (err) => this.messageService.add('err: ' + JSON.stringify(err))
      );
    }
  }
  getKeys(password: string): KeyPair {
    const mnemonic = this.decrypt(this.wallet.encryptedMnemonic, password);
    if (!mnemonic) {
      this.messageService.add('Decryption failed');
    } else {
      return lib.eztz.crypto.generateKeys(mnemonic, '');
    }
  }
  /*
    Import wallet from Json
  */
  importWalletData(json: string): boolean {
    try {
      const walletData = JSON.parse(json);
      if (walletData.type !== 'KukaiEncryptedWallet') {
        throw new Error(`Unsupported wallet data`);
      }
      this.wallet = this.emptyWallet();
      this.wallet.identity = this.importIdentity(walletData.pkh);
      this.wallet.encryptedMnemonic = walletData.seed;
      this.wallet.salt = walletData.salt;
      this.storeWallet();
      return true;
    } catch (err) {
      this.messageService.add(err);
      return false;
    }
  }
  importIdentity(pkh: string): Identity {
    return {
      keyPair: this.importKeyPair(pkh),
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0
    };
  }
  importKeyPair(pkh: string): KeyPair {
    return {
      sk: null,
      pk: null,
      pkh: pkh
    };
  }
  /*
    Encryption
  */
  encrypt(plaintext: string, password: string): string {
    const key = pbkdf2.pbkdf2Sync(password, this.wallet.salt, this.hashRounds, 32).toString();
    const chiphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
    return chiphertext;
  }
  decrypt(chiphertext: string, password: string): string {
    try {
      const key = pbkdf2.pbkdf2Sync(password, this.wallet.salt, this.hashRounds, 32).toString();
      const plainbytes = CryptoJS.AES.decrypt(chiphertext, key);
      const plaintext = plainbytes.toString(CryptoJS.enc.Utf8);
      return plaintext;
    } catch (err) {
      return '';
    }
  }
  /*
    Clear wallet data from browser
  */
  clearWallet() {
    this.wallet = this.emptyWallet();
    localStorage.removeItem(this.storeKey);
  }
  emptyWallet(): Wallet {
    return {
      encryptedMnemonic: null,
      identity: null,
      salt: null,
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0,
      accounts: []
    };
  }
  /*
    Read and write to localStorage
  */
  storeWallet() {
    localStorage.setItem(this.storeKey, JSON.stringify(this.wallet));
  }
  loadStoredWallet() {
    const walletData = localStorage.getItem(this.storeKey);
    if (walletData) {
      this.wallet = JSON.parse(walletData);
    }
  }
}
