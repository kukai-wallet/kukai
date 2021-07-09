import { Component, OnInit, Input } from '@angular/core';
import * as QRCode from 'qrcode';
import { MessageService } from '../../../services/message/message.service';
import { ModalComponent } from '../modal.component';

@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['../../../../scss/components/modal/modal.scss']
})
export class ReceiveComponent extends ModalComponent implements OnInit {
    @Input() activeAddress: String;
    showReceiveFormat = {
        btnOutline: true,
        dropdownItem: false,
    };

    name = 'receive';

    constructor(
        private messageService: MessageService
    ) {
      super();
     }

    ngOnInit() {
    }
    openModal() {
      ModalComponent.currentModel.next({name:this.name, data:null});
      setTimeout(() => {
        this.getQR();
      }, 100);
    }
    closeModal() {
      ModalComponent.currentModel.next({name:'', data:null});
    }
    getQR() {
        QRCode.toCanvas(document.getElementById('canvas'), this.activeAddress, { errorCorrectionLevel: 'H' , scaleFactor: 2, color: { light: '#FCFCFC'}}, function (err, canvas) {
            if (err) { throw err; }
        });
    }
}
