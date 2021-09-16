import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../../services/wallet/wallet.service';
import { Account } from '../../../../services/wallet/wallet';
import { DropdownComponent } from '../dropdown.component';
import { DelegateService } from '../../../../services/delegate/delegate.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../../services/message/message.service';
import { LookupService } from '../../../../services/lookup/lookup.service';
import { SubjectService } from '../../../../services/subject/subject.service';

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
  @Input() copy;
  @Input() logout;

  constructor(
    public router: Router,
    public walletService: WalletService,
    private lookupService: LookupService,
    private messageService: MessageService,
    private translate: TranslateService,
    private delegateService: DelegateService,
    private subjectService: SubjectService
    ) { super(); }

  ngOnInit(): void {
  }
  toggleDropdown() {
    if (window.innerHeight < document.body.scrollHeight) {
      document.body.style.overflow = 'hidden';
    }
    this.isOpen = !this.isOpen;
  }
}