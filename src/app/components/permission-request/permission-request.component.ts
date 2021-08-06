import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';
import { MessageService } from '../../services/message/message.service';
import { Subscription } from 'rxjs';
import { SubjectService } from '../../services/subject/subject.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permission-request',
  templateUrl: './permission-request.component.html',
  styleUrls: ['../../../scss/components/modal/modal.scss']
})
export class PermissionRequestComponent implements OnInit, OnChanges {
  @Input() permissionRequest: any;
  @Output() permissionResponse = new EventEmitter();
  syncSub: Subscription;
  selectedAccount: string;
  constructor(
    public walletService: WalletService,
    private messageService: MessageService,
    private subjectService: SubjectService,
    private router: Router
  ) { }
  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.selectedAccount = this.walletService.wallet.implicitAccounts[0]?.address;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.permissionRequest) {
      const scrollBarWidth = window.innerWidth - document.body.offsetWidth;
      document.body.style.marginRight = scrollBarWidth.toString();
      document.body.style.overflow = 'hidden';
      this.messageService.removeBeaconMsg(true);
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
}
