import { Component, OnInit } from '@angular/core';
import { Account } from '../../../services/wallet/wallet';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message/message.service';
import { TokenService } from '../../../services/token/token.service';

@Component({
  selector: 'app-pending',
  templateUrl: './pending.component.html',
  styleUrls: ['../../../../scss/components/account-view/cards/pending.component.scss'],
})
export class PendingComponent implements OnInit {
  account: Account;
  constructor(
    public translate: TranslateService,
    public messageService: MessageService,
    public tokenService: TokenService
  ) { }
  ngOnInit(): void {
  }
  toggleDropdown() {
    document.querySelector('.pending').classList.toggle('expanded');
    if (document.querySelector('.pending .tokens').classList.contains('expanded')) {
      document.querySelector('.pending .tokens').classList.toggle('expanded');
    } else {
      setTimeout(() => {
        document.querySelector('.pending .tokens').classList.toggle('expanded');
      }, 150);
    }
  }
}

