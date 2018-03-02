import { Component, OnInit, Input, Query } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ChangeDetectorRef } from '@angular/core';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.scss']
})
export class NewWalletComponent implements OnInit {
  @Input() pwd1 = '';
  @Input() pwd2 = '';
  activePanel = 0;
  data = {
    type: '',
    seed: '',
    pkh: '',
    salt: ''
  };
  mnemonic: string;

  // Verify password boolean
  isValidPass = {
    empty: true,
    minLength: true,
    match: true,
    confirmed: false
  };

  constructor(private walletService: WalletService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    setTimeout(() => {
      this.generateSeed();
    }, 1);
  }
  generateSeed() {
    this.mnemonic = this.walletService.createNewWallet();
    this.activePanel++;
  }
  pwdView() {
    this.activePanel++;
  }
  encryptWallet() {
    if (this.validatePwd()) {
      setTimeout(() => {
        this.data = this.walletService.createEncryptedWallet(this.mnemonic, this.pwd1);
        this.mnemonic = '';
        this.pwd1 = '';
        this.pwd2 = '';
        this.activePanel++;
        this.walletService.storeWallet();
      }, 1);
    }
  }
  validatePwd(): boolean {
    if (this.pwd1.length < 6 || this.pwd2.length < 6) {
        this.isValidPass.minLength = false;
        console.log('isValidPass.length', this.isValidPass.minLength);
    } else {
      this.isValidPass.minLength = true;
    }
    if (this.pwd1 !== this.pwd2) {
        this.isValidPass.match = false;
        console.log('isValidPass.match', this.isValidPass.match);
    } else {
      this.isValidPass.match = true;
    } if (this.isValidPass.minLength && this.isValidPass.match) {
        this.isValidPass.confirmed = true;
        console.log('Success', this.isValidPass.confirmed);
        return true;
    } else {
      this.isValidPass.confirmed = false;
    }
    return false;
  }
  reset() {
    this.activePanel = 0;
  }
  export(): string {
    return JSON.stringify(this.data);
  }
}
