import { Injectable } from '@angular/core';
import { KeyPair, WalletType } from './../../interfaces';
import { WalletService } from '../wallet/wallet.service';
import { CoordinatorService } from '../coordinator/coordinator.service';
import { LegacyWalletV1, LegacyWalletV2, LegacyWalletV3, HdWallet, LedgerWallet, TorusWallet, EmbeddedTorusWallet, WatchWallet } from '../wallet/wallet';
import { hd, utils } from '../../libraries/index';
import { EncryptionService } from '../encryption/encryption.service';
import { TorusService } from '../torus/torus.service';
import { IndexerService } from '../indexer/indexer.service';
import { OperationService } from '../operation/operation.service';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class ImportService {
  constructor(
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private indexerService: IndexerService,
    private encryptionService: EncryptionService,
    private torusService: TorusService,
    private operationService: OperationService,
    private subjectService: SubjectService
  ) {}
  pwdRequired(json: string) {
    const walletData = JSON.parse(json);
    if (walletData.provider !== 'Kukai') {
      throw new Error(`Unsupported wallet format`);
    }
    if (walletData.walletType === WalletType.LegacyWallet || walletData.walletType === WalletType.HdWallet) {
      return true;
    } else {
      return false;
    }
  }
  async importWalletFromJson(json: any, pwd: string): Promise<boolean> {
    // From file
    let seed;
    let walletData;
    try {
      walletData = JSON.parse(json);
      if (walletData.walletType === WalletType.HdWallet && walletData.version === 3) {
        //hd
        seed = await this.encryptionService.decrypt(walletData.encryptedSeed, pwd, walletData.iv, 3);
      } else if (walletData.walletType === WalletType.LegacyWallet) {
        if (walletData.version === 1) {
          console.log('v1');
          seed = await this.encryptionService.decrypt(walletData.encryptedSeed, pwd, walletData.pkh.slice(3, 19), 1);
          if (utils.seedToKeyPair(seed).pkh !== walletData.pkh) {
            seed = '';
          }
        } else if (walletData.version === 2 || walletData.version === 3) {
          seed = await this.encryptionService.decrypt(walletData.encryptedSeed, pwd, walletData.iv, walletData.version);
        }
      }
    } catch (e) {
      console.error(e);
      throw new Error('Failed to decrypt keystore file');
    }
    if (seed) {
      return this.importWalletFromObject(walletData, seed).then(
        (ans) => {
          return ans;
        },
        (e) => {
          console.error(e);
          throw new Error('Failed to fetch account(s). Please check your connection.');
        }
      );
    } else {
      throw new Error('Wrong password');
    }
  }
  async importWalletFromObject(data: any, seed: any): Promise<boolean> {
    try {
      this.coordinatorService.stopAll();
      if (data.walletType === WalletType.HdWallet && data.version === 3) {
        // HD
        this.walletService.wallet = new HdWallet(data.iv, data.encryptedSeed, data.encryptedEntropy);
      } else if (data.walletType === WalletType.LegacyWallet) {
        if (data.version === 3) {
          this.walletService.wallet = new LegacyWalletV3(data.iv, data.encryptedSeed, data.encryptedEntropy);
        } else if (data.version === 2) {
          this.walletService.wallet = new LegacyWalletV2(data.iv, data.encryptedSeed);
        } else if (data.version === 1) {
          this.walletService.wallet = new LegacyWalletV1(data.pkh.slice(3, 19), data.encryptedSeed);
        } else {
          throw new Error('Unsupported wallet file');
        }
      } else {
        throw new Error('Unsupported wallet file');
      }
      let keys: KeyPair;
      if (seed.length === 32) {
        keys = utils.seedToKeyPair(seed);
      } else if (seed.length === 64) {
        keys = hd.keyPairFromAccountIndex(seed, 0);
      } else {
        throw new Error('Invalid seed length');
      }
      this.walletService.initStorage();
      if (this.walletService.wallet instanceof HdWallet) {
        let index = 0;
        let isUsedAccount: boolean = true;
        while (isUsedAccount) {
          keys = hd.keyPairFromAccountIndex(seed, index);
          isUsedAccount = await this.indexerService.isUsedAccount(keys.pkh);
          if (isUsedAccount || index === 0) {
            this.walletService.addImplicitAccount(keys.pk, index++);
            await this.findContracts(keys.pkh);
          }
        }
        this.walletService.wallet.index = index;
      } else {
        this.walletService.addImplicitAccount(keys.pk);
        await this.findContracts(keys.pkh);
      }
    } catch (e) {
      this.walletService.clearWallet();
      throw e;
    }
    this.subjectService.login.next(true);
    return true;
  }

  async importWalletFromPk(pk: string, derivationPath: string, verifierDetails: any = null, sk: string = '', instanceId: string = ''): Promise<boolean> {
    this.coordinatorService.stopAll();
    if (derivationPath) {
      return this.ledgerImport(pk, derivationPath);
    } else if (verifierDetails) {
      return this.torusImport(pk, verifierDetails, sk, instanceId);
    }
  }
  async watch(pkh: string) {
    if (this.operationService.validAddress(pkh)) {
      const pk = await this.operationService.getManager(pkh).toPromise();
      if (pk) {
        this.walletService.initStorage();
        this.walletService.wallet = new WatchWallet();
        this.walletService.addImplicitAccount(pk);
        this.findContracts(this.walletService.wallet.implicitAccounts[0].pkh);
      } else {
        console.error('Public key not found');
      }
    }
  }
  async ledgerImport(pk: string, derivationPath: string) {
    try {
      this.walletService.initStorage();
      this.walletService.wallet = new LedgerWallet();
      this.walletService.addImplicitAccount(pk, derivationPath);
      await this.findContracts(this.walletService.wallet.implicitAccounts[0].pkh);
      this.subjectService.login.next(true);
      return true;
    } catch (err) {
      console.warn(err);
      this.walletService.clearWallet();
      return false;
    }
  }
  async torusImport(pk: string, verifierDetails: any, sk: string = '', instanceId: string = '') {
    try {
      if (verifierDetails.embedded) {
        this.walletService.initStorage(instanceId);
        this.walletService.wallet = new EmbeddedTorusWallet(
          verifierDetails.verifier,
          verifierDetails.id,
          verifierDetails.name,
          verifierDetails.origin,
          sk,
          instanceId
        );
      } else {
        this.walletService.initStorage();
        const torusWallet = new TorusWallet(verifierDetails.verifier, verifierDetails.id, verifierDetails.name);
        torusWallet.storeSk(sk);
        this.walletService.wallet = torusWallet;
      }
      if (verifierDetails.verifier === 'twitter') {
        this.updateTwitterName(verifierDetails.id);
      }
      if (pk || !verifierDetails?.embedded) {
        this.walletService.addImplicitAccount(pk);
      } else {
        this.walletService.storeWallet();
      }
      this.subjectService.login.next();
      return true;
    } catch (err) {
      console.warn(err);
      this.walletService.clearWallet(instanceId);
      return false;
    }
  }
  async updateTwitterName(verifierId: string) {
    const twitterId = verifierId.split('|')[1];
    const { username } = await this.torusService.twitterLookup(undefined, twitterId);
    if (username && this.walletService.wallet instanceof TorusWallet) {
      this.walletService.wallet.name = '@' + username;
    }
  }
  async findContracts(pkh: string) {
    const addresses = await this.indexerService.getContractAddresses(pkh);
    for (const KT of addresses) {
      console.log('Found KT: ' + KT);
      this.walletService.addOriginatedAccount(KT, pkh);
    }
    this.walletService.storeWallet();
  }
}
