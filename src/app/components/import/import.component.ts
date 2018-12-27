import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ImportService } from '../../services/import.service';
import { InputValidationService } from '../../services/input-validation.service';


@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})

export class ImportComponent implements OnInit {
  activePanel = 0;
  walletJson: string;
  @Input() encryptedWallet = '';
  @Input() pwd = '';
  @Input() pkh = '';
  @Input() pk = '';
  data = {
    seed: '',
    salt: ''
  };
  constructor(
    private translate: TranslateService,
    private walletService: WalletService,
    private router: Router,
    private messageService: MessageService,
    private importService: ImportService,
    private inputValidationService: InputValidationService
  ) { }

  ngOnInit() {
  }
  importFromTextbox() {
    this.import(this.encryptedWallet);
  }
  importFromPkh() {
    console.log('Call import service');
    if (this.inputValidationService.address(this.pkh)) {
      this.importService.importWalletFromPkh(this.pkh);
      this.router.navigate(['/overview']);
    } else {
      let invalidPKH = '';
      this.translate.get('IMPORTCOMPONENT.INVALIDPKH').subscribe(
        (res: string) => invalidPKH = res
      );
      this.messageService.addError(invalidPKH);
    }
  }
  importFromPk() {
    if (this.pkh.slice(0, 4) === 'edpk') {
      this.importService.importWalletFromPk(this.pk);
      this.router.navigate(['/overview']);
    } else {
      let invalidPrefix = '';
      this.translate.get('IMPORTCOMPONENT.INVALIDPREFIX').subscribe(
        (res: string) => invalidPrefix = res
      );
      this.messageService.addError(invalidPrefix);
    }
  }
  importPreCheck(keyFile: string) {
    if (this.importService.pwdRequired(keyFile)) {
      this.walletJson = keyFile;
    } else {
      this.import(keyFile);
    }
  }
  checkImportPwd() {
    if (this.pwd) {
      this.import(this.walletJson, this.pwd);
      this.pwd = '';
    }
    console.log(this.pwd);
  }
  import(keyFile: string, pwd: string = '') {
    this.importService.importWalletData(keyFile, true, '', pwd).then(
      (success: boolean) => {
        if (success) {
          this.router.navigate(['/overview']);
        } else {
          let importFailed = '';
          this.translate.get('IMPORTCOMPONENT.IMPORTFAILED').subscribe(
            (res: string) => importFailed = res
          );
          this.messageService.add(importFailed);
        }
      }
    );
  }
  handleFileInput(files: FileList) {
    let fileToUpload = files.item(0);
    if (!this.validateFile(fileToUpload.name)) {

      let fileNotSupported = '';
      this.translate.get('IMPORTCOMPONENT.FILENOTSUPPORTED').subscribe(
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
        if (typeof reader.result === 'string') {
        this.importPreCheck(reader.result);
        } else {
          throw new Error('Not a string import');
        }
      };
    }
  }
  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'tez') {
      return true;
    } else {
      return false;
    }
  }
}
