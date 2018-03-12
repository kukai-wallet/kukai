import { Component, OnInit, Input, Query, HostListener } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ChangeDetectorRef } from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import * as bip39 from 'bip39';

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
    wallet: '',
    type: '',
    version: '',
    seed: '',
    salt: '',
    pkh: ''
  };
  mnemonic: string;
  entropyMsg: string;
  // Verify password boolean
  isValidPass = {
    empty: true,
    minLength: true,
    match: true,
    confirmed: false
  };
  counter = 0;
  counter2 = 0;
  entr: number;
  entropy = 'ffffffffffffffffffffffffffffffff';
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    if (this.activePanel === 0) {
      const x = Math.round(e.pageX * 255 / document.body.clientWidth);
      const y = Math.round(e.pageY * 255 / document.body.clientHeight);
      let part = this.entropy.substr(this.counter * 4, 4);
      const newPart = Number('0x' + part) ^ (x + y * 16 * 16);
      part = newPart.toString(16);
      if (!part[1]) { part = '0' + part; }
      if (!part[2]) { part = '0' + part; }
      if (!part[3]) { part = '0' + part; }
      part = this.entropy.substr(0, this.counter * 4) + part + this.entropy.substr((this.counter + 1) * 4, this.entropy.length);
      this.entropy = part;
      this.counter = ( this.counter + 1 ) % 8; // 0-7
      if (this.counter === 0) { this.counter2++; }
      if (this.counter2 === 100) {
        this.activePanel++;
        this.generateSeed();
      }
    }
  }
  constructor(private walletService: WalletService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }
  generateSeed() {
    this.mnemonic = this.walletService.createNewWallet(this.entropy);
    this.activePanel++;
    // this.entr = bip39.mnemonicToEntropy(this.mnemonic);
    /*
    console.log('Entropy: ' + entr + ' Mnemonic: ' + bip39.entropyToMnemonic(entr));
    this.activePanel++;
    */
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
