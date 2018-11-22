import { Component, OnInit, Input, HostListener } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import * as rnd from 'randomatic';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { ExportService } from '../../services/export.service';
import { ImportService } from '../../services/import.service';


@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.scss']
})
export class NewWalletComponent implements OnInit {
  MIN_PWD_LENGTH = 9;
  @Input() pwd1 = '';
  @Input() pwd2 = '';
  @Input() userMnemonic = '';
  ekfDownloaded = false;
  activePanel = 0;
  data: any;
  pkh: string;
  MNEMONIC: string;
  mnemonicOut: string;
  entropyMsg: string;
  prevCoords = {
    x: 0,
    y: 0
  };
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
  entropy = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' +
    'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  @HostListener('document:touchmove', ['$event'])
  ontouchmove(e) {
    /*console.log('(' + e.touches[0].clientX + ', ' + e.touches[0].clientY + ') of (' +
    document.body.clientWidth + ', ' + document.body.clientHeight + ')');*/
    const x = Math.round(e.touches[0].clientX * 255 / document.body.clientWidth);
    const y = Math.round(e.touches[0].clientY * 255 / document.body.clientHeight);
    if (x >= 0 && x < 256 && y >= 0 && y < 256) {
      this.addEntropy(x, y);
    } else {
      console.log('Out of range');
    }
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    const x = Math.round(e.pageX * 255 / document.body.clientWidth);
    const y = Math.round(e.pageY * 255 / document.body.clientHeight);
    if (x >= 0 && x < 256 && y >= 0 && y < 256) {
      this.addEntropy(x, y);
    } else {
      console.log('Out of range');
    }
  }
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private exportService: ExportService,
    private importService: ImportService
  ) { }

  ngOnInit() {
    // rnd() only to create an offset for better visualisation.
    // Final seed = mouse movements (optional) XOR bip39.generateMnemonic() (crypto safe)
    this.entropy = rnd('?', 160, { chars: '0123456789abcdef' });
  }
  skipExtraEntropy() {
    this.activePanel++;
    this.entropy = '';
    this.generateSeed();
  }
  generateSeed() {
    this.MNEMONIC = this.walletService.createNewWallet(this.entropy);
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
    if (this.validatePwd()) {
      const pwd = this.pwd1;
      this.pwd1 = '';
      this.pwd2 = '';
      setTimeout(() => { // Prevent UI from freeze
        console.log('Wait...');
        const ans = this.walletService.createEncryptedWallet(this.MNEMONIC, pwd);
        this.data = ans.data;
        console.log('pkh ' + ans.pkh);
        this.pkh = ans.pkh;
        this.MNEMONIC = '';
        this.mnemonicOut = '';
        this.activePanel++;
        this.walletService.storeWallet();
      }, 100);
    }
  }
  validatePwd(): boolean {
    if (this.pwd1.length < this.MIN_PWD_LENGTH || this.pwd2.length < this.MIN_PWD_LENGTH) {
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
  done() {
    this.importService.importWalletData(this.data, false, this.pkh);
    this.data = null;
    this.messageService.addSuccess('Your new wallet is now set up and ready to use!');
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
  addEntropy(x: number, y: number) {
    if (this.activePanel === 0) {
      if (x !== this.prevCoords.x || y !== this.prevCoords.y) {
        this.prevCoords.x = x;
        this.prevCoords.y = y;
        let part = this.entropy.substr(this.counter * 4, 4); // part of string to replace
        const newPart = Number('0x' + part) ^ (x + y * 16 * 16);
        part = newPart.toString(16);
        for (let i = 1; i <= 3; i++) { // make sure part got 4 characters
          if (!part[i]) { part = '0' + part; }
        }
        part = this.entropy.substr(0, this.counter * 4) + part + this.entropy.substr((this.counter + 1) * 4, this.entropy.length);
        this.entropy = part;
        this.counter = (this.counter + 1) % (this.entropy.length / 4);
        if (this.counter % 8 === 0) { this.counter2++; } // Set how much to collect here
        if (this.counter2 >= 100) {
          this.activePanel++;
          let finalEntropy = '';
          for (let i = 0; i < 40; i++) {
            let hex = 0;
            for (let j = 0; j < 4; j++) {
              hex = hex ^ Number('0x' + this.entropy[i * 4 + j]);
            }
            finalEntropy = finalEntropy + hex.toString(16);
          }
          this.entropy = finalEntropy;
          this.generateSeed();
        }
      }
    }
  }
}
