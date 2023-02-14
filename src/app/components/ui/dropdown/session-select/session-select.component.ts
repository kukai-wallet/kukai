import { Component, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { PermissionRequestDropdownComponent } from '../permission-request/permission-request.component';

@Component({
  selector: 'app-ui-dropdown-session-select',
  templateUrl: './session-select.component.html',
  styleUrls: ['../../../../../scss/components/ui/dropdown/account-dropdown.component.scss']
})
export class SessionSelectDropdownComponent extends PermissionRequestDropdownComponent implements OnInit, OnChanges {
  constructor(public router: Router, public lookupService: LookupService, walletService: WalletService) {
    super(router, lookupService, walletService);
  }
}
