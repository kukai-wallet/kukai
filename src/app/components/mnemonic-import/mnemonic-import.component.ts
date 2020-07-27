import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from '../../constants';
import { TranslateService } from '@ngx-translate/core'; // Multiple instances created ?

import { ImportService } from '../../services/import/import.service';
import { MessageService } from '../../services/message/message.service';
import { WalletService } from '../../services/wallet/wallet.service';
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
  @HostBinding('class.tacos') showTacos = false;
  MIN_PWD_LENGTH = 9;
  mnemonic: string;
  email: string;
  password: string;
  passphrase: string;
  pkh: string;
  importOption = 0;
  activePanel = 0;
  hdImport = false;
  wallet: any;
  walletJson: string;
  pwd = '';
  pwd1: string;
  pwd2: string;
  pwdStrength = '';
  Downloaded = false;
  fileName = '';
  showWrongFileUploadMsg: false;

  constructor(
    private translate: TranslateService,
    private importService: ImportService,
    private router: Router,
    private messageService: MessageService,
    private walletService: WalletService,
    private exportService: ExportService,
    private inputValidationService: InputValidationService
  ) { }

  ngOnInit() {
  }

  retrieve() {
    if (this.mnemonic) {
      this.mnemonic = this.mnemonic.toLowerCase().replace(/(\r\n|\n|\r)/gm, ' ').trim();
    }
    if (this.importOption === 2) {
      this.passphrase = this.email + this.password;
    }
    if (!this.inputValidationService.mnemonics(this.mnemonic)) {
      this.translate
        .get('MNEMONICIMPORTCOMPONENT.INVALIDMNEMONIC')
        .subscribe((res: string) => this.messageService.addWarning(res, 10));
    } else if (
      this.importOption === 2 &&
      !this.inputValidationService.email(this.email)
    ) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDEMAIL').subscribe(
        (res: string) => this.messageService.addWarning(res, 10) // 'Invalid email!'
      );
    } else if (this.importOption === 2 && !this.password) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDPASSWORD').subscribe(
        (res: string) => this.messageService.addWarning(res, 10) // 'Invalid password!'
      );
    } else if (!this.inputValidationService.passphrase(this.passphrase)) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDPASSPHRASE').subscribe(
        (res: string) => this.messageService.addWarning(res, 10) // 'Invalid passphrase!'
      );
    } else if (this.pkh && !this.inputValidationService.address(this.pkh)) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDPKH').subscribe(
        (res: string) => this.messageService.addWarning(res, 10) // 'Invalid public key hash!'
      );
    } else {
      let pkh = '';
      if (this.pkh) {
        if (this.importOption === 1 && this.hdImport) {
          pkh = hd.keyPairFromAccountIndex(
            utils.mnemonicToSeed(this.mnemonic, this.passphrase, true),
            0
          ).pkh;
        } else {
          pkh = utils.seedToKeyPair(
            utils.mnemonicToSeed(this.mnemonic, this.passphrase, false)
          ).pkh;
        }
      }
      if (this.pkh && pkh !== this.pkh) {
        if (this.importOption === 2) {
          this.translate
            .get('MNEMONICIMPORTCOMPONENT.INVALIDEMAILPASSWORD')
            .subscribe((res: string) => this.messageService.addWarning(res, 5));
        } else {
          this.translate
            .get('MNEMONICIMPORTCOMPONENT.INVALIDPASSPHRASE')
            .subscribe((res: string) => this.messageService.addWarning(res, 5));
        }
      } else {
        this.activePanel++;
      }
    }
  }
  async setPwd() {
    if (this.validPwd()) {
      const password = this.pwd1;
      this.pwd1 = '';
      this.pwd2 = '';
      await this.messageService.startSpinner('Encrypting wallet...');
      try {
        this.wallet = await this.walletService.createEncryptedWallet(
          this.mnemonic,
          password,
          this.passphrase,
          this.importOption === 1 && this.hdImport
        );
      } finally {
        this.messageService.stopSpinner();
      }
      this.mnemonic = '';
      this.passphrase = '';
      this.email = '';
      this.password = '';
      this.activePanel++;
      if (document.body.offsetWidth >= 480) {
        this.showTacos = true;
      }
    }
  }

  validPwd(): boolean {
    if (!this.inputValidationService.password(this.pwd1)) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.PASSWORDWEAK').subscribe(
        (res: string) => this.messageService.addWarning(res, 10) // 'Password is too weak!'
      );
      return false;
    } else if (this.pwd1 !== this.pwd2) {
      this.translate.get('MNEMONICIMPORTCOMPONENT.NOMATCHPASSWORDS').subscribe(
        (res: string) => this.messageService.addWarning(res, 10) // Passwords don't match!
      );
      return false;
    } else {
      return true;
    }
  }
  calcStrength() {
    this.pwdStrength = this.inputValidationService.passwordStrengthDisplay(
      this.pwd1
    );
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
    await this.messageService.startSpinner('Loading wallet...');
    try {
      await this.importService.importWalletFromObject(
        this.wallet.data,
        this.wallet.seed
      );
    } finally {
      this.messageService.stopSpinner();
    }
    this.wallet = null;
    if (this.walletService.wallet.implicitAccounts.length === 1 && this.walletService.wallet.implicitAccounts[0].originatedAccounts.length === 0) {
      this.router.navigate([`/account/${this.walletService.wallet.implicitAccounts[0].address}`]);
    } else {
      this.router.navigate(['/accounts']);
    }
    this.translate
      .get('MNEMONICIMPORTCOMPONENT.WALLETREADY')
      .subscribe((res: string) => this.messageService.addSuccess(res));
  }
  /* Keystore handling */
  importPreCheck(keyFile: string) {
    this.typeCheckFile(keyFile);
    if (this.importService.pwdRequired(keyFile)) {
      this.walletJson = keyFile;
    } else {
      throw new Error('Unsupported wallet file');
    }
  }
  typeCheckFile(keyFile: string) {
    const obj = JSON.parse(keyFile);
    // Required
    try {
      if (typeof obj.provider !== 'string') {
        throw new Error('provider not a string!');
      }
      if (typeof obj.version !== 'number') {
        throw new Error('version not a number!');
      }
      if (typeof obj.walletType !== 'number') {
        throw new Error('walletType not a number!');
      }
      // Optional
      if (obj.encryptedSeed && typeof obj.encryptedSeed !== 'string') {
        throw new Error('encryptedSeed not a string!');
      }
      if (obj.pkh && typeof obj.pkh !== 'string') {
        throw new Error('pkh not a string!');
      }
      if (obj.iv && typeof obj.iv !== 'string') {
        throw new Error('iv not a string!');
      }
      if (obj.pk && typeof obj.pk !== 'string') {
        throw new Error('pk not a string!');
      }
      if (obj.encryptedEntropy && typeof obj.encryptedEntropy !== 'string') {
        throw new Error('encryptedEntropy not a string!');
      }
    } catch (e) {
      this.messageService.addError(e);
      throw e;
    }
  }
  async checkImportPwd() {
    if (this.pwd) {
      await this.messageService.startSpinner('Importing wallet...');
      try {
        await this.import(this.walletJson, this.pwd);
        this.pwd = '';
      } finally {
        this.messageService.stopSpinner();
      }
    } else {
      this.messageService.addWarning('No password provided', 5);
    }
  }
  async import(keyFile: string, pwd: string) {
    this.typeCheckFile(keyFile);
    await this.importService
      .importWalletFromJson(keyFile, pwd)
      .then((success: boolean) => {
        if (success) {
          if (this.walletService.wallet.implicitAccounts.length === 1 && this.walletService.wallet.implicitAccounts[0].originatedAccounts.length === 0) {
            this.router.navigate([`/account/${this.walletService.wallet.implicitAccounts[0].address}`]);
          } else {
            this.router.navigate(['/accounts']);
          }
        } else {
          console.log(success);
          this.messageService.addError('Wrong password');
        }
      });
  }
  handleFileInput(files: FileList) {
    let fileToUpload = files.item(0);
    if (!fileToUpload) {
      return false;
    } else if (!this.validateFile(fileToUpload.name)) {
      let fileNotSupported = '';
      this.translate
        .get('IMPORTCOMPONENT.FILENOTSUPPORTED')
        .subscribe((res: string) => (fileNotSupported = res));
      this.messageService.add(fileNotSupported);

      console.log('Selected file format is not supported');
      fileToUpload = null;
      this.walletJson = null;
      return false;
    } else {

      const reader = new FileReader();
      reader.readAsText(fileToUpload);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          try {
            this.importPreCheck(reader.result);
          } catch (e) {
            this.messageService.addError(e, 5);
            this.walletJson = null;
          }
          if (this.walletJson) {
            this.fileName = fileToUpload.name;
          }
        } else {
          this.walletJson = null;
          throw new Error('Not a string import');
        }
      };
    }
  }
  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'tez' || ext.toLowerCase() === 'json') {
      return true;
    } else {
      return false;
    }
  }
}
