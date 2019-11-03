import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';  // Multiple instances created ?

import { WalletService } from '../../services/wallet.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { KeyPair } from '../../interfaces';
import { OperationService } from '../../services/operation.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { ExportService } from '../../services/export.service';
import { InputValidationService } from '../../services/input-validation.service';
import { LedgerService } from '../../services/ledger.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {
  recommendedFee = 0.0021;
  @ViewChild('modal1', {static: false}) modal1: TemplateRef<any>;
  @Input() activePkh: string;
  accounts = null;
  amount: string;
  storedAmount: string;
  fee: string;
  storedFee: string;
  password: string;
  modalRef1: BsModalRef;
  modalRef2: BsModalRef;
  modalRef3: BsModalRef;
  formInvalid = '';
  pwdValid: string;
  sendResponse: any;
  originationBurn;
  ledgerInstruction = '';
  isValidModal2 = {
    password: false,
    neverConfirmed: true
  };

  constructor(
    private translate: TranslateService,
    private walletService: WalletService,
    private modalService: BsModalService,
    private operationService: OperationService,
    private coordinatorService: CoordinatorService,
    private exportService: ExportService,
    private inputValidationService: InputValidationService,
    private ledgerService: LedgerService
  ) { }

  ngOnInit() {
    if (this.walletService.wallet) {
      this.init();
    }
  }

  init() {
    this.accounts = [this.walletService.wallet.accounts[0]];
  }

  open1(template1: TemplateRef<any>) {
    if (this.walletService.wallet) {
      this.clearForm();
      this.checkReveal();
      this.modalRef1 = this.modalService.show(template1, { class: 'first' });
    }
  }

  open2(template: TemplateRef<any>) {
    this.formInvalid = this.invalidInput();
    if (!this.formInvalid) {
      if (!this.amount) { this.amount = '0'; }
      this.storedAmount = this.amount;
      if (!this.fee) { this.fee = this.recommendedFee.toString(); }
      this.storedFee = this.fee;
      this.close1();
      this.modalRef2 = this.modalService.show(template, { class: 'second' });
      if (this.walletService.isLedgerWallet()) {
        this.ledgerInstruction = 'Preparing transaction data. Please wait...';
        const keys = this.walletService.getKeys('');
        this.newAccount(keys);
      }
    }
  }

  async open3(template: TemplateRef<any>) {
    const pwd = this.password;
    this.password = '';

    const keys = this.walletService.getKeys(pwd);
    if (this.walletService.isLedgerWallet()) {
      this.broadCastLedgerTransaction();
      this.sendResponse = null;
      this.close2();
      this.modalRef3 = this.modalService.show(template, { class: 'third' });
    } else {
      if (keys) {
        this.pwdValid = '';
        this.close2();
        this.modalRef3 = this.modalService.show(template, { class: 'third' });
        this.newAccount(keys);
      } else {
        this.isValidModal2.neverConfirmed = false;
        let passwordInvalid = '';
        this.translate.get('SENDCOMPONENT.WRONGPASSWORD').subscribe(
          (res: string) => passwordInvalid = res
        );
        this.pwdValid = passwordInvalid;
        // this.pwdValid = 'Your Password is invalid';
      }
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

  async newAccount(keys: KeyPair) {
    let amount = this.amount;
    let fee = this.fee;
    this.amount = '';
    this.fee = '';

    if (!amount) { amount = '0'; }
    if (!fee) { fee = '0'; }

    setTimeout(async () => {
      console.log('pkh: ' + this.activePkh);
      this.operationService.originate(this.activePkh, Number(amount), Number(fee), keys).subscribe(
        (ans: any) => {
          this.sendResponse = ans;
          if (ans.success === true) {
            if (ans.payload.opHash && ans.payload.newPkh) {
              this.walletService.addAccount(ans.payload.newPkh);
              this.coordinatorService.boost(ans.payload.newPkh);
              this.coordinatorService.boost(this.activePkh);
            } else if (this.walletService.isLedgerWallet()) {
              this.ledgerInstruction = 'Please sign the origination with your Ledger to proceed!';
              this.requestLedgerSignature();
            }
          } else {
            console.log('Account creation failed ', JSON.stringify(ans.payload.msg));
            if (this.walletService.isLedgerWallet()) {
              this.ledgerInstruction = 'Failed with: ' + ans.payload.msg;
            }
          }
        },
        err => {
          console.log('Error(newAccount): ' + JSON.stringify(err.payload.msg));
          this.ledgerInstruction = 'Failed to create transaction';
        }
      );
    }, 100);
  }
  async requestLedgerSignature() {
    const op = this.sendResponse.payload.unsignedOperation;
    const signature = await this.ledgerService.signOperation(op, this.walletService.wallet.derivationPath);
    const signedOp = op + signature;
    this.sendResponse.payload.signedOperation = signedOp;
    this.ledgerInstruction = 'Your transaction have been signed! \n Press confirm to broadcast it to the network.';  // \n not working!
  }
  async broadCastLedgerTransaction() {
    this.operationService.broadcast(this.sendResponse.payload.signedOperation).subscribe(
      ((ans: any) => {
        this.sendResponse = ans;
        if (ans.success && ans.payload.opHash && ans.payload.newPkh) {
          this.walletService.addAccount(ans.payload.newPkh);
          this.coordinatorService.start(ans.payload.newPkh);
          this.coordinatorService.boost(ans.payload.newPkh);
          if (this.activePkh) {
            this.coordinatorService.boost(this.activePkh);
          }
        }
        console.log('ans: ' + JSON.stringify(ans));
      })
    );
  }
  checkReveal() {
    console.log('check reveal');
    this.operationService.isRevealed(this.activePkh)
      .subscribe((revealed: boolean) => {
        if (!revealed) {
          this.recommendedFee = 0.0035;
        } else {
          this.recommendedFee = 0.0021;
        }
      });
  }
  invalidInput(): string {
    if (!this.inputValidationService.amount(this.amount)) {
      let invalidAmount = '';
      this.translate.get('NEWACCOUNTCOMPONENT.INVALIDAMOUNT').subscribe(
        (res: string) => invalidAmount = res
      );
      return invalidAmount;
      // return 'Invalid amount';
    } else if (!this.inputValidationService.fee(this.fee)) {
      let invalidFee = '';
      this.translate.get('NEWACCOUNTCOMPONENT.INVALIDFEE').subscribe(
        (res: string) => invalidFee = res
      );
      return invalidFee;
      // return 'Invalid fee';
    } else {
      return '';
    }
  }
  getFee() {
    if (this.fee) {
      return this.fee;
    }
    return this.storedFee;
  }
  getAmount() {
    if (this.amount) {
      return this.amount;
    }
    return this.storedAmount;
  }
  clearForm() {
    this.amount = '';
    this.fee = '';
    this.password = '';
    this.pwdValid = '';
    this.formInvalid = '';
    this.sendResponse = null;
    this.ledgerInstruction = '';
    this.isValidModal2.password = false;
    this.isValidModal2.neverConfirmed = true;
  }
  download() {
    this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
  }
}
