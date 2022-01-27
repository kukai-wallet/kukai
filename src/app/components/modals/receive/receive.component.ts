import { Component, OnInit } from '@angular/core';
import * as QRCode from 'qrcode';
import { MessageService } from '../../../services/message/message.service';
import { ModalComponent } from '../modal.component';
import copy from 'copy-to-clipboard';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class ReceiveComponent extends ModalComponent implements OnInit {
  activeAddress: string;
  showReceiveFormat = {
    btnOutline: true,
    dropdownItem: false
  };

  name = 'receive';

  constructor(private messageService: MessageService, private translate: TranslateService) {
    super();
  }

  ngOnInit(): void {}
  open(data: any): void {
    this.activeAddress = data.address;
    setTimeout(() => {
      this.getQR();
    }, 100);
    super.open(data);
  }
  closeModal(): void {
    ModalComponent.currentModel.next({ name: '', data: null });
  }
  getQR(): void {
    QRCode.toCanvas(
      document.getElementById('canvas'),
      this.activeAddress,
      {
        errorCorrectionLevel: 'H',
        scaleFactor: 2,
        color: { light: '#FCFCFC' }
      },
      function (err, canvas) {
        if (err) {
          throw err;
        }
      }
    );
  }
  copy(): void {
    copy(this.activeAddress);
    const copyToClipboard = this.translate.instant('OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD');
    this.messageService.add(this.activeAddress + ' ' + copyToClipboard, 5);
  }
}
