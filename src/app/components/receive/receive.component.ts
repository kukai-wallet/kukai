import { NgModel } from '@angular/forms';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, TemplateRef, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import * as QRCode from 'qrcode';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {
  @ViewChild('modal1') modal1: TemplateRef<any>;
  identity = this.walletService.wallet.identity;
  accounts = this.walletService.wallet.accounts;
  @Input() activePkh: string;
  modalRef1: BsModalRef;
  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private modalService: BsModalService
  ) { }

  ngOnInit() { if (this.identity) { this.init(); } }
  init() {
    this.activePkh = this.identity.pkh;
  }
  getQR() {
    QRCode.toCanvas(document.getElementById('canvas'), this.activePkh, { errorCorrectionLevel: 'H' }, function (err, canvas) {
      if (err) { throw err; }
    });
  }
  open1(template1: TemplateRef<any>) {
    this.modalRef1 = this.modalService.show(template1, { class: 'modal-sm' });
    setTimeout(() => {
      this.getQR();
    }, 100);
  }
  close1() {
    this.modalRef1.hide();
    this.modalRef1 = null;
  }
}
