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
  createEncryptedWallet(mnemonic: string, password: string, passphrase: string = ''): any {
    let seed = this.operationService.mnemonic2seed(mnemonic, passphrase);
    const keyPair: KeyPair = this.operationService.seed2keyPair(seed);
    seed = this.encryptionService.encrypt(seed, password, this.getSalt(keyPair.pkh));
    return this.exportKeyStoreInit(WalletType.FullWallet, keyPair.pkh, seed);
  }
  getSalt(pkh: string = this.wallet.accounts[0].pkh) {
    return pkh.slice(3, 19);
  }
  /*createEncryptedTgeWallet(mnemonic: string, passphrase: string): string {
    this.wallet = this.emptyWallet(false, true, WalletType.FullWallet);
    this.wallet.accounts = [];
    this.addAccount(this.operationService.seed2keyPair(this.operationService.mnemonic2seed(mnemonic, passphrase)).pkh);
    this.wallet.seed = bip39.mnemonicToEntropy(mnemonic);
    return this.wallet.accounts[0].pkh;
  }*/
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
  getKeys(pwd: string): KeyPair {
    if (this.isFullWallet()) {
      return this.operationService.seed2keyPair(this.encryptionService.decrypt(this.wallet.seed, pwd, this.getSalt()));
    } else if (this.isViewOnlyWallet()) {
      return {
        pkh: this.wallet.accounts[0].pkh,
        pk: this.wallet.seed,
        sk: null
      };
    }
  }
  /*getKeysHelper(pwd: string): KeyPair {
    let keys;
    if (this.isFullWallet()) {
        if (this.isPasswordProtected()) {
        keys = this.getKeys(pwd, null);
        } else {
        keys = this.getKeys(null, pwd);
        }
    } else if (this.isViewOnlyWallet()) {
        keys = {
            sk: null,
            pk: this.wallet.seed,
            pkh: this.wallet.accounts[0].pkh
        };
    }
    return keys;
  }*/
  /*getMnemonicHelper(pwd: string): string {
    try {
      if (this.isFullWallet()) {
        if (this.isPasswordProtected()) {
          return bip39.entropyToMnemonic(this.encryptionService.decrypt(this.wallet.seed, pwd, this.getSalt()));
        } else if (this.isPassphraseProtected()) {
          return bip39.entropyToMnemonic(this.wallet.seed);
        }
      }
    } catch (err) {
      console.log('Error in getMnemonicHelper(): ' + err);
    }
    return '';
  }*/
  /*
    Clear wallet data from browser
  */
  clearWallet() {
    this.wallet = null;
    localStorage.removeItem(this.storeKey);
  }
  emptyWallet(type: WalletType): Wallet {
    return {
      seed: null,
      type: type,
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
  Used to decide wallet type
  */
  isFullWallet(): boolean {
    return (this.wallet && this.wallet.type === WalletType.FullWallet);
  }
  isViewOnlyWallet(): boolean {
    return (this.wallet && this.wallet.type === WalletType.ViewOnlyWallet);
  }
  isObserverWallet(): boolean {
    return (this.wallet && this.wallet.type === WalletType.ObserverWallet);
  }
  /*
    Export
  */
  exportKeyStore() {
    const data: any = {
      provider: 'Kukai',
      version: 1.0,
      walletType: this.wallet.type,
      pkh: this.wallet.accounts[0].pkh
    };
    if (this.isFullWallet()) {
      data.seed = this.wallet.seed;
    } else if (this.isViewOnlyWallet()) {
      data.pk = this.wallet.seed;
    }
    return data;
  }
  exportKeyStoreInit(type: WalletType, pkh: string, seed: string) {
    const data: any = {
      provider: 'Kukai',
      version: 1.0,
      walletType: type,
      pkh: pkh,
      seed: seed
    };
    return data;
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
