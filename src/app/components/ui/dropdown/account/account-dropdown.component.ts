import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LookupService, LookupType } from '../../../../services/lookup/lookup.service';
import { DropdownComponent } from '../dropdown.component';

@Component({
  selector: 'app-ui-dropdown-account',
  templateUrl: './account-dropdown.component.html',
  styleUrls: ['../../../../../scss/components/ui/account-dropdown.component.scss']
})
export class AccountDropdownComponent extends DropdownComponent implements OnInit {

  LookupType = LookupType;

  constructor(public router: Router, public lookupService: LookupService) { super(); }

  ngOnInit(): void {
  }

}