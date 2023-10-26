import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { WalletService } from '../../../../../services/wallet/wallet.service';
import { StorableWalletType } from '../../../../../interfaces';
import { MessageService } from '../../../../../services/message/message.service';
import { ExportService } from '../../../../../services/export/export.service';
import { ImportService } from '../../../../../services/import/import.service';
import { InputValidationService } from '../../../../../services/input-validation/input-validation.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['../../../../../../scss/components/views/start/login.component.scss']
})
export class NewWalletComponent implements OnInit {
  wordInput: string;
  @HostBinding('class.tacos') showTacos = false;
  @Input() pwd1 = '';
  @Input() pwd2 = '';
  @Input() userMnemonic = '';
  hideBlur = false;
  isSelectedMnemonic = false;
  pwdStrength = '';
  ekfDownloaded = false;
  activePanel = 0;
  data: any;
  seed: any;
  pkh: string;
  pk: string;
  MNEMONIC: {
    string: string;
    array: string[];
    verify: number[];
    wordsToVerify: number;
  };
  longClickTs = 0;
  constructor(
    private translate: TranslateService,
    private walletService: WalletService,
    private messageService: MessageService,
    private exportService: ExportService,
    private importService: ImportService,
    private inputValidationService: InputValidationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateSeed();
  }
  generateSeed(): void {
    const mnemonic = this.walletService.createNewWallet();
    this.MNEMONIC = {
      string: mnemonic,
      array: mnemonic.split(' '),
      verify: [],
      wordsToVerify: 5
    };
    // shuffle
    const mnemonicLength = this.MNEMONIC.array.length;
    while (this.MNEMONIC.verify.length < this.MNEMONIC.wordsToVerify) {
      const index = Math.floor(Math.random() * Math.floor(mnemonicLength));
      if (!this.MNEMONIC.verify.includes(index)) {
        this.MNEMONIC.verify.push(index);
      }
    }
    this.MNEMONIC.verify.sort((a, b) => a - b);
    this.activePanel++;
  }
  checkWord(): void {
    this.wordInput = this.wordInput.toLowerCase().trim();
    if (this.wordInput === this.MNEMONIC.array[this.MNEMONIC.verify[0]]) {
      this.MNEMONIC.verify.shift();
      this.wordInput = '';
    }
    if (!this.MNEMONIC.verify) {
      // Remove focus from input box
      document.getElementById('wordInput').blur();
    }
  }
  formatVerifyDescription(index: number): string {
    if (this.MNEMONIC.verify.length === 0) {
      return 'Seed backup has been verified!';
    }
    switch (index) {
      case 1:
      case 21:
        return `${index}st word`;
      case 2:
      case 22:
        return `${index}nd word`;
      case 3:
      case 23:
        return `${index}rd word`;
      default:
        return `${index}th word`;
    }
  }
  indexFormat(index: number): string {
    if (this.MNEMONIC.verify.length === 0) {
      return '';
    } else if (index < 0 || index >= this.MNEMONIC.array.length) {
      return '';
    } else {
      return 'Word ' + (index + 1);
    }
  }
  valueFormat(index: number): string {
    if (this.MNEMONIC.verify.length === 0) {
      return '';
    } else if (index < 0 || index > this.MNEMONIC.array.length) {
      return '';
    } else {
      return this.MNEMONIC.array[index];
    }
  }
  verifyView(): void {
    if (this.MNEMONIC.verify.length) {
      this.activePanel++;
    } else {
      throw new Error('Unexpected verify array');
    }
  }
  pwdView(): void {
    this.activePanel++;
    this.userMnemonic = '';
  }

  mnemonicMatch(): boolean {
    return this.MNEMONIC.string === this.userMnemonic;
  }
  async encryptWallet(e: Event): Promise<boolean> {
    e.preventDefault();
    if (this.validPwd()) {
      this.messageService.startSpinner('Encrypting wallet...');
      const pwd = this.pwd1;
      this.pwd1 = '';
      this.pwd2 = '';
      const ans = await this.walletService.createEncryptedWallet(this.MNEMONIC.string, pwd, '', StorableWalletType.HdWallet);
      this.seed = ans.seed;
      this.data = ans.data;
      this.pkh = ans.pkh;
      this.pk = ans.pk;
      this.MNEMONIC.string = '';
      this.MNEMONIC.array = [];
      this.MNEMONIC.verify = [];
      this.activePanel++;
      this.messageService.stopSpinner();
      if (document.body.offsetWidth >= 480) {
        this.showTacos = true;
      }
    }
    return false;
  }
  validPwd(): boolean {
    if (!this.inputValidationService.password(this.pwd1)) {
      this.messageService.addWarning(this.translate.instant('MNEMONICIMPORTCOMPONENT.PASSWORDWEAK'), 5);
      return false;
    } else if (this.pwd1 !== this.pwd2) {
      this.messageService.addWarning(this.translate.instant('MNEMONICIMPORTCOMPONENT.NOMATCHPASSWORDS'), 5);
      return false;
    } else {
      return true;
    }
  }
  calcStrength(): void {
    this.pwdStrength = this.inputValidationService.passwordStrengthDisplay(this.pwd1);
  }
  async done(): Promise<void> {
    const seed = this.seed;
    this.seed = null;
    await this.importService.importWalletFromObject(this.data, seed);
    this.walletService.storeWallet();
    this.data = null;
    this.messageService.addSuccess('Your new wallet is now set up and ready to use!');
    this.router.navigate([`/account/`]);
  }
  export(): string {
    return JSON.stringify(this.data);
  }
  getPkh(): string {
    return this.pkh;
  }
  download(): void {
    this.exportService.downloadWallet(this.data);
    this.ekfDownloaded = true;
  }
  mouseOut(e): void {
    e.stopPropagation();
    this.hideBlur = false;
    window.getSelection()?.removeAllRanges();
  }
  checkSelection(ev): void {
    ev.stopPropagation();
    if (this.isTextSelected()) {
      this.isSelectedMnemonic = true;
    }
  }
  private isTextSelected(): boolean {
    let selection: Selection;
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.getSelection) {
      selection = document.getSelection();
    } else return false;
    return !selection?.isCollapsed;
  }
}
