import { Component, OnInit } from '@angular/core';
import { ImportService } from '../../services/import.service';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { OperationService } from '../../services/operation.service';
import { WalletService } from '../../services/wallet.service';
// https://www.npmjs.com/package/load-json-file
@Component({
  selector: 'app-ico-wallet',
  templateUrl: './ico-wallet.component.html',
  styleUrls: ['./ico-wallet.component.scss']
})
export class IcoWalletComponent implements OnInit {

  mnemonic: string;
  email: string;
  pwd: string;
  secret: string;

  constructor(
    private importService: ImportService,
    private router: Router,
    private messageService: MessageService,
    private operationService: OperationService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
  }

  retrieve() {
    // console.log('File: ' + JSON.stringify(this.file));
    if (this.mnemonic && this.email && this.pwd && this.secret) {
      console.log(this.mnemonic, this.email, this.pwd, this.secret);
      if (this.importService.importTgeWallet(this.mnemonic, this.email, this.pwd)) {
        setTimeout(() => {
          if (this.walletService.wallet && this.walletService.wallet.accounts[0].numberOfActivites === 0) {
            this.messageService.add('Trying to activate genesis wallet...');
            this.operationService.activate(this.walletService.wallet.accounts[0].pkh, this.secret);
          }
        }, 5000);
        this.router.navigate(['/overview']);
      } else {
        this.messageService.add('Failed to import wallet!');
      }
    }
  }
  handleFileInput(files: FileList) {
    const fileToUpload = files.item(0);
    if (fileToUpload.type === 'application/json') {
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
          this.pwd = res.password;
        } if (res.secret) {
          this.secret = res.secret;
        }
      };
    }
}
}
