import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { HdWallet, LedgerWallet } from '../../../services/wallet/wallet';
import { CoordinatorService } from '../../../services/coordinator/coordinator.service';
import { MessageService } from '../../../services/message/message.service';
import { ModalComponent } from '../modal.component';
import { Router } from '@angular/router';
import { LedgerService } from '../../../services/ledger/ledger.service';
import { pkToPkh } from '../../../libraries/utils';
@Component({
  selector: 'app-new-implicit',
  templateUrl: './new-implicit.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
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
    private router: Router,
    private ledgerService: LedgerService
  ) {
    super();
  }
  ngOnInit(): void {}
  openModal(): void {
    if (this.openPkhSpot()) {
      if (this.walletService.wallet instanceof HdWallet) {
        ModalComponent.currentModel.next({ name: this.name, data: null });
        this.clear();
        setTimeout(() => {
          const inputElem = this.pwdView.nativeElement as HTMLInputElement;
          inputElem.focus();
        }, 100);
      }
    } else {
      this.messageService.addWarning("Can't create additional accounts when an unused account already exists");
    }
  }
  closeModal(): void {
    ModalComponent.currentModel.next({ name: '', data: null });
    this.clear();
  }
  async addPkh(): Promise<void> {
    if (this.openPkhSpot()) {
      this.messageService.startSpinner('Creating new account');
      let pkh;
      if (this.walletService.wallet instanceof LedgerWallet) {
        const path = `44'/1729'/${this.walletService.wallet.index}'/0'`;
        try {
          const newAcc: string = await this.ledgerService.getPublicAddress(path);
          this.walletService.addImplicitAccount(newAcc, path, true);
          pkh = pkToPkh(newAcc);
        } catch (e) {
          this.messageService.stopSpinner();
          throw e;
        }
      } else {
        pkh = await this.walletService.incrementAccountIndex(this.password);
      }
      if (pkh) {
        this.coordinatorService.start(pkh, this.coordinatorService.defaultDelayActivity);
        this.closeModal();
        this.router.navigateByUrl(`/account/${pkh}`);
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
    if (this.walletService.wallet instanceof HdWallet || this.walletService.wallet instanceof LedgerWallet) {
      if (this.walletService.wallet instanceof LedgerWallet) {
        if (this.walletService.wallet.index === 0) {
          return true;
        } else if (!this.walletService.wallet.index) {
          return false;
        }
      }
      const balance: number = this.walletService.wallet.implicitAccounts[this.walletService.wallet.index - 1].balanceXTZ;
      const tokens = this.walletService.wallet.implicitAccounts[this.walletService.wallet.index - 1].tokens?.length;
      return (balance && balance > 0) || (tokens && tokens > 0);
    }
    return false;
  }
  clear(): void {
    this.password = '';
    this.errorMsg = '';
  }
}
