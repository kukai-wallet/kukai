import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TorusWallet } from '../../../../services/wallet/wallet';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { DropdownComponent } from '../dropdown.component';

@Component({
  selector: 'app-ui-dropdown-account',
  templateUrl: './account-dropdown.component.html',
  styleUrls: ['../../../../../scss/components/ui/account-dropdown.component.scss']
})
export class AccountDropdownComponent extends DropdownComponent implements OnInit {

  constructor(public router: Router, public lookupService: LookupService, private walletService: WalletService) { super(); }

  ngOnInit(): void {
  }

  getUsername(address: string) {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.displayName();
    } else  {
      const party = this.lookupService.resolve({ address: address || this.current?.address });
      if (party?.name) {
        return party.name;
      }
    }
    return '';
  }
  getVerifier() {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.verifier;
    } else {
      return 'domain';
    }
  }
}