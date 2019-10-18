import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as bip39 from 'bip39';

import { WalletType } from './../interfaces';

import { WalletService } from './wallet.service';
import { MessageService } from './message.service';
import { BalanceService } from './balance.service';
import { CoordinatorService } from './coordinator.service';
import { OperationService } from './operation.service';
import { TzscanService } from './tzscan.service';
import { ConseilService } from './conseil.service';

@Injectable()
export class ImportService {
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private balanceService: BalanceService,
    private coordinatorService: CoordinatorService,
    private operationService: OperationService,
    private tzscanService: TzscanService,
    private conseilService: ConseilService
  ) { }
  pwdRequired(json: string) {
    const walletData = JSON.parse(json);
    if (walletData.provider !== 'Kukai') {
      throw new Error(`Unsupported wallet format`);
    }
    if (walletData.walletType === 0) {
      return true;
    } else {
      return false;
    }
  }
  async importWalletData(data: any, isJson: boolean = true, pkh: string = '', pwd: string = ''): Promise<boolean> {
    this.coordinatorService.stopAll();
    try {
      let walletData;
      if (isJson) {
        walletData = JSON.parse(data);
      } else {
        walletData = data;
      }
      if (walletData.provider !== 'Kukai') {
        throw new Error(`Unsupported wallet format`);
      }
      // Create empty wallet & set wallet type
      this.walletService.wallet = this.walletService.emptyWallet(walletData.walletType);
      // Set version
      this.walletService.wallet.encryptionVersion = walletData.version;
      // Set pkh
      if (walletData.walletType === 0) { // Full
        // Set seed
        this.walletService.wallet.seed = walletData.encryptedSeed;
        // Set salt
        if (walletData.version === 1) {
          this.walletService.wallet.salt = this.walletService.getSalt(walletData.pkh);
        } else if (walletData.version === 2) {
          this.walletService.wallet.salt = walletData.iv;
        }
        if (pkh) {
          this.walletService.addAccount(pkh);
        } else {
          if (walletData.version === 1) {
            this.walletService.addAccount(walletData.pkh);
          }
          const keys = this.walletService.getKeys(pwd);
          if (!keys) {
            throw new Error('Wrong password!');
          }
          console.log('Correct pwd!');
          if (walletData.version === 2) {
            this.walletService.addAccount(keys.pkh);
          }
        }
      } else if (walletData.walletType === 1 || walletData.walletType === 3) { // View or Ledger
        this.walletService.wallet.seed = walletData.pk; // set pk
        if (walletData.walletType === 3) {
          this.walletService.wallet.derivationPath = walletData.derivationPath;
        }
        this.walletService.addAccount(this.operationService.pk2pkh(walletData.pk));
      } else if (walletData.walletType === 2) {
        this.walletService.addAccount(walletData.pkh);
      }
      await this.findContracts(this.walletService.wallet.accounts[0].pkh);
      return true;
    } catch (err) {
      this.walletService.clearWallet();
      console.log(err);
      this.messageService.addError(err);
      return false;
    }
  }
  importWalletFromPk(pk: string, ledger: string = null) {
    this.coordinatorService.stopAll();
    try {
      const pkh = this.operationService.pk2pkh(pk);
      if (ledger) {
        this.importWalletFromPkh(pkh, WalletType.LedgerWallet);
        this.walletService.wallet.derivationPath = ledger;
      } else {
        this.importWalletFromPkh(pkh, WalletType.ViewOnlyWallet);
      }
      this.walletService.wallet.seed = pk;
      this.walletService.wallet.encryptionVersion = 2.0;
    } catch (err) {
      this.walletService.clearWallet();
      throw (err);
    }
  }
  importWalletFromPkh(pkh: string, type: WalletType = WalletType.ObserverWallet) {
    this.coordinatorService.stopAll();
    try {
      this.walletService.wallet = this.walletService.emptyWallet(type);
      this.walletService.addAccount(pkh);
    } catch (err) {
      this.messageService.addError('Failed to load wallet!');
      this.walletService.clearWallet();
      throw (err);
    }
    this.findContracts(pkh);
  }
  async findContracts(address: string) {
    const addresses = await this.conseilService.getContractAddresses(address);
    for (const KT of addresses) {
      console.log('Found KT: ' + KT);
      this.walletService.addAccount(KT);
      await this.findContracts(KT);
    }
    if (address.length > 0) {
      this.walletService.storeWallet();
    }
  }
}
