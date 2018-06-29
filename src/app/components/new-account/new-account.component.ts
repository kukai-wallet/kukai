import { Component, OnInit, ElementRef, ViewChild, TemplateRef, Input } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { KeyPair } from '../../interfaces';
import { OperationService } from '../../services/operation.service';
import { CoordinatorService } from '../../services/coordinator.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {
  @ViewChild('modal1') modal1: TemplateRef<any>;
  @Input() activePkh: string;
  // accounts = this.walletService.wallet.accounts;
  accounts = null;
  amount: string;
  fee: string;
  password: string;
  modalRef1: BsModalRef;
  modalRef2: BsModalRef;
  modalRef3: BsModalRef;
  formInvalid = '';
  pwdValid: string;
  sendResponse: any;

  isValidModal2 = {
    password: false,
    neverConfirmed: true
  };

  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private modalService: BsModalService,
    private operationService: OperationService,
    private coordinatorService: CoordinatorService,
    private exportService: ExportService
  ) { }

  ngOnInit() {
    if (this.walletService.wallet) {
      this.init();
    }
  }

  init() {
    this.accounts = this.walletService.wallet.accounts;
  }

  open1(template1: TemplateRef<any>) {
    this.clearForm();
    this.modalRef1 = this.modalService.show(template1, { class: 'modal-sm' });
  }

  open2(template: TemplateRef<any>) {
    this.formInvalid = this.invalidInput();
    if (!this.formInvalid) {
      if (!this.fee) { this.fee = '0'; }
      this.close1();
      this.modalRef2 = this.modalService.show(template, { class: 'second' });
    }
  }

  async open3(template: TemplateRef<any>) {
    const pwd = this.password;
    this.password = '';

    const keys = this.walletService.getKeys(pwd);
    if (keys) {
      this.pwdValid = '';
      this.close2();
      this.modalRef3 = this.modalService.show(template, { class: 'third' });
      this.newAccount(keys);
    } else {
      this.isValidModal2.neverConfirmed = false;
      this.pwdValid = 'Your Password is invalid';
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
              this.coordinatorService.boost(this.activePkh);
              this.coordinatorService.start(ans.payload.newPkh);
            }
          } else {
            console.log('Account creation failed ', ans.payload.msg);
          }
        },
        err => {
          console.log('Error(newAccount): ' + JSON.stringify(err.payload.msg));
        }
      );
    }, 100);
  }

  invalidInput(): string {
    if (!Number(this.amount) && this.amount && this.amount !== '0') {
      return 'invalid amount';
    } else if (!Number(this.fee) && this.fee && this.fee !== '0') {
      return 'invalid fee';
    } else {
      return '';
    }
  }

  clearForm() {
    this.amount = '';
    this.fee = '';
    this.password = '';
    this.pwdValid = '';
    this.formInvalid = '';
    this.sendResponse = null;

    this.isValidModal2.password = false;
    this.isValidModal2.neverConfirmed = true;
  }
  download() {
    this.exportService.downloadOperationData(this.sendResponse.payload.unsignedOperation, false);
}
}
