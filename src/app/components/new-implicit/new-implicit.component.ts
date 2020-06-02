import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { HdWallet } from '../../services/wallet/wallet';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { MessageService } from '../../services/message/message.service';

@Component({
  selector: 'app-new-implicit',
  templateUrl: './new-implicit.component.html',
  styleUrls: ['./new-implicit.component.scss'],
})
export class NewImplicitComponent implements OnInit {
  @ViewChild('modal1') modal1: TemplateRef<any>;
  password = '';
  errorMsg = '';
  wait = false;
  modalRef1: BsModalRef;
  constructor(
    public walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private modalService: BsModalService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}
  async addPkh() {
    if (this.openPkhSpot()) {
      this.wait = true;
      document.body.style.cursor = 'wait';
      setTimeout(async () => {
        const pkh = this.walletService.incrementAccountIndex(this.password);
        if (pkh) {
          this.coordinatorService.start(pkh);
          this.close1();
        } else {
          this.errorMsg = 'Wrong password!';
        }
        this.wait = false;
        document.body.style.cursor = 'default';
      }, 1000);
        //document.body.style.cursor='default';
    } else {
      console.log('blocked!');
    }
  }
  openPkhSpot(): boolean {
    const counter = this.walletService.wallet.implicitAccounts[
      this.walletService.wallet.implicitAccounts.length - 1
    ].activitiesCounter;
    const balance: number = this.walletService.wallet.implicitAccounts[
      this.walletService.wallet.implicitAccounts.length - 1
    ].balanceXTZ;
    return (
      this.walletService.wallet instanceof HdWallet &&
      ((counter && counter > 0) || (balance !== null && balance > 0))
    );
  }
  open1(template1: TemplateRef<any>) {
    if (this.openPkhSpot()) {
      this.clear();
      this.modalRef1 = this.modalService.show(template1, { class: 'first' }); // modal-sm / modal-lg
    } else {
      this.messageService.addWarning('Unused account already exists');
    }
  }

  close1() {
    this.modalRef1.hide();
    this.modalRef1 = null;
  }
  clear() {
    this.password = '';
    this.errorMsg = '';
    this.wait = false;
  }
}
