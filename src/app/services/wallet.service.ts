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
  createNewWallet(): string {
    return bip39.generateMnemonic(160);
  }
  createEncryptedWallet(mnemonic: string, password: string, passphrase: string = ''): any {
    const  seed = this.operationService.mnemonic2seed(mnemonic, passphrase);
    const keyPair: KeyPair = this.operationService.seed2keyPair(seed);
    const encrypted = this.encryptionService.encrypt(seed, password, 2);
    const encryptedSeed = encrypted.chiphertext;
    const salt = encrypted.iv;
    return { data: this.exportKeyStoreInit(WalletType.FullWallet, keyPair.pkh, encryptedSeed, salt), pkh: keyPair.pkh };
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
      const seed = this.encryptionService.decrypt(this.wallet.seed, pwd, this.wallet.salt, this.wallet.encryptionVersion);
      if (!seed) {
        return null;
      }
      const keys = this.operationService.seed2keyPair(seed);
      if (this.wallet.encryptionVersion === 2 || keys.pkh === this.wallet.accounts[0].pkh) {
        return keys;
      } else {
        return null;
      }
    } else if (this.isViewOnlyWallet() || this.isLedgerWallet()) {
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
    const w: Wallet = {
        seed: null,
        salt: null,
        encryptionVersion: null,
        type: type,
        balance: this.emptyBalance(),
        XTZrate: null,
        accounts: []
    };
    return w;
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
  isLedgerWallet(): boolean {
    return (this.wallet && this.wallet.type === WalletType.LedgerWallet);
  }
  walletTypePrint(): string {
    if (this.isFullWallet()) {
      return 'Full wallet';
    } else if (this.isViewOnlyWallet()) {
      return 'View-only wallet';
    } else if (this.isObserverWallet()) {
      return 'Observer wallet';
    } else if (this.isLedgerWallet()) {
      return 'Ledger wallet';
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
      version: this.wallet.encryptionVersion,
      walletType: this.wallet.type,
      pkh: this.wallet.accounts[0].pkh
    };
    if (this.isFullWallet() && this.wallet.encryptionVersion === 2) {
      data.iv = this.wallet.salt;
    } else {
      data.pkh = this.wallet.accounts[0].pkh;
    }
    if (this.isFullWallet()) {
      data.encryptedSeed = this.wallet.seed;
    } else if (this.isViewOnlyWallet() || this.isLedgerWallet()) {
      data.pk = this.wallet.seed;
      if (this.isLedgerWallet()) {
        data.derivationPath = this.wallet.derivationPath;
      }
    }
    return data;
  }
  exportKeyStoreInit(type: WalletType, pkh: string, seed: string, salt: string) {
    const data: any = {
      provider: 'Kukai',
      version: 2.0,
      walletType: type,
      encryptedSeed: seed,
      iv: salt
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
    if (walletData && walletData !== 'undefined') {
      this.wallet = JSON.parse(walletData);
      if (!this.wallet.encryptionVersion) { // Ensure backwards compability in the localStorage - only needed for a while
        this.wallet.encryptionVersion = 1;
      }
    }
  }
}
