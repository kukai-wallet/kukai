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
  async importWalletData(json: string, isJson: boolean = true): Promise<boolean> {
    try {
      let walletData;
      if (isJson) {
        walletData = JSON.parse(json);
      } else {
        walletData = json;
      }
      if (walletData.provider !== 'Kukai') {
        throw new Error(`Unsupported wallet format`);
      }
      this.walletService.wallet = this.walletService.emptyWallet(walletData.walletType);
      this.walletService.addAccount(walletData.pkh);
      if (walletData.encryptedSeed) {
        this.walletService.wallet.seed = walletData.encryptedSeed;
      } else if (walletData.pk) {
        this.walletService.wallet.seed = walletData.pk;
      }
      await this.findAllAccounts(walletData.pkh);
      return true;
    } catch (err) {
      this.messageService.addError('ImportWalletDataError: ' + err);
      this.walletService.clearWallet();
      return false;
    }
  }
  importWalletFromPk(pk: string) {
    try {
      const pkh = this.operationService.pk2pkh(pk);
      this.importWalletFromPkh(pkh, WalletType.ViewOnlyWallet);
      this.walletService.wallet.seed = pk;
    } catch (err) {
      this.walletService.clearWallet();
      throw (err);
    }
  }
  importWalletFromPkh(pkh: string, type: WalletType = WalletType.ObserverWallet) {
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
    this.findNumberOfAccounts(pkh);
  }
  async findNumberOfAccounts(pkh: string) {
    if (pkh) {
      console.log('Find accounts...');
      console.log('pkh: ' + pkh);
      this.tzscanService.numberOperationsOrigination(pkh).subscribe(
        data => {
          if (data[0]) {
            this.findAccounts(pkh, data[0]);
          }
        },
        err => console.log('ImportError: ' + JSON.stringify(err))
      );
    }
  }
  async findAccounts(pkh: string, n: number) {
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
            this.operationService.getVerifiedOpBytes(opLevel, data[i].hash, pkh).subscribe(
              opBytes => {
                if (KT === this.operationService.createKTaddress(opBytes)) {
                  console.log('Added: ' + KT);
                  this.walletService.addAccount(KT);
                  this.coordinatorService.start(KT);
                  this.findNumberOfAccounts(KT); // Recursive call
                } else {
                  this.messageService.addError('Failed to verify KT address!');
                }
              },
              err => this.messageService.addWarning('Something went wrong when searching after additional addresses! ' + err)
            );
          }
        }
        this.walletService.storeWallet();
      },
      err => this.messageService.addError('ImportError(3)' + JSON.stringify(err))
    );
  }
}
