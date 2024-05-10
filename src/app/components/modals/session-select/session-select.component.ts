import { Component, OnInit, OnDestroy } from '@angular/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../../services/subject/subject.service';
import { Account } from '../../../services/wallet/wallet';
import { ModalComponent } from '../modal.component';
import { WalletConnectService } from '../../../services/wallet-connect/wallet-connect.service';

@Component({
  selector: 'app-session-select',
  templateUrl: './session-select.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class SessionSelectComponent extends ModalComponent implements OnInit, OnDestroy {
  preSelectedAccountAddress: string;
  selectedAccount: Account;
  accounts: Account[];
  topic: string;
  private subscriptions: Subscription = new Subscription();
  name = 'session-select';
  constructor(public walletService: WalletService, private subjectService: SubjectService, private walletConnectService: WalletConnectService) {
    super();
  }
  open(data: { topic: string; preSelectedAccountAddress: string }): void {
    this.topic = data.topic;
    this.preSelectedAccountAddress = data.preSelectedAccountAddress;
    this.accounts = this.walletService.wallet?.getImplicitAccounts();
    this.selectedAccount = this.accounts.find((acc) => acc.address === this.preSelectedAccountAddress);
    super.open();
  }
  ngOnInit(): void {
    this.subscriptions.add(
      this.subjectService.walletUpdated.subscribe(async () => {
        this.accounts = this.walletService.wallet?.getImplicitAccounts();
      })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  changeAddress(): void {
    this.walletConnectService.updateSession(this.topic, this.selectedAccount.pk);
    this.close();
  }
}
