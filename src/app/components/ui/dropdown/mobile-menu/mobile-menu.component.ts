import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { Account } from '../../../../services/wallet/wallet';
import { DropdownComponent } from '../dropdown.component';
import { TranslateService } from '@ngx-translate/core';
import copy from 'copy-to-clipboard';
import { MessageService } from '../../../../services/message/message.service';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { SubjectService } from '../../../../services/subject/subject.service';
import { ModalComponent } from '../../../../components/modals/modal.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-ui-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['../../../../../scss/components/ui/dropdown/mobile-menu.component.scss']
})
export class MobileMenuDropdownComponent extends DropdownComponent implements OnInit {
  @Input() activeAccount: Account;
  @Input() delegateName;
  @Input() newAccount;
  @Input() receive;

  constructor(
    public router: Router,
    public walletService: WalletService,
    public lookupService: LookupService,
    private messageService: MessageService,
    private translate: TranslateService,
    private subjectService: SubjectService
  ) {
    super();
  }

  ngOnInit(): void {}
  toggleDropdown(): void {
    if (window.innerHeight < document.body.scrollHeight) {
      document.body.style.overflow = 'hidden';
    }
    this.isOpen = !this.isOpen;
  }
  copy(): void {
    copy(this.activeAccount.address);
    const copyToClipboard = this.translate.instant('OVERVIEWCOMPONENT.COPIEDTOCLIPBOARD');
    this.messageService.add(this.activeAccount.address + ' ' + copyToClipboard, 5);
  }
  openSwap() {
    this.messageService.startSpinner();
    ModalComponent.currentModel.next({ name: 'swap-liquidity', data: null });
  }
  logout(): void {
    this.subjectService.logout.next(true);
    this.messageService.clear();
    this.walletService.clearWallet();
    this.lookupService.clear();
    this.router.navigate(['']);
  }
}
