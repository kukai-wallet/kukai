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

    @Input() activePkh: string;
    @Input() actionButtonString: string;  // Possible values: btnOutline / dropdownItem

    showReceiveFormat = {
        btnOutline: false,
        dropdownItem: false,
    };

    accounts = null;
    modalRef1: BsModalRef;

    constructor(
        private walletService: WalletService,
        private messageService: MessageService,
        private modalService: BsModalService
    ) { }

    ngOnInit() {
        if (this.walletService.wallet) {
            this.init();
        }
    }

    init() {
        if (this.actionButtonString) {
            this.setReceiveFormat();
        }
        this.accounts = this.walletService.wallet.accounts;
        // this.activePkh = this.accounts[0].pkh;
    }

    setReceiveFormat() {
        switch (this.actionButtonString) {
            case 'btnOutline': {
                this.showReceiveFormat.btnOutline = true;
                this.showReceiveFormat.dropdownItem = false;
                break;
            }
            case 'dropdownItem': {
                this.showReceiveFormat.btnOutline = false;
                this.showReceiveFormat.dropdownItem = true;
                break;
            }
            default: {
                console.log('actionButtonString wrongly set ', this.actionButtonString);
                break;
             }
        }
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
