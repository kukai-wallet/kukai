import { Component, OnInit, ViewChild, TemplateRef, Input, ElementRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BeaconService } from '../../services/beacon/beacon.service';
import QrScanner from 'qr-scanner';
import { DeeplinkService } from '../../services/deeplink/deeplink.service';
import { CONSTANTS as _CONSTANTS } from '../../../environments/environment';
import { MessageService } from '../../services/message/message.service';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit {
  readonly CONSTANTS = _CONSTANTS;
  constructor(
    private beaconService: BeaconService,
    private deeplinkService: DeeplinkService,
    private messageService: MessageService
  ) { }
  @ViewChild('videoPlayer') videoplayer: ElementRef;
  modalRef1: BsModalRef;
  modalOpen = false;
  qrScanner: QrScanner;
  manualInput = '';
  loadingCam = false;
  ngOnInit() {
  }
  openModal() {
    // hide body scrollbar
    const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
    document.body.style.marginRight = scrollBarWidth.toString();
    document.body.style.overflow = 'hidden';
    this.modalOpen = true;
    this.scan();
  }
  async scan() {
    this.loadingCam = true;
    const hasCamera = await QrScanner.hasCamera();
    if (hasCamera) {
      QrScanner.WORKER_PATH = './assets/js/qr-scanner-worker.min.js';
      this.qrScanner = new QrScanner(this.videoplayer.nativeElement, result => this.handleQrCode(result));
      await this.qrScanner.start();
      if (!this.modalOpen) {
          this.qrScanner.stop();
          this.qrScanner.destroy();
          this.qrScanner = null;
      }
    } else {
      console.warn('no camera found');
    }
    this.loadingCam = false;
  }
  handleQrCode(pairInfo: string) {
    console.log('Pairing Info', pairInfo);
    const pairingInfo = this.deeplinkService.QRtoPairingJson(pairInfo);
    if (pairingInfo) {
      this.beaconService.preNotifyPairing(pairingInfo);
      this.beaconService.addPeer(pairingInfo);
    }
    this.closeModal();
  }
  handlePaste(ev: ClipboardEvent) {
    const pairingString = ev?.clipboardData?.getData('text');
    const pairingInfo = pairingString ? this.deeplinkService.QRtoPairingJson(pairingString) : '';
    if (pairingInfo) {
      this.beaconService.preNotifyPairing(pairingInfo);
      this.beaconService.addPeer(pairingInfo);
      this.closeModal();
    } else {
      this.messageService.addError('Invalid Base58 checksum!');
    }
  }
  closeModal() {
    // restore body scrollbar
    if (this.qrScanner && !this.loadingCam) {
      this.qrScanner.stop();
      this.qrScanner.destroy();
      this.qrScanner = null;
    }
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.modalOpen = false;
    this.manualInput = '';
  }

}
