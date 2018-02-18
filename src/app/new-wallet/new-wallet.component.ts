import { Component, OnInit } from '@angular/core';
import { Wallet } from '../wallet';

@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.css']
})
export class NewWalletComponent implements OnInit {
  wallet: Wallet;
  step = 0;
  constructor() { }

  ngOnInit() {
  }
  generateSeed() {
    this.step = 1;
    this.wallet = new Wallet();
  }
  reset() {
    this.step = 0;
  }
}
