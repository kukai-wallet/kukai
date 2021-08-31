import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { MessageService } from '../../services/message/message.service';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../services/subject/subject.service';
import { Router } from '@angular/router';
import { BeaconService } from '../../services/beacon/beacon.service';

@Component({
  selector: 'app-permission-request',
  templateUrl: './permission-request.component.html',
  styleUrls: ['../../../scss/components/modal/modal.scss']
})
export class PermissionRequestComponent implements OnInit, OnChanges {
  @Input() permissionRequest: any;
  @Input() activeAccount;
  @Output() permissionResponse = new EventEmitter();
  syncSub: Subscription;
  selectedAccount: string;
  constructor(
    public walletService: WalletService,
    private messageService: MessageService,
    private subjectService: SubjectService,
    private router: Router,
    private beaconService: BeaconService
  ) { }
  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.selectedAccount = this.activeAccount?.address ?? this.walletService.wallet.implicitAccounts[0]?.address;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.permissionRequest) {
      const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
      document.body.style.marginRight = scrollBarWidth.toString();
      document.body.style.overflow = 'hidden';
      this.messageService.removeBeaconMsg(true);
      this.selectedAccount = this.activeAccount?.address ?? this.walletService.wallet.implicitAccounts[0]?.address;
      this.syncSub = this.subjectService.beaconResponse.subscribe((response) => {
        if (response) {
          this.permissionResponse.emit('silent');
          this.reset();
        }
      });
    }
  }
  rejectPermissions() {
    this.permissionResponse.emit(null);
    this.reset();
  }
  grantPermissions() {
    const pk = this.walletService.wallet.getImplicitAccount(this.selectedAccount).pk;
    this.permissionResponse.emit(pk);
    this.reset();
    this.router.navigate([`/account/${this.selectedAccount}`]);
  }
  reset() {
    document.body.style.marginRight = '';
    document.body.style.overflow = '';
    this.permissionRequest = null;
    if (this.syncSub) {
      this.syncSub.unsubscribe();
      this.syncSub = undefined;
    }
  }
  scopeToText(scope: string) {
    if (scope === 'sign') {
      return 'Request other signing';
    } else if (scope === 'operation_request') {
      return 'Request operation signing';
    }
    return scope;
  }
  cachedIcon(permissionRequest): any {
    if (permissionRequest) {
      for (const app of this.beaconService.peers) {
        if (permissionRequest.senderId === app.senderId) {
          if (app.cachedIcon) {
            return app.cachedIcon;
          }
        }
      }
    }
    return '';
  }
}
