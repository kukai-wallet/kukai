import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { ImportService } from '../../services/import.service';
import { MessageService } from '../../services/message.service';
import { OperationService } from '../../services/operation.service';
import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { ExportService } from '../../services/export.service';
import { InputValidationService } from '../../services/input-validation.service';

@Component({
  selector: 'app-mnemonic-import-wallet',
  templateUrl: './mnemonic-import.component.html',
  styleUrls: ['./mnemonic-import.component.scss']
})
export class MnemonicImportComponent implements OnInit {
  MIN_PWD_LENGTH = 9;
  mnemonic: string;
  email: string;
  password: string;
  passphrase: string;
  pkh: string;
  activePanel = 0;
  tge = true;
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
      let invalidMnemonic = '';
      this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDMNEMONIC').subscribe(
        (res: string) => invalidMnemonic = res
      );
      this.messageService.addWarning(invalidMnemonic, 10);
    } else if (this.tge && !this.inputValidationService.email(this.email)) {
      this.messageService.addWarning('Invalid email!', 10);
    } else if (this.tge && !this.password) {
      this.messageService.addWarning('Invalid password!', 10);
    } else if (!this.inputValidationService.passphrase(this.passphrase)) {
      this.messageService.addWarning('Invalid passphrase!', 10);
    } else if (this.pkh && !this.inputValidationService.address(this.pkh)) {
      this.messageService.addWarning('Invalid public key hash!', 10);
    } else {
      const pkh = this.operationService.seed2keyPair(this.operationService.mnemonic2seed(this.mnemonic, this.passphrase)).pkh;
      if (this.pkh && pkh !== this.pkh) {
        if (this.tge) {
          let invalidEmailPassword = '';
          this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDEMAILPASSWORD').subscribe(
            (res: string) => invalidEmailPassword = res
          );
          this.messageService.addWarning(invalidEmailPassword, 5);
        } else {
          let invalidPassphrase = '';
          this.translate.get('MNEMONICIMPORTCOMPONENT.INVALIDPASSPHRASE').subscribe(
            (res: string) => invalidPassphrase = res
          );
          this.messageService.addWarning(invalidPassphrase, 5);
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
      this.wallet = this.walletService.createEncryptedWallet(this.mnemonic, password, this.passphrase);
      this.mnemonic = '';
      this.passphrase = '';
      this.email = '';
      this.password = '';
      this.activePanel++;
    }
  }
  handleFileInput(files: FileList) {
    let fileToUpload = files.item(0);

    if (!this.validateFile(fileToUpload.name)) {
      let fileNotSupported = '';
      this.translate.get('MNEMONICIMPORTCOMPONENT.FILENOTSUPPORTED').subscribe(
        (res: string) => fileNotSupported = res
      );
      this.messageService.add(fileNotSupported);

      console.log('Selected file format is not supported');
      fileToUpload = null;
      return false;
    } else {

      const reader = new FileReader();
      reader.readAsText(fileToUpload);
      reader.onload = () => {
        const res = JSON.parse(reader.result[0]);

        if (res.mnemonic) {
          let mnemonic = res.mnemonic[0];
          for (let i = 1; i < 15; i++) {
            mnemonic = mnemonic + ' ' + res.mnemonic[i];
          }
          this.mnemonic = mnemonic;
        } if (res.email) {
          this.email = res.email;
        } if (res.password) {
          this.password = res.password;
        }
      };
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
      this.messageService.addWarning('Password is too weak!', 10);
      return false;
    } else if (this.pwd1 !== this.pwd2) {
      this.messageService.addWarning('Passwords does not match!', 10);
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
  done() {
    this.importService.importWalletData(this.wallet.data, false, this.wallet.pkh);
    this.wallet = null;
    this.router.navigate(['/overview']);
    let walletReady = '';
    this.translate.get('MNEMONICIMPORTCOMPONENT.WALLETREADY').subscribe(
      (res: string) => walletReady = res
    );
    this.messageService.addSuccess(walletReady);
  }
}
