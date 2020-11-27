import { Component, OnInit, ViewChild, TemplateRef, Input, ElementRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BeaconService } from '../../services/beacon/beacon.service';
import QrScanner from 'qr-scanner';
import { DeeplinkService } from '../../services/deeplink/deeplink.service';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit {

  constructor(
    private beaconService: BeaconService,
    private deeplinkService: DeeplinkService
  ) { }
  @ViewChild('videoPlayer') videoplayer: ElementRef;
  modalRef1: BsModalRef;
  modalOpen = false;
  qrScanner: QrScanner;
  //videoSource: HTMLVideoElement
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
    const hasCamera = await QrScanner.hasCamera();
    if (hasCamera) {
      QrScanner.WORKER_PATH = './assets/js/qr-scanner-worker.min.js';
      this.qrScanner = new QrScanner(this.videoplayer.nativeElement, result => this.handleQrCode(result));
      await this.qrScanner.start();
    } else {
      console.warn('no camera found');
    }
  }
  handleQrCode(pairInfo: string) {
    console.log('Pairing Info', pairInfo);
    const pairingInfo = this.deeplinkService.QRtoPairingJson(pairInfo);
    if (pairingInfo) {
      this.beaconService.addPeer(pairingInfo);
    }
    this.closeModal();
  }
  closeModal() {
    // restore body scrollbar
    if (this.qrScanner) {
      this.qrScanner.stop();
    }
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.modalOpen = false;
  }

}
