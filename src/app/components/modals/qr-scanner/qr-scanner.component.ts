import { Component, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { BeaconService } from '../../../services/beacon/beacon.service';
import QrScanner from 'qr-scanner';
import { DeeplinkService } from '../../../services/deeplink/deeplink.service';
import { CONSTANTS as _CONSTANTS, environment } from '../../../../environments/environment';
import { MessageService } from '../../../services/message/message.service';
import { ModalComponent } from '../modal.component';
import { WalletConnectService } from '../../../services/wallet-connect/wallet-connect.service';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class QrScannerComponent extends ModalComponent {
  readonly CONSTANTS = _CONSTANTS;
  readonly env = environment;
  constructor(
    private beaconService: BeaconService,
    private deeplinkService: DeeplinkService,
    private messageService: MessageService,
    private walletConnectService: WalletConnectService
  ) {
    super();
  }
  @Output('scanResponse') scanResponse = new EventEmitter();
  @ViewChild('videoPlayer') videoplayer: ElementRef;
  @Input() override = false;
  qrScanner: QrScanner;
  manualInput = '';
  name = 'qr-scanner';
  loadingCam = false;
  errorMessage = '';
  openModal(): void {
    if (!this.override) {
      ModalComponent.currentModel.next({ name: this.name, data: null });
    } else {
      super.open();
    }
    this.scan();
  }
  async scan(): Promise<void> {
    this.loadingCam = true;
    const hasCamera = await QrScanner.hasCamera();
    if (hasCamera && this.videoplayer?.nativeElement) {
      this.errorMessage = '';
      try {
        this.qrScanner = new QrScanner(this.videoplayer?.nativeElement, (result: QrScanner.ScanResult) => this.handleQrCode(result), {});
        await this.qrScanner.start();
        if (!this.isOpen) {
          this.qrScanner.stop();
          this.qrScanner.destroy();
          this.qrScanner = null;
        }
      } catch (e) {
        this.errorMessage = e;
      }
    } else {
      console.warn('no camera found');
    }
    this.loadingCam = false;
  }
  handleQrCode(scanResult: QrScanner.ScanResult): void {
    const qrString = scanResult.data;
    console.log('QR Code', qrString);
    try {
      const pairingInfo = this.deeplinkService.QRtoPairingJson(qrString);
      if (pairingInfo && !this.override) {
        this.beaconService.preNotifyPairing(pairingInfo);
        this.beaconService.addPeer(pairingInfo);
      } else if (qrString && this.override) {
        this.scanResponse.emit({ pkh: qrString });
      } else if (qrString.startsWith('wc')) {
        this.walletConnectService.pair(qrString);
      }
      this.closeModal();
    } catch (e) {
      if (!this.override) {
        this.messageService.addError('Invalid Base58 checksum!');
      }
    }
  }
  async handlePaste(ev: ClipboardEvent) {
    try {
      const clipboardString = ev?.clipboardData?.getData('text');
      const pairingInfo = clipboardString ? this.deeplinkService.QRtoPairingJson(clipboardString) : '';
      if (!this.override && pairingInfo) {
        this.beaconService.preNotifyPairing(pairingInfo);
        this.beaconService.addPeer(pairingInfo);
      } else if (clipboardString && this.override) {
        this.scanResponse.emit({ pkh: clipboardString });
      } else if (clipboardString.startsWith('wc')) {
        this.walletConnectService.pair(clipboardString);
      }
      this.closeModal();
    } catch (e) {
      if (!this.override) {
        this.messageService.addError('Invalid Base58 checksum!');
      }
    }
  }
  closeModal(): void {
    // restore body scrollbar
    if (this.qrScanner && !this.loadingCam) {
      this.qrScanner.stop();
      this.qrScanner.destroy();
      this.qrScanner = null;
    }
    if (!this.override) {
      ModalComponent.currentModel.next({ name: '', data: null });
    } else {
      super.close();
    }
    this.manualInput = '';
  }
}
