import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ico-wallet',
  templateUrl: './ico-wallet.component.html',
  styleUrls: ['./ico-wallet.component.scss']
})
export class IcoWalletComponent implements OnInit {

  mnemonic: string;
  email: string;
  pwd: string;

  constructor() { }

  ngOnInit() {
  }

  retrieve() {
    console.log(this.mnemonic, this.email, this.pwd);
  }

}
