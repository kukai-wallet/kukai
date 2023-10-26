import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { BeaconService } from '../../../../services/beacon/beacon.service';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../../services/token/token.service';
import { MessageService } from '../../../../services/message/message.service';
import { Subscription } from 'rxjs';
import { CoordinatorService } from '../../../../services/coordinator/coordinator.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { ModalComponent } from '../../../../components/modals/modal.component';
import { HdWallet, LegacyWalletV3, TorusWallet, ExportedSocialWallet } from '../../../../services/wallet/wallet';
import { WalletConnectService } from '../../../../services/wallet-connect/wallet-connect.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['../../../../../scss/components/views/logged-in/settings/settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  implicitAccounts = [];
  wideAccounts = false;
  activeAccount = null;
  private subscriptions: Subscription = new Subscription();
  constructor(
    public beaconService: BeaconService,
    private messageService: MessageService,
    private walletService: WalletService,
    private router: Router,
    private tokenService: TokenService,
    private coordinatorService: CoordinatorService,
    private subjectService: SubjectService,
    public walletConnectService: WalletConnectService
  ) {}

  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.implicitAccounts = this.walletService.wallet.getImplicitAccounts();
      this.beaconService.syncBeaconState();
      this.onResize();
    }

    this.subscriptions.add(
      this.subjectService.activeAccount.subscribe((activeAccount) => {
        this.activeAccount = activeAccount;
      })
    );
  }
  ngOnDestroy(): void {}
  accountAvailable(pkh: string): boolean {
    const index = this.implicitAccounts.findIndex((impAcc: any) => impAcc.pkh === pkh);
    if (index === -1) {
      return false;
    }
    return true;
  }
  @HostListener('window:resize')
  onResize(): void {
    this.wideAccounts = window.innerWidth > 600;
  }
  formatAddress(address: string): string {
    if (this.wideAccounts) {
      return address;
    } else {
      return address.slice(0, 6) + '...' + address.slice(-4);
    }
  }
  rescan(): void {
    this.tokenService.resetCounters();
    this.messageService.add('Scanning for token metadata...');
    this.coordinatorService.update(this.activeAccount.address);
    this.router.navigate([`/account/${this.activeAccount.address}`]);
  }
  rescanAll(): void {
    this.tokenService.resetAllMetadata();
    this.messageService.add('Rescanning all token metadata...');
    this.coordinatorService.update(this.activeAccount.address);
    this.router.navigate([`/account/${this.activeAccount.address}`]);
  }
  revealMnemonic(): void {
    ModalComponent.currentModel.next({ name: 'export-mnemonic', data: null });
  }
  canRevealMnemonic(): boolean {
    return (
      this.walletService.wallet &&
      (this.walletService.wallet instanceof HdWallet ||
        this.walletService.wallet instanceof LegacyWalletV3 ||
        this.walletService.wallet instanceof TorusWallet ||
        this.walletService.wallet instanceof ExportedSocialWallet)
    );
  }
  changeSession(session: any): void {
    ModalComponent.currentModel.next({ name: 'session-select', data: { topic: session.topic, preSelectedAccountAddress: session.address } });
  }
  unsorted() {}
}
