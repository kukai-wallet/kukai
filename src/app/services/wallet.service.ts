import { Injectable } from '@angular/core';

import * as bip39 from 'bip39';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { Wallet, Balance, KeyPair, WalletType } from './../interfaces';

import { EncryptionService } from './encryption.service';
import { OperationService } from './operation.service';


@Injectable()
export class WalletService {
  storeKey = `kukai-wallet`;
  wallet: Wallet;
  constructor(
    private translate: TranslateService,
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
    // console.log('Entropy 1: ' + entropy);
    // console.log('Entropy 2: ' + extraEntropy);
    let mixed = '';
    for (let i = 0; i < 40; i++) {
      mixed = mixed + (Number('0x' + entropy[i]) ^ Number('0x' + extraEntropy[i])).toString(16);
    }
    // console.log('Entropy m: ' + mixed);
    if (mixed.length !== 40) {
      console.log('Not 160 bits entropy');
      throw new Error('Invalid entropy mix');
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
      const keys = this.operationService.seed2keyPair(this.encryptionService.decrypt(this.wallet.seed, pwd, this.getSalt()));
      if (keys.pkh === this.wallet.accounts[0].pkh) {
        return keys;
      } else {
        return null;
      }
    } else if (this.isViewOnlyWallet()) {
      return {
        pkh: this.wallet.accounts[0].pkh,
        pk: this.wallet.seed,
        sk: null
      };
    }
  }
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
  walletTypePrint(): string {
    if (this.isFullWallet()) {
      let fullWallet = '';
      this.translate.get('WALLETSERVICE.FULLWALLET').subscribe(
          (res: string) => fullWallet = res
      );
      return fullWallet;  // 'Full wallet';
    } else if (this.isViewOnlyWallet()) {
      let viewOnlyWallet = '';
      this.translate.get('WALLETSERVICE.FULLWALLET').subscribe(
          (res: string) => viewOnlyWallet = res
      );
      return viewOnlyWallet;  // 'View-only wallet';
    } else if (this.isObserverWallet()) {
      let observerWallet = '';
      this.translate.get('WALLETSERVICE.FULLWALLET').subscribe(
          (res: string) => observerWallet = res
      );
      return observerWallet;  // 'Observer wallet';
    } else {
      return '';
    }
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
      data.encryptedSeed = this.wallet.seed;
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
      encryptedSeed: seed
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
