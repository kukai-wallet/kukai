import { Component, TemplateRef, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
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
import { Constants } from '../../constants';
import { LedgerWallet, Account, ImplicitAccount, OriginatedAccount } from '../../services/wallet/wallet';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.scss']
})
export class DelegateComponent implements OnInit {
  modalOpen = false;
  activeView = 0;
  recommendedFee = 0.0013;
  revealFee = 0;
  pkhFee = 0.0013;
  ktFee = 0.003;
  @ViewChild('toPkhInput') toPkhView: ElementRef;
  CONSTANTS = new Constants();
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
        const keys = await this.walletService.getKeys('');
        this.sendDelegation(keys);
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
        this.pwdValid = 'Wrong password!';
      }
    }
  }
  open1(template1: TemplateRef<any>) {
    if (this.walletService.wallet) {
      this.clearForm();
      this.checkReveal();
      this.modalRef1 = this.modalService.show(template1, { class: 'first' });
    }
  }
  async open2(template: TemplateRef<any>) {
    this.formInvalid = this.invalidInput();
    if (!this.formInvalid) {
      if (!this.fee) { this.fee = this.recommendedFee.toString(); }
      this.storedFee = this.fee;
      this.storedDelegate = this.toPkh;
      if (this.walletService.isLedgerWallet()) {
        await this.ledgerSign();
      }
    }
  }
  async ledgerSign() {
    this.ledgerError = '';
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
            const metadata = { delegate: this.getDelegate(), opHash: ans.payload.opHash };
            this.coordinatorService.boost(this.activeAccount.address, metadata);
          } else if (this.walletService.isLedgerWallet()) {
            this.requestLedgerSignature();
          }
        } else {
          this.messageService.stopSpinner();
          console.log('Delegation error id ', ans.payload.msg);
          this.messageService.addError(ans.payload.msg, 0);
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
        signature = await this.ledgerService.signOperation(op, this.walletService.wallet.implicitAccounts[0].derivationPath);
      } finally {
        this.messageService.stopSpinner();
      }
      if (signature) {
        const signedOp = op + signature;
        this.sendResponse.payload.signedOperation = signedOp;
        console.log(this.sendResponse);
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
        }
        this.closeModal();
        console.log('ans: ' + JSON.stringify(ans));
      }),
      (error => {
        this.messageService.stopSpinner();
        this.messageService.addError(error, 0);
      })
    );
  }
  checkReveal() {
    console.log('check reveal ' + this.activeAccount.pkh);
    this.operationService.isRevealed(this.activeAccount.pkh)
      .subscribe((revealed: boolean) => {
        if (!revealed) {
          this.revealFee = 0.0013;
        } else {
          this.revealFee = 0;
        }
        this.checkSource();
      });
  }
  checkSource() {
    if (this.activeAccount instanceof ImplicitAccount) {
      this.recommendedFee = this.revealFee + this.pkhFee;
    } else if (this.activeAccount instanceof OriginatedAccount) {
      this.recommendedFee = this.revealFee + this.ktFee;
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
        this.activeAccount.address.slice(0, 2) !== 'tz' && this.toPkh === '') || (
        this.toPkh.length > 1 && this.toPkh.slice(0, 2) !== 'tz') || (
        this.walletService.wallet.getImplicitAccount(this.toPkh))) {
      return 'invalid delegate address';
    } else if (!this.inputValidationService.fee(this.fee)) {
      return 'invalid fee';
    } else {
      return '';
    }
  }
  download() {
    this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
  }
}
