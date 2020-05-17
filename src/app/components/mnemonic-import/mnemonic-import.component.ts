import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from '../../constants';
import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { ImportService } from '../../services/import/import.service';
import { MessageService } from '../../services/message/message.service';
import { OperationService } from '../../services/operation/operation.service';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { ExportService } from '../../services/export/export.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { utils, hd } from '@tezos-core-tools/crypto-utils';

@Component({
  selector: 'app-mnemonic-import-wallet',
  templateUrl: './mnemonic-import.component.html',
  styleUrls: ['./mnemonic-import.component.scss']
})
export class MnemonicImportComponent implements OnInit {
  CONSTANTS = new Constants();
  MIN_PWD_LENGTH = 9;
  mnemonic: string;
  email: string;
  password: string;
  passphrase: string;
  pkh: string;
  activePanel = 0;
  tge = false;
  hdImport = true;
  wallet: any;
  pwd1: string;
  pwd2: string;
  pwdStrength = '';
  Downloaded = false;

  showWrongFileUploadMsg: false;

  constructor(
    private translate: TranslateService,
    private importService: ImportService,
    private router: Router,
    private messageService: MessageService,
    private operationService: OperationService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private exportService: ExportService,
    private inputValidationService: InputValidationService
  ) { }

  ngOnInit() {
  }

  retrieve() {
    if (this.tge) {
      this.passphrase = this.email + this.password;
    }
    if (!this.inputValidationService.mnemonics(this.mnemonic)) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDMNEMONIC').subscribe(
        (res: string) => this.messageService.addWarning(res, 10)
      );
    } else if (this.tge && !this.inputValidationService.email(this.email)) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDEMAIL').subscribe(
        (res: string) => this.messageService.addWarning(res, 10)  // 'Invalid email!'
      );
    } else if (this.tge && !this.password) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDPASSWORD').subscribe(
        (res: string) => this.messageService.addWarning(res, 10)  // 'Invalid password!'
      );
    } else if (!this.inputValidationService.passphrase(this.passphrase)) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDPASSPHRASE').subscribe(
        (res: string) => this.messageService.addWarning(res, 10)  // 'Invalid passphrase!'
      );
    } else if (this.pkh && !this.inputValidationService.address(this.pkh)) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDPKH').subscribe(
        (res: string) => this.messageService.addWarning(res, 10)  // 'Invalid public key hash!'
      );
    } else {
      let pkh = '';
      if (this.pkh) {
        if (!this.tge && this.hdImport) {
          pkh = hd.keyPairFromAccountIndex(utils.mnemonicToSeed(this.mnemonic, this.passphrase, true), 0).pkh;
        } else {
          pkh = utils.seedToKeyPair(utils.mnemonicToSeed(this.mnemonic, this.passphrase, false)).pkh;
        }
      }
      if (this.pkh && pkh !== this.pkh) {
        if (this.tge) {
          this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDEMAILPASSWORD').subscribe(
            (res: string) => this.messageService.addWarning(res, 5)
          );
        } else {
          this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDPASSPHRASE').subscribe(
            (res: string) => this.messageService.addWarning(res, 5)
          );
        }
      } else {
        this.activePanel++;
      }
    }
  }
  setPwd() {
    if (this.validPwd()) {
      const password = this.pwd1;
      this.pwd1 = '';
      this.pwd2 = '';
      this.wallet = this.walletService.createEncryptedWallet(this.mnemonic, password, this.passphrase, (!this.tge && this.hdImport));
      this.mnemonic = '';
      this.passphrase = '';
      this.email = '';
      this.password = '';
      this.activePanel++;
    }
  }

  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'json') {
      return true;
    } else {
      return false;
    }
  }
  validPwd(): boolean {
    if (!this.inputValidationService.password(this.pwd1)) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.PASSWORDWEAK').subscribe(
        (res: string) => this.messageService.addWarning(res, 10)  // 'Password is too weak!'
      );
      return false;
    } else if (this.pwd1 !== this.pwd2) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.NOMATCHPASSWORDS').subscribe(
        (res: string) => this.messageService.addWarning(res, 10)  // Passwords don't match!
      );
      return false;
    } else {
      return true;
    }
  }
  calcStrength() {
    this.pwdStrength = this.inputValidationService.passwordStrengthDisplay(this.pwd1);
  }
  export(): string {
    return JSON.stringify(this.wallet.data);
  }
  showPkh(): string {
    return this.wallet.pkh;
  }
  download() {
    this.exportService.downloadWallet(this.wallet.data);
    this.Downloaded = true;
  }
  async done() {
    await this.importService.importWalletFromObject(this.wallet.data, this.wallet.seed);
    this.wallet = null;
    this.router.navigate(['/overview']);
    this.translate.get('MNEMONICIMPORTCOMPONENT.WALLETREADY').subscribe(
      (res: string) => this.messageService.addSuccess(res)
    );
  }
  tabChanged() {
      this.tge = !this.tge;
  }
}
