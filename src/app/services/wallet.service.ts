import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { Wallet, Identity, Account, KeyPair } from './../interfaces';
import { EncryptionService } from './encryption.service';

import * as lib from '../../assets/js/main.js';
import * as bip39 from 'bip39';
import * as rnd2 from 'randomatic';

@Injectable()
export class WalletService {
  storeKey = `kukai-wallet`;
  wallet: Wallet = this.emptyWallet();
  constructor(
    private messageService: MessageService,
    private encryptionService: EncryptionService) { }
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
    this.wallet.encryptedMnemonic = this.encryptionService.encrypt(mnemonic, password, this.wallet.salt);
    return {wallet: 'Kukai', type: 'FullWallet', version: '1.0', seed: this.wallet.encryptedMnemonic,
            salt: this.wallet.salt, pkh: this.wallet.identity.pkh};
  }
  createIdentity(mnemonic: string): Identity {
    return {
      pkh: lib.eztz.crypto.generateKeys(mnemonic, '').pkh,
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0
    };
  }
  /*
    Handle accounts
  */
  createAccount(pwd: string, pkh: string, amount: number, fee: number) {
    const keys = this.getKeys(pwd);
    const promise = lib.eztz.rpc.account(keys, amount, true, true, keys.pkh, fee);
    if (promise != null) {
      promise.then(
        (val) => {this.addAccount(val.contracts[0]);
          this.messageService.addSuccess('New account created!'); },
        (err) => this.messageService.addError('Create new account failed: ' + JSON.stringify(err))
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
  }
  /*
    Help functions
  */
  getIndexFromPkh(pkh: string): number {
    return this.wallet.accounts.findIndex(a => a.pkh === pkh);
  }
  getKeys(password: string): KeyPair {
    const mnemonic = this.encryptionService.decrypt(this.wallet.encryptedMnemonic, password, this.wallet.salt);
    if (!mnemonic) {
      this.messageService.addError('Decryption failed');
    } else {
      return lib.eztz.crypto.generateKeys(mnemonic, '');
    }
    return null;
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
