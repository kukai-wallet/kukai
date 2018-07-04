import { Component, OnInit } from '@angular/core';
import { ImportService } from '../../services/import.service';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { OperationService } from '../../services/operation.service';
import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { ExportService } from '../../services/export.service';

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
  walletData: any;
  pwd1: string;
  pwd2: string;
  Downloaded = false;

  showWrongFileUploadMsg: false;

  constructor(
    private importService: ImportService,
    private router: Router,
    private messageService: MessageService,
    private operationService: OperationService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private exportService: ExportService
  ) { }

  ngOnInit() {
  }

  retrieve() {
    if (this.tge) {
      this.passphrase = this.email + this.password;
    }
    const pkh = this.operationService.seed2keyPair(this.operationService.mnemonic2seed(this.mnemonic, this.passphrase)).pkh;
    if (!this.operationService.validMnemonic(this.mnemonic)) {
      this.messageService.addError('Invalid mnemonic!', 10);
    } else if (this.pkh && pkh !== this.pkh) {
      if (this.tge) {
        this.messageService.addError('Invalid email or password!', 5);
      } else {
        this.messageService.addError('Invalid passphrase!', 5);
      }
    } else {
      this.activePanel++;
    }
  }
  setPwd() {
    if (this.validPwd()) {
      const password = this.pwd1;
      this.pwd1 = '';
      this.pwd2 = '';
      this.walletData = this.walletService.createEncryptedWallet(this.mnemonic, password, this.passphrase);
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
      console.log('Selected file format is not supported');
      fileToUpload = null;
      return false;
    } else {

      const reader = new FileReader();
      reader.readAsText(fileToUpload);
      reader.onload = () => {
        const res = JSON.parse(reader.result);

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
    if (this.pwd1.length < this.MIN_PWD_LENGTH || this.pwd2.length < this.MIN_PWD_LENGTH) {
      this.messageService.addError('Password too short! At least ' + this.MIN_PWD_LENGTH + ' characters expected.');
      return false;
    } if (this.pwd1 !== this.pwd2) {
      this.messageService.addError('Passwords doesn\'t match!');
      return false;
    }
    return true;
  }
  export(): string {
    return JSON.stringify(this.walletData);
  }
  download() {
    this.exportService.downloadWallet(this.walletData);
    this.Downloaded = true;
  }
  done() {
    this.importService.importWalletData(this.walletData, false);
    this.walletData = null;
    this.router.navigate(['/overview']);
    this.messageService.addSuccess('Your new wallet is now set up and ready!');
  }
}
