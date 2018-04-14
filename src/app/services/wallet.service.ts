import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { Wallet, Account, Balance, KeyPair } from './../interfaces';
import { EncryptionService } from './encryption.service';

import * as lib from '../../assets/js/main2.js';
import * as bip39 from 'bip39';
import * as rnd2 from 'randomatic';

@Injectable()
export class WalletService {
  storeKey = `kukai-wallet`;
  wallet: Wallet;
  constructor(
    private messageService: MessageService,
    private encryptionService: EncryptionService) { }
  /*
    Wallet creation
  */
  createNewWallet(extraEntropy: string): string {
    if (extraEntropy.length < 40) {
      console.log('Skipping extra entropy');
      return bip39.generateMnemonic(160);
    }
    const entropy = bip39.mnemonicToEntropy(bip39.generateMnemonic(160));
    let mixed = '';
    for (let i = 0; i < 40; i++) {
      mixed = mixed + (Number('0x' + entropy[i]) ^ Number('0x' + extraEntropy[i])).toString(16);
    }
    if (mixed.length !== 40) {
      console.log('Not 160 bits entropy');
      return null;
    }
    return bip39.entropyToMnemonic(mixed);
  }
  createEncryptedWallet(mnemonic: string, password: string): any {
    this.wallet = this.emptyWallet();
    this.wallet.salt =  rnd2('aA0', 32);
    this.wallet.accounts = [];
    this.addAccount(lib.eztz.crypto.generateKeys(mnemonic, '').pkh);
    this.wallet.encryptedSeed = this.encryptionService.encrypt(bip39.mnemonicToEntropy(mnemonic), password, this.wallet.salt);
    return {wallet: 'Kukai', type: 'FullWallet', version: '1.0', seed: this.wallet.encryptedSeed,
            salt: this.wallet.salt, pkh: this.wallet.accounts[0].pkh};
  }
  /*
    Handle accounts
  */
  async createAccount(keys: KeyPair, pkh: string, amount: number, fee: number): Promise<boolean> {
    const promise = lib.eztz.rpc.account(keys, amount, true, true, keys.pkh, fee);
    if (promise != null) {
      return promise.then(
        (val) => {this.addAccount(val.contracts[0]);
          this.messageService.addSuccess('New account created!');
        return true; },
        (err) => { this.messageService.addError('Create new account failed: ' + JSON.stringify(err));
      return false; }
      );
    } else {
      return false;
    }
  }
  addAccount(pkh) {
    this.wallet.accounts.push({
      pkh: pkh,
      delegate: '',
      balance: this.emptyBalance(),
      numberOfActivites: 0,
      activities: []
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
    let mnemonic = this.encryptionService.decrypt(this.wallet.encryptedSeed, password, this.wallet.salt);
    if (!mnemonic) {
      this.messageService.addError('Decryption failed');
    } else {
      mnemonic = bip39.entropyToMnemonic(mnemonic);
      return lib.eztz.crypto.generateKeys(mnemonic, '');
    }
    return null;
  }
  /*
    Clear wallet data from browser
  */
  clearWallet() {
    this.wallet = null;
    localStorage.removeItem(this.storeKey);
  }
  emptyWallet(): Wallet {
    return {
      encryptedSeed: null,
      salt: null,
      balance: this.emptyBalance(),
      XTZrate: 0,
      accounts: []
    };
  }
  emptyBalance(): Balance {
    return {
      balanceXTZ: 0,
      pendingXTZ: 0,
      balanceFiat: 0,
      pendingFiat: 0
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
