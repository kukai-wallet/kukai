import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { ImportService } from '../../services/import.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  activePanel = 0;
  @Input() encryptedWallet = '';
  @Input() pkh = '';
  @Input() pk = '';
  data = {
    seed: '',
    salt: ''
  };
  constructor(private walletService: WalletService,
    private router: Router,
    private messageService: MessageService,
    private importService: ImportService) { }

  ngOnInit() {
  }
  importFromTextbox() {
    this.import(this.encryptedWallet);
  }
  importFromPkh() {
    console.log('Call import service');
    this.importService.importWalletFromPkh(this.pkh);
    this.router.navigate(['/overview']);
  }
  importFromPk() {
    this.importService.importWalletFromPk(this.pk);
    this.router.navigate(['/overview']);
  }
  import(keyFile: string) {
    if (this.importService.importWalletData(keyFile)) {
      this.router.navigate(['/overview']);
    } else {
      this.messageService.add('Failed to import wallet!');
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
          this.import(reader.result);

        };
      }
  }

  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'ekf') {
        return true;
    } else {
        return false;
    }
  }
}
