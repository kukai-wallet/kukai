import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { Wallet, Account, Balance, KeyPair, WalletType } from './../interfaces';
import { EncryptionService } from './encryption.service';
import { OperationService } from './operation.service';
// import * as lib from '../../assets/js/main.js';
import * as bip39 from 'bip39';
import * as rnd2 from 'randomatic';

@Injectable()
export class WalletService {
  storeKey = `kukai-wallet`;
  wallet: Wallet;
  constructor(
    private messageService: MessageService,
    private encryptionService: EncryptionService,
    private operationService: OperationService
  ) { }
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
    this.wallet.accounts = [];
    this.addAccount(this.operationService.generateKeys(mnemonic, '').pkh);
    this.wallet.seed = this.encryptionService.encrypt(bip39.mnemonicToEntropy(mnemonic), password, this.getSalt());
    return this.exportKeyStore();
  }
  getSalt() {
    return this.wallet.accounts[0].pkh.slice(19, 36);
  }
  createEncryptedTgeWallet(mnemonic: string, passphrase: string): string {
    this.wallet = this.emptyWallet();
    this.wallet.accounts = [];
    this.wallet.passphrase = true;
    this.addAccount(this.operationService.generateKeys(mnemonic, passphrase).pkh);
    this.wallet.seed = bip39.mnemonicToEntropy(mnemonic);
    return this.wallet.accounts[0].pkh;
  }
  /*
    Handle accounts
  */
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
  getKeys(password: string, passphrase): KeyPair {
    let seed;
    if (password) {
      seed = this.encryptionService.decrypt(this.wallet.seed, password, this.getSalt());
      if (!seed) {
        this.messageService.addError('Decryption failed');
      }
    } else {
      seed = this.wallet.seed;
    }
      const mnemonic = bip39.entropyToMnemonic(seed);
      if (passphrase) {
        return this.operationService.generateKeys(mnemonic, passphrase);
      } else {
        return this.operationService.generateKeys(mnemonic, '');
    }
  }
  getKeysHelper(pwd: string): KeyPair {
    let keys;
    if (this.type() === WalletType.FullWallet) {
        if (this.isPasswordProtected()) {
        keys = this.getKeys(pwd, null);
        } else {
        keys = this.getKeys(null, pwd);
        }
    } else if (this.type() === WalletType.ViewOnlyWallet) {
        keys = {
            sk: null,
            pk: this.wallet.seed,
            pkh: this.wallet.accounts[0].pkh
        };
    }
    return keys;
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
      seed: null,
      passphrase: null,
      balance: this.emptyBalance(),
      XTZrate: null,
      accounts: []
    };
  }
  emptyBalance(): Balance {
    return {
      balanceXTZ: null,
      pendingXTZ: null,
      balanceFiat: null,
      pendingFiat: null
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
  /*
  Used to decide wallet type
  */
  isReadOnly() {
    if (this.wallet.seed) {
      return false;
    } else {
      return true;
    }
  }
  isPasswordProtected() {
    if (this.wallet.seed.slice(this.wallet.seed.length - 2, this.wallet.seed.length) === '==') {
      return true;
    } else {
      return false;
    }
  }
  isPassphraseProtected(): boolean {
    if (this.wallet.passphrase) {
      return true;
    } else {
      return false;
    }
  }
  isFullWallet(): boolean {
    if (this.type() === WalletType.FullWallet) {
      return true;
    }
    return false;
  }
  isViewOnlyWallet(): boolean {
    if (this.type() === WalletType.ViewOnlyWallet) {
      return true;
    }
    return false;
  }
  isObserverWallet(): boolean {
    if (this.type() === WalletType.ObserverWallet) {
      return true;
    }
    return false;
  }
  type(): WalletType {
    if (!this.wallet.seed) {
      return WalletType.ObserverWallet;
    }
    if (this.wallet.seed.slice(0, 4) === 'edpk') {
      return WalletType.ViewOnlyWallet;
    }
    return WalletType.FullWallet;
  }
  exportKeyStore() {
    return {provider: 'Kukai', walletType: this.type(), version: 1.0, data: this.wallet.seed,
    passphrase: this.isPassphraseProtected(), pkh: this.wallet.accounts[0].pkh};
  }
}
