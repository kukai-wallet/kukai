import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import * as QRCode from 'qrcode';
import { MessageService } from '../../services/message/message.service';



@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {
    @ViewChild('modal1') modal1: TemplateRef<any>;
    @Input() activeAddress: String;
    showReceiveFormat = {
        btnOutline: true,
        dropdownItem: false,
    };
    modalRef1: BsModalRef;
    constructor(
        private modalService: BsModalService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
    }

    getQR() {
        QRCode.toCanvas(document.getElementById('canvas'), this.activeAddress, { errorCorrectionLevel: 'H' }, function (err, canvas) {
            if (err) { throw err; }
        });
    }

    open1(template1: TemplateRef<any>) {
        if (this.activeAddress) {
            this.modalRef1 = this.modalService.show(template1, { class: 'first' });  // modal-sm / modal-lg
            setTimeout(() => {
                this.getQR();
            }, 100);
        } else {
            this.messageService.add('Select an address first by clicking on it!');
        }
    }

    close1() {
        this.modalRef1.hide();
        this.modalRef1 = null;
    }
}
