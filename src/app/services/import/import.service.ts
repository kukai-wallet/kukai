import { Injectable } from '@angular/core';
import { WalletType, KeyPair } from './../../interfaces';
import { WalletService } from '../wallet/wallet.service';
import { CoordinatorService } from '../coordinator/coordinator.service';
import { ConseilService } from '../conseil/conseil.service';
import {
  LegacyWalletV1,
  LegacyWalletV2,
  LegacyWalletV3,
  HdWallet,
  LedgerWallet,
} from '../wallet/wallet';
import { hd, utils } from '@tezos-core-tools/crypto-utils';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class ImportService {
  constructor(
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private conseilService: ConseilService,
    private encryptionService: EncryptionService
  ) {}
  pwdRequired(json: string) {
    const walletData = JSON.parse(json);
    if (walletData.provider !== 'Kukai') {
      throw new Error(`Unsupported wallet format`);
    }
    if (walletData.walletType === 0 || walletData.walletType === 4) {
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
      if (walletData.walletType === 4 && walletData.version === 3) {
        //hd
        seed = await this.encryptionService.decrypt(
          walletData.encryptedSeed,
          pwd,
          walletData.iv,
          3
        );
      } else if (walletData.walletType === 0) {
        if (walletData.version === 1) {
          console.log('v1');
          seed = await this.encryptionService.decrypt(
            walletData.encryptedSeed,
            pwd,
            walletData.pkh.slice(3, 19),
            1
          );
          console.log('done');
          if (utils.seedToKeyPair(seed).pkh !== walletData.pkh) {
            seed = '';
          }
        } else if (walletData.version === 2 || walletData.version === 3) {
          seed = await this.encryptionService.decrypt(
            walletData.encryptedSeed,
            pwd,
            walletData.iv,
            walletData.version
          );
        }
      }
    } catch (e) {
      console.log(e);
      return false;
    }
    if (seed) {
      return this.importWalletFromObject(walletData, seed).then(
        (ans) => {
          return ans;
        },
        (e) => {
          return false;
        }
      );
    } else {
      return false;
    }
  }
  async importWalletFromObject(data: any, seed: any): Promise<boolean> {
    this.coordinatorService.stopAll();
    if (data.walletType === 4 && data.version === 3) {
      // HD
      this.walletService.wallet = new HdWallet(
        data.iv,
        data.encryptedSeed,
        data.encryptedEntropy
      );
    } else if (data.walletType === 0) {
      if (data.version === 3) {
        this.walletService.wallet = new LegacyWalletV3(
          data.iv,
          data.encryptedSeed,
          data.encryptedEntropy
        );
      } else if (data.version === 2) {
        this.walletService.wallet = new LegacyWalletV2(
          data.iv,
          data.encryptedSeed
        );
      } else if (data.version === 1) {
        this.walletService.wallet = new LegacyWalletV1(
          data.pkh.slice(3, 19),
          data.encryptedSeed
        );
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
      let counter = 1;
      while (counter) {
        keys = hd.keyPairFromAccountIndex(seed, index);
        counter = await this.conseilService
          .accountInfo(keys.pkh)
          .toPromise();
        if (counter || index === 0) {
          this.walletService.addImplicitAccount(
            keys.pk,
            index++
          );
          await this.findContracts(keys.pkh);
        }
      }
      this.walletService.wallet.index = index;
    } else {
      this.walletService.addImplicitAccount(keys.pk);
      await this.findContracts(keys.pkh, true);
    }
    return true;
  }

  async importWalletFromPk(pk: string, derivationPath: string): Promise<boolean> {
    this.coordinatorService.stopAll();
    try {
      this.walletService.initStorage();
      this.walletService.wallet = new LedgerWallet();
      this.walletService.addImplicitAccount(pk, derivationPath);
      await this.findContracts(this.walletService.wallet.implicitAccounts[0].pkh);
      return true;
    } catch (err) {
      console.warn(err);
      this.walletService.clearWallet();
      return false;
    }
  }

  async findContracts(pkh: string, recursiveScan = false, address: string = pkh) {
    const addresses = await this.conseilService.getContractAddresses(address);
    for (const KT of addresses) {
      console.log('Found KT: ' + KT);
      this.walletService.addOriginatedAccount(KT, pkh);
    }
    this.walletService.storeWallet();
    if (recursiveScan && addresses.length) {
      for (const KT of addresses) {
        await this.findContracts(pkh, true, KT);
      }
    }
  }
}
