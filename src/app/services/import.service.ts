import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as bip39 from 'bip39';

import { WalletType } from './../interfaces';

import { WalletService } from './wallet.service';
import { MessageService } from './message.service';
import { BalanceService } from './balance.service';
import { CoordinatorService } from './coordinator.service';
import { OperationService } from './operation.service';
import { TzscanService } from './tzscan.service';

@Injectable()
export class ImportService {
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private balanceService: BalanceService,
    private coordinatorService: CoordinatorService,
    private operationService: OperationService,
    private tzscanService: TzscanService
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
      await this.findAllAccounts(this.walletService.wallet.accounts[0].pkh);
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
    this.findAllAccounts(pkh);
  }
  async findAllAccounts(pkh: string) {
    // Test start
    console.log('searching after KT...');
    this.operationService.getManagerKey(pkh).subscribe(
      ((pk: string) => {
        console.log('PK: ' + pk);
        if (pk) {
          this.findNumberOfAccounts(pkh, pk);
        } else {
          this.tzscanService.getManagerKey(pkh).subscribe(
            ((pk2: string) => {
              console.log('PK: ' + pk2);
              if (pk2) {
                this.findNumberOfAccounts(pkh, pk2);
              }
            }),
            err => console.log('No PK found!')
          );
        }
      })
    );
  }
  async findNumberOfAccounts(pkh: string, pk: string) {
    if (pkh) {
      console.log('Find accounts...');
      console.log('pkh: ' + pkh);
      this.tzscanService.numberOperationsOrigination(pkh).subscribe(
        data => {
          if (data[0]) {
            this.findAccounts(pkh, pk, data[0]);
          }
        },
        err => console.log('ImportError: ' + JSON.stringify(err))
      );
    }
  }
  async findAccounts(pkh: string, pk: string, n: number) {
    console.log('Accounts found: ' + n);
    this.coordinatorService.start(pkh);
    this.coordinatorService.startXTZ();
    this.tzscanService.operationsOrigination(pkh, n).subscribe(
      data => {
        for (let i = 0; i < n; i++) {
          let index = 0;
          if (data[i].type.operations[0].kind === 'reveal') {
            index = 1;
          }
          const KT = data[i].type.operations[index].tz1.tz;
          if (this.walletService.wallet.accounts.findIndex(a => a.pkh === KT) === -1) {
            const opIndex = data[i].type.operations.findIndex(a => a.kind === 'origination');
            const opLevel = data[i].type.operations[opIndex].op_level;
            const storedProof = localStorage.getItem(KT);
            if (storedProof && storedProof !== 'undefined' && KT === this.operationService.createKTaddress(storedProof)) {
              console.log('Stored proof found');
              this.walletService.addAccount(KT);
              this.coordinatorService.start(KT);
              this.findNumberOfAccounts(KT, pk); // Recursive call
            } else {
              this.operationService.getVerifiedOpBytes(opLevel, data[i].hash, pkh, pk).subscribe(
                opBytes => {
                  if (KT === this.operationService.createKTaddress(opBytes)) {
                    console.log('Store proof');
                    localStorage.setItem(KT, opBytes);
                    this.walletService.addAccount(KT);
                    this.coordinatorService.start(KT);
                    this.findNumberOfAccounts(KT, pk); // Recursive call
                  } else {
                    this.messageService.addError('Failed to verify KT address!');
                  }
                },
                err => {
                  // tslint:disable-next-line:max-line-length
                  this.messageService.addWarning('Something went wrong when searching after additional addresses. Try to reimport your keystore file.');
                  throw new Error(err);
                }
              );
            }
          }
        }
        this.walletService.storeWallet();
      },
      err => this.messageService.addError('ImportError(3)' + JSON.stringify(err))
    );
  }
}
