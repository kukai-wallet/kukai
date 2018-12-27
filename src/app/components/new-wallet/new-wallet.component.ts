import { Component, OnInit, Input } from '@angular/core';


import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ExportService } from '../../services/export.service';
import { ImportService } from '../../services/import.service';
import { InputValidationService } from '../../services/input-validation.service';


@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.scss']
})
export class NewWalletComponent implements OnInit {
  MIN_PWD_LENGTH = 9;
  @Input() pwd1 = '';
  @Input() pwd2 = '';
  @Input() userMnemonic = '';
  pwdStrength = '';
  ekfDownloaded = false;
  activePanel = 1;
  data: any;
  pkh: string;
  MNEMONIC: string;
  mnemonicOut: string;
  // Verify password boolean
  isValidPass = {
    empty: true,
    minStrength: true,
    match: true,
    confirmed: false
  };
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private exportService: ExportService,
    private importService: ImportService,
    private inputValidationService: InputValidationService
  ) { }

  ngOnInit() {
    this.generateSeed();
  }
  skipExtraEntropy() {
  }
  generateSeed() {
    this.MNEMONIC = this.walletService.createNewWallet();
    this.mnemonicOut = this.MNEMONIC.replace(/((?:.*?\s){4}.*?)\s/g, '$1\n'); // 5 words per line
    this.activePanel++;
  }
  verifyView() {
    this.activePanel++;
    this.mnemonicOut = this.mnemonicOut.replace(/(\r\n\t|\n|\r\t| )/gm, ''); // remove white-spaces and linebreaks
  }
  pwdView() {
    this.activePanel++;
    this.userMnemonic = '';
  }
  mnemonicMatch(): boolean {
    return (this.mnemonicOut === this.userMnemonic.replace(/(\r\n\t|\n|\r\t| )/gm, ''));
  }
  encryptWallet() {
    if (this.validatePwd()) {
      const pwd = this.pwd1;
      this.pwd1 = '';
      this.pwd2 = '';
      setTimeout(() => { // Prevent UI from freeze
        console.log('Wait...');
        const ans = this.walletService.createEncryptedWallet(this.MNEMONIC, pwd);
        this.data = ans.data;
        console.log('pkh ' + ans.pkh);
        this.pkh = ans.pkh;
        this.MNEMONIC = '';
        this.mnemonicOut = '';
        this.activePanel++;
        this.walletService.storeWallet();
      }, 100);
    }
  }
  validatePwd(): boolean {
    this.isValidPass.minStrength = this.inputValidationService.password(this.pwd1);
    this.isValidPass.match = (this.pwd1 === this.pwd2);
    if (this.isValidPass.minStrength && this.isValidPass.match) {
      this.isValidPass.confirmed = true;
      console.log('Success', this.isValidPass.confirmed);
      return true;
    } else {
      this.isValidPass.confirmed = false;
      return false;
    }
  }
  calcStrength() {
    console.log('calc');
    this.pwdStrength = this.inputValidationService.passwordStrengthDisplay(this.pwd1);
  }
  reset() {
    this.activePanel = 1;
  }
  done() {
    this.importService.importWalletData(this.data, false, this.pkh);
    this.data = null;
    this.messageService.addSuccess('Your new wallet is now set up and ready to use!');
  }
  export(): string {
    return JSON.stringify(this.data);
  }
  getPkh(): string {
    return this.pkh;
  }
  download() {
    this.exportService.downloadWallet(this.data);
    this.ekfDownloaded = true;
  }
}
