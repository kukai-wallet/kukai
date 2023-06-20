import { Injectable } from '@angular/core';
import { KeyPair, WalletType, Activity } from './../../interfaces';
import {
  WalletObject,
  HdWallet,
  FullWallet,
  LegacyWalletV1,
  LegacyWalletV2,
  LegacyWalletV3,
  ImplicitAccount,
  LedgerWallet,
  TorusWallet,
  EmbeddedTorusWallet,
  OriginatedAccount,
  WatchWallet
} from './wallet';
import { EncryptionService } from '../encryption/encryption.service';
import { OperationService } from '../operation/operation.service';
import { TorusService } from '../torus/torus.service';
import { utils, hd } from '../../libraries/index';
import { BehaviorSubject } from 'rxjs';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class WalletService {
  storeKey = 'kukai-wallet';
  storageId = 0;
  wallet: WalletObject;

  constructor(
    private encryptionService: EncryptionService,
    private operationService: OperationService,
    private torusService: TorusService,
    private subjectService: SubjectService
  ) {}
  /*
    Wallet creation
  */
  createNewWallet(): string {
    return utils.generateMnemonic(24);
  }
  async createEncryptedWallet(mnemonic: string, password: string, passphrase: string = '', hdSeed: boolean): Promise<any> {
    const seed = utils.mnemonicToSeed(mnemonic, passphrase, hdSeed);
    const entropy: Buffer = Buffer.from(utils.mnemonicToEntropy(mnemonic));
    let keyPair: KeyPair;
    if (!hdSeed) {
      keyPair = this.operationService.seed2keyPair(seed);
    } else {
      keyPair = hd.keyPairFromAccountIndex(seed, 0);
    }
    const encrypted = await this.encryptionService.encrypt(seed, password, 3);
    const encryptedSeed: string = encrypted.chiphertext;
    const iv: string = encrypted.iv;
    /*
      Warning: Make sure to never reuse IV for AES-GCM
    */
    const iv2: string = this.encryptionService.shiftIV(iv, 1);
    const encryptedEntropy: string = (await this.encryptionService.encrypt(entropy, password, 3, iv2)).chiphertext;
    return {
      data: this.exportKeyStoreInit(hdSeed ? WalletType.HdWallet : WalletType.LegacyWallet, encryptedSeed, encryptedEntropy, iv),
      pkh: keyPair.pkh,
      pk: keyPair.pk,
      seed: seed
    };
  }
  async getKeys(pwd: string, pkh?: string): Promise<KeyPair> {
    let seed;
    if (this.wallet instanceof LegacyWalletV1) {
      seed = await this.encryptionService.decrypt(this.wallet.encryptedSeed, pwd, this.wallet.salt, 1);
    } else if (this.wallet instanceof LegacyWalletV2) {
      seed = await this.encryptionService.decrypt(this.wallet.encryptedSeed, pwd, this.wallet.IV, 2);
    } else if (this.wallet instanceof LegacyWalletV3 || this.wallet instanceof HdWallet) {
      seed = await this.encryptionService.decrypt(this.wallet.encryptedSeed, pwd, this.wallet.IV, 3);
    } else if (this.wallet instanceof LedgerWallet) {
      const keyPair: KeyPair = {
        sk: null,
        pk: this.wallet.implicitAccounts[0].pk,
        pkh: this.wallet.implicitAccounts[0].pkh
      };
      return keyPair;
    } else if (this.wallet instanceof EmbeddedTorusWallet) {
      if (this.wallet?.sk) {
        return this.operationService.spPrivKeyToKeyPair(this.wallet.sk);
      } else {
        const keyPair = await this.torusService.getTorusKeyPair(this.wallet.verifier, this.wallet.id);
        if (this.wallet.getImplicitAccount(keyPair.pkh)) {
          return keyPair;
        } else {
          throw new Error('Signed with wrong account');
        }
      }
    } else if (this.wallet instanceof TorusWallet) {
      const sk = this.wallet.getSk();
      if (sk) {
        console.log('Retrieving social login sk from memory');
        this.wallet.updateSkExpiration();
        return this.operationService.spPrivKeyToKeyPair(sk);
      } else {
        console.log('Need to query social login sk from torus');
        const keyPair = await this.torusService.getTorusKeyPair(this.wallet.verifier, this.wallet.id);
        if (this.wallet.getImplicitAccount(keyPair.pkh)) {
          this.wallet.storeSk(keyPair.sk);
          return keyPair;
        } else {
          throw new Error('Signed with wrong account');
        }
      }
    } else {
      return null;
    }
    if (!seed) {
      return null;
    }
    if (this.wallet instanceof HdWallet) {
      if (!pkh) {
        throw new Error('No pkh provided');
      }
      const account = this.wallet.getImplicitAccount(pkh);
      if (!account.derivationPath) {
        throw new Error('No derivationPath found');
      }
      return hd.seedToKeyPair(seed, account.derivationPath);
    } else if (this.wallet instanceof LegacyWalletV1) {
      const keyPair = this.operationService.seed2keyPair(seed);
      if (!keyPair.pkh || !pkh || keyPair.pkh !== pkh) {
        return null;
      } else {
        return keyPair;
      }
    } else {
      return this.operationService.seed2keyPair(seed);
    }
  }
  async revealMnemonicPhrase(pwd: string): Promise<string> {
    if (this.wallet && (this.wallet instanceof HdWallet || this.wallet instanceof LegacyWalletV3)) {
      const iv = this.encryptionService.shiftIV(this.wallet.IV, 1);
      const entropy = await this.encryptionService.decrypt(this.wallet.encryptedEntropy, pwd, iv, 3);
      if (entropy) {
        return utils.entropyToMnemonic(entropy);
      } else {
        console.log('Invalid password');
      }
    }
    return '';
  }
  addImplicitAccount(pk: string, derivationPath?: string | number) {
    let pkh;
    console.log(pk);
    if (pk && pk.slice(0, 4) === 'sppk') {
      pkh = this.operationService.pk2pkh(pk);
    } else {
      pkh = utils.pkToPkh(pk);
    }
    if (pkh) {
      this.wallet.implicitAccounts.push(new ImplicitAccount(pkh, pk, typeof derivationPath === 'number' ? `44'/1729'/${derivationPath}'/0'` : derivationPath));
      console.log('Adding new implicit account...');
      console.log(this.wallet.implicitAccounts[this.wallet.implicitAccounts.length - 1]);
      this.storeWallet();
    }
  }
  addOriginatedAccount(kt: string, manager: string) {
    const implicitAccount = this.wallet.getImplicitAccount(manager);
    if (implicitAccount) {
      const origAcc = new OriginatedAccount(kt, implicitAccount.pkh, implicitAccount.pk);
      implicitAccount.originatedAccounts.push(origAcc);
      this.storeWallet();
    } else {
      console.warn(`Manager address $(manager) not found`);
    }
  }
  /*addUnusedAccount(account: any) {
    if (this.wallet instanceof HdWallet) {
      this.wallet.unusedAccounts.push(account);
    }
  }*/
  addressExists(address: string): boolean {
    return this.wallet?.getAccounts().findIndex((a) => a.address === address) !== -1;
  }
  async incrementAccountIndex(password: string): Promise<string> {
    if (this.wallet instanceof HdWallet) {
      const seed = await this.encryptionService.decrypt(this.wallet.encryptedSeed, password, this.wallet.IV, 3);
      if (seed) {
        const keyPair: KeyPair = hd.seedToKeyPair(seed, `44'/1729'/${this.wallet.index}'/0'`);
        this.addImplicitAccount(keyPair.pk, this.wallet.index);
        this.wallet.index++;
        this.storeWallet();
        return keyPair.pkh;
      } else {
        return ''; // Wrong pwd
      }
    }
  }
  /*
    Clear wallet data from browser
  */
  clearWallet(instanceId: string = '') {
    if (this.wallet instanceof TorusWallet) {
      this.wallet.removeSk();
    }
    this.wallet = null;
    this.storageId = 0;
    if (instanceId) {
      sessionStorage.removeItem(instanceId);
    } else {
      localStorage.removeItem(this.storeKey);
    }
  }
  /*
  Used to decide wallet type
  */
  isFullWallet(): boolean {
    return this.wallet instanceof FullWallet;
  }
  isViewOnlyWallet(): boolean {
    return false;
  }
  isObserverWallet(): boolean {
    return false;
  }
  isLedgerWallet(): boolean {
    return this.wallet instanceof LedgerWallet;
  }
  isHdWallet(): boolean {
    return this.wallet instanceof HdWallet;
  }
  isTorusWallet(): boolean {
    return this.wallet instanceof TorusWallet;
  }
  isEmbeddedTorusWallet(): boolean {
    return this.wallet instanceof EmbeddedTorusWallet;
  }
  isWatchWallet(): boolean {
    return this.wallet instanceof WatchWallet;
  }
  isPwdWallet(): boolean {
    return !this.isTorusWallet() && !this.isLedgerWallet() && !this.isWatchWallet();
  }
  exportKeyStoreInit(walletType: WalletType, encryptedSeed: string, encryptedEntropy: string, iv: string) {
    const data: any = {
      provider: 'Kukai',
      version: 3.0,
      walletType,
      encryptedSeed,
      encryptedEntropy,
      iv
    };
    return data;
  }
  /*
    Read and write to localStorage
  */
  initStorage(instanceId: string = '') {
    this.storageId = Date.now();
    if (instanceId) {
      sessionStorage.setItem(instanceId, JSON.stringify({ localStorageId: this.storageId }));
    } else {
      localStorage.setItem(this.storeKey, JSON.stringify({ localStorageId: this.storageId }));
    }
  }
  storeWallet() {
    const localStorageId = this.getLocalStorageId();
    if (this.storageId && localStorageId && this.storageId === localStorageId) {
      let type = 'unknown';
      if (this.wallet instanceof HdWallet) {
        type = 'HdWallet';
      } else if (this.wallet instanceof LegacyWalletV1) {
        type = 'LegacyWalletV1';
      } else if (this.wallet instanceof LegacyWalletV2) {
        type = 'LegacyWalletV2';
      } else if (this.wallet instanceof LegacyWalletV3) {
        type = 'LegacyWalletV3';
      } else if (this.wallet instanceof LedgerWallet) {
        type = 'LedgerWallet';
      } else if (this.wallet instanceof EmbeddedTorusWallet) {
        type = 'EmbeddedTorusWallet';
      } else if (this.wallet instanceof TorusWallet) {
        type = 'TorusWallet';
      } else if (this.wallet instanceof WatchWallet) {
        type = 'WatchWallet';
      }
      this.getStorage().setItem(
        this.wallet instanceof EmbeddedTorusWallet ? this.wallet.instanceId : this.storeKey,
        JSON.stringify({
          type,
          localStorageId: this.storageId,
          data: this.wallet
        })
      );
    } else {
      console.log('Outdated storage id');
    }
    this.subjectService.walletUpdated.next(null);
  }
  getLocalStorageId() {
    const walletData = this.wallet instanceof EmbeddedTorusWallet ? sessionStorage.getItem(this.wallet.instanceId) : localStorage.getItem(this.storeKey);
    if (walletData) {
      const parsed = JSON.parse(walletData);
      if (parsed && parsed.localStorageId) {
        return parsed.localStorageId;
      }
    }
    return 0;
  }

  loadStoredWallet(instanceId = '') {
    const walletData = instanceId ? sessionStorage.getItem(instanceId) : localStorage.getItem(this.storeKey);
    if (walletData && walletData !== 'undefined') {
      const parsedWalletData = JSON.parse(walletData);
      console.debug(parsedWalletData);
      if (parsedWalletData.type && parsedWalletData.data && parsedWalletData.localStorageId) {
        this.storageId = parsedWalletData.localStorageId;
        const wd = parsedWalletData.data;
        this.deserializeStoredWallet(wd, parsedWalletData.type);
      } else {
        console.log('couldnt load a wallet');
        this.clearWallet(instanceId);
      }
    } else {
      console.log('couldnt load a wallet');
      this.clearWallet(instanceId);
    }
  }
  deserializeStoredWallet(wd: any, type: string) {
    switch (type) {
      case 'HdWallet':
        this.wallet = new HdWallet(wd.IV, wd.encryptedSeed, wd.encryptedEntropy);
        if (this.wallet instanceof HdWallet) {
          this.wallet.index = wd.index;
        }
        break;
      case 'LegacyWalletV1':
        this.wallet = new LegacyWalletV1(wd.salt, wd.encryptedSeed);
        break;
      case 'LegacyWalletV2':
        this.wallet = new LegacyWalletV2(wd.IV, wd.encryptedSeed);
        break;
      case 'LegacyWalletV3':
        this.wallet = new LegacyWalletV3(wd.IV, wd.encryptedSeed, wd.encryptedEntropy);
        break;
      case 'LedgerWallet':
        this.wallet = new LedgerWallet();
        break;
      case 'TorusWallet':
        this.wallet = new TorusWallet(wd.verifier, wd.id, wd.name);
        this.torusService.initTorus();
        break;
      case 'EmbeddedTorusWallet':
        this.wallet = new EmbeddedTorusWallet(wd.verifier, wd.id, wd.name, wd.origin, wd.sk, wd.instanceId);
        this.torusService.initTorus();
        break;
      case 'WatchWallet':
        this.wallet = new WatchWallet();
      default:
    }
    this.wallet.XTZrate = wd.XTZrate;
    this.wallet.totalBalanceUSD = wd.totalBalanceUSD;
    this.wallet.totalBalanceXTZ = wd.totalBalanceXTZ;
    if (wd.lookups) {
      this.wallet.lookups = wd.lookups;
    }
    for (const implicit of wd.implicitAccounts) {
      const impAcc: ImplicitAccount = new ImplicitAccount(implicit.pkh, implicit.pk, implicit.derivationPath ? implicit.derivationPath : null);
      impAcc.balanceUSD = implicit.balanceUSD;
      impAcc.balanceXTZ = implicit.balanceXTZ;
      impAcc.delegate = implicit.delegate;
      impAcc.state = implicit.state;
      impAcc.activities = implicit.activities;
      if (implicit.tokens) {
        impAcc.tokens = implicit.tokens;
      }
      for (const originated of implicit.originatedAccounts) {
        const origAcc = new OriginatedAccount(originated.address, impAcc.pkh, impAcc.pk);
        origAcc.balanceUSD = originated.balanceUSD;
        origAcc.balanceXTZ = originated.balanceXTZ;
        origAcc.delegate = originated.delegate;
        origAcc.state = originated.state;
        origAcc.activities = originated.activities;
        impAcc.originatedAccounts.push(origAcc);
      }
      this.wallet.implicitAccounts.push(impAcc);
    }
  }
  private getStorage() {
    return this.isEmbeddedTorusWallet() ? sessionStorage : localStorage;
  }
}
