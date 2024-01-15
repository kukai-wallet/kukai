import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { MessageService } from '../../../services/message/message.service';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../../services/subject/subject.service';
import { Router } from '@angular/router';
import { BeaconService } from '../../../services/beacon/beacon.service';
import { Account } from '../../../services/wallet/wallet';

@Component({
  selector: 'app-permission-request',
  templateUrl: './permission-request.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class PermissionRequestComponent implements OnInit, OnChanges, OnDestroy {
  @Input() permissionRequest: any;
  @Input() activeAccount;
  @Output() permissionResponse = new EventEmitter();
  syncSub: Subscription;
  preSelectedAccount: Account;
  selectedAccount: Account;
  accounts: Account[];
  private subscriptions: Subscription = new Subscription();
  constructor(
    public walletService: WalletService,
    private messageService: MessageService,
    private subjectService: SubjectService,
    private router: Router,
    private beaconService: BeaconService
  ) {}
  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.preSelectedAccount = this.selectedAccount = this.activeAccount?.address?.startsWith('tz')
        ? this.activeAccount
        : this.walletService.wallet.implicitAccounts[0];
    }
    this.subscriptions.add(
      this.subjectService.walletUpdated.subscribe(async () => {
        this.accounts = this.walletService.wallet?.getImplicitAccounts();
      })
    );
    this.accounts = this.walletService.wallet?.getImplicitAccounts();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeAccount) {
      this.preSelectedAccount = this.selectedAccount = this.activeAccount?.address?.startsWith('tz')
        ? this.activeAccount
        : this.walletService.wallet.implicitAccounts[0];
    }
    if (this.permissionRequest) {
      const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
      document.body.style.marginRight = scrollBarWidth.toString();
      document.body.style.overflow = 'hidden';
      this.messageService.removeBeaconMsg(true);
      this.syncSub = this.subjectService.beaconResponse.subscribe((response) => {
        this.permissionResponse.emit(response ? 'silent' : '');
        this.reset();
      });
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  rejectPermissions(): void {
    this.permissionResponse.emit(null);
    this.reset();
  }
  grantPermissions(): void {
    const pk = this.selectedAccount?.pk;
    this.permissionResponse.emit(pk);
    this.reset();
    this.router.navigate([`/account/${this.selectedAccount.address}`]);
  }
  reset(): void {
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.permissionRequest = null;
    if (this.syncSub) {
      this.syncSub.unsubscribe();
      this.syncSub = undefined;
    }
  }
  scopeToText(scope: string): string {
    if (scope === 'sign') {
      return 'Request other signing';
    } else if (scope === 'operation_request') {
      return 'Request operation signing';
    }
    return scope;
  }
  cachedIcon(permissionRequest): string {
    if (permissionRequest?.appMetadata?.icon) {
      let icon = permissionRequest?.appMetadata?.icon;
      if (icon.startsWith('https://')) {
        icon = icon.slice(8);
      }
      return `https://static.tcinfra.net/media/medium/web/${icon}`;
    }
    return '';
  }
}
