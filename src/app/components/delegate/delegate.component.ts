import { Component, TemplateRef, OnInit, ViewEncapsulation, Input, ViewChild, ElementRef } from '@angular/core';

import { WalletService } from '../../services/wallet.service';
import { MessageService } from '../../services/message.service';
import { UpdateCoordinatorService } from '../../services/coordinator.service';
import { OperationService } from '../../services/operation.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { KeyPair } from '../../interfaces';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.scss']
})
export class DelegateComponent implements OnInit {
  @ViewChild('modal1') modal1: TemplateRef<any>;

  @Input() activePkh: string;

  accounts = null;
  activeAccount = null;
  toPkh: string;
  fee: string;
  password: string;
  pwdValid: string;
  formInvalid = '';
  sendResponse: string;

  modalRef1: BsModalRef;
  modalRef2: BsModalRef;
  modalRef3: BsModalRef;

  constructor(
      private modalService: BsModalService,
      private walletService: WalletService,
      private messageService: MessageService,
      private operationService: OperationService,
      private updateCoordinatorService: UpdateCoordinatorService
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
      if (this.walletService.wallet) {
          this.clearForm();
          this.modalRef1 = this.modalService.show(template1, { class: 'first' });
      }
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
          this.sendDelegation(keys);
      } else {
          this.pwdValid = 'Wrong password!';
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

      const toPkh = this.toPkh;
      let fee = this.fee;
      this.toPkh = '';
      this.fee = '';

      if (!fee) {
          fee = '0';
      }

      setTimeout(async () => {
          this.operationService.delegate(this.activePkh, toPkh, Number(fee), keys).subscribe(
              (ans: any) => {
                console.log(JSON.stringify(ans));
                if (ans.opHash) {
                  this.sendResponse = 'success';
                  this.updateCoordinatorService.boost(this.activePkh, true);
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
  clearForm() {
      this.toPkh = '';
      this.fee = '';
      this.password = '';
      this.pwdValid = '';
      this.formInvalid = '';
      this.sendResponse = '';
  }
  invalidInput(): string {

      if (!this.toPkh || this.toPkh.length !== 36) {
          return 'invalid receiver address';
      } else if (!Number(this.fee) && this.fee && this.fee !== '0') {
          return 'invalid fee';
      } else {
          return '';
      }
  }
}
