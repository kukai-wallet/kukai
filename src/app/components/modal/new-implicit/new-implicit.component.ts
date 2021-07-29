import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { HdWallet } from '../../../services/wallet/wallet';
import { CoordinatorService } from '../../../services/coordinator/coordinator.service';
import { MessageService } from '../../../services/message/message.service';
import { ModalComponent } from '../modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-implicit',
  templateUrl: './new-implicit.component.html',
  styleUrls: ['../../../../scss/components/modal/modal.scss'],
})
export class NewImplicitComponent extends ModalComponent implements OnInit {
  @ViewChild('pwdInput') pwdView: ElementRef;
  password = '';
  errorMsg = '';
  name = 'new-implicit';
  constructor(
    public walletService: WalletService,
    private coordinatorService: CoordinatorService,
    private messageService: MessageService,
    private router: Router
  ) {
    super();
  }
  openModal() {
    if (this.openPkhSpot()) {
      ModalComponent.currentModel.next({name:this.name, data:null});
      this.clear();
      setTimeout(() => {
        const inputElem = <HTMLInputElement>this.pwdView.nativeElement;
        inputElem.focus();
      }, 100);
    } else {
      this.messageService.addWarning('Can\'t create additional accounts when an unused account already exists');
    }
  }
  closeModal() {
    ModalComponent.currentModel.next({name:'', data:null});
    this.clear();
  }
  ngOnInit(): void { }
  async addPkh() {
    if (this.openPkhSpot()) {
      this.messageService.startSpinner('Creating new account');
      const pkh = await this.walletService.incrementAccountIndex(this.password);
      if (pkh) {
        this.coordinatorService.start(pkh);
        this.closeModal();
        this.router.navigateByUrl(`/account/${pkh}`)
      } else {
        this.errorMsg = 'Wrong password!';
      }
      this.messageService.stopSpinner();
    } else { 
      console.log('blocked!');
      this.messageService.addError("Can't create additional accounts when an unused account already exists");
    }
  }
  openPkhSpot(): boolean {
    const state: string = this.walletService.wallet.implicitAccounts[
      this.walletService.wallet.implicitAccounts.length - 1
    ].state;
    const balance: number = this.walletService.wallet.implicitAccounts[
      this.walletService.wallet.implicitAccounts.length - 1
    ].balanceXTZ;
    return (
      this.walletService.wallet instanceof HdWallet &&
      (state.length > 0 || (balance !== null && balance > 0))
    );
  }
  clear() {
    this.password = '';
    this.errorMsg = '';
  }
}
