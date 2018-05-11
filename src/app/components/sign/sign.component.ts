import { Component, OnInit, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { OperationService } from '../../services/operation.service';

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
    private operationService: OperationService
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
}
