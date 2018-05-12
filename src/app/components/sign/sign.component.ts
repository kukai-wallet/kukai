import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { OperationService } from '../../services/operation.service';
import { ExportService } from '../../services/export.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.scss']
})
export class SignComponent implements OnInit {
  @Input() unsigned = '';
  @Input() signed = '';
  @Input() pwd = '';
  pwdPlaceholder = '';
  constructor(
    private walletService: WalletService,
    private operationService: OperationService,
    private exportService: ExportService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    if (this.walletService.wallet && this.walletService.isFullWallet()) {
      this.init();
    }
  }
  init() {
    this.pwdPlaceholder = 'Password';
    }
  sign() {
    if (this.pwd) {
      console.log('sign');
      const pwd = this.pwd;
      this.pwd = '';
      const keys = this.walletService.getKeys(pwd);
      if (keys) {
        const signed = this.operationService.sign(this.unsigned, keys.sk);
        this.signed = signed.sbytes;
      }
    }
  }
  download() {
    this.exportService.downloadOperationData(this.signed, true);
  }
  import(files: FileList) {
  const fileToUpload = files.item(0);
    const reader = new FileReader();
    reader.readAsText(fileToUpload);
    reader.onload = () => {
      if (reader.result) {
        const data = JSON.parse(reader.result);
        if (data.signed === false && data.hex) {
          this.unsigned = data.hex;
        } else {
          this.messageService.addWarning('Not an unsigned operation!');
        }
      } else {
        this.messageService.addError('Failed to read file!');
      }
    };
  }
}
