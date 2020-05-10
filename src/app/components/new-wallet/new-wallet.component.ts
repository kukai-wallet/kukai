import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { MessageService } from '../../services/message/message.service';
import { ExportService } from '../../services/export/export.service';
import { ImportService } from '../../services/import/import.service';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.scss']
})
export class NewWalletComponent implements OnInit {
  @Input() pwd1 = '';
  @Input() pwd2 = '';
  @Input() userMnemonic = '';
  pwdStrength = '';
  ekfDownloaded = false;
  activePanel = 1;
  data: any;
  seed: any;
  pkh: string;
  pk: string;
  MNEMONIC: string;
  mnemonicOut: string;
  constructor(
    private translate: TranslateService,
    private walletService: WalletService,
    private messageService: MessageService,
    private exportService: ExportService,
    private importService: ImportService,
    private inputValidationService: InputValidationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.generateSeed();
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
    if (this.validPwd()) {
      const pwd = this.pwd1;
      this.pwd1 = '';
      this.pwd2 = '';
      setTimeout(() => { // Prevent UI from freeze
        const ans = this.walletService.createEncryptedWallet(this.MNEMONIC, pwd, '', true);
        this.seed = ans.seed;
        this.data = ans.data;
        this.pkh = ans.pkh;
        this.pk = ans.pk;
        this.MNEMONIC = '';
        this.mnemonicOut = '';
        this.activePanel++;
      }, 100);
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
  reset() {
    this.activePanel = 1;
  }
  async done() {
    const seed = this.seed;
    this.seed = null;
    await this.importService.importWalletFromObject(this.data, seed);
    this.walletService.storeWallet();
    this.data = null;
    this.messageService.addSuccess('Your new wallet is now set up and ready to use!');
    this.router.navigate(['']);
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
