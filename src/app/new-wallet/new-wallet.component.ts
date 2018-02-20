import { Component, OnInit, Input } from '@angular/core';
import { Wallet } from '../wallet';

@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.css']
})
export class NewWalletComponent implements OnInit {
  @Input() pwd = '';
  wallet: Wallet;
  step = 0;
  constructor() { }

  ngOnInit() {
  }
  generateSeed() {
    this.step++;
    this.wallet = new Wallet();
  }
  pwdView() {
    this.step++;
  }
  setPwd() {
  }
  encryptWallet() {
    this.wallet.setPassphrase(this.pwd);
    this.pwd = '';
    this.wallet.setKeyPair();
    this.step++;
  }
  reset() {
    this.step = 0;
  }
}
