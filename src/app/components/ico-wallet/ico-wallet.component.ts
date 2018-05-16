import { Component, OnInit } from '@angular/core';
import { ImportService } from '../../services/import.service';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { OperationService } from '../../services/operation.service';
import { WalletService } from '../../services/wallet.service';
import { CoordinatorService } from '../../services/coordinator.service';
// https://www.npmjs.com/package/load-json-file
@Component({
  selector: 'app-ico-wallet',
  templateUrl: './ico-wallet.component.html',
  styleUrls: ['./ico-wallet.component.scss']
})
export class IcoWalletComponent implements OnInit {

  mnemonic: string;
  // email: string;
  // pwd: string;
  passphrase: string;
  secret: string;

  showWrongFileUploadMsg: false;

  constructor(
    private importService: ImportService,
    private router: Router,
    private messageService: MessageService,
    private operationService: OperationService,
    private walletService: WalletService,
    private coordinatorService: CoordinatorService
  ) { }

  ngOnInit() {
  }

  retrieve() {
    // console.log('File: ' + JSON.stringify(this.file));
    if (this.mnemonic && this.passphrase) {
      const walletData = this.walletService.createEncryptedWallet(this.mnemonic, 'password', this.passphrase);
      if (this.importService.importWalletData(walletData, false)) {
        if (this.secret) {
          if (this.walletService.wallet) {
            this.activate(this.walletService.wallet.accounts[0].pkh, this.secret);
          }
        }
        this.router.navigate(['/overview']);
      } else {
        this.messageService.add('Failed to import wallet!');
      }
    }
  }
  activate(pkh: string, secret: string, tries: number = 3) {
    setTimeout(() => {
      if (this.walletService.wallet && this.walletService.wallet.accounts[0].numberOfActivites === 0) {
        console.log('No. ' + this.walletService.wallet.accounts[0].numberOfActivites);
        this.operationService.activate(pkh, secret).subscribe(
          (ans: any) => {
            this.coordinatorService.boost(this.walletService.wallet.accounts[0].pkh);
            if (ans.opHash) {
              this.messageService.addSuccess('Wallet activated! Balance will soon be visible...');
            } else {
              this.messageService.addWarning('Couldn\'t retrive an operation hash');
            }
          },
          err => {
            if (!tries) {
            this.messageService.addError('Failed to activate wallet!');
            console.log(JSON.stringify(err));
            } else {
              this.activate(pkh, secret, tries--);
            }
          }
        );
      } else {
        this.messageService.add('Wallet already activated!');
      }
    }, 5000);
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
          } if (res.email && res.password) {
            this.passphrase = res.email + res.password;
          } if (res.secret) {
            this.secret = res.secret;
          }
        };
      }
    // }
  }

  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'json') {
        return true;
    } else {
        return false;
    }
  }
}
