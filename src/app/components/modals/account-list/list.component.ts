import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LookupService } from '../../../services/lookup/lookup.service';
import { ModalComponent } from '../modal.component';
import { MessageService } from '../../../services/message/message.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-account-list',
  templateUrl: './list.component.html',
  styleUrls: ['../../../../scss/components/modals/modal.scss']
})
export class AccountListComponent extends ModalComponent implements OnInit {
  @Input() title;
  @Input() activeAccount;
  name = 'account-list';

  constructor(public router: Router, public lookupService: LookupService, public translate: TranslateService, public messageService: MessageService) {
    super();
  }

  ngOnInit(): void {}
  closeModal(): void {
    ModalComponent.currentModel.next({ name: '', data: null });
  }
}
