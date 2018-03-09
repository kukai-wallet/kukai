import { NgModel } from '@angular/forms';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  activePkh: string;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService
  ) { }

  ngOnInit() { if (this.identity) { this.init(); } }
  init() {
    this.activePkh = this.identity.pkh;
    setTimeout(() => {
      this.getQR();
    }, 1);
  }
  getQR() {
    QRCode.toCanvas(document.getElementById('canvas'), this.activePkh, { errorCorrectionLevel: 'H' }, function (err, canvas) {
      if (err) { throw err; }
    });
  }
}
