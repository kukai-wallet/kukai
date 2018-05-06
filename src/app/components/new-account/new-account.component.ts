import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { KeyPair } from '../../interfaces';
import { OperationService } from '../../services/operation.service';
import { UpdateCoordinatorService } from '../../services/update-coordinator.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {
  @ViewChild('modal1') modal1: TemplateRef<any>;
  identity = this.walletService.wallet.accounts[0];
  // accounts = this.walletService.wallet.accounts;
  fromPkh: string;
  amount: string;
  fee: string;
  password: string;
  modalRef1: BsModalRef;
  modalRef2: BsModalRef;
  modalRef3: BsModalRef;
  formInvalid = '';
  pwdValid: string;
  sendResponse = '';

  isValidModal2 = {
    password: false,
    neverConfirmed: true
  };

  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private modalService: BsModalService,
    private operationService: OperationService,
    private updateCoordinatorService: UpdateCoordinatorService
  ) { }

  ngOnInit() {
    if (this.identity) {
      this.init();
    }
  }

  init() {
    this.fromPkh = this.identity.pkh;
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

    let keys;

    if (this.walletService.isPasswordProtected()) {
      keys = this.walletService.getKeys(pwd, null);
    } else {
      keys = this.walletService.getKeys(null, pwd);
    }
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
      this.operationService.originate(keys, this.fromPkh, Number(amount), Number(fee)).subscribe(
        (ans: any) => {
          console.log(JSON.stringify(ans));
          if (ans.opHash) {
            this.sendResponse = 'success';
            this.walletService.addAccount(ans.newPkh);
            this.updateCoordinatorService.boost(this.fromPkh);
            this.updateCoordinatorService.start(ans.newPkh);
          } else {
            this.sendResponse = 'failure';
          }
        },
        err => {console.log(JSON.stringify(err));
          this.sendResponse = 'failure';
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
    this.sendResponse = '';

    this.isValidModal2.password = false;
    this.isValidModal2.neverConfirmed = true;
  }
}
