import { Injectable } from '@angular/core';
import { KeyPair, WalletType } from './../../interfaces';
import { WalletObject, LegacyWallet, HdWallet, LegacyWalletV2, LegacyWalletV1, ImplicitAccount, LedgerWallet, OriginatedAccount } from './wallet';
import { EncryptionService } from '../encryption/encryption.service';
import { OperationService } from '../operation/operation.service';
import { utils } from '@tezos-core-tools/crypto-utils';
@Injectable()

export class WalletService {
  storeKey = `kukai-wallet`;
  wallet: WalletObject;

  constructor(
    private encryptionService: EncryptionService,
    private operationService: OperationService
  ) { }
  /*
    Wallet creation
  */
  createNewWallet(): string {
    return this.operationService.generateMnemonic();
  }
  createEncryptedWallet(mnemonic: string, password: string, passphrase: string = ''): any {
    const  seed = this.operationService.mnemonic2seed(mnemonic, passphrase);
    const keyPair: KeyPair = this.operationService.seed2keyPair(seed);
    const encrypted = this.encryptionService.encrypt(seed, password, 2);
    const encryptedSeed = encrypted.chiphertext;
    const salt = encrypted.iv;
    return { data: this.exportKeyStoreInit(WalletType.FullWallet, keyPair.pkh, encryptedSeed, salt), pkh: keyPair.pkh, pk: keyPair.pk };
  }
  getKeys(pwd: string): KeyPair {
    let seed;
    if (this.wallet instanceof LegacyWalletV1) {
      seed = this.encryptionService.decrypt(this.wallet.encryptedSeed, pwd, this.wallet.salt, 1);
    } else if (this.wallet instanceof LegacyWalletV2) {
      seed = this.encryptionService.decrypt(this.wallet.encryptedSeed, pwd, this.wallet.IV, 2);
    } else {
      return null;
    }
    const keys = this.operationService.seed2keyPair(seed);
    return keys;
  }
  // getSalt(pkh: string = this.wallet.accounts[0].pkh) {
  //   return pkh.slice(3, 19);
  // }
  /*
    Handle accounts
  */
  addImplicitAccount(pk: string) {
    const pkh = utils.pkToPkh(pk);
    this.wallet.implicitAccounts.push(new ImplicitAccount(pkh, pk));
    this.storeWallet();
  }
  addOriginatedAccount(kt: string, manager: string) {
    const implicitAccount = this.wallet.getImplicitAccount(manager);
    if (implicitAccount) {
      const origAcc = new OriginatedAccount(kt, implicitAccount.pkh, implicitAccount.pk)
      implicitAccount.originatedAccounts.push(origAcc);
    } else {
      console.warn(`Manager address $(manager) not found`);
    }
  }
  addressExists(address: string): boolean {
    return this.wallet.getAccounts().findIndex(a => a.address === address) !== -1;
  }
  /*
    Help functions
  */
  // getIndexFromPkh(pkh: string): number {
  //   return this.wallet.implicitAccounts.findIndex(a => a.pkh === pkh);
  // }
  // getKeys(pwd: string): KeyPair {
  //   if (this.isFullWallet()) {
  //     const seed = this.encryptionService.decrypt(this.wallet.seed, pwd, this.wallet.salt, this.wallet.encryptionVersion);
  //     if (!seed) {
  //       return null;
  //     }
  //     const keys = this.operationService.seed2keyPair(seed);
  //     if (this.wallet.encryptionVersion === 2 || keys.pkh === this.wallet.accounts[0].pkh) {
  //       return keys;
  //     } else {
  //       return null;
  //     }
  //   } else if (this.isViewOnlyWallet() || this.isLedgerWallet()) {
  //     return {
  //       pkh: this.wallet.accounts[0].pkh,
  //       pk: this.wallet.seed,
  //       sk: null
  //     };
  //   }
  // }
  // getPk(): string {
  //   if (this.isFullWallet()) {
  //     return this.wallet.pk;
  //   } else if (this.isViewOnlyWallet() || this.isLedgerWallet()) {
  //     return this.wallet.seed;
  //   }
  //   return null;
  // }
  /*
    Clear wallet data from browser
  */
  clearWallet() {
    this.wallet = null;
    localStorage.removeItem(this.storeKey);
  }
  // emptyWallet(type: WalletType): Wallet {
  //   const w: Wallet = {
  //       seed: null,
  //       salt: null,
  //       encryptionVersion: null,
  //       type: type,
  //       balance: this.emptyBalance(),
  //       XTZrate: null,
  //       accounts: []
  //   };
  //   return w;
  // }
  // emptyBalance(): Balance {
  //   return {
  //     balanceXTZ: null,
  //     pendingXTZ: null,
  //     balanceFiat: null,
  //     pendingFiat: null
  //   };
  // }
  /*
  Used to decide wallet type
  */
  isFullWallet(): boolean {
    return (this.wallet instanceof LegacyWallet);
  }
  isViewOnlyWallet(): boolean {
    return false;
  }
  isObserverWallet(): boolean {
    return false;
  }
  isLedgerWallet(): boolean {
    return (this.wallet instanceof LedgerWallet);
  }
  // walletTypePrint(): string {
  //   if (this.isFullWallet()) {
  //     return 'Full wallet';
  //   } else if (this.isViewOnlyWallet()) {
  //     return 'View-only wallet';
  //   } else if (this.isObserverWallet()) {
  //     return 'Observer wallet';
  //   } else if (this.isLedgerWallet()) {
  //     return 'Ledger wallet';
  //   } else {
  //     return '';
  //   }
  // }
  /*
    Export
  */
  // exportKeyStore() {
  //   const data: any = {
  //     provider: 'Kukai',
  //     version: this.wallet.encryptionVersion,
  //     walletType: this.wallet.type,
  //     pkh: this.wallet.accounts[0].pkh
  //   };
  //   if (this.isFullWallet() && this.wallet.encryptionVersion === 2) {
  //     data.iv = this.wallet.salt;
  //   } else {
  //     data.pkh = this.wallet.accounts[0].pkh;
  //   }
  //   if (this.isFullWallet()) {
  //     data.encryptedSeed = this.wallet.seed;
  //   } else if (this.isViewOnlyWallet() || this.isLedgerWallet()) {
  //     data.pk = this.wallet.seed;
  //     if (this.isLedgerWallet()) {
  //       data.derivationPath = this.wallet.derivationPath;
  //     }
  //   }
  //   return data;
  // }
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
    let type = 'unknown';
    if (this.wallet instanceof HdWallet) {
      type = 'HdWallet';
    } else if (this.wallet instanceof LegacyWalletV1) {
      type = 'LegacyWalletV1';
    } else if (this.wallet instanceof LegacyWalletV2) {
      type = 'LegacyWalletV2';
    }
    console.log('Type is ' + type);
    localStorage.setItem(this.storeKey, JSON.stringify({type, data: JSON.stringify(this.wallet)}));
  }
  loadStoredWallet() {
    const walletData = localStorage.getItem(this.storeKey);
    if (walletData && walletData !== 'undefined') {
      const parsedWalletData = JSON.parse(walletData);
      if (parsedWalletData.type) {
        const wd = JSON.parse(parsedWalletData.data);
        this.recreateWallet(wd);
        console.log('Load success!!!');
        console.log(typeof this.wallet);
      } else {
        console.log('couldnt load');
        this.clearWallet();
      }
    }
  }
  recreateWallet(wd: any) {
    this.wallet = new LegacyWalletV2(wd.IV, wd.encryptedSeed);
    this.wallet.XTZrate = wd.XTZrate;
    this.wallet.totalBalanceUSD = wd.totalBalanceUSD;
    this.wallet.totalBalanceXTZ = wd.totalBalanceXTZ;
    console.log(wd.implicitAccounts);
    for (const implicit of wd.implicitAccounts) {
      const impAcc: ImplicitAccount = new ImplicitAccount(implicit.pkh, implicit.pk);
      impAcc.balanceUSD = implicit.balanceUSD;
      impAcc.balanceXTZ = implicit.balanceXTZ;
      impAcc.delegate = implicit.delegate;
      impAcc.activitiesCounter = implicit.activitiesCounter;
      impAcc.activities = implicit.activities;
      for (const originated of implicit.originatedAccounts) {
        const origAcc = new OriginatedAccount(originated.address, impAcc.pkh, impAcc.pk);
        origAcc.balanceUSD = originated.balanceUSD;
        origAcc.balanceXTZ = originated.balanceXTZ;
        origAcc.delegate = originated.delegate;
        origAcc.activitiesCounter = originated.activitiesCounter;
        origAcc.activities = originated.activities;
        impAcc.originatedAccounts.push(origAcc);
      }
      this.wallet.implicitAccounts.push(impAcc);
    }
  }
}
