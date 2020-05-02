import { Injectable } from "@angular/core";
import { WalletType } from "./../../interfaces";
import { WalletService } from "../wallet/wallet.service";
import { MessageService } from "../message/message.service";
import { CoordinatorService } from "../coordinator/coordinator.service";
import { OperationService } from "../operation/operation.service";
import { ConseilService } from "../conseil/conseil.service";
import { LegacyWalletV2 } from "../wallet/wallet";

@Injectable()
export class ImportService {
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private coordinatorService: CoordinatorService,
    private operationService: OperationService,
    private conseilService: ConseilService
  ) {}
  pwdRequired(json: string) {
    const walletData = JSON.parse(json);
    if (walletData.provider !== "Kukai") {
      throw new Error(`Unsupported wallet format`);
    }
    if (walletData.walletType === 0) {
      return true;
    } else {
      return false;
    }
  }

  async importWalletData(
    data: any,
    isJson: boolean = true,
    pk: string,
    pwd: string = ""
  ): Promise<boolean> {
    this.coordinatorService.stopAll();
    try {
      let walletData;
      if (isJson) {
        walletData = JSON.parse(data);
      } else {
        walletData = data;
      }
      this.walletService.wallet = new LegacyWalletV2(
        walletData.iv,
        walletData.encryptedSeed
      );
      console.log(JSON.stringify(this.walletService.wallet));
      const keys = this.walletService.getKeys(pwd);
      if (!keys) {
        throw new Error("Wrong password!");
      }
      console.log("Correct pwd!");
      this.walletService.addImplicitAccount(keys.pk);
      await this.findContracts(keys.pkh);
      return true;
    } catch (err) {
      this.walletService.clearWallet();
      console.log(err);
    }
    return false;
  }

  // async importWalletData(data: any, isJson: boolean = true, pk: string, pwd: string = ''): Promise<boolean> {
  //   this.coordinatorService.stopAll();
  //   try {
  //     let walletData;
  //     if (isJson) {
  //       walletData = JSON.parse(data);
  //     } else {
  //       walletData = data;
  //     }
  //     if (walletData.provider !== 'Kukai') {
  //       throw new Error(`Unsupported wallet format`);
  //     }
  //     // Create empty wallet & set wallet type
  //     this.walletService.wallet = this.walletService.emptyWallet(walletData.walletType);
  //     // Set version
  //     this.walletService.wallet.encryptionVersion = walletData.version;
  //     // Set pkh
  //     if (walletData.walletType === 0) { // Full
  //       // Set seed
  //       this.walletService.wallet.seed = walletData.encryptedSeed;
  //       // Set salt
  //       if (walletData.version === 1) {
  //         this.walletService.wallet.salt = this.walletService.getSalt(walletData.pkh);
  //       } else if (walletData.version === 2) {
  //         //this.walletService.wallet2 = new LegacyWalletV2(walletData.iv, walletData.encryptedSeed);
  //         this.walletService.wallet.salt = walletData.iv;
  //         //console.log(JSON.stringify(this.walletService.wallet2));
  //       }
  //       if (pk) {
  //         const pkh = this.operationService.pk2pkh(pk);
  //         this.walletService.addAccount(pkh);
  //         this.walletService.wallet.pk = pk;
  //       } else {
  //         if (walletData.version === 1) {
  //           this.walletService.addAccount(walletData.pkh);
  //         }
  //         const keys = this.walletService.getKeys(pwd);
  //         if (!keys) {
  //           throw new Error('Wrong password!');
  //         }
  //         console.log('Correct pwd!');
  //         if (walletData.version === 2) {
  //           this.walletService.addAccount(keys.pkh);
  //         }
  //         console.log(keys.pk);
  //         this.walletService.wallet.pk = keys.pk;
  //         console.log(this.walletService.wallet.pk);
  //       }
  //     } else if (walletData.walletType === 1 || walletData.walletType === 3) { // View or Ledger
  //       this.walletService.wallet.seed = walletData.pk; // set pk
  //       if (walletData.walletType === 3) {
  //         this.walletService.wallet.derivationPath = walletData.derivationPath;
  //       }
  //       this.walletService.addAccount(this.operationService.pk2pkh(walletData.pk));
  //     } else if (walletData.walletType === 2) {
  //       this.walletService.addAccount(walletData.pkh);
  //     }
  //     await this.findContracts(this.walletService.wallet.accounts[0].pkh);
  //     return true;
  //   } catch (err) {
  //     this.walletService.clearWallet();
  //     console.log(err);
  //     this.messageService.addError(err);
  //     return false;
  //   }
  // }
  importWalletFromPk(pk: string, ledger: string = null) {
    // this.coordinatorService.stopAll();
    // try {
    //   const pkh = this.operationService.pk2pkh(pk);
    //   if (ledger) {
    //     this.importWalletFromPkh(pkh, WalletType.LedgerWallet);
    //     this.walletService.wallet.derivationPath = ledger;
    //   } else {
    //     this.importWalletFromPkh(pkh, WalletType.ViewOnlyWallet);
    //   }
    //   this.walletService.wallet.seed = pk;
    //   this.walletService.wallet.encryptionVersion = 2.0;
    // } catch (err) {
    //   this.walletService.clearWallet();
    //   throw (err);
    // }
  }
  importWalletFromPkh(
    pkh: string,
    type: WalletType = WalletType.ObserverWallet
  ) {
    // this.coordinatorService.stopAll();
    // try {
    //   this.walletService.wallet = this.walletService.emptyWallet(type);
    //   this.walletService.addAccount(pkh);
    // } catch (err) {
    //   this.messageService.addError('Failed to load wallet!');
    //   this.walletService.clearWallet();
    //   throw (err);
    // }
    // this.findContracts(pkh);
  }
  async findContracts(pkh: string) {
      const addresses = await this.conseilService.getContractAddresses(pkh);
      for (const KT of addresses) {
        console.log('Found KT: ' + KT);
        this.walletService.addOriginatedAccount(KT, pkh);
      }
      this.walletService.storeWallet();
  }
}
