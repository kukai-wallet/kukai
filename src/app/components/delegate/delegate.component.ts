import { Component, TemplateRef, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { KeyPair } from '../../interfaces';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { OperationService } from '../../services/operation/operation.service';
import { ExportService } from '../../services/export/export.service';
import { DelegatorNamePipe } from '../../pipes/delegator-name.pipe';
import { InputValidationService } from '../../services/input-validation/input-validation.service';
import { LedgerService } from '../../services/ledger/ledger.service';
import { LedgerWallet, Account, ImplicitAccount, OriginatedAccount, TorusWallet } from '../../services/wallet/wallet';
import { MessageService } from '../../services/message/message.service';
import Big from 'big.js';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.scss']
})
export class DelegateComponent implements OnInit, OnChanges {
  modalOpen = false;
  activeView = 0;
  recommendedFee = 0.0004;
  revealFee = 0;
  pkhFee = 0.0004;
  ktFee = 0.0008;
  @ViewChild('toPkhInput') toPkhView: ElementRef;
  @Input() beaconMode = false;
  @Input() operationRequest: any;
  @Output() operationResponse = new EventEmitter();
  @Input() activeAccount: Account;
  implicitAccounts;
  toPkh: string;
  storedDelegate: string;
  fee: string;
  storedFee: string;
  password: string;
  pwdValid: string;
  formInvalid = '';
  sendResponse: any;
  ledgerError = '';
  modalRef1: BsModalRef;
  modalRef2: BsModalRef;
  modalRef3: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private walletService: WalletService,
    private operationService: OperationService,
    private coordinatorService: CoordinatorService,
    private exportService: ExportService,
    private inputValidationService: InputValidationService,
    private ledgerService: LedgerService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    if (this.walletService.wallet) {
      this.init();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.beaconMode) {
      if (this.operationRequest) {
        if (this.operationRequest.operationDetails[0].kind === 'delegation') {
          this.openModal();
          if (this.operationRequest.operationDetails[0].delegate) {
            this.toPkh = this.operationRequest.operationDetails[0].delegate;
          } else {
            console.warn('No delegate');
          }
        } else {
          console.log('Not a delegation');
        }
      } else {
        this.operationResponse.emit(null);
      }
    }
  }
  init() {
    this.implicitAccounts = this.walletService.wallet.implicitAccounts;
  }
  openModal() {
    if (this.walletService.wallet) {
      // hide body scrollbar
      const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
      document.body.style.marginRight = scrollBarWidth.toString();
      document.body.style.overflow = 'hidden';
      this.clearForm();
      this.checkReveal();
      this.modalOpen = true;
      if (window.innerWidth > 1300) {
        setTimeout(() => {
          const inputElem = <HTMLInputElement>this.toPkhView.nativeElement;
          inputElem.focus();
        }, 100);
      }
    }
  }
  closeModalAction() {
    this.operationResponse.emit(null);
    this.closeModal();
  }
  closeModal() {
    // restore body scrollbar
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.modalOpen = false;
    this.activeView = 0;
    this.clearForm();
    this.ledgerError = '';
    this.messageService.stopSpinner();
  }
  async openModal2() {
    this.formInvalid = this.invalidInput();
    if (!this.formInvalid) {
      if (!this.fee) { this.fee = this.recommendedFee.toString(); }
      this.storedFee = this.fee;
      this.storedDelegate = this.toPkh;
      this.activeView = 1;
      if (this.walletService.isLedgerWallet()) {
        this.ledgerError = '?';
      }
    }
  }
  async inject() {
    const pwd = this.password;
    this.password = '';
    this.messageService.startSpinner('Signing operation...');
    let keys;
    try {
      keys = await this.walletService.getKeys(pwd, this.activeAccount.pkh);
    } catch {
      this.messageService.stopSpinner();
    }
    if (this.walletService.isLedgerWallet()) {
      this.broadCastLedgerTransaction();
      this.sendResponse = null;
    } else {
      if (keys) {
        this.pwdValid = '';
        this.messageService.startSpinner('Sending operation...');
        this.sendDelegation(keys);
        this.closeModal();
      } else {
        this.messageService.stopSpinner();
        if (this.walletService.wallet instanceof TorusWallet) {
          this.pwdValid = `Authorization failed`;
        } else {
          this.pwdValid = 'Wrong password!';
        }
      }
    }
  }
  async ledgerSign() {
    const keys = await this.walletService.getKeys('');
    if (keys) {
      this.sendDelegation(keys);
    }
  }

  close1() {
    this.modalRef1.hide();
    this.modalRef1 = null;
  }

  close2() {
    this.modalRef2.hide();
    this.modalRef2 = null;
  }

  close3() {
    this.modalRef3.hide();
    this.modalRef3 = null;
  }

  async sendDelegation(keys: KeyPair) {
    let fee = this.storedFee;
    this.fee = '';
    if (!fee) {
      fee = '0';
    }
    this.operationService.delegate(this.activeAccount.address, this.getDelegate(), Number(fee), keys).subscribe(
      async (ans: any) => {
        this.sendResponse = ans;
        console.log(JSON.stringify(ans));
        if (ans.success === true) {
          if (ans.payload.opHash) {
            this.operationResponse.emit(ans.payload.opHash);
            const metadata = { delegate: this.getDelegate(), opHash: ans.payload.opHash };
            this.coordinatorService.boost(this.activeAccount.address, metadata);
          } else if (this.walletService.isLedgerWallet()) {
            this.requestLedgerSignature();
          }
        } else {
          this.messageService.stopSpinner();
          console.log('Delegation error id ', ans.payload.msg);
          this.messageService.addError(ans.payload.msg, 0);
          this.operationResponse.emit('broadcast_error');
          if (this.walletService.isLedgerWallet) {
            this.closeModal();
          }
        }
      },
      err => {
        console.log('Error Message ', JSON.stringify(err));
        this.ledgerError = 'Failed to create operation';
      }
    );
  }
  async requestLedgerSignature() {
    if (this.walletService.wallet instanceof LedgerWallet) {
      const op = this.sendResponse.payload.unsignedOperation;
      this.messageService.startSpinner('Waiting for Ledger signature');
      let signature;
      try {
        signature = await this.ledgerService.signOperation('03' + op, this.walletService.wallet.implicitAccounts[0].derivationPath);
      } finally {
        this.messageService.stopSpinner();
      }
      if (signature) {
        const signedOp = op + signature;
        this.sendResponse.payload.signedOperation = signedOp;
        console.log(this.sendResponse);
        this.ledgerError = '';
      } else {
        this.ledgerError = 'Failed to sign operation';
      }
    }
  }
  async broadCastLedgerTransaction() {
    this.messageService.startSpinner('Broadcasting operation');
    this.operationService.broadcast(this.sendResponse.payload.signedOperation).subscribe(
      ((ans: any) => {
        this.sendResponse = ans;
        if (ans.success && this.activeAccount.address) {
          const metadata = { delegate: this.getDelegate(), opHash: ans.payload.opHash };
          this.coordinatorService.boost(this.activeAccount.address, metadata);
        } else {
          this.messageService.addError(this.sendResponse.payload.msg, 0);
          this.operationResponse.emit('broadcast_error');
        }
        this.closeModal();
        console.log('ans: ' + JSON.stringify(ans));
      }),
      (error => {
        this.messageService.stopSpinner();
        this.messageService.addError(error, 0);
        this.operationResponse.emit('broadcast_error');
      })
    );
  }
  checkReveal() {
    console.log('check reveal ' + this.activeAccount.pkh);
    this.operationService.isRevealed(this.activeAccount.pkh)
      .subscribe((revealed: boolean) => {
        if (!revealed) {
          this.revealFee = 0.0002;
        } else {
          this.revealFee = 0;
        }
        this.checkSource();
      });
  }
  checkSource() {
    if (this.activeAccount instanceof ImplicitAccount) {
      this.recommendedFee = Number(new Big(this.revealFee).plus(this.pkhFee));
    } else if (this.activeAccount instanceof OriginatedAccount) {
      this.recommendedFee = Number(new Big(this.revealFee).plus(this.ktFee));
    }
  }
  getFee() {
    if (this.fee) {
      return this.fee;
    }
    return this.storedFee;
  }
  getDelegate() {
    if (this.toPkh) {
      return this.toPkh;
    }
    return this.storedDelegate;
  }
  clearForm() {
    this.toPkh = '';
    this.fee = '';
    this.password = '';
    this.pwdValid = '';
    this.formInvalid = '';
    this.sendResponse = '';
    this.ledgerError = '';
  }
  invalidInput(): string {
    if ((!this.inputValidationService.address(this.toPkh) &&
      this.toPkh !== '') || (
        this.toPkh.length > 1 && this.toPkh.slice(0, 2) !== 'tz') || (
        this.walletService.wallet.getImplicitAccount(this.toPkh))) {
      return 'invalid delegate address';
    } else if (!this.inputValidationService.fee(this.fee)) {
      return 'invalid fee';
    } else {
      return '';
    }
  }
  // Only Numbers with Decimals
  keyPressNumbersDecimal(event, input) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else if (charCode === 46 && this[input].length === 0) {
      this[input] = '0' + this[input];
    }
    return true;
  }
  download() {
    this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
  }
}
